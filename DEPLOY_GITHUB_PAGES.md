# Deploy to GitHub Pages

This guide explains how to deploy the MyIP frontend to GitHub Pages.

## ⚠️ Important Notes

- GitHub Pages **only hosts static files** (frontend only)
- Backend API functionality requires a separate backend server
- Some features may be limited without a backend

## Prerequisites

1. A GitHub account
2. A fork or copy of this repository
3. Basic knowledge of GitHub Actions

## Quick Start

### Option 1: Automatic Deployment (Recommended)

The repository includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages.

**Steps:**

1. **Enable GitHub Pages in your repository:**
   - Go to your repository Settings
   - Navigate to **Pages** (under "Code and automation")
   - Under **Source**, select **GitHub Actions**

2. **Configure the base URL (if needed):**
   - For user/organization pages (`username.github.io`): No configuration needed
   - For project pages (`username.github.io/repo-name`): The workflow automatically detects this

3. **Trigger the deployment:**
   - Push to the `main` branch, or
   - Go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**

4. **Access your site:**
   - User/org page: `https://username.github.io`
   - Project page: `https://username.github.io/repo-name`

### Option 2: Manual Deployment

If you prefer to build and deploy manually:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build for production:**

   For user/org pages:
   ```bash
   npm run build
   ```

   For project pages:
   ```bash
   VITE_BASE_URL=/repo-name/ npm run build
   ```

3. **Deploy the `dist` folder to GitHub Pages:**
   - Use a tool like `gh-pages`:
     ```bash
     npm install -g gh-pages
     gh-pages -d dist
     ```
   - Or manually upload to the `gh-pages` branch

## Backend API Configuration

Since GitHub Pages only hosts static files, you have two options for backend functionality:

### Option 1: Use an External Backend

If you have your own backend server:

1. Configure your backend server with the required environment variables
2. Update API calls in the frontend to point to your backend server
3. Ensure CORS is properly configured on your backend

### Option 2: Limited Functionality

Run the site without backend features:

- IP detection will use client-side methods only
- Some advanced features requiring server-side APIs will be disabled
- The frontend will gracefully handle missing backend endpoints

## Environment Variables

For GitHub Pages deployment, you can configure:

- `VITE_BASE_URL`: Base URL for the application
  - `/` for user/org pages
  - `/repo-name/` for project pages
  - Automatically set by the GitHub Actions workflow

Other `VITE_*` environment variables can be configured in your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add **Variables** (not Secrets) for each `VITE_*` variable
3. Reference them in the workflow file

## Troubleshooting

### Issue: 404 errors on page refresh

**Solution:** This should be automatically handled by the `404.html` file. If issues persist:
- Verify `404.html` exists in your `dist` folder
- Check that the SPA redirect scripts are present in `index.html`

### Issue: Assets not loading (404 errors for JS/CSS)

**Solution:** Check your `VITE_BASE_URL` configuration:
- For project pages, it must match your repository name: `/repo-name/`
- For user/org pages, it should be `/`

### Issue: API calls failing

**Solution:**
- GitHub Pages doesn't support backend APIs
- Configure an external backend or accept limited functionality
- Check browser console for specific error messages

## Advanced Configuration

### Custom Domain

To use a custom domain with GitHub Pages:

1. Add a `CNAME` file to the `public` directory with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

### Workflow Customization

The GitHub Actions workflow can be customized in `.github/workflows/deploy-gh-pages.yml`:

- Change trigger conditions (branches, paths)
- Add build steps or environment variables
- Modify deployment settings

## Support

For issues specific to GitHub Pages deployment, please check:

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

For application-specific issues, refer to the main README.
