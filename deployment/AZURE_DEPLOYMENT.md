# Azure Deployment Configuration & CLI Agent Integration

## 📋 Current Setup Status

### ✅ Configured Files
- **Root Configuration**: `package.json` (monorepo with workspaces)
- **Backend**: Fastify API on Node.js (TypeScript)
- **Frontend**: Next.js (TypeScript)
- **Container Images**: `Dockerfile` (backend) + `Dockerfile.frontend`
- **Infrastructure**: `infra/main.bicep` (Azure Container Apps)
- **CI/CD Pipeline**: `.github/workflows/deploy.yml` (GitHub Actions)
- **Deployment Script**: `scripts/deploy.sh` (Azure CLI)

### 🏗️ Architecture
```
GitHub Repo (main branch)
  ↓
GitHub Actions (deploy.yml)
  ↓
Azure Container Registry (ACR)
  ↓
Azure Container Apps (Backend + Frontend)
  ↓
Public URLs (https://*.azurecontainerapps.io)
```

## 🤖 Copilot CLI Agent Integration

### Available Agents for Deployment

| Agent | Purpose | Support | Notes |
|-------|---------|---------|-------|
| **azure-deploy** | Deploy to Azure | ✅ YES | Recommended for automated setup |
| **general-purpose** | Complex multi-step tasks | ✅ YES | Can manage entire deployment flow |
| **task** | Execute CLI commands | ✅ YES | For running build/deploy scripts |
| **explore** | Code/config research | ✅ YES | For verifying configurations |

### CLI Commands Available

```bash
# Using Copilot CLI to deploy
/delegate              # Send to GitHub for PR-based deployment
/tasks                 # View/manage background tasks
/autopilot             # Enable autopilot mode for autonomous execution
```

## 📝 Pre-Deployment Checklist

### Local Validation
- [ ] Node.js 18+ installed: `node --version`
- [ ] Azure CLI installed: `az --version`
- [ ] Docker installed (for local testing): `docker --version`
- [ ] Logged into Azure: `az login`

### GitHub Secrets Configuration
```
Required secrets for GitHub Actions:
- AZURE_SUBSCRIPTION_ID
- AZURE_RESOURCE_GROUP
- AZURE_REGISTRY_NAME
- AZURE_REGISTRY_USERNAME
- AZURE_REGISTRY_PASSWORD
- AZURE_BACKEND_URL (deployed backend URL)
- AZURE_CONTAINER_APP_ENV
- AZURE_LOCATION (e.g., eastus)
```

### File Checklist
- [x] `package.json` - Monorepo setup
- [x] `backend/package.json` - Fastify dependencies
- [x] `frontend/package.json` - Next.js dependencies
- [x] `Dockerfile` - Backend container
- [x] `Dockerfile.frontend` - Frontend container
- [x] `.github/workflows/deploy.yml` - CI/CD pipeline
- [x] `infra/main.bicep` - IaC for Azure
- [x] `scripts/deploy.sh` - Manual deployment script
- [x] `DEPLOYMENT.md` - Deployment guide

## 🚀 Deployment Methods

### Method 1: GitHub Actions (Recommended)
```bash
# Push to main to trigger automatic deployment
git add .
git commit -m "Configure Azure deployment"
git push origin main
```

**Advantages**:
- Automated on every push to main
- Integrated with GitHub UI
- Health checks built-in
- No local secrets exposure

### Method 2: Copilot CLI + Azure Deploy Agent
```bash
# Use Copilot CLI for interactive deployment
# Agent will handle: resource group, registry, container apps setup
copilot /delegate
# Or use /autopilot for autonomous deployment
```

**Advantages**:
- Interactive guidance
- Automatic resource creation
- Real-time feedback
- Less manual configuration

### Method 3: Manual Azure CLI
```bash
# Run deployment script
./scripts/deploy.sh

# Manual Container Apps deployment
az containerapp create --name thriveops-backend ...
az containerapp create --name thriveops-frontend ...
```

**Advantages**:
- Full control
- Useful for debugging
- Can run locally

## 🔧 Configuration Files Overview

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)
- **Triggers**: Push to main or manual dispatch
- **Steps**: 
  1. Login to Azure Registry
  2. Build & push backend image
  3. Build & push frontend image
  4. Deploy to Container Apps
  5. Health check validation

### Azure Bicep Template (`infra/main.bicep`)
- **Resources**: Container App Environment, Backend/Frontend Container Apps
- **Networking**: Ingress configured for external access
- **Auto-scaling**: 1-3 replicas based on load

### Deployment Script (`scripts/deploy.sh`)
- **Purpose**: Local or CI/CD execution
- **Creates**: Resource group, Container Registry, Builds images
- **Output**: Registry URL and image references

## 📊 Deployment Verification

After deployment, verify with:

```bash
# Check backend health
curl https://thriveops-backend.<region>.azurecontainerapps.io/health

# Check frontend accessibility
curl https://thriveops-frontend.<region>.azurecontainerapps.io

# View logs
az containerapp logs show --name thriveops-backend --resource-group thriveops-rg
```

## ⚠️ Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails | Node.js version mismatch | Ensure Node 18+ in Dockerfile |
| Registry auth fails | Missing secrets | Configure GitHub secrets |
| Container won't start | Missing env vars | Check DEPLOYMENT.md env section |
| Health check timeout | Backend not responding | Check app logs: `az containerapp logs show` |

## 🎯 Next Steps

**Option A - Automated (Recommended)**:
1. Configure GitHub secrets in repository settings
2. Push to main branch
3. Monitor in Actions tab

**Option B - Interactive with CLI Agent**:
1. Run: `copilot /delegate`
2. Follow agent guidance for Azure setup
3. Agent creates PR with deployment config

**Option C - Manual**:
1. Run: `./scripts/deploy.sh`
2. Manually configure Container Apps
3. Test URLs and health endpoints

## 📚 References

- [Azure Container Apps Docs](https://learn.microsoft.com/azure/container-apps/)
- [GitHub Actions Azure Integration](https://github.com/Azure/actions)
- [Copilot CLI Commands](https://docs.github.com/copilot/using-github-copilot/copilot-cli)
