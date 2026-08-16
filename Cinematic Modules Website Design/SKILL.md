---
name: cinematic-modules-website-design
description: Designs and builds high-end websites using Cinematic Site Components. Use when the user says "I want to make a website" or asks for cinematic design modules.
---

# Using Cinematic Modules

This skill allows the agent to utilize a curated toolkit of 30 cinematic web modules to build high-end websites.

## Workflow

- [ ] **Initialization**: Clone the toolkit repository if not already present.
- [ ] **Research**: Read the `README.md` to understand the capabilities and installation steps for the modules.
- [ ] **Exploration**: Open `index.html` in the browser to visualize the available modules.
- [ ] **Engagement**: Ask the user about their project (business type, mood, theme).
- [ ] **Recommendation**: Suggest 2-3 specific modules that align with the user's vision.

## Setup Instructions

Run the following command to clone the toolkit:
```bash
git clone https://github.com/robonuggets/cinematic-site-components.git
```

## Module Selection Guide

When recommending modules, consider the following categories:
- **Hero Sections**: For landing page impact.
- **Content Blocks**: For story-telling and information display.
- **Specialty Components**: Interactive elements or unique visual styles.

## Integration Rules

1. Always check for the existence of the `cinematic-site-components` directory before attempting to open files.
2. Use the `read_browser_page` or `browser_subagent` to explore `index.html` and understand the visual style of each module.
3. Provide reasoning for your recommendations based on the user's input (e.g., "Module X fits your dark-mode luxury brand because of its high-contrast typography and sleek animations").
