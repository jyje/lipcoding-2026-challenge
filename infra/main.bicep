param location string = 'eastus'
param resourceGroupName string = 'lifeos-rg'
param containerAppEnvName string = 'lifeos-env'
param backendContainerAppName string = 'lifeos-backend'
param frontendContainerAppName string = 'lifeos-frontend'
param acrLoginServer string
param backendImageName string
param frontendImageName string

resource containerAppEnv 'Microsoft.App/managedEnvironments@2022-11-01-preview' = {
  name: containerAppEnvName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: ''
      }
    }
  }
}

resource backendContainerApp 'Microsoft.App/containerApps@2022-11-01-preview' = {
  name: backendContainerAppName
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3001
        transport: 'auto'
      }
      registries: [
        {
          server: acrLoginServer
          identity: 'System'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: '${acrLoginServer}/${backendImageName}:latest'
          resources: {
            cpu: '0.5'
            memory: '1Gi'
          }
          env: [
            {
              name: 'PORT'
              value: '3001'
            }
            {
              name: 'NODE_ENV'
              value: 'production'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

resource frontendContainerApp 'Microsoft.App/containerApps@2022-11-01-preview' = {
  name: frontendContainerAppName
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
      }
      registries: [
        {
          server: acrLoginServer
          identity: 'System'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: '${acrLoginServer}/${frontendImageName}:latest'
          resources: {
            cpu: '0.5'
            memory: '1Gi'
          }
          env: [
            {
              name: 'NEXT_PUBLIC_API_URL'
              value: '${backendContainerApp.properties.configuration.ingress.fqdn}'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

output backendUrl string = 'https://${backendContainerApp.properties.configuration.ingress.fqdn}'
output frontendUrl string = 'https://${frontendContainerApp.properties.configuration.ingress.fqdn}'
