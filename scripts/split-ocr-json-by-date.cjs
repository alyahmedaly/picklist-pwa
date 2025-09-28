// Script to split a large JSON object into separate files per date key
// Usage: node scripts/split-ocr-json-by-date.cjs
const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(__dirname, '../data/allerhande_full_website_ocr.json');
const outputDir = path.resolve(__dirname, '../data/allerhande_by_date');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

console.log('Reading large JSON file...');
const fileStream = fs.createReadStream(inputPath, { encoding: 'utf8' });
let buffer = '';

fileStream.on('data', chunk => {
  buffer += chunk;
});

fileStream.on('end', () => {
  console.log('Parsing JSON...');
  let data;
  try {
    data = JSON.parse(buffer);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return;
  }
  const keys = Object.keys(data);
  console.log(`Found ${keys.length} date keys.`);
  keys.forEach(date => {
    const outPath = path.join(outputDir, `${date}.json`);
    fs.writeFileSync(outPath, JSON.stringify(data[date], null, 2), 'utf8');
    console.log(`Wrote ${outPath}`);
  });
  console.log('Done!');
});

fileStream.on('error', err => {
  console.error('Error reading file:', err);
});
