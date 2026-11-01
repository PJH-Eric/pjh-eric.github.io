'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Words = require('../public/js/words');
const Rules = require('../public/js/rules');

for (const word of Words.LIST) {
  const english = Words.byId(word.id, 'en');
  assert.equal(english.id, word.id);
  assert.ok(!/[\u3400-\u9fff]/.test(english.text), 'Missing English prompt: ' + word.id);
  assert.equal(Words.match(english, english.text), 'hit', 'English answer matching: ' + word.id);
}

const dictionaries = {};
const I18N = { register(lang, values) { Object.assign(dictionaries[lang] ||= {}, values); return I18N; } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/locales.js'), 'utf8'), { I18N });
for (const file of ['../lib/rooms.js', '../public/js/rules.js']) {
  const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
  for (const match of source.matchAll(/'(srv\.[\w.]+)'/g)) {
    if (match[1].endsWith('.')) continue;
    assert.ok(match[1] in dictionaries.en, 'Missing protocol translation: ' + match[1]);
  }
}

const state = Rules.createState({ seed: 42, lang: 'en', players: [{ id: 'one', name: '玩家 Alice' }, { id: 'two', name: 'Bob' }] });
Rules.start(state, 0);
const view = Rules.toPublic(state, state.drawerId);
assert.ok(view.choices.every(choice => !/[\u3400-\u9fff]/.test(choice.text)));
assert.equal(Rules.player(state, 'one').name, '玩家 Alice', 'Player names remain unchanged');
console.log('English prompt bank and protocol keys verified: ' + Words.LIST.length + ' prompts');
