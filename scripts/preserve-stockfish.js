/**
 * This script ensures the Stockfish engine file isn't replaced during build
 */
const fs = require('fs');
const path = require('path');

// Paths to source and destination files
const SOURCE_FILE = path.join(__dirname, '../src/utils/stockfish.min.js');
const PUBLIC_DIR = path.join(__dirname, '../public/stockfish');
const PUBLIC_FILE = path.join(PUBLIC_DIR, 'stockfish.min.js');
const BUILD_DIR = path.join(__dirname, '../build/stockfish');
const BUILD_FILE = path.join(BUILD_DIR, 'stockfish.min.js');

// Ensure directories exist
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Copy file if source exists
function copyFileIfExists(source, dest) {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`Copied ${source} to ${dest}`);
    return true;
  } else {
    console.error(`Source file not found: ${source}`);
    return false;
  }
}

try {
  // Ensure public directory exists and copy to it
  ensureDirExists(PUBLIC_DIR);
  copyFileIfExists(SOURCE_FILE, PUBLIC_FILE);
  
  // If build directory exists (during production build), copy there too
  if (fs.existsSync(path.join(__dirname, '../build'))) {
    ensureDirExists(BUILD_DIR);
    copyFileIfExists(SOURCE_FILE, BUILD_FILE);
  }
  
  console.log('Stockfish engine preservation complete!');
} catch (error) {
  console.error('Error preserving Stockfish engine:', error);
  process.exit(1);
}
