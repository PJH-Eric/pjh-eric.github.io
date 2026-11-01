# @pjh/web-core

全遊戲共用的前端核心，**這裡是唯一的原始檔**：

- `analytics.js`：GA4 事件封裝（`window.GameAnalytics`）
- `i18n.js`：多語系引擎（`window.I18N`）

各款遊戲 `public/js/` 內的同名檔案由 `npm run sync` 從這裡複製過去；不要直接改遊戲裡的複本，
`npm run check:sync` 會偵測複本和這裡不一致。

> `config.js`（伺服器網址設定）各款已分歧，會在後續步驟整併後再加入。
