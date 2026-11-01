'use strict';
/* Validate one recipe block: node scripts/reference-lint.js <blockStartIndex|all>
 * Checks every topic of the block has a recipe that parses, stays on the canvas and is not bloated. */
const fs = require('fs');
const path = require('path');
const Words = require('../public/js/words.js');
const Recipes = require('../public/js/reference-recipes.js');
const Reference = require('../public/js/reference.js');

const all = Words.all();
const arg = process.argv[2];
const starts =
  arg === 'all' ? Array.from({ length: 50 }, (_, i) => i * 40) : [Number(arg)];
let bad = 0;
for (const start of starts) {
  const file = path.join(
    __dirname,
    '..',
    'public',
    'js',
    'refs',
    'r' + ('000' + start).slice(-4) + '.js',
  );
  if (!fs.existsSync(file)) {
    console.log('MISSING FILE ' + path.basename(file));
    bad++;
    continue;
  }
  const bytes = fs.statSync(file).size;
  const block = all.slice(start, start + 40);
  const problems = [];
  let sizeSum = 0;
  for (const w of block) {
    const r = Recipes[w.id];
    if (!r) {
      problems.push(w.id + ' ' + w.text + ': no recipe');
      continue;
    }
    let strokes;
    try {
      strokes = Reference.get(w.id);
    } catch (e) {
      problems.push(w.id + ' ' + w.text + ': ' + e.message);
      continue;
    }
    if (strokes.length < 4)
      problems.push(
        w.id + ' ' + w.text + ': only ' + strokes.length + ' layers (min 4)',
      );
    if (strokes.length > 90)
      problems.push(
        w.id + ' ' + w.text + ': ' + strokes.length + ' layers (max 90)',
      );
    const out = strokes.filter((st) =>
      st.p.some((n) => n < -60 || n > 1060),
    ).length;
    if (out > strokes.length * 0.5)
      problems.push(w.id + ' ' + w.text + ': most layers outside the canvas');
    if (!strokes[0].d)
      problems.push(w.id + ' ' + w.text + ': not a rich recipe');
    const svg = Reference.svg(w.id, 3);
    if (/NaN|undefined/.test(svg))
      problems.push(w.id + ' ' + w.text + ': NaN/undefined in svg');
    sizeSum += JSON.stringify(r).length;
  }
  console.log(
    'block ' +
      start +
      ': ' +
      (block.length - problems.filter((p) => /no recipe/.test(p)).length) +
      '/' +
      block.length +
      ' recipes, file ' +
      Math.round(bytes / 1024) +
      'KB, avg ' +
      Math.round(sizeSum / block.length) +
      ' chars/recipe' +
      (problems.length ? '' : ' OK'),
  );
  problems.forEach((p) => {
    console.log('  PROBLEM ' + p);
    bad++;
  });
}
process.exit(bad ? 1 : 0);
