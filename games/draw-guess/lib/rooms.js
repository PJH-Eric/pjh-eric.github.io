/* ===== lib/rooms.js — 房間狀態機（伺服器權威） =====
 *
 * 這一層只管「房間規則」：誰可以進來、誰坐在玩家席、什麼時候能開始、
 * 邀請連結有沒有過期、誰可以猜題、誰只能看。
 * 真正的遊戲規則一律轉交 Rules（線上房間跟單機都只有真人，沒有電腦對手），
 * 兩邊跟單機模式用的是同一份程式。
 *
 * 刻意不依賴 socket.io：所有方法都是「輸入 → { ok, ... }」，
 * 所以測試可以不開網路就跑完整個生命週期。
 *
 * 房間生命週期以「實體玩家」為準：
 *   實體玩家 = 坐在玩家席的真人。觀戰者不算。
 *   實體玩家歸零（最後一個真人離開、退出、或斷線超過保留時間）→ 立刻關房，
 *   邀請失效、計時器停掉、觀戰者收到「房間已結束」。
 *   關掉之後不會因為重新連線或舊邀請復活。
 *
 * 免費雲端前提：房間只活在記憶體裡，服務重啟就會消失，
 * 所以房間被設計成「可拋棄的暫時狀態」，沒有任何長期資料要保存。
 */
'use strict';

const crypto = require('crypto');
const Rules = require('../public/js/rules.js');
const RNG = require('../public/js/rng.js');
const Words = require('../public/js/words.js');

const CODE_ALPHABET = RNG.SEED_CHARS;          // 不含 0 O 1 I，方便口頭唸房號

/* 線上房間自己的規則上限：跟 Rules.CONST 的引擎極限（給單機自己練習用的）分開，
   不然單機把上限拉到 999 輪、99999 秒，線上房間也會跟著被拉大，其他真人會被晾在那邊等。 */
const ROOM_MIN_PLAYERS = 2;      // 線上至少要兩個真人才能開始，一個人就用單機練習
const ROOM_ROUNDS_MAX = Math.min(5, Rules.CONST.ROUNDS_MAX);
const ROOM_DRAW_SEC_MAX = Math.min(120, Rules.CONST.DRAW_SEC_MAX);

const DEFAULTS = {
  maxRooms: 300,
  codeLength: 4,
  graceMs: 60 * 1000,           // 斷線後保留座位的時間
  guessMax: 40,                 // 一次猜測的長度上限（英文題目最長 32 個字元，要放得下）
  feedKeep: 120,                // 猜題紀錄保留幾筆
  guessCooldownMs: 400,         // 同一人兩次猜測的最短間隔
  guessPerTurn: 40,             // 同一題最多猜幾次（擋洗版）
  summaryKeep: 60,
  chatMax: 200,                 // 一則聊天訊息的長度上限
  chatKeep: 60,                 // 聊天紀錄保留幾筆
  chatCooldownMs: 500,          // 同一人兩則聊天的最短間隔
  inviteTtlMs: 60 * 60 * 1000,  // 邀請連結預設有效期
  inviteMaxUses: 20,
  nameMax: 12,
  roomNameMax: 16,
  maxPlayers: 8,
  strokeCooldownMs: 0           // 筆畫不做冷卻，改用 Rules 的筆數／點數上限擋洪水
};

/* 錯誤訊息一律是字典代碼（srv.err.＊）加參數，由用戶端依使用者的語系翻譯；
   伺服器不產生任何特定語言的句子。 */
const err = (key, code, params) => ({ ok: false, error: key, params: params || null, code: code || 'invalid' });
const ok = (extra) => Object.assign({ ok: true }, extra || {});

/* 用戶端送來的東西不能直接 String()／Number()：物件可以把 toString／valueOf 塞成非函式，
   String({toString:1,valueOf:1}) 會直接丟例外，沒接住的話整台伺服器就掛了。
   所以一律只接受真正的字串／數字，其他型別當成空值。 */
const str = (x) => (typeof x === 'string' ? x : (typeof x === 'number' && isFinite(x) ? String(x) : ''));
const num = (x) => (typeof x === 'number' ? x : (typeof x === 'string' && x.trim() !== '' ? Number(x) : NaN));

/** 畫家斷線多久沒回來，這一題就先跳過（座位還是照樣保留 graceMs） */
const DRAWER_AWAY_MS = 15 * 1000;

/** 清掉控制字元、壓掉連續空白、限制長度。所有使用者輸入都要過這一關。 */
function sanitizeText(input, max) {
  const raw = str(input);
  /* 逐字元過濾：控制字元、雙向覆寫、零寬字元與各種空白一律換成半形空白。
     用字碼判斷而不是正規表示式，才不會有不可見字元躺在原始碼裡。 */
  let out = '';
  for (const ch of raw) {
    const c = ch.codePointAt(0);
    const blank = c < 0x21 || c === 0x7F || (c >= 0x80 && c <= 0xA0)
      || (c >= 0x2000 && c <= 0x200F) || (c >= 0x2028 && c <= 0x202E)
      || (c >= 0x2066 && c <= 0x2069) || c === 0x3000 || c === 0xFEFF;
    out += blank ? ' ' : ch;
  }
  out = out.split(' ').filter((part) => part.length > 0).join(' ');
  if (out.length > max) out = out.slice(0, max);
  return out;
}

/* 沒取名字的人不能全都叫「玩家」：猜題紀錄、席位卡與比分都只認名字。
   沒給名字（或還是舊版用戶端送來的通稱）就在伺服器端配一個可愛暱稱。 */
const NICK_ADJ = [
  '快樂', '愛睏', '勇敢', '迷糊', '害羞', '貪吃', '安靜', '調皮', '溫柔', '神祕',
  '閃亮', '認真', '悠哉', '熱血', '冷靜', '幸運', '好奇', '努力', '慢吞吞', '急驚風'
];
const NICK_ANIMAL = [
  '小貓', '小狗', '兔子', '企鵝', '狐狸', '水獺', '浣熊', '刺蝟', '海豚', '貓熊',
  '樹懶', '鸚鵡', '松鼠', '山羊', '袋鼠', '海豹', '章魚', '蜜蜂', '烏龜', '羊駝'
];
/* 英文暱稱：形容詞（最多 5 個字母）＋ 空白 ＋ 小動物（最多 6 個字母），剛好塞進 12 字的上限 */
const NICK_ADJ_EN = [
  'Happy', 'Brave', 'Dizzy', 'Shy', 'Quiet', 'Silly', 'Magic', 'Shiny', 'Smart', 'Chill',
  'Lucky', 'Nosy', 'Eager', 'Slow', 'Jolly', 'Zippy', 'Cozy', 'Sunny', 'Merry', 'Fuzzy'
];
const NICK_ANIMAL_EN = [
  'Kitty', 'Puppy', 'Bunny', 'Fox', 'Otter', 'Panda', 'Sloth', 'Parrot', 'Goat', 'Seal',
  'Bee', 'Turtle', 'Alpaca', 'Koala', 'Lemur', 'Moose', 'Gecko', 'Hippo', 'Mole', 'Llama'
];
const GENERIC_NAMES = ['玩家', '觀眾', '觀戰者', '你', 'player', 'guest', 'spectator', 'you'];
const isGeneric = (name) => GENERIC_NAMES.indexOf(String(name).toLowerCase()) >= 0;

/** lang：'en' 配英文暱稱，其餘配中文暱稱 */
function randomNick(lang) {
  if (lang === 'en') {
    return NICK_ADJ_EN[Math.floor(Math.random() * NICK_ADJ_EN.length)] + ' ' +
      NICK_ANIMAL_EN[Math.floor(Math.random() * NICK_ANIMAL_EN.length)];
  }
  return NICK_ADJ[Math.floor(Math.random() * NICK_ADJ.length)] +
    NICK_ANIMAL[Math.floor(Math.random() * NICK_ANIMAL.length)];
}

function sanitizeName(input, fallback, lang) {
  const s = sanitizeText(input, DEFAULTS.nameMax);
  if (s && !isGeneric(s)) return s;
  if (fallback && !isGeneric(fallback)) return fallback;
  return randomNick(lang);
}

class Room {
  constructor(store, opts) {
    this.store = store;
    this.code = opts.code;
    this.name = opts.name;
    this.private = !!opts.private;
    this.createdAt = opts.now;

    /** id -> { id, name, role, ready, connected, joinedAt, lastSeen, lastGuessAt, guessCount } */
    this.members = new Map();
    /** aiId -> { id, name, level } */
    this.hostId = null;

    /** 'waiting' | 'playing' | 'finished' */
    this.phase = 'waiting';
    this.state = null;
    this.seed = opts.seed || RNG.randomSeed(null, 6);

    this.settings = {
      rounds: Rules.CONST.ROUNDS_DEFAULT,
      drawSec: Math.round(Rules.CONST.DRAW_MS / 1000),
      diff: 0,                       // 0 = 混合難度
      /* 題庫語言：整間房共用（不跟著每個人的介面語言走），由房主在開房／等待畫面決定 */
      wordLang: 'zh-Hant',
      maxPlayers: store.opts.maxPlayers
    };

    /** 這一題的畫家已經按過「畫完了」的題號（-1 = 還沒按）。只是通知，不會結束這一題。 */
    this.doneTurn = -1;
    /** 猜題紀錄：誰猜了什麼、誰猜對了、系統事件。這是遊戲紀錄，不是自由聊天。 */
    this.feed = [];
    this.summary = [];
    this.invites = new Map();
    /** 這一局中途離開的人：id -> { score, drew }。同一局裡回來時接回分數與已畫次數，開新局就清掉。 */
    this.departed = new Map();
    /** 等待畫面的自由聊天：只在 phase === 'waiting' 收，開始對局後 chat() 一律擋掉，
     *  這樣才不會有人不小心把題目答案打進聊天室裡外流。見下面 chat()。
     *  這個陣列刻意不叫 this.chat：下面 chat() 方法要用這個名字，陣列跟方法撞名的話，
     *  建構子裡賦值會直接把原型上的方法蓋掉，之後呼叫 room.chat(...) 就會炸掉。 */
    this.chatLog = [];

    this.version = 0;
    this.closed = false;
    this.closedReason = null;
  }

  /* ------------------------------------------------------------ 查詢 */

  member(id) { return this.members.get(id) || null; }
  isHost(id) { return this.hostId === id; }

  /** 坐在玩家席的真人 —— 房間存不存在只看這個數字 */
  humanPlayers() {
    return [...this.members.values()].filter((m) => m.role === 'player');
  }

  spectators() {
    return [...this.members.values()].filter((m) => m.role === 'spectator');
  }

  seatsTaken() { return this.humanPlayers().length; }

  /**
   * 同一間房裡不允許兩個一模一樣的名字：猜題紀錄、席位卡與比分都只認名字，
   * 兩個「玩家」或兩個「小明」會讓人完全分不出誰是誰，重複的就自動接編號。
   * @param {string} base    想用的名字（已經過 sanitizeName）
   * @param {string} selfId  自己的 id（換名字時不跟自己比）
   */
  uniqueName(base, selfId) {
    const taken = new Set();
    for (const [mid, m] of this.members) if (mid !== String(selfId || '')) taken.add(m.name);
    if (!taken.has(base)) return base;
    for (let i = 2; i <= 30; i++) {
      const candidate = base + i;
      if (!taken.has(candidate)) return candidate;
    }
    return base + Math.floor(Math.random() * 900 + 100);
  }
  openSeats() { return Math.max(0, this.settings.maxPlayers - this.seatsTaken()); }

  /**
   * 挑下一任房主：優先交給最早進房、還坐在玩家席的人；沒有玩家才輪到觀戰者。
   * 以前是單純挑最早進房的人，結果常常交給觀戰者 —— 觀戰者畫面上沒有「開始！」，
   * 大家就只能一直等下去。
   */
  pickHost(excludeId) {
    const all = [...this.members.values()].filter((m) => m.id !== excludeId)
      .sort((a, b) => a.joinedAt - b.joinedAt);
    const player = all.find((m) => m.role === 'player');
    return player ? player.id : (all[0] ? all[0].id : null);
  }

  /** 對局中把人加進 Rules：同一局裡離開又回來的人，把他離開前的分數與已畫次數接回去 */
  addToGame(m, now, how) {
    if (this.phase !== 'playing' || !this.state) return;
    const back = this.departed.get(m.id);
    const added = Rules.addPlayer(this.state, {
      id: m.id, name: m.name, ai: null,
      score: back ? back.score : 0, drew: back ? back.drew : 0
    });
    if (!added.ok || added.already) return;
    this.departed.delete(m.id);
    this.note(back ? 'srv.sum.backInGame' : (how === 'become' ? 'srv.sum.becamePlayerMid' : 'srv.sum.joinedMid'),
      { name: m.name }, now, 'info');
  }

  /** 送進 Rules 的名單：線上房間只有真人 */
  roster() {
    return this.humanPlayers()
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .map((m) => ({ id: m.id, name: m.name, ai: null }));
  }

  canStart() {
    if (this.phase === 'playing') return err('srv.err.alreadyStarted');
    if (this.phase !== 'waiting') return err('srv.err.backToRoomFirst', 'phase');
    if (this.seatsTaken() < ROOM_MIN_PLAYERS) {
      return err('srv.err.needPlayers', undefined, { n: ROOM_MIN_PLAYERS });
    }
    /* 房主不用另外按「準備好了」：按「開始」本身就代表房主準備好了，
       所以只等其他玩家（畫面上房主也沒有準備鈕，只有「開始！」） */
    const notReady = this.humanPlayers().filter((m) => !m.ready && m.id !== this.hostId);
    if (notReady.length) {
      return err('srv.err.notReady', undefined, { names: notReady.map((m) => m.name) });
    }
    return ok();
  }

  /* ------------------------------------------------------------ 加入 */

  join(id, opts) {
    const { name, role, token, now, lang } = opts || {};
    if (this.closed) return err('srv.err.roomClosed', 'closed');

    const existing = this.members.get(id);
    if (existing) {
      /* 重新連線：座位、角色與名字都接回來 */
      existing.connected = true;
      existing.lastSeen = now;
      if (name) existing.name = this.uniqueName(sanitizeName(name, existing.name), id);
      this.syncPlayerNames();
      this.touch();
      return ok({ member: existing, reconnected: true });
    }

    let wantRole = role === 'spectator' ? 'spectator' : 'player';

    /* 帶邀請 token 進來的，角色由 token 決定並要通過驗證 */
    if (token) {
      const check = this.checkInvite(token, now);
      if (!check.ok) return check;
      if (check.invite.role !== 'any') wantRole = check.invite.role;
    } else if (this.private && !opts.creator) {
      return err('srv.err.privateRoom', 'private');
    }

    /* 想當玩家但沒位子 → 明白地轉為觀戰，不默默佔位。
       對局進行中還有空位的話，可以直接加入當玩家：自動排在目前順位的最後一位，
       這一場也就跟著多一題、多一輪，不用等這一局結束。 */
    let downgraded = false;
    if (wantRole === 'player' && this.openSeats() <= 0) {
      wantRole = 'spectator';
      downgraded = true;
    }

    const member = {
      id,
      name: this.uniqueName(sanitizeName(name, '', lang), id),
      role: wantRole,
      ready: false,
      connected: true,
      joinedAt: now,
      lastSeen: now,
      lastGuessAt: 0,
      guessTurn: 0,
      guessCount: 0,
      lastChatAt: 0
    };
    this.members.set(id, member);
    if (!this.hostId) this.hostId = id;
    if (token) this.consumeInvite(token);
    if (member.role === 'player') this.addToGame(member, now, 'join');
    this.touch();
    return ok({ member, downgraded });
  }

  /** 觀戰者下場當玩家。對局進行中一樣可以下場，跟中途加入一樣排在最後一位。 */
  becomePlayer(id, now) {
    const m = this.member(id);
    if (!m) return err('srv.err.notInRoom');
    if (m.role === 'player') return ok({ already: true });
    if (this.openSeats() <= 0) return err('srv.err.seatsFullWatch', 'full');
    m.role = 'player';
    m.ready = false;
    this.addToGame(m, now, 'become');
    this.touch();
    return ok();
  }

  /** 最後一位玩家不能改成觀戰：改下去房間就沒有玩家了，會直接被關掉 */
  canBecomeSpectator(id) {
    const m = this.member(id);
    if (!m || m.role !== 'player' || this.phase === 'playing' || this.closed) return false;
    return this.humanPlayers().some((x) => x.id !== id);
  }

  becomeSpectator(id) {
    const m = this.member(id);
    if (!m) return err('srv.err.notInRoom');
    if (m.role !== 'player') return ok({ already: true });
    if (this.phase === 'playing') {
      return err('srv.err.cantSpectateNow', 'playing');
    }
    if (!this.canBecomeSpectator(id)) {
      return err('srv.err.lastPlayer', 'last');
    }
    m.role = 'spectator';
    m.ready = false;
    /* 房主改成觀戰：房主交給下一位玩家，不然觀戰的房主沒有「開始！」，大家會卡住 */
    let newHost = null;
    if (this.hostId === id) {
      this.hostId = this.pickHost(id);
      const h = this.member(this.hostId);
      newHost = h ? h.name : null;
    }
    this.touch();
    return ok({ newHost });
  }

  setReady(id, ready) {
    const m = this.member(id);
    if (!m) return err('srv.err.notInRoom');
    if (m.role !== 'player') return err('srv.err.spectatorNoReady', 'forbidden');
    m.ready = !!ready;
    this.touch();
    return ok({ ready: m.ready });
  }

  setSettings(hostId, patch) {
    if (!this.isHost(hostId)) return err('srv.err.onlyHostRules', 'forbidden');
    if (this.phase === 'playing') return err('srv.err.noRulesNow');
    const p = (patch && typeof patch === 'object') ? patch : {};
    /* 先全部驗過、再一次套用：以前是邊驗邊改，{rounds:4, drawSec:5} 會回錯誤、
       但 rounds 已經偷偷被改成 4 了。型別也只收數字（或數字字串），true、[3] 這種不收。 */
    const next = Object.assign({}, this.settings);
    if (p.rounds !== undefined) {
      const r = Math.round(num(p.rounds));
      if (!isFinite(r) || r < 1 || r > ROOM_ROUNDS_MAX) return err('srv.err.roundsRange', undefined, { max: ROOM_ROUNDS_MAX });
      next.rounds = r;
    }
    if (p.drawSec !== undefined) {
      const d = Math.round(num(p.drawSec));
      if (!isFinite(d) || d < Rules.CONST.DRAW_SEC_MIN || d > ROOM_DRAW_SEC_MAX) {
        return err('srv.err.drawSecRange', undefined, { min: Rules.CONST.DRAW_SEC_MIN, max: ROOM_DRAW_SEC_MAX });
      }
      next.drawSec = d;
    }
    if (p.diff !== undefined) {
      const v = Math.round(num(p.diff));
      if ([0, 1, 2, 3].indexOf(v) < 0) return err('srv.err.diffRange');
      next.diff = v;
    }
    if (p.wordLang !== undefined) {
      const l = str(p.wordLang);
      if (Words.LANGS.indexOf(l) < 0) return err('srv.err.langRange');
      next.wordLang = l;
    }
    this.settings = next;
    this.touch();
    return ok({ settings: this.settings });
  }

  /* ------------------------------------------------------------ 聊天室 */

  /**
   * 等待畫面才能聊天：這時候還沒題目、也還沒有答案，不會有人不小心把答案打出來外流。
   * 一旦開始對局，phase 就不是 'waiting'，這裡直接擋掉；用戶端也會把聊天室整塊收起來。
   */
  chat(id, text, now) {
    const m = this.member(id);
    if (!m) return err('srv.err.notInRoom');
    /* 結算畫面（finished）答案都公布完了，也可以聊天 */
    if (this.phase === 'playing') return err('srv.err.noChatNow', 'phase');
    if (now - m.lastChatAt < this.store.opts.chatCooldownMs) {
      return err('srv.err.chatTooFast', 'ratelimit');
    }
    const clean = sanitizeText(text, this.store.opts.chatMax);
    if (!clean) return err('srv.err.emptyMessage', 'empty');
    m.lastChatAt = now;
    const entry = {
      id: crypto.randomBytes(6).toString('hex'),
      from: m.name, fromId: m.id, text: clean, at: now
    };
    this.chatLog.push(entry);
    if (this.chatLog.length > this.store.opts.chatKeep) {
      this.chatLog.splice(0, this.chatLog.length - this.store.opts.chatKeep);
    }
    this.touch();
    return ok({ entry });
  }

  /* ------------------------------------------------------------ 開局 */

  start(hostId, now) {
    if (!this.isHost(hostId)) return err('srv.err.onlyHostStart', 'forbidden');
    const can = this.canStart();
    if (!can.ok) return can;

    this.seed = RNG.randomSeed(null, 6);
    this.state = Rules.createState({
      seed: this.seed,
      players: this.roster(),
      rounds: this.settings.rounds,
      drawSec: this.settings.drawSec,
      diff: this.settings.diff,
      lang: this.settings.wordLang
    });
    const s = Rules.start(this.state, now);
    if (!s.ok) return s;
    this.phase = 'playing';
    this.doneTurn = -1;
    this.summary = [];
    this.departed.clear();
    this.note('srv.sum.start', { seed: this.seed, rounds: this.settings.rounds, secs: this.settings.drawSec }, now);
    this.noteTurnStart(now);
    this.touch();
    return ok({ state: this.state });
  }

  /* ---------------------------------------------------------- 遊戲行動 */

  /** 只有「坐在玩家席、而且真的在這一局裡」的人可以送遊戲行動 */
  requirePlayer(id) {
    const m = this.member(id);
    if (!m) return err('srv.err.notInRoom');
    if (m.role !== 'player') return err('srv.err.spectatorNoPlay', 'forbidden');
    if (this.phase !== 'playing' || !this.state) return err('srv.err.noGame', 'phase');
    if (!Rules.player(this.state, id)) return err('srv.err.notInRoster', 'forbidden');
    return ok({ member: m });
  }

  pickWord(id, wordId, now) {
    const gate = this.requirePlayer(id);
    if (!gate.ok) return gate;
    const res = Rules.pickWord(this.state, id, wordId, now);
    if (!res.ok) return res;
    this.noteWordPicked(now, false);
    this.touch();
    return res;
  }

  stroke(id, raw, now) {
    const gate = this.requirePlayer(id);
    if (!gate.ok) return gate;
    const res = Rules.addStroke(this.state, id, raw);
    if (!res.ok) return res;
    this.touch();
    return res;
  }

  undo(id) {
    const gate = this.requirePlayer(id);
    if (!gate.ok) return gate;
    const res = Rules.undoStroke(this.state, id);
    if (res.ok) this.touch();
    return res;
  }

  clearBoard(id) {
    const gate = this.requirePlayer(id);
    if (!gate.ok) return gate;
    const res = Rules.clearBoard(this.state, id);
    if (res.ok) this.touch();
    return res;
  }

  /** 畫家給出下一張提示（字數 → 種類 → 一個字） */
  giveHint(id, now) {
    const gate = this.requirePlayer(id);
    if (!gate.ok) return gate;
    const res = Rules.giveHint(this.state, id, now);
    if (!res.ok) return res;
    this.noteHint(res, now);
    this.touch();
    return res;
  }

  /** 畫家提前結束這一題 */
  skipTurn(id, now) {
    const gate = this.requirePlayer(id);
    if (!gate.ok) return gate;
    const res = Rules.giveUp(this.state, id, now);
    if (!res.ok) return res;
    this.noteTurnEnd(res.entry, now);
    this.touch();
    return res;
  }

  /* ------------------------------------------------------------ 猜題 */

  /**
   * 送出一次猜測。對局進行中唯一能打字的地方就是這裡（猜答案）：
   * 聊天室（見上面 chat()）只在等待畫面開放，開始對局後就關掉了，
   * 所以不會有「聊天打字時不小心把答案說出來」的問題。
   *
   * @returns {{ok, kind:'hit'|'close'|'miss', entry?, points?, order?}}
   *   hit   猜中：猜的內容不外流，只公布「某某猜對了」
   *   close 猜中答案一半以上的字：只回給猜的人，不進紀錄
   *   miss  沒猜中：寫進猜題紀錄讓大家看到有人猜過什麼
   */
  guess(id, text, now) {
    const m = this.member(id);
    if (!m) return err('srv.err.notInRoom');
    if (this.phase !== 'playing' || !this.state) return err('srv.err.noGame', 'phase');
    if (m.role !== 'player') return err('srv.err.spectatorNoGuess', 'forbidden');
    if (!Rules.player(this.state, id)) return err('srv.err.notInRoster', 'forbidden');
    if (this.state.phase !== 'drawing') return err('srv.err.notGuessTime', 'phase');
    if (this.state.drawerId === id) return err('srv.err.drawerCantGuess', 'forbidden');
    if (Rules.hasGuessed(this.state, id)) return err('srv.err.alreadyGuessed', 'done');

    if (now - m.lastGuessAt < this.store.opts.guessCooldownMs) {
      return err('srv.err.guessTooFast', 'ratelimit');
    }
    if (m.guessTurn !== this.state.turnNo) { m.guessTurn = this.state.turnNo; m.guessCount = 0; }
    if (m.guessCount >= this.store.opts.guessPerTurn) {
      return err('srv.err.guessTooMany', 'ratelimit');
    }
    const clean = sanitizeText(text, this.store.opts.guessMax);
    if (!clean) return err('srv.err.emptyGuess', 'empty');
    m.lastGuessAt = now;
    m.guessCount += 1;

    const g = Rules.guess(this.state, id, clean, now);
    if (!g.ok) return g;
    if (g.verdict === 'hit') {
      this.touch();
      this.noteCorrect(m, g, now);
      return ok({ kind: 'hit', points: g.points, order: g.order, allDone: g.allDone, name: m.name });
    }
    if (g.verdict === 'close') return ok({ kind: 'close', text: clean });
    return ok({ kind: 'miss', entry: this.pushFeed(this.guessEntry(m.name, m.id, 'player', clean, now)) });
  }

  /**
   * 畫家按「畫完了」：只是告訴大家可以認真猜了，**不會**結束這一題，
   * 時間照跑、還能繼續補筆畫。真的要結束是 skipTurn。
   *
   * 同一題可以一直按：補了幾筆想再叫大家看一次是很自然的事，
   * 所以這裡不擋重複，每按一次就再廣播一次。
   */
  markDone(id, now) {
    if (this.phase !== 'playing' || !this.state) return err('srv.err.noGame', 'phase');
    const m = this.member(id);
    if (!m) return err('srv.err.notInRoom');
    if (this.state.drawerId !== id) return err('srv.err.onlyDrawerDone', 'forbidden');
    if (this.state.phase !== 'drawing') return err('srv.err.notDrawTime', 'phase');
    this.doneTurn = this.state.turnNo;
    this.note('srv.sum.done', { name: m.name }, now, 'info');
    this.system('srv.feed.done', { name: m.name }, now);
    this.touch();
    return ok({ name: m.name });
  }

  guessEntry(from, fromId, role, text, now) {
    return {
      id: crypto.randomBytes(6).toString('hex'),
      kind: 'guess', from, fromId, role, text, at: now
    };
  }

  /** 系統訊息（有人加入、猜中、換題…），跟猜題紀錄共用同一條時間軸。
   *  只存字典代碼與參數（srv.feed.＊），由每個人的畫面依自己的語言組句。 */
  system(key, params, now, kind) {
    return this.pushFeed({
      id: crypto.randomBytes(6).toString('hex'),
      kind: kind || 'system',
      from: '',
      fromId: null,
      role: 'system',
      key,
      params: params || {},
      at: now
    });
  }

  pushFeed(entry) {
    this.feed.push(entry);
    if (this.feed.length > this.store.opts.feedKeep) {
      this.feed.splice(0, this.feed.length - this.store.opts.feedKeep);
    }
    return entry;
  }

  /* -------------------------------------------------------- 操作摘要 */

  /**
   * 摘要條目。重要：作畫階段結束前，這裡絕對不會出現答案，
   * 所以同一份摘要可以直接送給玩家與觀戰者，不需要再過濾。
   */
  note(key, params, now, kind) {
    this.summary.push({ key, params: params || {}, at: now, kind: kind || 'info' });
    if (this.summary.length > this.store.opts.summaryKeep) {
      this.summary.splice(0, this.summary.length - this.store.opts.summaryKeep);
    }
  }

  noteTurnStart(now) {
    const s = this.state;
    if (!s) return;
    const d = Rules.player(s, s.drawerId);
    this.note('srv.sum.turn', { no: s.turnNo, total: s.totalTurns, name: d ? d.name : '—' }, now, 'turn');
  }

  noteWordPicked(now, auto) {
    const s = this.state;
    if (!s || !s.wordId) return;
    const d = Rules.player(s, s.drawerId);
    /* 種類與字數現在是畫家手上的提示，選題時還不能寫進摘要 */
    this.note(auto ? 'srv.sum.autoPicked' : 'srv.sum.picked', { name: d ? d.name : '—' }, now, 'pick');
  }

  noteHint(res, now) {
    /* 種類只送代碼（cat），由畫面端翻成各自語言的分類名稱 */
    const w = Words.byId(this.state.wordId, this.state.lang);
    const key = res.step === 1 ? 'srv.sum.hintLen' : (res.step === 2 ? 'srv.sum.hintCat' : 'srv.sum.hintMask');
    const params = res.step === 1 ? { n: Words.glyphCount(w) }
      : (res.step === 2 ? { cat: w.cat } : { mask: res.mask });
    this.note(key, params, now, 'hint');
    this.system(key, params, now, 'hint');
  }

  noteCorrect(who, g, now) {
    const params = { name: who.name, order: g.order, points: g.points };
    this.note('srv.sum.correct', params, now, 'correct');
    this.system('srv.feed.correct', params, now, 'correct');
  }

  noteTurnEnd(entry, now) {
    if (!entry) return;
    /* 畫家還在選題就離開／斷線：這一題根本沒有題目，不要寫出「答案是「null」」 */
    if (!entry.word) {
      this.note('srv.sum.noWord', {}, now, 'reveal');
      this.system('srv.feed.noWord', {}, now);
      return;
    }
    this.note('srv.sum.reveal', {
      word: entry.word, correct: entry.correct, total: entry.total,
      name: entry.drawerName, points: entry.drawerPoints
    }, now, 'reveal');
    this.system('srv.feed.reveal', { word: entry.word }, now);
  }

  /* ------------------------------------------------------- 邀請連結 */

  createInvite(id, { role, ttlMs, maxUses, now }) {
    const m = this.member(id);
    if (!m) return err('srv.err.notInRoom');
    if (m.role !== 'player' && !this.isHost(id)) {
      return err('srv.err.inviteForbidden', 'forbidden');
    }
    const wanted = (role === 'player' || role === 'spectator' || role === 'any') ? role : 'any';
    const ttl = Math.max(60 * 1000, Math.min(24 * 60 * 60 * 1000, num(ttlMs) || this.store.opts.inviteTtlMs));
    const uses = Math.max(1, Math.min(100, Math.round(num(maxUses)) || this.store.opts.inviteMaxUses));
    const token = crypto.randomBytes(16).toString('hex');   // 16 bytes = 猜不到
    this.invites.set(token, {
      token, role: wanted, createdBy: id, createdAt: now,
      expiresAt: now + ttl, maxUses: uses, uses: 0, revoked: false
    });
    /* 一間房最多留 8 組有效邀請，超過就丟掉最舊的 */
    if (this.invites.size > 8) {
      const oldest = [...this.invites.values()].sort((a, b) => a.createdAt - b.createdAt)[0];
      this.invites.delete(oldest.token);
    }
    this.touch();
    return ok({ invite: this.invites.get(token) });
  }

  revokeInvite(id, token) {
    const inv = this.invites.get(token);
    if (!inv) return err('srv.err.inviteGone', 'gone');
    if (inv.createdBy !== id && !this.isHost(id)) return err('srv.err.revokeForbidden', 'forbidden');
    inv.revoked = true;
    this.touch();
    return ok({ token });
  }

  /** 每次加入與重新連線都重新驗證，不是只在產生的當下檢查一次 */
  checkInvite(token, now) {
    if (this.closed) return err('srv.err.inviteRoomClosed', 'closed');
    const inv = this.invites.get(str(token));
    if (!inv) return err('srv.err.inviteInvalid', 'invite_invalid');
    if (inv.revoked) return err('srv.err.inviteRevoked', 'invite_revoked');
    if (inv.expiresAt <= now) return err('srv.err.inviteExpired', 'invite_expired');
    if (inv.uses >= inv.maxUses) return err('srv.err.inviteUsed', 'invite_used');
    if (this.phase === 'playing') {
      return ok({ invite: inv, note: 'srv.note.invitePlaying' });
    }
    if (this.openSeats() <= 0 && inv.role !== 'spectator') {
      return ok({ invite: inv, note: 'srv.note.inviteFull' });
    }
    return ok({ invite: inv });
  }

  consumeInvite(token) {
    const inv = this.invites.get(str(token));
    if (inv) inv.uses += 1;
  }

  /** 房間關閉時把所有邀請一併作廢 */
  revokeAllInvites() {
    for (const inv of this.invites.values()) inv.revoked = true;
  }

  /* ------------------------------------------------------- 離開／回收 */

  disconnect(id, now) {
    const m = this.member(id);
    if (!m) return err('srv.err.noSuchMember');
    m.connected = false;
    m.lastSeen = now;
    this.touch();
    return ok();
  }

  leave(id, now) {
    const m = this.member(id);
    if (!m) return err('srv.err.noSuchMember');
    this.members.delete(id);

    if (this.state && this.phase === 'playing' && Rules.player(this.state, id)) {
      const p = Rules.player(this.state, id);
      this.departed.set(id, { score: p.score, drew: p.drew });
      const r = Rules.removePlayer(this.state, id, now);
      if (r.ok && r.turnEnded) this.noteTurnEnd(r.turnEnded, now);
      /* 少一個猜題者可能剛好湊齊「全部猜中」而收掉這一題：這些事件也要寫進紀錄，
         不然答案就沒公布在摘要裡 */
      if (r.ok && r.events) for (const ev of r.events) this.applyEvent(ev, now);
      if (this.state.over && this.phase === 'playing') this.finishGame(now);
    }
    if (this.hostId === id) this.hostId = this.pickHost(id);
    this.touch();
    return ok({ name: m.name, role: m.role });
  }

  /** 斷線超過保留時間的人清掉，把座位讓出來 */
  sweepMembers(now) {
    const dropped = [];
    for (const m of [...this.members.values()]) {
      if (m.connected) continue;
      if (now - m.lastSeen < this.store.opts.graceMs) continue;
      this.leave(m.id, now);
      dropped.push(m);
    }
    return dropped;
  }

  /** 實體玩家歸零 → 立刻關房。AI 席位與觀戰者都不能讓房間活下去。 */
  shouldClose() {
    return this.humanPlayers().length === 0;
  }

  close(reason, now) {
    if (this.closed) return;
    this.closed = true;
    this.closedReason = reason || 'srv.closed.default';
    this.phase = 'finished';
    this.revokeAllInvites();
    this.state = null;                 // 停掉對局計時器的依據
    this.note(this.closedReason, {}, now, 'closed');
    this.touch();
  }

  /* ------------------------------------------------------------ 推進 */

  /**
   * 每秒（或每次有人行動後）呼叫一次：推進規則時間。
   * 線上房間只有真人，沒有需要代打的電腦席位。
   * @returns {{events: Array, strokes: Array, feed: Array}}
   */
  tick(now) {
    const out = { events: [], strokes: [], feed: [] };
    if (this.closed || this.phase !== 'playing' || !this.state) return out;

    const before = this.state.turnNo;

    /* 畫家斷線超過 DRAWER_AWAY_MS 還沒回來：先跳過這一題，不讓大家對著空白畫布乾等。
       他的座位照樣保留 graceMs，回來還能繼續玩（這一題不算他畫過）。 */
    const away = this.drawerAwayUntil();
    if (away && now >= away) {
      const d = this.member(this.state.drawerId);
      const e = Rules.endTurn(this.state, now, 'drawerleft');
      if (e.ok) {
        const dp = Rules.player(this.state, this.state.drawerId);
        if (dp && dp.drew > 0) dp.drew -= 1;       // 沒畫到的這一題不算數，之後還會輪到他
        Rules.recount(this.state);
        this.system('srv.feed.drawerGone', { name: d ? d.name : '' }, now);
        this.noteTurnEnd(e.entry, now);
        out.events.push({ type: 'turnend', entry: e.entry });
      }
    }

    const t = Rules.tick(this.state, now);
    for (const ev of t.events) this.applyEvent(ev, now);
    out.events.push(...t.events);

    if (this.state.over) { this.finishGame(now); return out; }
    if (this.state && this.state.turnNo !== before) this.touch();
    return out;
  }

  /** 畫家斷線中：回傳「等到幾點就跳過」，沒斷線回傳 0 */
  drawerAwayUntil() {
    const s = this.state;
    if (!s || this.phase !== 'playing') return 0;
    if (s.phase !== 'picking' && s.phase !== 'drawing') return 0;
    const d = this.member(s.drawerId);
    if (!d || d.connected) return 0;
    return d.lastSeen + DRAWER_AWAY_MS;
  }

  applyEvent(ev, now) {
    if (ev.type === 'autopick') this.noteWordPicked(now, true);
    else if (ev.type === 'turnend') this.noteTurnEnd(ev.entry, now);
    else if (ev.type === 'turnstart') this.noteTurnStart(now);
    else if (ev.type === 'gameover') this.note('srv.sum.over', {}, now, 'over');
    this.touch();
  }

  finishGame(now) {
    if (this.phase === 'finished') return;
    this.phase = 'finished';
    for (const m of this.members.values()) m.ready = false;
    const names = (this.state ? this.state.winners : []).map((id) => {
      const p = Rules.player(this.state, id);
      return p ? p.name : '—';
    });
    if (names.length > 1) this.system('srv.feed.tie', { names }, now);
    else this.system('srv.feed.win', { name: names[0] || '—' }, now);
    this.note('srv.sum.result', { names: names.length ? names : ['—'] }, now, 'result');
    this.touch();
  }

  /**
   * 結算完回到等待畫面：房主按「回房間」，大家回到房間設定那張卡
   * （可以聊天、改規則、重新準備），再照原本流程按開始。
   * 以前是「全員投票再玩一局」直接開新局：沒辦法改規則，有一個人掛機就全部卡住。
   */
  returnToRoom(id, now) {
    if (this.closed) return err('srv.err.roomEnded', 'closed');
    if (this.phase !== 'finished') return err('srv.err.gameNotOver', 'phase');
    if (!this.isHost(id)) return err('srv.err.onlyHostReturn', 'forbidden');
    this.phase = 'waiting';
    this.state = null;
    this.doneTurn = -1;
    this.departed.clear();
    for (const m of this.members.values()) m.ready = false;
    this.touch();
    return ok();
  }

  syncPlayerNames() {
    if (!this.state) return;
    for (const p of this.state.players) {
      const m = this.members.get(p.id);
      if (m) p.name = m.name;
    }
  }

  touch() { this.version += 1; }

  /* --------------------------------------------------------- 對外投影 */

  brief() {
    return {
      code: this.code,
      name: this.name,
      private: this.private,
      phase: this.phase,
      closed: this.closed,
      players: this.seatsTaken(),
      maxPlayers: this.settings.maxPlayers,
      humans: this.humanPlayers().length,
      spectators: this.spectators().length,
      host: this.hostId && this.members.get(this.hostId) ? this.members.get(this.hostId).name : '',
      rounds: this.settings.rounds,
      drawSec: this.settings.drawSec,
      wordLang: this.settings.wordLang,
      turnNo: this.state ? this.state.turnNo : 0,
      totalTurns: this.state ? this.state.totalTurns : this.settings.rounds * Math.max(1, this.seatsTaken()),
      createdAt: this.createdAt
    };
  }

  /**
   * 傳給某一位成員的完整房間投影。
   * 答案的保護在 Rules.toPublic 裡：只有當回合畫家拿得到，
   * 觀戰者與其他玩家一律拿遮罩字串。摘要本身在揭曉前不寫答案。
   */
  viewFor(id, now) {
    const m = this.member(id);
    const isHost = this.isHost(id);
    const canStart = this.canStart();
    const inGame = !!(this.state && Rules.player(this.state, id));
    const game = this.state ? Rules.toPublic(this.state, inGame ? id : null) : null;

    return {
      room: {
        code: this.code,
        name: this.name,
        private: this.private,
        phase: this.phase,
        closed: this.closed,
        closedReason: this.closedReason,
        hostId: this.hostId,
        settings: this.settings,
        drawerDone: !!(this.state && this.doneTurn === this.state.turnNo),
        seatsTaken: this.seatsTaken(),
        openSeats: this.openSeats(),
        members: [...this.members.values()].map((x) => ({
          id: x.id, name: x.name, role: x.role, ready: x.ready,
          connected: x.connected, host: x.id === this.hostId
        })),
        summary: this.summary,
        feed: this.feed,
        /* 只在等待畫面才帶聊天紀錄下去：開始對局後用戶端本來就會把聊天室收起來，
           不送也省得讓人以為對局中還能聊天。 */
        chat: this.phase !== 'playing' ? this.chatLog : [],
        invites: (isHost || (m && m.role === 'player'))
          ? [...this.invites.values()]
            .filter((i) => !i.revoked && i.expiresAt > now && i.uses < i.maxUses)
            .map((i) => ({ token: i.token, role: i.role, expiresAt: i.expiresAt, uses: i.uses, maxUses: i.maxUses }))
          : [],
        /* 畫家斷線中：等到這個時間還沒回來就跳過這一題（0 = 沒斷線） */
        drawerAwayUntil: this.drawerAwayUntil(),
        version: this.version
      },
      game,
      you: m ? {
        id: m.id,
        name: m.name,
        role: m.role,
        ready: m.ready,
        isHost,
        inGame,
        can: {
          ready: m.role === 'player' && this.phase !== 'playing',
          start: isHost && canStart.ok,
          startBlockedBy: canStart.ok ? null : canStart.error,
          setAi: isHost && this.phase !== 'playing',
          setSettings: isHost && this.phase !== 'playing',
          pick: inGame && !!game && game.you.canPick,
          draw: inGame && !!game && game.you.canDraw,
          guess: inGame && !!game && game.you.canGuess,
          skip: inGame && !!game && game.you.canDraw,
          invite: (m.role === 'player' || isHost) && !this.closed,
          chat: this.phase !== 'playing' && !this.closed,
          returnToRoom: this.phase === 'finished' && isHost && !this.closed,
          becomePlayer: m.role === 'spectator' && !this.closed && this.openSeats() > 0,
          becomeSpectator: this.canBecomeSpectator(m.id)
        }
      } : null
    };
  }
}

class RoomStore {
  constructor(opts) {
    this.opts = Object.assign({}, DEFAULTS, opts || {});
    this.rooms = new Map();
  }

  newCode() {
    let code;
    let guard = 0;
    do {
      code = Array.from({ length: this.opts.codeLength }, () =>
        CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)]).join('');
      guard += 1;
    } while (this.rooms.has(code) && guard < 200);
    return code;
  }

  create(id, { name, roomName, private: isPrivate, settings, now, lang }) {
    if (this.rooms.size >= this.opts.maxRooms) {
      return err('srv.err.serverBusy', 'busy');
    }
    const room = new Room(this, {
      code: this.newCode(),
      /* 沒取房名就留空：畫面端會用各自語言的預設房名顯示（room.defaultName） */
      name: sanitizeText(roomName, this.opts.roomNameMax),
      private: !!isPrivate,
      now
    });
    const joined = room.join(id, { name, role: 'player', now, creator: true, lang });
    if (!joined.ok) return joined;
    const configured = room.setSettings(id, settings || {});
    if (!configured.ok) return configured;
    this.rooms.set(room.code, room);
    room.hostId = id;
    return ok({ room });
  }

  get(code) {
    const room = this.rooms.get(str(code).toUpperCase().trim()) || null;
    return room && !room.closed ? room : null;
  }

  /** 連已關閉的房間也拿得到，讓還在房裡的觀戰者能收到「已結束」 */
  getAny(code) {
    return this.rooms.get(str(code).toUpperCase().trim()) || null;
  }

  list() {
    const out = [];
    for (const r of this.rooms.values()) {
      if (r.private || r.closed) continue;
      if (r.members.size === 0) continue;
      out.push(r.brief());
    }
    out.sort((a, b) => {
      const rank = (x) => (x.phase === 'waiting' ? 0 : (x.phase === 'playing' ? 1 : 2));
      return rank(a) - rank(b) || b.createdAt - a.createdAt;
    });
    return out.slice(0, 50);
  }

  /**
   * 每秒的定時工作：推進對局、踢掉斷線太久的人、關掉沒有實體玩家的房間。
   * @returns {{ticked, changed, closed, forget}}
   */
  sweep(now) {
    const ticked = [];
    const changed = [];
    const closed = [];
    const forget = [];

    for (const room of [...this.rooms.values()]) {
      if (room.closed) {
        /* 關閉後再留 2 分鐘讓還連著的人收到通知，然後才真的丟掉 */
        if (now - (room.closedAt || (room.closedAt = now)) > 120000) {
          this.rooms.delete(room.code);
          forget.push(room);
        }
        continue;
      }

      const dropped = room.sweepMembers(now);
      if (dropped.length) changed.push(room);

      if (room.shouldClose()) {
        room.close(
          room.members.size > 0 ? 'srv.closed.onlySpectators' : 'srv.closed.empty',
          now
        );
        room.closedAt = now;
        closed.push(room);
        continue;
      }

      const res = room.tick(now);
      if (res.events.length || res.strokes.length || res.feed.length) {
        ticked.push({ room, ...res });
      }
    }
    return { ticked, changed, closed, forget };
  }

  size() { return [...this.rooms.values()].filter((r) => !r.closed).length; }
}

module.exports = { RoomStore, Room, DEFAULTS, sanitizeText, sanitizeName, str, num, DRAWER_AWAY_MS };
