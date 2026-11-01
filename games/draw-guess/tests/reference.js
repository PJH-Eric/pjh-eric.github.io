'use strict';

const assert = require('node:assert/strict');
const Words = require('../public/js/words.js');
const Reference = require('../public/js/reference.js');
const Rules = require('../public/js/rules.js');

const topics = Words.all();
let available = 0;
for (const word of topics) {
  const before = JSON.stringify(word.draw);
  const strokes = Reference.get(word.id);
  assert.ok(strokes, word.id + ' must have a game-drawn reference');
  available++;
  assert.ok(strokes.length > 0);
  for (const stroke of strokes) {
    assert.equal(stroke.p.length % 2, 0);
    assert.ok(stroke.p.length >= 4);
    assert.ok(
      stroke.p.every((n) => Number.isFinite(n) && n >= -400 && n <= 1800),
      word.text,
    );
  }
  const paths = (step) =>
    (Reference.svg(word.id, step).match(/<path /g) || []).length;
  assert.ok(paths(1) <= paths(2) && paths(2) <= paths(3));
  assert.equal(paths(3), strokes.length);
  assert.equal(
    JSON.stringify(word.draw),
    before,
    'References must not modify gameplay recipes',
  );
}
const idFor = (text) => Words.all().find((w) => w.text === text).id;
assert.notDeepEqual(Reference.get(idFor('棒球')), Reference.get('soccer'));
assert.notDeepEqual(Reference.get(idFor('雪花')), Reference.get('star'));
assert.ok(Reference.get(idFor('拿破崙')).length > 0);
for (const word of topics) {
  assert.ok(
    Reference.hasRecipe(word.id),
    word.id + ' must have a flat 12-colour reference recipe',
  );
}
assert.equal(Reference.get('unknown'), null);

const st = Rules.createState({
  seed: 'REFERENCE',
  players: [
    { id: 'a', name: 'A' },
    { id: 'b', name: 'B' },
  ],
  rounds: 1,
});
Rules.start(st, 1000);
assert.equal(Rules.toPublic(st, st.drawerId).referenceId, null);
Rules.pickWord(st, st.drawerId, st.choices[0], 1000);
assert.equal(Rules.toPublic(st, st.drawerId).referenceId, st.wordId);
for (const viewer of [null, 'spectator', st.drawerId === 'a' ? 'b' : 'a']) {
  assert.equal(Rules.toPublic(st, viewer).referenceId, null);
  assert.equal(Rules.toPublic(st, viewer).answer, null);
}
Rules.giveUp(st, st.drawerId, 2000);
assert.equal(Rules.toPublic(st, st.drawerId).referenceId, null);
console.log(
  'References verified: ' +
    available +
    '/2000 topics, staged geometry and drawer-only projection',
);
