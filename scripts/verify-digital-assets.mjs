import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'tools-manifest.json');
const vercelPath = path.join(root, 'vercel.json');
const failures = [];

function fail(asset, check, detail) {
  failures.push({ asset, check, detail });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function localReferences(html, basePath) {
  const refs = [...html.matchAll(/(?:src|href)=["']([^"'#]+)["']/gi)]
    .map((match) => match[1])
    .filter((ref) => !/^(?:https?:|data:|mailto:|tel:|javascript:)/i.test(ref));

  return refs.map((ref) => {
    const pathname = new URL(ref, `https://viadecide.test/${basePath}/`).pathname;
    return pathname.replace(/^\//, '');
  });
}

const manifest = readJson(manifestPath);
const vercel = readJson(vercelPath);
const entries = manifest.entries || [];

if (manifest.canonicalCount !== 44) {
  fail('manifest', 'canonical-count', `Expected 44, found ${manifest.canonicalCount}`);
}
if (entries.length !== 44) {
  fail('manifest', 'entry-count', `Expected 44, found ${entries.length}`);
}

for (const field of ['id', 'route', 'toolDir', 'entry', 'metaPath']) {
  const values = entries.map((entry) => entry[field]);
  if (new Set(values).size !== values.length) {
    fail('manifest', `unique-${field}`, `Duplicate ${field} detected`);
  }
}

const rewrites = new Map((vercel.rewrites || []).map((rewrite) => [rewrite.source, rewrite.destination]));

for (const entry of entries) {
  const assetRoot = path.join(root, entry.toolDir);
  const htmlPath = path.join(root, entry.entry);
  const configPath = path.join(root, entry.metaPath);
  const scriptPath = path.join(assetRoot, 'tool.js');

  for (const required of [assetRoot, htmlPath, configPath, scriptPath]) {
    if (!fs.existsSync(required)) {
      fail(entry.id, 'required-file', path.relative(root, required));
    }
  }

  if (!fs.existsSync(htmlPath) || !fs.existsSync(configPath)) continue;

  const config = readJson(configPath);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const expectedBase = `/${entry.toolDir}/`;

  if (config.id !== entry.id) {
    fail(entry.id, 'config-id', `Config id is ${config.id}`);
  }
  if (config.entry !== entry.entry) {
    fail(entry.id, 'config-entry', `Config entry is ${config.entry}`);
  }
  const baseMatch = html.match(/<base\s+href=["']([^"']+)["']\s*\/?\s*>/i);
  if (baseMatch?.[1] !== expectedBase) {
    fail(entry.id, 'base-path', `Expected ${expectedBase}, found ${baseMatch?.[1] || 'none'}`);
  }
  if (rewrites.get(entry.route) !== `/${entry.entry}`) {
    fail(entry.id, 'clean-route', `Missing rewrite ${entry.route} -> /${entry.entry}`);
  }

  for (const reference of localReferences(html, entry.toolDir)) {
    if (!fs.existsSync(path.join(root, reference))) {
      fail(entry.id, 'local-reference', reference);
    }
  }

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) {
    fail(entry.id, 'duplicate-html-id', duplicateIds.join(', '));
  }

  for (const tag of ['html', 'head', 'body', 'title']) {
    const count = (html.match(new RegExp(`<${tag}(?:\\s|>)`, 'gi')) || []).length;
    if (count !== 1) fail(entry.id, `html-${tag}-count`, `Expected 1, found ${count}`);
  }
}

const expectedRoutes = new Set(entries.map((entry) => entry.route));
const assetRewriteCount = (vercel.rewrites || []).filter((rewrite) => expectedRoutes.has(rewrite.source)).length;
if (assetRewriteCount !== 44) {
  fail('vercel.json', 'asset-rewrite-count', `Expected 44, found ${assetRewriteCount}`);
}

if (failures.length) {
  console.error(JSON.stringify({ status: 'failed', failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'passed',
  assets: entries.length,
  cleanRoutes: assetRewriteCount,
  requiredFiles: entries.length * 3,
  sourceCommit: manifest.sourceCommit
}, null, 2));
