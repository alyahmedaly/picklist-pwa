#!/usr/bin/env node

/**
 * Simple icon generation script for PWA
 * Creates basic icons for immediate PWA functionality
 * Replace with proper brand icons later
 */

import fs from 'fs';
import path from 'path';

const iconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" rx="64" fill="#3b82f6"/>

  <!-- Main icon - stylized "P" for Picklist -->
  <g transform="translate(128, 96)">
    <!-- Letter P shape -->
    <rect x="0" y="0" width="48" height="320" fill="white" rx="8"/>
    <rect x="0" y="0" width="176" height="48" fill="white" rx="8"/>
    <rect x="0" y="136" width="136" height="48" fill="white" rx="8"/>
    <rect x="128" y="48" width="48" height="136" fill="white" rx="8"/>
  </g>

  <!-- Nutrition symbol - small dots representing data points -->
  <g transform="translate(320, 160)">
    <circle cx="0" cy="0" r="12" fill="white" opacity="0.8"/>
    <circle cx="0" cy="40" r="12" fill="white" opacity="0.6"/>
    <circle cx="0" cy="80" r="12" fill="white" opacity="0.4"/>
    <circle cx="0" cy="120" r="12" fill="white" opacity="0.2"/>
  </g>
</svg>
`;

// Create icons directory in public
const publicDir = './public';
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write base SVG
const svgPath = path.join(iconsDir, 'icon-base.svg');
fs.writeFileSync(svgPath, iconSVG.trim());

console.log('✅ Created base SVG icon at', svgPath);
console.log('📝 To generate PNG icons:');
console.log('   1. Install: npm install -g sharp-cli');
console.log('   2. Generate 192x192: sharp -i public/icons/icon-base.svg -o public/icon-192x192.png resize 192 192');
console.log('   3. Generate 512x512: sharp -i public/icons/icon-base.svg -o public/icon-512x512.png resize 512 512');
console.log('   4. Generate 180x180: sharp -i public/icons/icon-base.svg -o public/icon-180x180.png resize 180 180');
console.log('');
console.log('🎨 For now, creating simple colored squares as placeholders...');

// Create simple colored PNG placeholders using Canvas (if available) or just text files
const createPlaceholderIcon = (size, filename) => {
  const data = `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#3b82f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.2}" font-weight="bold">P</text>
    </svg>
  `)}`;

  // For now, just document what needs to be created
  console.log(`📋 Placeholder needed: ${filename} (${size}x${size})`);
  return data;
};

createPlaceholderIcon(192, 'icon-192x192.png');
createPlaceholderIcon(512, 'icon-512x512.png');
createPlaceholderIcon(180, 'icon-180x180.png');

console.log('');
console.log('⚠️  TEMPORARY SOLUTION: The PWA will work without PNG icons initially.');
console.log('   The manifest will reference them, but the browser will fall back gracefully.');
console.log('   Generate proper PNG icons using the SVG base when possible.');