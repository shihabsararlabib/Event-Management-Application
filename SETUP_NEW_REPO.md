# Setup Your Own GitHub Repository

## Step 1: Create New GitHub Repository
1. Go to https://github.com/new
2. Repository name: `Event-Management-Application` (or your preferred name)
3. Description: "Secure Event Management System with Custom Cryptography"
4. Make it **Public** (required for CSE447 submission)
5. **DO NOT** check "Add a README file"
6. **DO NOT** add .gitignore or license
7. Click "Create repository"

## Step 2: Change Git Remote

After creating the repo, GitHub will show you a URL like:
```
https://github.com/YOUR-USERNAME/Event-Management-Application.git
```

### Option A: Using PowerShell (Run these commands)

```powershell
# Remove the old remote
git remote remove origin

# Add your new remote (replace YOUR-USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/Event-Management-Application.git

# Verify the new remote
git remote -v

# Push all code to your repository
git branch -M master
git push -u origin master
```

### Option B: If you get authentication errors

GitHub requires a Personal Access Token for HTTPS. Create one:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "EventShield Project"
4. Expiration: 90 days
5. Select scopes: Check **`repo`** (full control)
6. Click "Generate token"
7. **COPY THE TOKEN** (you won't see it again!)

Then push using:
```powershell
git push -u origin master
```

When prompted for username: enter your GitHub username
When prompted for password: **paste the token** (not your GitHub password)

### Option C: Using GitHub Desktop (Easier)

1. Download GitHub Desktop from https://desktop.github.com
2. Open GitHub Desktop
3. File → Add Local Repository → Select `C:\Users\AABATT\Event-Management-Application`
4. Repository → Repository Settings → Change remote
5. Enter your new repository URL
6. Click "Publish repository"

## Step 3: Verify Upload

Go to your GitHub repository URL:
```
https://github.com/YOUR-USERNAME/Event-Management-Application
```

You should see all files including:
- ✅ frontend/ folder
- ✅ server/ folder
- ✅ PROJECT_REPORT.md
- ✅ README.md
- ✅ API.md

## Step 4: Update Project Report

After successful upload, update line 308 in PROJECT_REPORT.md:

```markdown
**Link:** `https://github.com/YOUR-USERNAME/Event-Management-Application`
```

## Troubleshooting

### "Permission denied" error:
- Use Personal Access Token instead of password
- Or switch to SSH: `git remote set-url origin git@github.com:YOUR-USERNAME/Event-Management-Application.git`

### "Repository not found" error:
- Double-check the URL matches your GitHub username
- Ensure the repository was created successfully on GitHub

### Files not uploading:
- Check if you're in the correct directory: `cd C:\Users\AABATT\Event-Management-Application`
- Check git status: `git status`
- Add all files: `git add .`
- Commit: `git commit -m "Initial commit - EventShield project"`
- Push: `git push -u origin master`

## Important Notes

- ⚠️ Make sure the repository is **PUBLIC** for course submission
- ⚠️ Don't commit sensitive data (passwords, API keys, tokens)
- ⚠️ The `.env` file should be in `.gitignore` (already configured)
- ✅ All your custom crypto code will be visible to demonstrate no built-in libraries were used
