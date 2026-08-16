import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ShadingType,
  AlignmentType,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak
} from "docx";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// Definition of Audit Data Interface
interface AuditData {
  siteName: string;
  url: string;
  auditType: "Quick" | "Full";
  date: string;
  cms: string;
  overallStats: {
    totalPages: number;
    totalImages: number;
    totalSchemas: number;
    totalCitations: number;
    totalSnippets: number;
    avgReadability: number;
  };
  scores: {
    seo: number;
    geo: number;
    aeo: number;
  };
  executiveSummary: string;
  pagesReviewed: Array<{ url: string; type: string; notes: string }>;
  seoFindings: Array<{ signal: string; finding: string; status: "Good" | "Needs Attention" | "Missing" }>;
  geoFindings: Array<{ signal: string; finding: string; status: "Good" | "Needs Attention" | "Missing" }>;
  aeoFindings: Array<{ signal: string; finding: string; status: "Good" | "Needs Attention" | "Missing" }>;
  recommendations: Array<{
    priority: "Critical" | "High" | "Medium" | "Quick Win";
    issue: string;
    dimension: string;
    effort: string;
    impact: string;
  }>;
  strengths: Array<{ title: string; detail: string }>;
}

// Fallback Mock Data for standalone testing
const mockData: AuditData = {
  siteName: "Apex Digital Solutions",
  url: "https://apexdigitalsolutions.example.com",
  auditType: "Full",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  cms: "Next.js",
  overallStats: {
    totalPages: 4,
    totalImages: 38,
    totalSchemas: 12,
    totalCitations: 8,
    totalSnippets: 6,
    avgReadability: 65
  },
  scores: {
    seo: 8,
    geo: 5,
    aeo: 6
  },
  executiveSummary: "Apex Digital Solutions has established a highly optimized traditional SEO foundation with excellent keyword relevancy, mobile responsiveness, and solid on-page meta elements. However, the site is significantly missing out on the emerging AI Search landscape (GEO). There are no structured entity connections, author credentials, or dense factual claims that AI engines like Gemini or Perplexity prefer to cite. Additionally, Answer Engine Optimization (AEO) can be greatly enhanced with clear question-heading combinations and structured FAQ schema to capture featured snippets.",
  pagesReviewed: [
    { url: "/", type: "Homepage", notes: "Excellent layout, fast loading, singular H1, rich content." },
    { url: "/about", type: "About Us", notes: "Missing explicit author profiles and team schema." },
    { url: "/services/cloud-migration", type: "Service Page", notes: "Strong keyword signals but lacks conversational FAQ." },
    { url: "/resources/blog", type: "Blog Hub", notes: "No author bios or credentials on individual posts." }
  ],
  seoFindings: [
    { signal: "Title Tags & Meta Descriptions", finding: "Homepage title (57 chars) and meta description (152 chars) are fully optimized.", status: "Good" },
    { signal: "Heading Hierarchy", finding: "Logical H1 -> H2 structure on all crawled pages. No heading stuffing.", status: "Good" },
    { signal: "Mobile Optimization", finding: "Viewport meta tag present and responsive breakpoints verified.", status: "Good" },
    { signal: "Image Alt Tags", finding: "Several core service icons on /services are missing alt text descriptions.", status: "Needs Attention" }
  ],
  geoFindings: [
    { signal: "E-E-A-T Author Profiles", finding: "No individual author profiles, credentials, or bio pages found.", status: "Missing" },
    { signal: "Organization Schema", finding: "Basic schema exists but lacks SameAs social handles or CEO entity connections.", status: "Needs Attention" },
    { signal: "Factual Citations", finding: "Case studies lack statistical tables and external authority citations.", status: "Needs Attention" }
  ],
  aeoFindings: [
    { signal: "Featured Snippet Eligibility", finding: "Answers to key search terms are too lengthy (optimal: 40-60 words).", status: "Needs Attention" },
    { signal: "FAQ Schema", finding: "No schema markup present for FAQ or HowTo steps.", status: "Missing" },
    { signal: "Conversational Phrasing", finding: "Headings are too corporate (e.g. 'Our Services') instead of conversational.", status: "Needs Attention" }
  ],
  recommendations: [
    { priority: "Critical", issue: "Deploy FAQ and HowTo schema on core service pages to unlock AEO rich snippets.", dimension: "AEO", effort: "Low", impact: "High" },
    { priority: "High", issue: "Build dedicated Author Profile pages with links to professional credentials (E-E-A-T).", dimension: "GEO", effort: "Medium", impact: "High" },
    { priority: "Medium", issue: "Update Organisation Schema to link with SameAs fields and CEO entity graphs.", dimension: "GEO", effort: "Low", impact: "Medium" },
    { priority: "Quick Win", issue: "Add optimized descriptive Alt Text to all service icons on the Homepage.", dimension: "SEO", effort: "Low", impact: "Medium" }
  ],
  strengths: [
    { title: "Premium Typography & Layout", detail: "Visually stunning layout using Outfit and Inter Google Fonts." },
    { title: "Excellent Core Web Vitals", detail: "Fast loading times, minimal layout shifts, and perfect responsive sizing." }
  ]
};

// Colors Config
const COLORS = {
  navy: "1B2A4A",
  blue: "2563EB",
  text: "1E293B",
  lightBlue: "EFF6FF",
  lightGray: "F8F9FA",
  border: "E2E8F0",
  scores: {
    green: "16A34A",
    amber: "D97706",
    red: "DC2626"
  }
};

function getScoreColor(score: number): string {
  if (score >= 8) return COLORS.scores.green;
  if (score >= 5) return COLORS.scores.amber;
  return COLORS.scores.red;
}

function getScoreStatus(score: number): string {
  if (score >= 8) return "Strong";
  if (score >= 5) return "On Track";
  return "Needs Work";
}

function getStatusColor(status: "Good" | "Needs Attention" | "Missing"): string {
  if (status === "Good") return COLORS.scores.green;
  if (status === "Needs Attention") return COLORS.scores.amber;
  return COLORS.scores.red;
}

// ----------------------------------------------------
// 1. DOCX GENERATION FUNCTION
// ----------------------------------------------------
async function generateDocx(data: AuditData, outputPath: string) {
  const combinedScore = data.scores.seo + data.scores.geo + data.scores.aeo;
  
  // Custom Table Cell Helper
  const createCell = (text: string, options: { bold?: boolean; color?: string; shading?: string; center?: boolean } = {}) => {
    return new TableCell({
      shading: options.shading ? { fill: options.shading, type: ShadingType.CLEAR } : undefined,
      children: [
        new Paragraph({
          alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [
            new TextRun({
              text,
              bold: options.bold,
              color: options.color || "000000",
              font: "Arial",
              size: 20
            })
          ]
        })
      ],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
        left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
        right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border }
      }
    });
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${data.siteName} — SEO/GEO/AEO Audit Report`,
                    size: 16,
                    color: "666666",
                    font: "Arial"
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Page ",
                    size: 16,
                    color: "666666",
                    font: "Arial"
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: "666666",
                    font: "Arial"
                  })
                ]
              })
            ]
          })
        },
        children: [
          // ----------------------------------------------------
          // COVER PAGE
          // ----------------------------------------------------
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1000 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: data.siteName.toUpperCase(),
                bold: true,
                size: 64,
                color: COLORS.navy,
                font: "Arial"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 800 },
            children: [
              new TextRun({
                text: "SEO / GEO / AEO Audit Report",
                bold: true,
                size: 28,
                color: COLORS.blue,
                font: "Arial"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 1200 },
            children: [
              new TextRun({
                text: `${data.auditType.toUpperCase()} AUDIT  •  ${data.date.toUpperCase()}`,
                size: 20,
                color: "555555",
                font: "Arial"
              })
            ]
          }),

          // Score blocks on cover
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("SEO SCORE\n\n" + data.scores.seo + " / 10\n\n" + getScoreStatus(data.scores.seo), { bold: true, color: "FFFFFF", shading: getScoreColor(data.scores.seo), center: true }),
                  createCell("GEO SCORE\n\n" + data.scores.geo + " / 10\n\n" + getScoreStatus(data.scores.geo), { bold: true, color: "FFFFFF", shading: getScoreColor(data.scores.geo), center: true }),
                  createCell("AEO SCORE\n\n" + data.scores.aeo + " / 10\n\n" + getScoreStatus(data.scores.aeo), { bold: true, color: "FFFFFF", shading: getScoreColor(data.scores.aeo), center: true })
                ]
              })
            ]
          }),

          new PageBreak(),

          // ----------------------------------------------------
          // EXECUTIVE SUMMARY
          // ----------------------------------------------------
          new Paragraph({
            heading: "Heading1",
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "Executive Summary", bold: true, size: 36, color: COLORS.navy, font: "Arial" })]
          }),
          new Paragraph({
            spacing: { after: 400 },
            children: [new TextRun({ text: data.executiveSummary, size: 22, font: "Arial" })]
          }),

          // Scores Summary Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Dimension", { bold: true, shading: COLORS.navy, color: "FFFFFF" }),
                  createCell("Score", { bold: true, shading: COLORS.navy, color: "FFFFFF", center: true }),
                  createCell("Status", { bold: true, shading: COLORS.navy, color: "FFFFFF", center: true })
                ]
              }),
              new TableRow({
                children: [
                  createCell("Search Engine Optimization (SEO)"),
                  createCell(data.scores.seo + " / 10", { bold: true, center: true }),
                  createCell(getScoreStatus(data.scores.seo), { color: getScoreColor(data.scores.seo), bold: true, center: true })
                ]
              }),
              new TableRow({
                children: [
                  createCell("Generative Engine Optimization (GEO)"),
                  createCell(data.scores.geo + " / 10", { bold: true, center: true }),
                  createCell(getScoreStatus(data.scores.geo), { color: getScoreColor(data.scores.geo), bold: true, center: true })
                ]
              }),
              new TableRow({
                children: [
                  createCell("Answer Engine Optimization (AEO)"),
                  createCell(data.scores.aeo + " / 10", { bold: true, center: true }),
                  createCell(getScoreStatus(data.scores.aeo), { color: getScoreColor(data.scores.aeo), bold: true, center: true })
                ]
              })
            ]
          }),

          new PageBreak(),

          // ----------------------------------------------------
          // RECOMMENDATIONS MATRIX
          // ----------------------------------------------------
          new Paragraph({
            heading: "Heading1",
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "Priority Recommendations Matrix", bold: true, size: 36, color: COLORS.navy, font: "Arial" })]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Priority", { bold: true, shading: COLORS.navy, color: "FFFFFF" }),
                  createCell("Issue & Strategy", { bold: true, shading: COLORS.navy, color: "FFFFFF" }),
                  createCell("Dimension", { bold: true, shading: COLORS.navy, color: "FFFFFF", center: true }),
                  createCell("Effort", { bold: true, shading: COLORS.navy, color: "FFFFFF", center: true }),
                  createCell("Impact", { bold: true, shading: COLORS.navy, color: "FFFFFF", center: true })
                ]
              }),
              ...data.recommendations.map(rec => {
                let pColor = COLORS.scores.green;
                if (rec.priority === "Critical") pColor = COLORS.scores.red;
                else if (rec.priority === "High") pColor = "EA580C";
                else if (rec.priority === "Medium") pColor = COLORS.scores.amber;

                return new TableRow({
                  children: [
                    createCell(rec.priority, { bold: true, color: pColor }),
                    createCell(rec.issue),
                    createCell(rec.dimension, { center: true }),
                    createCell(rec.effort, { center: true }),
                    createCell(rec.impact, { center: true, bold: true })
                  ]
                });
              })
            ]
          }),

          new PageBreak(),

          // ----------------------------------------------------
          // DETAILED SIGNS & FINDINGS (SEO/GEO/AEO)
          // ----------------------------------------------------
          new Paragraph({
            heading: "Heading1",
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "Signal-by-Signal Analysis", bold: true, size: 36, color: COLORS.navy, font: "Arial" })]
          }),

          // SEO Findings Title
          new Paragraph({
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: "1. Search Engine Optimization (SEO) Findings", bold: true, size: 24, color: COLORS.blue, font: "Arial" })]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Signal Category", { bold: true, shading: COLORS.navy, color: "FFFFFF" }),
                  createCell("Specific Observations", { bold: true, shading: COLORS.navy, color: "FFFFFF" }),
                  createCell("Status", { bold: true, shading: COLORS.navy, color: "FFFFFF", center: true })
                ]
              }),
              ...data.seoFindings.map(f => new TableRow({
                children: [
                  createCell(f.signal, { bold: true }),
                  createCell(f.finding),
                  createCell(f.status, { bold: true, color: getStatusColor(f.status), center: true })
                ]
              }))
            ]
          }),

          // GEO Findings Title
          new Paragraph({
            spacing: { before: 400, after: 150 },
            children: [new TextRun({ text: "2. Generative Engine Optimization (GEO) Findings", bold: true, size: 24, color: COLORS.blue, font: "Arial" })]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Signal Category", { bold: true, shading: COLORS.navy, color: "FFFFFF" }),
                  createCell("Specific Observations", { bold: true, shading: COLORS.navy, color: "FFFFFF" }),
                  createCell("Status", { bold: true, shading: COLORS.navy, color: "FFFFFF", center: true })
                ]
              }),
              ...data.geoFindings.map(f => new TableRow({
                children: [
                  createCell(f.signal, { bold: true }),
                  createCell(f.finding),
                  createCell(f.status, { bold: true, color: getStatusColor(f.status), center: true })
                ]
              }))
            ]
          }),

          new PageBreak(),

          // AEO Findings Title
          new Paragraph({
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: "3. Answer Engine Optimization (AEO) Findings", bold: true, size: 24, color: COLORS.blue, font: "Arial" })]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Signal Category", { bold: true, shading: COLORS.navy, color: "FFFFFF" }),
                  createCell("Specific Observations", { bold: true, shading: COLORS.navy, color: "FFFFFF" }),
                  createCell("Status", { bold: true, shading: COLORS.navy, color: "FFFFFF", center: true })
                ]
              }),
              ...data.aeoFindings.map(f => new TableRow({
                children: [
                  createCell(f.signal, { bold: true }),
                  createCell(f.finding),
                  createCell(f.status, { bold: true, color: getStatusColor(f.status), center: true })
                ]
              }))
            ]
          }),

          // ----------------------------------------------------
          // PAGES REVIEWED & STRENGTHS
          // ----------------------------------------------------
          new Paragraph({
            heading: "Heading1",
            spacing: { before: 500, after: 200 },
            children: [new TextRun({ text: "Pages Crawled & Strengths", bold: true, size: 36, color: COLORS.navy, font: "Arial" })]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Page Path", { bold: true, shading: COLORS.navy, color: "FFFFFF" }),
                  createCell("Page Type", { bold: true, shading: COLORS.navy, color: "FFFFFF" }),
                  createCell("Crawl Log / Notes", { bold: true, shading: COLORS.navy, color: "FFFFFF" })
                ]
              }),
              ...data.pagesReviewed.map(p => new TableRow({
                children: [
                  createCell(p.url, { bold: true }),
                  createCell(p.type),
                  createCell(p.notes)
                ]
              }))
            ]
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`[Success] Word DOCX generated: ${outputPath}`);
}

// ----------------------------------------------------
// 2. STUNNING HTML GENERATION FUNCTION
// ----------------------------------------------------
function generateHtml(data: AuditData, outputPath: string) {
  const combinedScore = data.scores.seo + data.scores.geo + data.scores.aeo;
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO / GEO / AEO Search Intelligence Report — ${data.siteName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            /* Dark Theme Variables */
            --bg-gradient: radial-gradient(circle at 50% 50%, #0a1128 0%, #030712 100%);
            --bg-pattern: rgba(99, 102, 241, 0.02);
            --glass-bg: rgba(17, 24, 39, 0.65);
            --glass-border: rgba(255, 255, 255, 0.08);
            --glass-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0px rgba(255, 255, 255, 0.1);
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
            --border-color: rgba(255, 255, 255, 0.08);
            --card-bg: rgba(15, 23, 42, 0.5);
            --glow-color: rgba(99, 102, 241, 0.15);
            --nav-bg: rgba(3, 7, 18, 0.85);

            /* Accent Colors */
            --accent-seo: #06b6d4; /* Neon Cyan */
            --accent-geo: #d946ef; /* Neon Purple/Pink */
            --accent-aeo: #10b981; /* Neon Emerald */
            --accent-blue: #3b82f6;

            /* Status Colors */
            --status-good: #10b981;
            --status-good-bg: rgba(16, 185, 129, 0.12);
            --status-good-border: rgba(16, 185, 129, 0.3);
            --status-attention: #f59e0b;
            --status-attention-bg: rgba(245, 158, 11, 0.12);
            --status-attention-border: rgba(245, 158, 11, 0.3);
            --status-missing: #f43f5e;
            --status-missing-bg: rgba(244, 63, 94, 0.12);
            --status-missing-border: rgba(244, 63, 94, 0.3);

            --accent-critical: #f43f5e;
            --accent-high: #f97316;
            --accent-medium: #eab308;
            --accent-quickwin: #10b981;
        }

        [data-theme="light"] {
            /* Light Theme Variables */
            --bg-gradient: radial-gradient(circle at 50% 50%, #f8fafc 0%, #cbd5e1 100%);
            --bg-pattern: rgba(99, 102, 241, 0.04);
            --glass-bg: rgba(255, 255, 255, 0.7);
            --glass-border: rgba(15, 23, 42, 0.08);
            --glass-shadow: 0 20px 40px rgba(15, 23, 42, 0.05), inset 0 1px 0px rgba(255, 255, 255, 0.8);
            --text-main: #0f172a;
            --text-muted: #475569;
            --border-color: rgba(15, 23, 42, 0.08);
            --card-bg: rgba(255, 255, 255, 0.75);
            --glow-color: rgba(99, 102, 241, 0.06);
            --nav-bg: rgba(248, 250, 252, 0.85);

            /* Accents */
            --accent-seo: #0891b2;
            --accent-geo: #a855f7;
            --accent-aeo: #059669;
            --accent-blue: #2563eb;

            /* Statuses */
            --status-good-bg: rgba(5, 150, 105, 0.1);
            --status-good-border: rgba(5, 150, 105, 0.25);
            --status-attention-bg: rgba(217, 119, 6, 0.1);
            --status-attention-border: rgba(217, 119, 6, 0.25);
            --status-missing-bg: rgba(220, 38, 38, 0.1);
            --status-missing-border: rgba(220, 38, 38, 0.25);
        }

        * {
            box-sizing: border-box;
            transition: background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg-gradient);
            color: var(--text-main);
            margin: 0;
            padding: 0;
            line-height: 1.6;
            min-height: 100vh;
            overflow-x: hidden;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: radial-gradient(var(--bg-pattern) 1px, transparent 1px);
            background-size: 24px 24px;
            pointer-events: none;
            z-index: -1;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 100px 24px 60px 24px;
        }

        /* Nav Header styles */
        header.dashboard-nav {
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 70px;
            background: var(--nav-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--glass-border);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 40px;
            box-shadow: 0 4px 30px rgba(0,0,0,0.03);
        }

        .nav-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: 'Outfit', sans-serif;
            font-weight: 800;
            font-size: 1.4rem;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, var(--accent-seo) 0%, var(--accent-geo) 50%, var(--accent-aeo) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .nav-logo-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, var(--accent-seo) 0%, var(--accent-geo) 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
        }

        .nav-controls {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        /* Toggle Button styling */
        .theme-toggle-btn {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            color: var(--text-main);
            padding: 8px 16px;
            border-radius: 50px;
            cursor: pointer;
            font-family: 'Outfit', sans-serif;
            font-weight: 600;
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: var(--glass-shadow);
        }

        .theme-toggle-btn:hover {
            border-color: var(--accent-blue);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
            transform: translateY(-1px);
        }

        .theme-toggle-icon {
            font-size: 1.1rem;
        }

        /* Cover and Hero section styling */
        .glass-card {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 40px;
            box-shadow: var(--glass-shadow);
            margin-bottom: 30px;
            position: relative;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }

        .hero-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 30px;
            background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1) 0%, transparent 60%), var(--glass-bg);
            border-color: rgba(99, 102, 241, 0.15);
        }

        .hero-content h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 3rem;
            font-weight: 800;
            margin: 0 0 10px 0;
            letter-spacing: -1.5px;
            line-height: 1.1;
        }

        .hero-content p.subtitle {
            font-family: 'Outfit', sans-serif;
            font-size: 1.3rem;
            font-weight: 300;
            color: var(--text-muted);
            margin: 0 0 25px 0;
        }

        .hero-meta {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        .hero-badge {
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--glass-border);
            padding: 8px 18px;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .hero-badge-primary {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%);
            border-color: rgba(99, 102, 241, 0.3);
            color: #93c5fd;
        }

        /* Overall Stats Ribbon */
        .stats-ribbon {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid var(--border-color);
        }

        .stat-item {
            text-align: left;
        }

        .stat-val {
            font-family: 'Outfit', sans-serif;
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--accent-blue);
            line-height: 1.2;
        }

        .stat-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Score cards & animated progress rings */
        .score-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-bottom: 30px;
        }

        @media (max-width: 900px) {
            .score-grid {
                grid-template-columns: 1fr;
            }
        }

        .score-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 35px 24px;
            position: relative;
            overflow: hidden;
        }

        .score-card::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 4px;
        }

        .score-card.seo-card::after { background: var(--accent-seo); }
        .score-card.geo-card::after { background: var(--accent-geo); }
        .score-card.aeo-card::after { background: var(--accent-aeo); }

        .score-card h3 {
            margin: 0 0 20px 0;
            font-family: 'Outfit', sans-serif;
            font-size: 1.3rem;
            font-weight: 700;
        }

        .gauge-wrapper {
            position: relative;
            width: 140px;
            height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }

        .gauge-circle-bg {
            fill: none;
            stroke: rgba(255, 255, 255, 0.03);
            [data-theme="light"] & { stroke: rgba(0, 0, 0, 0.04); }
            stroke-width: 10;
        }

        .gauge-circle {
            fill: none;
            stroke-width: 10;
            stroke-linecap: round;
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
            stroke-dasharray: 282.7; /* 2 * PI * 45 */
            stroke-dashoffset: 282.7;
            transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .seo-gauge { stroke: var(--accent-seo); filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.4)); }
        .geo-gauge { stroke: var(--accent-geo); filter: drop-shadow(0 0 6px rgba(217, 70, 239, 0.4)); }
        .aeo-gauge { stroke: var(--accent-aeo); filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.4)); }

        .gauge-text {
            position: absolute;
            font-family: 'Outfit', sans-serif;
            font-size: 2.2rem;
            font-weight: 800;
            display: flex;
            flex-direction: column;
            align-items: center;
            line-height: 1;
        }

        .gauge-subtext {
            font-size: 0.9rem;
            font-weight: 400;
            color: var(--text-muted);
            margin-top: 2px;
        }

        .score-card-status {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            padding: 6px 16px;
            border-radius: 50px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-badge-strong { background: var(--status-good-bg); border: 1px solid var(--status-good-border); color: var(--status-good); }
        .status-badge-ontrack { background: var(--status-attention-bg); border: 1px solid var(--status-attention-border); color: var(--status-attention); }
        .status-badge-needswork { background: var(--status-missing-bg); border: 1px solid var(--status-missing-border); color: var(--status-missing); }

        /* Executive Summary Panel */
        .summary-panel {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%), var(--glass-bg);
            border-left: 5px solid var(--accent-blue);
        }

        .summary-panel h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.8rem;
            font-weight: 800;
            margin: 0 0 15px 0;
            color: var(--accent-blue);
        }

        .summary-panel p {
            margin: 0;
            font-size: 1.05rem;
            line-height: 1.7;
        }

        /* Section titles */
        h2.section-title {
            font-family: 'Outfit', sans-serif;
            font-size: 2rem;
            font-weight: 800;
            margin: 50px 0 20px 0;
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        h2.section-title::after {
            content: '';
            flex-grow: 1;
            height: 1px;
            background: var(--border-color);
        }

        /* Live Checklist Progress */
        .checklist-tracker-card {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, transparent 100%), var(--glass-bg);
            border-color: rgba(16, 185, 129, 0.15);
            padding: 30px;
            margin-bottom: 30px;
        }

        .tracker-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .tracker-title {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 1.3rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .tracker-stats {
            font-family: 'Outfit', sans-serif;
            font-weight: 600;
            font-size: 1rem;
            color: var(--status-good);
        }

        .tracker-bar-bg {
            background: rgba(255, 255, 255, 0.03);
            [data-theme="light"] & { background: rgba(0, 0, 0, 0.05); }
            height: 10px;
            border-radius: 50px;
            overflow: hidden;
            width: 100%;
            border: 1px solid var(--glass-border);
        }

        .tracker-bar-fill {
            background: linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-aeo) 100%);
            height: 100%;
            width: 0%;
            border-radius: 50px;
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }

        /* Beautiful interactive tables */
        .table-responsive {
            width: 100%;
            overflow-x: auto;
            border-radius: 16px;
            border: 1px solid var(--border-color);
            background: var(--card-bg);
            margin-bottom: 40px;
            box-shadow: var(--glass-shadow);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        th {
            background: rgba(255, 255, 255, 0.02);
            [data-theme="light"] & { background: rgba(0, 0, 0, 0.02); }
            padding: 18px 24px;
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border-bottom: 2px solid var(--border-color);
            color: var(--text-muted);
        }

        td {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color);
            font-size: 0.95rem;
            vertical-align: middle;
        }

        tr:last-child td {
            border-bottom: none;
        }

        tr:hover td {
            background: rgba(255, 255, 255, 0.015);
            [data-theme="light"] & { background: rgba(0, 0, 0, 0.01); }
        }

        /* Checkbox elements for Priority recommendations */
        .recommendation-row {
            transition: opacity 0.3s ease, text-decoration 0.3s ease;
        }

        .recommendation-row.completed-row {
            opacity: 0.5;
        }

        .recommendation-row.completed-row td {
            text-decoration: line-through;
        }

        .recommendation-row.completed-row td.no-strike {
            text-decoration: none !important;
        }

        .custom-checkbox {
            position: relative;
            display: inline-block;
            width: 22px;
            height: 22px;
            cursor: pointer;
        }

        .custom-checkbox input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0; width: 0;
        }

        .checkbox-checkmark {
            position: absolute;
            top: 0; left: 0;
            height: 22px; width: 22px;
            background-color: rgba(255,255,255,0.03);
            [data-theme="light"] & { background-color: rgba(0, 0, 0, 0.03); }
            border: 2px solid var(--glass-border);
            border-radius: 6px;
            transition: all 0.2s ease;
        }

        .custom-checkbox:hover input ~ .checkbox-checkmark {
            border-color: var(--accent-blue);
        }

        .custom-checkbox input:checked ~ .checkbox-checkmark {
            background-color: var(--accent-aeo);
            border-color: var(--accent-aeo);
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }

        .checkbox-checkmark::after {
            content: "";
            position: absolute;
            display: none;
        }

        .custom-checkbox input:checked ~ .checkbox-checkmark::after {
            display: block;
        }

        .custom-checkbox .checkbox-checkmark::after {
            left: 7px;
            top: 3px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }

        /* Priority Matrix Badges */
        .priority-badge {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 0.8rem;
            padding: 5px 12px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-block;
            text-align: center;
        }

        .p-badge-critical { background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: var(--accent-critical); }
        .p-badge-high { background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.3); color: var(--accent-high); }
        .p-badge-medium { background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.3); color: var(--accent-medium); }
        .p-badge-quickwin { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--accent-quickwin); }

        /* Finding breakdown layout & tab controls */
        .filter-tabs-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .filter-tabs {
            display: flex;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            padding: 4px;
            border-radius: 50px;
            box-shadow: var(--glass-shadow);
        }

        .filter-tab-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 8px 20px;
            font-family: 'Outfit', sans-serif;
            font-weight: 600;
            font-size: 0.9rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .filter-tab-btn.active {
            background: var(--accent-blue);
            color: white;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .filter-tab-btn:hover:not(.active) {
            color: var(--text-main);
        }

        /* Custom statuses */
        .status-pill {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 0.8rem;
            padding: 5px 12px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-block;
        }

        .status-pill.good { background: var(--status-good-bg); border: 1px solid var(--status-good-border); color: var(--status-good); }
        .status-pill.needsattention { background: var(--status-attention-bg); border: 1px solid var(--status-attention-border); color: var(--status-attention); }
        .status-pill.missing { background: var(--status-missing-bg); border: 1px solid var(--status-missing-border); color: var(--status-missing); }

        /* Strengths Section Grid */
        .strengths-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
            gap: 24px;
            margin-bottom: 40px;
        }

        .strength-glass-card {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%), var(--glass-bg);
            border-color: rgba(16, 185, 129, 0.15);
            border-radius: 20px;
            padding: 30px;
            position: relative;
        }

        .strength-glass-card h4 {
            margin: 0 0 10px 0;
            font-family: 'Outfit', sans-serif;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--status-good);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .strength-glass-card p {
            margin: 0;
            font-size: 0.95rem;
            color: var(--text-muted);
            line-height: 1.6;
        }

        .table-row-hidden {
            display: none !important;
        }

        /* Printable Style Sheet */
        @media print {
            body {
                background: #ffffff !important;
                color: #0f172a !important;
                padding: 0 !important;
                font-size: 10pt !important;
            }

            body::before {
                display: none !important;
            }

            .container {
                padding: 20px !important;
                max-width: 100% !important;
            }

            header.dashboard-nav,
            .theme-toggle-btn,
            .filter-tabs-container,
            .custom-checkbox input,
            .custom-checkbox .checkbox-checkmark::after {
                display: none !important;
            }

            .glass-card, .table-responsive, .strength-glass-card {
                background: #ffffff !important;
                border: 1px solid #cbd5e1 !important;
                box-shadow: none !important;
                color: #0f172a !important;
                padding: 25px !important;
                margin-bottom: 20px !important;
                page-break-inside: avoid;
            }

            .strength-glass-card {
                border-color: #cbd5e1 !important;
            }

            .hero-banner {
                page-break-after: always;
                height: 98vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                border: none !important;
            }

            .hero-content h1 {
                font-size: 3.5rem !important;
                color: #0f172a !important;
            }

            .summary-panel {
                border-left: 5px solid #2563eb !important;
                page-break-after: always;
            }

            .score-grid {
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 15px !important;
                page-break-after: always;
                margin-top: 50px !important;
            }

            .score-card {
                border: 1px solid #cbd5e1 !important;
            }

            .gauge-circle-bg {
                stroke: #e2e8f0 !important;
            }

            .seo-gauge { stroke: #0891b2 !important; }
            .geo-gauge { stroke: #a855f7 !important; }
            .aeo-gauge { stroke: #059669 !important; }

            .gauge-text {
                color: #0f172a !important;
            }

            .gauge-circle {
                stroke-dashoffset: 0 !important; /* Force complete stroke visibility in print */
            }

            h2.section-title {
                font-size: 1.8rem !important;
                color: #0f172a !important;
                margin-top: 40px !important;
                page-break-before: always;
            }

            table {
                width: 100% !important;
                color: #0f172a !important;
            }

            th {
                background: #f1f5f9 !important;
                color: #0f172a !important;
                border-bottom: 2px solid #cbd5e1 !important;
            }

            td {
                border-bottom: 1px solid #cbd5e1 !important;
            }

            tr:nth-child(even) td {
                background: #f8fafc !important;
            }

            .priority-badge, .status-pill, .score-card-status {
                border: 1px solid #cbd5e1 !important;
                background: #f1f5f9 !important;
                color: #0f172a !important;
            }

            .custom-checkbox {
                border: 1px solid #0f172a !important;
                background: #ffffff !important;
            }

            /* Custom print pages controls */
            #print-recs-page {
                page-break-after: always;
            }

            #print-seo-page {
                page-break-after: always;
            }

            #print-geo-aeo-page {
                page-break-after: always;
            }
            
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
    </style>
</head>
<body>

    <!-- DASHBOARD STICKY NAVBAR -->
    <header class="dashboard-nav">
        <div class="nav-brand">
            <div class="nav-logo-icon">▲</div>
            <span>SEARCH INTELLIGENCE</span>
        </div>
        <div class="nav-controls">
            <button class="theme-toggle-btn" onclick="toggleTheme()">
                <span class="theme-toggle-icon" id="theme-btn-icon">☀️</span>
                <span id="theme-btn-text">Light Mode</span>
            </button>
        </div>
    </header>

    <div class="container">
        <!-- HERO EXECUTIVE SUMMARY COVER -->
        <div class="glass-card hero-banner">
            <div class="hero-content">
                <h1>${data.siteName}</h1>
                <p class="subtitle">SEO, GEO & AEO Deep Audit Breakdown</p>
                <div class="hero-meta">
                    <span class="hero-badge hero-badge-primary">🌐 ${data.url}</span>
                    <span class="hero-badge">📊 ${data.auditType.toUpperCase()} RUN</span>
                    <span class="hero-badge">📅 ${data.date}</span>
                </div>
            </div>
            
            <!-- Executive Statistics Ribbon -->
            <div class="stats-ribbon">
                <div class="stat-item">
                    <div class="stat-val">${data.overallStats.totalPages}</div>
                    <div class="stat-label">Pages Audited</div>
                </div>
                <div class="stat-item">
                    <div class="stat-val">${data.overallStats.totalImages}</div>
                    <div class="stat-label">Images Processed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-val">${data.overallStats.totalSchemas}</div>
                    <div class="stat-label">JSON-LD Schemas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-val">${data.overallStats.totalCitations}</div>
                    <div class="stat-label">Outbound Citations</div>
                </div>
                <div class="stat-item">
                    <div class="stat-val">${data.overallStats.totalSnippets}</div>
                    <div class="stat-label">Snippet Targets</div>
                </div>
            </div>
        </div>

        <!-- SCORE METRICS GRID -->
        <div class="score-grid">
            <!-- SEO -->
            <div class="score-card glass-card seo-card">
                <h3>Traditional SEO</h3>
                <div class="gauge-wrapper">
                    <svg width="120" height="120" viewBox="0 0 100 100">
                        <circle class="gauge-circle-bg" cx="50" cy="50" r="45"></circle>
                        <circle class="gauge-circle seo-gauge" id="seo-ring" cx="50" cy="50" r="45"></circle>
                    </svg>
                    <div class="gauge-text" style="color: var(--accent-seo)">
                        ${data.scores.seo}
                        <span class="gauge-subtext">/10</span>
                    </div>
                </div>
                <span class="score-card-status status-badge-${getScoreStatus(data.scores.seo).toLowerCase().replace(" ", "")}">
                    ${getScoreStatus(data.scores.seo)}
                </span>
            </div>

            <!-- GEO -->
            <div class="score-card glass-card geo-card">
                <h3>Generative AI (GEO)</h3>
                <div class="gauge-wrapper">
                    <svg width="120" height="120" viewBox="0 0 100 100">
                        <circle class="gauge-circle-bg" cx="50" cy="50" r="45"></circle>
                        <circle class="gauge-circle geo-gauge" id="geo-ring" cx="50" cy="50" r="45"></circle>
                    </svg>
                    <div class="gauge-text" style="color: var(--accent-geo)">
                        ${data.scores.geo}
                        <span class="gauge-subtext">/10</span>
                    </div>
                </div>
                <span class="score-card-status status-badge-${getScoreStatus(data.scores.geo).toLowerCase().replace(" ", "")}">
                    ${getScoreStatus(data.scores.geo)}
                </span>
            </div>

            <!-- AEO -->
            <div class="score-card glass-card aeo-card">
                <h3>Answer Engine (AEO)</h3>
                <div class="gauge-wrapper">
                    <svg width="120" height="120" viewBox="0 0 100 100">
                        <circle class="gauge-circle-bg" cx="50" cy="50" r="45"></circle>
                        <circle class="gauge-circle aeo-gauge" id="aeo-ring" cx="50" cy="50" r="45"></circle>
                    </svg>
                    <div class="gauge-text" style="color: var(--accent-aeo)">
                        ${data.scores.aeo}
                        <span class="gauge-subtext">/10</span>
                    </div>
                </div>
                <span class="score-card-status status-badge-${getScoreStatus(data.scores.aeo).toLowerCase().replace(" ", "")}">
                    ${getScoreStatus(data.scores.aeo)}
                </span>
            </div>
        </div>

        <!-- EXECUTIVE SUMMARY PANEL -->
        <div class="glass-card summary-panel">
            <h2>Executive Summary & Insights</h2>
            <p>${data.executiveSummary}</p>
        </div>

        <!-- INTERACTIVE RECOMMENDATIONS MATRIX & CHECKLIST -->
        <div id="print-recs-page">
            <h2 class="section-title">Priority Recommendations Matrix</h2>
            
            <!-- Action Checklist Tracker Widget -->
            <div class="glass-card checklist-tracker-card">
                <div class="tracker-header">
                    <div class="tracker-title">
                        <span>🚀 Dynamic Implementation Tracker</span>
                    </div>
                    <div class="tracker-stats" id="tracker-progress-text">
                        0 of 5 Recommendations Completed (0%)
                    </div>
                </div>
                <div class="tracker-bar-bg">
                    <div class="tracker-bar-fill" id="tracker-progress-bar"></div>
                </div>
            </div>

            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 8%; text-align: center;">Done</th>
                            <th style="width: 14%">Priority</th>
                            <th style="width: 53%">Issue & Operational Strategy</th>
                            <th style="width: 9%; text-align: center;">Dimension</th>
                            <th style="width: 8%; text-align: center;">Effort</th>
                            <th style="width: 8%; text-align: center;">Impact</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.recommendations.map((rec, index) => {
                            let pClass = "p-badge-medium";
                            if (rec.priority === "Critical") pClass = "p-badge-critical";
                            else if (rec.priority === "High") pClass = "p-badge-high";
                            else if (rec.priority === "Quick Win") pClass = "p-badge-quickwin";

                            return `
                            <tr class="recommendation-row" id="rec-row-${index}">
                                <td style="text-align: center;" class="no-strike">
                                    <label class="custom-checkbox">
                                        <input type="checkbox" class="task-checkbox" data-index="${index}" onchange="toggleTask(${index})">
                                        <span class="checkbox-checkmark"></span>
                                    </label>
                                </td>
                                <td class="no-strike"><span class="priority-badge ${pClass}">${rec.priority}</span></td>
                                <td style="font-weight: 500">${rec.issue}</td>
                                <td style="text-align: center;" class="no-strike"><strong>${rec.dimension}</strong></td>
                                <td style="text-align: center;" class="no-strike">${rec.effort}</td>
                                <td style="text-align: center; font-weight: 700; color: var(--accent-blue);" class="no-strike">${rec.impact}</td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- DETAILED OBSERVATIONS GRID -->
        <h2 class="section-title">Granular Signal Breakthroughs</h2>
        
        <div class="filter-tabs-container">
            <div class="filter-tabs">
                <button class="filter-tab-btn active" id="tab-all" onclick="filterFindings('all')">All Signals</button>
                <button class="filter-tab-btn" id="tab-good" onclick="filterFindings('good')">Good</button>
                <button class="filter-tab-btn" id="tab-attention" onclick="filterFindings('needs attention')">Needs Attention</button>
                <button class="filter-tab-btn" id="tab-missing" onclick="filterFindings('missing')">Missing</button>
            </div>
            <div style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">
                * Filter dynamically adjusts detailed lists below
            </div>
        </div>

        <!-- SEO Breakdown -->
        <div id="print-seo-page">
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-top: 30px; color: var(--accent-seo); display: flex; align-items: center; gap: 10px;">
                <span>🌐</span> 1. Traditional SEO Breakdowns
            </h3>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 30%">Core Signal</th>
                            <th style="width: 55%">Observations</th>
                            <th style="width: 15%; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.seoFindings.map(f => {
                            const cleanStatus = f.status.toLowerCase().replace(" ", "");
                            return `
                            <tr class="finding-row" data-status="${f.status.toLowerCase()}">
                                <td style="font-weight: 700">${f.signal}</td>
                                <td>${f.finding}</td>
                                <td style="text-align: center;"><span class="status-pill ${cleanStatus}">${f.status}</span></td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- GEO & AEO Breakdowns -->
        <div id="print-geo-aeo-page">
            <!-- GEO Breakdown -->
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-top: 40px; color: var(--accent-geo); display: flex; align-items: center; gap: 10px;">
                <span>🧠</span> 2. Generative Engine (GEO) Breakdowns
            </h3>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 30%">Core Signal</th>
                            <th style="width: 55%">Observations</th>
                            <th style="width: 15%; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.geoFindings.map(f => {
                            const cleanStatus = f.status.toLowerCase().replace(" ", "");
                            return `
                            <tr class="finding-row" data-status="${f.status.toLowerCase()}">
                                <td style="font-weight: 700">${f.signal}</td>
                                <td>${f.finding}</td>
                                <td style="text-align: center;"><span class="status-pill ${cleanStatus}">${f.status}</span></td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <!-- AEO Breakdown -->
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-top: 40px; color: var(--accent-aeo); display: flex; align-items: center; gap: 10px;">
                <span>📢</span> 3. Answer Engine (AEO) Breakdowns
            </h3>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 30%">Core Signal</th>
                            <th style="width: 55%">Observations</th>
                            <th style="width: 15%; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.aeoFindings.map(f => {
                            const cleanStatus = f.status.toLowerCase().replace(" ", "");
                            return `
                            <tr class="finding-row" data-status="${f.status.toLowerCase()}">
                                <td style="font-weight: 700">${f.signal}</td>
                                <td>${f.finding}</td>
                                <td style="text-align: center;"><span class="status-pill ${cleanStatus}">${f.status}</span></td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- CRAWL LOG -->
        <h2 class="section-title">Crawled Path & Technical Logs</h2>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th style="width: 25%">Audited Path</th>
                        <th style="width: 20%">Classification</th>
                        <th style="width: 55%">Audit Log & Technical Schema Signals</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.pagesReviewed.map(p => `
                        <tr>
                            <td style="font-family: 'Fira Code', monospace; font-size: 0.85rem; font-weight: 600; color: var(--accent-blue)">
                                ${p.url || "/"}
                            </td>
                            <td><strong style="color: var(--text-main)">${p.type}</strong></td>
                            <td style="font-size: 0.9rem; color: var(--text-muted);">${p.notes}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- CORE STRENGTHS -->
        <h2 class="section-title">Genuine Core Strengths</h2>
        <div class="strengths-grid">
            ${data.strengths.map(s => `
                <div class="strength-glass-card glass-card">
                    <h4><span>⚡</span> ${s.title}</h4>
                    <p>${s.detail}</p>
                </div>
            `).join('')}
        </div>
    </div>

    <!-- CLIENT SIDE INTERACTIVE SCRIPTS -->
    <script>
        // Theme Toggling Logic
        function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            html.setAttribute("data-theme", newTheme);
            
            const btnIcon = document.getElementById("theme-btn-icon");
            const btnText = document.getElementById("theme-btn-text");
            
            if (newTheme === "light") {
                btnIcon.textContent = "🌙";
                btnText.textContent = "Dark Mode";
                localStorage.setItem("seo-audit-theme", "light");
            } else {
                btnIcon.textContent = "☀️";
                btnText.textContent = "Light Mode";
                localStorage.setItem("seo-audit-theme", "dark");
            }
        }

        // Load saved theme on boot
        const savedTheme = localStorage.getItem("seo-audit-theme");
        if (savedTheme) {
            document.documentElement.setAttribute("data-theme", savedTheme);
            const btnIcon = document.getElementById("theme-btn-icon");
            const btnText = document.getElementById("theme-btn-text");
            if (savedTheme === "light") {
                btnIcon.textContent = "🌙";
                btnText.textContent = "Dark Mode";
            } else {
                btnIcon.textContent = "☀️";
                btnText.textContent = "Light Mode";
            }
        }

        // Circular Gauge Animation Trigger
        window.addEventListener("DOMContentLoaded", () => {
            animateGauge("seo-ring", ${data.scores.seo});
            animateGauge("geo-ring", ${data.scores.geo});
            animateGauge("aeo-ring", ${data.scores.aeo});
            loadChecklistState();
        });

        function animateGauge(ringId, score) {
            const ring = document.getElementById(ringId);
            if (!ring) return;
            const radius = ring.r.baseVal.value;
            const circumference = 2 * Math.PI * radius;
            
            // Calculate progress offset
            const progress = score / 10;
            const strokeDashoffset = circumference - (progress * circumference);
            
            // Apply dash properties statically first, then animate
            ring.style.strokeDasharray = circumference;
            ring.style.strokeDashoffset = circumference;
            
            // Delay slightly to trigger transition smoothly
            setTimeout(() => {
                ring.style.strokeDashoffset = strokeDashoffset;
            }, 100);
        }

        // Tab Filter Logic
        function filterFindings(status) {
            // Update active state on tab buttons
            const tabs = document.querySelectorAll(".filter-tab-btn");
            tabs.forEach(t => t.classList.remove("active"));
            
            // Find matched tab
            const activeId = "tab-" + (status === "all" ? "all" : status === "good" ? "good" : status === "needs attention" ? "attention" : "missing");
            const activeTab = document.getElementById(activeId);
            if (activeTab) activeTab.classList.add("active");

            // Filter finding rows
            const rows = document.querySelectorAll(".finding-row");
            rows.forEach(row => {
                const rowStatus = row.getAttribute("data-status");
                if (status === "all" || rowStatus === status) {
                    row.classList.remove("table-row-hidden");
                } else {
                    row.classList.add("table-row-hidden");
                }
            });
        }

        // Checklist State and LocalStorage persistence
        const siteKey = "seo-audit-checklist-${data.siteName.toLowerCase().replace(/\\s+/g, "-")}";

        function toggleTask(index) {
            const checkbox = document.querySelector('input.task-checkbox[data-index="' + index + '"]');
            const row = document.getElementById("rec-row-" + index);
            
            if (checkbox && row) {
                if (checkbox.checked) {
                    row.classList.add("completed-row");
                } else {
                    row.classList.remove("completed-row");
                }
            }
            
            saveChecklistState();
            updateTrackerProgress();
        }

        function saveChecklistState() {
            const checkboxes = document.querySelectorAll("input.task-checkbox");
            const checkedStates = [];
            checkboxes.forEach(c => {
                checkedStates.push({
                    index: c.getAttribute("data-index"),
                    checked: c.checked
                });
            });
            localStorage.setItem(siteKey, JSON.stringify(checkedStates));
        }

        function loadChecklistState() {
            const savedState = localStorage.getItem(siteKey);
            if (savedState) {
                try {
                    const checkedStates = JSON.parse(savedState);
                    checkedStates.forEach(item => {
                        const checkbox = document.querySelector('input.task-checkbox[data-index="' + item.index + '"]');
                        if (checkbox) {
                            checkbox.checked = item.checked;
                            toggleTask(item.index);
                        }
                    });
                } catch(e) {}
            }
            updateTrackerProgress();
        }

        function updateTrackerProgress() {
            const checkboxes = document.querySelectorAll("input.task-checkbox");
            const total = checkboxes.length;
            if (total === 0) return;

            let completed = 0;
            checkboxes.forEach(c => {
                if (c.checked) completed++;
            });

            const percent = Math.round((completed / total) * 100);
            
            const progressBar = document.getElementById("tracker-progress-bar");
            const progressText = document.getElementById("tracker-progress-text");
            
            if (progressBar) progressBar.style.width = percent + "%";
            if (progressText) {
                progressText.textContent = completed + " of " + total + " Recommendations Completed (" + percent + "%)";
            }
        }
    </script>
</body>
</html>
  `;
  
  fs.writeFileSync(outputPath, htmlContent);
  console.log(`[Success] Glassmorphic HTML dashboard generated: ${outputPath}`);
}

// ----------------------------------------------------
// 3. EXECUTION FLOW
// ----------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const scratchDirArgIndex = args.indexOf("--scratchDir");
  const artifactsDirArgIndex = args.indexOf("--artifactsDir");

  const currentDir = __dirname;
  const defaultScratch = path.join(currentDir, "../scratch");
  const defaultArtifacts = path.join(currentDir, "../artifacts");

  const scratchDir = (scratchDirArgIndex !== -1) ? args[scratchDirArgIndex + 1] : defaultScratch;
  const artifactsDir = (artifactsDirArgIndex !== -1) ? args[artifactsDirArgIndex + 1] : defaultArtifacts;

  // Ensure artifacts and scratch directories exist
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

  // Read actual audit_data.json if present in scratch
  let auditData = mockData;
  const dataPath = path.join(scratchDir, "audit_data.json");
  if (fs.existsSync(dataPath)) {
    try {
      const fileContent = fs.readFileSync(dataPath, "utf8");
      auditData = JSON.parse(fileContent);
      console.log("[Info] Loaded custom audit data from audit_data.json");
    } catch (e: any) {
      console.error("[Warning] Failed to parse audit_data.json, falling back to mock data:", e.message);
    }
  } else {
    console.log("[Info] No custom audit_data.json found. Using template mock data.");
  }

  const docxPath = path.join(artifactsDir, "seo-audit-report.docx");
  const htmlPath = path.join(artifactsDir, "report.html");
  const pdfPath = path.join(artifactsDir, "seo-audit-report.pdf");

  // Generate the Word Docx
  await generateDocx(auditData, docxPath);

  // Generate the Gorgeous HTML
  generateHtml(auditData, htmlPath);

  // Convert to PDF using Google Chrome headless print-to-pdf
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  if (fs.existsSync(chromePath)) {
    console.log("[Info] Initiating PDF compilation via headless Google Chrome...");
    try {
      execSync(`"${chromePath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`, { stdio: "inherit" });
      console.log(`[Success] Premium PDF compiled successfully: ${pdfPath}`);
    } catch (err: any) {
      console.error("[Error] PDF compilation failed:", err.message);
    }
  } else {
    console.error("[Error] Google Chrome executable not found at Program Files. Skipping PDF conversion.");
  }
}

main().catch(err => {
  console.error("[Fatal Error] Report compilation crashed:", err);
});
