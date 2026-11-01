# all-in-one

遊戲小小島全部遊戲的單一專案。規劃書見 `docs/全遊戲整合規劃書.md`。

## 原則
- 本資料夾是**複本**，原本的各遊戲專案（`C:\Eric\AI Agent\<遊戲>`）完全不動、繼續照常運作。
- 原專案仍可能被繼續修改；all-in-one 是 2026-10-29 當下的快照，切換前用 `node scripts/resync-from-originals.js` 比對差異（預設唯讀 dry-run）。
- 全部切換完成並驗收前，不會關閉任何舊的 repo、Pages 或 Render service。

## 結構
- `games/`：18 款遊戲（各自保留 public/、server.js、tests/）
- `apps/lobby/`：原 game-lobby；`apps/site/`：原 pjh-eric.github.io
- `packages/`：共用套件（階段 A2 起建立）
- `games.json`：全專案唯一的遊戲清單（由大廳設定升級，新增 buildType／server）
- `scripts/`：基準盤點與檢查腳本

## 階段
- [x] 階段 0／A1：建立資料夾、複製遊戲、清單
- [x] 階段 A2-1：`packages/web-core`（analytics.js、i18n.js）成為唯一原始檔，15 款由 `npm run sync` 同步
- [ ] 階段 A2-2：config.js 整併（各款已分歧，且 inject-server-url 會改寫其中一行）
- [ ] 階段 A2-3：ui-kit（五種自繪 UI 合併）
- [x] 階段 A3-1：`packages/net-server/ws.js` 統一 7 款自寫 WebSocket
- [x] 階段 A3-2：`sio-compat`（伺服器）＋ `web-core/sio-client.js`（用戶端），5 款 socket.io 遊戲改走共用 WS（socket.io 相依已移除）
- [ ] 階段 A3-3：npm ws 的 3 款（amaze-go、maze-roll、ice-duel）、flip-match（內嵌 ws）、snake-3d
- [ ] 階段 A4：統一前端建置與部署
- [ ] 階段 B：共用伺服器 `apps/game-server`

## 已知待清理
- 共用的 `analytics.js` 內含迷宮滾球（`MR_CONFIG`）專用分支，對其他款無作用，但之後應移到 maze-roll 自己的設定。
- house-stack 的 `i18n.js`（ES module 版）與 `analytics.js` 與共用版不同，暫列為例外；snake-3d、ice-duel 為 Vite 專案，不走這套同步。

## 測試環境備註
- 遷移後的遊戲已不需要 socket.io；仍使用 express 的遊戲在本機測試需先 `npm install`（all-in-one 目前沒有安裝 node_modules）。
- 各款 `package-lock.json` 仍留有 socket.io 的舊條目，待 monorepo 統一相依管理時一併重建。
- 需要瀏覽器的檢查（playwright：重連、離開流程、畫面）尚未在 all-in-one 跑過，需另行驗證。
- 除錯：設環境變數 `SIO_DEBUG=1` 可在伺服器端印出每條連線的斷線原因。
