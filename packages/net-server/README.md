# @pjh/net-server

`ws.js`：很小的 WebSocket 伺服器，這裡是**唯一原始檔**。使用自寫 ws 的遊戲，其 `lib/ws.js` 由 `npm run sync` 同步。

以 bomb-squad／rainbow-bubble 的新版為基準（比舊版多）：
- 單一訊息上限 64KB，超過就斷線
- `attach(server, { verify })`：可用 `verify(req)` 做來源檢查（GAME_ALLOWED_ORIGIN）
- 沒有開頭的續傳 frame 會斷線；`close()` 後 2 秒強制釋放

snake-3d 的 `server/lib/ws.js` 是另一個版本，尚未納入，待階段 B 處理。
階段 B 的 `apps/game-server` 會以這個檔案為連線層基礎。
