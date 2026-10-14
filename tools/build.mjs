// index.html（日本語のページ）をもとに、en/index.html と ko/index.html を作る。
// あわせて、3つのページの <head> にある SNS 用のメタ情報（<!-- meta:start --> から <!-- meta:end --> まで）を書き直す。
// index.html を直したら、そのたびに実行する:  node tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, SITE_URL, pageUrl, imageUrl } from './site.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function metaBlock(lang) {
  const L = LANGS[lang];
  const lines = [
    `<!-- meta:start（tools/build.mjs が書き出す。直すときは tools/site.mjs を直して実行する） -->`,
    `<title>${esc(L.title)}</title>`,
    `<meta name="description" content="${esc(L.description)}">`,
    `<link rel="canonical" href="${pageUrl(lang)}">`,
    ...Object.keys(LANGS).map(l => `<link rel="alternate" hreflang="${l}" href="${pageUrl(l)}">`),
    `<link rel="alternate" hreflang="x-default" href="${SITE_URL}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${pageUrl(lang)}">`,
    `<meta property="og:title" content="${esc(L.title)}">`,
    `<meta property="og:description" content="${esc(L.description)}">`,
    `<meta property="og:image" content="${imageUrl(lang)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(L.imageAlt)}">`,
    `<meta property="og:locale" content="${L.ogLocale}">`,
    ...Object.keys(LANGS).filter(l => l !== lang).map(l => `<meta property="og:locale:alternate" content="${LANGS[l].ogLocale}">`),
    `<meta name="twitter:card" content="summary_large_image">`,
    `<!-- meta:end -->`,
  ];
  return lines.join('\n');
}

const srcPath = join(root, 'index.html');
const src = readFileSync(srcPath, 'utf8');
const META = /<!-- meta:start[\s\S]*?<!-- meta:end -->/;
const HTML = /<html\b[^>]*>/;
if (!META.test(src) || !HTML.test(src)) throw new Error('index.html に <html> か <!-- meta:start --> 〜 <!-- meta:end --> が見つかりません');

for (const lang of Object.keys(LANGS)) {
  const depth = LANGS[lang].dir.split('/').filter(Boolean).length;
  const rootRel = depth ? '../'.repeat(depth) : './';
  let out = src
    .replace(HTML, `<html lang="${lang}" data-page-lang="${lang}" data-root="${rootRel}">`)
    .replace(META, () => metaBlock(lang));
  if (lang !== 'ja') out = out.replace('<head>', '<head>\n<!-- このファイルは tools/build.mjs が index.html から作ったもの。直すときは index.html を直して node tools/build.mjs を実行する -->');
  const outPath = join(root, LANGS[lang].dir, 'index.html');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, out);
  console.log('wrote', LANGS[lang].dir + 'index.html');
}
