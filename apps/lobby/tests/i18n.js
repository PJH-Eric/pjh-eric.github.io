/* 多語系完整性：字典 key 一致、HTML／JS 用到的 key 都存在、games.json 每款遊戲都有英文欄位。 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const sandbox = { console, URL, URLSearchParams };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(read('i18n.js'), sandbox);
vm.runInContext(read('locales.js'), sandbox);
const I18N = sandbox.I18N;
assert.ok(I18N, 'i18n.js 要建立 I18N');

/* 取出字典：重新執行 locales.js 並攔截 register */
const dicts = {};
const stub = { register(code, dict) { dicts[code] = { ...(dicts[code] || {}), ...dict }; return stub; } };
const stubWin = { I18N: stub }; stubWin.window = stubWin; vm.runInContext(read('locales.js'), vm.createContext(stubWin));
const zhKeys = Object.keys(dicts['zh-Hant']).sort();
const enKeys = Object.keys(dicts.en).sort();
assert.deepEqual(zhKeys, enKeys, 'zh-Hant 與 en 的字典 key 必須一致');
assert.ok(zhKeys.length > 50);
for (const key of enKeys) {
  const value = dicts.en[key];
  if (typeof value === 'string') assert.ok(!/[一-鿿]/.test(value), `en 字典 ${key} 殘留中文`);
  assert.notEqual(value, '', `en 字典 ${key} 不可為空`);
}

/* HTML 用到的 key、JS 用到的 t('key') 都要有 */
const html = read('index.html');
const used = new Set();
for (const m of html.matchAll(/data-i18n(?:-html|-title|-content)?="([^"]+)"/g)) used.add(m[1]);
for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
  for (const pair of m[1].split(';')) used.add(pair.split('=')[1].trim());
}
const app = read('app.js');
for (const m of app.matchAll(/\bt\('([\w.]+)'/g)) used.add(m[1]);
for (const m of app.matchAll(/'(cat\.\w+)'/g)) used.add(m[1]);
for (const key of used) assert.ok(zhKeys.includes(key), `用到的字典 key 不存在：${key}`);
assert.ok(zhKeys.includes('lang.switchTo'), '要有切換鈕的 aria-label 字典');

/* 載入順序：i18n.js → locales.js → app.js；<html> 預設 zh-Hant */
const order = [/src="i18n\.js(?:\?[^"]*)?"/, /src="locales\.js(?:\?[^"]*)?"/, /src="app\.js(?:\?[^"]*)?"/]
  .map((pattern) => html.search(pattern));
assert.ok(order.every((n) => n > 0) && order[0] < order[1] && order[1] < order[2], '腳本載入順序要是 i18n.js、locales.js、app.js');
assert.match(html, /<html lang="zh-Hant"[^>]*data-i18n-title="meta\.title"/);
assert.match(html, /name="description"[^>]*data-i18n-content="meta\.description"/);
assert.ok(html.includes('id="settings-open"'), '切換鈕掛在設定鈕旁');
assert.ok(app.includes('mountToggle({ after: $(\'#settings-open\') })'), '語言切換鈕要放在設定鈕旁');
assert.ok(app.includes('I18N.withLang') || app.includes('window.I18N.withLang'), '開啟遊戲連結要附 ?lang=');

/* 建置腳本要把新檔案複製到 dist */
const build = read('scripts/build-pages.js');
for (const file of ['i18n.js', 'locales.js']) assert.ok(build.includes(`'${file}'`), `build-pages.js 要複製 ${file}`);

/* games.json：每款遊戲都有英文版，站台名稱也有英文 */
const config = JSON.parse(read('config/games.json'));
assert.ok(config.i18n && config.i18n.en && config.i18n.en.title, 'config 要有 i18n.en.title');
for (const game of config.games) {
  const en = game.i18n && game.i18n.en;
  assert.ok(en, `${game.id} 缺少 i18n.en`);
  for (const field of ['title', 'eyebrow', 'description', 'controls', 'badge']) {
    assert.ok(typeof en[field] === 'string' && en[field].trim(), `${game.id} 缺少 i18n.en.${field}`);
    assert.ok(!/[一-鿿]/.test(en[field]), `${game.id} 的 i18n.en.${field} 殘留中文`);
  }
  for (const field of ['tags', 'modes']) {
    assert.ok(Array.isArray(en[field]) && en[field].length === (game[field] || []).length, `${game.id} 的 i18n.en.${field} 數量要和中文一致`);
    for (const item of en[field]) assert.ok(item && !/[一-鿿]/.test(item), `${game.id} 的 i18n.en.${field} 殘留中文`);
  }
}
assert.equal(new Set(config.games.map((g) => g.i18n.en.title)).size, config.games.length, '英文遊戲名稱不可重複');

/* withLang 行為 */
sandbox.location = { href: 'https://example.com/' };
assert.match(I18N.withLang('https://pjh-eric.github.io/flip-match/'), /\?lang=zh-Hant$/);

console.log('game-lobby i18n verify passed (' + zhKeys.length + ' keys)');
