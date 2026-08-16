---
name: analyzing-design-references
description: Downloads and syncs the awesome-design-md repository to provide curated website design references and breakdowns. Use when the user asks for website inspiration, design references, or breakdowns of design elements from premium brands.
---

# Analyzing Design References

## When to use this skill
- When the user asks for design inspiration or website references.
- When the user wants to understand the design language of a premium brand (e.g., Apple, Stripe, Airbnb).
- When the user provides a website reference and asks for a breakdown of its design elements (colors, typography, spacing, components).
- To keep the local design reference repository up to date.

## Workflow

### 1. Sync Repository
Always check for updates from the source repository before proceeding with a request.
```powershell
# Run this in the skill directory: C:/Users/light/.gemini/antigravity/skills/analyzing-design-references/resources/repo
git pull
```

### 2. Provide Selections
If the user asks for inspiration, list the available brands in the repository.
- Path: `resources/repo/design-md/`
- Each subdirectory is a brand.
- Briefly describe a few (3-5) based on their `DESIGN.md` descriptions.

### 3. Design Breakdown
When a user provides a reference (text, code, or image) or selects a brand:
- **Read**: Load the `DESIGN.md` for the selected brand.
- **Analyze**: Identify key design tokens:
    - **Colors**: Primary, secondary, surface, text.
    - **Typography**: Font families, weights, scales.
    - **Components**: Signature elements (e.g., Apple's pills, Stripe's gradients).
    - **Philosophy**: Describe the "vibe" (e.g., "Museum gallery", "Dynamic tech", "Minimalist luxury").
- **Breakdown**: If the user provides content to copy, explain how to adapt it using the reference's principles.

## Instructions

- **Path Handling**: Always use `/` for paths. The base repo is at `C:/Users/light/.gemini/antigravity/skills/analyzing-design-references/resources/repo`.
- **conciseness**: Don't just dump the whole `DESIGN.md`. Extract the most relevant "Do's and Don'ts" and "Design Principles".
- **Planning Only**: This skill is for the **planning and brainstorming phase**. Use it to build a design specification before writing code.

## Resources
- [Main Repo](resources/repo/)
- [Design MDs](resources/repo/design-md/)
