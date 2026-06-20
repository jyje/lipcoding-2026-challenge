# Deployment

Azure 배포 관련 모든 문서와 설정을 포함하는 디렉토리입니다.

## 📁 Contents

- **DEPLOYMENT.md** - 배포 단계별 가이드 (GitHub Actions, Azure CLI, Copilot CLI)
- **AZURE_DEPLOYMENT.md** - Azure 설정 상세 문서 (리소스, 환경변수, 트러블슈팅)
- **DEPLOYMENT_STATUS.md** - 배포 준비 상태 요약
- **DEPLOYMENT_REPORT.md** - 종합 배포 보고서 (전체 체크리스트)

## 🚀 Quick Start

### GitHub Actions (권장)
```bash
# 1. GitHub Secrets 설정
# Settings > Secrets and variables > Actions
# AZURE_SUBSCRIPTION_ID, AZURE_RESOURCE_GROUP, AZURE_REGISTRY_NAME, ...

# 2. 푸시
git push origin main

# 3. GitHub Actions 탭에서 모니터링
```

### Copilot CLI Agent
```bash
copilot /delegate
# 또는
copilot /autopilot --task "deploy to azure"
```

### Manual Azure CLI
```bash
./scripts/deploy.sh
```

## 📋 배포 구성

| 파일/디렉토리 | 역할 |
|------------|------|
| `scripts/deploy.sh` | Azure CLI 배포 스크립트 |
| `infra/main.bicep` | Azure Container Apps IaC |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD |

## 🔍 상세 정보

각 문서를 순서대로 읽기:

1. **처음 배포하는 경우**: DEPLOYMENT.md
2. **Azure 설정 확인**: AZURE_DEPLOYMENT.md
3. **상태 체크**: DEPLOYMENT_STATUS.md
4. **전체 계획**: DEPLOYMENT_REPORT.md

## 📞 References

- [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/)
- [GitHub Actions Azure](https://github.com/Azure/actions)
- [Copilot CLI](https://docs.github.com/copilot/using-github-copilot/copilot-cli)
