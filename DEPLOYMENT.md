# Netlify Deployment Guide

## Prerequisites
- GitHub repository with your code
- Netlify account

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### 2. Deploy to Netlify

#### Option A: Connect GitHub Repository
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose GitHub
4. Select your repository: `Telegram-Airdrop-Bot/portfolio`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site"

#### Option B: Manual Upload
1. Build locally: `npm run build`
2. Go to Netlify dashboard
3. Drag and drop the `dist` folder
4. Your site will be deployed

### 3. Configure Custom Domain (Optional)
1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### 4. Environment Variables (Optional)
If you need environment variables:
1. Go to "Site settings" > "Environment variables"
2. Add your variables (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

## Important Notes
- The `netlify.toml` file handles client-side routing
- All routes redirect to `index.html` for React Router to work
- Build output goes to `dist` folder
- Node.js version is set to 18

## Troubleshooting
- If routes don't work, check the redirects in `netlify.toml`
- If build fails, ensure all dependencies are in `package.json`
- Check Netlify build logs for specific errors 