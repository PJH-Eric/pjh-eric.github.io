'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

test('保留整合站遊戲路徑，讓 WebSocket 連到正確的遊戲', () => {
  const source = fs.readFileSync(path.join(__dirname, '../public/js/config.js'), 'utf8')
    .replace(/^import .*;\r?\n/gm, '').replace('export const CONFIG', 'globalThis.CONFIG');
  const context = vm.createContext({
    URL, t: (s) => s,
    window: { __GAME_CONFIG__: { serverUrl: 'https://games.example.test/g/house-stack/' } },
    location: { hostname: 'games.example.test', protocol: 'https:', port: '' },
  });
  vm.runInContext(source, context);
  assert.equal(context.CONFIG.serverUrl, 'https://games.example.test/g/house-stack');
  assert.equal(context.CONFIG.onlineAvailable, true);
});
