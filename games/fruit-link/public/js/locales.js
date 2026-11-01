/* ===== locales.js — 字典（繁體中文 zh-Hant / English en） =====
 *
 * 本遊戲英文名：Fruit Link（中文：水果連連看）
 *
 * 規則：
 *   - 每一筆都是 [key, zh-Hant, en]，兩種語言由同一份清單產生，key 一定一致。
 *   - zh-Hant 的內容與原本畫面上的中文完全一致，不可改寫。
 *   - 值裡的 {name} 會被 I18N.t(key, {name: ...}) 取代；少數值含受信任的 HTML 標籤（<b> 等）。
 *   - srv.* 是伺服器（server.js、lib/rooms.js）與 rules.js 回傳的中文訊息：
 *     前端用 I18N.srv(text) 依這些範本對照翻譯，線上協定與伺服器程式碼完全不變。
 */
(function (root) {
  'use strict';

  var D = [];
  function add(key, zh, en) { D.push([key, zh, en]); }

  /* ---------- 頁面 ---------- */
  add('meta.title', "水果連連看｜免費線上多人連連看・免下載", 'Fruit Link');
  add('meta.desc',
    "免費免下載的水果連連看，在兩次轉彎內連線消除相同圖案。單機從幼幼班一路闖關，也能邀最多六人同盤搶消、觀戰聊天，多款圖案主題，手機平板電腦都能玩。",
    'Cute fruit-matching game: three kids’ levels plus three challenge levels solo, or race up to 6 players on one shared board online.');
  add('lang.switchTo', '切換成英文（English）', 'Switch to Traditional Chinese (中文)');

  /* ---------- 共用 ---------- */
  add('common.back', '◀ 返回', '◀ Back');
  add('common.close', '關閉', 'Close');
  add('common.cancel', '取消', 'Cancel');
  add('common.ok', '確定', 'OK');
  add('common.on', '開啟', 'On');
  add('common.off', '關閉', 'Off');
  add('common.you', '你', 'You');
  add('common.youTag', '（你）', ' (you)');
  add('common.player', '玩家', 'Player');
  add('common.system', '系統', 'System');
  add('common.someone', '有人', 'Someone');
  add('common.roomOf', '{name} 的果園', '{name}’s Orchard');

  /* ---------- 首頁 ---------- */
  add('home.aria', '主選單', 'Main menu');
  add('home.lobby', '← 回遊戲大廳', '← Game Lobby');
  add('home.solo', '單機闖關（六關）', 'Solo Levels (6)');
  add('home.online', '線上競速（最多 6 人）', 'Online Race (up to 6)');
  add('home.help', '玩法說明', 'How to Play');
  add('home.stats', '我的紀錄', 'My Records');
  add('home.note', '兩個一樣的水果，中間的路徑「轉彎不超過 2 次」就能連掉。',
    'Match two identical tiles when a path joins them with no more than 2 turns.');
  add('logo.title', '水果連連看', 'Fruit Link');
  add('logo.sub', '三折以內就能連', 'Up to 2 turns!');

  /* ---------- 設定入口 ---------- */
  add('settings.fabTitle', '遊戲設定', 'Settings');
  add('settings.fabAria', '開啟遊戲設定', 'Open settings');

  /* ---------- 單機設定 ---------- */
  add('solo.aria', '單機闖關設定', 'Solo setup');
  add('solo.title', '單機闖關', 'Solo Levels');
  add('solo.note', '從幼幼班一路打到第三關，分數會累加；也可以直接挑你想玩的那一關。',
    'Play from the kids’ levels up to Level 3 and your score adds up, or jump straight to any level.');
  add('solo.theme', '圖案主題', 'Tile Theme');
  add('solo.themeAria', '選擇圖案主題', 'Choose a tile theme');
  add('solo.themeHint', '{note}；每一局會從裡面隨機抽圖案，所以每次玩到的都不一樣。',
    '{note}. Each round draws a random set of tiles, so no two games look alike.');
  add('solo.level', '從哪一關開始', 'Start from');
  add('solo.levelAria', '選擇起始關卡', 'Choose a starting level');
  add('solo.start', '開始闖關', 'Start');
  add('theme.designs', '{n} 種', '{n} designs');
  add('theme.cardAria', '{label}，{n} 種圖案', '{label}, {n} designs');
  add('level.groupKids', '👶 幼幼班', '👶 Kids’ Class');
  add('level.groupKidsSub',
    '給 3～5 歲的小朋友：格子很大、時間很長，提示和洗牌不限次數，每一顆水果都會自動寫上名字。',
    'For ages 3–5: big tiles, lots of time, unlimited hints and shuffles, and every fruit shows its name.');
  add('level.groupPlay', '🍓 闖關模式', '🍓 Challenge Mode');
  add('level.groupPlaySub',
    '每種水果最多 2 對。越後面的關卡格子越多、種類越雜，提示和洗牌也越少。',
    'Up to 2 pairs of each fruit. Later levels have more tiles, more kinds, and fewer hints and shuffles.');
  add('level.kinds', '{n} 種水果', '{n} kinds');
  add('level.secs', '{n} 秒', '{n}s');
  add('level.hintN', '💡 提示 {n}', '💡 Hint {n}');
  add('level.shuffleN', '🔀 洗牌 {n}', '🔀 Shuffle {n}');
  add('level.placeholder', '第一關', 'Level 1');

  add('level.kids.label', '幼幼班 · 一起認水果', 'Kids 1 · Meet the Fruits');
  add('level.kids.short', '幼幼', 'Kids 1');
  add('level.kids.blurb', '4 × 3，只有 3 種水果。格子很大、時間很長、提示和洗牌不限次數，適合 3～5 歲的小朋友。',
    '4 × 3, only 3 kinds of fruit. Big tiles, lots of time, unlimited hints and shuffles. Great for ages 3–5.');
  add('level.kids2.label', '幼幼進階 · 每種只有一對', 'Kids 2 · One Pair Each');
  add('level.kids2.short', '幼幼進階', 'Kids 2');
  add('level.kids2.blurb', '5 × 4，10 種水果，每一種剛好只有一對、完全不重複。格子一樣很大、時間一樣很長，適合玩熟幼幼班的小朋友。',
    '5 × 4, 10 kinds of fruit, exactly one pair of each. Same big tiles and long timer, for kids who have mastered Kids 1.');
  add('level.kids3.label', '幼幼困難 · 找久一點', 'Kids 3 · Look Longer');
  add('level.kids3.short', '幼幼困難', 'Kids 3');
  add('level.kids3.blurb', '6 × 5，15 種水果，每一種一樣只有一對、完全不重複。格子和時間都還是幼幼班的規格，只是要多找一下。',
    '6 × 5, 15 kinds of fruit, still one pair of each. Same kid-sized tiles and timer, just a bit more to search.');
  add('level.easy.label', '第一關 · 果園入門', 'Level 1 · Orchard Intro');
  add('level.easy.short', '簡單', 'Easy');
  add('level.easy.blurb', '8 × 6，12 種水果，每種最多出現 2 對。時間很寬鬆，先熟悉三折以內怎麼連。',
    '8 × 6, 12 kinds of fruit, up to 2 pairs each. Plenty of time to learn the 2-turn rule.');
  add('level.normal.label', '第二關 · 果園日常', 'Level 2 · Orchard Days');
  add('level.normal.short', '普通', 'Normal');
  add('level.normal.blurb', '10 × 8，20 種水果，每種最多出現 2 對。提示和洗牌都變少了，要開始看路徑。',
    '10 × 8, 20 kinds of fruit, up to 2 pairs each. Fewer hints and shuffles, so start reading the paths.');
  add('level.hard.label', '第三關 · 果園大亂', 'Level 3 · Orchard Chaos');
  add('level.hard.short', '困難', 'Hard');
  add('level.hard.blurb', '12 × 10，30 種水果，每種最多出現 2 對（開始混進蔬菜）。眼睛要放亮一點。',
    '12 × 10, 30 kinds of fruit, up to 2 pairs each (veggies join in). Keep your eyes sharp!');

  add('theme.fruits.label', '蔬果', 'Fruits');
  add('theme.fruits.note', '水果與蔬菜', 'Fruits and vegetables');
  add('theme.animals.label', '動物', 'Animals');
  add('theme.animals.note', '陸海空的動物們', 'Animals of land, sea and sky');
  add('theme.food.label', '食物', 'Food');
  add('theme.food.note', '正餐、點心與飲料', 'Meals, snacks and drinks');
  add('theme.flags.label', '國旗', 'Flags');
  add('theme.flags.note', '各國國旗', 'Flags from around the world');
  add('theme.mahjong.label', '麻將', 'Mahjong');
  add('theme.mahjong.note', '一副 42 種麻將牌（含花牌與季節牌）；這個主題會疊起來玩',
    'A set of 42 mahjong tiles (with flowers and seasons); this theme is played stacked');
  add('theme.mixed.label', '大混搭', 'Mix-up');
  add('theme.mixed.note', '蔬果、動物、食物和國旗混在一起', 'Fruits, animals, food and flags all mixed together');

  /* ---------- 玩法說明 ---------- */
  add('help.aria', '玩法說明', 'How to play');
  add('help.title', '📖 玩法說明', '📖 How to Play');
  add('help.how', '怎麼連', 'How to Match');
  add('help.howBody',
    '點兩個<b>一樣的水果</b>。只要它們之間存在一條路徑，這條路徑<b>只走上下左右、只經過空格，而且轉彎不超過 2 次</b>，兩個就會一起消失。路徑可以繞到盤面外面那一圈，所以最外圈的水果不會被困住。',
    'Tap two <b>identical tiles</b>. If a path joins them that <b>only moves up, down, left or right, only crosses empty cells, and turns no more than 2 times</b>, both tiles vanish. Paths may loop around the outside edge of the board, so tiles on the border are never trapped.');
  add('help.howHint', '上面示範的是 0 折、1 折、2 折三種合法路徑；轉三次以上就不算。',
    'The examples above show legal paths with 0, 1 and 2 turns. Three or more turns do not count.');
  add('help.demo0', '0 折 · 直線', '0 turns · straight');
  add('help.demo1', '1 折 · 轉一次', '1 turn');
  add('help.demo2', '2 折 · 繞出去', '2 turns · around the edge');
  add('help.mj', '🀄 麻將怎麼連', '🀄 Matching Mahjong');
  add('help.mjBody',
    '麻將的每一層都視為<b>獨立的平面</b>，規則和其他模式一樣：路徑<b>只走上下左右、只經過該層的空格，而且轉彎不超過 2 次</b>，也可以繞到該層平面外圈。其他層的牌不會阻擋路徑，但上層實際覆蓋到的牌仍然不能操作。兩張牌必須<b>圖案相同、位於同一層、且沒有被上層麻將壓住</b>；不要求左右一定有空位，相鄰同圖案的牌也能以 0 折直線消除。',
    'Each mahjong layer is treated as its <b>own flat plane</b> with the same rules: the path <b>moves only up, down, left or right, crosses only empty cells on that layer, and turns no more than 2 times</b>, and may loop around that layer’s outer edge. Tiles on other layers never block a path, but tiles covered by an upper tile still can’t be played. Both tiles must <b>show the same picture, be on the same layer, and not be covered</b>. Neighbours with the same picture can match with a straight 0-turn line.');
  add('help.score', '計分', 'Scoring');
  add('help.scoreItem', '項目', 'Item');
  add('help.scorePts', '分數', 'Points');
  add('help.scoreBase', '連成一對', 'Each pair');
  add('help.scoreBaseV', '基礎 100 分', '100 base points');
  add('help.scoreCombo', '連擊加成', 'Combo bonus');
  add('help.scoreComboV', '5 秒內接著連下一對，每次 +10%，最多 ×2.0', 'Match the next pair within 5 s: +10% each time, up to ×2.0');
  add('help.scoreMiss', '連錯', 'Wrong match');
  add('help.scoreMissV', '<b>不扣分</b>，只會把連擊歸零', '<b>No penalty</b>, but it resets your combo');
  add('help.scoreTime', '過關剩餘時間', 'Time left');
  add('help.scoreTimeV', '每剩 1 秒 +2 分（清空盤面才有）', '+2 points per second left (only if you clear the board)');
  add('help.levels', '六個關卡', 'The Six Levels');
  add('help.thLevel', '關卡', 'Level');
  add('help.thBoard', '盤面', 'Board');
  add('help.thKinds', '水果種類', 'Kinds');
  add('help.thTime', '時間', 'Time');
  add('help.thHints', '提示', 'Hints');
  add('help.thShuffles', '洗牌', 'Shuffles');
  add('help.times', '{n} 次', '{n}');
  add('help.themes', '圖案主題', 'Tile Themes');
  add('help.themesBody',
    '除了蔬果，還可以換成動物、食物、國旗、麻將，或是把蔬果、動物、食物和國旗混在一起的「大混搭」（不含麻將）。每一局會從主題裡<b>隨機抽</b>要用的圖案，所以同一關每次玩到的組合都不一樣。線上對戰由房主決定主題，全場看到的都一樣。',
    'Besides fruits and veggies you can play with animals, food, flags, mahjong, or the “Mix-up” theme that blends fruits, animals, food and flags (no mahjong). Each round <b>randomly picks</b> its tiles from the theme, so the same level never looks the same twice. In online games the host picks the theme and everyone sees the same tiles.');
  add('help.mjStack',
    '<b>🀄 麻將的畫面會疊起來。</b>牌會像真的麻將一樣一層一層疊上去，上面那一層往右下偏半張，所以<b>視覺上上層會蓋住下層 4 張</b>。被蓋住的牌會<b>變暗、點不動</b>，要先把疊在它上面的牌消掉才會解鎖；但每層的路徑判定彼此獨立。<br>配對時要選<b>同圖案、同層、上方露出</b>的兩張牌，而且必須存在一條<b>只經過該層空格、不超過 2 折</b>的合法路徑。空格規則與其他模式相同。單機的提示、洗牌與自動解死局都照樣有用。',
    '<b>🀄 Mahjong tiles are stacked.</b> They pile up in layers like real mahjong, each upper layer shifted half a tile down-right, so <b>an upper tile visually covers 4 tiles below</b>. Covered tiles are <b>dimmed and can’t be tapped</b> until you clear what sits on top, but paths are still checked per layer.<br>Pick two tiles with the <b>same picture, on the same layer, and uncovered</b>, joined by a legal path that <b>only crosses empty cells on that layer with at most 2 turns</b>. Empty-cell rules are the same as other themes. Solo hints, shuffles and automatic dead-end fixes all still work.');
  add('help.assist', '提示與洗牌', 'Hints and Shuffles');
  add('help.assistBody',
    '💡 <b>提示</b>會幫你點亮一組還能連的水果。🔀 <b>洗牌</b>會把盤面上剩下的水果重新排一次，而且保證重排後一定還有解。<br>盤面消掉之後<b>位置固定不動</b>，所以偶爾會走到「誰都連不到」的死局 —— 這時候系統會<b>自動免費洗牌</b>，不會浪費你的次數。線上競速為了公平，沒有手動提示與洗牌。',
    '💡 <b>Hint</b> lights up a pair you can still match. 🔀 <b>Shuffle</b> rearranges the remaining tiles and always leaves at least one solution.<br>Tiles <b>stay in place</b> once others are cleared, so you can sometimes hit a dead end where nothing connects. The game then <b>shuffles for free automatically</b> without using up your count. Online races have no manual hints or shuffles, to keep things fair.');
  add('help.online', '線上競速', 'Online Race');
  add('help.onlineBody',
    '房間裡最多 6 個人<b>共用同一張盤面</b>，同一對水果<b>誰先連到就是誰的分</b>，慢一步就會撲空（但不扣分）。時間到或盤面清空就結算，分數最高的人贏。<br>席位滿了或對局進行中進來的人會變成<b>觀戰</b>，看得到盤面和聊天室，但不能出手；下一局才能下場。線上競速不提供手動提示與洗牌，遇到死局時由系統自動重排。房主可以產生<b>邀請連結</b>，連結有使用次數與有效期限，也可以隨時撤銷。',
    'Up to 6 players <b>share one board</b> in a room. Whoever matches a pair first <b>gets the points</b>; arrive a moment late and you miss it (with no penalty). When time runs out or the board is cleared, the highest score wins.<br>If seats are full or a round is already underway, you join as a <b>spectator</b>: you can watch the board and chat but not play until the next round. Online races have no manual hints or shuffles; dead ends are reshuffled automatically. The host can create <b>invite links</b> with a use limit and an expiry, and can revoke them at any time.');
  add('help.controls', '操作', 'Controls');
  add('help.controlsBody',
    '<b>觸控／滑鼠</b>：點一下選起來，再點第二個就送出；點同一個可以取消。<br><b>鍵盤</b>：方向鍵移動、Enter 或空白鍵選取、Esc 取消選取。<br><b>螢幕閱讀器</b>：每一格都會唸出是第幾列第幾行、哪一種水果、有沒有被選起來。',
    '<b>Touch / mouse</b>: tap to select, tap a second tile to match; tap the same tile again to deselect.<br><b>Keyboard</b>: arrow keys to move, Enter or Space to select, Esc to deselect.<br><b>Screen readers</b>: every cell announces its row, column, which tile it is, and whether it is selected.');
  add('help.settings', '遊戲設定', 'Game Settings');
  add('help.settingsBody',
    '每個畫面<b>右上角的 ⚙</b> 都能開設定：背景音樂與音效可以分開開關與調音量，還有觸控震動、減少動態，以及「顯示水果名稱」（預設開啟；手機上格子太小會自動隱藏，不蓋住水果；麻將牌不顯示）。',
    'The <b>⚙ in the top-right corner</b> of every screen opens settings: music and sound effects have separate switches and volumes, plus touch vibration, reduced motion, and “Show fruit names” (on by default; hidden automatically when tiles are too small on phones; not shown on mahjong tiles).');

  /* ---------- 我的紀錄 ---------- */
  add('stats.aria', '我的紀錄', 'My records');
  add('stats.title', '🏅 我的紀錄', '🏅 My Records');
  add('stats.best', '每一關的最佳成績', 'Best Result per Level');
  add('stats.bestRow', '最高分 <b>{score}</b>　最快 <b>{sec}</b> 秒　最高 <b>{combo}</b> 連擊',
    'Best score <b>{score}</b>　Fastest <b>{sec}</b>s　Top combo <b>{combo}</b>');
  add('stats.none', '還沒有紀錄', 'No record yet');
  add('stats.totals', '累計戰績', 'Totals');
  add('stats.soloClear', '單機過關', 'Solo cleared');
  add('stats.soloFail', '單機失敗', 'Solo failed');
  add('stats.onlineWin', '線上第一名', 'Online wins');
  add('stats.onlineLose', '線上未奪冠', 'Online losses');
  add('stats.note', '紀錄只存在這台裝置的瀏覽器裡，不會上傳到任何地方。',
    'Records are stored only in this device’s browser and are never uploaded.');
  add('stats.reset', '清除本機紀錄', 'Clear Records');
  add('stats.confirm', '要清除這台裝置上的所有紀錄嗎？清掉就找不回來了。', 'Clear all records on this device? This cannot be undone.');
  add('stats.confirmYes', '清除', 'Clear');
  add('stats.cleared', '已清除本機紀錄', 'Records cleared');

  /* ---------- 線上大廳 ---------- */
  add('lobby.aria', '線上大廳', 'Online lobby');
  add('lobby.title', '線上競速', 'Online Race');
  add('conn.idle', '尚未連線', 'Not connected');
  add('conn.loading', '正在載入連線程式…', 'Loading the connection library…');
  add('conn.connecting', '連線中…（免費方案冷啟動可能要十幾秒）', 'Connecting… (a free server can take 10+ seconds to wake up)');
  add('conn.connected', '已連線：{host}', 'Connected: {host}');
  add('conn.error', '連線失敗', 'Connection failed');
  add('conn.offline', '沒有可用的伺服器，只能玩單機', 'No server available. Solo play only.');
  add('conn.reconnect', '重新連線', 'Reconnect');
  add('lobby.nick', '玩家暱稱', 'Your Nickname');
  add('lobby.nickPh', '水果高手', 'Fruit Pro');
  add('lobby.inviteTitle', '收到房間邀請', 'Room Invitation');
  add('lobby.inviteNote', '請先設定你的暱稱，再加入這間水果連線房間。', 'Set your nickname first, then join this Fruit Link room.');
  add('lobby.inviteNoteToken', '請先設定你的暱稱，再加入這間受邀的水果連線房間。', 'Set your nickname first, then join this room you were invited to.');
  add('lobby.inviteNoteSpec', '這是觀戰邀請，請設定暱稱後加入。', 'This is a spectator invite. Set a nickname, then join.');
  add('lobby.inviteNotePlayer', '這是玩家邀請，請設定暱稱後加入。', 'This is a player invite. Set a nickname, then join.');
  add('lobby.inviteJoin', '以此暱稱加入', 'Join');
  add('lobby.newRoom', '開一間新房', 'Create a Room');
  add('lobby.roomNamePh', '房間名稱（可留空）', 'Room name (optional)');
  add('lobby.private', '私人房間（只能用邀請連結進來）', 'Private room (invite link only)');
  add('lobby.create', '建立房間', 'Create');
  add('lobby.byCode', '用房號加入', 'Join by Code');
  add('lobby.codeAria', '房號', 'Room code');
  add('lobby.join', '加入房間', 'Join');
  add('lobby.public', '公開房間', 'Public Rooms');
  add('lobby.onlineCount', '目前在線：{n} 人', 'Online now: {n}');
  add('lobby.refresh', '🔄 重新整理', '🔄 Refresh');
  add('lobby.noteEnabled',
    '在電腦上執行「啟動遊戲.bat」之後，同一個 Wi-Fi 的平板或手機打開視窗裡印出的「同網段」網址，就會進到同一個大廳。',
    'Run “npm start” on a computer, then open the “same network” address it prints on a tablet or phone on the same Wi-Fi to reach the same lobby.');
  add('lobby.noteDisabled', '目前沒有設定遊戲伺服器，只能玩單機闖關。', 'No game server is set up, so only solo play is available.');
  add('lobby.empty', '現在沒有公開房間，按「建立房間」開一間吧。', 'No public rooms right now. Press “Create” to start one.');
  add('lobby.roomMeta', '房號 {code}　{level}（{board}）　{theme}', 'Code {code}　{level} ({board})　{theme}');
  add('lobby.phasePlaying', '對戰中', 'Playing');
  add('lobby.phaseCountdown', '倒數中', 'Starting');
  add('lobby.phaseOver', '剛結束', 'Finished');
  add('lobby.phaseWaiting', '等待中', 'Waiting');
  add('lobby.players', '玩家 {n}/{max}', 'Players {n}/{max}');
  add('lobby.specs', '觀戰 {n}', 'Watching {n}');
  add('lobby.sit', '加入', 'Join');
  add('lobby.watch', '觀戰', 'Watch');
  add('lobby.needCode', '請先輸入房號', 'Enter a room code first');
  add('lobby.notConnected', '還沒連上伺服器', 'Not connected to the server yet');
  add('lobby.needNick', '請先輸入暱稱，再加入邀請房間', 'Enter a nickname before joining the invited room');
  add('lobby.defaultNick', '玩家', 'Player');
  add('lobby.downgraded', '玩家席位滿了，你先以觀戰身分進來', 'Player seats are full, so you joined as a spectator');
  add('lobby.waiting', '這一局已經開始了，先觀戰，下一局再下場', 'This round has already started. Watch for now and play next round');
  add('lobby.inviteBad', '這個邀請連結沒有用了', 'This invite link no longer works');
  add('lobby.reconnected', '重新連上線了', 'Reconnected');
  add('lobby.closed', '房間已經關閉', 'The room has closed');
  add('lobby.opFailed', '操作失敗', 'Something went wrong');
  add('cfg.invalid', '設定有誤（線上已停用）', 'Invalid setup (online disabled)');
  add('cfg.unset', '未設定（只能玩單機）', 'Not set (solo only)');
  add('cfg.query', '（網址參數）', ' (URL parameter)');
  add('cfg.injected', '（建置注入）', ' (build-time)');
  add('cfg.same', '（同源）', ' (same origin)');
  add('cfg.badUrl', '不是合法的絕對網址：{raw}', 'Not a valid absolute URL: {raw}');
  add('cfg.badProto', '只接受 http 或 https：{raw}', 'Only http or https is accepted: {raw}');
  add('cfg.mixed', 'https 頁面不能連 http 伺服器（混合內容會被瀏覽器擋掉）：{raw}', 'An https page can’t connect to an http server (blocked as mixed content): {raw}');
  add('net.noUrl', '沒有設定遊戲伺服器位址。', 'No game server address is set.');
  add('net.unreachable', '連不到遊戲伺服器（{host}），請確認伺服器有開著。', 'Can’t reach the game server ({host}). Make sure it is running.');
  add('net.noServer', '目前沒有可用的遊戲伺服器，只能玩單機。', 'No game server is available. Solo play only.');
  add('net.dropped', '連線中斷（{reason}），正在重試…', 'Connection lost ({reason}). Retrying…');
  add('net.failed', '連不上伺服器：{msg}', 'Can’t reach the server: {msg}');
  add('net.unknown', '未知錯誤', 'unknown error');
  add('net.timeout', '伺服器沒有回應（免費方案冷啟動可能要十幾秒，請再試一次）。', 'The server did not respond (a free server can take 10+ seconds to wake up). Please try again.');
  add('net.refused', '伺服器拒絕連線。', 'The server refused the connection.');
  add('net.offlineSend', '目前沒有連線，動作沒有送出去。請等重新連線後再試。', 'You are offline, so that action was not sent. Please try again after reconnecting.');
  add('lat.waitAria', '連線延遲，等待回應', 'Connection latency, waiting for a reply');
  add('lat.valueAria', '連線延遲 {ms} 毫秒', 'Connection latency {ms} milliseconds');
  add('lat.waitTitle', '連線延遲：等待回應', 'Latency: waiting for a reply');
  add('lat.valueTitle', '連線延遲：{ms} ms', 'Latency: {ms} ms');

  /* ---------- 對局 HUD ---------- */
  add('game.aria', '遊戲畫面', 'Game');
  add('game.boardAria', '水果盤面', 'Tile board');
  add('hud.quit', '離開這一局', 'Leave this round');
  add('hud.restart', '重新開始新的一局', 'Restart this level');
  add('hud.time', '剩餘', 'Time');
  add('hud.score', '分數', 'Score');
  add('hud.left', '剩餘水果', 'Left');
  add('hud.combo', '連擊', 'Combo');
  add('hud.hint', '💡 提示', '💡 Hint');
  add('hud.shuffle', '🔀 洗牌', '🔀 Shuffle');
  add('side.aria', '戰況與聊天', 'Status and chat');
  add('side.tabsAria', '側欄分頁', 'Side panel tabs');
  add('side.sum', '戰況', 'Status');
  add('side.chat', '聊天', 'Chat');
  add('side.close', '收起側欄', 'Close side panel');
  add('side.openSum', '打開戰況', 'Open status');
  add('side.openChat', '打開聊天室', 'Open chat');
  add('side.rank', '即時排行', 'Live Ranking');
  add('side.chatLog', '聊天訊息', 'Chat messages');
  add('side.chatPh', '說點什麼…', 'Say something…');
  add('side.chatInput', '輸入聊天訊息', 'Type a chat message');
  add('side.send', '送出', 'Send');
  add('side.noChat', '單機闖關沒有聊天室。', 'There is no chat in solo play.');
  add('side.noChatToast', '單機闖關沒有聊天室', 'There is no chat in solo play');
  add('side.specTag', ' · 觀戰', ' · Watching');
  add('side.comboSmall', '{n} 連擊', '{n} combo');
  add('side.pairsSmall', '{n} 對', '{n} pairs');
  add('side.roomOnline', '房號 <b>{code}</b><br>{name}<br>{level}　{cols} × {rows}　{theme}<br>觀戰 {specs} 人',
    'Room <b>{code}</b><br>{name}<br>{level}　{cols} × {rows}　{theme}<br>Watching: {specs}');
  add('side.roomSolo', '單機闖關<br><b>{level}</b>　{cols} × {rows}<br>{theme}<br>累計 <b>{total}</b> 分',
    'Solo Levels<br><b>{level}</b>　{cols} × {rows}<br>{theme}<br>Total <b>{total}</b> pts');
  add('side.myStat', '已連 {pairs} 對 · 連錯 {misses} 次 · 最高 {combo} 連擊<br>剩餘水果 {left} 個',
    '{pairs} pairs · {misses} misses · best combo {combo}<br>{left} tiles left');
  add('side.autoShuffle', '<br>系統自動洗牌 {n} 次', '<br>Auto shuffles: {n}');
  add('side.spectating', '你正在觀戰：看得到盤面與聊天室，但不能出手。', 'You are spectating: you can see the board and chat but can’t play.');

  add('tile.empty', '空格', 'Empty');
  add('tile.fallback', '圖案', 'Tile');
  add('tile.stackAria', '第 {z} 層，第 {r} 列第 {c} 行，{name}', 'Layer {z}, row {r}, column {c}, {name}');
  add('tile.flatAria', '第 {r} 列第 {c} 行，{name}', 'Row {r}, column {c}, {name}');

  add('play.countdown', '還在倒數，先別急', 'Still counting down. Hold on!');
  add('play.spectator', '你正在觀戰，不能出手', 'You are spectating and can’t play');
  add('play.locked', '這張被壓住了，要先把疊在上面的牌消掉', 'This tile is covered. Clear the tiles on top first');
  add('play.missStack', '這兩張配不起來（要同圖案、同層、上方露出，路徑只經過該層空格且在 2 折以內）',
    'Those two don’t match (same picture, same layer, uncovered, and a path through empty cells on that layer with at most 2 turns)');
  add('play.missFlat', '這兩顆連不起來（路徑要轉彎 2 次以內、而且只能經過空格）',
    'Those two can’t connect (the path needs at most 2 turns and may only cross empty cells)');
  add('play.shuffleAuto', '沒有水果連得到了，系統自動幫大家洗牌（不算次數）', 'No matches left, so the game shuffled for everyone (it doesn’t use up a shuffle)');
  add('play.shuffled', '已經洗牌', 'Shuffled');
  add('play.go', '開始！', 'Go!');
  add('play.combo5', '5 連擊！', '5 combo!');
  add('play.combo10', '10 連擊！！', '10 combo!!');

  /* ---------- 等待與結算 ---------- */
  add('wait.title', '準備開始', 'Get Ready');
  add('wait.titleRoom', '{name}（房號 {code}）', '{name} (code {code})');
  add('wait.level', '關卡（房主設定）', 'Level (host sets)');
  add('wait.levelAria', '關卡', 'Level');
  add('wait.theme', '圖案主題（房主設定）', 'Tile theme (host sets)');
  add('wait.themeAria', '圖案主題', 'Tile theme');
  add('wait.levelCard', '{cols}×{rows}　{sec} 秒', '{cols}×{rows}　{sec}s');
  add('wait.note',
    '圖案：<b>{theme}</b>（{n} 種，每局隨機抽）<br>關卡：<b>{level}</b>　{cols} × {rows}　{sec} 秒<br>最多 {seats} 人共用同一張盤面，同一對水果誰先連到就是誰的分。',
    'Tiles: <b>{theme}</b> ({n} designs, random each round)<br>Level: <b>{level}</b>　{cols} × {rows}　{sec}s<br>Up to {seats} players share one board; whoever matches a pair first scores it.');
  add('wait.blocked', '<br>還不能開始：{why}', '<br>Can’t start yet: {why}');
  add('wait.cancelReady', '取消準備', 'Not Ready');
  add('wait.ready', '我準備好了 ✔', 'I’m Ready ✔');
  add('wait.sit', '我要下場 🎮', 'Play 🎮');
  add('wait.stand', '改成觀戰 👀', 'Watch 👀');
  add('wait.start', '開始遊戲 ▶', 'Start ▶');
  add('wait.invite', '邀請朋友 🔗', 'Invite 🔗');
  add('wait.leave', '離開房間', 'Leave Room');
  add('seat.host', '房主', 'Host');
  add('seat.spec', '觀戰', 'Watching');
  add('seat.ready', '準備好了', 'Ready');
  add('seat.waiting', '等待中', 'Waiting');
  add('seat.off', '斷線', 'Offline');
  add('seat.empty', '還沒有人在房間裡', 'Nobody is in the room yet');

  add('result.title', '結算', 'Results');
  add('result.levelClear', '{level} 過關！', '{level} cleared!');
  add('result.allClear', '🎉 {n} 關全部通過！', '🎉 All {n} levels cleared!');
  add('result.timeUp', '⏰ 時間到', '⏰ Time’s up');
  add('result.boardClear', '🎉 盤面清空！', '🎉 Board cleared!');
  add('result.thisLevel', '這一關', 'This level');
  add('result.line', '{pairs} 對 · 最高 {combo} 連擊 · 連錯 {misses} 次', '{pairs} pairs · best combo {combo} · {misses} misses');
  add('result.bonus', ' · 時間 +{n}', ' · time +{n}');
  add('result.total', '本次闖關累計', 'Run total');
  add('result.best', '這一關的個人最佳：{score} 分 · {sec} 秒 · {combo} 連擊', 'Your best on this level: {score} pts · {sec}s · combo {combo}');
  add('result.left', '盤面上還剩 {n} 個水果。<br>提示和洗牌用完就沒有了，記得留一點在後面。',
    '{n} tiles were left on the board.<br>Hints and shuffles run out, so save some for later.');
  add('result.next', '下一關 ▶', 'Next ▶');
  add('result.again', '再玩這一關 🔁', 'Replay 🔁');
  add('result.retry', '再挑戰一次 🔁', 'Try Again 🔁');
  add('result.home', '回主選單 🏠', 'Home 🏠');
  add('result.draw', '同分平手！', 'It’s a tie!');
  add('result.champion', '冠軍是 <b>{name}</b>，{score} 分。', 'The champion is <b>{name}</b> with {score} points.');
  add('result.myRank', '<br>你是第 {rank} 名。', '<br>You placed #{rank}.');
  add('result.watched', '<br>你這一局是觀戰。', '<br>You were watching this round.');
  add('result.rematch', '再來一局 🔁（{votes}/{need}）', 'Rematch 🔁 ({votes}/{need})');
  add('result.toRoom', '回房間準備', 'Back to Room');
  add('result.dash', '—', '—');

  /* ---------- 設定彈窗 ---------- */
  add('set.title', '⚙ 遊戲設定', '⚙ Settings');
  add('set.close', '關閉設定', 'Close settings');
  add('set.music', '背景音樂', 'Music');
  add('set.musicVol', '音樂音量', 'Music volume');
  add('set.sfx', '遊戲音效', 'Sound effects');
  add('set.sfxVol', '音效音量', 'Effects volume');
  add('set.haptic', '觸控震動', 'Vibration');
  add('set.hapticSub', '連到、連錯時輕輕震一下', 'A light buzz on matches and misses');
  add('set.motion', '減少動態', 'Reduce motion');
  add('set.motionSub', '關掉飄浮裝飾與消除動畫', 'Turns off floating decorations and clear animations');
  add('set.label', '顯示水果名稱', 'Show fruit names');
  add('set.labelSub', '每一格加上文字，不只靠顏色分辨（手機格子太小時會自動隱藏）',
    'Adds text to every tile so you don’t rely on colour alone (auto-hidden when tiles are small on phones)');
  add('set.server', '線上伺服器：{host}', 'Online server: {host}');
  add('set.reset', '恢復預設', 'Reset');
  add('set.done', '完成', 'Done');
  add('set.resetDone', '已恢復預設設定', 'Settings reset to default');

  /* ---------- 邀請彈窗 ---------- */
  add('inv.title', '🔗 邀請朋友', '🔗 Invite Friends');
  add('inv.close', '關閉', 'Close');
  add('inv.role', '要邀請成什麼身分', 'Invite as');
  add('inv.roleAria', '邀請身分', 'Invite role');
  add('inv.player', '下場玩', 'Player');
  add('inv.playerSub', '席位滿了會自動變觀戰', 'Becomes a spectator if seats are full');
  add('inv.spec', '只觀戰', 'Spectator');
  add('inv.specSub', '看得到盤面，不能出手', 'Can watch the board but not play');
  add('inv.make', '產生邀請連結', 'Create Link');
  add('inv.urlAria', '邀請連結', 'Invite link');
  add('inv.copy', '複製', 'Copy');
  add('inv.note', '邀請連結預設 30 分鐘內有效、最多 5 個人用，隨時可以撤銷。', 'The invite link is valid for 30 minutes and up to 5 people by default, and can be revoked at any time.');
  add('inv.made', '這張邀請是「{role}」身分，最多 {max} 個人用，{time} 之前有效。', 'This invite is for “{role}”, up to {max} people, valid until {time}.');
  add('inv.list', '已產生的邀請', 'Invites Created');
  add('inv.empty', '還沒有產生過邀請連結', 'No invite links yet');
  add('inv.revoked', '已撤銷', 'Revoked');
  add('inv.expired', '已過期', 'Expired');
  add('inv.used', '已用完', 'Used up');
  add('inv.valid', '有效', 'Valid');
  add('inv.row', '{role}　{why}　用了 {uses}/{max}', '{role}　{why}　used {uses}/{max}');
  add('inv.revoke', '撤銷', 'Revoke');
  add('inv.revokedToast', '已撤銷這張邀請', 'Invite revoked');
  add('inv.copied', '邀請連結已複製', 'Invite link copied');
  add('inv.copyManual', '請手動選取複製', 'Please select and copy it manually');

  /* ---------- 確認彈窗 ---------- */
  add('confirm.title', '確認', 'Confirm');
  add('confirm.leaveRoom', '要離開這個房間嗎？離開之後座位會讓給別人。', 'Leave this room? Your seat will go to someone else.');
  add('confirm.leaveSolo', '要離開這一關嗎？目前的進度不會保留。', 'Leave this level? Your progress will not be saved.');
  add('confirm.leave', '離開', 'Leave');
  add('confirm.restart', '要重新開始新的一局嗎？這一關目前的進度不會保留。', 'Start a new round? Progress on this level will not be saved.');
  add('confirm.restartYes', '重新開始', 'Restart');

  /* ---------- 伺服器與規則訊息（用 I18N.srv 對照；zh 必須與伺服器原文一致） ---------- */
  var SRV = [];
  function srv(id, zh, en) { var k = 'srv.' + id; add(k, zh, en); SRV.push([k, zh]); }
  /* rules.js */
  srv('notInMatch', '你不在這一局裡。', 'You are not in this round.');
  srv('matchOver', '這一局已經結束了。', 'This round is already over.');
  srv('countdown', '還在倒數，先別急。', 'Still counting down. Hold on!');
  srv('badCell', '格子編號不合法。', 'Invalid cell.');
  srv('noHint', '提示已經用完了。', 'No hints left.');
  srv('noPair', '現在沒有可以連的水果，用洗牌吧。', 'Nothing to match right now. Try a shuffle.');
  srv('noShuffle', '洗牌次數已經用完了。', 'No shuffles left.');
  srv('fewTiles', '剩下的水果太少了，不用洗。', 'Too few tiles left to shuffle.');
  /* lib/rooms.js */
  srv('roomFull', '這個房間人太多了（含觀戰上限 {n} 人）。', 'This room is too crowded (limit {n} including spectators).');
  srv('private', '這是私人房間，需要邀請連結才能進來。', 'This is a private room. You need an invite link.');
  srv('notInRoom', '你不在這個房間裡。', 'You are not in this room.');
  srv('startedNoSit', '這一局已經開始了，等結束之後才能下場。', 'This round has already started. You can play after it ends.');
  srv('seatsFull', '玩家席位已經滿了（最多 {n} 人），可以先觀戰。', 'Player seats are full (max {n}). You can watch for now.');
  srv('noLeaveSeat', '對局進行中不能中途離席。', 'You can’t leave your seat during a round.');
  srv('specNoReady', '觀戰中不需要準備。', 'Spectators don’t need to get ready.');
  srv('noReadyChange', '對局進行中不能改準備狀態。', 'You can’t change ready status during a round.');
  srv('whyRunning', '這一局已經在進行中', 'This round is already in progress');
  srv('whyNoPlayers', '至少要有一位玩家下場', 'At least one player must take a seat');
  srv('whyNotReady', '{names} 還沒按準備', '{names} not ready yet');
  srv('cannotStart', '{why}，還不能開始。', '{why}. Can’t start yet.');
  srv('hostLevel', '只有房主可以改關卡。', 'Only the host can change the level.');
  srv('noLevelChange', '對局進行中不能改關卡。', 'You can’t change the level during a round.');
  srv('badLevel', '沒有這個關卡。', 'No such level.');
  srv('hostTheme', '只有房主可以改造型。', 'Only the host can change the theme.');
  srv('noThemeChange', '對局進行中不能改造型。', 'You can’t change the theme during a round.');
  srv('badTheme', '沒有這個造型主題。', 'No such theme.');
  srv('hostStart', '只有房主可以開始。', 'Only the host can start.');
  srv('specNoPlay', '觀戰中不能出手。', 'Spectators can’t play.');
  srv('notYet', '現在還不能出手。', 'You can’t play yet.');
  srv('specNoHint', '觀戰中不能用提示。', 'Spectators can’t use hints.');
  srv('onlineNoHint', '線上對戰不提供提示。', 'Hints are not available in online games.');
  srv('specNoShuffle', '觀戰中不能洗牌。', 'Spectators can’t shuffle.');
  srv('onlineNoShuffle', '線上對戰不提供手動洗牌。', 'Manual shuffles are not available in online games.');
  srv('notOver', '這一局還沒結束。', 'This round isn’t over yet.');
  srv('specNoRematch', '觀戰中不能投票再來一局。', 'Spectators can’t vote for a rematch.');
  srv('hostReset', '只有房主可以重開房間。', 'Only the host can reset the room.');
  srv('stillRunning', '對局還在進行中。', 'A round is still in progress.');
  srv('muted', '你被暫時禁言，還要等 {n} 秒。', 'You are muted for {n} more seconds.');
  srv('slowDown', '打字慢一點，別洗版。', 'Slow down, please don’t spam.');
  srv('emptyMsg', '訊息是空的。', 'The message is empty.');
  srv('hostMute', '只有房主可以禁言。', 'Only the host can mute.');
  srv('noSuchPerson', '找不到這個人。', 'Can’t find that person.');
  srv('muteSelf', '不能禁言自己。', 'You can’t mute yourself.');
  srv('hostInvite', '只有房主可以產生邀請連結。', 'Only the host can create invite links.');
  srv('hostRevoke', '只有房主可以撤銷邀請連結。', 'Only the host can revoke invite links.');
  srv('noInvite', '找不到這張邀請。', 'Can’t find that invite.');
  srv('inviteBad', '這個邀請連結無效（可能已被撤銷，或房主重開了房間）。', 'This invite link is invalid (it may have been revoked, or the host reset the room).');
  srv('inviteRevoked', '這個邀請連結已經被房主撤銷了。', 'The host has revoked this invite link.');
  srv('inviteExpired', '這個邀請連結已經過期了。', 'This invite link has expired.');
  srv('inviteUsed', '這個邀請連結的使用次數已經用完了。', 'This invite link has no uses left.');
  srv('noteSpecInvite', '這是觀戰用的邀請連結，進去之後是觀戰身分。', 'This is a spectator invite link. You will join as a spectator.');
  srv('noteSeatsFull', '玩家席位已滿，進去之後會先變成觀戰。', 'Player seats are full. You will join as a spectator for now.');
  srv('noteRunning', '這間房正在對戰中，進去之後會先觀戰，下一局才能下場。', 'This room is mid-round. You will watch first and can play next round.');
  srv('tooManyRooms', '伺服器上的房間太多了，請稍後再試。', 'The server has too many rooms. Please try again later.');
  srv('codeFail', '產生房號失敗，請再試一次。', 'Couldn’t create a room code. Please try again.');
  srv('goneNamed', '{n} 太久沒回來，座位已經釋出。', '{n} was away too long, so the seat was released.');
  /* server.js */
  srv('noSession', '連線還沒準備好，請重新整理頁面。', 'The connection isn’t ready. Please refresh the page.');
  srv('roomGone', '找不到這個房間，可能已經關閉或房號打錯了。', 'Can’t find that room. It may have closed, or the code is wrong.');
  srv('inviteRoomGone', '這個邀請連結指向的房間已經不存在了。', 'The room this invite points to no longer exists.');
  srv('notAnywhere', '你已經不在任何房間裡了。', 'You are no longer in any room.');
  srv('sysOpened', '{n} 開了這間房。大家按「準備好了」就能開始搶消。', '{n} opened this room. Everyone press “Ready” to start the race.');
  srv('sysBack', '{n} 重新連上線了。', '{n} is back online.');
  srv('sysJoinedPlayer', '{n} 加入了（玩家）。', '{n} joined (player).');
  srv('sysJoinedSpec', '{n} 加入了（觀戰）。', '{n} joined (spectator).');
  srv('sysSat', '{n} 從觀戰改成下場。', '{n} switched from watching to playing.');
  srv('sysStood', '{n} 改成觀戰。', '{n} switched to watching.');
  srv('sysLevel', '關卡改成「{label}」。', 'Level changed to “{label}”.');
  srv('sysTheme', '造型換成「{label}」（{count} 種）。', 'Theme changed to “{label}” ({count} designs).');
  srv('sysDealt', '盤面發好了！這一局的種子是 {seed}。', 'The board is dealt! This round’s seed is {seed}.');
  srv('sysCleared', '盤面清空了！冠軍是 {n}，{s} 分。', 'Board cleared! The champion is {n} with {s} points.');
  srv('sysEnded', '這一局結束了。', 'The round is over.');
  srv('sysShuffle', '{n} 洗了一次牌。', '{n} used a shuffle.');
  srv('sysRematchGo', '大家都同意，新的一局開始了！', 'Everyone agreed. A new round begins!');
  srv('sysRematchVote', '{n} 想再來一局（{v}/{need}）。', '{n} wants a rematch ({v}/{need}).');
  srv('sysReset', '房主把房間拉回準備階段，可以換座位或改關卡了。', 'The host moved the room back to setup. You can change seats or levels now.');
  srv('sysMuted', '{n} 被房主暫時禁言 {s} 秒。', '{n} was muted by the host for {s} seconds.');
  srv('sysEmpty', '房間沒有人了，已經自動關閉。', 'The room is empty and was closed automatically.');
  srv('sysLeft', '{n} 離開了房間。', '{n} left the room.');
  srv('sysDisc', '{n} 斷線了，座位會先保留一分鐘。', '{n} disconnected. Their seat is held for one minute.');
  srv('sysTimeTie', '時間到！{names} 同分平手。', 'Time’s up! {names} tied.');
  srv('sysTimeWin', '時間到！冠軍是 {n}，{s} 分。', 'Time’s up! The champion is {n} with {s} points.');

  /* ---------- 造型名稱 ---------- */
  function art(theme, list) {
    list.forEach(function (x) { add('art.' + theme + '.' + x[0], x[1], x[2]); });
  }
  art('fruits', [
    ['apple', '蘋果', 'Apple'], ['pear', '梨子', 'Pear'], ['banana', '香蕉', 'Banana'], ['orange', '橘子', 'Orange'],
    ['grape', '葡萄', 'Grapes'], ['strawberry', '草莓', 'Strawberry'], ['watermelon', '西瓜', 'Watermelon'], ['peach', '水蜜桃', 'Peach'],
    ['cherry', '櫻桃', 'Cherry'], ['pineapple', '鳳梨', 'Pineapple'], ['lemon', '檸檬', 'Lemon'], ['kiwi', '奇異果', 'Kiwi'],
    ['mango', '芒果', 'Mango'], ['blueberry', '藍莓', 'Blueberry'], ['avocado', '酪梨', 'Avocado'], ['coconut', '椰子', 'Coconut'],
    ['papaya', '木瓜', 'Papaya'], ['persimmon', '柿子', 'Persimmon'], ['carrot', '紅蘿蔔', 'Carrot'], ['tomato', '番茄', 'Tomato'],
    ['broccoli', '花椰菜', 'Broccoli'], ['corn', '玉米', 'Corn'], ['pumpkin', '南瓜', 'Pumpkin'], ['eggplant', '茄子', 'Eggplant'],
    ['potato', '馬鈴薯', 'Potato'], ['onion', '洋蔥', 'Onion'], ['mushroom', '香菇', 'Mushroom'], ['pepper', '甜椒', 'Pepper'],
    ['cucumber', '小黃瓜', 'Cucumber'], ['cabbage', '高麗菜', 'Cabbage'], ['peas', '豌豆', 'Peas'], ['radish', '白蘿蔔', 'Radish'],
    ['guava', '芭樂', 'Guava'], ['dragonfruit', '火龍果', 'Dragon Fruit'], ['melon', '哈密瓜', 'Melon'], ['durian', '榴槤', 'Durian'],
    ['pomegranate', '石榴', 'Pomegranate'], ['sweet-potato', '地瓜', 'Sweet Potato'], ['garlic', '大蒜', 'Garlic'], ['chili', '辣椒', 'Chili'],
    ['scallion', '蔥', 'Scallion'], ['bitter-melon', '苦瓜', 'Bitter Melon'], ['plum', '李子', 'Plum'], ['fig', '無花果', 'Fig'],
    ['lychee', '荔枝', 'Lychee'], ['starfruit', '楊桃', 'Starfruit'], ['passionfruit', '百香果', 'Passion Fruit'], ['raspberry', '覆盆子', 'Raspberry'],
    ['mangosteen', '山竹', 'Mangosteen'], ['loquat', '枇杷', 'Loquat'], ['celery', '芹菜', 'Celery'], ['asparagus', '蘆筍', 'Asparagus'],
    ['spinach', '菠菜', 'Spinach'], ['okra', '秋葵', 'Okra'], ['beetroot', '甜菜根', 'Beetroot'], ['ginger', '薑', 'Ginger'],
    ['lotus-root', '蓮藕', 'Lotus Root'], ['bamboo-shoot', '竹筍', 'Bamboo Shoot'], ['taro', '芋頭', 'Taro'], ['chestnut', '栗子', 'Chestnut']
  ]);
  art('animals', [
    ['cat', '貓咪', 'Cat'], ['dog', '小狗', 'Dog'], ['rabbit', '兔子', 'Rabbit'], ['bear', '熊', 'Bear'],
    ['panda', '貓熊', 'Panda'], ['fox', '狐狸', 'Fox'], ['pig', '小豬', 'Pig'], ['cow', '乳牛', 'Cow'],
    ['sheep', '綿羊', 'Sheep'], ['monkey', '猴子', 'Monkey'], ['lion', '獅子', 'Lion'], ['tiger', '老虎', 'Tiger'],
    ['elephant', '大象', 'Elephant'], ['giraffe', '長頸鹿', 'Giraffe'], ['zebra', '斑馬', 'Zebra'], ['hippo', '河馬', 'Hippo'],
    ['koala', '無尾熊', 'Koala'], ['deer', '小鹿', 'Deer'], ['squirrel', '松鼠', 'Squirrel'], ['hedgehog', '刺蝟', 'Hedgehog'],
    ['frog', '青蛙', 'Frog'], ['penguin', '企鵝', 'Penguin'], ['owl', '貓頭鷹', 'Owl'], ['chick', '小雞', 'Chick'],
    ['duck', '鴨子', 'Duck'], ['whale', '鯨魚', 'Whale'], ['dolphin', '海豚', 'Dolphin'], ['octopus', '章魚', 'Octopus'],
    ['crab', '螃蟹', 'Crab'], ['turtle', '烏龜', 'Turtle'], ['snail', '蝸牛', 'Snail'], ['bee', '蜜蜂', 'Bee'],
    ['mouse', '老鼠', 'Mouse'], ['butterfly', '蝴蝶', 'Butterfly'], ['ladybug', '瓢蟲', 'Ladybug'], ['goldfish', '金魚', 'Goldfish'],
    ['shark', '鯊魚', 'Shark'], ['starfish', '海星', 'Starfish'], ['jellyfish', '水母', 'Jellyfish'], ['kangaroo', '袋鼠', 'Kangaroo'],
    ['raccoon', '浣熊', 'Raccoon'], ['parrot', '鸚鵡', 'Parrot'], ['horse', '馬', 'Horse'], ['camel', '駱駝', 'Camel'],
    ['sloth', '樹懶', 'Sloth'], ['bat', '蝙蝠', 'Bat'], ['swan', '天鵝', 'Swan'], ['flamingo', '紅鶴', 'Flamingo'],
    ['peacock', '孔雀', 'Peacock'], ['rooster', '公雞', 'Rooster'], ['crocodile', '鱷魚', 'Crocodile'], ['snake', '蛇', 'Snake'],
    ['seahorse', '海馬', 'Seahorse'], ['shrimp', '蝦子', 'Shrimp'], ['seal', '海豹', 'Seal'], ['scallop', '扇貝', 'Scallop'],
    ['ant', '螞蟻', 'Ant'], ['dragonfly', '蜻蜓', 'Dragonfly'], ['spider', '蜘蛛', 'Spider'], ['beetle', '獨角仙', 'Beetle']
  ]);
  art('food', [
    ['food1', '漢堡', 'Burger'], ['food2', '披薩', 'Pizza'], ['food3', '壽司', 'Sushi'], ['food4', '飯糰', 'Rice Ball'],
    ['food5', '拉麵', 'Ramen'], ['food6', '墨西哥捲', 'Burrito'], ['food7', '三明治', 'Sandwich'], ['food8', '熱狗', 'Hot Dog'],
    ['food9', '薯條', 'Fries'], ['food10', '牛排', 'Steak'], ['food11', '烤雞', 'Roast Chicken'], ['food12', '荷包蛋', 'Fried Egg'],
    ['food13', '起司', 'Cheese'], ['food14', '吐司', 'Toast'], ['food15', '可頌', 'Croissant'], ['food16', '水餃', 'Dumpling'],
    ['food17', '熱湯', 'Soup'], ['food18', '沙拉', 'Salad'], ['food19', '咖哩飯', 'Curry Rice'], ['food20', '便當', 'Bento'],
    ['food21', '爆米花', 'Popcorn'], ['food22', '蛋糕', 'Cake'], ['food23', '杯子蛋糕', 'Cupcake'], ['food24', '甜甜圈', 'Donut'],
    ['food25', '餅乾', 'Cookie'], ['food26', '巧克力', 'Chocolate'], ['food27', '糖果', 'Candy'], ['food28', '冰淇淋', 'Ice Cream'],
    ['food29', '刨冰', 'Shaved Ice'], ['food30', '咖啡', 'Coffee'], ['food31', '牛奶', 'Milk'], ['food32', '果汁', 'Juice'],
    ['pancake', '鬆餅', 'Pancake'], ['bubble-tea', '珍珠奶茶', 'Boba Tea'], ['taiyaki', '鯛魚燒', 'Taiyaki'], ['takoyaki', '章魚燒', 'Takoyaki'],
    ['pudding', '布丁', 'Pudding'], ['lollipop', '棒棒糖', 'Lollipop'], ['chips', '洋芋片', 'Chips'], ['bagel', '貝果', 'Bagel'],
    ['hotpot', '火鍋', 'Hot Pot'], ['skewer', '串燒', 'Skewer'], ['spaghetti', '義大利麵', 'Spaghetti'], ['taco', '塔可餅', 'Taco'],
    ['pretzel', '蝴蝶脆餅', 'Pretzel'], ['macaron', '馬卡龍', 'Macaron'], ['mooncake', '月餅', 'Mooncake'], ['pineapple-cake', '鳳梨酥', 'Pineapple Cake'],
    ['bao', '包子', 'Bao'], ['tofu', '豆腐', 'Tofu'], ['fried-rice', '炒飯', 'Fried Rice'], ['sausage', '香腸', 'Sausage'],
    ['sundae', '聖代', 'Sundae'], ['tea', '熱茶', 'Hot Tea'], ['soda', '汽水', 'Soda'], ['honey', '蜂蜜', 'Honey'],
    ['swiss-roll', '蛋糕捲', 'Swiss Roll'], ['cotton-candy', '棉花糖', 'Cotton Candy'], ['egg-tart', '蛋塔', 'Egg Tart'], ['sashimi', '生魚片', 'Sashimi']
  ]);
  art('flags', [
    ['taiwan', '台灣', 'Taiwan'], ['japan', '日本', 'Japan'], ['south-korea', '韓國', 'S. Korea'], ['china', '中國', 'China'],
    ['mongolia', '蒙古', 'Mongolia'], ['india', '印度', 'India'], ['singapore', '新加坡', 'Singapore'], ['thailand', '泰國', 'Thailand'],
    ['vietnam', '越南', 'Vietnam'], ['philippines', '菲律賓', 'Philippines'], ['indonesia', '印尼', 'Indonesia'], ['malaysia', '馬來西亞', 'Malaysia'],
    ['australia', '澳洲', 'Australia'], ['new-zealand', '紐西蘭', 'New Zealand'], ['united-states', '美國', 'USA'], ['canada', '加拿大', 'Canada'],
    ['mexico', '墨西哥', 'Mexico'], ['brazil', '巴西', 'Brazil'], ['argentina', '阿根廷', 'Argentina'], ['united-kingdom', '英國', 'UK'],
    ['france', '法國', 'France'], ['germany', '德國', 'Germany'], ['italy', '義大利', 'Italy'], ['spain', '西班牙', 'Spain'],
    ['portugal', '葡萄牙', 'Portugal'], ['netherlands', '荷蘭', 'Netherlands'], ['switzerland', '瑞士', 'Switzerland'], ['sweden', '瑞典', 'Sweden'],
    ['norway', '挪威', 'Norway'], ['finland', '芬蘭', 'Finland'], ['south-africa', '南非', 'S. Africa'], ['egypt', '埃及', 'Egypt'],
    ['russia', '俄羅斯', 'Russia'], ['austria', '奧地利', 'Austria'], ['hungary', '匈牙利', 'Hungary'], ['bulgaria', '保加利亞', 'Bulgaria'],
    ['lithuania', '立陶宛', 'Lithuania'], ['estonia', '愛沙尼亞', 'Estonia'], ['poland', '波蘭', 'Poland'], ['ukraine', '烏克蘭', 'Ukraine'],
    ['belgium', '比利時', 'Belgium'], ['ireland', '愛爾蘭', 'Ireland'], ['romania', '羅馬尼亞', 'Romania'], ['nigeria', '奈及利亞', 'Nigeria'],
    ['peru', '秘魯', 'Peru'], ['ivory-coast', '象牙海岸', 'Ivory Coast'], ['denmark', '丹麥', 'Denmark'], ['iceland', '冰島', 'Iceland'],
    ['czechia', '捷克', 'Czechia'], ['turkey', '土耳其', 'Turkey'], ['chile', '智利', 'Chile'], ['morocco', '摩洛哥', 'Morocco'],
    ['greece', '希臘', 'Greece'], ['colombia', '哥倫比亞', 'Colombia'], ['ghana', '迦納', 'Ghana'], ['ethiopia', '衣索比亞', 'Ethiopia'],
    ['senegal', '塞內加爾', 'Senegal'], ['cameroon', '喀麥隆', 'Cameroon'], ['armenia', '亞美尼亞', 'Armenia'], ['kenya', '肯亞', 'Kenya'],
    ['pakistan', '巴基斯坦', 'Pakistan'], ['algeria', '阿爾及利亞', 'Algeria'], ['tunisia', '突尼西亞', 'Tunisia'], ['israel', '以色列', 'Israel'],
    ['uae', '阿聯', 'UAE'], ['bangladesh', '孟加拉', 'Bangladesh'], ['laos', '寮國', 'Laos'], ['cambodia', '柬埔寨', 'Cambodia'],
    ['myanmar', '緬甸', 'Myanmar'], ['cuba', '古巴', 'Cuba'], ['jamaica', '牙買加', 'Jamaica'], ['georgia', '喬治亞', 'Georgia']
  ]);
  (function () {
    var nums = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    var list = [];
    nums.forEach(function (n, i) { list.push(['dot-' + (i + 1), n + '筒', (i + 1) + ' Dots']); });
    nums.forEach(function (n, i) { list.push(['bam-' + (i + 1), n + '條', (i + 1) + ' Bamboo']); });
    nums.forEach(function (n, i) { list.push(['man-' + (i + 1), n + '萬', (i + 1) + ' Characters']); });
    list.push(['honor-east', '東', 'East'], ['honor-south', '南', 'South'], ['honor-west', '西', 'West'], ['honor-north', '北', 'North'],
      ['honor-red', '中', 'Red'], ['honor-green', '發', 'Green'], ['honor-white', '白', 'White'],
      ['flower-plum', '梅', 'Plum'], ['flower-orchid', '蘭', 'Orchid'], ['flower-chrysanthemum', '菊', 'Chrysanthemum'], ['flower-bamboo', '竹', 'Bamboo'],
      ['season-spring', '春', 'Spring'], ['season-summer', '夏', 'Summer'], ['season-autumn', '秋', 'Autumn'], ['season-winter', '冬', 'Winter']);
    art('mahjong', list);
  }());

  /* ---------- 註冊 ---------- */
  var zh = {}, en = {};
  D.forEach(function (r) { zh[r[0]] = r[1]; en[r[0]] = r[2]; });
  root.I18N.register('zh-Hant', zh).register('en', en);

  /* ---------- 伺服器訊息對照 ---------- */
  var srvRules = null;
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function buildRules() {
    srvRules = SRV.map(function (r) {
      var names = [];
      var src = esc(r[1]).replace(/\\\{(\w+)\\\}/g, function (m, k) { names.push(k); return '(.+?)'; });
      /* esc() 會把 { } 跳脫成 \{ \}，上面的 replace 還原成參數群組 */
      return { key: r[0], re: new RegExp('^' + src + '$'), names: names };
    });
  }

  /** 系統產生的預設名稱（玩家3、你、系統）依語言顯示；玩家自己取的暱稱原樣不動。 */
  function dispName(name) {
    var s = String(name === undefined || name === null ? '' : name);
    if (root.I18N.lang === 'zh-Hant') return s;
    var m = /^玩家(\d*)$/.exec(s);
    if (m) return root.I18N.t('common.player') + (m[1] ? ' ' + m[1] : '');
    if (s === '你') return root.I18N.t('common.you');
    if (s === '系統') return root.I18N.t('common.system');
    return s;
  }

  var labelMapCache = null;
  function labelMap() {
    if (labelMapCache) return labelMapCache;
    labelMapCache = {};
    if (root.Rules) root.Rules.LEVELS.forEach(function (l) { labelMapCache[l.label] = 'level.' + l.key + '.label'; });
    if (root.Themes) root.Themes.menu().forEach(function (t) { labelMapCache[t.label] = 'theme.' + t.key + '.label'; });
    return labelMapCache;
  }

  /** 把伺服器／規則回傳的中文訊息翻成目前語言；對不到的原樣回傳（中文介面一律原樣）。 */
  function translateSrv(text) {
    var s = String(text === undefined || text === null ? '' : text);
    if (root.I18N.lang === 'zh-Hant') return s;
    if (!srvRules) buildRules();
    for (var i = 0; i < srvRules.length; i++) {
      var r = srvRules[i];
      var m = r.re.exec(s);
      if (!m) continue;
      var p = {};
      r.names.forEach(function (k, j) {
        var v = m[j + 1];
        if (k === 'why') v = translateSrv(v);
        else if (k === 'label') { var lk = labelMap()[v]; v = lk ? root.I18N.t(lk) : v; }
        else if (k === 'names') v = v.split('、').map(dispName).join(root.I18N.lang === 'en' ? ', ' : '、');
        else if (k === 'n') v = dispName(v);
        p[k] = v;
      });
      return root.I18N.t(r.key, p);
    }
    /* 預設房名「某某 的果園」 */
    var rm = /^(.+) 的果園$/.exec(s);
    if (rm) return root.I18N.t('common.roomOf', { name: dispName(rm[1]) });
    return dispName(s);
  }

  /** 關卡／主題的中文名稱 → 目前語言（伺服器的房間清單只送中文名稱）。 */
  function labelOf(zh) {
    var s = String(zh === undefined || zh === null ? '' : zh);
    if (root.I18N.lang === 'zh-Hant') return s;
    var k = labelMap()[s];
    return k ? root.I18N.t(k) : s;
  }

  root.I18N.label = labelOf;
  root.I18N.srv = translateSrv;
  root.I18N.name = dispName;
  root.I18N_SRV_KEYS = SRV.map(function (r) { return r[0]; });
})(typeof window !== 'undefined' ? window : this);

// 由繁體中文介面字典轉換；動態參數（暱稱、分數等）維持原值。
(function (root) {
  var hans = {
    "meta.title": "水果连连看｜免费线上多人连连看・免下载",
    "meta.desc": "免费免下载的水果连连看，在两次转弯内连线消除相同图案。单机从幼幼班一路闯关，也能邀最多六人同盘抢消、观战聊天，多款图案主题，手机平板电脑都能玩。",
    "lang.switchTo": "切换成英文（English）",
    "common.back": "◀ 返回",
    "common.close": "关闭",
    "common.cancel": "取消",
    "common.ok": "确定",
    "common.on": "开启",
    "common.off": "关闭",
    "common.you": "你",
    "common.youTag": "（你）",
    "common.player": "玩家",
    "common.system": "系统",
    "common.someone": "有人",
    "common.roomOf": "{name} 的果园",
    "home.aria": "主选单",
    "home.lobby": "← 回游戏大厅",
    "home.solo": "单机闯关（六关）",
    "home.online": "线上竞速（最多 6 人）",
    "home.help": "玩法说明",
    "home.stats": "我的纪录",
    "home.note": "两个一样的水果，中间的路径「转弯不超过 2 次」就能连掉。",
    "logo.title": "水果连连看",
    "logo.sub": "三折以内就能连",
    "settings.fabTitle": "游戏设定",
    "settings.fabAria": "开启游戏设定",
    "solo.aria": "单机闯关设定",
    "solo.title": "单机闯关",
    "solo.note": "从幼幼班一路打到第三关，分数会累加；也可以直接挑你想玩的那一关。",
    "solo.theme": "图案主题",
    "solo.themeAria": "选择图案主题",
    "solo.themeHint": "{note}；每一局会从里面随机抽图案，所以每次玩到的都不一样。",
    "solo.level": "从哪一关开始",
    "solo.levelAria": "选择起始关卡",
    "solo.start": "开始闯关",
    "theme.designs": "{n} 种",
    "theme.cardAria": "{label}，{n} 种图案",
    "level.groupKids": "👶 幼幼班",
    "level.groupKidsSub": "给 3～5 岁的小朋友：格子很大、时间很长，提示和洗牌不限次数，每一颗水果都会自动写上名字。",
    "level.groupPlay": "🍓 闯关模式",
    "level.groupPlaySub": "每种水果最多 2 对。越后面的关卡格子越多、种类越杂，提示和洗牌也越少。",
    "level.kinds": "{n} 种水果",
    "level.secs": "{n} 秒",
    "level.hintN": "💡 提示 {n}",
    "level.shuffleN": "🔀 洗牌 {n}",
    "level.placeholder": "第一关",
    "level.kids.label": "幼幼班 · 一起认水果",
    "level.kids.short": "幼幼",
    "level.kids.blurb": "4 × 3，只有 3 种水果。格子很大、时间很长、提示和洗牌不限次数，适合 3～5 岁的小朋友。",
    "level.kids2.label": "幼幼进阶 · 每种只有一对",
    "level.kids2.short": "幼幼进阶",
    "level.kids2.blurb": "5 × 4，10 种水果，每一种刚好只有一对、完全不重复。格子一样很大、时间一样很长，适合玩熟幼幼班的小朋友。",
    "level.kids3.label": "幼幼困难 · 找久一点",
    "level.kids3.short": "幼幼困难",
    "level.kids3.blurb": "6 × 5，15 种水果，每一种一样只有一对、完全不重复。格子和时间都还是幼幼班的规格，只是要多找一下。",
    "level.easy.label": "第一关 · 果园入门",
    "level.easy.short": "简单",
    "level.easy.blurb": "8 × 6，12 种水果，每种最多出现 2 对。时间很宽松，先熟悉三折以内怎么连。",
    "level.normal.label": "第二关 · 果园日常",
    "level.normal.short": "普通",
    "level.normal.blurb": "10 × 8，20 种水果，每种最多出现 2 对。提示和洗牌都变少了，要开始看路径。",
    "level.hard.label": "第三关 · 果园大乱",
    "level.hard.short": "困难",
    "level.hard.blurb": "12 × 10，30 种水果，每种最多出现 2 对（开始混进蔬菜）。眼睛要放亮一点。",
    "theme.fruits.label": "蔬果",
    "theme.fruits.note": "水果与蔬菜",
    "theme.animals.label": "动物",
    "theme.animals.note": "陆海空的动物们",
    "theme.food.label": "食物",
    "theme.food.note": "正餐、点心与饮料",
    "theme.flags.label": "国旗",
    "theme.flags.note": "各国国旗",
    "theme.mahjong.label": "麻将",
    "theme.mahjong.note": "一副 42 种麻将牌（含花牌与季节牌）；这个主题会叠起来玩",
    "theme.mixed.label": "大混搭",
    "theme.mixed.note": "蔬果、动物、食物和国旗混在一起",
    "help.aria": "玩法说明",
    "help.title": "📖 玩法说明",
    "help.how": "怎么连",
    "help.howBody": "点两个<b>一样的水果</b>。只要它们之间存在一条路径，这条路径<b>只走上下左右、只经过空格，而且转弯不超过 2 次</b>，两个就会一起消失。路径可以绕到盘面外面那一圈，所以最外圈的水果不会被困住。",
    "help.howHint": "上面示范的是 0 折、1 折、2 折三种合法路径；转三次以上就不算。",
    "help.demo0": "0 折 · 直线",
    "help.demo1": "1 折 · 转一次",
    "help.demo2": "2 折 · 绕出去",
    "help.mj": "🀄 麻将怎么连",
    "help.mjBody": "麻将的每一层都视为<b>独立的平面</b>，规则和其他模式一样：路径<b>只走上下左右、只经过该层的空格，而且转弯不超过 2 次</b>，也可以绕到该层平面外圈。其他层的牌不会阻挡路径，但上层实际覆盖到的牌仍然不能操作。两张牌必须<b>图案相同、位于同一层、且没有被上层麻将压住</b>；不要求左右一定有空位，相邻同图案的牌也能以 0 折直线消除。",
    "help.score": "计分",
    "help.scoreItem": "项目",
    "help.scorePts": "分数",
    "help.scoreBase": "连成一对",
    "help.scoreBaseV": "基础 100 分",
    "help.scoreCombo": "连击加成",
    "help.scoreComboV": "5 秒内接着连下一对，每次 +10%，最多 ×2.0",
    "help.scoreMiss": "连错",
    "help.scoreMissV": "<b>不扣分</b>，只会把连击归零",
    "help.scoreTime": "过关剩余时间",
    "help.scoreTimeV": "每剩 1 秒 +2 分（清空盘面才有）",
    "help.levels": "六个关卡",
    "help.thLevel": "关卡",
    "help.thBoard": "盘面",
    "help.thKinds": "水果种类",
    "help.thTime": "时间",
    "help.thHints": "提示",
    "help.thShuffles": "洗牌",
    "help.times": "{n} 次",
    "help.themes": "图案主题",
    "help.themesBody": "除了蔬果，还可以换成动物、食物、国旗、麻将，或是把蔬果、动物、食物和国旗混在一起的「大混搭」（不含麻将）。每一局会从主题里<b>随机抽</b>要用的图案，所以同一关每次玩到的组合都不一样。线上对战由房主决定主题，全场看到的都一样。",
    "help.mjStack": "<b>🀄 麻将的画面会叠起来。</b>牌会像真的麻将一样一层一层叠上去，上面那一层往右下偏半张，所以<b>视觉上上层会盖住下层 4 张</b>。被盖住的牌会<b>变暗、点不动</b>，要先把叠在它上面的牌消掉才会解锁；但每层的路径判定彼此独立。<br>配对时要选<b>同图案、同层、上方露出</b>的两张牌，而且必须存在一条<b>只经过该层空格、不超过 2 折</b>的合法路径。空格规则与其他模式相同。单机的提示、洗牌与自动解死局都照样有用。",
    "help.assist": "提示与洗牌",
    "help.assistBody": "💡 <b>提示</b>会帮你点亮一组还能连的水果。🔀 <b>洗牌</b>会把盘面上剩下的水果重新排一次，而且保证重排后一定还有解。<br>盘面消掉之后<b>位置固定不动</b>，所以偶尔会走到「谁都连不到」的死局 —— 这时候系统会<b>自动免费洗牌</b>，不会浪费你的次数。线上竞速为了公平，没有手动提示与洗牌。",
    "help.online": "线上竞速",
    "help.onlineBody": "房间里最多 6 个人<b>共用同一张盘面</b>，同一对水果<b>谁先连到就是谁的分</b>，慢一步就会扑空（但不扣分）。时间到或盘面清空就结算，分数最高的人赢。<br>席位满了或对局进行中进来的人会变成<b>观战</b>，看得到盘面和聊天室，但不能出手；下一局才能下场。线上竞速不提供手动提示与洗牌，遇到死局时由系统自动重排。房主可以产生<b>邀请连结</b>，连结有使用次数与有效期限，也可以随时撤销。",
    "help.controls": "操作",
    "help.controlsBody": "<b>触控／滑鼠</b>：点一下选起来，再点第二个就送出；点同一个可以取消。<br><b>键盘</b>：方向键移动、Enter 或空白键选取、Esc 取消选取。<br><b>萤幕阅读器</b>：每一格都会念出是第几列第几行、哪一种水果、有没有被选起来。",
    "help.settings": "游戏设定",
    "help.settingsBody": "每个画面<b>右上角的 ⚙</b> 都能开设定：背景音乐与音效可以分开开关与调音量，还有触控震动、减少动态，以及「显示水果名称」（预设开启；手机上格子太小会自动隐藏，不盖住水果；麻将牌不显示）。",
    "stats.aria": "我的纪录",
    "stats.title": "🏅 我的纪录",
    "stats.best": "每一关的最佳成绩",
    "stats.bestRow": "最高分 <b>{score}</b>　最快 <b>{sec}</b> 秒　最高 <b>{combo}</b> 连击",
    "stats.none": "还没有纪录",
    "stats.totals": "累计战绩",
    "stats.soloClear": "单机过关",
    "stats.soloFail": "单机失败",
    "stats.onlineWin": "线上第一名",
    "stats.onlineLose": "线上未夺冠",
    "stats.note": "纪录只存在这台装置的浏览器里，不会上传到任何地方。",
    "stats.reset": "清除本机纪录",
    "stats.confirm": "要清除这台装置上的所有纪录吗？清掉就找不回来了。",
    "stats.confirmYes": "清除",
    "stats.cleared": "已清除本机纪录",
    "lobby.aria": "线上大厅",
    "lobby.title": "线上竞速",
    "conn.idle": "尚未连线",
    "conn.loading": "正在载入连线程式…",
    "conn.connecting": "连线中…（免费方案冷启动可能要十几秒）",
    "conn.connected": "已连线：{host}",
    "conn.error": "连线失败",
    "conn.offline": "没有可用的伺服器，只能玩单机",
    "conn.reconnect": "重新连线",
    "lobby.nick": "玩家暱称",
    "lobby.nickPh": "水果高手",
    "lobby.inviteTitle": "收到房间邀请",
    "lobby.inviteNote": "请先设定你的暱称，再加入这间水果连线房间。",
    "lobby.inviteNoteToken": "请先设定你的暱称，再加入这间受邀的水果连线房间。",
    "lobby.inviteNoteSpec": "这是观战邀请，请设定暱称后加入。",
    "lobby.inviteNotePlayer": "这是玩家邀请，请设定暱称后加入。",
    "lobby.inviteJoin": "以此暱称加入",
    "lobby.newRoom": "开一间新房",
    "lobby.roomNamePh": "房间名称（可留空）",
    "lobby.private": "私人房间（只能用邀请连结进来）",
    "lobby.create": "建立房间",
    "lobby.byCode": "用房号加入",
    "lobby.codeAria": "房号",
    "lobby.join": "加入房间",
    "lobby.public": "公开房间",
    "lobby.onlineCount": "当前在线：{n} 人",
    "lobby.refresh": "🔄 重新整理",
    "lobby.noteEnabled": "在电脑上执行「启动游戏.bat」之后，同一个 Wi-Fi 的平板或手机打开视窗里印出的「同网段」网址，就会进到同一个大厅。",
    "lobby.noteDisabled": "目前没有设定游戏伺服器，只能玩单机闯关。",
    "lobby.empty": "现在没有公开房间，按「建立房间」开一间吧。",
    "lobby.roomMeta": "房号 {code}　{level}（{board}）　{theme}",
    "lobby.phasePlaying": "对战中",
    "lobby.phaseCountdown": "倒数中",
    "lobby.phaseOver": "刚结束",
    "lobby.phaseWaiting": "等待中",
    "lobby.players": "玩家 {n}/{max}",
    "lobby.specs": "观战 {n}",
    "lobby.sit": "加入",
    "lobby.watch": "观战",
    "lobby.needCode": "请先输入房号",
    "lobby.notConnected": "还没连上伺服器",
    "lobby.needNick": "请先输入暱称，再加入邀请房间",
    "lobby.defaultNick": "玩家",
    "lobby.downgraded": "玩家席位满了，你先以观战身分进来",
    "lobby.waiting": "这一局已经开始了，先观战，下一局再下场",
    "lobby.inviteBad": "这个邀请连结没有用了",
    "lobby.reconnected": "重新连上线了",
    "lobby.closed": "房间已经关闭",
    "lobby.opFailed": "操作失败",
    "cfg.invalid": "设定有误（线上已停用）",
    "cfg.unset": "未设定（只能玩单机）",
    "cfg.query": "（网址参数）",
    "cfg.injected": "（建置注入）",
    "cfg.same": "（同源）",
    "cfg.badUrl": "不是合法的绝对网址：{raw}",
    "cfg.badProto": "只接受 http 或 https：{raw}",
    "cfg.mixed": "https 页面不能连 http 伺服器（混合内容会被浏览器挡掉）：{raw}",
    "net.noUrl": "没有设定游戏伺服器位址。",
    "net.unreachable": "连不到游戏伺服器（{host}），请确认伺服器有开着。",
    "net.noServer": "目前没有可用的游戏伺服器，只能玩单机。",
    "net.dropped": "连线中断（{reason}），正在重试…",
    "net.failed": "连不上伺服器：{msg}",
    "net.unknown": "未知错误",
    "net.timeout": "伺服器没有回应（免费方案冷启动可能要十几秒，请再试一次）。",
    "net.refused": "伺服器拒绝连线。",
    "net.offlineSend": "目前没有连线，动作没有送出去。请等重新连线后再试。",
    "lat.waitAria": "连线延迟，等待回应",
    "lat.valueAria": "连线延迟 {ms} 毫秒",
    "lat.waitTitle": "连线延迟：等待回应",
    "lat.valueTitle": "连线延迟：{ms} ms",
    "game.aria": "游戏画面",
    "game.boardAria": "水果盘面",
    "hud.quit": "离开这一局",
    "hud.restart": "重新开始新的一局",
    "hud.time": "剩余",
    "hud.score": "分数",
    "hud.left": "剩余水果",
    "hud.combo": "连击",
    "hud.hint": "💡 提示",
    "hud.shuffle": "🔀 洗牌",
    "side.aria": "战况与聊天",
    "side.tabsAria": "侧栏分页",
    "side.sum": "战况",
    "side.chat": "聊天",
    "side.close": "收起侧栏",
    "side.openSum": "打开战况",
    "side.openChat": "打开聊天室",
    "side.rank": "即时排行",
    "side.chatLog": "聊天讯息",
    "side.chatPh": "说点什么…",
    "side.chatInput": "输入聊天讯息",
    "side.send": "送出",
    "side.noChat": "单机闯关没有聊天室。",
    "side.noChatToast": "单机闯关没有聊天室",
    "side.specTag": " · 观战",
    "side.comboSmall": "{n} 连击",
    "side.pairsSmall": "{n} 对",
    "side.roomOnline": "房号 <b>{code}</b><br>{name}<br>{level}　{cols} × {rows}　{theme}<br>观战 {specs} 人",
    "side.roomSolo": "单机闯关<br><b>{level}</b>　{cols} × {rows}<br>{theme}<br>累计 <b>{total}</b> 分",
    "side.myStat": "已连 {pairs} 对 · 连错 {misses} 次 · 最高 {combo} 连击<br>剩余水果 {left} 个",
    "side.autoShuffle": "<br>系统自动洗牌 {n} 次",
    "side.spectating": "你正在观战：看得到盘面与聊天室，但不能出手。",
    "tile.empty": "空格",
    "tile.fallback": "图案",
    "tile.stackAria": "第 {z} 层，第 {r} 列第 {c} 行，{name}",
    "tile.flatAria": "第 {r} 列第 {c} 行，{name}",
    "play.countdown": "还在倒数，先别急",
    "play.spectator": "你正在观战，不能出手",
    "play.locked": "这张被压住了，要先把叠在上面的牌消掉",
    "play.missStack": "这两张配不起来（要同图案、同层、上方露出，路径只经过该层空格且在 2 折以内）",
    "play.missFlat": "这两颗连不起来（路径要转弯 2 次以内、而且只能经过空格）",
    "play.shuffleAuto": "没有水果连得到了，系统自动帮大家洗牌（不算次数）",
    "play.shuffled": "已经洗牌",
    "play.go": "开始！",
    "play.combo5": "5 连击！",
    "play.combo10": "10 连击！！",
    "wait.title": "准备开始",
    "wait.titleRoom": "{name}（房号 {code}）",
    "wait.level": "关卡（房主设定）",
    "wait.levelAria": "关卡",
    "wait.theme": "图案主题（房主设定）",
    "wait.themeAria": "图案主题",
    "wait.levelCard": "{cols}×{rows}　{sec} 秒",
    "wait.note": "图案：<b>{theme}</b>（{n} 种，每局随机抽）<br>关卡：<b>{level}</b>　{cols} × {rows}　{sec} 秒<br>最多 {seats} 人共用同一张盘面，同一对水果谁先连到就是谁的分。",
    "wait.blocked": "<br>还不能开始：{why}",
    "wait.cancelReady": "取消准备",
    "wait.ready": "我准备好了 ✔",
    "wait.sit": "我要下场 🎮",
    "wait.stand": "改成观战 👀",
    "wait.start": "开始游戏 ▶",
    "wait.invite": "邀请朋友 🔗",
    "wait.leave": "离开房间",
    "seat.host": "房主",
    "seat.spec": "观战",
    "seat.ready": "准备好了",
    "seat.waiting": "等待中",
    "seat.off": "断线",
    "seat.empty": "还没有人在房间里",
    "result.title": "结算",
    "result.levelClear": "{level} 过关！",
    "result.allClear": "🎉 {n} 关全部通过！",
    "result.timeUp": "⏰ 时间到",
    "result.boardClear": "🎉 盘面清空！",
    "result.thisLevel": "这一关",
    "result.line": "{pairs} 对 · 最高 {combo} 连击 · 连错 {misses} 次",
    "result.bonus": " · 时间 +{n}",
    "result.total": "本次闯关累计",
    "result.best": "这一关的个人最佳：{score} 分 · {sec} 秒 · {combo} 连击",
    "result.left": "盘面上还剩 {n} 个水果。<br>提示和洗牌用完就没有了，记得留一点在后面。",
    "result.next": "下一关 ▶",
    "result.again": "再玩这一关 🔁",
    "result.retry": "再挑战一次 🔁",
    "result.home": "回主选单 🏠",
    "result.draw": "同分平手！",
    "result.champion": "冠军是 <b>{name}</b>，{score} 分。",
    "result.myRank": "<br>你是第 {rank} 名。",
    "result.watched": "<br>你这一局是观战。",
    "result.rematch": "再来一局 🔁（{votes}/{need}）",
    "result.toRoom": "回房间准备",
    "result.dash": "—",
    "set.title": "⚙ 游戏设定",
    "set.close": "关闭设定",
    "set.music": "背景音乐",
    "set.musicVol": "音乐音量",
    "set.sfx": "游戏音效",
    "set.sfxVol": "音效音量",
    "set.haptic": "触控震动",
    "set.hapticSub": "连到、连错时轻轻震一下",
    "set.motion": "减少动态",
    "set.motionSub": "关掉飘浮装饰与消除动画",
    "set.label": "显示水果名称",
    "set.labelSub": "每一格加上文字，不只靠颜色分辨（手机格子太小时会自动隐藏）",
    "set.server": "线上伺服器：{host}",
    "set.reset": "恢复预设",
    "set.done": "完成",
    "set.resetDone": "已恢复预设设定",
    "inv.title": "🔗 邀请朋友",
    "inv.close": "关闭",
    "inv.role": "要邀请成什么身分",
    "inv.roleAria": "邀请身分",
    "inv.player": "下场玩",
    "inv.playerSub": "席位满了会自动变观战",
    "inv.spec": "只观战",
    "inv.specSub": "看得到盘面，不能出手",
    "inv.make": "产生邀请连结",
    "inv.urlAria": "邀请连结",
    "inv.copy": "复制",
    "inv.note": "邀请连结预设 30 分钟内有效、最多 5 个人用，随时可以撤销。",
    "inv.made": "这张邀请是「{role}」身分，最多 {max} 个人用，{time} 之前有效。",
    "inv.list": "已产生的邀请",
    "inv.empty": "还没有产生过邀请连结",
    "inv.revoked": "已撤销",
    "inv.expired": "已过期",
    "inv.used": "已用完",
    "inv.valid": "有效",
    "inv.row": "{role}　{why}　用了 {uses}/{max}",
    "inv.revoke": "撤销",
    "inv.revokedToast": "已撤销这张邀请",
    "inv.copied": "邀请连结已复制",
    "inv.copyManual": "请手动选取复制",
    "confirm.title": "确认",
    "confirm.leaveRoom": "要离开这个房间吗？离开之后座位会让给别人。",
    "confirm.leaveSolo": "要离开这一关吗？目前的进度不会保留。",
    "confirm.leave": "离开",
    "confirm.restart": "要重新开始新的一局吗？这一关目前的进度不会保留。",
    "confirm.restartYes": "重新开始",
    "srv.notInMatch": "你不在这一局里。",
    "srv.matchOver": "这一局已经结束了。",
    "srv.countdown": "还在倒数，先别急。",
    "srv.badCell": "格子编号不合法。",
    "srv.noHint": "提示已经用完了。",
    "srv.noPair": "现在没有可以连的水果，用洗牌吧。",
    "srv.noShuffle": "洗牌次数已经用完了。",
    "srv.fewTiles": "剩下的水果太少了，不用洗。",
    "srv.roomFull": "这个房间人太多了（含观战上限 {n} 人）。",
    "srv.private": "这是私人房间，需要邀请连结才能进来。",
    "srv.notInRoom": "你不在这个房间里。",
    "srv.startedNoSit": "这一局已经开始了，等结束之后才能下场。",
    "srv.seatsFull": "玩家席位已经满了（最多 {n} 人），可以先观战。",
    "srv.noLeaveSeat": "对局进行中不能中途离席。",
    "srv.specNoReady": "观战中不需要准备。",
    "srv.noReadyChange": "对局进行中不能改准备状态。",
    "srv.whyRunning": "这一局已经在进行中",
    "srv.whyNoPlayers": "至少要有一位玩家下场",
    "srv.whyNotReady": "{names} 还没按准备",
    "srv.cannotStart": "{why}，还不能开始。",
    "srv.hostLevel": "只有房主可以改关卡。",
    "srv.noLevelChange": "对局进行中不能改关卡。",
    "srv.badLevel": "没有这个关卡。",
    "srv.hostTheme": "只有房主可以改造型。",
    "srv.noThemeChange": "对局进行中不能改造型。",
    "srv.badTheme": "没有这个造型主题。",
    "srv.hostStart": "只有房主可以开始。",
    "srv.specNoPlay": "观战中不能出手。",
    "srv.notYet": "现在还不能出手。",
    "srv.specNoHint": "观战中不能用提示。",
    "srv.onlineNoHint": "线上对战不提供提示。",
    "srv.specNoShuffle": "观战中不能洗牌。",
    "srv.onlineNoShuffle": "线上对战不提供手动洗牌。",
    "srv.notOver": "这一局还没结束。",
    "srv.specNoRematch": "观战中不能投票再来一局。",
    "srv.hostReset": "只有房主可以重开房间。",
    "srv.stillRunning": "对局还在进行中。",
    "srv.muted": "你被暂时禁言，还要等 {n} 秒。",
    "srv.slowDown": "打字慢一点，别洗版。",
    "srv.emptyMsg": "讯息是空的。",
    "srv.hostMute": "只有房主可以禁言。",
    "srv.noSuchPerson": "找不到这个人。",
    "srv.muteSelf": "不能禁言自己。",
    "srv.hostInvite": "只有房主可以产生邀请连结。",
    "srv.hostRevoke": "只有房主可以撤销邀请连结。",
    "srv.noInvite": "找不到这张邀请。",
    "srv.inviteBad": "这个邀请连结无效（可能已被撤销，或房主重开了房间）。",
    "srv.inviteRevoked": "这个邀请连结已经被房主撤销了。",
    "srv.inviteExpired": "这个邀请连结已经过期了。",
    "srv.inviteUsed": "这个邀请连结的使用次数已经用完了。",
    "srv.noteSpecInvite": "这是观战用的邀请连结，进去之后是观战身分。",
    "srv.noteSeatsFull": "玩家席位已满，进去之后会先变成观战。",
    "srv.noteRunning": "这间房正在对战中，进去之后会先观战，下一局才能下场。",
    "srv.tooManyRooms": "伺服器上的房间太多了，请稍后再试。",
    "srv.codeFail": "产生房号失败，请再试一次。",
    "srv.goneNamed": "{n} 太久没回来，座位已经释出。",
    "srv.noSession": "连线还没准备好，请重新整理页面。",
    "srv.roomGone": "找不到这个房间，可能已经关闭或房号打错了。",
    "srv.inviteRoomGone": "这个邀请连结指向的房间已经不存在了。",
    "srv.notAnywhere": "你已经不在任何房间里了。",
    "srv.sysOpened": "{n} 开了这间房。大家按「准备好了」就能开始抢消。",
    "srv.sysBack": "{n} 重新连上线了。",
    "srv.sysJoinedPlayer": "{n} 加入了（玩家）。",
    "srv.sysJoinedSpec": "{n} 加入了（观战）。",
    "srv.sysSat": "{n} 从观战改成下场。",
    "srv.sysStood": "{n} 改成观战。",
    "srv.sysLevel": "关卡改成「{label}」。",
    "srv.sysTheme": "造型换成「{label}」（{count} 种）。",
    "srv.sysDealt": "盘面发好了！这一局的种子是 {seed}。",
    "srv.sysCleared": "盘面清空了！冠军是 {n}，{s} 分。",
    "srv.sysEnded": "这一局结束了。",
    "srv.sysShuffle": "{n} 洗了一次牌。",
    "srv.sysRematchGo": "大家都同意，新的一局开始了！",
    "srv.sysRematchVote": "{n} 想再来一局（{v}/{need}）。",
    "srv.sysReset": "房主把房间拉回准备阶段，可以换座位或改关卡了。",
    "srv.sysMuted": "{n} 被房主暂时禁言 {s} 秒。",
    "srv.sysEmpty": "房间没有人了，已经自动关闭。",
    "srv.sysLeft": "{n} 离开了房间。",
    "srv.sysDisc": "{n} 断线了，座位会先保留一分钟。",
    "srv.sysTimeTie": "时间到！{names} 同分平手。",
    "srv.sysTimeWin": "时间到！冠军是 {n}，{s} 分。",
    "art.fruits.apple": "苹果",
    "art.fruits.pear": "梨子",
    "art.fruits.banana": "香蕉",
    "art.fruits.orange": "橘子",
    "art.fruits.grape": "葡萄",
    "art.fruits.strawberry": "草莓",
    "art.fruits.watermelon": "西瓜",
    "art.fruits.peach": "水蜜桃",
    "art.fruits.cherry": "樱桃",
    "art.fruits.pineapple": "凤梨",
    "art.fruits.lemon": "柠檬",
    "art.fruits.kiwi": "奇异果",
    "art.fruits.mango": "芒果",
    "art.fruits.blueberry": "蓝莓",
    "art.fruits.avocado": "酪梨",
    "art.fruits.coconut": "椰子",
    "art.fruits.papaya": "木瓜",
    "art.fruits.persimmon": "柿子",
    "art.fruits.carrot": "红萝卜",
    "art.fruits.tomato": "番茄",
    "art.fruits.broccoli": "花椰菜",
    "art.fruits.corn": "玉米",
    "art.fruits.pumpkin": "南瓜",
    "art.fruits.eggplant": "茄子",
    "art.fruits.potato": "马铃薯",
    "art.fruits.onion": "洋葱",
    "art.fruits.mushroom": "香菇",
    "art.fruits.pepper": "甜椒",
    "art.fruits.cucumber": "小黄瓜",
    "art.fruits.cabbage": "高丽菜",
    "art.fruits.peas": "豌豆",
    "art.fruits.radish": "白萝卜",
    "art.fruits.guava": "芭乐",
    "art.fruits.dragonfruit": "火龙果",
    "art.fruits.melon": "哈密瓜",
    "art.fruits.durian": "榴梿",
    "art.fruits.pomegranate": "石榴",
    "art.fruits.sweet-potato": "地瓜",
    "art.fruits.garlic": "大蒜",
    "art.fruits.chili": "辣椒",
    "art.fruits.scallion": "葱",
    "art.fruits.bitter-melon": "苦瓜",
    "art.fruits.plum": "李子",
    "art.fruits.fig": "无花果",
    "art.fruits.lychee": "荔枝",
    "art.fruits.starfruit": "杨桃",
    "art.fruits.passionfruit": "百香果",
    "art.fruits.raspberry": "覆盆子",
    "art.fruits.mangosteen": "山竹",
    "art.fruits.loquat": "枇杷",
    "art.fruits.celery": "芹菜",
    "art.fruits.asparagus": "芦笋",
    "art.fruits.spinach": "菠菜",
    "art.fruits.okra": "秋葵",
    "art.fruits.beetroot": "甜菜根",
    "art.fruits.ginger": "姜",
    "art.fruits.lotus-root": "莲藕",
    "art.fruits.bamboo-shoot": "竹笋",
    "art.fruits.taro": "芋头",
    "art.fruits.chestnut": "栗子",
    "art.animals.cat": "猫咪",
    "art.animals.dog": "小狗",
    "art.animals.rabbit": "兔子",
    "art.animals.bear": "熊",
    "art.animals.panda": "猫熊",
    "art.animals.fox": "狐狸",
    "art.animals.pig": "小猪",
    "art.animals.cow": "乳牛",
    "art.animals.sheep": "绵羊",
    "art.animals.monkey": "猴子",
    "art.animals.lion": "狮子",
    "art.animals.tiger": "老虎",
    "art.animals.elephant": "大象",
    "art.animals.giraffe": "长颈鹿",
    "art.animals.zebra": "斑马",
    "art.animals.hippo": "河马",
    "art.animals.koala": "无尾熊",
    "art.animals.deer": "小鹿",
    "art.animals.squirrel": "松鼠",
    "art.animals.hedgehog": "刺猬",
    "art.animals.frog": "青蛙",
    "art.animals.penguin": "企鹅",
    "art.animals.owl": "猫头鹰",
    "art.animals.chick": "小鸡",
    "art.animals.duck": "鸭子",
    "art.animals.whale": "鲸鱼",
    "art.animals.dolphin": "海豚",
    "art.animals.octopus": "章鱼",
    "art.animals.crab": "螃蟹",
    "art.animals.turtle": "乌龟",
    "art.animals.snail": "蜗牛",
    "art.animals.bee": "蜜蜂",
    "art.animals.mouse": "老鼠",
    "art.animals.butterfly": "蝴蝶",
    "art.animals.ladybug": "瓢虫",
    "art.animals.goldfish": "金鱼",
    "art.animals.shark": "鲨鱼",
    "art.animals.starfish": "海星",
    "art.animals.jellyfish": "水母",
    "art.animals.kangaroo": "袋鼠",
    "art.animals.raccoon": "浣熊",
    "art.animals.parrot": "鹦鹉",
    "art.animals.horse": "马",
    "art.animals.camel": "骆驼",
    "art.animals.sloth": "树懒",
    "art.animals.bat": "蝙蝠",
    "art.animals.swan": "天鹅",
    "art.animals.flamingo": "红鹤",
    "art.animals.peacock": "孔雀",
    "art.animals.rooster": "公鸡",
    "art.animals.crocodile": "鳄鱼",
    "art.animals.snake": "蛇",
    "art.animals.seahorse": "海马",
    "art.animals.shrimp": "虾子",
    "art.animals.seal": "海豹",
    "art.animals.scallop": "扇贝",
    "art.animals.ant": "蚂蚁",
    "art.animals.dragonfly": "蜻蜓",
    "art.animals.spider": "蜘蛛",
    "art.animals.beetle": "独角仙",
    "art.food.food1": "汉堡",
    "art.food.food2": "披萨",
    "art.food.food3": "寿司",
    "art.food.food4": "饭团",
    "art.food.food5": "拉面",
    "art.food.food6": "墨西哥卷",
    "art.food.food7": "三明治",
    "art.food.food8": "热狗",
    "art.food.food9": "薯条",
    "art.food.food10": "牛排",
    "art.food.food11": "烤鸡",
    "art.food.food12": "荷包蛋",
    "art.food.food13": "起司",
    "art.food.food14": "吐司",
    "art.food.food15": "可颂",
    "art.food.food16": "水饺",
    "art.food.food17": "热汤",
    "art.food.food18": "沙拉",
    "art.food.food19": "咖哩饭",
    "art.food.food20": "便当",
    "art.food.food21": "爆米花",
    "art.food.food22": "蛋糕",
    "art.food.food23": "杯子蛋糕",
    "art.food.food24": "甜甜圈",
    "art.food.food25": "饼干",
    "art.food.food26": "巧克力",
    "art.food.food27": "糖果",
    "art.food.food28": "冰淇淋",
    "art.food.food29": "刨冰",
    "art.food.food30": "咖啡",
    "art.food.food31": "牛奶",
    "art.food.food32": "果汁",
    "art.food.pancake": "松饼",
    "art.food.bubble-tea": "珍珠奶茶",
    "art.food.taiyaki": "鲷鱼烧",
    "art.food.takoyaki": "章鱼烧",
    "art.food.pudding": "布丁",
    "art.food.lollipop": "棒棒糖",
    "art.food.chips": "洋芋片",
    "art.food.bagel": "贝果",
    "art.food.hotpot": "火锅",
    "art.food.skewer": "串烧",
    "art.food.spaghetti": "义大利面",
    "art.food.taco": "塔可饼",
    "art.food.pretzel": "蝴蝶脆饼",
    "art.food.macaron": "马卡龙",
    "art.food.mooncake": "月饼",
    "art.food.pineapple-cake": "凤梨酥",
    "art.food.bao": "包子",
    "art.food.tofu": "豆腐",
    "art.food.fried-rice": "炒饭",
    "art.food.sausage": "香肠",
    "art.food.sundae": "圣代",
    "art.food.tea": "热茶",
    "art.food.soda": "汽水",
    "art.food.honey": "蜂蜜",
    "art.food.swiss-roll": "蛋糕卷",
    "art.food.cotton-candy": "棉花糖",
    "art.food.egg-tart": "蛋塔",
    "art.food.sashimi": "生鱼片",
    "art.flags.taiwan": "台湾",
    "art.flags.japan": "日本",
    "art.flags.south-korea": "韩国",
    "art.flags.china": "中国",
    "art.flags.mongolia": "蒙古",
    "art.flags.india": "印度",
    "art.flags.singapore": "新加坡",
    "art.flags.thailand": "泰国",
    "art.flags.vietnam": "越南",
    "art.flags.philippines": "菲律宾",
    "art.flags.indonesia": "印尼",
    "art.flags.malaysia": "马来西亚",
    "art.flags.australia": "澳洲",
    "art.flags.new-zealand": "纽西兰",
    "art.flags.united-states": "美国",
    "art.flags.canada": "加拿大",
    "art.flags.mexico": "墨西哥",
    "art.flags.brazil": "巴西",
    "art.flags.argentina": "阿根廷",
    "art.flags.united-kingdom": "英国",
    "art.flags.france": "法国",
    "art.flags.germany": "德国",
    "art.flags.italy": "义大利",
    "art.flags.spain": "西班牙",
    "art.flags.portugal": "葡萄牙",
    "art.flags.netherlands": "荷兰",
    "art.flags.switzerland": "瑞士",
    "art.flags.sweden": "瑞典",
    "art.flags.norway": "挪威",
    "art.flags.finland": "芬兰",
    "art.flags.south-africa": "南非",
    "art.flags.egypt": "埃及",
    "art.flags.russia": "俄罗斯",
    "art.flags.austria": "奥地利",
    "art.flags.hungary": "匈牙利",
    "art.flags.bulgaria": "保加利亚",
    "art.flags.lithuania": "立陶宛",
    "art.flags.estonia": "爱沙尼亚",
    "art.flags.poland": "波兰",
    "art.flags.ukraine": "乌克兰",
    "art.flags.belgium": "比利时",
    "art.flags.ireland": "爱尔兰",
    "art.flags.romania": "罗马尼亚",
    "art.flags.nigeria": "奈及利亚",
    "art.flags.peru": "秘鲁",
    "art.flags.ivory-coast": "象牙海岸",
    "art.flags.denmark": "丹麦",
    "art.flags.iceland": "冰岛",
    "art.flags.czechia": "捷克",
    "art.flags.turkey": "土耳其",
    "art.flags.chile": "智利",
    "art.flags.morocco": "摩洛哥",
    "art.flags.greece": "希腊",
    "art.flags.colombia": "哥伦比亚",
    "art.flags.ghana": "迦纳",
    "art.flags.ethiopia": "衣索比亚",
    "art.flags.senegal": "塞内加尔",
    "art.flags.cameroon": "喀麦隆",
    "art.flags.armenia": "亚美尼亚",
    "art.flags.kenya": "肯亚",
    "art.flags.pakistan": "巴基斯坦",
    "art.flags.algeria": "阿尔及利亚",
    "art.flags.tunisia": "突尼西亚",
    "art.flags.israel": "以色列",
    "art.flags.uae": "阿联",
    "art.flags.bangladesh": "孟加拉",
    "art.flags.laos": "寮国",
    "art.flags.cambodia": "柬埔寨",
    "art.flags.myanmar": "缅甸",
    "art.flags.cuba": "古巴",
    "art.flags.jamaica": "牙买加",
    "art.flags.georgia": "乔治亚",
    "art.mahjong.dot-1": "一筒",
    "art.mahjong.dot-2": "二筒",
    "art.mahjong.dot-3": "三筒",
    "art.mahjong.dot-4": "四筒",
    "art.mahjong.dot-5": "五筒",
    "art.mahjong.dot-6": "六筒",
    "art.mahjong.dot-7": "七筒",
    "art.mahjong.dot-8": "八筒",
    "art.mahjong.dot-9": "九筒",
    "art.mahjong.bam-1": "一条",
    "art.mahjong.bam-2": "二条",
    "art.mahjong.bam-3": "三条",
    "art.mahjong.bam-4": "四条",
    "art.mahjong.bam-5": "五条",
    "art.mahjong.bam-6": "六条",
    "art.mahjong.bam-7": "七条",
    "art.mahjong.bam-8": "八条",
    "art.mahjong.bam-9": "九条",
    "art.mahjong.man-1": "一万",
    "art.mahjong.man-2": "二万",
    "art.mahjong.man-3": "三万",
    "art.mahjong.man-4": "四万",
    "art.mahjong.man-5": "五万",
    "art.mahjong.man-6": "六万",
    "art.mahjong.man-7": "七万",
    "art.mahjong.man-8": "八万",
    "art.mahjong.man-9": "九万",
    "art.mahjong.honor-east": "东",
    "art.mahjong.honor-south": "南",
    "art.mahjong.honor-west": "西",
    "art.mahjong.honor-north": "北",
    "art.mahjong.honor-red": "中",
    "art.mahjong.honor-green": "发",
    "art.mahjong.honor-white": "白",
    "art.mahjong.flower-plum": "梅",
    "art.mahjong.flower-orchid": "兰",
    "art.mahjong.flower-chrysanthemum": "菊",
    "art.mahjong.flower-bamboo": "竹",
    "art.mahjong.season-spring": "春",
    "art.mahjong.season-summer": "夏",
    "art.mahjong.season-autumn": "秋",
    "art.mahjong.season-winter": "冬"
  };
  if (root.I18N) root.I18N.register('zh-Hans', hans);
  if (typeof module === 'object' && module.exports) module.exports['zh-Hans'] = hans;
})(typeof window !== 'undefined' ? window : globalThis);

/* Server outage translations (shared by the custom notice component). */
(function (root) {
  root.ServerOutageMessages = {
    'zh-Hant': ['線上暫時無法連線', '免費伺服器額度將於 {date} 月 1 日重置，期間可繼續遊玩單機版。', '知道了'],
    'zh-Hans': ['线上暂时无法连线', '免费服务器额度将于 {date} 月 1 日重置，期间可继续游玩单机版。', '知道了'],
    en: ['Online unavailable', 'Free server quota resets on {date}. You can keep playing offline.', 'Got it']
  };
})(typeof window !== 'undefined' ? window : globalThis);
