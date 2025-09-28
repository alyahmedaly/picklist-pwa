#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const PRODUCTS_PATH = path.resolve(__dirname, '../public/products.jsonl');
const DB_PATH = path.resolve(__dirname, '../packages/parser/src/product/parse/additive/eNumberDatabase.ts');

// Small Dutch stopword list (conservative)
const STOPWORDS = new Set([
  'en', 'de', 'het', 'een', 'met', 'voor', 'op', 'in', 'van', 'te', 'kan', 'bevat', 'of', 'als', 'bij', 'per', 'tot', 'waarvan', 'is', 'zijn', 'wordt'
]);

function loadProductLines() {
  if (!fs.existsSync(PRODUCTS_PATH)) {
    console.error('products.jsonl not found at', PRODUCTS_PATH);
    process.exit(1);
  }
  return fs.readFileSync(PRODUCTS_PATH, 'utf8').split('\n').filter(Boolean).map(JSON.parse);
}

function normalizeText(s) {
  // remove diacritics, collapse whitespace, lower-case
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[“”„"'‘’]/g, '')
    .replace(/[\s]+/g, ' ')
    .toLowerCase()
    .trim();
}

function extractIngredientText(product) {
  const ing = product.ingredients;
  if (!Array.isArray(ing)) return '';
  return normalizeText(ing.join(' '));
}

function loadKnownNames() {
  const src = fs.readFileSync(DB_PATH, 'utf8');
  const names = new Set();

  // extract dutchNames arrays
  const re = /dutchNames:\s*\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const inner = m[1];
    const sRe = /(['"])(.*?)\1/g;
    let s;
    while ((s = sRe.exec(inner)) !== null) {
      names.add(normalizeText(s[2]));
    }
  }

  // officialName
  const onRe = /officialName:\s*['"](.*?)['"]/g;
  while ((m = onRe.exec(src)) !== null) {
    names.add(normalizeText(m[1]));
  }

  // simple consumer guidance maps
  const prefs = /dutchPreferredNames:\s*\{([^}]*)\}/m.exec(src);
  if (prefs) {
    const sRe = /(['"])(.*?)\1\s*:\s*(['"])(.*?)\3/g;
    let s;
    while ((s = sRe.exec(prefs[1])) !== null) {
      names.add(normalizeText(s[4]));
    }
  }

  return names;
}

// Generate n-grams (1-3 words) from token array
function ngrams(tokens, maxN = 3) {
  const out = [];
  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i + n <= tokens.length; i++) {
      out.push(tokens.slice(i, i + n).join(' '));
    }
  }
  return out;
}

function isUsefulPhrase(phrase) {
  // length filters: at least 4 characters and at most 60
  if (phrase.length < 4 || phrase.length > 60) return false;
  // must contain at least one letter
  if (!/[a-z]/i.test(phrase)) return false;
  // exclude phrases composed only of stopwords
  const toks = phrase.split(/\s+/).filter(Boolean);
  if (toks.every(t => STOPWORDS.has(t))) return false;
  // exclude very short tokens
  if (toks.some(t => t.length < 2)) return false;
  return true;
}

function tokenizeSegment(seg) {
  // remove punctuation except hyphen and slash and split on whitespace
  const cleaned = seg.replace(/[()\[\],;:\.!?\"“”‚‘’…]/g, ' ');
  const toks = cleaned.split(/\s+/).map(t => t.trim()).filter(Boolean);
  // filter stopwords
  const filtered = toks.filter(t => !STOPWORDS.has(t));
  return filtered;
}

function main() {
  const products = loadProductLines();
  const known = loadKnownNames();
  console.error('Known names extracted:', known.size);

  const counts = new Map();

  for (const p of products) {
    const txt = extractIngredientText(p);
    if (!txt) continue;

    // first collect parenthetical groups and comma-separated segments
    const parenGroups = [];
    const parenRe = /\(([^)]+)\)/g;
    let pm;
    while ((pm = parenRe.exec(txt)) !== null) {
      parenGroups.push(pm[1]);
    }

    const segments = txt.split(/[;\n]/).flatMap(s => s.split(',')).map(s => s.trim()).filter(Boolean);

    // Combine segments and parenthetical groups for phrase extraction
    const toScan = [...segments, ...parenGroups];

    for (const seg of toScan) {
      // skip explicit E numbers
      if (/\bE\d{3,4}[a-z]?\b/i.test(seg)) continue;

      const norm = normalizeText(seg);
      // split into tokens
      const tokens = tokenizeSegment(norm);
      if (tokens.length === 0) continue;

      // generate n-grams and count useful phrases
      const cand = ngrams(tokens, 3);
      for (const phrase of cand) {
        if (!isUsefulPhrase(phrase)) continue;
        if (known.has(phrase)) continue;
        // avoid single-word generic food words
        if (/^(water|zout|suiker|melk|olie|bloem|aroma|koolhydraten|vet)$/i.test(phrase)) continue;
        counts.set(phrase, (counts.get(phrase) || 0) + 1);
      }
    }
  }

  const arr = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  console.log('Top unmapped candidate phrases:');
  for (const [tok, c] of arr.slice(0, 200)) {
    console.log(tok, c);
  }
}

main();
