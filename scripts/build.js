'use strict';

const fs = require('fs');
const path = require('path');
const ORIGIN = 'https://pjh-eric.github.io/';
const root = path.join(__dirname, '..');
const esc = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function render(cfg, lobby) {
  if (cfg.siteUrl !== ORIGIN || cfg.lobbyUrl !== ORIGIN + 'game-lobby/' ||
      !/^G-[A-Z0-9]+$/.test(cfg.gaMeasurementId) || !cfg.title || !cfg.description) throw new Error('根網站 SEO 設定不正確');
  if (!Array.isArray(lobby.games) || !lobby.games.length) throw new Error('games.json 沒有任何遊戲');
  const seen = new Set([cfg.siteUrl, cfg.lobbyUrl]);
  const ids = new Set();
  for (const game of lobby.games) {
    if (!/^[a-z0-9-]+$/.test(game.id) || game.launchUrl !== ORIGIN + game.id + '/' ||
        !game.title || !game.description || seen.has(game.launchUrl) || ids.has(game.id)) {
      throw new Error('遊戲設定不正確或重複：' + game.id);
    }
    seen.add(game.launchUrl); ids.add(game.id);
  }
  const links = lobby.games.map(g => '<li><a href="' + esc(g.launchUrl) + '">' + esc(g.title) + '</a><p>' + esc(g.description) + '</p></li>').join('\n');
  const verification = cfg.googleSiteVerification ? '<meta name="google-site-verification" content="' + esc(cfg.googleSiteVerification) + '">' : '';
  const html = `<!doctype html>
<html lang="zh-Hant"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(cfg.title)}</title><meta name="description" content="${esc(cfg.description)}">
${verification}<link rel="canonical" href="${esc(cfg.siteUrl)}"><meta name="robots" content="index, follow">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png">
<link rel="icon" type="image/svg+xml" sizes="any" href="/favicon.svg">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta property="og:type" content="website"><meta property="og:locale" content="zh_TW">
<meta property="og:title" content="${esc(cfg.title)}"><meta property="og:description" content="${esc(cfg.description)}"><meta property="og:url" content="${esc(cfg.siteUrl)}">
<meta property="og:image" content="${ORIGIN}og-image.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png"><meta property="og:image:alt" content="遊戲小小島">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(cfg.title)}"><meta name="twitter:description" content="${esc(cfg.description)}"><meta name="twitter:image" content="${ORIGIN}og-image.png">
<script>(function(){if(location.hostname!=="pjh-eric.github.io")return;window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${cfg.gaMeasurementId}',{game_id:'root',page_location:'${ORIGIN}'});var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${cfg.gaMeasurementId}';document.head.appendChild(s);})();</script>
<style>html{font:18px/1.7 system-ui,sans-serif;color:#263b40;background:#f5faf7}body{max-width:960px;margin:auto;padding:clamp(18px,5vw,48px)}a{color:#125d69;text-underline-offset:4px}a:focus-visible{outline:3px solid #da8c25;outline-offset:5px}ul{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:16px}li{background:white;padding:22px;border:1px solid #cadbd2;border-radius:12px;overflow-wrap:anywhere}li a{font-weight:bold;font-size:1.2rem}li p{margin-bottom:0}.lobby{display:inline-block;padding:12px 24px;background:#125d69;color:white;border-radius:8px}</style>
</head><body><main><h1>遊戲小小島入口</h1><p>${esc(cfg.description)}</p><p><a class="lobby" href="${esc(cfg.lobbyUrl)}">前往遊戲大廳</a></p><h2>挑一款遊戲開始玩</h2><ul>${links}</ul></main></body></html>
`;
  return {
    'index.html': html,
    'robots.txt': 'User-agent: *\nAllow: /\n\nSitemap: ' + cfg.siteUrl + 'sitemap.xml\n',
    'sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      [...seen].map(url => '  <url><loc>' + esc(url) + '</loc></url>').join('\n') + '\n</urlset>\n',
    '404.html': '<!doctype html><html lang="zh-Hant"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>找不到這個頁面</title><h1>找不到這個頁面</h1><p><a href="' + cfg.lobbyUrl + '">回遊戲大廳</a></p></html>\n',
    '.nojekyll': ''
  };
}

async function build(env = process.env) {
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'seo.config.json'), 'utf8'));
  let lobby;
  if (env.GAMES_JSON_PATH) lobby = JSON.parse(fs.readFileSync(env.GAMES_JSON_PATH, 'utf8'));
  else {
    if (cfg.gamesJsonUrl !== ORIGIN + 'game-lobby/config/games.json') throw new Error('gamesJsonUrl 格式錯誤');
    const response = await fetch(cfg.gamesJsonUrl, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error('抓不到大廳設定：HTTP ' + response.status);
    lobby = await response.json();
  }
  // 先完成全部驗證與渲染，避免連線或設定錯誤時覆蓋既有產物。
  const files = render(cfg, lobby);
  const out = path.join(root, 'dist');
  fs.mkdirSync(out, { recursive: true });
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(out, name), text, 'utf8');
  for (const name of ['favicon.svg', 'favicon-96.png', 'favicon.ico', 'apple-touch-icon.png', 'og-image.png', 'icons/icon-192.png', 'icons/icon-512.png']) {
    fs.mkdirSync(path.dirname(path.join(out, name)), { recursive: true });
    fs.copyFileSync(path.join(root, 'assets', name), path.join(out, name));
  }
  console.log('✓ 根網站已建置：' + lobby.games.length + ' 款遊戲');
}

module.exports = { render, build };
if (require.main === module) build().catch(error => { console.error(error.message); process.exitCode = 1; });
