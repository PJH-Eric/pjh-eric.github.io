'use strict';

const fs = require('fs');
const path = require('path');
const ORIGIN = 'https://pjh-eric.github.io/';
const SUPPORT_URL = 'https://portaly.cc/pjh-eric/support';
const SITE_NAME = '遊戲小小島';
const SHARE_IMAGE = {
  file: 'og-island-night.jpg',
  width: 1200,
  height: 630,
  alt: '遊戲小小島，月光下的海島遊戲廳'
};
const STANDALONE_GAMES = [];
const STANDALONE_GAME_URLS = STANDALONE_GAMES.map(game => game.launchUrl);
const root = path.join(__dirname, '..');
const esc = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function render(cfg, lobby, lobbyHref = cfg.lobbyUrl) {
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
        !game.title || !game.description || game.imageUrl !== game.launchUrl + 'assets/images/cover.webp' ||
        seen.has(game.launchUrl) || ids.has(game.id)) {
      throw new Error('遊戲設定不正確或重複：' + game.id);
    }
    seen.add(game.launchUrl); ids.add(game.id);
  }
  for (const game of STANDALONE_GAMES) {
    if (ids.has(game.id) || game.imageUrl !== ORIGIN + 'images/games/snake-3d-cover.webp') {
      throw new Error('獨立遊戲設定不正確或重複：' + game.id);
    }
    ids.add(game.id);
  }
  const verification = cfg.googleSiteVerification ? '<meta name="google-site-verification" content="' + esc(cfg.googleSiteVerification) + '">' : '';
  const sitemapUrls = [
    cfg.siteUrl + 'sitemap.xml',
    cfg.lobbyUrl + 'sitemap.xml',
    ...lobby.games.map(game => game.launchUrl + 'sitemap.xml'),
    ...STANDALONE_GAME_URLS.map(url => url + 'sitemap.xml')
  ];
  const shareUrl = cfg.siteUrl + SHARE_IMAGE.file;
  const siteId = cfg.siteUrl + '#website';
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': siteId,
        name: SITE_NAME,
        url: cfg.siteUrl,
        description: cfg.description,
        inLanguage: 'zh-Hant'
      },
      {
        '@type': 'WebPage',
        '@id': cfg.siteUrl + '#webpage',
        name: cfg.title,
        url: cfg.siteUrl,
        description: cfg.description,
        inLanguage: 'zh-Hant',
        isPartOf: { '@id': siteId },
        primaryImageOfPage: { '@type': 'ImageObject', url: shareUrl, width: SHARE_IMAGE.width, height: SHARE_IMAGE.height },
        significantLink: cfg.lobbyUrl
      }
    ]
  };
  const html = `<!doctype html>
<html lang="zh-Hant"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(cfg.title)}</title><meta name="description" content="${esc(cfg.description)}">
${verification}<link rel="canonical" href="${esc(cfg.siteUrl)}"><meta name="robots" content="index, follow, max-image-preview:large">
<link rel="icon" type="image/png" sizes="96x96" href="./favicon-96.png">
<link rel="icon" type="image/svg+xml" sizes="any" href="./favicon.svg">
<link rel="shortcut icon" href="./favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png">
<meta property="og:type" content="website"><meta property="og:locale" content="zh_TW">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:title" content="${esc(cfg.title)}"><meta property="og:description" content="${esc(cfg.description)}"><meta property="og:url" content="${esc(cfg.siteUrl)}">
<meta property="og:image" content="${esc(shareUrl)}">
<meta property="og:image:width" content="${SHARE_IMAGE.width}"><meta property="og:image:height" content="${SHARE_IMAGE.height}">
<meta property="og:image:type" content="image/jpeg"><meta property="og:image:alt" content="${esc(SHARE_IMAGE.alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(cfg.title)}"><meta name="twitter:description" content="${esc(cfg.description)}">
<meta name="twitter:image" content="${esc(shareUrl)}"><meta name="twitter:image:alt" content="${esc(SHARE_IMAGE.alt)}">
<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>
<script>(function(){if(location.hostname!=="pjh-eric.github.io")return;window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${cfg.gaMeasurementId}',{game_id:'root',page_location:'${ORIGIN}'});var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${cfg.gaMeasurementId}';document.head.appendChild(s);})();</script>
<meta name="theme-color" content="#100b28">
<link rel="stylesheet" href="./home.css">
</head>
<body>
  <main class="cover">
    <img class="cover-art" src="./island-night.webp" width="1536" height="1024" alt="" fetchpriority="high">
    <div class="cover-copy">
      <h1>${esc(SITE_NAME)}</h1>
      <div class="cover-actions">
        <a class="lobby-link" href="${esc(lobbyHref)}">進入遊戲大廳 <span aria-hidden="true">→</span></a>
        <a class="support-link" href="${SUPPORT_URL}" aria-label="贊助遊戲小小島"><span aria-hidden="true">♥</span> 贊助</a>
      </div>
    </div>
  </main>
</body></html>
`;
  return {
    'index.html': html,
    'robots.txt': 'User-agent: *\nAllow: /\n\n' + sitemapUrls.map(url => 'Sitemap: ' + url).join('\n') + '\n',
    'sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      [...seen].map(url => '  <url><loc>' + esc(url) + '</loc></url>').join('\n') + '\n</urlset>\n',
    '404.html': '<!doctype html><html lang="zh-Hant"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>找不到這個頁面</title><h1>找不到這個頁面</h1><p><a href="' + esc(cfg.lobbyUrl) + '">回遊戲大廳</a></p></html>\n',
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
  writeSite(path.join(root, 'dist'), files);
  console.log('✓ 根網站已建置：' + lobby.games.length + ' 款遊戲');
}

function writeSite(out, files) {
  fs.mkdirSync(out, { recursive: true });
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(out, name), text, 'utf8');
  for (const name of ['home.css', 'island.svg', 'island-night.webp', 'favicon.svg', 'favicon-96.png', 'favicon.ico', 'apple-touch-icon.png', 'og-image.png', SHARE_IMAGE.file, 'icons/icon-192.png', 'icons/icon-512.png', 'images/games/snake-3d-cover.webp']) {
    fs.mkdirSync(path.dirname(path.join(out, name)), { recursive: true });
    fs.copyFileSync(path.join(root, 'assets', name), path.join(out, name));
  }
}

module.exports = { render, build, writeSite };
if (require.main === module) build().catch(error => { console.error(error.message); process.exitCode = 1; });
