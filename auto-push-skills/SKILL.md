---
name: auto-push-skills
description: Automatically stages, commits, and pushes all changes in the skills directory (C:\Users\light\.gemini\skills) to GitHub whenever any skill is created, edited, updated, or removed.
---

# Auto Push Skills Workspace to GitHub

## Overview
This skill ensures that all changes made to skills in `C:\Users\light\.gemini\skills` are immediately and automatically version-controlled and pushed to GitHub repository `TheOneAndOnlyHolyBreadKing/skills`.

## Trigger Criteria (Mandatory Auto-Execution)
- **Skill Creation**: Immediately after creating a new skill directory or file under `C:\Users\light\.gemini\skills`.
- **Skill Update**: Immediately after editing, updating, or refactoring any skill, script, reference, or resource file in `C:\Users\light\.gemini\skills`.
- **Skill Deletion**: Immediately after removing any skill or file from `C:\Users\light\.gemini\skills`.
- **Explicit Request**: When the user requests to "push skills", "sync skills to github", or similar commands.

## Execution Workflow

### 1. Set Workspace Context
Ensure working directory is `C:\Users\light\.gemini\skills`.

### 2. Sanitize Embedded Repositories
Remove any stray `.git` subdirectories inside skill resource folders to prevent broken gitlinks:
```powershell
Get-ChildItem -Path . -Recurse -Directory -Filter ".git" | Where-Object { $_.FullName -ne (Join-Path (Get-Location) ".git") } | Remove-Item -Recurse -Force
```

### 3. Stage All Skill Changes
```powershell
git add -A
```

### 4. Commit Changes
Construct a clear commit message detailing the skill changes made:
```powershell
git commit -m "feat(skills): update skills workspace - <brief description of skill created/modified>"
```

### 5. Push to Remote Repository
Push to `origin main`:
```powershell
git push -u origin main
```

### 6. Verification
Run `git status` to verify that working tree is clean and `origin/main` is up to date.
