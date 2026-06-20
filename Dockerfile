# Backend (Node.js + Fastify) — TypeScript backend with Copilot SDK integration
# Build context is the repository root (see .github/workflows/deploy.yml).

# --- Stage 1: builder (compile TypeScript) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY backend/package.json ./
COPY package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npm run build

# --- Stage 2: runtime (slim production image) ---
FROM node:20-alpine AS runtime

ENV NODE_ENV=production \
    PORT=8010

WORKDIR /app

RUN addgroup -S nodejs && adduser -S appuser -G nodejs

# Copy built application and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Run as non-root user
USER appuser

EXPOSE 8010

# Set port for runtime and start
CMD ["sh", "-c", "PORT=${PORT} node dist/index.js"]

