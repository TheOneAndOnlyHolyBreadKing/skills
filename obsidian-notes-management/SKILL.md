---
name: obsidian-notes-management
description: Manages and enhances Obsidian notes with a premium aesthetic. Automatically generates relevant concept art/images and uses structured markdown components like callouts and tables. Use when the user asks to create, update, or "upgrade" notes in their Obsidian vault.
---

# Obsidian Notes Management

## When to use this skill
- Creating new technical or personal notes in an Obsidian vault.
- "Upgrading" existing notes to look more professional/premium.
- Adding visual context (AI-generated art) to existing notes.

## Workflow
- [ ] **Analyze Content:** Identify the core subject, key takeaways, and potential visual metaphors.
- [ ] **Establish Metadata:** Ensure the note has a standardized header (Date, Tags, Source).
- [ ] **Structure with Callouts:** Use Obsidian-flavored markdown (e.g., `> [!tip]`, `> [!warning]`) to highlight important information.
- [ ] **Generate Visuals:** Proactively use the `generate_image` tool to create 1-2 pieces of high-quality concept art or diagrams that match the note's theme.
- [ ] **Implement Tables/Mermaid:** Use tables for comparisons and Mermaid for workflows.
- [ ] **Validate Writing:** Check for a bold summary at the beginning and a concluding recap.

## Design Patterns

### Metadata Header
```markdown
----
Date created: YYYY-MM-DD
Tag's: #topic1 #topic2
Source: [Link](url)

---
```

### Visual Integration
When the note is about a technical architecture (like Firebase) or a complex concept, generate an image with a prompt like:
`"Modern, cinematic concept art of [Topic], representation of [Concept], high-tech aesthetic, digital art, 4k, vibrant colors"`
Embed the image using:
`![Concept Art for [Topic]](file:///path/to/generated_image.png)`

### Callout Categories
- `[!info]` - General history or context.
* `[!tip]` - Best practices or shortcuts.
- `[!warning]` - Common pitfalls or security risks.
* `[!summary]` - High-level takeaways.

## Drive Workaround (G: Drive)
If working on a Google Drive-mounted folder (G:\) and `write_to_file` fails with "The parameter is incorrect":
1. Use `run_command` with `powershell -c "New-Item -Path '...' -ItemType File"` to create the empty file.
2. Then use `write_to_file` with `Overwrite: true` to fill it.

## Resources
- [Example Note Template](examples/template.md)
