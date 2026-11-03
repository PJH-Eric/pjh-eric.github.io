'use strict';
// 把原專案目前的檔案複製進 all-in-one；原專案只讀，目的地不會刪除來源已不存在的檔案。
// 預設只列出差異；加 --write 才會覆寫 all-in-one 內的複本。
//   node scripts/resync-from-originals.js [遊戲 id ...] [--write]
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const originals = path.resolve(root, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'games.json'), 'utf8'));
const only = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const write = process.argv.includes('--write');
const summaryOnly = process.argv.includes('--summary');
const excludedNames = new Set([
  '.git', 'node_modules', 'dist', 'screenshots', 'test-results', 'playwright-report'
]);

function excluded(relativePath) {
  const parts = relativePath.split(path.sep);
  return parts.some((name) => excludedNames.has(name) || name.startsWith('.loop') ||
    name === '.env' || (name.startsWith('.env.') && name !== '.env.example') ||
    name.endsWith('.key') || name.includes('.timestamp-') || name === '全遊戲整合規劃書.md');
}

function sameEntry(source, destination) {
  if (!fs.existsSync(destination) && !isSymlink(destination)) return false;
  const a = fs.lstatSync(source);
  const b = fs.lstatSync(destination);
  if (a.isSymbolicLink() || b.isSymbolicLink()) {
    return a.isSymbolicLink() && b.isSymbolicLink() && fs.readlinkSync(source) === fs.readlinkSync(destination);
  }
  if (!a.isFile() || !b.isFile() || a.size !== b.size) return false;
  return fs.readFileSync(source).equals(fs.readFileSync(destination));
}

function isSymlink(file) {
  try { return fs.lstatSync(file).isSymbolicLink(); }
  catch (error) { return false; }
}

function scan(sourceDir, destinationDir) {
  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    throw new Error('找不到原專案資料夾：' + sourceDir);
  }
  const changes = [];
  const directories = [];
  function walk(source, destination, relative) {
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
      const rel = relative ? path.join(relative, entry.name) : entry.name;
      if (excluded(rel)) continue;
      const from = path.join(source, entry.name);
      const to = path.join(destination, entry.name);
      const stat = fs.lstatSync(from);
      if (stat.isDirectory()) {
        if (!fs.existsSync(to)) directories.push(to);
        else if (!fs.statSync(to).isDirectory()) throw new Error('目的地型態不同，請先處理：' + to);
        walk(from, to, rel);
      } else if (!sameEntry(from, to)) {
        changes.push({ source: from, destination: to, relative: rel, symlink: stat.isSymbolicLink() });
      }
    }
  }
  walk(sourceDir, destinationDir, '');
  return { changes, directories };
}

const jobs = manifest.games.map((game) => [game.id, path.join(originals, game.id), path.join(root, game.projectFolder)]);
let failed = false;
for (const [id, source, destination] of jobs) {
  if (only.length && !only.includes(id)) continue;
  try {
    const result = scan(source, destination);
    console.log((result.changes.length ? '差異 ' + result.changes.length + ' 檔：' : '相同：') + id);
    if (!summaryOnly) result.changes.forEach((change) => console.log('  ' + change.relative));
    if (write) {
      for (const directory of result.directories) fs.mkdirSync(directory, { recursive: true });
      for (const change of result.changes) {
        fs.mkdirSync(path.dirname(change.destination), { recursive: true });
        if (isSymlink(change.destination)) {
          fs.unlinkSync(change.destination);
        }
        if (fs.existsSync(change.destination) && fs.statSync(change.destination).isDirectory()) {
          throw new Error('目的地型態不同，請先處理：' + change.destination);
        }
        if (change.symlink && fs.existsSync(change.destination)) fs.unlinkSync(change.destination);
        if (change.symlink) fs.symlinkSync(fs.readlinkSync(change.source), change.destination);
        else {
          fs.copyFileSync(change.source, change.destination);
          const mode = fs.statSync(change.destination).mode;
          if (!(mode & 0o200)) fs.chmodSync(change.destination, mode | 0o200);
        }
      }
      if (result.changes.length) console.log('  已同步：' + id);
    }
  } catch (error) {
    failed = true;
    console.error('同步失敗：' + id + '：' + error.message);
  }
}
if (failed) process.exitCode = 1;
