---
name: pushing-to-github
description: Automatically summarizes project changes using brainstorming and pushes them to a GitHub repository. Use when the user asks to 'push to github', 'sync my code', or 'update my repo'.
---

# Pushing to GitHub

## When to use this skill
- When the user asks to "push to github" or "update the repository".
- When a major feature is completed and needs to be versioned.
- When the user wants an automated summary of their changes in the commit history.

## Workflow
- [ ] **1. Identify Changes**: Run `git status` and `git diff` to see what has changed.
- [ ] **2. Brainstorm Summary**: Use the `brainstorming-and-planning` skill to summarize the work done since the last commit.
- [ ] **3. Generate Commit Message**: Create a multi-line commit message including a high-level title and a bulleted list of changes based on the brainstormed summary.
- [ ] **4. Stage Files**: Add all relevant files to the git index.
- [ ] **5. Commit and Push**: Execute the commit and push to the default branch.

## Instructions

### 1. Generating the Summary
Before pushing, you MUST use the `brainstorming-and-planning` skill to analyze the context. Review the `docs/specs/` directory if it exists, or look at the most recently modified files.
The goal is to provide a "wow" summary for the user in the commit message.

### 2. Git Operations
Use the following pattern for pushing:
1. `git add .`
2. `git commit -m "[Brief Title]" -m "[Detailed Summary from Brainstorming]"`
3. `git push origin [branch-name]`

### 3. Handling Remote Setup
If the repository is not yet initialized or the remote is missing:
- Ask the user for the GitHub repository name.
- If they have `github-mcp-server`, check for an existing repo or create a new one.
- Initialize with `git init`, `git remote add origin ...`, and `git branch -M main`.

## Resources
- [See Brainstorming Skill](file:///C:/Users/light/.gemini/antigravity/skills/brainstorming-and-planning/SKILL.md)
