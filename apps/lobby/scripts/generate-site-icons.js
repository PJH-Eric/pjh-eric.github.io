'use strict';

// 開發工具：使用現有 SVG 美術輸出可直接抓取的圖示，產物隨各專案提交。
// 需要 sharp；可透過 NODE_PATH 使用工作區已有的工具套件，不是網站執行依賴。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const workspace = path.dirname(root);
const config = JSON.parse(fs.readFileSync(path.join(root, 'config/games.json'), 'utf8'));
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const iconFunction = app.slice(app.indexOf('  function iconSvg('), app.indexOf('  function cardMarkup('));
const iconSvg = vm.runInNewContext('(function(){const iconStroke="#352f3c";' + iconFunction + ';return iconSvg;})()');
const palette = { sky: '#b8e1f5', pink: '#ffb5c5', lilac: '#d8c9f2', mint: '#bfe8d5', peach: '#ffc5a6', lemon: '#ffe49a', lime: '#d7ec9c' };
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));

async function writeCover(image, target) {
  const { data, info } = await sharp(image).raw().toBuffer({ resolveWithObject: true });
  const stride = info.width * info.channels;
  const top = 22;
  const height = 675;
  const output = Buffer.alloc(stride * height);
  data.copy(output, 0, 0, stride);
  for (let row = 1; row < top; row++) data.copy(output, row * stride, 0, stride);
  for (let row = 0; row < info.height; row++) {
    data.copy(output, (top + row) * stride, row * stride, (row + 1) * stride);
  }
  const lastRow = (info.height - 1) * stride;
  for (let row = top + info.height; row < height; row++) {
    data.copy(output, row * stride, lastRow, lastRow + stride);
  }
  const coverFolder = path.dirname(target);
  fs.mkdirSync(coverFolder, { recursive: true });
  await sharp(output, { raw: { width: info.width, height, channels: info.channels } })
    .webp({ lossless: true, method: 6 })
    .toFile(target);
}

function sourceSvg(game, folder) {
  const existing = path.join(folder, 'favicon.svg');
  if (fs.existsSync(existing)) return fs.readFileSync(existing, 'utf8');
  const html = fs.readFileSync(path.join(folder, 'index.html'), 'utf8');
  const links = html.match(/<link\b[^>]*>/gi) || [];
  for (const link of links.filter(link => /rel=["']icon["']/.test(link))) {
    const href = link.match(/href=("[^"]*"|'[^']*')/);
    if (!href) continue;
    const value = href[1].slice(1, -1);
    if (value.startsWith('data:image/svg+xml,')) return decodeURIComponent(value.slice('data:image/svg+xml,'.length));
    if (value === 'icon.svg' && fs.existsSync(path.join(folder, value))) return fs.readFileSync(path.join(folder, value), 'utf8');
  }
  return iconSvg(game.icon).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
}

async function ico(svg) {
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map(size => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()));
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  images.forEach((image, i) => {
    const at = 6 + i * 16;
    header[at] = header[at + 1] = sizes[i];
    header.writeUInt16LE(1, at + 4); header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(image.length, at + 8); header.writeUInt32LE(offset, at + 12);
    offset += image.length;
  });
  return Buffer.concat([header, ...images]);
}

async function generate(game, folder, includeShare) {
  fs.mkdirSync(path.join(folder, 'icons'), { recursive: true });
  const svg = sourceSvg(game, folder);
  fs.writeFileSync(path.join(folder, 'favicon.svg'), svg.trim() + '\n', 'utf8');
  for (const [name, size] of [['favicon-96.png', 96], ['apple-touch-icon.png', 180], ['icons/icon-192.png', 192], ['icons/icon-512.png', 512]]) {
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(folder, name));
  }
  fs.writeFileSync(path.join(folder, 'favicon.ico'), await ico(svg));
  if (includeShare) {
    const color = palette[game.accent] || palette.sky;
    const art = await sharp(Buffer.from(svg)).resize(380, 380).png().toBuffer();
    const background = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">' +
      '<rect width="1200" height="630" fill="#fff8ed"/><circle cx="160" cy="320" r="370" fill="' + color + '"/>' +
      '<rect x="80" y="110" width="420" height="420" rx="72" fill="#fffdf8" stroke="#352f3c" stroke-width="6"/>' +
      '<text x="570" y="220" font-family="Microsoft JhengHei, sans-serif" font-size="24" fill="#8b6676" letter-spacing="4">ISLAND ARCADE</text>' +
      '<text x="570" y="320" font-family="Microsoft JhengHei, sans-serif" font-size="' + (game.title.length > 7 ? '48' : '58') + '" font-weight="700" fill="#352f3c">' + esc(game.title) + '</text>' +
      '<text x="570" y="390" font-family="Microsoft JhengHei, sans-serif" font-size="28" fill="#736b77">' + esc(game.eyebrow || '免費線上小遊戲') + '</text>' +
      '<text x="570" y="475" font-family="Microsoft JhengHei, sans-serif" font-size="24" fill="#736b77">免下載 · 手機、平板、電腦都能玩</text></svg>';
    const shareImage = await sharp(Buffer.from(background)).composite([{ input: art, left: 100, top: 130 }]).png().toBuffer();
    await sharp(shareImage).png().toFile(path.join(folder, 'og-image.png'));
    await writeCover(shareImage, path.join(folder, 'assets', 'images', 'cover.webp'));
  }
  console.log('✓ icons ' + game.id);
}

async function main() {
  for (const game of config.games) await generate(game, path.join(workspace, game.projectFolder, 'public'), true);
  for (const folder of [
    path.join(workspace, 'snake-3d-unity', 'Assets', 'WebGLTemplates', 'SnakeTemplate', 'static')
  ]) {
    const source = path.join(folder, 'og-image.png');
    if (fs.existsSync(source)) await writeCover(source, path.join(folder, 'assets', 'images', 'cover.webp'));
  }
  await generate({ id: 'game-lobby', title: config.title }, root, false);
  const hostRoot = path.join(workspace, 'pjh-eric.github.io');
  for (const file of ['favicon.svg', 'favicon-96.png', 'favicon.ico', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png']) {
    fs.mkdirSync(path.dirname(path.join(hostRoot, 'assets', file)), { recursive: true });
    fs.copyFileSync(path.join(root, file), path.join(hostRoot, 'assets', file));
  }
  fs.copyFileSync(path.join(root, 'assets/og-image.png'), path.join(hostRoot, 'assets/og-image.png'));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
