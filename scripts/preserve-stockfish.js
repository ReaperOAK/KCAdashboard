/**
 * Enhanced script to ensure Stockfish engine file isn't replaced during build
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Paths to source and destination files
const SOURCE_FILE = path.join(__dirname, '../src/utils/stockfish.min.js');
const PUBLIC_DIR = path.join(__dirname, '../public/stockfish');
const PUBLIC_FILE = path.join(PUBLIC_DIR, 'stockfish.min.js');
const BUILD_DIR = path.join(__dirname, '../build/stockfish');
const BUILD_FILE = path.join(BUILD_DIR, 'stockfish.min.js');

// Hash verification to ensure file integrity
const EXPECTED_HASH = '30b5db1d64c99f5a2fc43e0c8da3eac65a1c9f2a75ab2d37f3ef0be71c0d0f5c';

// Calculate SHA-256 hash of a file
function calculateHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// Ensure directories exist
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Copy file if source exists and verify the hash
function copyFileWithVerification(source, dest) {
  if (!fs.existsSync(source)) {
    console.error(`Source file not found: ${source}`);
    return false;
  }
  
  // Calculate hash of source file
  const sourceHash = calculateHash(source);
  if (sourceHash !== EXPECTED_HASH) {
    console.warn(`Warning: Source file hash doesn't match expected value. This may indicate file corruption or modifications.`);
    console.log(`Expected: ${EXPECTED_HASH}`);
    console.log(`Actual:   ${sourceHash}`);
  }
  
  // Copy file to destination
  fs.copyFileSync(source, dest);
  console.log(`Copied ${source} to ${dest}`);
  
  // Verify the copied file
  const destHash = calculateHash(dest);
  if (destHash !== sourceHash) {
    console.error(`Error: Destination file hash doesn't match source file after copy!`);
    return false;
  }
  
  // Create .noproces file to signal bundlers to ignore this directory
  const noProcessFile = path.join(path.dirname(dest), '.noproces');
  fs.writeFileSync(noProcessFile, 'This directory should not be processed by bundlers.');
  
  return true;
}

try {
  console.log('Starting Stockfish engine preservation process...');
  
  // Ensure public directory exists and copy to it
  ensureDirExists(PUBLIC_DIR);
  copyFileWithVerification(SOURCE_FILE, PUBLIC_FILE);
  
  // If build directory exists (during production build), copy there too
  if (fs.existsSync(path.join(__dirname, '../build'))) {
    ensureDirExists(BUILD_DIR);
    copyFileWithVerification(SOURCE_FILE, BUILD_FILE);
    
    // Double-check if the file was overwritten afterward by comparing file sizes
    setTimeout(() => {
      if (fs.existsSync(BUILD_FILE)) {
        const size = fs.statSync(BUILD_FILE).size;
        const sourceSize = fs.statSync(SOURCE_FILE).size;
        
        if (size !== sourceSize) {
          console.warn(`Warning: File size mismatch after copy. File may have been replaced.`);
          console.log(`Source size: ${sourceSize} bytes`);
          console.log(`Destination size: ${size} bytes`);
          
          // Force copy again
          console.log('Re-copying file to ensure integrity...');
          fs.copyFileSync(SOURCE_FILE, BUILD_FILE);
        } else {
          console.log('File size verification passed.');
        }
      }
    }, 1000); // Check after 1 second in case other processes modify it
  }
  
  console.log('Stockfish engine preservation complete!');
} catch (error) {
  console.error('Error preserving Stockfish engine:', error);
  process.exit(1);
}
