# Baseline Audit: browsing-internet Skill
# Target: C:\Users\light\.gemini\antigravity\skills\browsing-internet\SKILL.md
# Authored: 2026-04-25 (Post outlier.bet scraping session)

## Observed Failures & Gaps (from real-world use)

### CRITICAL FAILURES
1. **`agent-browser eval` was unavailable** — The skill documented `eval` as a valid command but it failed at runtime. There was no fallback documented.
2. **No JS extraction protocol** — When asked for "every piece of code", there was no defined method for extracting inline `<script>` tags or linked `.js` bundle URLs from the DOM.
3. **No CSS extraction protocol** — Similarly, no defined method for pulling linked `.css` files, extracting `<style>` blocks, or capturing CSS custom properties/design tokens.
4. **No fallback for blocked/dynamic pages** — No guidance when Firecrawl returns empty/minimal content on JS-rendered sites (e.g., React/Vue SPAs). Had to improvise with `view-source:` navigation.
5. **WordPress detection was accidental** — No documented heuristics for identifying CMS, tech stack, or framework from scraped HTML.

### WORKFLOW GAPS
6. **No "deep technical scrape" mode** — Normal scrape captures text content. There was no protocol for the "give me every piece of code" deep-technical-scrape mode requested by the user.
7. **No third-party script audit step** — No documented method for cataloging all external script/link tags (Google Tag Manager, analytics, CDNs, etc.)
8. **No animation/CSS keyframe extraction** — No documented method for specifically targeting and extracting CSS animation logic.
9. **File organization was inconsistent** — Files were saved in different locations during the session (scraped-content/ vs brain/ temp storage).
10. **No post-scrape summary template** — The agent had to improvise a summary format. A consistent template would accelerate future sessions.

### TOOL SELECTION GAPS
11. **Tool selection table is too vague** — "Dynamic JS-heavy pages" → agent-browser is correct, but there's no guidance on HOW to get the source code vs the rendered DOM.
12. **No guidance on `view-source:` as a fallback** — This was the key workaround that saved the session but is not documented.
13. **No `firecrawl_map` usage documented** — Was never used to first map the site structure before scraping. Would have saved time.
14. **Screenshot save path not enforced** — Screenshots went to temp storage, not the documented `screenshots/` folder.

## Success Metric (Loss to minimize)
→ "Real-world execution failure rate" across: tool availability, content extraction completeness, file organization correctness.
Current Score (Session 1): 5.5/10 — many workarounds needed, no failures were catastrophic but required significant improvisation.

## Target Score
→ 10/10 — zero improvisation needed; every scenario has a documented path.
