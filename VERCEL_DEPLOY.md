# Vercel Deployment Guide

## Quick Setup (via Vercel Dashboard)

### Step 1: Add GitHub Token

1. Open your project on Vercel Dashboard
2. Go to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `GITHUB_TOKEN`
   - **Value:** `your_github_personal_access_token`
   - **Environments:** ✓ Production, ✓ Preview, ✓ Development
4. Click **Save**

### Step 2: Configure Build Settings

1. Go to **Settings** → **Build & Development Settings**
2. Configure:
   - **Framework Preset:** `Hugo`
   - **Build Command:** `npm run build`
   - **Output Directory:** `public`
   - **Install Command:** `npm install` (default)

3. Click **Save**

### Step 3: Deploy

Option A: **Automatic (Recommended)**
- Just push to your repository
- Vercel will automatically:
  1. Install Node.js dependencies
  2. Run `npm run build` which:
     - Fetches repos via `npm run fetch-repos`
     - Builds Hugo site with `hugo --gc --minify`
  3. Deploy to production

Option B: **Manual**
- Click **Deployments** → **Deploy** → Select branch
- Vercel will run the build process

---

## How It Works

### Build Process Flow

```
1. Vercel starts build
   ↓
2. npm install (installs any dependencies)
   ↓
3. npm run build
   ↓
4. npm run fetch-repos
   ↓
5. Node.js script fetches GitHub repos using GITHUB_TOKEN
   ↓
6. data/repos.json is created with repo data
   ↓
7. hugo --gc --minify builds the site
   ↓
8. public/ directory is deployed
```

### Security Notes

✅ **Token is safe:**
- Stored in Vercel environment variables (encrypted)
- Never exposed in build logs (Vercel redacts env vars)
- Never in generated HTML or client-side code
- Not in Git repository (`.env` in `.gitignore`)

---

## Verification After Deploy

1. Visit your deployed site
2. Navigate to `/projects/`
3. Should see all your GitHub repositories ordered by stars
4. Check that data is up-to-date

---

## Updating Repository Data

### Automatic Updates

Every time you deploy (push to GitHub), Vercel will:
- Fetch latest repository data
- Rebuild the site with fresh data

### Manual Redeploy

To update without code changes:
1. Go to **Deployments**
2. Click on latest deployment
3. Click **Redeploy**

This will fetch fresh repository data (useful if you added repos or got more stars).

---

## Troubleshooting

### Build Fails with "GITHUB_TOKEN not found"

**Issue:** Environment variable not set

**Solution:**
1. Go to **Settings** → **Environment Variables**
2. Verify `GITHUB_TOKEN` exists
3. Check that it's enabled for the environment you're deploying to
4. Redeploy

### Build Fails with "node: command not found"

**Issue:** Node.js version incompatibility

**Solution:**
- Already fixed! `package.json` specifies `"node": ">=18.0.0"`
- Vercel will use Node.js 18 or newer automatically

### No Repositories Showing on /projects/

**Issue:** `data/repos.json` not created or empty

**Solution:**
1. Check build logs in Vercel dashboard
2. Look for "fetching repositories" messages
3. Verify token has correct permissions
4. Redeploy

### Rate Limit Errors

**Issue:** GitHub API rate limit exceeded

**Solution:**
- With token: 5,000 requests/hour (very unlikely to hit)
- Without token: 60 requests/hour
- Wait or verify token is set correctly

---

## Build Logs Example

Successful build should show:

```
[09:15:32.123] Running "npm run build"
[09:15:32.456] > npm run fetch-repos && hugo --gc --minify
[09:15:33.123] ==================================================
[09:15:33.124] github repository fetch script
[09:15:33.125] ==================================================
[09:15:33.200] fetching repositories for isyuricunha...
[09:15:34.567] fetched page 1 (30 repos)
[09:15:35.234] total repositories fetched: 30
[09:15:35.456] saved 30 repositories to data/repos.json
[09:15:35.789] ==================================================
[09:15:35.790] success! repositories data saved.
[09:15:35.791] ==================================================
[09:15:35.792] top 5 repos by stars:
[09:15:35.793] 1. awesome-project (⭐ 156)
[09:15:35.794] 2. cool-tool (⭐ 89)
[09:15:35.795] 3. website (⭐ 42)
[09:15:36.000] Start building sites...
[09:15:37.234] Built in 1234 ms
[09:15:37.500] Build completed successfully!
```

---

## Optional: GitHub Actions Auto-Update

If you want to automatically update repository data daily without redeploying:

1. Create `.github/workflows/update-repos.yml`:
```yaml
name: Update Repositories

on:
  schedule:
    - cron: '0 0 * * *'  # daily at midnight
  workflow_dispatch:  # manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run fetch-repos
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "chore: update repository data [skip ci]"
          file_pattern: "data/repos.json"
```

2. This will:
   - Run daily
   - Fetch fresh repo data
   - Commit updated `data/repos.json`
   - Trigger Vercel deployment automatically

---

## Summary

**What you need to do:**
1. ✅ Create GitHub Personal Access Token
2. ✅ Add token to Vercel environment variables  
3. ✅ Set build command to `npm run build`
4. ✅ Push to repository

**Vercel handles:**
- ✅ Installing Node.js
- ✅ Fetching repository data securely
- ✅ Building Hugo site
- ✅ Deploying

That's it! Every push = fresh repository data + new deployment.
