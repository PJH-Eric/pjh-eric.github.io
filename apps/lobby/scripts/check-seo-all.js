'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'config/games.json'), 'utf8'));
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* 3D貪吃蛇是 Vite 建置（client/index.html、沒有 seo.config.json），GA4 由自己的 client 單元測試驗證 */
function runSnakeAnalytics(repo) {
  const client = path.join(repo, 'client');
  return spawnSync(process.execPath, [path.join(client, 'node_modules', 'vitest', 'vitest.mjs'), 'run', 'tests/analytics.test.js'], { cwd: client, encoding: 'utf8' });
}

async function main() {
  const titles = new Set(), descriptions = new Set();
  let errors = 0;
  for (const game of config.games) {
    try {
      const repo = path.resolve(root, '..', game.projectFolder);
      if (game.id === 'snake-3d') {
        const result = runSnakeAnalytics(repo);
        if (result.status !== 0) throw new Error(result.stdout + result.stderr);
        if (!fs.readFileSync(path.join(repo, 'client', 'index.html'), 'utf8').includes('GAME_ANALYTICS_CONFIG')) throw new Error('缺少 GA4 設定');
        console.log('✓ snake-3d GA4（Vite 建置；由 client/tests/analytics.test.js 驗證，不檢查 SEO 注入／sitemap）');
        continue;
      }
      if (game.id === 'maze-roll') {
        const result = spawnSync(process.execPath, ['tests/analytics.js'], { cwd: repo, encoding: 'utf8' });
        if (result.status !== 0) throw new Error(result.stdout + result.stderr);
        console.log('✓ maze-roll GA4（沿用獨立建置；不檢查未提供的 SEO 注入／sitemap）');
        continue;
      }
      const cfg = JSON.parse(fs.readFileSync(path.join(repo, 'seo.config.json'), 'utf8'));
      if (cfg.siteUrl !== game.launchUrl) throw new Error('大廳與 canonical 網址不一致');
      if (titles.has(cfg.title) || descriptions.has(cfg.description)) throw new Error('SEO 文案重複');
      titles.add(cfg.title); descriptions.add(cfg.description);
      if (process.argv.includes('--local')) {
        const result = spawnSync(process.execPath, ['tests/seo.js'], { cwd: repo, encoding: 'utf8' });
        if (result.status !== 0) throw new Error(result.stdout + result.stderr);
      } else {
        const response = await fetch(game.launchUrl, { signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const html = await response.text();
        if (!html.includes('GAME_ANALYTICS_CONFIG') || !html.includes('js/analytics.js')) throw new Error('缺少 GA4 設定或共用追蹤程式');
        if (!html.includes('<link rel="canonical" href="' + cfg.siteUrl + '">')) throw new Error('canonical 不一致');
        if (!html.includes('<title>' + esc(cfg.title) + '</title>')) throw new Error('title 不一致');
        if (!html.includes('content="' + esc(cfg.description) + '"')) throw new Error('description 不一致');
        const sitemap = await fetch(cfg.siteUrl + 'sitemap.xml', { signal: AbortSignal.timeout(20000) });
        const xml = await sitemap.text();
        if (!sitemap.ok || (xml.match(/<loc>/g) || []).length !== 1 || !xml.includes(cfg.siteUrl)) throw new Error('sitemap 不正確');
      }
      console.log('✓ ' + game.id);
    } catch (error) { errors++; console.error('✗ ' + game.id + ': ' + error.message); }
  }
  if (errors) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
