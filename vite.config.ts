import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    // Define global constants that can be used in your app
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV),
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME),
    },
    // Configure build output based on mode
    build: {
      outDir: mode === 'production' ? 'dist' : `dist-${mode}`,
      sourcemap: mode !== 'production',
    },
    // Configure dev server
    server: {
      port: 3000,
      host: true,
    },
    // Configure preview server
    preview: {
      port: 3000,
      host: true,
    },
  };
});
