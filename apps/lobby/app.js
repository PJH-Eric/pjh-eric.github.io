(function () {
  'use strict';

  const STORAGE_KEY = 'game-lobby-preferences-v1';
  const FAVORITES_KEY = 'game-lobby-favorites-v1';
  const state = { games: [], config: null, loadFailed: false, detailsId: null, filter: 'all', query: '', favorites: readList(FAVORITES_KEY), preferences: readPreferences(), lastFocus: null, openModal: null };
  const categoryLabels = {
    brain: 'cat.brain',
    turn: 'cat.turn',
    sports: 'cat.sports',
    challenge: 'cat.challenge',
    action: 'cat.action'
  };
  const t = (key, params) => window.I18N.t(key, params);
  const catLabel = (category) => (categoryLabels[category] ? t(categoryLabels[category]) : '');
  /* 目前語言的遊戲文案：繁中用原文，簡中與英文分別疊上對應欄位。 */
  const loc = (game) => {
    const extra = window.I18N.lang !== 'zh-Hant' && game.i18n && game.i18n[window.I18N.lang];
    return extra ? { ...game, ...extra } : game;
  };
  const gameUrl = (game) => window.I18N.withLang(game.launchUrl);
  const colors = { sky: '#b8e1f5', pink: '#ffb5c5', lilac: '#d8c9f2', mint: '#bfe8d5', peach: '#ffc5a6', lemon: '#ffe49a', lime: '#d7ec9c' };
  const iconStroke = '#352f3c';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function readList(key) {
    try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; }
  }

  function readPreferences() {
    try { return { music: false, sfx: true, motion: false, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; } catch { return { music: false, sfx: true, motion: false }; }
  }

  function saveList(key, list) { try { localStorage.setItem(key, JSON.stringify(list)); } catch {} }
  function savePreferences() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.preferences)); } catch {} }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function iconSvg(type) {
    const common = `fill="none" stroke="${iconStroke}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
    const icons = {
      checkers: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="13" fill="#fff4dd" ${common}/><path d="M26 12v56M40 12v56M54 12v56M12 26h56M12 40h56M12 54h56" ${common}/><circle cx="26" cy="26" r="5" fill="#ff9e91" stroke="${iconStroke}" stroke-width="2"/><circle cx="54" cy="54" r="5" fill="#8dc9ec" stroke="${iconStroke}" stroke-width="2"/><circle cx="54" cy="26" r="5" fill="#a9d9a7" stroke="${iconStroke}" stroke-width="2"/></svg>`,
      cards: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="17" y="13" width="38" height="52" rx="8" fill="#ffd6e0" stroke="${iconStroke}" stroke-width="3" transform="rotate(-10 17 13)"/><rect x="28" y="15" width="38" height="52" rx="8" fill="#fff9e8" stroke="${iconStroke}" stroke-width="3" transform="rotate(9 28 15)"/><path d="M47 30c-4-7-13 0 0 10 13-10 4-17 0-10Z" fill="#ef8fa8" stroke="${iconStroke}" stroke-width="2"/></svg>`,
      sudoku: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="10" fill="#f7efff" stroke="${iconStroke}" stroke-width="3"/><path d="M30.7 12v56M49.3 12v56M12 30.7h56M12 49.3h56" ${common}/><path d="M40 12v56M12 40h56" stroke="${iconStroke}" stroke-width="4"/><circle cx="21" cy="21" r="2.5" fill="#9c83cf"/><circle cx="58" cy="58" r="2.5" fill="#9c83cf"/><path d="m34 23 3 3 6-7" ${common}/></svg>`,
      market: `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M17 28h47l-5 36H23l-6-36Z" fill="#fff4db" stroke="${iconStroke}" stroke-width="3"/><path d="M13 27h55l-5-13H18l-5 13Z" fill="#ffb67e" stroke="${iconStroke}" stroke-width="3"/><path d="M22 14v13M34 14v13M46 14v13M58 14v13" ${common}/><path d="M31 39c3-8 11-8 14 0M36 48c3-4 7-4 10 0" ${common}/><circle cx="27" cy="69" r="4" fill="#b5dff1" stroke="${iconStroke}" stroke-width="2"/><circle cx="55" cy="69" r="4" fill="#b5dff1" stroke="${iconStroke}" stroke-width="2"/></svg>`,
      catdog: `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M11 29 18 13l13 11" fill="#ffb4a7" stroke="${iconStroke}" stroke-width="3" stroke-linejoin="round"/><path d="m69 29-7-16-13 11" fill="#a8d7ef" stroke="${iconStroke}" stroke-width="3" stroke-linejoin="round"/><circle cx="28" cy="43" r="18" fill="#fff1d5" stroke="${iconStroke}" stroke-width="3"/><circle cx="52" cy="43" r="18" fill="#dceffc" stroke="${iconStroke}" stroke-width="3"/><circle cx="23" cy="41" r="2.5" fill="${iconStroke}"/><circle cx="33" cy="41" r="2.5" fill="${iconStroke}"/><circle cx="47" cy="41" r="2.5" fill="${iconStroke}"/><circle cx="57" cy="41" r="2.5" fill="${iconStroke}"/><path d="M25 50c2 2 4 2 6 0M49 50c2 2 4 2 6 0" ${common}/><path d="M40 32v27" stroke="${iconStroke}" stroke-width="2" stroke-dasharray="3 4"/></svg>`,
      bubble: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#eafaf4" stroke="${iconStroke}" stroke-width="3"/><circle cx="34" cy="42" r="17" fill="#8fd9ef" stroke="${iconStroke}" stroke-width="3"/><circle cx="27" cy="35" r="5" fill="rgba(255,255,255,.85)"/><circle cx="57" cy="26" r="9" fill="#bdeef7" stroke="${iconStroke}" stroke-width="2.6"/><circle cx="54" cy="23" r="2.6" fill="rgba(255,255,255,.9)"/><circle cx="59" cy="52" r="6" fill="#ffe49a" stroke="${iconStroke}" stroke-width="2.4"/><path d="M18 66h44" ${common}/></svg>`,
      mole: `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M10 68h60" ${common}/><path d="M17 68c0-21 10-35 23-35s23 14 23 35" fill="#b98b70" stroke="${iconStroke}" stroke-width="3"/><path d="M28 36 22 21l14 8M52 36l6-15-14 8" fill="#cda48b" stroke="${iconStroke}" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="45" r="3" fill="#fff" stroke="${iconStroke}" stroke-width="2"/><circle cx="48" cy="45" r="3" fill="#fff" stroke="${iconStroke}" stroke-width="2"/><circle cx="32" cy="45" r="1.4" fill="${iconStroke}"/><circle cx="48" cy="45" r="1.4" fill="${iconStroke}"/><path d="M38 53c1 2 3 2 4 0" ${common}/><path d="m66 15 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" fill="#ffe49a" stroke="${iconStroke}" stroke-width="2"/></svg>`,
      stairs: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#eafaf4" stroke="${iconStroke}" stroke-width="3"/><path d="M14 20h52" fill="none" stroke="${iconStroke}" stroke-width="3" stroke-linecap="round"/><path d="M32 20l4 6 4-6zM44 20l4 6 4-6zM56 20l4 6 4-6z" fill="#b8c6d4" stroke="${iconStroke}" stroke-width="2"/><rect x="14" y="38" width="20" height="7" rx="3" fill="#f0b878" stroke="${iconStroke}" stroke-width="2.6"/><rect x="30" y="48" width="20" height="7" rx="3" fill="#f0b878" stroke="${iconStroke}" stroke-width="2.6"/><rect x="46" y="58" width="20" height="7" rx="3" fill="#f0b878" stroke="${iconStroke}" stroke-width="2.6"/><rect x="20" y="32.5" width="8" height="5.5" rx="2.6" fill="#ffb4a7" stroke="${iconStroke}" stroke-width="2.4"/><circle cx="24" cy="27" r="5" fill="#fff3db" stroke="${iconStroke}" stroke-width="2.6"/><circle cx="22.3" cy="27" r="1" fill="${iconStroke}"/><circle cx="25.7" cy="27" r="1" fill="${iconStroke}"/></svg>`,
      caterpillar: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#f2fbe0" stroke="${iconStroke}" stroke-width="3"/><path d="M13 56h54" fill="none" stroke="#d9a86b" stroke-width="9" stroke-linecap="round"/><path d="M13 56h54" fill="none" stroke="${iconStroke}" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 6"/><circle cx="56" cy="43" r="8" fill="#a9e86b" stroke="${iconStroke}" stroke-width="2.6"/><circle cx="44" cy="45" r="7" fill="#8bd44a" stroke="${iconStroke}" stroke-width="2.6"/><circle cx="33" cy="46" r="6" fill="#7cc63e" stroke="${iconStroke}" stroke-width="2.6"/><circle cx="24" cy="47" r="5" fill="#6bb62f" stroke="${iconStroke}" stroke-width="2.6"/><path d="M55 34l-3-7M61 34l5-6" fill="none" stroke="${iconStroke}" stroke-width="2.4" stroke-linecap="round"/><circle cx="52" cy="26" r="2.6" fill="#ffe066" stroke="${iconStroke}" stroke-width="1.8"/><circle cx="66" cy="27" r="2.6" fill="#ffe066" stroke="${iconStroke}" stroke-width="1.8"/><circle cx="54" cy="41" r="2.2" fill="#fff" stroke="${iconStroke}" stroke-width="1.6"/><circle cx="60" cy="41" r="2.2" fill="#fff" stroke="${iconStroke}" stroke-width="1.6"/><circle cx="54.6" cy="41.6" r="1" fill="${iconStroke}"/><circle cx="60.6" cy="41.6" r="1" fill="${iconStroke}"/><path d="M55 47c2 2 4 2 6 0" fill="none" stroke="${iconStroke}" stroke-width="2" stroke-linecap="round"/></svg>`,
      pool: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#e4f4e6" stroke="${iconStroke}" stroke-width="3"/><rect x="15" y="15" width="50" height="50" rx="9" fill="#7cc8a0" stroke="${iconStroke}" stroke-width="2.4"/><circle cx="19" cy="19" r="5" fill="#3b3557"/><circle cx="61" cy="61" r="5" fill="#3b3557"/><circle cx="46" cy="36" r="9" fill="#ffd96b" stroke="${iconStroke}" stroke-width="2.6"/><circle cx="43" cy="33" r="2.4" fill="rgba(255,255,255,.85)"/><circle cx="35" cy="48" r="8" fill="#fff9e8" stroke="${iconStroke}" stroke-width="2.6"/><path d="M14 66 33 52" stroke="${iconStroke}" stroke-width="3.4" stroke-linecap="round"/><path d="M14 66 26 57" stroke="#f0b878" stroke-width="1.6" stroke-linecap="round"/></svg>`,
      arrows: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#e8f3ff" stroke="${iconStroke}" stroke-width="3"/><path d="M20 28h28M20 52h14l16-14h8" fill="none" stroke="${iconStroke}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="m44 20 10 8-10 8M54 29l6 9-6 9" fill="none" stroke="#ff8fa8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="28" r="3.5" fill="#ffd36b" stroke="${iconStroke}" stroke-width="2"/><circle cx="20" cy="52" r="3.5" fill="#ffd36b" stroke="${iconStroke}" stroke-width="2"/></svg>`,
      reversi: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#f1e2c4" stroke="${iconStroke}" stroke-width="3"/><rect x="15" y="15" width="50" height="50" rx="9" fill="#8fc7a3" stroke="${iconStroke}" stroke-width="2.4"/><path d="M40 15v50M15 40h50" stroke="${iconStroke}" stroke-width="1.6" opacity=".55"/><circle cx="31" cy="31" r="9" fill="#3b3557" stroke="${iconStroke}" stroke-width="2.6"/><circle cx="49" cy="31" r="9" fill="#fff9e8" stroke="${iconStroke}" stroke-width="2.6"/><circle cx="31" cy="49" r="9" fill="#fff9e8" stroke="${iconStroke}" stroke-width="2.6"/><circle cx="49" cy="49" r="9" fill="#3b3557" stroke="${iconStroke}" stroke-width="2.6"/></svg>`,
      drawguess: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="10" width="60" height="60" rx="14" fill="#f7efff" stroke="${iconStroke}" stroke-width="3"/><rect x="18" y="18" width="44" height="44" rx="7" fill="#fffdf8" stroke="${iconStroke}" stroke-width="2.5"/><path d="M26 52c5-11 11-16 17-12 4 3 7 1 11-6" ${common}/><circle cx="35" cy="32" r="4" fill="#ffe49a" stroke="${iconStroke}" stroke-width="2"/><path d="m45 56 13-25 5 3-13 25-8 5 3-8Z" fill="#ffb5c5" stroke="${iconStroke}" stroke-width="2.4" stroke-linejoin="round"/><path d="m58 31 2-4 5 3-2 4" fill="#d8c9f2" stroke="${iconStroke}" stroke-width="2.4"/></svg>`,
      bomb: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#fff1e6" stroke="${iconStroke}" stroke-width="3"/><circle cx="37" cy="46" r="18" fill="#3b3557" stroke="${iconStroke}" stroke-width="3"/><circle cx="30" cy="39" r="5" fill="rgba(255,255,255,.55)"/><rect x="41" y="23" width="12" height="9" rx="3" fill="#8a84a8" stroke="${iconStroke}" stroke-width="2.6" transform="rotate(35 47 27)"/><path d="M52 22c3-5 7-6 10-4" ${common}/><path d="m63 12 1.6 3.6 3.9.4-2.9 2.6.8 3.8-3.4-2-3.4 2 .8-3.8-2.9-2.6 3.9-.4Z" fill="#ffcc5e" stroke="${iconStroke}" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
      balloon: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#fff4d6" stroke="${iconStroke}" stroke-width="3"/><path d="M40 14c10 0 15 8 15 16 0 11-9 18-15 19-6-1-15-8-15-19 0-8 5-16 15-16Z" fill="#ff6b57" stroke="${iconStroke}" stroke-width="2.8" stroke-linejoin="round"/><path d="m40 49-3 5h6Z" fill="#ff6b57" stroke="${iconStroke}" stroke-width="2.4" stroke-linejoin="round"/><path d="M40 54c-3 4 3 7 0 11" fill="none" stroke="${iconStroke}" stroke-width="2.4" stroke-linecap="round"/><path d="M31 25c2-4 5-6 8-6" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".85"/><path d="m58 52 8-10" fill="none" stroke="${iconStroke}" stroke-width="3.2" stroke-linecap="round"/><path d="m55 55 5-1-1-5Z" fill="#ffb73d" stroke="${iconStroke}" stroke-width="2" stroke-linejoin="round"/></svg>`,
      pinball: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#fff1e6" stroke="${iconStroke}" stroke-width="3"/><path d="M62 20v22" fill="none" stroke="#ff9f5a" stroke-width="5" stroke-linecap="round"/><path d="M62 24h-9M62 38h-9" ${common}/><circle cx="36" cy="30" r="11" fill="#ffb072" stroke="${iconStroke}" stroke-width="2.8"/><circle cx="32" cy="26" r="3" fill="rgba(255,255,255,.85)"/><path d="M16 60l22-8" fill="none" stroke="#6cc7ff" stroke-width="5" stroke-linecap="round"/></svg>`,
      rainbow: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#eaf7ff" stroke="${iconStroke}" stroke-width="3"/><path d="M16 52a24 24 0 0 1 48 0" fill="none" stroke="#ff7a8c" stroke-width="5" stroke-linecap="round"/><path d="M22 52a18 18 0 0 1 36 0" fill="none" stroke="#ffd04d" stroke-width="5" stroke-linecap="round"/><path d="M28 52a12 12 0 0 1 24 0" fill="none" stroke="#6cc7ff" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="54" r="12" fill="#d8c9f2" stroke="${iconStroke}" stroke-width="2.8"/><circle cx="45.5" cy="49.5" r="3.2" fill="rgba(255,255,255,.85)"/><circle cx="26" cy="58" r="7" fill="#ffb5c5" stroke="${iconStroke}" stroke-width="2.4"/><circle cx="23.5" cy="55.5" r="2" fill="rgba(255,255,255,.85)"/><path d="m58 18 1.6 3.6 3.9.4-2.9 2.6.8 3.8-3.4-2-3.4 2 .8-3.8-2.9-2.6 3.9-.4Z" fill="#ffcc5e" stroke="${iconStroke}" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
      house: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#cfe9fb" stroke="${iconStroke}" stroke-width="3"/><rect x="26" y="54" width="28" height="10" rx="2" fill="#ffb88a" stroke="${iconStroke}" stroke-width="2.6"/><rect x="29" y="43" width="24" height="10" rx="2" fill="#ffd36b" stroke="${iconStroke}" stroke-width="2.6"/><rect x="31" y="32" width="20" height="10" rx="2" fill="#9bdc9b" stroke="${iconStroke}" stroke-width="2.6"/><path d="M18 20h36M54 20v7" fill="none" stroke="${iconStroke}" stroke-width="3" stroke-linecap="round"/></svg>`,
      maze: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#f3dcae" stroke="${iconStroke}" stroke-width="3"/><path d="M18 62V22h28v28H32V36M46 50h16M62 50V26" fill="none" stroke="#a8703d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="25" cy="54" r="7" fill="#ef6a5a" stroke="${iconStroke}" stroke-width="2.6"/><circle cx="22.8" cy="51.8" r="2" fill="rgba(255,255,255,.85)"/><path d="M62 26V15l9 3-9 4" fill="#ffcc5e" stroke="${iconStroke}" stroke-width="2" stroke-linejoin="round"/></svg>`,
      fruit: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#fff5e2" stroke="${iconStroke}" stroke-width="3"/><path d="M27 29v23h26" fill="none" stroke="#7cc8ad" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 19c1-4 4-6 8-6" ${common}/><circle cx="27" cy="29" r="10" fill="#ff9e91" stroke="${iconStroke}" stroke-width="2.6"/><circle cx="23.5" cy="26" r="2.2" fill="rgba(255,255,255,.8)"/><path d="M53 42c1-4 4-6 8-6" ${common}/><circle cx="53" cy="52" r="10" fill="#a9d9a7" stroke="${iconStroke}" stroke-width="2.6"/><circle cx="49.5" cy="49" r="2.2" fill="rgba(255,255,255,.8)"/></svg>`,
    };
    icons.curling = '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="9" y="9" width="62" height="62" rx="16" fill="#e8f7ff" stroke="#352f3c" stroke-width="3"/><circle cx="34" cy="46" r="22" fill="#fff" stroke="#352f3c" stroke-width="2.6"/><circle cx="34" cy="46" r="14" fill="#74c9ef" stroke="#352f3c" stroke-width="2.4"/><circle cx="34" cy="46" r="6" fill="#ef7b91" stroke="#352f3c" stroke-width="2.2"/><ellipse cx="53" cy="29" rx="12" ry="8" fill="#f5fbff" stroke="#352f3c" stroke-width="2.6"/><path d="M46 27v-5c0-3 3-5 7-5s7 2 7 5v5" fill="none" stroke="#352f3c" stroke-width="3" stroke-linecap="round"/><path d="M49 29h8" stroke="#74c9ef" stroke-width="3" stroke-linecap="round"/><circle cx="49" cy="26" r="2" fill="#fff"/></svg>';
    return icons[type] || icons.cards;
  }

  function cardMarkup(rawGame) {
    const game = loc(rawGame);
    const isFavorite = state.favorites.includes(game.id);
    return `<article class="game-card" data-game-id="${escapeHtml(game.id)}" tabindex="0" aria-label="${escapeHtml(t('card.open', { title: game.title }))}" style="--card-color:${colors[game.accent] || colors.sky}">
      <div class="card-top"><img class="card-cover" src="${escapeHtml(game.imageUrl || game.launchUrl + 'assets/images/cover.webp')}" alt="${escapeHtml(game.title)} 遊戲封面" width="1200" height="675" loading="lazy" decoding="async"><div class="card-icon" aria-hidden="true" hidden>${iconSvg(game.icon)}</div><button class="favorite-button${isFavorite ? ' is-favorite' : ''}" type="button" data-favorite="${escapeHtml(game.id)}" aria-label="${escapeHtml(t(isFavorite ? 'fav.remove' : 'fav.add'))} ${escapeHtml(game.title)}" aria-pressed="${isFavorite}">${isFavorite ? '♥' : '♡'}</button><span class="card-badge">${escapeHtml(game.badge || catLabel(game.category) || t('card.badgeDefault'))}</span></div>
      <div class="card-body"><span class="card-eyebrow">${escapeHtml(game.eyebrow || catLabel(game.category) || 'PLAY')}</span><div class="card-title-row"><h3 class="card-title">${escapeHtml(game.title)}</h3></div><p class="card-description">${escapeHtml(game.description)}</p><div class="card-tags">${(game.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div><div class="card-actions"><a class="play-link" href="${escapeHtml(gameUrl(game))}"><span class="play-text">${escapeHtml(t('card.play'))}</span> <span aria-hidden="true">→</span></a><button class="details-link" type="button" data-details="${escapeHtml(game.id)}">${escapeHtml(t('card.details'))}</button></div></div>
    </article>`;
  }

  function visibleGames() {
    const query = state.query.trim().toLowerCase();
    return state.games.filter((rawGame) => {
      const game = loc(rawGame);
      const matchesFilter = state.filter === 'all'
        || game.category === state.filter
        || (game.additionalCategories || []).includes(state.filter);
      const haystack = [game.title, game.description, game.eyebrow, ...(game.tags || [])].join(' ').toLowerCase();
      return matchesFilter && (!query || haystack.includes(query));
    });
  }

  function renderGames() {
    const gamesGrid = $('#games-grid');
    const emptyState = $('#empty-state');
    if (!gamesGrid) return;
    const games = visibleGames();
    gamesGrid.innerHTML = games.length ? games.map(cardMarkup).join('') : '';
    emptyState.hidden = games.length > 0;
    $('#all-count').textContent = state.games.length;
    $('#games-helper').textContent = state.filter === 'all' && !state.query ? t('games.helper') : t('games.found', { n: games.length });
    bindCardEvents();
  }

  function bindCardEvents() {
    $$('.card-cover').forEach((image) => image.addEventListener('error', () => {
      const icon = image.parentElement.querySelector('.card-icon');
      image.remove();
      if (icon) icon.hidden = false;
    }));
    $$('.game-card').forEach((card) => {
      const launchGame = () => openGame(state.games.find((game) => game.id === card.dataset.gameId));
      card.addEventListener('click', (event) => { if (!event.target.closest('button, a')) launchGame(); });
      card.addEventListener('keydown', (event) => { if (event.target === card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); launchGame(); } });
    });
    $$('[data-details]').forEach((button) => button.addEventListener('click', () => openDetails(button.dataset.details)));
    $$('[data-favorite]').forEach((button) => button.addEventListener('click', () => toggleFavorite(button.dataset.favorite)));
    $$('.play-link').forEach((link) => link.addEventListener('click', () => {
      trackSelection(link.closest('.game-card').dataset.gameId, 'card_link');
      playSfx('open');
    }));
  }

  function trackSelection(id, source) {
    window.GameAnalytics.track('select_content', {
      content_type: 'game', content_id: id, item_id: id, game_id: id, target_game_id: id,
      source_game_id: 'lobby', entry_point: source
    });
  }

  function openGame(game) {
    if (!game?.launchUrl) return;
    trackSelection(game.id, 'card');
    playSfx('open');
    window.location.assign(gameUrl(game));
  }

  function toggleFavorite(id) {
    state.favorites = state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [id, ...state.favorites];
    saveList(FAVORITES_KEY, state.favorites);
    window.GameAnalytics.track('favorite_game', {
      target_game_id: id, action: state.favorites.includes(id) ? 'add' : 'remove'
    });
    renderGames();
    showToast(t(state.favorites.includes(id) ? 'toast.favAdded' : 'toast.favRemoved'));
    playSfx('click');
  }

  function openDetails(id) {
    if (!fillDetails(id)) return;
    window.GameAnalytics.track('view_game_details', { target_game_id: id });
    openModal($('#details-modal'));
  }

  function fillDetails(id) {
    const rawGame = state.games.find((item) => item.id === id);
    if (!rawGame) return false;
    const game = loc(rawGame);
    state.detailsId = id;
    $('#details-eyebrow').textContent = game.eyebrow || catLabel(game.category) || t('details.eyebrow');
    $('#details-title').textContent = game.title;
    $('#details-description').textContent = game.description;
    $('#details-tags').innerHTML = (game.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    $('#details-modes').textContent = (game.modes || []).join(' ・ ');
    $('#details-controls').textContent = game.controls || t('details.controlsDefault');
    $('#details-visual').style.setProperty('--card-color', colors[game.accent] || colors.sky);
    $('#details-visual').innerHTML = iconSvg(game.icon);
    const launch = $('#details-launch');
    launch.href = gameUrl(game);
    launch.onclick = () => { trackSelection(id, 'details'); playSfx('open'); };
    return true;
  }

  function openModal(modal) {
    state.lastFocus = document.activeElement;
    state.openModal = modal;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const focusTarget = modal.querySelector('button, a, input');
    setTimeout(() => (focusTarget || modal.querySelector('.modal-card')).focus(), 0);
  }

  function closeModal(modal = state.openModal) {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (state.lastFocus && typeof state.lastFocus.focus === 'function') state.lastFocus.focus();
    state.lastFocus = null;
    state.openModal = null;
    if (modal.id === 'details-modal') state.detailsId = null;
  }

  function setFilter(filter) {
    state.filter = filter;
    $$('.filter-chip').forEach((button) => button.classList.toggle('active', button.dataset.filter === filter));
    renderGames();
  }

  function applyPreferences() {
    document.body.classList.toggle('reduce-motion', Boolean(state.preferences.motion));
    $('#setting-music').checked = Boolean(state.preferences.music);
    $('#setting-sfx').checked = Boolean(state.preferences.sfx);
    $('#setting-motion').checked = Boolean(state.preferences.motion);
  }

  let audioContext;
  function playSfx(kind) {
    if (!state.preferences.sfx) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = kind === 'open' ? 660 : 520;
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.11);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + 0.12);
    } catch {}
  }

  let toastTimer;
  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function setupEvents() {
    window.I18N.mountToggle({ after: $('#settings-open') });
    window.I18N.onChange(onLanguageChange);
    $$('.filter-chip').forEach((button) => button.addEventListener('click', () => {
      playSfx('click');
      setFilter(button.dataset.filter);
      window.GameAnalytics.track('filter_games', { category: button.dataset.filter });
    }));
    $('#game-search').addEventListener('input', (event) => { state.query = event.target.value; state.filter = 'all'; $$('.filter-chip').forEach((button) => button.classList.toggle('active', button.dataset.filter === 'all')); renderGames(); });
    $('#clear-filter').addEventListener('click', () => { state.query = ''; $('#game-search').value = ''; setFilter('all'); });
    $('#settings-open').addEventListener('click', () => { playSfx('click'); openModal($('#settings-modal')); });
    $$('[data-close-modal]').forEach((button) => button.addEventListener('click', () => closeModal(button.closest('.modal-backdrop'))));
    $$('.modal-backdrop').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); }));
    ['music', 'sfx', 'motion'].forEach((key) => { $(`#setting-${key}`).addEventListener('change', (event) => { state.preferences[key] = event.target.checked; savePreferences(); applyPreferences(); if (key === 'sfx') playSfx('click'); }); });
    $('#settings-reset').addEventListener('click', () => { state.preferences = { music: false, sfx: true, motion: false }; savePreferences(); applyPreferences(); playSfx('click'); showToast(t('toast.reset')); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && state.openModal) closeModal(); if (event.key === 'Tab' && state.openModal) trapFocus(event, state.openModal); });
  }

  function trapFocus(event, modal) {
    const focusable = $$('button:not([disabled]), a[href], input:not([disabled])', modal);
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  /**
   * 大廳的名字一律跟著設定檔的 title 走（index.html 與 locales.js 裡那幾份只是設定檔還沒讀到前的備援）。
   * 英文名稱取 config.i18n.en.title、遊戲名取 game.i18n.en.title；重新註冊進字典後
   * 由 I18N.apply 套到 <title>（meta.title）、meta description、頁首與頁尾。
   * 數量與遊戲名都是從清單數出來／接出來的，上架新遊戲不用回頭改這裡。
   */
  function applyLobbyTitle(config) {
    const zhTitle = String(config.title || '').trim();
    if (!zhTitle) return;                        /* 設定檔沒寫就留字典裡那一份 */
    const hansTitle = String((config.i18n && config.i18n['zh-Hans'] && config.i18n['zh-Hans'].title) || '').trim() || zhTitle;
    const enTitle = String((config.i18n && config.i18n.en && config.i18n.en.title) || '').trim() || zhTitle;
    const zhNames = config.games.map((game) => game.title).filter(Boolean);
    const hansNames = config.games.map((game) => (game.i18n && game.i18n['zh-Hans'] && game.i18n['zh-Hans'].title) || game.title).filter(Boolean);
    const enNames = config.games.map((game) => (game.i18n && game.i18n.en && game.i18n.en.title) || game.title).filter(Boolean);
    const zh = {
      'brand.title': zhTitle,
      'brand.aria': `${zhTitle}首頁`,
      'meta.title': `${zhTitle}｜免費線上多人小遊戲・免下載・手機平板可玩`,
    };
    const en = {
      'brand.title': enTitle,
      'brand.aria': `${enTitle} home`,
      'meta.title': `${enTitle} | Free Online Multiplayer Mini Games, No Download, Phone & Tablet Friendly`,
    };
    const hans = {
      'brand.title': hansTitle,
      'brand.aria': `${hansTitle}首页`,
      'meta.title': `${hansTitle}｜免费线上多人小游戏・免下载・手机平板可玩`,
    };
    if (zhNames.length) zh['meta.description'] = `${zhTitle}：免費線上多人小遊戲大廳，免下載、打開網頁就能玩，手機、平板、電腦都可以，親子與小朋友同樂也適合。收錄${zhNames.join('、')}，支援單機、電腦對戰與線上房間。`;
    if (hansNames.length) hans['meta.description'] = `${hansTitle}：免费线上多人小游戏大厅，免下载，打开网页就能玩，手机、平板、电脑都可以，亲子与小朋友同乐也适合。收录${hansNames.join('、')}，支持单机、电脑对战与线上房间。`;
    if (enNames.length) en['meta.description'] = `${enTitle}: a free online lobby of multiplayer mini games. No download needed, just open the page and play on phone, tablet, or computer. Great for kids and families. Includes ${enNames.join(', ')}, with solo play, computer opponents, and online rooms.`;
    window.I18N.register('zh-Hant', zh);
    window.I18N.register('zh-Hans', hans);
    window.I18N.register('en', en);
    window.I18N.apply();
  }

  function renderLoadError() {
    $('#games-grid').innerHTML = `<div class="empty-state"><div class="empty-art">!</div><h3>${escapeHtml(t('error.title'))}</h3><p>${escapeHtml(t('error.body'))}</p><button class="button button-soft" type="button" id="retry-games">${escapeHtml(t('error.retry'))}</button></div>`;
    $('#retry-games').addEventListener('click', loadGames);
  }

  /* 切換語言：卡片、篩選說明、彈窗內容與 CSS 版面都跟著新語言重畫（靜態文字由 I18N.apply 處理）。 */
  function onLanguageChange() {
    if (state.config) applyLobbyTitle(state.config);
    if (state.loadFailed) renderLoadError();
    else if (state.games.length) renderGames();
    if (state.detailsId) fillDetails(state.detailsId);
  }

  async function loadGames() {
    try {
      const response = await fetch('config/games.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const config = await response.json();
      if (!config || !Array.isArray(config.games)) throw new Error('設定檔格式不正確');
      state.games = config.games;
      state.config = config;
      state.loadFailed = false;
      applyLobbyTitle(config);
      renderGames();
    } catch (error) {
      state.loadFailed = true;
      renderLoadError();
      console.error(error);
    }
  }

  applyPreferences();
  setupEvents();
  loadGames();
})();
