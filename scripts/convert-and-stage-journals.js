#!/usr/bin/env node
/**
 * convert-and-stage-journals.js
 * 
 * Parses pristine HTML articles from daxini.xyz/articles/_backup/
 * and generates:
 * 1. Markdown files with YAML front-matter in viadecide/content/articles/
 * 2. Standalone snap-scroll HTML pages using ViaDecide styling in viadecide/articles/
 * 3. Central catalog entries in viadecide/data/articles.json
 * 
 * Finally compiles/stages them to viadecide.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories
const WORKSPACE_DIR  = path.join(__dirname, '..');
const DAXINI_DIR     = path.join(WORKSPACE_DIR, '../daxini.xyz');
const BACKUP_DIR     = path.join(DAXINI_DIR, 'articles', '_backup');

const OUT_MD_DIR     = path.join(WORKSPACE_DIR, 'content', 'articles');
const OUT_HTML_DIR   = path.join(WORKSPACE_DIR, 'articles');
const OUT_JSON_FILE  = path.join(WORKSPACE_DIR, 'data', 'articles.json');

// Ensure output directories exist
fs.mkdirSync(OUT_MD_DIR, { recursive: true });
fs.mkdirSync(OUT_HTML_DIR, { recursive: true });

// Check translations directory
const TRANSLATIONS_DIR = path.join(DAXINI_DIR, 'data', 'translations');

// ─────────── HELPERS ───────────
function extractMeta(html, name) {
  const re = new RegExp(`<meta\\s+(?:name|property)=["']${name}["']\\s+content=["']([^"']*?)["']`, 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta\\s+content=["']([^"']*?)["']\\s+(?:name|property)=["']${name}["']`, 'i');
  const m2 = html.match(re2);
  return m2 ? m2[1] : '';
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function escapeJS(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Try fallback regex parsing for "Month DD, YYYY"
    const m = dateStr.match(/(\w+)\s+(\d{1,2}),\s+(\d{4})/);
    if (m) {
      const months = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const monthIdx = months[m[1].toLowerCase().substring(0, 3)];
      if (monthIdx !== undefined) {
        const pd = new Date(parseInt(m[3]), monthIdx, parseInt(m[2]));
        if (!isNaN(pd.getTime())) return pd.toISOString().split('T')[0];
      }
    }
    return new Date().toISOString().split('T')[0];
  }
  return d.toISOString().split('T')[0];
}

function getConcepts(title, tags) {
  const words = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/[\s-]/);
  const concepts = new Set(tags.map(t => t.toLowerCase()));
  const stopWords = ['with', 'your', 'about', 'from', 'this', 'that', 'they', 'here', 'what', 'does', 'how', 'why', 'who', 'when', 'where', 'whom', 'whose'];
  words.forEach(w => {
    if (w.length > 3 && !stopWords.includes(w)) {
      concepts.add(w);
    }
  });
  return Array.from(concepts);
}

// Translate Simulator fallback
const HINDI_MAP = {
  "The Cost of Shared State: Why Institutional Ownership Requires Expensive Coordination": "साझा स्थिति की लागत: क्यों संस्थागत स्वामित्व के लिए महंगे समन्वय की आवश्यकता होती है",
  "Workspace Pollution: Why Long-Running Agents Slowly Destroy Their Own Environments": "कार्यक्षेत्र प्रदूषण: लंबे समय तक चलने वाले एजेंट धीरे-धीरे अपने वातावरण को क्यों नष्ट कर देते हैं",
  "You Can Have Speed or Determinism: The Parallel Execution Paradox": "आपके पास गति हो सकती है या निर्धारणवाद: समानांतर निष्पादन विरोधाभास",
  "Branch Legibility: Why Abstract Codebases Stop Being Computable": "शाखा सुपाठ्यता: क्यों अमूर्त कोडबेस संगणनीय होना बंद हो जाते हैं",
  "Executor Isolation: The Danger of Sandboxing": "निष्पादक अलगाव: सैंडबॉक्सिंग का खतरा",
  "The Ownership Gap in Educational Software": "शैक्षिक सॉफ्टवेयर में स्वामित्व का अंतर",
  "The Coming Ownership Economy": "आने वाली स्वामित्व अर्थव्यवस्था",
  "Building Smarter Growth in a Fast-Changing World": "तेजी से बदलती दुनिया में स्मार्ट विकास का निर्माण",
  "Five Domains. One Pipeline. Built for Bharat.": "पांच डोमेन। एक पाइपलाइन। भारत के लिए निर्मित।",
  "The Five Domains": "पांच डोमेन",
  "Phase 1: The Multi-Agent Orchestration Blueprint": "चरण 1: मल्टी-एजेंट ऑर्केस्ट्रेशन ब्लूप्रिंट",
  "Phase 2: Local Node Provisioning and Substrate Hardening": "चरण 2: स्थानीय नोड प्रावधान और सबस्ट्रेट सुदृढ़ीकरण",
  "Phase 3: The Continuous Retraining and Optimization Topology": "चरण 3: निरंतर पुन: प्रशिक्षण और अनुकूलन टोपोलॉजी",
  "Continue the Conversation.": "बातचीत जारी रखें।",
  "Keep building.": "निर्माण जारी रखें।",
  "Organic Reactions": "कार्बनिक प्रतिक्रियाएं",
  "SSL Hardening": "SSL सुदृढ़ीकरण",
  "REST APIs design": "REST APIs डिजाइन",
  "Organic Chemistry Basics": "कार्बनिक रसायन विज्ञान बुनियादी बातें",
  "SSL/TLS Protocols": "SSL/TLS प्रोटोकॉल",
  "API Design Principles": "एपीआई डिजाइन सिद्धांत"
};

function mockTranslate(text, lang) {
  if (lang === 'en' || !text) return text;
  const clean = text.trim();
  if (HINDI_MAP[clean]) return HINDI_MAP[clean];
  
  let translated = clean;
  translated = translated.replace(/\bAI\b/gi, "एआई");
  translated = translated.replace(/\bsoftware\b/gi, "सॉफ्टवेयर");
  translated = translated.replace(/\blocal-first\b/gi, "स्थानीय-प्रथम");
  translated = translated.replace(/\bdevelopers\b/gi, "विकासकर्ता");
  translated = translated.replace(/\bstartup\b/gi, "स्टार्टअप");
  translated = translated.replace(/\bcloud\b/gi, "क्लाउड");
  translated = translated.replace(/\bservers\b/gi, "सर्वर");
  translated = translated.replace(/\bSovereign\b/gi, "संप्रभु");
  translated = translated.replace(/\bInfrastructure\b/gi, "बुनियादी ढांचा");
  translated = translated.replace(/\bOrchestration\b/gi, "ऑर्केस्ट्रेशन");
  translated = translated.replace(/\bContinuity\b/gi, "निरंतरता");
  translated = translated.replace(/\bVerification\b/gi, "सत्यापन");
  translated = translated.replace(/\bIncidents\b/gi, "घटनाएं");
  translated = translated.replace(/\bHardware\b/gi, "हार्डवेयर");
  translated = translated.replace(/\bDatabase\b/gi, "डेटाबेस");
  translated = translated.replace(/\bSecurity\b/gi, "सुरक्षा");
  translated = translated.replace(/\bPrivate\b/gi, "निजी");
  translated = translated.replace(/\bPublic\b/gi, "सार्वजनिक");
  translated = translated.replace(/\bMemory\b/gi, "मेमोरी");
  translated = translated.replace(/\bReasoning\b/gi, "तर्क");
  translated = translated.replace(/\bSystem\b/gi, "सिस्टम");
  translated = translated.replace(/\bState\b/gi, "स्थिति");
  translated = translated.replace(/\bParallel\b/gi, "समानांतर");
  translated = translated.replace(/\bSpeed\b/gi, "गति");
  translated = translated.replace(/\bCoordination\b/gi, "समन्वय");
  translated = translated.replace(/\bOwnership\b/gi, "स्वामित्व");
  translated = translated.replace(/\bEconomy\b/gi, "अर्थव्यवस्था");
  translated = translated.replace(/\bGrowth\b/gi, "विकास");
  translated = translated.replace(/\bWorld\b/gi, "दुनिया");
  translated = translated.replace(/\bFeature\b/gi, "सुविधा");
  translated = translated.replace(/\bSurvival\b/gi, "जीवन रक्षा");
  
  return translated;
}

function htmlToMarkdown(html) {
  if (!html) return '';
  return html
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n\n## $1\n\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n')
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '\n\n$1\n\n')
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '\n\n$1\n\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n\n```\n$1\n```\n\n')
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n\n```\n$1\n```\n\n')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, ' `$1` ')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, ' **$1** ')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, ' **$1** ')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, ' *$1* ')
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, ' *$1* ')
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, ' [$2]($1) ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '') // remove any leftovers
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n+/g, '\n\n') // normalize spacing
    .trim();
}

// ─────────── PARSER ───────────
function parseArticle(html, filename) {
  // Extract title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1] : filename.replace('.html', '').replace(/-/g, ' ');
  title = title.replace(/\s*\|\s*Daxini Journal/i, '').replace(/^#{1,6}\s*/, '').trim();

  // Extract description
  const description = extractMeta(html, 'description') || extractMeta(html, 'og:description') || '';

  // Extract date
  const dateMatch = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  let rawDate = dateMatch ? dateMatch[1] : '';
  if (!rawDate) {
    const metaMatch = html.match(/<span>(\w+ \d{1,2}, \d{4})<\/span>/);
    rawDate = metaMatch ? metaMatch[1] : '';
  }
  const date = parseDate(rawDate);

  // Extract tags
  const tags = [];
  const tagRe = /class="article-tag">([^<]+)<\/a>/g;
  let tagM;
  while ((tagM = tagRe.exec(html)) !== null) {
    tags.push(tagM[1].trim());
  }
  if (tags.length === 0) tags.push("Engineering");

  // Extract OG image
  const ogImage = extractMeta(html, 'og:image') || '';

  // Extract body content
  let body = '';
  const bodyStart = html.indexOf('class="article-body"');
  if (bodyStart !== -1) {
    const gtPos = html.indexOf('>', bodyStart);
    let bodyEnd = html.indexOf('<!-- DAXINI_FOOTER_BLOCKS_START', gtPos);
    if (bodyEnd === -1) bodyEnd = html.indexOf('<div class="newsletter-block"', gtPos);
    if (bodyEnd === -1) bodyEnd = html.indexOf('</main>', gtPos);
    if (bodyEnd === -1) bodyEnd = html.indexOf('</div>\n\n', gtPos + 500);
    if (bodyEnd === -1) bodyEnd = html.length;
    body = html.slice(gtPos + 1, bodyEnd).trim();
    if (body.endsWith('</div>')) body = body.slice(0, -6).trim();
  } else {
    body = html;
  }

  return { title, description, date, tags, ogImage, body, filename };
}

// ─────────── SECTION SPLITTER ───────────
function splitIntoSections(article) {
  const { title, body } = article;
  const sections = [];

  // Split by heading tags
  const chunks = body.split(/(?=<(?:h[234]|p>\s*#{2,4}))/i);

  // INTRO section
  sections.push({
    name: 'INTRO',
    kicker: article.tags[0].toUpperCase(),
    titleEn: title,
    htmlEn: buildIntroHTML(article)
  });

  let sectionIndex = 0;
  const sectionNames = ['THESIS', 'DEPTH', 'INSIGHT', 'EVIDENCE', 'VISION', 'FRAMEWORK', 'ANALYSIS', 'CONTEXT', 'DETAIL', 'CORE'];

  for (const chunk of chunks) {
    if (!chunk.trim()) continue;

    let heading = '';
    let content = chunk;

    const hMatch = chunk.match(/<h[234][^>]*>([^<]+)<\/h[234]>/i);
    if (hMatch) {
      heading = hMatch[1].trim();
      content = chunk.slice(chunk.indexOf('>', chunk.indexOf(hMatch[0]) + hMatch[0].length - 1) + 1);
    }

    const mdMatch = chunk.match(/<p>\s*#{2,4}\s*([^<]+)<\/p>/i);
    if (!heading && mdMatch) {
      heading = mdMatch[1].trim();
      content = chunk.replace(mdMatch[0], '');
    }

    content = content.trim();
    if (!content || content.length < 30) continue;

    if (!heading && sectionIndex === 0) {
      sections[0].htmlEn = buildIntroHTML(article) + formatBodyContent(content);
      continue;
    }

    if (!heading) heading = `Part ${sectionIndex + 1}`;

    const name = sectionNames[sectionIndex % sectionNames.length];
    sections.push({
      name: name,
      kicker: article.tags[0].toUpperCase(),
      titleEn: heading,
      htmlEn: formatBodyContent(content)
    });

    sectionIndex++;
  }

  // Fallback split by paragraph groups if only 1 section
  if (sections.length === 1 && body.length > 200) {
    const paragraphs = body.split(/<\/p>/i).filter(p => stripTags(p).length > 20);
    const groupSize = Math.ceil(paragraphs.length / 4);

    for (let i = 0; i < paragraphs.length; i += groupSize) {
      const group = paragraphs.slice(i, i + groupSize);
      const groupHTML = group.map(p => p.trim() + '</p>').join('\n');
      const firstText = stripTags(group[0] || '');
      const sectionTitle = firstText.length > 50 ? firstText.slice(0, 47) + '...' : firstText;

      if (i === 0) {
        sections[0].htmlEn = buildIntroHTML(article) + formatBodyContent(groupHTML);
      } else {
        const name = sectionNames[(sections.length - 1) % sectionNames.length];
        sections.push({
          name: name,
          kicker: article.tags[0].toUpperCase(),
          titleEn: sectionTitle || `Part ${sections.length}`,
          htmlEn: formatBodyContent(groupHTML)
        });
      }
    }
  }

  // CLOSE section
  sections.push({
    name: 'CLOSE',
    kicker: 'CONNECT',
    titleEn: 'Continue the Conversation.',
    htmlEn: buildCloseHTML(article)
  });

  return sections;
}

function formatBodyContent(html) {
  let formatted = html
    .replace(/^\s*<h[234][^>]*>[^<]+<\/h[234]>\s*/i, '')
    .replace(/<strong>([^<]+)<\/strong>/g, '<b>$1</b>')
    .replace(/<em>([^<]+)<\/em>/g, '<em>$1</em>')
    .replace(/<p>\s*-\s+/g, '<li>')
    .replace(/<p>/g, '<p class="lead">')
    .replace(/<p class="lead">\s*---\s*<\/p>/g, '');

  formatted = formatted.replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(https?:\/\/(?!daxini\.xyz)[^"']+)\1([^>]*)>/gi, (match, p1, p2, p3) => {
    if (/target=/i.test(match)) return match;
    return `<a href="${p2}" target="_blank" rel="noopener noreferrer"${p3}>`;
  });

  formatted = formatted.replace(/<table([^>]*)>([\s\S]*?)<\/table>/gi, (match, attrs, content) => {
    return `<div class="table-wrapper" tabindex="0" aria-label="Scrollable table"><table${attrs}>${content}</table></div>`;
  });

  formatted = formatted.replace(/<pre[^>]*>\s*<\/pre>/gi, '');

  formatted = formatted.replace(/<pre([^>]*)>([^<][\s\S]*?)<\/pre>/gi, (match, attrs, content) => {
    if (!content.trim()) return '';
    return `<div class="code-block-wrapper"><pre${attrs} tabindex="0">${content}</pre><button type="button" class="code-copy-btn" aria-label="Copy code">Copy</button></div>`;
  });

  return formatted;
}

function buildIntroHTML(article) {
  const desc = article.description || stripTags(article.body).slice(0, 150) + '...';
  const tagsHTML = article.tags.map(t =>
    `<div class="uc"><span class="uc-icon">◆</span>${t}</div>`
  ).join('\n');

  return `
    <p class="big">${escapeJS(article.title).replace(/\b(\w+)$/, '<span class="accent">$1</span>')}</p>
    <p class="lead">${escapeJS(desc)}</p>
    ${tagsHTML ? `<div class="usecases">${tagsHTML}</div>` : ''}
    <div class="qt">By <b>Dharam Daxini</b> · ${article.date}</div>
    <div class="social-strip">Read more at →
      <a href="https://daxini.xyz" target="_blank" rel="noopener">◆ daxini.xyz</a>
    </div>`;
}

function buildCloseHTML(article) {
  return `
    <p class="big">Keep <span class="accent">building.</span></p>
    <p class="lead">This article is part of the Daxini Journal — engineering dispatches, system logs, and experiments built in public from Kutch, India.</p>
    <button class="cp" onclick="window.open('https://daxini.xyz/subscribe.html','_blank')">
      <span class="cpulse"></span><div class="ci">📧 Subscribe to Dispatches <div class="ca">→</div></div>
    </button>
    <button class="btn-secondary" style="margin-top:10px;" onclick="shareArticle()">🔗 Share This Article</button>
    <div class="social-strip">Follow the build →
      <a href="https://daxini.xyz/journal.html" target="_blank" rel="noopener">◆ Daxini Journal</a>
    </div>`;
}

// ─────────── STANDALONE HTML GENERATOR ───────────
function generateStandaloneHTML(article, sections) {
  const seoTitle = escapeHTML(article.title);
  const seoDesc = escapeHTML(article.description || '');

  const sectionsHTML = sections.map((s, i) => {
    const titleText = escapeHTML(s.titleEn);
    const label = `${i + 1}. ${escapeHTML(s.name)}`;
    return `      <section>
        <div class="step-label">${label}</div>
        <h2>${titleText}</h2>
        <div>
          ${s.htmlEn}
        </div>
      </section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0a0a0a" />
  <meta name="description" content="${seoDesc}" />
  <title>${seoTitle} • ViaDecide</title>

  <!-- Google Fonts: Outfit & Space Grotesk -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg: #050505;
      --card-bg: rgba(18, 18, 20, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --text: #fdfdfd;
      --text-muted: rgba(242, 242, 242, 0.65);
      --accent: #ff671f;
      --accent-glow: rgba(255, 103, 31, 0.15);
      --radius: 24px;
      --maxw: 800px;
      --gutter: 24px;
      --font-system: 'Outfit', -apple-system, sans-serif;
      --font-heading: 'Space Grotesk', sans-serif;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 0;
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-system);
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }

    a {
      color: var(--accent);
      text-decoration: none;
      transition: opacity 0.2s;
    }
    a:hover { opacity: 0.8; }

    /* Header */
    .header {
      position: sticky;
      top: 0;
      background: rgba(5, 5, 5, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--card-border);
      padding: 16px var(--gutter);
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo a {
      font-family: var(--font-heading);
      font-weight: 700;
      color: var(--accent);
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .back-link {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 600;
    }

    /* Article Container */
    .article-container {
      max-width: var(--maxw);
      margin: 60px auto;
      padding: 0 var(--gutter);
    }

    .article-header {
      margin-bottom: 60px;
      text-align: center;
    }

    .article-title {
      font-family: var(--font-heading);
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 700;
      line-height: 1.2;
      margin: 0 0 16px 0;
      background: linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.7));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.02em;
    }

    .article-meta {
      font-size: 14px;
      color: var(--text-muted);
    }

    /* Sections */
    section {
      margin-bottom: 48px;
    }

    .step-label {
      font-family: var(--font-heading);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent);
      margin-bottom: 8px;
      font-weight: 700;
    }

    h2 {
      font-family: var(--font-heading);
      font-size: 24px;
      margin: 0 0 20px 0;
      font-weight: 600;
      color: #fff;
    }

    p {
      margin: 0 0 24px 0;
      font-size: 17px;
      color: var(--text-muted);
    }
    
    strong {
      color: #fff;
    }

    /* Callout Boxes / Usecases / Steps */
    .insight-box {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 24px;
      margin: 32px 0;
      border-left: 4px solid var(--accent);
    }

    .insight-box h4 {
      margin: 0 0 12px 0;
      font-family: var(--font-heading);
      color: #fff;
      font-size: 18px;
    }

    .insight-box p {
      margin: 0;
      font-size: 15px;
    }

    /* Tables */
    .table-wrapper {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin: 24px 0;
      border: 1px solid var(--card-border);
      border-radius: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 15px;
    }
    th, td {
      border: 1px solid var(--card-border);
      padding: 12px 16px;
      text-align: left;
    }
    th {
      background: rgba(255, 255, 255, 0.04);
      color: #fff;
      font-weight: 600;
    }

    /* Code Blocks */
    .code-block-wrapper {
      position: relative;
      margin: 24px 0;
      border-radius: 12px;
      border: 1px solid var(--card-border);
      overflow: hidden;
      background: rgba(0, 0, 0, 0.5);
    }
    pre {
      margin: 0;
      padding: 20px;
      font-family: monospace;
      font-size: 14px;
      color: #e5e7eb;
      overflow-x: auto;
    }
    .code-copy-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 10px;
      font-size: 11px;
      border-radius: 6px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      color: var(--text-muted);
      font-weight: 600;
      cursor: pointer;
    }
    .code-copy-btn.copied {
      background: var(--accent-glow);
      border-color: var(--accent);
      color: #fff;
    }

    .usecases { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
    .uc { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--card-border); background: rgba(0,0,0,0.3); font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .uc-icon { color: var(--accent); }

    .cp { display: flex; align-items: center; justify-content: center; border: none; border-radius: 12px; background: linear-gradient(135deg, var(--accent), #ff9a5c); cursor: pointer; position: relative; height: 50px; width: 100%; margin-top: 24px; box-shadow: 0 8px 24px var(--accent-glow); }
    .ci { color: #fff; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 6px; }
    .ca { background: rgba(255,255,255,0.2); border-radius: 6px; padding: 2px 8px; font-size: 12px; }
    .btn-secondary { border: none; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 14px; width: 100%; background: rgba(255,255,255,0.06); color: #fff; border: 1px solid rgba(255,255,255,0.12); cursor: pointer; }
    .qt { margin-top: 16px; color: var(--text-muted); font-size: 14px; }
    .social-strip { display: flex; align-items: center; gap: 8px; margin-top: 20px; font-size: 14px; color: var(--text-muted); }
    .social-strip a { color: var(--accent); font-weight: 600; }
  </style>
  <link rel="stylesheet" href="/css/review-engine.css" />
</head>
<body>

  <header class="header">
    <div class="logo"><a href="/blogs">ViaDecide Blogs</a></div>
    <a href="/blogs" class="back-link">← Back to Articles</a>
  </header>

  <main class="article-container">
    <header class="article-header">
      <h1 class="article-title">${seoTitle}</h1>
      <div class="article-meta">By Dharam Daxini • ${article.date}</div>
    </header>

    <article>
      ${sectionsHTML}
    </article>
  </main>

  <script src="/js/review-engine.js"></script>
  <script>
    // Copy code button handler
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('code-copy-btn')) {
        const btn = e.target;
        const pre = btn.previousElementSibling;
        if (pre && pre.tagName === 'PRE') {
          navigator.clipboard.writeText(pre.innerText || pre.textContent).then(() => {
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.textContent = 'Copy';
              btn.classList.remove('copied');
            }, 2000);
          }).catch(() => {});
        }
      }
    });

    // Helper for sharing
    window.shareArticle = function() {
      if(navigator.share){
        navigator.share({ title: document.title, url: location.href }).catch(()=>{});
      } else {
        navigator.clipboard.writeText(location.href).then(()=>alert('Link copied!')).catch(()=>{});
      }
    };
  </script>
</body>
</html>`;
}

// ─────────── MAIN EXECUTION ───────────
function main() {
  console.log('🔄 Converting and staging Daxini Journals to ViaDecide...\n');

  if (!fs.existsSync(BACKUP_DIR)) {
    console.error(`❌ Source directory ${BACKUP_DIR} does not exist!`);
    process.exit(1);
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.html') && f !== '.html' && !f.startsWith('_'));

  console.log(`📂 Found ${files.length} pristine source articles in ${BACKUP_DIR}`);
  console.log(`💾 Writing Markdown outputs to ${OUT_MD_DIR}`);
  console.log(`💾 Writing Standalone HTML outputs to ${OUT_HTML_DIR}`);
  console.log(`💾 Writing Catalog JSON output to ${OUT_JSON_FILE}\n`);

  let converted = 0;
  let errors = 0;
  const articlesCatalog = [];

  for (const file of files) {
    try {
      const backupFilePath = path.join(BACKUP_DIR, file);
      const htmlContent = fs.readFileSync(backupFilePath, 'utf8');

      // 1. Parse Article
      const article = parseArticle(htmlContent, file);
      const slug = file.replace('.html', '');

      // 2. Split into sections
      const sections = splitIntoSections(article);

      // 3. Generate Standalone HTML
      const standaloneHTML = generateStandaloneHTML(article, sections);
      fs.writeFileSync(path.join(OUT_HTML_DIR, `${slug}.html`), standaloneHTML, 'utf8');

      // 4. Generate Markdown with YAML front-matter
      const titleHi = HINDI_MAP[article.title] || mockTranslate(article.title, 'hi');
      const excerptHi = HINDI_MAP[article.description] || mockTranslate(article.description, 'hi');
      const mdContent = `---
title: "${article.title.replace(/"/g, '\\"')}"
title_hi: "${titleHi.replace(/"/g, '\\"')}"
excerpt: "${(article.description || '').replace(/"/g, '\\"')}"
excerpt_hi: "${excerptHi.replace(/"/g, '\\"')}"
category: "article"
icon: "📄"
date: ${article.date}
readTime: ${Math.ceil(stripTags(article.body).split(/\s+/).length / 200) || 5}
featured: false
---

# ${article.title}

${htmlToMarkdown(article.body)}
`;
      fs.writeFileSync(path.join(OUT_MD_DIR, `${slug}.md`), mdContent, 'utf8');

      // 5. Append to central catalog array
      const concepts = getConcepts(article.title, article.tags);
      articlesCatalog.push({
        title: article.title,
        slug: slug,
        date: article.date,
        author: "Dharam Daxini",
        tags: article.tags,
        description: article.description,
        summary: article.description,
        concepts: concepts,
        content: stripTags(article.body),
        newsletter: "daxini-stack",
        path: `/articles/${slug}`
      });

      converted++;
      console.log(`  ✅ ${file} → Staged (slug: ${slug}, ${sections.length} sections)`);
    } catch (err) {
      errors++;
      console.error(`  ❌ Failed to convert ${file}: ${err.message}`);
    }
  }

  // Write new data/articles.json catalog
  fs.writeFileSync(OUT_JSON_FILE, JSON.stringify(articlesCatalog, null, 2), 'utf8');

  console.log(`\n════════════════════════════════`);
  console.log(`✅ Staged:   ${converted}`);
  console.log(`❌ Errors:   ${errors}`);
  console.log(`📂 Total:    ${files.length}`);
  console.log(`════════════════════════════════`);
}

main();
