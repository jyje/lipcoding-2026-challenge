# LifeOS Insight Coach - Deployment Guide

## Prerequisites

- Azure CLI (`az` command)
- Azure subscription
- Docker (for local testing)
- Node.js 18+

## Local Development

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:fe   # Frontend on http://localhost:3000
npm run dev:be   # Backend on http://localhost:3001
```

## Azure Deployment

### Option 1: Automated Deployment with GitHub Actions

1. **Set up GitHub Secrets** in your repository settings:
   ```
   AZURE_SUBSCRIPTION_ID=<your-subscription-id>
   AZURE_RESOURCE_GROUP=lifeos-rg
   AZURE_REGISTRY_NAME=lifeosregistry
   AZURE_REGISTRY_USERNAME=<registry-username>
   AZURE_REGISTRY_PASSWORD=<registry-password>
   AZURE_BACKEND_URL=<deployment-backend-url>
   AZURE_CONTAINER_APP_ENV=lifeos-env
   ```

2. **Push to main branch** to trigger the workflow:
   ```bash
   git push origin main
   ```

3. **Monitor deployment** in Actions tab

### Option 2: Manual Deployment

1. **Login to Azure**:
   ```bash
   az login
   ```

2. **Run deployment script**:
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

3. **Deploy Container Apps**:
   ```bash
   az containerapp create \
     --name lifeos-backend \
     --resource-group lifeos-rg \
     --image <registry-url>/lifeos-backend:latest \
     --environment lifeos-env \
     --target-port 3001 \
     --ingress external
   ```

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=production
GITHUB_TOKEN=<copilot-extensions-token>
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://<backend-url>
```

## Health Checks

```bash
# Check backend health
curl https://<backend-url>/health

# Check frontend
curl https://<frontend-url>
```

## Troubleshooting

- **Build fails**: Check Node.js version (should be 18+)
- **Registry auth fails**: Verify ACR credentials in secrets
- **Container won't start**: Check logs: `az containerapp logs show --name lifeos-backend --resource-group lifeos-rg`

## Cleanup

```bash
az group delete --name lifeos-rg --yes
```
