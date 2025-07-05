# Environment Configuration Guide

This project uses different environment configurations for staging and production deployments.

## Setup Instructions

### 1. Create Environment Files

Copy the template files to create your actual environment files:

```bash
# Create staging environment file
cp env.staging.template .env.staging

# Create production environment file  
cp env.production.template .env.production
```

### 2. Configure Environment Variables

Edit the `.env.staging` and `.env.production` files with your actual values:

- **VITE_API_BASE_URL**: Your API base URL
- **VITE_OUTSCRAPPER_API_KEY**: Your Outscrapper API key
- **VITE_APP_ENV**: Environment name (staging/production)
- **VITE_APP_NAME**: Application name
- **VITE_DEBUG**: Enable/disable debug mode

## Available Scripts

### Development

```bash
# Run development server with staging environment (default)
npm run dev

# Run development server with staging environment (explicit)
npm run dev:staging

# Run development server with production environment
npm run dev:production
```

### Building

```bash
# Build for production (default)
npm run build

# Build for staging
npm run build:staging

# Build for production (explicit)
npm run build:production
```

### Preview

```bash
# Preview production build
npm run preview

# Preview staging build
npm run preview:staging

# Preview production build (explicit)
npm run preview:production
```

## Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

### Usage in Code

```typescript
// Access environment variables
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const apiKey = import.meta.env.VITE_OUTSCRAPPER_API_KEY;
const appEnv = import.meta.env.VITE_APP_ENV;
```

### Global Constants

The following constants are available globally in your app:

```typescript
// These are defined in vite.config.ts
declare const __APP_ENV__: string;
declare const __APP_NAME__: string;
```

## File Structure

```
├── env.staging.template      # Staging environment template
├── env.production.template   # Production environment template
├── .env.staging             # Staging environment (not in git)
├── .env.production          # Production environment (not in git)
├── vite.config.ts           # Vite configuration with environment handling
└── package.json             # Scripts for different environments
```

## Security Notes

- Environment files (`.env.*`) are ignored by git for security
- Never commit actual API keys or sensitive data
- Use template files to share configuration structure
- Keep production credentials secure and separate from development

## Troubleshooting

1. **Environment not loading**: Make sure you have the correct `.env.*` file for your mode
2. **Variables not accessible**: Ensure variables are prefixed with `VITE_`
3. **Build fails**: Check that all required environment variables are set

## Example .env.staging

```bash
# Staging Environment Variables
VITE_API_BASE_URL=http://localhost:3001/api
VITE_OUTSCRAPPER_API_KEY=demo-key
VITE_APP_ENV=staging
VITE_APP_NAME=Postcard Campaign Manager (Staging)
VITE_DEBUG=true
```

## Example .env.production

```bash
# Production Environment Variables
VITE_API_BASE_URL=https://your-production-api.com/api
VITE_OUTSCRAPPER_API_KEY=your-production-outscrapper-key
VITE_APP_ENV=production
VITE_APP_NAME=Postcard Campaign Manager
VITE_DEBUG=false
``` 