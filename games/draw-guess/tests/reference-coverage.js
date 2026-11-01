'use strict';

const assert = require('node:assert/strict');
const Words = require('../public/js/words.js');
const Reference = require('../public/js/reference.js');
const MeaningReference = require('../public/js/meaning-reference.js');

const topics = Words.all();
assert.equal(topics.length, 2000, 'The reference covers the complete prompt bank');

for (const word of topics) {
  for (const step of [1, 2, 3]) {
    const svg = Reference.svg(word.id, step);
    assert.match(svg, /^<svg /, word.id + ' must render an offline SVG at step ' + step);
    assert.match(svg, /<path /, word.id + ' must contain game-drawn strokes at step ' + step);
    assert.doesNotMatch(svg, /<image|https?:|NaN|undefined/, word.id + ' must stay self-contained');
  }
}

const semanticIds = MeaningReference.ids();
for (const id of semanticIds) {
  assert.ok(MeaningReference.get(id), id + ' semantic scene must resolve every component');
  for (const step of [1, 2, 3]) {
    const svg = MeaningReference.svg(id, step);
    assert.match(svg, /^<svg /, id + ' must render a composed scene at step ' + step);
    assert.match(svg, /<path /, id + ' must contain visible strokes at step ' + step);
    assert.doesNotMatch(svg, /<image|https?:|NaN|undefined/, id + ' must use local vector strokes');
  }
}

console.log(
  'Drawing references verified: ' + topics.length + ' game-drawn topics and ' +
    semanticIds.length + ' composed idiom scenes.'
);
