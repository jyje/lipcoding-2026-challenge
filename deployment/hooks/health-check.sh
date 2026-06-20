#!/bin/bash
set -e

# Post-deployment Hook
# 배포 후에 실행되는 검증 및 정리 작업

echo "🔄 Post-deployment verification..."
echo ""

BACKEND_URL="${AZURE_BACKEND_URL:-http://localhost:3001}"
FRONTEND_URL="${AZURE_FRONTEND_URL:-http://localhost:3000}"
MAX_RETRIES=30
RETRY_DELAY=10

# 1. Backend 헬스 체크
echo "✓ Checking backend health..."
echo "  URL: $BACKEND_URL/health"

for i in $(seq 1 $MAX_RETRIES); do
  if curl -sf "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "  ✓ Backend is healthy"
    break
  fi
  
  if [ $i -lt $MAX_RETRIES ]; then
    echo "  ⏳ Attempt $i/$MAX_RETRIES failed, retrying..."
    sleep $RETRY_DELAY
  else
    echo "  ❌ Backend health check failed after $MAX_RETRIES attempts"
    exit 1
  fi
done

# 2. Frontend 접근성 확인
echo "✓ Checking frontend accessibility..."
echo "  URL: $FRONTEND_URL"

for i in $(seq 1 $MAX_RETRIES); do
  if curl -sf "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "  ✓ Frontend is accessible"
    break
  fi
  
  if [ $i -lt $MAX_RETRIES ]; then
    echo "  ⏳ Attempt $i/$MAX_RETRIES failed, retrying..."
    sleep $RETRY_DELAY
  else
    echo "  ❌ Frontend accessibility check failed after $MAX_RETRIES attempts"
    exit 1
  fi
done

# 3. API 엔드포인트 테스트
echo "✓ Testing API endpoints..."
if curl -sf -X POST "$BACKEND_URL/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"brainDump":"test"}' > /dev/null 2>&1; then
  echo "  ✓ /api/analyze endpoint responds"
else
  echo "  ⚠ /api/analyze endpoint did not respond as expected"
fi

echo ""
echo "✅ Post-deployment verification completed!"
echo "🎉 Deployment successful!"
echo ""
