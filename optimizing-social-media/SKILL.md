---
name: optimizing-social-media
description: Optimizes social media posts for Facebook, TikTok (Tech Talk), and ads. Generates viral hooks, video scripts, search-optimized copy, and ad frameworks based on text, links, or media. Use when the user asks to write a post, boost engagement, write Facebook ad copy, or optimize social media visibility.
---

# Optimizing Social Media Growth & Search Visibility

This skill provides advanced capabilities for generating high-performance, search-optimized social media posts, short-form video scripts, and conversion-focused Facebook ad campaigns. It converts raw inputs (links, images, video context, or text explanations) into highly engaging copy engineered for maximum views, likes, and organic search discoverability.

## 1. When to Use This Skill
Trigger this skill when the user asks to:
- Write a social media post, caption, or script for Facebook, TikTok (Tech Talk), Instagram, or LinkedIn.
- Boost organic engagement, views, likes, or comments on their social media profiles.
- Write high-converting Facebook ad copy, primary texts, headlines, or description variations.
- Optimize their social posts for search engine discoverability (on-platform search indexing and general SEO).
- Adapt existing website links or product descriptions into viral social formats.

## 2. Key Frameworks & Logic

### A. Scroll-Stopper Hook Library
Every viral asset must deploy a high-signal hook in the first 3 seconds (video) or first 2 lines (text):
- **The Pattern Interrupt**: Disrupts typical expectations or states a counter-intuitive truth.
  *Example*: "I audited 100 Facebook ads and realized 99% of them are throwing away money on this exact button..."
- **The Negative Framework**: Speaks directly to a mistake the user is likely making.
  *Example*: "Stop writing your captions like this if you actually want people to read them."
- **The Open Loop**: Sets up a question or high-value payoff that can only be resolved by reading/watching.
  *Example*: "There is a hidden SEO hack in Facebook posts that no one is talking about. Here is how it works..."

### B. Facebook Organic Post Framework (Viral Engagement)
Designed to trigger the Facebook comment-ranking and sharing algorithm:
- **Visual Spacing**: Use clean paragraphs of no more than 2 lines. Add emoji bullets for easy scanning.
- **The "Value Sandwich"**:
  1. *Hook*: Scroll-stopping hook.
  2. *Context*: The core problem or insight.
  3. *Core Value*: 3 actionable tips or bullet points.
  4. *The Hand-Raiser Loop*: Boosts comments by asking the audience to request a resource.
     *Example*: "Comment 'GROWTH' below and I'll send you my complete keyword list for free."

### C. TikTok ("Tech Talk") Short-Form Video Scripting
Designed for high watch time, retention, and algorithm indexing:
- **Visual Direction Codes**: Embed brackets `[Visual Cue]` to specify camera cuts, text overlays, and motion details.
- **Micro-Retention Anchors**: Keep visual cuts under 3 seconds to prevent scrolling.
- **Seamless Loop ending**: Hook the viewer back to the start of the video.
  *Example*: "...and that is exactly why..." (loops back to the hook "...you should stop doing X").

### D. Facebook Conversion Ad Copy (Ad Policy Compliant)
Engineered for conversions while maintaining strict compliance with Meta Ad Policies:
- **Meta Policy Compliance**:
  - Never reference personal attributes using direct questions (e.g., "Are you struggling with debt?" is a policy violation; use "Many business owners face X" instead).
  - Avoid spammy phrases, unrealistic income/benefit claims, or misleading clickbait.
- **Structure Options**:
  - *Short & Punchy*: 1 strong hook, 3 benefits, 1 direct Call-To-Action (CTA).
  - *Story-Driven*: Relatable founder journey or customer success story leading to the offer.

### E. Social Search SEO Optimization
Ensures posts index correctly for search boxes (TikTok SEO, Facebook Search, and Google):
- **Focus Keywords**: Seamlessly integrated into the first 2 paragraphs and video captions.
- **Semantic Phrasing**: Including conversational search queries (e.g., "how to fix website loading speed").
- **Accessibility Alt-Text**: Providing alt-text descriptions that describe images/videos to help index the media.
- **Search Hashtag Hierarchy**:
  - `[1 Broad Category Tag]` (e.g., `#DigitalMarketing`)
  - `[2 Targeted Niche Tags]` (e.g., `#FacebookAdsTips` `#TikTokSEO`)
  - `[1 High-Intent Search Tag]` (e.g., `#BoostViews`)

## 3. Workflow Execution

### Step 1: Input Analysis
Gather and parse the user's input:
- If a **URL/Link** is provided: Fetch and parse it to extract page title, core value proposition, key target audience, and primary hooks.
- If **Media (Image/Video)** is supplied: Read its contents, extract visual assets, and define the core theme.
- If a **Text Description** is provided: Distill the product features, core offer, and brand voice.

### Step 2: Optimization Subprocess
Call the node optimizer helper scripts to construct:
1. *Organic Facebook Copy* (with high-signal scroll-stoppers and comment loops).
2. *Meta Conversion Ad Copy* (with multiple Headlines, Primary Texts, and CTA setups).
3. *TikTok ("Tech Talk") Short-Form Script* (with Visual Cues, Text Overlays, and loop ending).
4. *Social Search SEO Report* (incorporating high-intent search terms, hashtags, and descriptive Alt-Text).

### Step 3: Interactive Visual Preview
Compile the data into a gorgeous glassmorphic preview dashboard (`social-preview.html`) featuring native-looking mockups of the posts on their respective platforms. Print the dashboard to a high-fidelity cheat sheet PDF using headless Chrome.

---
## Scripts & Automation
Run the optimization workflow from the CLI:
```powershell
npx tsx scripts/post_optimizer.ts --url "[Target Link]" --topic "[Post Topic]" --scratchDir "[Path]" --artifactsDir "[Path]"
```
