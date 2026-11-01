# GA4 優化與驗證

日期：2026-10-22。範圍：遊戲大廳與 `config/games.json` 所列 16 款遊戲。未修改 GA4 後台，未將測試事件送入正式資源。

## 已修正

| 問題 | 調整 |
| --- | --- |
| 初始化散落在大廳、注入腳本、迷宮滾球 | 全部使用同一份 analytics.js；設定與載入分離，重複執行不重送 config、不重載 Google tag |
| 迷宮滾球只有畫面瀏覽，未接上對局／房間事件 | 保留 MR_ANALYTICS.pageView；補上真正開始、規則引擎結算、成功建房／入房事件；觀戰排除 |
| 舊對局快照可能重開，舊結算可能結束新局 | 保留最多 100 個已計數對局識別；結算需對應目前對局；識別不送往 GA |
| 撞球重連缺乏穩定對局識別 | 房間內每局遞增 roundId，重連沿用、再開一局更新；即使擺球種子相同也能區分 |
| 彩虹泡泡砲並列第一的部分玩家被記成落敗 | 依實際名次判定 win／draw／lose，平手、勝負、重複結算與觀戰回歸測試涵蓋 |
| 單機含電腦與純單人的 mode 都叫 solo | 統一 solo／ai／online，自由練習與隨機模式保留 variant |
| 房間關閉後還保留已加入狀態 | closed／left 清理追蹤狀態；只有成功回應才計入房，邀請預覽不計數，確認邀請成功後才算 join |
| 自訂事件沒有統一參數限制 | 僅接受已定義事件與參數，排除任意姓名、房號、邀請 token、seed、URL；來源網址移除 query/hash |
| 大廳只能知道選了哪款遊戲 | 保留 select_content；新增詳情、分類、收藏事件與 entry_point、來源／目標遊戲維度；不收集搜尋輸入文字 |
| 共用同步器會覆蓋迷宮滾球的專用初始化 | 追蹤程式整合並保留原有設定；同步器不替迷宮滾球建立未提供的 SEO 注入腳本與測試 |

## 事件契約

- 既有事件名稱保留：`game_start`、`game_end`、`room_create`、`room_join`、`lobby_click`、`select_content`。
- 新增大廳事件：`view_game_details`、`filter_games`、`favorite_game`。
- 對局主要參數：`game_id`、`mode`、`variant`、`difficulty`、`players`、`result`、`duration_sec`、`app_language`。
- `duration_sec` 是經過時間，包含暫停，不能當成實際操作時間；模式重新分類後不應直接與舊版 solo 報表比較。
- `select_content` 保留舊 `game_id`／`item_id` 語意，補上 `content_id`、`target_game_id`、`source_game_id`、`entry_point`。
- 成功入房事件包含 `via=lobby|invite_link`，不包含房號或 token。100 個對局識別僅保留在記憶體，重新整理頁面仍可能重新計數，未聲稱跨分頁／跨工作階段去重。

## 驗證

- 共用契約：大廳＋16 款遊戲全部通過；包含初始化去重、本機不載入、參數過濾、失敗入房、邀請確認、舊快照／舊結算、觀戰排除、語言與手動畫面瀏覽。
- SEO 相容性：15 款既有注入專案的注入、冪等性、翻譯 metadata、sitemap 與舊事件測試通過；迷宮滾球以原有獨立建置檢查 GA4。
- Playwright：大廳＋16 款遊戲使用本機檔案攔截正式 hostname 的資源；逐一驗證 Google tag 僅載入一次、正確 game_id、開局／結算去重、觀戰排除、本機不初始化。Google script 已攔截，不執行收集器。
- 實際互動：大廳的詳情、選擇遊戲、收藏與分類各送一次；水果連連看實際完成一局並重玩；迷宮滾球實際開局，再以規則引擎模擬抵達終點，確認結算接線。
- 迷宮滾球既有完整 npm test 通過。撞球既有物理／規則／AI／線上測試通過；另加同種子重玩與重連的對局識別回歸檢查。
- 大廳 `npm run verify` 通過；檔案同步與 diff 檢查通過。

## 未驗證與後台設定

沒有 GA4 讀取／管理連線，因此未驗證正式 Realtime、DebugView、歷史事件數或後台自訂定義。程式測試通過不代表正式資源已收到資料，亦不代表所有獨立遊戲都重新實玩一整局。

依需求在後台建立事件範圍自訂維度：`game_id`、`mode`、`variant`、`difficulty`、`result`、`app_language`、`target_game_id`、`source_game_id`、`entry_point`、`via`、`category`、`action`；`duration_sec` 可建為秒數自訂指標。迷宮滾球需設定有效 `GA4_MEASUREMENT_ID`，建議與大廳使用相同資源。

迷宮滾球保留手動虛擬 page_view，初始化設定 send_page_view=false。GA4 後台若另啟用 history 變化的增強型 page view，應核對是否重複；本次沒有修改後台。其他遊戲維持單次 config 自動 page view。

參考 Google 官方文件：[設定參數](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)、[page_view 自動與手動計數](https://developers.google.com/analytics/devguides/collection/ga4/views)、[建議事件](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)。
