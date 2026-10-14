// SNS 用のサムネイル（1200×630）を言語ごとに作り、og/ja.png・og/en.png・og/ko.png に書き出す。
// 文言は tools/site.mjs。Playwright（Chromium）が要る:  node tools/og-image.mjs
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, SITE_URL } from './site.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const C = { paper: '#F2F4F7', ink: '#18212B', muted: '#5B6875', line: '#9BA6B2', rule: '#D5DBE2',
  planner: '#2F54D9', evaluator: '#A8690A', executor: '#0B7A6E', tools: '#9B2C9B', finish: '#1F8A3B' };
const FONT = { ja: '"Zen Kaku Gothic New"', en: '"Zen Kaku Gothic New"', ko: '"Noto Sans KR"' };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 図: 質問 → 計画 → 実行 → 道具 → 評価 → 完了。評価から計画へ差し戻しの矢印
const NODES = [['query', 'Query', C.ink], ['planner', 'Planner', C.planner], ['executor', 'Executor', C.executor],
  ['tools', 'Tools', C.tools], ['evaluator', 'Evaluator', C.evaluator], ['finish', 'Finish', C.finish]];
function diagram(L) {
  const W = 1072, w = 150, hh = 82, gap = (W - w * NODES.length) / (NODES.length - 1), my = hh / 2;
  const x = i => i * (w + gap);
  const parts = [];
  const head = (px, py, dir) => {   // 矢印の先（dir: 'r' 右向き, 'u' 上向き）
    const pts = dir === 'r' ? [[px, py], [px - 11, py - 7], [px - 11, py + 7]] : [[px, py], [px - 7, py + 11], [px + 7, py + 11]];
    return `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${C.line}"/>`;
  };
  NODES.forEach(([id, name, color], i) => {
    const sub = L.nodes[id];
    const dashed = id === 'query' ? ' stroke-dasharray="2 6" stroke-linecap="round"' : '';
    parts.push(`<rect x="${x(i)}" y="0" width="${w}" height="${hh}" rx="12" fill="color-mix(in srgb, ${color} 9%, #fff)" stroke="${color}" stroke-width="3"${dashed}/>`);
    parts.push(`<text x="${x(i) + w / 2}" y="${sub ? my - 2 : my + 8}" font-size="24" font-weight="700" fill="${color}" text-anchor="middle">${name}</text>`);
    if (sub) parts.push(`<text x="${x(i) + w / 2}" y="${my + 24}" font-size="17" fill="${C.muted}" text-anchor="middle">${esc(sub)}</text>`);
    if (i) parts.push(`<path d="M${x(i - 1) + w + 5},${my} H${x(i) - 8}" stroke="${C.line}" stroke-width="2.5"/>`, head(x(i) - 4, my, 'r'));
  });
  const ex = x(4) + w / 2, px = x(1) + w / 2, by = hh + 40;
  parts.push(`<path d="M${ex},${hh + 4} V${by} H${px} V${hh + 14}" fill="none" stroke="${C.evaluator}" stroke-width="2.5" stroke-dasharray="8 6"/>`);
  parts.push(`<polygon points="${px},${hh + 4} ${px - 7},${hh + 16} ${px + 7},${hh + 16}" fill="${C.evaluator}"/>`);
  const lx = (ex + px) / 2;
  // 文字の周りだけ点線を消す（背景色の縁取りを文字の下に敷く）
  parts.push(`<text x="${lx}" y="${by + 7}" font-size="19" font-weight="500" fill="${C.evaluator}" stroke="${C.paper}" stroke-width="14" paint-order="stroke" text-anchor="middle">↺ ${esc(L.retry)}</text>`);
  return `<svg width="${W}" height="${by + 20}" viewBox="0 0 ${W} ${by + 20}" style="overflow:visible">${parts.join('')}</svg>`;
}

function html(lang) {
  const L = LANGS[lang];
  const stripe = [C.planner, C.evaluator, C.executor, C.tools, C.finish].map(c => `<i style="background:${c}"></i>`).join('');
  const stages = L.stages.map((s, i) => `<li><small>${esc(L.stageNo(i + 1))}</small>${esc(s)}</li>`).join('<li class="arrow">→</li>');
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{background:${C.paper};color:${C.ink};font-family:${FONT[lang]},sans-serif;padding:52px 64px 0;position:relative;${lang === 'ko' ? 'word-break:keep-all;' : ''}}
.stripe{position:absolute;left:0;right:0;top:0;height:10px;display:flex}.stripe i{flex:1}
.url{position:absolute;top:30px;right:64px;font-size:18px;color:${C.muted};letter-spacing:.02em}
h1{font-size:60px;line-height:1.2;font-weight:700;letter-spacing:${lang === 'en' ? '-.01em' : '.01em'};margin-top:14px;font-feature-settings:"palt"}
p{margin-top:16px;font-size:25px;line-height:1.5;color:${C.muted};white-space:pre-line;font-weight:500}
.fig{margin-top:52px}
ol{list-style:none;padding:0;display:flex;align-items:center;gap:10px;position:absolute;left:64px;right:64px;bottom:44px}
li{flex:1;background:#fff;border:2px solid ${C.rule};border-radius:12px;padding:8px 14px;font-size:21px;font-weight:700;line-height:1.3;white-space:nowrap}
li small{display:block;font-size:15px;font-weight:500;color:${C.muted}}
li:nth-last-child(1){background:${C.ink};border-color:${C.ink};color:#fff}li:nth-last-child(1) small{color:#C9D1DA}
li.arrow{flex:0 0 auto;background:none;border:0;padding:0;color:${C.line};font-size:24px}
</style></head><body>
<div class="stripe">${stripe}</div>
<div class="url">${esc(SITE_URL.replace(/^https:\/\//, '').replace(/\/$/, ''))}</div>
<h1>${esc(L.title)}</h1>
<p>${esc(L.tagline)}</p>
<div class="fig">${diagram(L)}</div>
<ol>${stages}</ol>
</body></html>`;
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
mkdirSync(join(root, 'og'), { recursive: true });
for (const lang of Object.keys(LANGS)) {
  await page.setContent(html(lang), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // はみ出しがあれば止める（文言を長くしたときの事故よけ）
  const over = await page.evaluate(() => [...document.querySelectorAll('h1,p,li')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent));
  if (over.length) throw new Error(`${lang}: はみ出しています: ${over.join(' / ')}`);
  await page.screenshot({ path: join(root, 'og', `${lang}.png`) });
  console.log('wrote', `og/${lang}.png`);
}
await browser.close();
