import dotenv from 'dotenv';
import path from 'path';

// Ensure .env is loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface AppConfig {
  ui: {
    baseUrl: string;
    standardUsername: string;
    standardPassword: string;
    lockedUsername: string;
    headless: boolean;
  };
  api: {
    baseUrl: string;
  };
  ai: {
    provider: 'mock' | 'openai' | 'anthropic';
    apiKey?: string;
  };
}

export const env: AppConfig = {
  ui: {
    baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
    standardUsername: process.env.SAUCE_USERNAME || 'standard_user',
    standardPassword: process.env.SAUCE_PASSWORD || 'secret_sauce',
    lockedUsername: process.env.SAUCE_LOCKED_USERNAME || 'locked_out_user',
    headless: process.env.HEADLESS !== 'false',
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
  },
  ai: {
    provider: (process.env.AI_PROVIDER as 'mock' | 'openai' | 'anthropic') || 'mock',
    apiKey: process.env.AI_API_KEY,
  },
};
