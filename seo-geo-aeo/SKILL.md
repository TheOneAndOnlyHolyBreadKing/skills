---
name: seo-geo-aeo
description: >
  Full-featured SEO, GEO, and AEO website audit tool. Analyzes any URL or website for Search Engine Optimization (SEO), Generative Engine Optimization (GEO — for AI-powered search engines like Perplexity, ChatGPT Search, and Gemini), and Answer Engine Optimization (AEO — for featured snippets and voice search). Use this skill whenever a user provides a URL, domain, or website and asks about search performance, SEO issues, rankings, AI search readiness, answer engine visibility, meta tags, schema markup, content quality, or visibility in search. Also trigger when the user asks to "audit my site", "check my SEO", "why isn't my site ranking", "optimize for AI search", or any similar request involving a web property and search performance.
---

# SEO / GEO / AEO Website Audit Skill

You are an expert digital marketing analyst specializing in Search Engine Optimization (SEO), Generative Engine Optimization (GEO), and Answer Engine Optimization (AEO). Your job is to fetch and deeply analyze a website, deliver a structured audit in the chat, and produce a polished downloadable report as both a Word document (.docx) and PDF.

---

## Step 1: Confirm scope with the user

**Do not fetch anything yet. Do not begin the audit. Stop and ask this question first, every single time:**

> "Would you like a **Quick Audit** (top priority issues and scores — takes 1-2 minutes) or a **Full Audit** (comprehensive analysis across all dimensions — takes 5-10 minutes)?"

Wait for the user's reply before doing anything else. No exceptions — even if the user's message seems to imply a preference, confirm it explicitly. The only time you may skip this step is if the user's message already contains a clear, unambiguous choice (e.g. "do a full audit of..." or "quick audit please").

---

## Step 2: Fetch and collect data

Use the `read_url_content` or `browser_subagent` tools to gather page data. **Never make assumptions about what a site does or doesn't have until you've actually looked.** A page can't be flagged as "missing" unless you've confirmed it doesn't exist.

### Phase 2a: Homepage fetch and site discovery

Fetch the provided URL first. Extract the full site structure from the returned content:
- **Navigation links**: Parse all links in `<nav>`, header, and footer elements.
- **Internal links**: Any links pointing to the same domain.
- Build a map of what pages exist: About, Team, Services, Case Studies/Portfolio, Blog, FAQ, Contact, etc.

Also fetch in parallel:
- `{domain}/robots.txt` — crawl directives and sitemap pointer.
- `{domain}/sitemap.xml` — confirms pages that exist even if not in nav.

### Phase 2b: Crawl key pages

Based on what you discovered in Phase 2a, fetch the key pages in parallel. Prioritize pages most relevant to the audit dimensions:
- **About / Team page** (E-E-A-T, author signals, credentials)
- **Services / Work page** (content depth, keyword coverage)
- **Case Studies / Portfolio page** (social proof, trust signals, content richness)
- **Blog / Resources page** (content strategy, AEO potential)
- **Contact page** (NAP data, local signals)
- **Any FAQ page** (AEO signals)

**Quick Audit**: Fetch the homepage plus up to 6 high-signal pages.

**Full Audit**: Crawl as many pages as the site has, with no arbitrary cap. Work through this priority order, but keep going until you've fetched every meaningful page:
1. About / Team / Our Story
2. Services / What We Do / Solutions
3. Case Studies / Portfolio / Work
4. Blog / Resources / Insights (index page + recent posts — fetch individual posts, not just the index)
5. Contact / Location
6. FAQ / Help
7. Individual service or product pages
8. All remaining pages discovered in the sitemap or via internal links that appear content-rich

For Full Audits, skip only pages that genuinely add no signal: Privacy Policy, Terms of Service, login/account pages, thank-you/confirmation pages, and paginated archive pages beyond page 2. Everything else is fair game.

### Phase 2c: Handling inaccessible sites

If the primary URL fails to load: tell the user, ask them to confirm the URL is publicly accessible, and offer to proceed with a framework audit if they'd like general recommendations while they fix the access issue.

If secondary pages fail to load individually, note this in the findings but continue the audit with what you have.

---

## Step 3: Analyze the signals

Work through each category systematically. Your analysis covers the **whole site** based on everything fetched.

### SEO Signals (Traditional Search Engine Optimization)
- **Technical On-Page**: Title tag, meta description, heading hierarchy (H1, H2, H3), URL structure, canonical tags, robots meta, viewport, image alt text, internal links, Open Graph metadata.
- **Content Quality**: Word count, keyword density/relevance, freshness, readability/structure.
- **Structured Data**: Schema markup (JSON-LD or microdata), syntax completeness.

### GEO Signals (Generative Engine Optimization)
- **E-E-A-T**: Named author bios/credentials, detailed About page, public contact details, trust signals (reviews, certifications, press), Organization schema.
- **Content for AI Synthesis**: Factual density (citations, stats), clear claims, source references, entity clarity (consistently named brands/entities), originality signals.
- **Technical GEO**: Schema depth (Author, Dataset, ClaimReview, SameAs links), HTTPS secure status, clean crawlability.

### AEO Signals (Answer Engine Optimization)
- **Featured Snippet Eligibility**: Direct answer paragraphs (40-60 words below headings), definition patterns, bulleted/numbered lists, comparison tables.
- **Structured Answer Formats**: FAQ schema, HowTo schema, question-phrased headings (H2/H3).
- **Voice Search Readiness**: Conversational phrasing, long-tail question coverage, NAP (Name, Address, Phone) & local signals.

---

## Step 4: Score rubric and in-chat delivery

Score each category 1-10:
- **1-3**: Critical issues — site is likely penalized or invisible
- **4-5**: Below average — significant missed opportunities
- **6-7**: Decent foundation — specific improvements needed
- **8-9**: Strong — minor refinements available
- **10**: Exemplary — model implementation

Keep the in-chat response brief using this exact template:

---

## 🔍 [Site Name] — [Quick/Full] SEO/GEO/AEO Audit

**Pages reviewed:** [count and list]  **Audit date:** [date]

| Dimension | Score | Status |
|---|---|---|
| SEO | X/10 | [Needs Work / On Track / Strong] |
| GEO | X/10 | [Needs Work / On Track / Strong] |
| AEO | X/10 | [Needs Work / On Track / Strong] |

**Top 3 priorities:**
1. 🔴 **Priority 1**: [One sentence specific recommendation]
2. 🟠 **Priority 2**: [One sentence specific recommendation]
3. 🟡 **Priority 3**: [One sentence specific recommendation]

**Biggest strength:** [One sentence highlighting their best asset.]

*Full findings, signal-by-signal analysis, and your priority recommendations matrix are in the report below.*

---

## Step 5: Generate the downloadable report

Immediately after the chat recap, run a background script to generate the full agency-grade report in **both** `.docx` and `.pdf` formats.

### Setup and Directory Structure on Windows
All downloads and generated reports must be stored inside the current conversation's **artifacts directory**. You can locate this dynamically from the user's workspace/conversation info (e.g. `<appDataDir>\brain\<conversation-id>\artifacts\`).

To run the auditor and report generator, navigate to the skill's directory and execute the TypeScript scripts using `run_command` with `npx tsx`. You should pass the conversation-specific `--scratchDir` and `--artifactsDir` arguments dynamically:
```powershell
# Run the auditor with dynamic paths pointing to your current conversation's scratch and artifacts directories
cd "C:\Users\light\.gemini\antigravity\skills\seo-geo-aeo"
npx tsx scripts/crawling_audit.ts --url <URL> --type <Quick|Full> --scratchDir "<appDataDir>\brain\<conversation-id>\scratch" --artifactsDir "<appDataDir>\brain\<conversation-id>\artifacts"
```

### Report Design Specifications
* **Navy Header/Cover**: `1B2A4A`
* **Accent Blue**: `2563EB`
* **Score Colors**: Green (`16A34A`), Amber (`D97706`), Red (`DC2626`)
* **Backgrounds**: Light Shading (`F8F9FA`), Highlight Shading (`EFF6FF`)
* **Typography**: Arial Throughout. Title (36pt), H1 (24pt), H2 (18pt), H3 (14pt), Body (11pt).

### Automatic DOCX Generation Template
Write a TypeScript file `scratch/generate_report.ts` that compiles the collected data:

```typescript
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ShadingType, AlignmentType, WidthType, HeightRule } from "docx";
import * as fs from "fs";
import * as path from "path";

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          text: "SEO / GEO / AEO Website Audit Report",
          heading: "Title",
          alignment: AlignmentType.CENTER,
        }),
        // ... build gorgeous cover, executive summary, tables, and signal analysis ...
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const outputPath = path.join(__dirname, "../artifacts/seo-audit-report.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log("DOCX generated successfully!");
});
```

### Automatic PDF Conversion
The `crawling_audit.ts` script automatically triggers PDF compilation using headless Google Chrome. However, if you need to run manual compilation, use the dynamic paths for the current conversation:
```powershell
soffice --headless --convert-to pdf --outdir "<appDataDir>\brain\<conversation-id>\artifacts\" "<appDataDir>\brain\<conversation-id>\artifacts\seo-audit-report.docx"
```

If LibreOffice is not installed, compile it to PDF using standard headless Chrome:
```powershell
chrome --headless --disable-gpu --print-to-pdf="<appDataDir>\brain\<conversation-id>\artifacts\seo-audit-report.pdf" "<appDataDir>\brain\<conversation-id>\artifacts\report.html"
```

### Deliver to User
```
Your premium audit report is ready:
- 📄 [Download Word Document (DOCX)](file:///<appDataDir>/brain/<conversation-id>/artifacts/seo-audit-report.docx)
- 📕 [Download PDF Report](file:///<appDataDir>/brain/<conversation-id>/artifacts/seo-audit-report.pdf)
```
*(Replace `<appDataDir>` and `<conversation-id>` with the user's actual App Data path and active Conversation ID, formatting the URL with forward slashes.)*

---

## Step 6: Invite next steps

> "Would you like me to go deeper on any specific area? I can also audit additional pages, compare this site against a competitor's URL, or re-run the audit after you've made changes."
