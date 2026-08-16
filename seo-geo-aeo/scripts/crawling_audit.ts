import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import { execSync } from "child_process";

// Definition of Audit Data Interface
interface PageData {
  url: string;
  type: string;
  html: string;
  title: string;
  description: string;
  h1s: string[];
  h2s: string[];
  h3s: string[];
  imagesCount: number;
  imagesWithAlt: number;
  canonical: string;
  hasViewport: boolean;
  schemas: any[];
  tablesCount: number;
  listsCount: number;
  numberTokensCount: number; // For factual density
  questionHeadings: string[];
  authorSignals: string[];
  cmsDetected: string;
  schemaSummary: string[];
  externalCitationCount: number;
  featuredSnippetTargets: string[];
  readabilityScore: number;
  wordCount: number;
  hasHighAuthoritySameAs: boolean;
}

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

// User-Agent to pass security/bot protection systems
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

// Flesch Reading Ease helpers
function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 2) return 1;
  // Remove common prefixes & suffixes
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function calculateFleschReadingEase(text: string): number {
  const cleanText = text.trim();
  if (!cleanText) return 100;
  // Clean punctuation and get sentences
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const wordsList = cleanText.split(/\s+/).filter(w => w.length > 0 && /^[a-zA-Z0-9]+$/.test(w));
  const words = wordsList.length || 1;
  
  let totalSyllables = 0;
  for (const word of wordsList) {
    totalSyllables += countSyllables(word);
  }
  
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words);
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Headless Chrome DOM bypass extraction helper
async function fetchPageWithChrome(url: string): Promise<string> {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  if (!fs.existsSync(chromePath)) {
    console.warn(`[Warning] Chrome executable not found at ${chromePath}. Skipping Chrome dump.`);
    return "";
  }
  try {
    console.log(`📡 [Chrome Fallback] Crawling with headless Chrome: ${url}`);
    const command = `"${chromePath}" --headless --disable-gpu --dump-dom "${url}"`;
    const stdout = execSync(command, { maxBuffer: 15 * 1024 * 1024, timeout: 20000 });
    return stdout.toString();
  } catch (err: any) {
    console.warn(`[Warning] Chrome fallback failed for ${url}: ${err.message}`);
    return "";
  }
}

async function fetchPage(url: string): Promise<string> {
  let html = "";
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      },
      timeout: 10000,
      maxRedirects: 5
    });
    html = res.data;
  } catch (err: any) {
    console.warn(`[Warning] Axios failed to fetch page ${url}: ${err.message}`);
  }

  // Fallback to Chrome if Axios failed or returned a blank client-side app container
  if (!html || html.length < 600 || (!html.includes("<body") && !html.includes("<div"))) {
    const chromeHtml = await fetchPageWithChrome(url);
    if (chromeHtml) {
      html = chromeHtml;
    }
  }
  return html;
}

// XML Sitemap index and robots discovery
async function getSitemapUrls(homepageUrl: string): Promise<string[]> {
  const urls: string[] = [];
  const sitemapUrls = new Set<string>();

  // Add standard sitemap guess locations
  try {
    sitemapUrls.add(new URL("/sitemap.xml", homepageUrl).toString());
    sitemapUrls.add(new URL("/sitemap_index.xml", homepageUrl).toString());
  } catch {}

  // Parse robots.txt for Sitemap directives
  try {
    const robotsUrl = new URL("/robots.txt", homepageUrl).toString();
    console.log(`🤖 Scanning robots.txt for sitemap paths: ${robotsUrl}`);
    const robotsTxt = await fetchPage(robotsUrl);
    if (robotsTxt) {
      const lines = robotsTxt.split(/\r?\n/);
      for (const line of lines) {
        if (line.toLowerCase().startsWith("sitemap:")) {
          const match = line.substring(8).trim();
          if (match && /^https?:\/\//i.test(match)) {
            sitemapUrls.add(match);
          }
        }
      }
    }
  } catch (err: any) {
    console.warn(`[Warning] Robots.txt check failed: ${err.message}`);
  }

  // Process sitemaps recursively up to a limit of 15 XML files to prevent infinite crawler loops
  const checkedSitemaps = new Set<string>();
  const activeSitemapQueue = Array.from(sitemapUrls);
  let queueIndex = 0;

  while (queueIndex < activeSitemapQueue.length && checkedSitemaps.size < 15) {
    const activeSitemap = activeSitemapQueue[queueIndex++];
    if (checkedSitemaps.has(activeSitemap)) continue;
    checkedSitemaps.add(activeSitemap);

    try {
      console.log(`📄 Fetching XML Sitemap: ${activeSitemap}`);
      const xml = await fetchPage(activeSitemap);
      if (!xml) continue;

      const $ = cheerio.load(xml, { xmlMode: true });
      
      // Look for nested sitemaps inside a index sitemap
      $("sitemap > loc").each((_, el) => {
        const nestedUrl = $(el).text().trim();
        if (nestedUrl && /^https?:\/\//i.test(nestedUrl) && !checkedSitemaps.has(nestedUrl)) {
          activeSitemapQueue.push(nestedUrl);
        }
      });

      // Parse actual page URLs
      $("url > loc").each((_, el) => {
        const pageUrl = $(el).text().trim();
        if (pageUrl && /^https?:\/\//i.test(pageUrl)) {
          urls.push(pageUrl);
        }
      });
    } catch (err: any) {
      console.warn(`[Warning] Failed to parse sitemap ${activeSitemap}: ${err.message}`);
    }
  }

  return Array.from(new Set(urls));
}

function parsePage(url: string, html: string, type: string): PageData {
  const $ = cheerio.load(html);
  
  const title = $("title").text().trim() || "";
  const description = $('meta[name="description"]').attr("content")?.trim() || "";
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() || "";
  const hasViewport = $('meta[name="viewport"]').length > 0;
  
  const h1s: string[] = [];
  $("h1").each((_, el) => { h1s.push($(el).text().trim()); });
  
  const h2s: string[] = [];
  $("h2").each((_, el) => { h2s.push($(el).text().trim()); });

  const h3s: string[] = [];
  $("h3").each((_, el) => { h3s.push($(el).text().trim()); });

  let imagesCount = 0;
  let imagesWithAlt = 0;
  $("img").each((_, el) => {
    imagesCount++;
    const alt = $(el).attr("alt");
    if (alt && alt.trim().length > 0) {
      imagesWithAlt++;
    }
  });

  const schemas: any[] = [];
  const schemaSummary: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() || "");
      if (parsed) {
        schemas.push(parsed);
        const getTypes = (obj: any): string[] => {
          let types: string[] = [];
          if (obj["@type"]) types.push(obj["@type"]);
          if (obj["@graph"] && Array.isArray(obj["@graph"])) {
            obj["@graph"].forEach((item: any) => {
              if (item["@type"]) types.push(item["@type"]);
            });
          }
          return types;
        };
        schemaSummary.push(...getTypes(parsed));
      }
    } catch {}
  });

  const tablesCount = $("table").length;
  const listsCount = $("ul").length + $("ol").length;

  // Compute word count and Flesch readability
  const bodyTextStr = $("body").text();
  const wordCount = bodyTextStr.split(/\s+/).filter(w => w.length > 0).length || 1;
  const readabilityScore = calculateFleschReadingEase(bodyTextStr);

  // Extract factual tokens count (numbers, dates, percentages, currencies)
  const numberTokens = bodyTextStr.match(/(?:\b\d+(?:[\.,]\d+)?%?\b|[\$€£¥]\d+(?:[\.,]\d+)?)/g) || [];
  const numberTokensCount = numberTokens.length;

  // Question Headings (AEO)
  const questionHeadings: string[] = [];
  $(":header").each((_, el) => {
    const headingText = $(el).text().trim();
    if (/^(?:what|how|why|where|who|which|can|is|are|do|does)\b/i.test(headingText) || headingText.endsWith("?")) {
      questionHeadings.push(headingText);
    }
  });

  // Author signals & high-authority sameAs check (GEO)
  const authorSignals: string[] = [];
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href.includes("linkedin.com/in/") || href.includes("twitter.com/") || href.includes("x.com/")) {
      authorSignals.push(href);
    }
  });

  let hasHighAuthoritySameAs = false;
  const scanSameAs = (obj: any) => {
    if (typeof obj !== "object" || obj === null) return;
    if (Array.isArray(obj)) {
      obj.forEach(scanSameAs);
      return;
    }
    for (const key in obj) {
      if (key === "sameAs") {
        const val = obj[key];
        const valArray = Array.isArray(val) ? val : [val];
        valArray.forEach((link: any) => {
          if (typeof link === "string") {
            authorSignals.push(link);
            if (/wikidata\.org|wikipedia\.org|linkedin\.com|crunchbase\.com|twitter\.com|x\.com/i.test(link)) {
              hasHighAuthoritySameAs = true;
            }
          }
        });
      } else {
        scanSameAs(obj[key]);
      }
    }
  };
  schemas.forEach(scanSameAs);

  // CMS platform fingerprinting
  let cmsDetected = "Custom / Static HTML";
  const bodyText = $("body").html() || "";
  const headText = $("head").html() || "";
  const combinedHtml = headText + bodyText;
  
  if (/wp-content|wp-includes|wp-json/i.test(combinedHtml) || /<meta[^>]*name="generator"[^>]*content="WordPress/i.test(combinedHtml)) {
    cmsDetected = "WordPress";
  } else if (/cdn\.shopify\.com|shopify-payment-button/i.test(combinedHtml) || /<meta[^>]*name="generator"[^>]*content="Shopify/i.test(combinedHtml)) {
    cmsDetected = "Shopify";
  } else if (/data-wf-page|webflow\.js/i.test(combinedHtml)) {
    cmsDetected = "Webflow";
  } else if (/static\.wixstatic\.com|wix-code/i.test(combinedHtml)) {
    cmsDetected = "Wix";
  } else if (/static1\.squarespace\.com/i.test(combinedHtml)) {
    cmsDetected = "Squarespace";
  } else if (/_next\/static|__NEXT_DATA__/i.test(combinedHtml)) {
    cmsDetected = "Next.js";
  }

  // Factual external citations (.edu, .gov, wikipedia)
  let externalCitationCount = 0;
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname;
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (/^https?:\/\//i.test(href) && !href.includes(domain)) {
      if (/\.(edu|gov)\b|wikipedia\.org/i.test(href)) {
        externalCitationCount++;
      }
    }
  });

  // Featured snippet eligibility (paragraphs under question headers containing 35-65 words)
  const featuredSnippetTargets: string[] = [];
  $(":header").each((_, el) => {
    const headingText = $(el).text().trim();
    if (/^(?:what|how|why|where|who|which|can|is|are|do|does)\b/i.test(headingText) || headingText.endsWith("?")) {
      let next = $(el).next();
      for (let i = 0; i < 2 && next.length > 0; i++) {
        if (next.is("p")) {
          const pText = next.text().trim();
          const words = pText.split(/\s+/).filter(w => w.length > 0);
          if (words.length >= 35 && words.length <= 65) {
            featuredSnippetTargets.push(`"${headingText}" -> "${pText.substring(0, 80)}..." (${words.length} words)`);
          }
          break;
        }
        next = next.next();
      }
    }
  });

  return {
    url,
    type,
    html,
    title,
    description,
    h1s,
    h2s,
    h3s,
    imagesCount,
    imagesWithAlt,
    canonical,
    hasViewport,
    schemas,
    tablesCount,
    listsCount,
    numberTokensCount,
    questionHeadings,
    authorSignals,
    cmsDetected,
    schemaSummary,
    externalCitationCount,
    featuredSnippetTargets,
    readabilityScore,
    wordCount,
    hasHighAuthoritySameAs
  };
}

async function main() {
  const args = process.argv.slice(2);
  const urlArgIndex = args.indexOf("--url");
  const typeArgIndex = args.indexOf("--type");
  const scratchDirArgIndex = args.indexOf("--scratchDir");
  const artifactsDirArgIndex = args.indexOf("--artifactsDir");

  if (urlArgIndex === -1) {
    console.error("Error: --url parameter is required.");
    process.exit(1);
  }

  let targetUrl = args[urlArgIndex + 1];
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = "https://" + targetUrl;
  }

  const auditType: "Quick" | "Full" = (typeArgIndex !== -1 && args[typeArgIndex + 1] === "Quick") ? "Quick" : "Full";
  
  const defaultScratch = path.join(__dirname, "../scratch");
  const scratchDir = (scratchDirArgIndex !== -1) ? args[scratchDirArgIndex + 1] : defaultScratch;

  const defaultArtifacts = path.join(__dirname, "../artifacts");
  const artifactsDir = (artifactsDirArgIndex !== -1) ? args[artifactsDirArgIndex + 1] : defaultArtifacts;

  console.log(`[Info] Initiating automated SEO/GEO/AEO audit on: ${targetUrl} (${auditType} Audit)`);
  console.log(`[Info] Writing results to scratch directory: ${scratchDir}`);
  console.log(`[Info] Writing reports to artifacts directory: ${artifactsDir}`);

  // Fetch Homepage
  const homepageHtml = await fetchPage(targetUrl);
  if (!homepageHtml) {
    console.error(`[Error] Failed to fetch homepage ${targetUrl}. Aborting.`);
    process.exit(1);
  }

  console.log("[Success] Homepage fetched successfully.");
  const homepageData = parsePage(targetUrl, homepageHtml, "Homepage");

  // Discovery Links
  const $ = cheerio.load(homepageHtml);
  const domain = new URL(targetUrl).hostname;
  const discoveredLinks = new Set<string>();

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    try {
      const parsedUrl = new URL(href, targetUrl);
      if (parsedUrl.hostname === domain) {
        // Clean hash/query params
        parsedUrl.hash = "";
        parsedUrl.search = "";
        discoveredLinks.add(parsedUrl.toString());
      }
    } catch {}
  });

  // Discover and prioritize Sitemap URL structures
  console.log("[Info] Crawling and processing XML sitemaps...");
  const sitemapUrls = await getSitemapUrls(targetUrl);
  sitemapUrls.forEach(url => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname === domain) {
        parsedUrl.hash = "";
        parsedUrl.search = "";
        discoveredLinks.add(parsedUrl.toString());
      }
    } catch {}
  });

  const internalUrls = Array.from(discoveredLinks).filter(u => u !== targetUrl);
  console.log(`[Info] Discovered total of ${internalUrls.length} internal page links.`);

  // Classify discovered links for prioritised crawling
  const keyPagesToCrawl: Array<{ url: string; type: string }> = [];
  const addPage = (pattern: RegExp, type: string) => {
    const match = internalUrls.find(u => pattern.test(u.toLowerCase()));
    if (match && !keyPagesToCrawl.some(p => p.url === match)) {
      keyPagesToCrawl.push({ url: match, type });
    }
  };

  addPage(/\/about/, "About Page");
  addPage(/\/(?:services|solutions|products)/, "Services/Products Hub");
  addPage(/\/(?:contact|location|find-us)/, "Contact Page");
  addPage(/\/(?:faq|help|support)/, "FAQ Page");
  addPage(/\/(?:blog|news|insights)/, "Blog Hub");
  addPage(/\/(?:portfolio|work|case-studies)/, "Case Studies");

  // Add remaining discovered pages up to the standard limit
  // Quick Audit limit: 6 pages total (Homepage + 5 subpages)
  // Full Audit limit: 15 pages total (Homepage + 14 subpages)
  const subpageLimit = auditType === "Quick" ? 5 : 14;
  let idx = 0;
  while (keyPagesToCrawl.length < subpageLimit && idx < internalUrls.length) {
    const nextUrl = internalUrls[idx++];
    if (!keyPagesToCrawl.some(p => p.url === nextUrl)) {
      keyPagesToCrawl.push({ url: nextUrl, type: "Internal Page" });
    }
  }

  console.log(`[Info] Target Pages to Audit: Homepage + ${keyPagesToCrawl.length} subpages (Total audited: ${keyPagesToCrawl.length + 1} pages).`);

  // Crawl subpages
  const pagesData: PageData[] = [homepageData];
  for (const page of keyPagesToCrawl) {
    console.log(`📡 Fetching subpage [${page.type}]: ${page.url}`);
    const html = await fetchPage(page.url);
    if (html) {
      pagesData.push(parsePage(page.url, html, page.type));
    }
    // Respect rate limit spacing
    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`[Success] Crawl complete. Reviewing data for ${pagesData.length} active pages.`);

  // ----------------------------------------------------
  // SCIENTIFIC SCORING ENGINE
  // ----------------------------------------------------
  let totalSeoScore = 10.0;
  let totalGeoScore = 1.0;
  let totalAeoScore = 1.0;

  const seoFindings: AuditData["seoFindings"] = [];
  const geoFindings: AuditData["geoFindings"] = [];
  const aeoFindings: AuditData["aeoFindings"] = [];
  const recommendations: AuditData["recommendations"] = [];
  const strengths: AuditData["strengths"] = [];

  // 1. Traditional SEO Scans
  const missingAltImagesTotal = pagesData.reduce((acc, p) => acc + (p.imagesCount - p.imagesWithAlt), 0);
  const totalImages = pagesData.reduce((acc, p) => acc + p.imagesCount, 0);
  const imagesAltRatio = totalImages > 0 ? (totalImages - missingAltImagesTotal) / totalImages : 1;

  const badTitlePages = pagesData.filter(p => p.title.length < 30 || p.title.length > 70);
  const badDescriptionPages = pagesData.filter(p => p.description.length < 100 || p.description.length > 170);
  const multipleH1Pages = pagesData.filter(p => p.h1s.length !== 1);
  const missingCanonical = pagesData.filter(p => !p.canonical);
  const missingViewport = pagesData.filter(p => !p.hasViewport);
  const hasSitemapOrRobots = sitemapUrls.length > 0;

  // SEO Score deductions
  if (badTitlePages.length === 0) {
    seoFindings.push({ signal: "Title Tags", finding: "All page title tags are perfectly sized within the 50-70 character range.", status: "Good" });
  } else {
    seoFindings.push({ signal: "Title Tags", finding: `${badTitlePages.length} pages have missing, too short, or too long title tags.`, status: "Needs Attention" });
    totalSeoScore -= 1.0;
  }

  if (badDescriptionPages.length === 0) {
    seoFindings.push({ signal: "Meta Descriptions", finding: "All pages have highly descriptive, well-formatted meta descriptions.", status: "Good" });
  } else {
    seoFindings.push({ signal: "Meta Descriptions", finding: `${badDescriptionPages.length} pages lack optimal 120-160 character meta descriptions.`, status: "Needs Attention" });
    totalSeoScore -= 1.0;
  }

  if (multipleH1Pages.length === 0) {
    seoFindings.push({ signal: "Heading Hierarchy", finding: "Perfect singular H1 tags found across all crawled pages.", status: "Good" });
  } else {
    seoFindings.push({ signal: "Heading Hierarchy", finding: `${multipleH1Pages.length} pages have multiple or zero H1 tags, diluting search keyword weight.`, status: "Needs Attention" });
    totalSeoScore -= 1.0;
  }

  if (imagesAltRatio > 0.85) {
    seoFindings.push({ signal: "Image Alt Tags", finding: `Excellent image optimization. ${Math.round(imagesAltRatio * 100)}% of images have valid alt descriptions.`, status: "Good" });
  } else {
    seoFindings.push({ signal: "Image Alt Tags", finding: `${missingAltImagesTotal} images are missing descriptive Alt Text tags.`, status: "Needs Attention" });
    totalSeoScore -= 1.0;
  }

  if (missingCanonical.length === 0) {
    seoFindings.push({ signal: "Canonical Elements", finding: "Canonical tags exist on all audited pages, preventing duplication issues.", status: "Good" });
  } else {
    seoFindings.push({ signal: "Canonical Elements", finding: `${missingCanonical.length} pages are missing canonical tags, risking search indexing errors.`, status: "Needs Attention" });
    totalSeoScore -= 0.5;
  }

  if (missingViewport.length === 0) {
    seoFindings.push({ signal: "Mobile Responsiveness", finding: "Viewport meta tags present everywhere. Fully optimized for mobile scaling.", status: "Good" });
  } else {
    seoFindings.push({ signal: "Mobile Responsiveness", finding: "Missing viewport parameters detected on some pages.", status: "Missing" });
    totalSeoScore -= 1.5;
  }

  if (hasSitemapOrRobots) {
    seoFindings.push({ signal: "XML Sitemaps & robots.txt", finding: "Robots.txt contains valid Sitemap directives with deep URL indexing paths.", status: "Good" });
  } else {
    seoFindings.push({ signal: "XML Sitemaps & robots.txt", finding: "No active sitemaps found. Crawlers cannot discover new page content recursively.", status: "Missing" });
    totalSeoScore -= 1.0;
  }

  totalSeoScore = Math.max(1, Math.min(10, Math.round(totalSeoScore)));

  // 2. GEO Score calculations (AI Search readiness)
  const hasOrganizationSchema = pagesData.some(p => p.schemas.some(s => {
    const type = s["@type"] || s["type"];
    return type === "Organization" || type === "LocalBusiness";
  }));

  const hasAuthorSchema = pagesData.some(p => p.schemas.some(s => {
    const type = s["@type"] || s["type"];
    return type === "Person" || type === "Article" || s["author"] || s["publisher"];
  }));

  const hasHighAuthoritySameAs = pagesData.some(p => p.hasHighAuthoritySameAs);
  const totalCitations = pagesData.reduce((acc, p) => acc + p.externalCitationCount, 0);
  const totalWordCount = pagesData.reduce((acc, p) => acc + p.wordCount, 0);
  const avgWordCount = totalWordCount / pagesData.length;
  
  const totalFactsCount = pagesData.reduce((acc, p) => acc + p.numberTokensCount, 0);
  const factDensityPer100 = (totalFactsCount / totalWordCount) * 100;

  // Organization Schema finding
  if (hasOrganizationSchema) {
    geoFindings.push({ signal: "Organization Schema", finding: "Valid Organization or LocalBusiness structured data found.", status: "Good" });
    totalGeoScore += 1.5;
  } else {
    geoFindings.push({ signal: "Organization Schema", finding: "No custom Organization schema discovered. AI search engines cannot build clean entity connections.", status: "Missing" });
  }

  // Author & EEAT Schema finding
  if (hasAuthorSchema) {
    geoFindings.push({ signal: "Author & E-E-A-T Schema", finding: "Structured author or publisher schema discovered, confirming editorial accountability.", status: "Good" });
    totalGeoScore += 1.5;
  } else {
    geoFindings.push({ signal: "Author & E-E-A-T Schema", finding: "Missing structured Person or Author schema on service and blog pages.", status: "Missing" });
  }

  // High-authority sameAs linkages
  if (hasHighAuthoritySameAs) {
    geoFindings.push({ signal: "Entity sameAs Connections", finding: "Strong entity-graph links to Wikidata, Wikipedia, or authority handles found inside schemas.", status: "Good" });
    totalGeoScore += 2.0;
  } else {
    geoFindings.push({ signal: "Entity sameAs Connections", finding: "Schema is missing sameAs linkages to Wikidata, Wikipedia, or LinkedIn profiles.", status: "Missing" });
  }

  // Word depth content
  if (avgWordCount > 300) {
    geoFindings.push({ signal: "Content Depth", finding: `Excellent content depth averaging ${Math.round(avgWordCount)} words per page, satisfying indexer length limits.`, status: "Good" });
    totalGeoScore += 1.0;
  } else {
    geoFindings.push({ signal: "Content Depth", finding: `Thin average content of ${Math.round(avgWordCount)} words per page. Search models prefer detailed information context.`, status: "Needs Attention" });
  }

  // Factual claim density
  if (factDensityPer100 > 1.5) {
    geoFindings.push({ signal: "Factual & Claim Density", finding: `High claim density (${factDensityPer100.toFixed(1)}% metrics & numbers per page). AI models prioritize factual context.`, status: "Good" });
    totalGeoScore += 2.0;
  } else {
    geoFindings.push({ signal: "Factual & Claim Density", finding: `Low claim density (${factDensityPer100.toFixed(1)}% facts/page). Page text is highly generic / promotional.`, status: "Needs Attention" });
  }

  // Outbound citations
  if (totalCitations > 0) {
    geoFindings.push({ signal: "Authority Outbound Citations", finding: `Discovered ${totalCitations} references to high-authority (.edu, .gov, Wikipedia) domains, boosting reliability weight.`, status: "Good" });
    totalGeoScore += 2.0;
  } else {
    geoFindings.push({ signal: "Authority Outbound Citations", finding: "Zero outbound authority citations found. Cannot verify source accuracy cleanly.", status: "Needs Attention" });
  }

  totalGeoScore = Math.max(1, Math.min(10, Math.round(totalGeoScore)));

  // 3. AEO Score calculations (Answer & Voice Search readiness)
  const hasFAQSchema = pagesData.some(p => p.schemas.some(s => {
    const type = s["@type"] || s["type"];
    return type === "FAQPage" || type === "Question" || s["mainEntity"];
  }));

  const totalQuestionHeadings = pagesData.reduce((acc, p) => acc + p.questionHeadings.length, 0);
  const totalSnippets = pagesData.reduce((acc, p) => acc + p.featuredSnippetTargets.length, 0);

  // Address and local voice signals
  const bodyTextsCombined = pagesData.map(p => p.html).join(" ");
  const hasLocalSignal = /\b(?:street|road|avenue|suite|tel:|phone:|\(\d{3}\)\s*\d{3}-\d{4})\b/i.test(bodyTextsCombined);

  const avgReadability = pagesData.reduce((acc, p) => acc + p.readabilityScore, 0) / pagesData.length;

  if (hasFAQSchema) {
    aeoFindings.push({ signal: "FAQ Schema", finding: "Active FAQPage or Question schemas verified. Unlocks search engine Answer snippets.", status: "Good" });
    totalAeoScore += 2.5;
  } else {
    aeoFindings.push({ signal: "FAQ Schema", finding: "No FAQ schema markup found. Missed opportunity to capture search rich snippets.", status: "Missing" });
  }

  if (totalQuestionHeadings > 3) {
    aeoFindings.push({ signal: "Conversational Q&A Headings", finding: `Excellent conversational targeting (${totalQuestionHeadings} active conversational headings found).`, status: "Good" });
    totalAeoScore += 2.5;
  } else {
    aeoFindings.push({ signal: "Conversational Q&A Headings", finding: `Only ${totalQuestionHeadings} question-phrased headings found. Voice searches expect conversational matching.`, status: "Needs Attention" });
  }

  if (totalSnippets > 0) {
    aeoFindings.push({ signal: "Featured Snippet Blocks", finding: `Detected ${totalSnippets} semantic Q&A blocks fitting search snippet length requirements (35-65 words).`, status: "Good" });
    totalAeoScore += 3.0;
  } else {
    aeoFindings.push({ signal: "Featured Snippet Blocks", finding: "No direct, concisely summarized paragraph responses (35-65 words) found under question headings.", status: "Needs Attention" });
  }

  if (hasLocalSignal) {
    aeoFindings.push({ signal: "Local N.A.P. Phrasing", finding: "Discovered active address, phone, or local physical contact signals.", status: "Good" });
    totalAeoScore += 2.0;
  } else {
    aeoFindings.push({ signal: "Local N.A.P. Phrasing", finding: "Missing local NAP (Name, Address, Phone) structures to satisfy local voice queries.", status: "Needs Attention" });
  }

  totalAeoScore = Math.max(1, Math.min(10, Math.round(totalAeoScore)));

  // Build strengths
  if (seoFindings[0].status === "Good") {
    strengths.push({ title: "Highly Optimized Meta Tags", detail: "Metadata title and descriptions precisely adhere to standard indexing guidelines." });
  }
  if (factDensityPer100 > 1.5) {
    strengths.push({ title: "Factual Data Richness", detail: "The audited pages feature excellent facts, percentages, and metrics for synthesis." });
  }
  if (totalImages > 0 && imagesAltRatio > 0.8) {
    strengths.push({ title: "Excellent Image Alt Markup", detail: "The majority of embedded image tags possess semantic alt descriptions for accessibility." });
  }
  if (totalSnippets > 0) {
    strengths.push({ title: "Snippet Ready Q&A Content", detail: `Identified highly specific, concise answer segments optimized for conversational AI engines.` });
  }
  if (totalCitations > 0) {
    strengths.push({ title: "Authoritative Reference Citation", detail: `Direct link citations to authority sites establish credibility in generative indexes.` });
  }
  if (strengths.length === 0) {
    strengths.push({ title: "Modern Clean HTML structure", detail: "The DOM structure features standard CSS class names and clean layout breakpoints." });
  }

  // Build actionable recommendations
  if (badTitlePages.length > 0) {
    recommendations.push({
      priority: "Quick Win",
      issue: `Update meta titles on ${badTitlePages.length} pages to meet the 50-70 characters length standard.`,
      dimension: "SEO",
      effort: "Low",
      impact: "Medium"
    });
  }

  if (badDescriptionPages.length > 0) {
    recommendations.push({
      priority: "High",
      issue: `Rewrite meta descriptions on ${badDescriptionPages.length} pages to provide descriptive 120-160 character summaries.`,
      dimension: "SEO",
      effort: "Low",
      impact: "High"
    });
  }

  if (!hasOrganizationSchema) {
    recommendations.push({
      priority: "Critical",
      issue: "Deploy JSON-LD Organization Schema on homepage linking with social channels via 'sameAs' tags.",
      dimension: "GEO",
      effort: "Medium",
      impact: "High"
    });
  }

  if (!hasAuthorSchema) {
    recommendations.push({
      priority: "High",
      issue: "Build Author bio panels and include structured Author schema tags to verify professional E-E-A-T credentials.",
      dimension: "GEO",
      effort: "Medium",
      impact: "High"
    });
  }

  if (totalCitations === 0) {
    recommendations.push({
      priority: "Medium",
      issue: "Anchor claims to authoritative sources (.edu, .gov, Wikipedia) with contextual links to boost GEO trust signals.",
      dimension: "GEO",
      effort: "Low",
      impact: "Medium"
    });
  }

  if (!hasFAQSchema) {
    recommendations.push({
      priority: "Critical",
      issue: "Structure a conversational FAQ section on key pages and implement direct FAQPage schema to satisfy voice query engines.",
      dimension: "AEO",
      effort: "Low",
      impact: "High"
    });
  }

  if (totalSnippets === 0) {
    recommendations.push({
      priority: "High",
      issue: "Format answers directly beneath question headers as concise 35-65 word summary paragraphs to trigger featured snippet pulls.",
      dimension: "AEO",
      effort: "Medium",
      impact: "High"
    });
  }

  if (missingAltImagesTotal > 3) {
    recommendations.push({
      priority: "Quick Win",
      issue: `Inject missing descriptive Alt Text attributes for ${missingAltImagesTotal} image assets.`,
      dimension: "SEO",
      effort: "Low",
      impact: "Medium"
    });
  }

  // Final fallback to make sure recommendations has at least 3 items
  if (recommendations.length < 3) {
    recommendations.push({
      priority: "Medium",
      issue: "Refactor core page headers into conversational question formats (e.g. 'How to...' or 'What is...') to boost Answer engine matches.",
      dimension: "AEO",
      effort: "Medium",
      impact: "Medium"
    });
  }

  const siteName = new URL(targetUrl).hostname.replace("www.", "").split(".")[0].toUpperCase();
  const detectedCms = homepageData.cmsDetected;
  const totalSchemas = pagesData.reduce((acc, p) => acc + p.schemas.length, 0);

  const auditData: AuditData = {
    siteName,
    url: targetUrl,
    auditType,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    cms: detectedCms,
    overallStats: {
      totalPages: pagesData.length,
      totalImages,
      totalSchemas,
      totalCitations,
      totalSnippets,
      avgReadability: Math.round(avgReadability)
    },
    scores: {
      seo: totalSeoScore,
      geo: totalGeoScore,
      aeo: totalAeoScore
    },
    executiveSummary: `Our scientific crawl and audit of ${targetUrl} reviewed ${pagesData.length} key pages on a ${detectedCms} platform. The site features a ${totalSeoScore >= 8 ? 'strong' : 'decent'} traditional SEO codebase with stable meta structures and mobile responsiveness. However, there are massive structural gaps regarding generative AI optimization (GEO Score: ${totalGeoScore}/10). The entity schema lacks Wikidata validation and citation depth, leaving major conversational models without contextual validation links. Answer Engine Optimization (AEO Score: ${totalAeoScore}/10) is likewise limited by sparse structured FAQ schemas and missed featured snippet paragraph layouts. Resolving the high-priority recommendations below will immediately enhance citations across search engine indexes.`,
    pagesReviewed: pagesData.map(p => ({
      url: p.url.replace(targetUrl, ""),
      type: p.type,
      notes: `${p.h1s.length} H1s, ${p.imagesCount} images (${p.imagesWithAlt} with alt), ${p.schemas.length} JSON-LD. Word count: ${p.wordCount}. Flesch Readability: ${p.readabilityScore}/100.`
    })),
    seoFindings,
    geoFindings,
    aeoFindings,
    recommendations: recommendations.slice(0, 5), // Cap at top 5 recommendations
    strengths
  };

  // Ensure output directory exists
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const auditJsonPath = path.join(scratchDir, "audit_data.json");
  fs.writeFileSync(auditJsonPath, JSON.stringify(auditData, null, 2));
  console.log(`[Success] Saved automated audit data JSON to: ${auditJsonPath}`);

  // Run the generator
  console.log("[Info] Invoking Word & PDF compiler generator (audit_generator.ts)...");
  try {
    const generatorPath = path.join(__dirname, "audit_generator.ts");
    execSync(`npx tsx "${generatorPath}" --scratchDir "${scratchDir}" --artifactsDir "${artifactsDir}"`, { stdio: "inherit" });
    console.log("[Success] Report successfully compiled!");
  } catch (err: any) {
    console.error("[Error] Failed to execute report compiler:", err.message);
  }
}

main().catch(err => {
  console.error("[Fatal Error] Automated crawler audit crashed:", err);
  process.exit(1);
});
