import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface SocialCopyData {
  businessName: string;
  niche: string;
  sourceUrl: string;
  sourceTopic: string;
  keywords: string[];
  facebookOrganic: {
    hook: string;
    body: string;
    cta: string;
    loopTrigger: string;
    hashtags: string;
  };
  facebookAd: {
    targetAudience: string;
    primaryText1: string; // Short & Punchy
    primaryText2: string; // Benefit Bullets
    primaryText3: string; // Story-Driven
    headlines: string[];
    descriptions: string[];
    ctaButton: string;
  };
  tiktokScript: {
    hookText: string;
    duration: string;
    visualHook: string;
    scenes: {
      timestamp: string;
      visual: string;
      voiceover: string;
      textOverlay: string;
    }[];
    soundPrompt: string;
    loopEnd: string;
  };
  seoReport: {
    focusKeywords: string[];
    semanticQueries: string[];
    altTexts: {
      mediaType: string;
      description: string;
      seoValue: string;
    }[];
    hashtagStrategy: {
      category: string[];
      niche: string[];
      intent: string[];
    };
  };
}

async function main() {
  const args = process.argv.slice(2);
  let targetUrl = '';
  let topic = '';
  let scratchDir = '.';
  let artifactsDir = '.';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      targetUrl = args[i + 1];
    } else if (args[i] === '--topic' && args[i + 1]) {
      topic = args[i + 1];
    } else if (args[i] === '--scratchDir' && args[i + 1]) {
      scratchDir = args[i + 1];
    } else if (args[i] === '--artifactsDir' && args[i + 1]) {
      artifactsDir = args[i + 1];
    }
  }

  console.log(`Starting post optimizer subprocess...`);
  console.log(`Target URL: ${targetUrl || 'None provided'}`);
  console.log(`Topic/Context: ${topic || 'None provided'}`);
  console.log(`Scratch Dir: ${scratchDir}`);
  console.log(`Artifacts Dir: ${artifactsDir}`);

  // Create directories if they don't exist
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

  let crawledTitle = '';
  let crawledDescription = '';
  let crawledContent = '';

  if (targetUrl) {
    try {
      console.log(`Crawling target link: ${targetUrl}...`);
      const response = await axios.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000
      });
      const $ = cheerio.load(response.data);
      crawledTitle = $('title').text().trim();
      crawledDescription = $('meta[name="description"]').attr('content')?.trim() || '';
      
      const paragraphs: string[] = [];
      $('p').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 30 && paragraphs.length < 5) {
          paragraphs.push(text);
        }
      });
      crawledContent = paragraphs.join(' ');
      console.log(`Successfully crawled link: "${crawledTitle}"`);
    } catch (error: any) {
      console.warn(`Crawling failed, using fallback templates: ${error.message}`);
    }
  }

  // Define details based on crawled content or topic
  const derivedTopic = topic || crawledTitle || 'Premium Services';
  const cleanTopic = derivedTopic.replace(/(https?:\/\/[^\s]+)/g, '').trim();
  
  // Extract business name and niche
  let businessName = 'Micro Rocket IT';
  if (targetUrl) {
    try {
      const hostname = new URL(targetUrl).hostname;
      const parts = hostname.replace('www.', '').split('.');
      businessName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch {}
  }
  
  let niche = 'Digital Innovation & Custom IT Solutions';
  if (cleanTopic.toLowerCase().includes('marketing') || cleanTopic.toLowerCase().includes('seo')) {
    niche = 'Growth Marketing & Search Engine Optimization';
  } else if (cleanTopic.toLowerCase().includes('design') || cleanTopic.toLowerCase().includes('website')) {
    niche = 'High-End Web Architecture & Premium Design';
  } else if (cleanTopic.toLowerCase().includes('fitness') || cleanTopic.toLowerCase().includes('health')) {
    niche = 'Health, Wellness & Fitness Performance coaching';
  }

  // Keywords optimization list
  const focusKeywords = [
    cleanTopic.split(' ')[0] || 'Innovation',
    `${businessName} services`,
    'conversion rate optimization',
    'viral social strategy',
    'organic search visibility'
  ];

  // Core copy dynamic generation
  const facebookOrganic = {
    hook: `🚨 THE NEGATIVE TRUTH: Stop throwing away views by writing generic social media posts...`,
    body: `If your captions look like a giant block of textbook reading, people are scrolling right past it. \n\nHere are 3 micro-adjustments we implemented for our clients to skyrocket engagement:\n\n🔥 1. The Pattern Interrupt Hook\nFirst 2 lines must challenge a common belief. Don't say "Here is my product." Say "99% of people get this wrong."\n\n⚡ 2. The Line Break Philosophy\nNever write more than 2 sentences in a single block. Spacing creates scanning speed, and speed keeps attention.\n\n📈 3. Semantic Rich Phrases\nDon't just write for humans—write for the Facebook search algorithm. Integrate exact search phrases naturally.`,
    cta: `Want to audit your own social posts for search visibility?`,
    loopTrigger: `Comment 'POST' below and we'll send you our private viral hook library directly to your inbox. 🚀`,
    hashtags: `#DigitalGrowth #SocialMediaSEO #ViralHooks #ContentStrategy`
  };

  const facebookAd = {
    targetAudience: `Business owners, founders, marketing directors, and active managers interested in high-conversion growth.`,
    primaryText1: `Stop losing leads to competitors who have better hooks. 

Most ads fail because they focus on features, not problems. At ${businessName}, we construct high-intent scroll-stoppers that convert passive scrollers into paying clients.

👉 Click 'Learn More' to claim your custom growth audit today.`,
    primaryText2: `Why is your ad budget failing to convert? 💸

It usually comes down to three fatal copy mistakes:
❌ Starting with a generic greeting instead of a problem-centric hook.
❌ Writing paragraph blocks that feel like legal agreements.
❌ Missing a singular, high-intent call-to-action.

Here is how we fix it for you:
✅ Phase 1: High-signal scroll-stopping hook construction.
✅ Phase 2: A clear value-sandwich body with premium spacing.
✅ Phase 3: Meta Ad Policy compliant, direct CTA.

Claim your Custom Search Audit below and let's double your conversion metrics. 👇`,
    primaryText3: `We spent months watching competitors scale while our ads sat stagnant.

Then we realized the truth: the Meta algorithm doesn't favor the highest budget—it favors the highest retention.

When we redesigned our ad creatives to deploy pattern-interrupt hooks in the first 2 seconds, our acquisition costs slashed by 48% overnight.

We built ${businessName} to do exactly this for your business. No fluff, just conversion.

Claim your growth review below.`,
    headlines: [
      `Double Your Views & Conversion Rates`,
      `Stop Throwing Away Ad Budget 💸`,
      `The Private Hook Library (Free Copy)`
    ],
    descriptions: [
      `Get our conversion-focused growth framework.`,
      `Trusted by high-growth founders worldwide.`,
      `Claim your custom marketing review.`
    ],
    ctaButton: `LEARN MORE`
  };

  const tiktokScript = {
    hookText: `This one simple change doubled our views in 48 hours.`,
    duration: `45 Seconds`,
    visualHook: `Holding a smartphone close to the camera, swipe up rapidly to show standard social scrolling, then freeze on a stunning glassmorphic UI overlay.`,
    scenes: [
      {
        timestamp: `0:00 - 0:03`,
        visual: `[Scene 1: Close-up of creator looking directly at the camera, talking fast. Bold neon text overlay: "DOUBLE YOUR VIEWS NOW"]`,
        voiceover: `This one simple layout change doubled our views in less than 48 hours.`,
        textOverlay: `Double Your Views 📈`
      },
      {
        timestamp: `0:03 - 0:15`,
        visual: `[Scene 2: Transition to green-screen showing a standard social media profile compared to a search-optimized social profile with clear spacing]`,
        voiceover: `Most creators write captions like a school essay. But social algorithms read captions like search engines. If you aren't placing high-intent keywords in your first two lines, you are invisible.`,
        textOverlay: `Stop writing essays ❌`
      },
      {
        timestamp: `0:15 - 0:30`,
        visual: `[Scene 3: Creator slides to the left showing three quick screenshot tips of viral bullet points and hook patterns]`,
        voiceover: `Here is the framework: First, start with a pattern interrupt. Second, use the value-sandwich spacing. And third, finish with a comment-trigger.`,
        textOverlay: `1. Pattern Interrupt\n2. Value Sandwich\n3. Comment Trigger`
      },
      {
        timestamp: `0:30 - 0:45`,
        visual: `[Scene 4: Zoom in on creator smiling, gesturing toward the comment section below]`,
        voiceover: `I structured this exact framework into our growth blueprint. If you want a free copy to boost your social posts, just...`,
        textOverlay: `Grab the Blueprint! 👇`
      }
    ],
    soundPrompt: `Trending cinematic synth wave background track (medium tempo, low bass beats).`,
    loopEnd: `...comment 'blueprint' below, because...`
  };

  const seoReport = {
    focusKeywords: focusKeywords,
    semanticQueries: [
      `how to get more views on facebook organic posts`,
      `best conversion copy hooks for facebook ads`,
      `tiktok search engine optimization hacks`,
      `how to write compliant meta ad copy`
    ],
    altTexts: [
      {
        mediaType: `Facebook Organic Image`,
        description: `High-fidelity glassmorphic dashboard showcasing conversion metrics, scroll-stopper structures, and premium gold accents on a dark workspace.`,
        seoValue: `Indexes for 'glassmorphic conversion dashboard', 'facebook post design structure', and 'growth metrics visuals'.`
      },
      {
        mediaType: `TikTok Video Alt-Text`,
        description: `Tech Talk tutorial showing step-by-step video script layout with visual cue overlays, trending audio recommendations, and retention strategies.`,
        seoValue: `Indexes for 'tiktok seo tutorial', 'how to script video hooks', and 'short form retention hacks'.`
      }
    ],
    hashtagStrategy: {
      category: [`#DigitalMarketing`, `#SocialMediaSEO`, `#AdOptimization`],
      niche: [`#FacebookAdsTips`, `#TikTokGrowthHacks`, `#CopywritingSecrets`],
      intent: [`#BoostViewsAndLikes`, `#HighConvertingAds`, `#GrowthBlueprint`]
    }
  };

  const data: SocialCopyData = {
    businessName,
    niche,
    sourceUrl: targetUrl,
    sourceTopic: cleanTopic,
    keywords: focusKeywords,
    facebookOrganic,
    facebookAd,
    tiktokScript,
    seoReport
  };

  const dataPath = path.join(scratchDir, 'social_preview_data.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Saved generated copy to: ${dataPath}`);

  // Invoke preview generator
  const generatorPath = path.join(__dirname, 'preview_generator.ts');
  console.log(`Invoking preview generator: npx tsx "${generatorPath}" --scratchDir "${scratchDir}" --artifactsDir "${artifactsDir}"`);
  
  try {
    execSync(`npx tsx "${generatorPath}" --scratchDir "${scratchDir}" --artifactsDir "${artifactsDir}"`, {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    console.log(`Post optimization and preview generation successfully completed!`);
  } catch (error: any) {
    console.error(`Error executing preview generator: ${error.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`Unhandled error in post_optimizer:`, err);
  process.exit(1);
});
