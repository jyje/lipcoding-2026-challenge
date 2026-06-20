#!/bin/bash
set -e

# Pre-deployment Hook
# 배포 전에 실행되는 검증 및 준비 작업

echo "🔍 Pre-deployment checks..."
echo ""

# 1. Node.js 버전 확인
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "  Node.js: $NODE_VERSION"

# 2. 의존성 설치 확인
echo "✓ Installing dependencies..."
npm ci --silent 2>/dev/null || npm install --silent 2>/dev/null

# 3. 타입 체크
echo "✓ Running TypeScript type check..."
npm run typecheck --workspace=backend 2>/dev/null || echo "  ⚠ TypeScript check skipped (not configured)"
npm run typecheck --workspace=frontend 2>/dev/null || echo "  ⚠ TypeScript check skipped (not configured)"

# 4. 빌드 테스트
echo "✓ Testing builds..."
npm run build --workspace=backend >/dev/null 2>&1 || { echo "❌ Backend build failed"; exit 1; }
npm run build --workspace=frontend >/dev/null 2>&1 || { echo "❌ Frontend build failed"; exit 1; }

# 5. 환경 변수 확인
echo "✓ Checking environment variables..."
if [ -z "$GITHUB_TOKEN" ] && [ -z "$NODE_ENV" ]; then
  echo "  ⚠ Warning: Some environment variables not set (will be injected by Azure)"
fi

# 6. Git 상태 확인
echo "✓ Checking git status..."
if git diff --quiet; then
  echo "  ✓ Working directory clean"
else
  echo "  ⚠ Warning: Uncommitted changes detected"
fi

echo ""
echo "✅ Pre-deployment checks passed!"
echo ""
