# 遊戲小小島根網站

Node.js 22，零套件依賴。`npm test` 驗證輸出與錯誤情境；`npm run build` 從已上線大廳讀取遊戲清單，產生 `dist/` 的入口頁、robots.txt、sitemap.xml、404.html 與 .nojekyll。

首頁以品牌介紹、小島插畫及遊戲大廳入口為主，不逐款列出遊戲；遊戲清單只用於驗證與產生 sitemap。樣式及插畫來源為 `assets/home.css`、`assets/island.svg`，建置時複製至發布根目錄。

離線驗證可設定 `GAMES_JSON_PATH` 指向本機 `game-lobby/config/games.json`。正式 workflow 不設定此變數，使用 `seo.config.json` 的公開網址；下載失敗或清單格式錯誤會直接失敗。sitemap 包含根網站、大廳及所有遊戲，以結尾斜線統一網址；不捏造每日 lastmod。

GitHub 公開 repository 名稱須為 `pjh-eric.github.io`，Pages Source 設定 GitHub Actions。workflow 在 main 推送、手動執行及每日臺灣時間 04:00 建置。本機程式碼完成不代表遠端 repo、Pages 或 Search Console 已建立。

Search Console 建立 `https://pjh-eric.github.io/` 網址前置字元資源，把該資源提供的 HTML 驗證碼填進 `googleSiteVerification`，部署後驗證並提交 `sitemap.xml`。遊戲與大廳的路徑涵蓋於這個資源。各遊戲的驗證碼不沿用其他資源的碼。

入口頁 GA4 使用同一個衡量 ID、`game_id=root`；僅在正式 hostname 載入追蹤，page_location 不含 query/hash。GA4 自訂維度及正式收數仍需後台驗證。

## 維護與驗證產物

以 `package.json` 的 scripts 為可執行指令來源；`npm test` 執行基本驗證。需要 Playwright、瀏覽器或網路的檢查，依各測試章節的前置條件執行。

截圖、測試報告、記錄檔及快取為可重新產生的驗證產物，不屬於正式遊戲資產，也不提交版本控制。測試完成後可清除 `screenshots/`、`shots/`、`.shots/`、`test-results/`、`playwright-report/`、`coverage/`、`.cache/`、`tmp/`、`temp/` 與 `*.log`。保留正式圖片、圖示、音訊、字型、原始碼、測試案例、鎖定檔及 `.env.example`；`node_modules/` 是相依套件目錄，不能當成圖片或暫存檔一起刪除。
