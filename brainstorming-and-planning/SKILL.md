---
name: brainstorming-and-planning
description: Explores user requirements, generates designs, and plans implementation before the agent writes any code. Use when the user asks to plan a feature, brainstorm ideas, design a system, or create a spec.
---

# Brainstorming and Planning

## When to use this skill
- When starting a new project, feature, or complex task.
- When the user asks to brainstorm, plan, design, or scaffold an idea.
- Before writing any code or modifying existing systems for a new requirement.
- When the user provides a vague request that needs refinement.

## Workflow
You MUST complete this checklist in order before writing any implementation code:

- [ ] **1. Explore project context**: Review files, documentation, and recent commits to understand the current state.
- [ ] **2. Scope assessment**: Determine if the request needs to be decomposed into smaller independent pieces.
- [ ] **3. Clarifying questions**: Ask one question at a time to establish purpose, constraints, and success criteria.
- [ ] **4. Propose approaches**: Provide 2-3 design options with trade-offs and your recommendation.
- [ ] **5. Present design**: Outline the design in manageable sections (architecture, data flow, components), getting user approval iteratively.
- [ ] **6. Write design spec**: Save the approved design to `docs/specs/YYYY-MM-DD-<topic>-design.md`.
- [ ] **7. Self-review spec**: Check the spec for ambiguity, placeholders, or contradictions, and fix inline.
- [ ] **8. Final user approval**: Present the written spec for final review before moving to implementation planning.

## Instructions

### Engaging with the User
* **One Question at a Time**: Never overwhelm the user with multiple questions in a single response. Break complex topics into a sequence of questions.
* **Multiple Choice Preferred**: When exploring constraints or design choices, provide clear options if possible to lower the cognitive load on the user.
* **Scale with Complexity**: A simple utility needs a few sentences of design. A large feature gets detailed sections. **All tasks, simple or complex, MUST go through this process.** Do not assume a task is "too simple".
* **YAGNI (You Aren't Gonna Need It)**: Actively suggest removing unnecessary scope to keep the initial design simple, testable, and achievable.

### Designing for Clarity and Isolation
* **Clear Boundaries**: Break the system into units (functions, classes, modules) that have exactly one purpose and communicate through clear interfaces.
* **Existing Patterns**: When working in an existing codebase, conform to existing architectural patterns unless the design explicitly requires changing them.
* **Targeted Refactoring**: Include file organization or refactoring in the design if existing code complexity will hinder the new work. Otherwise, avoid unrelated changes.

### Specification Formatting
* Write specs in standard Markdown.
* Keep it concise. Assume the implementing agent is smart and understands common programming concepts. Do not over-explain.
* Avoid placeholders like "TBD" or "TODO". Resolve all ambiguities during the brainstorming phase before saving the spec.
* The spec must clearly define: 
  - Goal
  - Non-Goals (Out of Scope)
  - Architecture/Data Flow
  - Specific Components/Files to be modified or created
  - Testing/Success Criteria

## Resources
- The agent should automatically create the `docs/specs/` directory if it does not already exist when writing the design spec.
