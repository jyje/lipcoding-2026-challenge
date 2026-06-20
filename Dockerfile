FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm ci --workspace=backend

COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src

RUN npm run build --workspace=backend

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["npm", "start", "--workspace=backend"]
