// Script to inspect the schema of a large JSON file by streaming and printing the first few objects
// Handles: top-level array, top-level object, NDJSON
// Requires: npm install stream-json
const fs = require('fs');
const path = require('path');
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

const filePath = path.resolve(__dirname, '../data/allerhande_full_website_ocr.json');
const SAMPLE_SIZE = 5;

function tryParseObject(chunk) {
  try {
    const obj = JSON.parse(chunk);
    return obj;
  } catch {
    return null;
  }
}

// Try to read the first few KB to detect format
fs.open(filePath, 'r', (err, fd) => {
  if (err) {
    console.error('Error opening file:', err);
    return;
  }
  const buffer = Buffer.alloc(8192);
  fs.read(fd, buffer, 0, buffer.length, 0, (err, bytesRead) => {
    if (err) {
      console.error('Error reading file:', err);
      fs.close(fd, () => {});
      return;
    }
    const text = buffer.toString('utf8', 0, bytesRead).trim();
    if (text.startsWith('[')) {
      // Top-level array: use stream-json
      fs.close(fd, () => {});
      const pipeline = fs.createReadStream(filePath)
        .pipe(parser())
        .pipe(streamArray());
      let count = 0;
      pipeline.on('data', ({ value }) => {
        if (count < SAMPLE_SIZE) {
          console.log(`--- Array Object ${count + 1} ---`);
          console.log(Object.keys(value));
          console.log(JSON.stringify(value, null, 2));
          count++;
          if (count === SAMPLE_SIZE) pipeline.destroy();
        }
      });
      pipeline.on('error', err => {
        console.error('Error reading file:', err);
      });
      pipeline.on('close', () => {
        console.log('Stream closed.');
      });
    } else if (text.startsWith('{')) {
      // Top-level object, but may be very large
      // Try parsing a larger chunk
      const bigBuffer = Buffer.alloc(65536); // 64KB
      fs.read(fd, bigBuffer, 0, bigBuffer.length, 0, (err, bigBytesRead) => {
        fs.close(fd, () => {});
        if (err) {
          console.error('Error reading file:', err);
          return;
        }
        const bigText = bigBuffer.toString('utf8', 0, bigBytesRead).trim();
        const obj = tryParseObject(bigText);
        if (obj) {
          console.log('Top-level object keys:', Object.keys(obj));
          console.log('Sample object:', JSON.stringify(obj, null, 2));
        } else {
          console.error('Could not parse top-level object. Printing first 2KB as raw text:');
          console.log(text.slice(0, 2048));
        }
      });
    } else {
      // Assume NDJSON
      fs.close(fd, () => {});
      const rl = require('readline').createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
      });
      let count = 0;
      rl.on('line', line => {
        if (count < SAMPLE_SIZE) {
          const obj = tryParseObject(line);
          if (obj) {
            console.log(`--- NDJSON Object ${count + 1} ---`);
            console.log(Object.keys(obj));
            console.log(JSON.stringify(obj, null, 2));
            count++;
          }
        } else {
          rl.close();
        }
      });
      rl.on('close', () => {
        console.log('Stream closed.');
      });
    }
  });
});
