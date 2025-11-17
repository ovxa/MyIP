# Deploy MyIP with Backend Support

This guide explains how to deploy MyIP with full backend functionality, since GitHub Pages only supports static files.

## 🎯 Architecture Options

### Option 1: Split Deployment (Recommended)

- **Frontend**: GitHub Pages (free, fast CDN)
- **Backend API**: Vercel/Netlify/Cloudflare Workers (free tier available)

**Pros**:
- Utilize GitHub Pages' excellent CDN
- Serverless backend scales automatically
- Free hosting for both components
- Easy to manage with separate deployments

### Option 2: Full-Stack Deployment

Deploy everything to a single platform that supports both frontend and backend:

- Vercel
- Netlify
- Railway
- Render
- Fly.io

**Pros**:
- Simpler configuration
- Single deployment
- No CORS issues

## 📋 Detailed Setup Guides

### Option 1A: Frontend (GitHub Pages) + Backend (Vercel)

#### Step 1: Deploy Backend to Vercel

1. **Install Vercel CLI** (optional, can also use web interface):
   ```bash
   npm install -g vercel
   ```

2. **Deploy the API**:
   ```bash
   # Login to Vercel
   vercel login

   # Deploy (from project root)
   vercel

   # Follow the prompts:
   # - Set up and deploy? Y
   # - Which scope? (your account)
   # - Link to existing project? N
   # - Project name: myip-api (or your choice)
   # - Directory: ./ (current directory)
   # - Override settings? N
   ```

3. **Configure Environment Variables in Vercel**:

   Via CLI:
   ```bash
   vercel env add IPGEOLOCATION_API_KEY production
   # Enter your API key when prompted

   # Add other required keys:
   vercel env add IPINFO_API_TOKEN production
   vercel env add IP2LOCATION_API_KEY production
   vercel env add IPAPIIS_API_KEY production
   vercel env add ALLOWED_DOMAINS production
   # Enter your GitHub Pages domain (e.g., username.github.io)
   ```

   Or via Vercel Dashboard:
   - Go to your project in Vercel Dashboard
   - Settings → Environment Variables
   - Add each variable for the "Production" environment

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

   Note your API URL, e.g., `https://myip-api.vercel.app`

#### Step 2: Configure Frontend to Use Vercel API

Create a production environment file:

**`.env.production`** (create this file):
```bash
# Vercel API endpoint
VITE_API_BASE_URL=https://your-project.vercel.app

# GitHub Pages base URL
# For user/org page: /
# For project page: /repo-name/
VITE_BASE_URL=/
```

**Update API calls in frontend** (if needed):

Most modern setups use a proxy during development, but in production, you'll need to configure the API base URL. If your code uses relative URLs like `/api/ipinfo`, you'll need to update them or use a base URL configuration.

Add to `frontend/utils/api-client.js` (create if doesn't exist):
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  return response;
}
```

#### Step 3: Deploy Frontend to GitHub Pages

The existing GitHub Actions workflow will deploy the frontend automatically. Make sure the environment variables are set in GitHub repository settings if needed.

### Option 1B: Frontend (GitHub Pages) + Backend (Netlify Functions)

#### Step 1: Create Netlify Functions

1. **Create `netlify.toml`**:
   ```toml
   [build]
     functions = "netlify/functions"

   [build.environment]
     NODE_VERSION = "20"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

2. **Move API handlers to Netlify Functions**:
   ```bash
   mkdir -p netlify/functions
   cp -r api/* netlify/functions/
   ```

3. **Deploy to Netlify**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login and deploy
   netlify login
   netlify init
   netlify deploy --prod
   ```

4. **Configure Environment Variables**:
   - Go to Netlify Dashboard
   - Site settings → Environment variables
   - Add all required API keys

### Option 2: Full Deployment to Vercel

This is the simplest option - deploy everything to Vercel.

#### Setup

1. **Update `vercel.json`** (already created):
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       },
       {
         "src": "api/**/*.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/api/$1"
       },
       {
         "src": "/(.*)",
         "dest": "/dist/$1"
       }
     ]
   }
   ```

2. **Add build script to `package.json`**:
   ```json
   {
     "scripts": {
       "vercel-build": "npm run build"
     }
   }
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables** in Vercel Dashboard

### Option 3: Full Deployment to Railway

Railway is excellent for Docker-based deployments.

#### Setup

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Initialize and Deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Configure Environment Variables**:
   ```bash
   railway variables set IPGEOLOCATION_API_KEY="your_key"
   railway variables set IPINFO_API_TOKEN="your_token"
   # Add all other required variables
   ```

4. **Access your deployment**:
   Railway will provide a URL like `https://your-app.railway.app`

### Option 4: Full Deployment to Render

Render offers free hosting for web services.

#### Setup

1. **Create `render.yaml`**:
   ```yaml
   services:
     - type: web
       name: myip
       env: node
       buildCommand: npm install && npm run build
       startCommand: npm start
       envVars:
         - key: NODE_VERSION
           value: 20
         - key: IPGEOLOCATION_API_KEY
           sync: false
         - key: IPINFO_API_TOKEN
           sync: false
   ```

2. **Connect Repository** to Render via their dashboard

3. **Configure Environment Variables** in Render Dashboard

4. **Deploy** - Automatic on git push

## 🔐 Environment Variables Reference

Required environment variables for backend:

```bash
# Required for IP geolocation
IPGEOLOCATION_API_KEY="your_key_here"

# Optional - other IP data providers
IPINFO_API_TOKEN="your_token"
IP2LOCATION_API_KEY="your_key"
IPAPIIS_API_KEY="your_key"

# Security
ALLOWED_DOMAINS="yourdomain.com,anotherdomain.com"
SECURITY_RATE_LIMIT="100"
SECURITY_DELAY_AFTER="50"

# Optional features
CLOUDFLARE_API="your_cloudflare_token"
GOOGLE_MAP_API_KEY="your_google_key"
```

## 🧪 Testing Your Deployment

1. **Test API endpoint**:
   ```bash
   curl https://your-api-domain.com/api/ipgeolocation?ip=8.8.8.8
   ```

2. **Test frontend**:
   - Open your deployed frontend URL
   - Check browser console for errors
   - Verify IP information loads correctly

## 🔍 Troubleshooting

### CORS Errors

If you see CORS errors when frontend calls backend:

**Add CORS headers to backend** (`backend-server.js`):
```javascript
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_DOMAINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

**Update ALLOWED_DOMAINS** environment variable to include your frontend domain.

### API Key Not Working

1. Verify the environment variable is set correctly
2. Check if the key has the correct permissions
3. Verify you haven't exceeded the API quota
4. Check API provider's status page

### 404 Errors on API Routes

1. Verify the API routes are correctly configured in your platform
2. Check that the `api/` directory is being deployed
3. Review platform-specific routing configuration

## 📊 Cost Comparison

| Platform | Free Tier | Paid Tier Starts At |
|----------|-----------|---------------------|
| **GitHub Pages** | Unlimited static hosting | N/A (always free) |
| **Vercel** | 100GB bandwidth, 100 serverless functions | $20/month |
| **Netlify** | 100GB bandwidth, 125k function requests | $19/month |
| **Railway** | $5 free credits/month | $5/month (pay as you go) |
| **Render** | 750 hours/month free tier | $7/month |
| **Cloudflare Workers** | 100k requests/day | $5/month |

## 🎯 Recommended Setup

For most users, we recommend:

1. **Frontend**: GitHub Pages (free, fast)
2. **Backend**: Vercel (easy setup, generous free tier)
3. **Database** (if needed): Vercel Postgres or Supabase (free tier)

This combination provides:
- ✅ Free hosting for both components
- ✅ Excellent performance globally
- ✅ Simple deployment workflow
- ✅ Automatic HTTPS
- ✅ Easy scaling when needed

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Railway Docs](https://docs.railway.app/)
- [Render Guides](https://render.com/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
