'use strict';
/* 許多原專案的瀏覽器檢查把 playwright 寫死成 /opt/npm-tools/node_modules/playwright（原作者的 Linux 環境）。
 * 驗證器用 NODE_OPTIONS=--require 載入這個墊片，把該路徑導向 all-in-one 根目錄安裝的 playwright，
 * 不必修改任何測試檔。 */
const Module = require('module');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const orig = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (typeof request === 'string' && /^[\/\\]opt[\/\\]npm-tools[\/\\]node_modules[\/\\]/.test(request)) {
    const name = request.replace(/^[\/\\]opt[\/\\]npm-tools[\/\\]node_modules[\/\\]/, '');
    return orig.call(this, path.join(root, 'node_modules', name), parent, ...rest);
  }
  return orig.call(this, request, parent, ...rest);
};
