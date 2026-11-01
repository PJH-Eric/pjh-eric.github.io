'use strict';
/* 把「伺服器網址」寫進各遊戲的連線設定。build-all（建置時）與 game-server（本機開發時即時轉換）共用。
 * 回傳 { text, kind }；kind = 'none' 代表這份檔案不含可注入的標記。 */
const LINE = /(\/\* GAME_SERVER_URL:BEGIN[\s\S]*?\*\/\s*\n\s*var INJECTED = )'[^']*'(;)/;
function injectConfig(text, url) {
  if (LINE.test(text)) return { text: text.replace(LINE, (m, a, b) => a + "'" + url + "'" + b), kind: 'marker' };
  if (/var REMOTE = '';/.test(text)) return { text: text.replace("var REMOTE = '';", "var REMOTE = '" + url + "';"), kind: 'remote' };
  if (text.includes('__GAME_SERVER_URL__')) return { text: text.split('__GAME_SERVER_URL__').join(url), kind: 'placeholder' };
  return { text, kind: 'none' };
}
const envJs = (url) => 'window.__GAME_CONFIG__ = ' + JSON.stringify({ serverUrl: url }) + ';\n';
module.exports = { injectConfig, envJs };
