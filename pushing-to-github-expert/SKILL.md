---
name: pushing-to-github-expert
description: Automatically summarizes project changes using the brainstorming-and-planning skill and pushes them to GitHub. Use when the user asks to "push to github", "sync my code", or "update my repo".
---

# GitHub Pushing Skin (Expert Edition)

## When to use this skill
- When the user explicitly says "push to github", "update my repo", or "sync my code".
- When you want to provide a professional, brainstormed summary of the work done in the commit message.

## Workflow
- [ ] **1. Identify Changes**: Run `git status` and `git diff` to understand what has changed.
- [ ] **2. Brainstorming Phase**: Invoke the `brainstorming-and-planning` skill.
    - **Prompt**: "Summarize the key changes, design decisions, and improvements made in this session. Focus on the impact of the changes and maintain a professional, 'wow' tone."
- [ ] **3. Construct Commit Message**:
    - **Header**: A concise summary of the main feature/fix.
    - **Body**: A bulleted list derived from the brainstorming session.
- [ ] **4. Execution**:
    - `git add .`
    - `git commit -m "[Header]" -m "[Body]"`
    - `git push origin [current-branch]`

## Instructions

### 1. Autonomous Operation
The user has granted permission to perform these pushes autonomously. Do not ask for confirmation or input on the commit message unless there is a critical ambiguity.

### 2. High-Quality Summaries
The commit message should feel premium. Avoid generic messages like "fixed bugs". Instead, use descriptive language like:
- "Refactored Profile navigation for enhanced user journey"
- "Optimized Cloud Function receipt logic for brand consistency"

### 3. Branch Management
- Identify the current branch using `git branch --show-current`.
- Push to that branch unless instructed otherwise.

## Resources
- [Brainstorming Skill](file:///C:/Users/light/.gemini/antigravity/skills/brainstorming-and-planning/SKILL.md)
