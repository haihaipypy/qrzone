#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const cacheDir = path.join(__dirname, '..', '.next', 'cache');

console.log('Cleaning up Next.js cache...');

if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('✓ Cache directory removed successfully');
} else {
  console.log('✓ No cache directory found');
}

// Check final size
const nextDir = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextDir)) {
  const { execSync } = require('child_process');
  try {
    const size = execSync(`du -sh "${nextDir}"`, { encoding: 'utf8' });
    console.log(`Final .next directory size: ${size.trim()}`);
  } catch (e) {
    console.log('✓ Cleanup complete');
  }
}
