import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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
    primaryText1: string;
    primaryText2: string;
    primaryText3: string;
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

function main() {
  const args = process.argv.slice(2);
  let scratchDir = '.';
  let artifactsDir = '.';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--scratchDir' && args[i + 1]) {
      scratchDir = args[i + 1];
    } else if (args[i] === '--artifactsDir' && args[i + 1]) {
      artifactsDir = args[i + 1];
    }
  }

  const dataPath = path.join(scratchDir, 'social_preview_data.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`Error: social_preview_data.json not found at ${dataPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data: SocialCopyData = JSON.parse(rawData);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.businessName} - Viral & SEO Social Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #f59e0b;
      --primary-hover: #d97706;
      --primary-glow: rgba(245, 158, 11, 0.25);
      --bg-dark: #080c14;
      --card-bg: rgba(13, 20, 35, 0.7);
      --card-border: rgba(245, 158, 11, 0.15);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --success: #10b981;
      --error: #ef4444;
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      scrollbar-width: thin;
      scrollbar-color: var(--primary) var(--bg-dark);
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.03) 0%, transparent 40%);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
      line-height: 1.6;
    }

    h1, h2, h3, h4 {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
    }

    /* Container */
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Header */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 1.5rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-logo {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, var(--primary), #ef4444);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.25rem;
      color: #000;
      box-shadow: 0 0 20px var(--primary-glow);
    }

    .brand h1 {
      font-size: 1.75rem;
      background: linear-gradient(to right, #ffffff, var(--primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand span {
      display: block;
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: -2px;
    }

    .badge-premium {
      background: linear-gradient(to right, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.1));
      border: 1px solid var(--primary);
      padding: 0.4rem 1rem;
      border-radius: 30px;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 0 15px rgba(245, 158, 11, 0.1);
    }

    /* Dashboard Layout */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2.5rem;
    }

    /* Sidebar Navigation */
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .nav-btn {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
      padding: 1rem 1.25rem;
      border-radius: 12px;
      text-align: left;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: var(--transition);
    }

    .nav-btn:hover {
      background: rgba(245, 158, 11, 0.05);
      color: #fff;
      border-color: rgba(245, 158, 11, 0.3);
    }

    .nav-btn.active {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
      color: var(--primary);
      border-color: var(--primary);
      box-shadow: inset 0 0 10px rgba(245, 158, 11, 0.05);
    }

    .nav-btn svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    /* Content Area */
    .content-area {
      min-height: 600px;
    }

    .panel {
      display: none;
      animation: fadeIn 0.4s ease-out forwards;
    }

    .panel.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Mockup Container */
    .mockup-container {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 2.5rem;
      align-items: start;
    }

    @media (max-width: 1024px) {
      .mockup-container {
        grid-template-columns: 1fr;
      }
    }

    /* Visual Mockups */
    .visual-wrapper {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      position: relative;
      overflow: hidden;
    }

    .visual-wrapper::before {
      content: '';
      position: absolute;
      width: 150px;
      height: 150px;
      background: var(--primary-glow);
      filter: blur(80px);
      top: -50px;
      right: -50px;
      z-index: 0;
    }

    /* Copy cards list */
    .copy-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      z-index: 1;
    }

    .copy-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 1.5rem;
      position: relative;
    }

    .copy-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .copy-card-title {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--primary);
      font-weight: 700;
    }

    .btn-copy {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      padding: 0.3rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
    }

    .btn-copy:hover {
      background: var(--primary);
      color: #000;
      border-color: var(--primary);
    }

    .copy-box {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.03);
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      white-space: pre-wrap;
      color: #e5e7eb;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* TikTok Smartphone Mockup */
    .phone-frame {
      width: 320px;
      height: 640px;
      background: #000;
      border: 12px solid #1f2937;
      border-radius: 36px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .phone-notch {
      width: 140px;
      height: 18px;
      background: #1f2937;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
    }

    .tiktok-screen {
      flex: 1;
      background: linear-gradient(180deg, #111 0%, #1e1b4b 100%);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1rem;
      z-index: 1;
    }

    .tiktok-screen::before {
      content: '⚡';
      position: absolute;
      top: 35%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 4rem;
      opacity: 0.15;
      animation: float 4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translate(-50%, -50%) translateY(0); }
      50% { transform: translate(-50%, -50%) translateY(-10px); }
    }

    .tiktok-overlay-text {
      background: rgba(245, 158, 11, 0.9);
      color: #000;
      font-weight: 800;
      font-size: 0.95rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      position: absolute;
      top: 100px;
      left: 1rem;
      right: 1rem;
      text-align: center;
      text-transform: uppercase;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
      font-family: 'Outfit', sans-serif;
    }

    .tiktok-creator {
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      color: #fff;
    }

    .tiktok-caption {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.9);
      margin-bottom: 0.5rem;
    }

    .tiktok-tags {
      font-size: 0.72rem;
      color: #38bdf8;
      font-weight: 600;
    }

    .tiktok-music {
      font-size: 0.7rem;
      color: rgba(255,255,255,0.7);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-top: 0.5rem;
    }

    .tiktok-right-bar {
      position: absolute;
      right: 0.5rem;
      bottom: 6rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
    }

    .tiktok-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 600;
    }

    .tiktok-icon-btn {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      margin-bottom: 0.2rem;
    }

    .tiktok-icon-btn.primary {
      background: var(--primary);
      color: #000;
    }

    /* Facebook Mockup */
    .fb-post-mockup {
      width: 100%;
      max-width: 480px;
      background: #18191a;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem;
      font-family: Arial, sans-serif;
    }

    .fb-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .fb-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), #ef4444);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #000;
      font-size: 0.95rem;
    }

    .fb-header-info {
      flex: 1;
    }

    .fb-name {
      font-size: 0.92rem;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .fb-verified {
      width: 14px;
      height: 14px;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: #000;
    }

    .fb-meta {
      font-size: 0.75rem;
      color: #b0b3b8;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .fb-caption {
      font-size: 0.9rem;
      color: #e4e6eb;
      white-space: pre-wrap;
      margin-bottom: 1rem;
      line-height: 1.45;
    }

    .fb-media-frame {
      border: 1px solid rgba(255, 255, 255, 0.05);
      background: linear-gradient(135deg, #1f2937, #111827);
      border-radius: 8px;
      height: 240px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .fb-media-frame::before {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      background: var(--primary-glow);
      filter: blur(70px);
    }

    .fb-media-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
      z-index: 1;
      margin-bottom: 0.5rem;
    }

    .fb-media-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      z-index: 1;
    }

    .fb-cta-btn {
      width: calc(100% - 2rem);
      background: var(--primary);
      color: #000;
      font-weight: 700;
      border: none;
      padding: 0.6rem;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      position: absolute;
      bottom: 1rem;
      z-index: 1;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .fb-actions {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.5rem 0;
      display: flex;
      justify-content: space-around;
      color: #b0b3b8;
      font-size: 0.8rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .fb-action-btn {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .fb-action-btn:hover {
      color: var(--primary);
    }

    /* Tabs inside Panel */
    .tab-bar {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      background: rgba(0, 0, 0, 0.2);
      padding: 0.4rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .tab-item {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .tab-item.active {
      background: var(--primary);
      color: #000;
    }

    /* SEO Matrix Grid */
    .seo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .seo-grid {
        grid-template-columns: 1fr;
      }
    }

    .seo-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .seo-card h3 {
      font-size: 1.1rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 0.5rem;
      color: var(--primary);
    }

    .tag-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .pill {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.25);
      color: #fca5a5;
      padding: 0.25rem 0.75rem;
      border-radius: 30px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .pill.keyword {
      color: #fbbf24;
    }

    .pill.query {
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.08);
      border-color: rgba(56, 189, 248, 0.25);
    }

    .alt-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .alt-item {
      background: rgba(0, 0, 0, 0.2);
      border-left: 3px solid var(--primary);
      padding: 0.75rem 1rem;
      border-radius: 0 8px 8px 0;
    }

    .alt-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.25rem;
    }

    .alt-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .alt-val {
      font-size: 0.75rem;
      color: var(--success);
      margin-top: 0.25rem;
      font-style: italic;
    }

    /* TikTok Script Details */
    .script-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .script-item {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255,255,255,0.03);
      padding: 1.25rem;
      border-radius: 12px;
      border-left: 4px solid var(--primary);
    }

    .script-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .script-visual {
      font-size: 0.82rem;
      color: #f87171;
      font-style: italic;
      margin-bottom: 0.5rem;
    }

    .script-vo {
      font-size: 0.9rem;
      color: #e5e7eb;
      background: rgba(255, 255, 255, 0.02);
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.02);
    }

    .script-overlay {
      font-size: 0.78rem;
      color: var(--success);
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 600;
    }

    /* Clipboard toast */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--success);
      color: #000;
      font-weight: 700;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
      transform: translateY(100px);
      opacity: 0;
      transition: var(--transition);
      z-index: 1000;
    }

    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="brand-logo">🚀</div>
        <div>
          <h1>${data.businessName}</h1>
          <span>Growth Optimizer</span>
        </div>
      </div>
      <div class="badge-premium">
        👑 Search & Growth Dashboard
      </div>
    </header>

    <div class="dashboard-grid">
      <div class="sidebar">
        <button class="nav-btn active" onclick="showPanel('tiktok')">
          <svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.2 1.23 1.37 2.95 2.21 4.74 2.45v3.8c-1.39-.08-2.74-.59-3.87-1.43-.88-.67-1.57-1.57-2.03-2.61v8.27c.05 1.63-.4 3.25-1.31 4.59-1.28 1.83-3.32 2.99-5.55 3.19-2.64.22-5.32-.71-7.05-2.73C1.19 17.84.44 14.86.99 12c.54-2.85 2.49-5.32 5.17-6.52 1.15-.51 2.41-.75 3.67-.71v3.91c-.88-.06-1.78.13-2.55.59-1.28.77-2.07 2.23-2.08 3.73-.02 1.67.92 3.21 2.4 3.96 1.18.59 2.59.57 3.75-.08.82-.46 1.41-1.25 1.64-2.18.09-.54.08-1.09.08-1.63V.02h-.05z"/></svg>
          TikTok Video Script
        </button>
        <button class="nav-btn" onclick="showPanel('fb-organic')">
          <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook Organic Post
        </button>
        <button class="nav-btn" onclick="showPanel('fb-ad')">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.09 13.91V18h-2.18v-2.09c-1.39-.07-2.61-.83-3.21-2.03l1.83-1.03c.36.75.98 1.16 1.64 1.16.83 0 1.36-.45 1.36-1.34 0-.82-.67-1.12-1.84-1.63-1.32-.57-2.74-1.28-2.74-3.2 0-1.74 1.25-2.82 2.74-3.06V3h2.18v2.09c1.17.06 2.19.68 2.76 1.63l-1.83 1.03c-.32-.57-.82-.87-1.36-.87-.72 0-1.26.39-1.26 1.15 0 .76.54 1.04 1.67 1.54 1.48.64 2.91 1.4 2.91 3.32 0 1.94-1.36 2.87-2.91 3.02z"/></svg>
          Facebook Sponsored Ad
        </button>
        <button class="nav-btn" onclick="showPanel('seo')">
          <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          Search & SEO Matrix
        </button>
      </div>

      <div class="content-area">
        <!-- Panel 1: TikTok Script -->
        <div id="panel-tiktok" class="panel active">
          <div class="mockup-container">
            <div class="visual-wrapper">
              <div class="phone-frame">
                <div class="phone-notch"></div>
                <div class="tiktok-screen">
                  <div class="tiktok-overlay-text">${data.tiktokScript.hookText}</div>
                  <div class="tiktok-creator">@microrocket_it</div>
                  <div class="tiktok-caption">Here is the framework that doubled our views overnight. 🤫</div>
                  <div class="tiktok-tags">#TikTokSEO #GrowthHacks #AdOptimizer</div>
                  <div class="tiktok-music">🎵 Original Audio - microrocket_it</div>
                  
                  <div class="tiktok-right-bar">
                    <div class="tiktok-action">
                      <div class="tiktok-icon-btn primary">🔥</div>
                      <span>42.8K</span>
                    </div>
                    <div class="tiktok-action">
                      <div class="tiktok-icon-btn">💬</div>
                      <span>2.4K</span>
                    </div>
                    <div class="tiktok-action">
                      <div class="tiktok-icon-btn">⭐</div>
                      <span>9.1K</span>
                    </div>
                    <div class="tiktok-action">
                      <div class="tiktok-icon-btn">🔗</div>
                      <span>Share</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="copy-details">
              <div class="copy-card">
                <div class="copy-card-header">
                  <span class="copy-card-title">TikTok Script Details (${data.tiktokScript.duration})</span>
                  <button class="btn-copy" onclick="copyText('tiktok-script-full')">Copy Full Script</button>
                </div>
                <div id="tiktok-script-full" style="display:none;">${data.tiktokScript.scenes.map(s => `${s.timestamp}\n[Visual]: ${s.visual}\n[Voiceover]: ${s.voiceover}\n[Overlay]: ${s.textOverlay}`).join('\n\n')}</div>
                
                <div class="script-list">
                  ${data.tiktokScript.scenes.map(s => `
                    <div class="script-item">
                      <div class="script-header">
                        <span>Timestamp: ${s.timestamp}</span>
                        <span>Overlay Text</span>
                      </div>
                      <div class="script-visual">${s.visual}</div>
                      <div class="script-vo">🎙️ ${s.voiceover}</div>
                      <div class="script-overlay">✨ Overlay: "${s.textOverlay}"</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel 2: Facebook Organic -->
        <div id="panel-fb-organic" class="panel">
          <div class="mockup-container">
            <div class="visual-wrapper">
              <div class="fb-post-mockup">
                <div class="fb-header">
                  <div class="fb-avatar">🚀</div>
                  <div class="fb-header-info">
                    <div class="fb-name">${data.businessName} <span class="fb-verified">✓</span></div>
                    <div class="fb-meta">Just now · 🌎</div>
                  </div>
                </div>
                <div class="fb-caption">${data.facebookOrganic.hook}\n\n${data.facebookOrganic.body}\n\n${data.facebookOrganic.cta}\n\n${data.facebookOrganic.loopTrigger}\n\n${data.facebookOrganic.hashtags}</div>
                <div class="fb-actions">
                  <div class="fb-action-btn">👍 Like</div>
                  <div class="fb-action-btn">💬 Comment</div>
                  <div class="fb-action-btn">➡️ Share</div>
                </div>
              </div>
            </div>

            <div class="copy-details">
              <div class="copy-card">
                <div class="copy-card-header">
                  <span class="copy-card-title">Organic Post Copy</span>
                  <button class="btn-copy" onclick="copyText('fb-organic-copy')">Copy Post</button>
                </div>
                <div id="fb-organic-copy" class="copy-box">${data.facebookOrganic.hook}\n\n${data.facebookOrganic.body}\n\n${data.facebookOrganic.cta}\n\n${data.facebookOrganic.loopTrigger}\n\n${data.facebookOrganic.hashtags}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel 3: Facebook Sponsored Ad -->
        <div id="panel-fb-ad" class="panel">
          <div class="mockup-container">
            <div class="visual-wrapper">
              <div class="fb-post-mockup">
                <div class="fb-header">
                  <div class="fb-avatar">🚀</div>
                  <div class="fb-header-info">
                    <div class="fb-name">${data.businessName} <span class="fb-verified">✓</span></div>
                    <div class="fb-meta">Sponsored · 🌎</div>
                  </div>
                </div>
                <div id="fb-ad-primary-preview" class="fb-caption">${data.facebookAd.primaryText1}</div>
                <div class="fb-media-frame">
                  <div class="fb-media-title" id="fb-ad-headline-preview">${data.facebookAd.headlines[0]}</div>
                  <div class="fb-media-desc" id="fb-ad-desc-preview">${data.facebookAd.descriptions[0]}</div>
                  <button class="fb-cta-btn">${data.facebookAd.ctaButton}</button>
                </div>
                <div class="fb-actions">
                  <div class="fb-action-btn">👍 Like</div>
                  <div class="fb-action-btn">💬 Comment</div>
                  <div class="fb-action-btn">➡️ Share</div>
                </div>
              </div>
            </div>

            <div class="copy-details">
              <div class="tab-bar">
                <button class="tab-item active" onclick="switchAdTab(1)">Punchy Ad</button>
                <button class="tab-item" onclick="switchAdTab(2)">Bullet Ad</button>
                <button class="tab-item" onclick="switchAdTab(3)">Story Ad</button>
              </div>

              <div class="copy-card">
                <div class="copy-card-header">
                  <span class="copy-card-title">Ad Target Audience & Parameters</span>
                </div>
                <div class="copy-box" style="font-size: 0.85rem; color: var(--primary);">${data.facebookAd.targetAudience}</div>
              </div>

              <div class="copy-card">
                <div class="copy-card-header">
                  <span class="copy-card-title">Primary Text (Current Option)</span>
                  <button class="btn-copy" id="btn-copy-ad" onclick="copyText('fb-ad-primary-option-1')">Copy Text</button>
                </div>
                <div id="fb-ad-primary-option-1" class="copy-box">${data.facebookAd.primaryText1}</div>
                <div id="fb-ad-primary-option-2" style="display:none;">${data.facebookAd.primaryText2}</div>
                <div id="fb-ad-primary-option-3" style="display:none;">${data.facebookAd.primaryText3}</div>
              </div>

              <div class="copy-card">
                <div class="copy-card-header">
                  <span class="copy-card-title">Headlines & Descriptions</span>
                </div>
                <div class="alt-list">
                  ${data.facebookAd.headlines.map((hl, i) => `
                    <div class="alt-item" onclick="switchAdMeta(${i})">
                      <div class="alt-title">Option ${i+1} (Click to preview)</div>
                      <div class="alt-desc" style="font-weight: 700;">H: "${hl}"</div>
                      <div class="alt-desc">D: "${data.facebookAd.descriptions[i]}"</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel 4: SEO Matrix -->
        <div id="panel-seo" class="panel">
          <div class="seo-grid">
            <div class="seo-card">
              <h3>🔑 Focus & Semantic Keywords</h3>
              <p style="font-size:0.85rem; color:var(--text-muted);">These high-intent search terms are integrated naturally to index the posts in search algorithms:</p>
              <div class="tag-container">
                ${data.seoReport.focusKeywords.map(k => `<span class="pill keyword">${k}</span>`).join('')}
              </div>
              
              <h3 style="margin-top: 1rem;">💬 Semantic Queries</h3>
              <p style="font-size:0.85rem; color:var(--text-muted);">Common user search queries targeted inside text layers and script topics:</p>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${data.seoReport.semanticQueries.map(q => `<div class="pill query">${q}</div>`).join('')}
              </div>
            </div>

            <div class="seo-card">
              <h3>🖼️ Image & Video Alt-Text Map</h3>
              <p style="font-size:0.85rem; color:var(--text-muted);">Set these alt-texts during publication to allow standard image spiders to index your social media assets:</p>
              <div class="alt-list">
                ${data.seoReport.altTexts.map(alt => `
                  <div class="alt-item">
                    <div class="alt-title">${alt.mediaType}</div>
                    <div class="alt-desc">"${alt.description}"</div>
                    <div class="alt-val">🚀 SEO Target: ${alt.seoValue}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="seo-card" style="grid-column: span 2;">
              <h3>📈 3-Tier Hashtag Map</h3>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 0.5rem;">The ultimate combination of broad category reach, niche specificity, and high-intent conversion queries:</p>
              
              <div class="alt-list" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div class="alt-item">
                  <div class="alt-title">Tier 1: Broad Category</div>
                  <div class="tag-container" style="margin-top: 0.5rem;">
                    ${data.seoReport.hashtagStrategy.category.map(h => `<span class="pill" style="color:#fb7185; border-color:#fda4af; background:rgba(253,164,175,0.08);">${h}</span>`).join('')}
                  </div>
                </div>
                <div class="alt-item">
                  <div class="alt-title">Tier 2: Targeted Niche</div>
                  <div class="tag-container" style="margin-top: 0.5rem;">
                    ${data.seoReport.hashtagStrategy.niche.map(h => `<span class="pill" style="color:#60a5fa; border-color:#93c5fd; background:rgba(147,197,253,0.08);">${h}</span>`).join('')}
                  </div>
                </div>
                <div class="alt-item">
                  <div class="alt-title">Tier 3: Conversion Intent</div>
                  <div class="tag-container" style="margin-top: 0.5rem;">
                    ${data.seoReport.hashtagStrategy.intent.map(h => `<span class="pill" style="color:#34d399; border-color:#6ee7b7; background:rgba(110,231,183,0.08);">${h}</span>`).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="toast-notify" class="toast">Copy Success! Clipboard Updated.</div>

  <script>
    function showPanel(panelId) {
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      
      const targetPanel = document.getElementById('panel-' + panelId);
      if (targetPanel) targetPanel.classList.add('active');
      
      const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.outerHTML.includes(panelId));
      if (activeBtn) activeBtn.classList.add('active');
    }

    function copyText(elementId) {
      const el = document.getElementById(elementId);
      const textToCopy = el.innerText || el.textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        const toast = document.getElementById('toast-notify');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      });
    }

    function switchAdTab(optionNum) {
      document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
      const activeTab = event.target;
      activeTab.classList.add('active');

      const text1 = document.getElementById('fb-ad-primary-option-1');
      const text2 = document.getElementById('fb-ad-primary-option-2');
      const text3 = document.getElementById('fb-ad-primary-option-3');
      
      let copyValue = '';
      if (optionNum === 1) {
        copyValue = text1.textContent;
        document.getElementById('btn-copy-ad').setAttribute('onclick', "copyText('fb-ad-primary-option-1')");
      } else if (optionNum === 2) {
        copyValue = text2.textContent;
        document.getElementById('btn-copy-ad').setAttribute('onclick', "copyText('fb-ad-primary-option-2')");
      } else {
        copyValue = text3.textContent;
        document.getElementById('btn-copy-ad').setAttribute('onclick', "copyText('fb-ad-primary-option-3')");
      }

      document.getElementById('fb-ad-primary-preview').innerText = copyValue;
    }

    function switchAdMeta(index) {
      const headlines = ${JSON.stringify(data.facebookAd.headlines)};
      const descriptions = ${JSON.stringify(data.facebookAd.descriptions)};
      
      document.getElementById('fb-ad-headline-preview').innerText = headlines[index];
      document.getElementById('fb-ad-desc-preview').innerText = descriptions[index];
    }
  </script>
</body>
</html>`;

  const htmlPath = path.join(artifactsDir, 'social-preview.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log(`Successfully generated interactive glassmorphic dashboard at: ${htmlPath}`);

  // Convert to PDF using Headless Chrome
  const pdfPath = path.join(artifactsDir, 'social-preview-cheat-sheet.pdf');
  const chromePath = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`;

  console.log(`Starting headless Chrome print conversion to PDF...`);
  try {
    const cmd = `${chromePath} --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;
    console.log(`Executing print command: ${cmd}`);
    execSync(cmd);
    console.log(`Print successful! PDF saved to: ${pdfPath}`);
  } catch (error: any) {
    console.error(`Headless Chrome PDF print failed: ${error.message}`);
  }
}

main();
