# 全遊戲導入 GA4 與 Search Console SEO 規劃書

## 目標

讓遊戲小小島收錄的 15 款遊戲（`config/games.json`）全部具備 GA4 流量統計與可被 Google 收錄的 SEO 基礎設定。做法是把大廳已驗證可行的流程整理成一支共用腳本，先在水果連連看試做，確認後再批次套用到其他 14 款，不手動逐款複製貼上。

## 現況盤點

- 15 款遊戲各自是獨立 repo，網址為 `https://pjh-eric.github.io/<遊戲名>/`，與大廳同網域。
- 15 款遊戲目前都沒有 GA4 追蹤碼。
- `bomb-squad`、`rainbow-bubble`、`richman` 三款的 `public/index.html` 沒有 `meta description`。
- 每款遊戲都是單頁應用（只有一個網址），所以每款的 sitemap 只會有一筆網址。
- 遊戲前端是 `public/` 直接發佈到 GitHub Pages，部署流程在 `.github/workflows/deploy-pages.yml`，已有 `scripts/inject-server-url.js` 在部署時注入設定，可以沿用同一種模式。
- `config/games.json` 中 `reversi` 的 `launchUrl` 結尾少了 `/`，會造成網址有無斜線兩種版本。
- 大廳 README 已說明：`github.io/<專案>/robots.txt` 不會被 Google 讀取，只認網域根目錄，所以需要根網域 repo 來提供 `robots.txt`。

## 設計決策

1. **GA4 共用同一個資源**（衡量 ID `G-PG79WZK8QY`）。各遊戲與大廳同網域，不需要設定跨網域，報表用「頁面路徑」或自訂參數 `game_id` 區分遊戲。
2. **追蹤碼與 SEO 標籤在部署時注入，不寫進原始碼**。與 `inject-server-url.js` 作法一致，好處是本機開發不會污染 GA4 資料，也不用在 15 個 repo 各維護一份 HTML 片段。
3. **每款遊戲一份 `seo.config.json`**，內容只放該遊戲獨有的文案與網址，共用腳本負責產生標籤。
4. **Search Console 以根網域單一資源為主（已決定建立根網域 repo）**：另建 repo `pjh-eric.github.io` 作為網域根目錄，放 `robots.txt`、`sitemap.xml` 與驗證標記，並建立 `https://pjh-eric.github.io/` 這個「網址前置字元」資源。
   - 網址前置字元資源涵蓋底下所有路徑，所以 15 款遊戲與大廳只需要驗證一次、提交一份 sitemap，不必建立 15 個資源。
   - 根目錄的 `robots.txt` 才會被 Google 讀取，可以一次說明抓取規則並指向 sitemap。
   - 各遊戲各自的 Search Console 資源改為選用（只在想單獨看某款成效時才建）。

## 影響範圍

每款遊戲 repo（共 15 個）：

- 新增 `seo.config.json`
- 新增 `scripts/inject-seo.js`（15 款內容相同）
- 新增 `public/js/analytics.js`（事件追蹤小工具）
- 修改 `public/index.html`：加入 `<!--SEO:HEAD-->` 標記、補齊缺少的 description
- 修改 `.github/workflows/deploy-pages.yml`：在上傳 artifact 之前執行 `node scripts/inject-seo.js`
- 修改 `tests/verify.js`：新增 SEO 設定檢查
- 修改各遊戲的 i18n 字典（`meta.title`、`meta.desc`），使其與 `seo.config.json` 一致，避免 JS 執行後把標題改回舊文案
- 修改遊戲主流程程式，在關鍵時機呼叫 `track()`

大廳 repo（game-lobby）：

- `config/games.json`：修正 `reversi` 的 `launchUrl`
- `app.js`：點擊遊戲卡片時送 `select_content` 事件
- `scripts/build-pages.js`：sitemap 維持不變

新增 repo（詳見「根網域 repo 詳細規劃」）：

- `pjh-eric.github.io`：`scripts/build.js`、`.github/workflows/deploy-pages.yml`、`seo.config.json`；建置後產生 `index.html`、`robots.txt`、`sitemap.xml`、`404.html`、`.nojekyll`

## 實作步驟

1. **盤點與修正基礎資料**
   - 修正 `reversi` 的 `launchUrl` 結尾斜線。
   - 確認 15 款遊戲的標題與說明文案，每款寫一組「玩家會搜的詞」：免費、免下載、線上多人、手機平板可玩，再加上遊戲類型。標題建議 30 字內，說明 70 到 110 字，且每款不可重複。
2. **撰寫共用腳本 `scripts/inject-seo.js`**
   - 讀取 `seo.config.json`，在 `public/index.html` 的 `<!--SEO:HEAD-->` 位置注入：gtag、canonical、robots、Open Graph、Twitter Card、JSON-LD。
   - 同時產生 `public/sitemap.xml`。
   - 缺少標記或必要欄位時直接失敗（與 `inject-server-url.js` 相同的嚴格風格，不靜默略過）。
3. **撰寫 `public/js/analytics.js`**
   - 提供 `track(name, params)`，找不到 `gtag`（例如本機或廣告阻擋）時自動略過，不影響遊戲運作。
   - 在 `gtag('config', ...)` 時設定共用參數 `game_id`。
4. **在水果連連看試做（試點）**
   - 完成步驟 2、3，修改 `index.html`、i18n 字典、workflow、`verify.js`。
   - 本機執行注入腳本，檢查產出的 `index.html` 與 `sitemap.xml`。
   - 推上 GitHub 部署，驗證線上結果（見驗證方式）。
5. **試點通過後批次套用其餘 14 款**
   - 以腳本複製共用檔案，再逐款填寫 `seo.config.json` 與 workflow 修改。
   - 分三批進行（每批 4 到 5 款），每批部署完成並驗證後再做下一批。
6. **接上事件追蹤**
   - 在各遊戲的開局、結束、建房、加入房間處呼叫 `track()`（事件清單見下方程式碼片段）。
   - 事件只加在既有流程的入口函式，不改動遊戲規則邏輯。
7. **大廳補強**
   - 遊戲卡片點擊送出 `select_content`，以便比較「大廳點擊數」與「遊戲實際開局數」。
8. **建立根網域 repo `pjh-eric.github.io`**（細節見後方專章）
   1. 先確認 GitHub 帳號 `PJH-Eric` 底下沒有同名 repo；repo 名稱必須完全等於 `pjh-eric.github.io`（全小寫）且為公開。
   2. 建立本機資料夾 `C:\Eric\AI Agent\pjh-eric.github.io`，`git init` 並寫入建置腳本、workflow 與設定。
   3. 建置腳本在部署時從已上線的大廳讀取 `config/games.json`，自動產生入口頁、`sitemap.xml` 與 `robots.txt`，之後上架新遊戲不必改這個 repo。
   4. 在 GitHub 建立 repo、設定 Pages 來源為 GitHub Actions，推送 `main` 後確認 `https://pjh-eric.github.io/` 與 `https://pjh-eric.github.io/robots.txt` 可正常開啟。
9. **Search Console 設定（只需做一次，需要 Eric 登入帳號操作）**
   1. 新增資源，選「網址前置字元」，輸入 `https://pjh-eric.github.io/`。
   2. 以 HTML 標記驗證：把 Google 給的 `content="…"` 填進根網域 repo 的 `seo.config.json` 的 `googleSiteVerification`，推送部署後回 Search Console 按驗證。
   3. 在「Sitemap」提交 `sitemap.xml`（根網域 repo 產生，已包含大廳與 15 款遊戲網址）。
   4. 在「網址檢查」依序貼上大廳與各遊戲網址，按「要求建立索引」加快第一次收錄（每日有配額，分幾天做即可）。
   5. 既有的大廳資源（`https://pjh-eric.github.io/game-lobby/`）可保留，不衝突。
10. **GA4 後台設定**
    - 到「管理 > 自訂定義」建立事件參數 `game_id`、`mode` 為自訂維度，報表才看得到。
    - 把 `game_start`、`game_end` 標記為主要轉換（可選）。
    - 建立一份「各遊戲開局數」探索報表。
11. **更新文件**
    - 大廳 README 新增「新遊戲上架 SEO／GA4 檢查清單」，並把「robots.txt 不需要」的舊說明改為指向根網域 repo。
    - 更新 `cute-game-builder` 流程，使日後新遊戲建立時就帶有 `seo.config.json` 與注入步驟。
12. **提交與推送**
    - commit 訊息使用繁體中文。
    - 本機 commit 由 Claude 完成；推送到 GitHub 需要憑證，若 Claude 這端沒有權限，由 Eric 執行 `git push`，或在授權後由 Claude 代為推送。

## 相關程式碼片段

### `<遊戲>/seo.config.json`

```json
{
  "id": "fruit-link",
  "siteUrl": "https://pjh-eric.github.io/fruit-link/",
  "title": "水果連連看｜免費線上多人連連看・免下載・手機平板可玩",
  "description": "免費免下載的線上水果連連看，三折內連線消除，幼幼班到困難四段難度，最多 6 人同盤搶消，手機平板都能玩。",
  "ogImage": "https://pjh-eric.github.io/fruit-link/og.png",
  "lobbyUrl": "https://pjh-eric.github.io/game-lobby/",
  "googleSiteVerification": "rlPZdhvS03EIxWXpZQsbp7esFPkyqIRBqdpBdkF1Tbk",
  "genre": "益智",
  "players": "1-6"
}
```

### `<遊戲>/public/index.html`（原始碼只加一個標記）

```html
<title>水果連連看</title>
<!--SEO:HEAD-->
<link rel="stylesheet" href="css/style.css">
```

### `<遊戲>/scripts/inject-seo.js`（節錄）

```js
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'seo.config.json'), 'utf8'));
const GA_ID = process.env.GA_MEASUREMENT_ID || 'G-PG79WZK8QY';
const MARK = '<!--SEO:HEAD-->';

for (const key of ['id', 'siteUrl', 'title', 'description']) {
  if (!cfg[key]) { console.error('✗ seo.config.json 缺少欄位：' + key); process.exit(1); }
}
if (!/^https:\/\/.+\/$/.test(cfg.siteUrl)) {
  console.error('✗ siteUrl 必須是以 / 結尾的 https 網址'); process.exit(1);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: cfg.title.split('｜')[0],
  url: cfg.siteUrl,
  description: cfg.description,
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  inLanguage: 'zh-Hant',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'TWD' },
  isPartOf: { '@type': 'WebSite', url: cfg.lobbyUrl },
};

const head = [
  `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>`,
  `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}` +
    `gtag('js',new Date());gtag('config','${GA_ID}',{game_id:'${cfg.id}'});</script>`,
  cfg.googleSiteVerification && `<meta name="google-site-verification" content="${esc(cfg.googleSiteVerification)}">`,
  `<meta name="description" content="${esc(cfg.description)}">`,
  `<link rel="canonical" href="${esc(cfg.siteUrl)}">`,
  '<meta name="robots" content="index, follow, max-image-preview:large">',
  '<meta property="og:type" content="website">',
  '<meta property="og:locale" content="zh_TW">',
  `<meta property="og:title" content="${esc(cfg.title)}">`,
  `<meta property="og:description" content="${esc(cfg.description)}">`,
  `<meta property="og:url" content="${esc(cfg.siteUrl)}">`,
  cfg.ogImage && `<meta property="og:image" content="${esc(cfg.ogImage)}">`,
  '<meta name="twitter:card" content="summary_large_image">',
  `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
].filter(Boolean).join('\n  ');

const indexPath = path.join(root, 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes(MARK)) { console.error('✗ index.html 缺少 ' + MARK); process.exit(1); }
html = html
  .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(cfg.title)}</title>`)
  .replace(/<meta name="description"[^>]*>\s*/g, '')
  .replace(MARK, () => head);
fs.writeFileSync(indexPath, html, 'utf8');

fs.writeFileSync(path.join(root, 'public', 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${esc(cfg.siteUrl)}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>
</urlset>
`, 'utf8');
console.log('✓ SEO 與 GA4 已注入：' + cfg.id);
```

### `<遊戲>/.github/workflows/deploy-pages.yml`（在上傳 artifact 之前新增一步）

```yaml
      - name: 注入 GA4 與 SEO 標籤
        run: node scripts/inject-seo.js

      - name: Upload public/ as artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: public
```

### `<遊戲>/public/js/analytics.js`

```js
(function (global) {
  'use strict';
  function track(name, params) {
    try {
      if (typeof global.gtag === 'function') global.gtag('event', name, params || {});
    } catch (e) { /* 追蹤失敗不能影響遊戲 */ }
  }
  global.GameAnalytics = { track: track };
})(window);
```

### 事件呼叫範例（各遊戲在既有的開局與結束入口加一行）

```js
GameAnalytics.track('game_start', { mode: 'online', difficulty: 'normal', players: roomSize });
GameAnalytics.track('game_end',   { mode: 'online', result: isWinner ? 'win' : 'lose', duration_sec: seconds });
GameAnalytics.track('room_create', { mode: 'online' });
GameAnalytics.track('room_join',   { via: 'invite_link' });   // 或 'lobby'
GameAnalytics.track('lobby_click', { target: 'lobby_home_link' });
```

### `tests/verify.js`（新增 SEO 檢查）

```js
const cfg = require('../seo.config.json');
assert.match(cfg.siteUrl, /^https:\/\/pjh-eric\.github\.io\/[a-z0-9-]+\/$/, 'siteUrl 格式錯誤');
assert.ok(cfg.title.length <= 40, 'title 過長');
assert.ok(cfg.description.length >= 40 && cfg.description.length <= 120, 'description 長度不在 40–120 字');
assert.ok(fs.readFileSync('public/index.html', 'utf8').includes('<!--SEO:HEAD-->'), 'index.html 缺少 SEO 標記');
```

### `game-lobby/config/games.json`（修正）

```json
{ "id": "reversi", "launchUrl": "https://pjh-eric.github.io/reversi/" }
```

根網域 repo 的程式碼片段請見下一章。

## 根網域 repo（`pjh-eric.github.io`）詳細規劃

### 目的

GitHub Pages 的「使用者網站」repo 會直接服務在網域根目錄 `https://pjh-eric.github.io/`，而 15 款遊戲與大廳都是專案頁（`/<專案名>/`）。根網域 repo 補上專案頁做不到的三件事：Google 讀得到的 `robots.txt`、一份涵蓋全部網址的 `sitemap.xml`、以及可一次管理所有遊戲的 Search Console 資源。專案頁路徑仍由各自 repo 服務，兩者不會互相覆蓋。

### 檔案結構

```text
pjh-eric.github.io/
├─ .github/workflows/deploy-pages.yml   部署與每日重新產生
├─ scripts/build.js                     讀大廳設定並產生 dist/
├─ seo.config.json                      驗證碼、GA4 ID、大廳設定網址
├─ README.md                            維護說明
└─ dist/（建置產物，不進版控）
   ├─ index.html     入口頁（列出全部遊戲）
   ├─ robots.txt
   ├─ sitemap.xml
   ├─ 404.html
   └─ .nojekyll
```

### 設計重點

- **內容自動同步**：建置腳本讀取 `https://pjh-eric.github.io/game-lobby/config/games.json`，遊戲清單、標題與說明都來自這份檔案，大廳上架新遊戲後，根網域 repo 在下一次建置時自動更新，不必手動維護。
- **更新時機**：`push` 到 `main`、手動執行、以及每天排程一次（避免大廳更新後這邊過期）。
- **入口頁與大廳要有區別**：入口頁用簡短介紹加全部遊戲連結，`canonical` 指向自己，大廳連結放在最顯眼位置，避免兩頁內容重複被 Google 判定為重複內容。
- **不使用自動轉址**：入口頁是真實可讀的頁面，不做 JS 或 meta refresh 轉址，Google 才會把它當作正常頁面收錄。
- **sitemap 內容**：根網址、大廳網址與 15 款遊戲網址，共 17 筆；各遊戲網址一律以 `/` 結尾，與各遊戲 `canonical` 完全一致。
- **失敗要明確**：抓不到 `games.json`、格式不對、或遊戲網址不是 `https://pjh-eric.github.io/…/` 開頭時，建置直接失敗，不產生半成品。
- **GA4**：入口頁也加 gtag，`game_id` 設為 `root`，可以看出有多少人從根網址進站。
- **隱私**：repo 為公開，裡面只放網址與驗證碼，沒有任何金鑰。

### 程式碼片段

`seo.config.json`

```json
{
  "siteUrl": "https://pjh-eric.github.io/",
  "lobbyUrl": "https://pjh-eric.github.io/game-lobby/",
  "gamesJsonUrl": "https://pjh-eric.github.io/game-lobby/config/games.json",
  "title": "遊戲小小島入口｜免費線上多人小遊戲・免下載・手機平板可玩",
  "description": "免費免下載的線上小遊戲合集，連連看、數獨、大富翁、撞球、黑白棋等十五款，單機、電腦對戰與線上多人都能玩，手機平板皆可。",
  "googleSiteVerification": "",
  "gaMeasurementId": "G-PG79WZK8QY"
}
```

`scripts/build.js`（節錄）

```js
'use strict';
const fs = require('fs');
const path = require('path');

const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'seo.config.json'), 'utf8'));
const out = path.join(__dirname, '..', 'dist');
const ORIGIN = 'https://pjh-eric.github.io/';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

async function main() {
  const res = await fetch(cfg.gamesJsonUrl);
  if (!res.ok) throw new Error(`抓不到大廳設定：HTTP ${res.status}`);
  const lobby = await res.json();
  const games = lobby.games || [];
  if (!games.length) throw new Error('games.json 沒有任何遊戲');
  for (const g of games) {
    if (!g.launchUrl.startsWith(ORIGIN) || !g.launchUrl.endsWith('/')) {
      throw new Error(`遊戲網址不合格式（須以 ${ORIGIN} 開頭並以 / 結尾）：${g.id} ${g.launchUrl}`);
    }
  }

  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  const urls = [cfg.siteUrl, cfg.lobbyUrl, ...games.map((g) => g.launchUrl)];
  fs.writeFileSync(path.join(out, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
    `\n</urlset>\n`, 'utf8');

  fs.writeFileSync(path.join(out, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${cfg.siteUrl}sitemap.xml\n`, 'utf8');

  const list = games.map((g) =>
    `<li><a href="${esc(g.launchUrl)}"><strong>${esc(g.title)}</strong></a>：${esc(g.description)}</li>`).join('\n      ');

  const html = `<!doctype html>
<html lang="zh-Hant">
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=${cfg.gaMeasurementId}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${cfg.gaMeasurementId}',{game_id:'root'});</script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(cfg.title)}</title>
  <meta name="description" content="${esc(cfg.description)}">
  ${cfg.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(cfg.googleSiteVerification)}">` : ''}
  <link rel="canonical" href="${esc(cfg.siteUrl)}">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(cfg.title)}">
  <meta property="og:description" content="${esc(cfg.description)}">
  <meta property="og:url" content="${esc(cfg.siteUrl)}">
</head>
<body>
  <main>
    <h1>遊戲小小島</h1>
    <p>${esc(cfg.description)}</p>
    <p><a href="${esc(cfg.lobbyUrl)}">前往遊戲大廳</a></p>
    <h2>全部遊戲</h2>
    <ul>
      ${list}
    </ul>
  </main>
</body>
</html>
`;
  fs.writeFileSync(path.join(out, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(out, '404.html'),
    html.replace(/<title>[\s\S]*?<\/title>/, '<title>找不到頁面｜遊戲小小島</title>')
        .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex">'), 'utf8');
  fs.writeFileSync(path.join(out, '.nojekyll'), '', 'utf8');
  console.log(`✓ 根網域建置完成：${urls.length} 筆網址`);
}

main().catch((e) => { console.error('✗ ' + e.message); process.exit(1); });
```

`.github/workflows/deploy-pages.yml`

```yaml
name: 部署根網域

on:
  push:
    branches: [main]
  schedule:
    - cron: "17 20 * * *"   # 每天台灣時間凌晨 04:17，重新讀取大廳設定
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "26.12.1"
      - uses: actions/configure-pages@v5
      - name: 產生入口頁、sitemap、robots
        run: node scripts/build.js
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

建置後的 `robots.txt` 內容：

```text
User-agent: *
Allow: /

Sitemap: https://pjh-eric.github.io/sitemap.xml
```

### 建立與上線步驟（含需要 Eric 操作的部分）

1. Claude：在本機建立資料夾與檔案、執行 `node scripts/build.js` 驗證產物、完成第一個 commit（繁體中文訊息）。
2. Eric：在 GitHub 建立公開 repo `pjh-eric.github.io`，把本機 remote 指向它並推送（Claude 這端沒有推送憑證，或在授權後由 Claude 代為推送）。
3. Eric：到 repo 的 Settings → Pages，將 Source 設為 **GitHub Actions**。
4. 確認 workflow 成功後，開啟 `https://pjh-eric.github.io/`、`/robots.txt`、`/sitemap.xml` 檢查內容。
5. Eric：在 Search Console 完成「步驟 9」的驗證與提交，並把驗證碼填回 `seo.config.json` 再推送一次。

### 注意事項

- repo 名稱必須是 `pjh-eric.github.io`，名稱拼錯就不會被當成根網域網站。
- 大廳的 `games.json` 必須已部署上線（`dist/config/games.json` 可被公開讀取）；若某天大廳部署失敗，根網域建置也會失敗，不會產生錯誤內容，下次排程自動恢復。
- 根網域 repo 的 `404.html` 只對根層級不存在的路徑生效，各專案頁自己的 404 不受影響。
- 若日後綁定自訂網域，需要同步更新 `siteUrl`、各遊戲 `seo.config.json` 的網址、sitemap 與 Search Console 資源。

## 驗證方式

每款遊戲都要通過以下檢查：

- **本機建置**：`node scripts/inject-seo.js` 成功，輸出的 `public/index.html` 含 gtag、canonical、OG、JSON-LD，且 `public/sitemap.xml` 只有一筆正確網址；測試後用 `git checkout public/index.html` 還原，避免把注入結果提交。
- **自動測試**：`npm run verify`（或 `node tests/verify.js`）全數通過，且既有線上流程測試不受影響。
- **跨 repo 檢查**：新增一支 `scripts/check-seo-all.js`（放在 game-lobby），逐一抓取 15 個正式網址，檢查是否有 gtag、canonical 是否等於自己的網址、title 與 description 是否重複。
- **部署後 GA4**：用自己的瀏覽器開啟遊戲，到 GA4「即時」報表確認看得到該遊戲頁面與 `game_start` 事件；確認本機（localhost）開啟時沒有送出資料。
- **部署後 Search Console**：「網址檢查」按「測試線上網址」，確認可被索引、canonical 為自己；sitemap 狀態為「成功」。
- **根網域 repo**：本機執行 `node scripts/build.js` 後，`dist/sitemap.xml` 為 17 筆網址、`dist/robots.txt` 含正確的 Sitemap 行、`dist/index.html` 含全部 15 款遊戲連結；故意把 `gamesJsonUrl` 改錯時，建置必須失敗。
- **根網域上線後**：`https://pjh-eric.github.io/robots.txt` 與 `/sitemap.xml` 可直接開啟；Search Console 的「robots.txt 狀態」與 sitemap 皆為成功；既有的 `/game-lobby/` 與各遊戲網址不受影響、仍可正常開啟。
- **結構化資料**：用 Google 豐富結果測試驗證 JSON-LD 沒有錯誤。
- **i18n 一致性**：切換語言前後，`document.title` 與 meta description 符合預期，不會被字典舊文案覆蓋。
- **RWD 與外觀**：本計畫不改動畫面，但仍抽查手機、平板直橫向與桌機各一次，確認追蹤碼沒有造成載入延遲或破版。
- **收錄觀察**：提交後 1 到 2 週，在 Search Console 檢視「網頁索引」與「成效」，確認收錄數增加；Google 收錄需要時間，不保證立即出現。

## 風險與注意事項

- GA4 目前只有一個資源，網站層級的數字會把大廳與所有遊戲加在一起，需要用 `game_id` 篩選。
- 若日後遊戲改成多個網址（例如獨立的說明頁），要同步更新該遊戲的 `sitemap.xml` 產生邏輯。
- 台灣若有隱私或 Cookie 告知需求，GA4 屬於會蒐集使用者行為資料的服務，建議在大廳頁尾補上隱私說明（本計畫不處理文案，建議另案確認）。
- 注入腳本會改寫 `public/index.html`，所以只能在 CI 執行，不要在本機對工作目錄執行後再提交。

- 根網域 repo 與各遊戲的 sitemap 內容重複不是問題，但要確保網址完全一致（有無結尾 `/`、`https`），否則 Google 會視為不同網址。
- 一個 GitHub 帳號只能有一個使用者網站 repo；若 `pjh-eric.github.io` 已被用在別處，需先確認再動工。

## 不包含項目

- 依需求不提供 SQL script。
- 依需求不提供 Migration（本案不涉及資料庫變更）。
- 不包含遊戲玩法、美術、RWD 的調整。
- 不包含付費廣告、AdSense 或 Google Tag Manager 容器設定。
