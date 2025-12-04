# GitHub Projects Page - Setup Instructions

## Quick Start

### 1. Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "yuricunha-website-repos")
4. **For public repos only**: No scopes needed
5. **For private repos**: Check the `repo` scope
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again)

### 2. Set Environment Variable

**Windows PowerShell:**
```powershell
$env:GITHUB_TOKEN="your_token_here"
```

**Linux/macOS:**
```bash
export GITHUB_TOKEN="your_token_here"
```

**Permanent (optional):**
- Create a `.env` file in the project root:
  ```
  GITHUB_TOKEN=your_token_here
  ```
- Add to your shell profile (`.bashrc`, `.zshrc`, etc.)

### 3. Fetch Repository Data

```bash
# run the fetch script
npm run fetch-repos
```

This will:
- Fetch all your repositories from GitHub
- Sort them by stars (highest first)
- Save to `data/repos.json`

### 4. Build and View

```bash
# start hugo development server
hugo server -D

# open browser to:
# http://localhost:1313/projects/
```

## Maintenance

### Update Repository Data

Run the fetch script anytime you want to update the repository list:

```bash
npm run fetch-repos
hugo server -D
```

### Deployment

Make sure to add `GITHUB_TOKEN` as an environment variable in your deployment platform:
- **GitHub Pages**: Add to repository secrets
- **Netlify**: Add to environment variables in site settings
- **Vercel**: Add to environment variables in project settings

Then add a build command that runs the fetch script before Hugo:

```bash
npm run fetch-repos && hugo
```

## Troubleshooting

### Error: "GITHUB_TOKEN not found"
- The script will still work but with a lower rate limit (60 requests/hour)
- For better performance, set the token as described above

### No repositories showing
- Make sure you ran `npm run fetch-repos` successfully
- Check that `data/repos.json` exists and contains data
- Verify the file is not empty: `cat data/repos.json`

### Rate limit exceeded
- Wait an hour or use a GitHub token
- With a token, you get 5,000 requests/hour
