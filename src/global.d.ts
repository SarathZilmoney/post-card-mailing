// Global constants defined in vite.config.ts
declare const __APP_ENV__: string;
declare const __APP_NAME__: string;

// Extend ImportMeta interface for Vite environment variables
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_OUTSCRAPPER_API_KEY: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 