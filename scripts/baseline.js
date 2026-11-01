'use strict';
// 盤點每款遊戲的基準資料：程式行數、連線層、i18n／analytics 是否與共用版相同。
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'games.json'), 'utf8'));
const md5 = (f) => (fs.existsSync(f) ? crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex').slice(0, 8) : '-');
const rows = manifest.games.map((g) => {
  const dir = path.join(root, g.projectFolder, 'public/js');
  return { id: g.id, server: g.server, build: g.buildType, i18n: md5(path.join(dir, 'i18n.js')), analytics: md5(path.join(dir, 'analytics.js')), config: md5(path.join(dir, 'config.js')) };
});
console.table(rows);
