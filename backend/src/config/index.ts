import path from 'path';

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'staging' | 'production';
  database: {
    path: string;
  };
  copilot: {
    apiKey: string;
  };
  azure?: {
    storageConnectionString?: string;
    keyVaultName?: string;
  };
}

export function loadConfig(): AppConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production';
  const port = parseInt(process.env.PORT || '8010', 10);
  
  const dbPath = process.env.DB_PATH || 
    path.join(process.cwd(), 'backend/data/thriveops.db');
  
  const copilotApiKey = process.env.COPILOT_API_KEY || '';
  
  if (!copilotApiKey && nodeEnv === 'production') {
    throw new Error('COPILOT_API_KEY is required in production');
  }

  const config: AppConfig = {
    port,
    nodeEnv,
    database: {
      path: dbPath,
    },
    copilot: {
      apiKey: copilotApiKey,
    },
  };

  // Azure configuration (optional)
  if (process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.KEYVAULT_NAME) {
    config.azure = {
      storageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
      keyVaultName: process.env.KEYVAULT_NAME,
    };
  }

  return config;
}

export function validateConfig(config: AppConfig): string[] {
  const errors: string[] = [];

  if (!config.database.path) {
    errors.push('Database path is required');
  }

  if (!config.copilot.apiKey && config.nodeEnv === 'production') {
    errors.push('COPILOT_API_KEY is required in production');
  }

  if (config.nodeEnv === 'production' && config.port < 1024) {
    errors.push('Port must be >= 1024 in production');
  }

  return errors;
}
