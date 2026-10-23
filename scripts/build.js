'use strict';

const fs = require('fs');
const path = require('path');
const ORIGIN = 'https://pjh-eric.github.io/';
const STANDALONE_GAME_URLS = [ORIGIN + 'snake-3d/'];
const root = path.join(__dirname, '..');
const esc = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function render(cfg, lobby) {
  if (cfg.siteUrl !== ORIGIN || cfg.lobbyUrl !== ORIGIN + 'game-lobby/' ||
      !/^G-[A-Z0-9]+$/.test(cfg.gaMeasurementId) || !cfg.title || !cfg.description) throw new Error('根網站 SEO 設定不正確');
  if (!Array.isArray(lobby.games) || !lobby.games.length) throw new Error('games.json 沒有任何遊戲');
  const seen = new Set([cfg.siteUrl, cfg.lobbyUrl]);
  const ids = new Set();
  for (const url of STANDALONE_GAME_URLS) {
    if (seen.has(url)) throw new Error('獨立遊戲網址重複：' + url);
    seen.add(url);
  }
  for (const game of lobby.games) {
    if (!/^[a-z0-9-]+$/.test(game.id) || game.launchUrl !== ORIGIN + game.id + '/' ||
        !game.title || !game.description || seen.has(game.launchUrl) || ids.has(game.id)) {
      throw new Error('遊戲設定不正確或重複：' + game.id);
    }
    seen.add(game.launchUrl); ids.add(game.id);
  }
  const verification = cfg.googleSiteVerification ? '<meta name="google-site-verification" content="' + esc(cfg.googleSiteVerification) + '">' : '';
  const sitemapUrls = [
    cfg.siteUrl + 'sitemap.xml',
    cfg.lobbyUrl + 'sitemap.xml',
    ...lobby.games.map(game => game.launchUrl + 'sitemap.xml'),
    ...STANDALONE_GAME_URLS.map(url => url + 'sitemap.xml')
  ];
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
<meta name="theme-color" content="#f8f5ed">
<link rel="stylesheet" href="/home.css">
</head>
<body>
  <a class="skip-link" href="#main">跳至主要內容</a>
  <div class="page">
    <header class="header">
      <a class="brand" href="${esc(cfg.siteUrl)}" aria-label="遊戲小小島首頁">
        <img src="/favicon.svg" width="42" height="42" alt="">
        <span>遊戲小小島<small>PLAYFUL ISLAND</small></span>
      </a>
      <a class="nav-link" href="${esc(cfg.lobbyUrl)}">遊戲大廳 <span aria-hidden="true">↗</span></a>
    </header>
    <main id="main">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow"><span></span>給生活一點遊戲時間</p>
          <h1 id="hero-title">放下忙碌，<br>來島上<span class="accent">玩。</span></h1>
          <p class="intro">一點挑戰，一點歡笑，還有剛剛好的放鬆。<br class="desktop-break">一個人闖關，或揪朋友同樂，下一場快樂就在這裡。</p>
          <a class="primary-link" href="${esc(cfg.lobbyUrl)}">前往遊戲大廳 <span aria-hidden="true">→</span></a>
          <p class="quick-note"><span aria-hidden="true">✦</span> 免費遊玩 <span class="separator">／</span> 免下載 <span class="separator">／</span> 打開就能玩</p>
        </div>
        <div class="hero-art">
          <span class="art-label">YOUR LITTLE PLAY BREAK</span>
          <img class="island" src="/island.svg" width="640" height="560" alt="漂浮在海上的遊戲小島，有棕櫚樹、遊戲手把與溫暖的太陽">
          <span class="island-note"><i aria-hidden="true"></i>快樂，隨時靠岸。</span>
        </div>
      </section>
      <section class="possibilities" aria-label="在小島上的遊玩方式">
        <article><span class="feature-number" aria-hidden="true">01 /</span><div><h2>留一點時間給自己</h2><p>輕鬆動腦，享受自己的小小成就。</p></div></article>
        <article><span class="feature-number" aria-hidden="true">02 /</span><div><h2>把朋友也揪上島</h2><p>一起挑戰，讓平凡日常多一點笑聲。</p></div></article>
        <article><span class="feature-number" aria-hidden="true">03 /</span><div><h2>在哪裡，都能開玩</h2><p>手機、平板或電腦，找到舒服的玩法。</p></div></article>
      </section>
    </main>
    <footer><span>遊戲小小島 <span class="footer-dot">·</span> 把快樂留在日常裡</span><span class="footer-sign">A LITTLE ISLAND. A LOT OF FUN.</span></footer>
  </div>
</body></html>
`;
  return {
    'index.html': html,
    'robots.txt': 'User-agent: *\nAllow: /\n\n' + sitemapUrls.map(url => 'Sitemap: ' + url).join('\n') + '\n',
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
  fs.writeFileSync(path.join(root, 'robots.txt'), files['robots.txt'], 'utf8');
  const out = path.join(root, 'dist');
  fs.mkdirSync(out, { recursive: true });
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(out, name), text, 'utf8');
  for (const name of ['home.css', 'island.svg', 'favicon.svg', 'favicon-96.png', 'favicon.ico', 'apple-touch-icon.png', 'og-image.png', 'icons/icon-192.png', 'icons/icon-512.png']) {
    fs.mkdirSync(path.dirname(path.join(out, name)), { recursive: true });
    fs.copyFileSync(path.join(root, 'assets', name), path.join(out, name));
  }
  console.log('✓ 根網站已建置：' + lobby.games.length + ' 款遊戲');
}

module.exports = { render, build };
if (require.main === module) build().catch(error => { console.error(error.message); process.exitCode = 1; });
