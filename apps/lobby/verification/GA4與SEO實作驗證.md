# GA4 與 SEO 本機實作驗證

日期：2026-10-16。範圍為規劃書的本機程式碼變更，涵蓋 15 款遊戲、大廳及新建根網站，共 17 個專案。

## 已完成

- 15 款遊戲各有 `seo.config.json`、部署注入腳本、analytics 工具及 SEO 測試；部署前執行檢查並產生 canonical、robots meta、OG、Twitter Card、JSON-LD、單頁 sitemap 與 GA4。
- 繁中 document title、description 與設定一致；沿用各遊戲自己的 metadata key。瀏覽器實際切換英文再切回繁中，15 款皆符合預期。
- 接上開局、結算、成功建房／加入及返回大廳事件。重複快照、結算重繪及同房重連有去重；觀戰不計開局。單機練習沒有自然勝負時，使用 `complete` 結果；你畫我猜單機練習離開時結束統計。
- GA4 共用衡量 ID，game_id 由各遊戲 config 初始化；大廳為 lobby，根入口為 root。三者僅於正式 hostname 載入 GA；page_location 不含邀請 query/hash。事件不傳送房號、暱稱與邀請碼。
- 大廳所有進入遊戲入口送 select_content，並修正內層連結／按鈕的 Enter 冒泡造成重複開啟的情形；黑白棋 launchUrl 補齊結尾斜線。
- 共用腳本來源放在 `scripts/seo/`，可批次同步與比對 15 個 repo，另提供本機／正式網址檢查工具。
- `pjh-eric.github.io` 已建立本機 Git repository，提供根入口、robots.txt、總 sitemap、404、每日 Actions 建置及測試。建置從已上線大廳取得清單，也可指定本機檔案離線驗證。
- 寶島大富翁的房間投影新增 gameId（對局建立時間），讓前端使用穩定識別避免每包同步重算開局；未改遊戲規則。後端及前端都需要部署此專案版本。
- 無現成 og.png 的遊戲不填入不存在的圖片網址；採 summary 分享卡，之後可在設定補上實際 HTTPS 圖片。

## 驗證結果

環境：Windows、Node.js v22.23.2、Playwright Chromium。本機伺服器與假 gtag 捕捉事件，不以測試資料冒充 GA4 正式報表。

| 檢查 | 結果 |
| --- | --- |
| 15 款 `node tests/seo.js` | 全數通過：設定、標記、單筆 sitemap、重複注入、缺少標記／錯誤設定失敗、語系一致、本機隔離、事件去重與入房確認 |
| 15 款 `node tests/verify.js` | 全數通過；射氣球並行執行時曾有 CPU 耗時門檻失敗，單獨重跑 265 項全過 |
| 15 款 `node tests/localization.js` | 全數通過；有獨立 tests/i18n.js 的遊戲亦執行該檢查 |
| 14 款既有 online-check | 全數通過；翻牌配對碰沒有獨立的 online-check，使用既有 verify 測試 |
| 下樓梯 `scripts/netcode-check.js` | 132 項通過 |
| 大廳 `npm test`、`npm run build:pages` | 通過 |
| 根網站 `npm test`、本機 games.json 建置 | 通過；總 sitemap 17 筆，入口 15 個遊戲連結 |
| `node scripts/sync-seo-shared.js` | 15 款共用檔案一致 |
| `node scripts/check-seo-all.js --local` | 15 款通過，無重複 SEO 文案，網址與大廳一致 |
| `node scripts/check-seo-browser.js` | 15 款 metadata、實際中英切換、本機 GA 請求為零、試點一局與再玩一局、大廳點擊及根入口通過 |
| 語法與差異 | 修改的 JavaScript 通過 node --check，提交前通過 git diff --check |

線上測試使用遊戲各自的 `scripts/online-check.js`；撞球與黑白棋使用 `tests/online-check.js`。測試涵蓋各套件原有的房間、對局、邀請、觀戰與關房情境，不等同於每款所有模式都做過瀏覽器操作。

瀏覽器 RWD 抽查為水果連連看首頁：手機 390×844、平板直向 834×1112、平板橫向 1112×834、桌機 1440×900，皆無水平溢出，已檢視截圖；另檢視桌機結算 overlay 及根入口手機版。沒有修改既有遊戲畫面或規則，也未宣稱完成全部 15 款所有畫面、所有模式的完整人工巡檢。

本機證據存於 `verification/seo-shots/`、`verification/seo-logs/`，不納入版控。可用上述瀏覽器腳本重建截圖。

## 本機提交

全部使用繁體中文 Conventional Commits；原有未追蹤的 .shots、widgets.js、Claude outputs 等內容未納入。

| 專案 | 提交 |
| --- | --- |
| flip-match | 4d98bb5 |
| sudoku | adfc210 |
| whack-a-mole | 980d153 |
| fruit-link | 3029a4f（試點）、c678aef（去重與共用驗證完善） |
| stair-kids | a4084dc |
| draw-guess | 9055a48 |
| heart-attack | 8d43a57 |
| richman | a3dbc4d |
| bomb-squad | 2a2be31 |
| rainbow-bubble | 4a00bdf |
| pool-duel | a190a08 |
| reversi | cfe87a9 |
| amaze-go | d5d79d9 |
| pinball-hoops | 4fd6442 |
| shoot-balloon | 17a8d8a |
| pjh-eric.github.io | c5ddea1 |

大廳的程式碼、共用來源、驗證工具與此報告一併提交，可由大廳 git log 查詢。

## 後續上線項目

尚未 push、建立遠端根網站 repo 或修改 Pages 設定，也未登入 GA4／Search Console。正式部署、GA4 即時收數、自訂維度、根網址驗證、提交 sitemap、Google 結構化資料線上測試及收錄狀態，需在部署後完成；正式網址檢查工具已準備好。根網站驗證碼留空，應填入根資源自己的驗證碼。

本次依「先實作全遊戲專案的程式碼變更」處理，未修改使用者的全域 cute-game-builder 技能設定。專案內的新遊戲上架檢查清單已更新。
