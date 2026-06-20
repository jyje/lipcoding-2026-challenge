#!/bin/bash
set -e

# Configuration
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-thriveops-rg}"
LOCATION="${AZURE_LOCATION:-eastus}"
REGISTRY_NAME="${AZURE_REGISTRY_NAME:-thriveopsregistry}"
APP_NAME="thriveops"

echo "🚀 Deploying ThriveOps to Azure..."
echo "Region: $LOCATION"
echo "Resource Group: $RESOURCE_GROUP"

# Create resource group
echo "📁 Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" || true

# Create container registry
echo "🏗️ Creating Azure Container Registry..."
az acr create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$REGISTRY_NAME" \
  --sku Basic \
  || true

# Get ACR login server
REGISTRY_URL=$(az acr show --resource-group "$RESOURCE_GROUP" --name "$REGISTRY_NAME" --query loginServer --output tsv)
echo "✅ Registry created: $REGISTRY_URL"

# Build and push backend
echo "🐳 Building and pushing backend image..."
az acr build \
  --registry "$REGISTRY_NAME" \
  --image "$APP_NAME-backend:latest" \
  --file Dockerfile .

# Build and push frontend
echo "🐳 Building and pushing frontend image..."
az acr build \
  --registry "$REGISTRY_NAME" \
  --image "$APP_NAME-frontend:latest" \
  --file Dockerfile.frontend .

echo "✅ All images built and pushed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "  Backend Image: $REGISTRY_URL/$APP_NAME-backend:latest"
echo "  Frontend Image: $REGISTRY_URL/$APP_NAME-frontend:latest"
echo ""
echo "Next steps:"
echo "  1. Configure GitHub secrets (AZURE_REGISTRY_USERNAME, AZURE_REGISTRY_PASSWORD, etc.)"
echo "  2. Push to main branch to trigger GitHub Actions deployment"
echo "  3. Or manually deploy using Azure Container Apps"
