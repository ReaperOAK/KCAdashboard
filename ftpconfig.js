// FTP deployment configuration with change tracking
const FtpDeploy = require("ftp-deploy");
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');
require('dotenv').config(); // Load environment variables from .env file

// Check which password to use (command line or .env file)
const password = process.env.FTP_PASSWORD || process.env.ftp_password || "Oa786ak92*";
if (!password) {
  console.error("Error: No FTP password provided. Please set the FTP_PASSWORD environment variable.");
  process.exit(1);
}

// File path constants
const BUILD_DIR = path.join(__dirname, "/build/");
const MANIFEST_PATH = path.join(__dirname, '.ftp-manifest.json');

// Progress bar function
const drawProgressBar = (percent, width = 50) => {
  const filledWidth = Math.round(width * percent / 100);
  const emptyWidth = width - filledWidth;
  const filledBar = '█'.repeat(filledWidth);
  const emptyBar = '░'.repeat(emptyWidth);
  return `${filledBar}${emptyBar} ${percent.toFixed(1)}%`;
};

// Clear console line function
const clearLine = () => {
  process.stdout.write('\r\x1b[K');
};

// Calculate file hash for change detection
const calculateFileHash = (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
  } catch (err) {
    console.error(`Error calculating hash for ${filePath}: ${err.message}`);
    return null;
  }
};

// Load previous deployment manifest or create a new one
const loadManifest = () => {
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    }
  } catch (err) {
    console.log('No valid manifest found or error reading it. Creating a new one.');
  }
  return {};
};

// Get all files in the build directory recursively
const getAllFiles = (dir, result = [], base = '') => {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, result, base || dir);
    } else {
      const relativePath = filePath.replace(base || dir, '').replace(/\\/g, '/');
      result.push({
        fullPath: filePath,
        relativePath: relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
      });
    }
  }
  
  return result;
};

// Main function to identify changed files
const identifyChangedFiles = () => {
  console.log('Analyzing files for changes...');
  
  // Load the previous manifest
  const manifest = loadManifest();
  
  // Get all files in the build directory
  const allFiles = getAllFiles(BUILD_DIR, [], BUILD_DIR);
  
  // Identify changed or new files
  const changedFiles = [];
  const newFiles = [];
  const unchangedFiles = [];
  
  for (const file of allFiles) {
    const hash = calculateFileHash(file.fullPath);
    
    if (!hash) {
      console.error(`Could not calculate hash for ${file.relativePath}, skipping`);
      continue;
    }
    
    // Check if file is in manifest and if hash has changed
    if (!manifest[file.relativePath]) {
      newFiles.push({ ...file, hash });
    } else if (manifest[file.relativePath].hash !== hash) {
      changedFiles.push({ ...file, hash });
    } else {
      unchangedFiles.push({ ...file, hash });
    }
  }
  
  const filesToUpload = [...newFiles, ...changedFiles];
  
  // Return both the files and the directories needed
  return {
    filesToUpload,
    newCount: newFiles.length,
    changedCount: changedFiles.length,
    unchangedCount: unchangedFiles.length,
    totalCount: allFiles.length
  };
};

// Check if this is a force upload (all files)
const isForceUpload = process.argv.includes('--force');

// Get the changed files and directories
const { 
  filesToUpload, 
  newCount, 
  changedCount, 
  unchangedCount,
  totalCount 
} = isForceUpload 
  ? { 
      // Force upload - consider all files as new
      filesToUpload: getAllFiles(BUILD_DIR, [], BUILD_DIR).map(file => ({
        ...file, 
        hash: calculateFileHash(file.fullPath)
      })), 
      newCount: getAllFiles(BUILD_DIR, [], BUILD_DIR).length,
      changedCount: 0, 
      unchangedCount: 0,
      totalCount: getAllFiles(BUILD_DIR, [], BUILD_DIR).length
    }
  : identifyChangedFiles();

// Initialize counters
let uploadedCount = 0;
let errorCount = 0;
const uploadedFiles = {};
const errorFiles = [];

// Show deployment summary
console.log('\n===========================================================');
console.log('DEPLOYMENT SUMMARY');
console.log('===========================================================');
console.log(`Total files in build: ${totalCount}`);
if (isForceUpload) {
  console.log('FORCE UPLOAD: All files will be uploaded regardless of changes');
  console.log(`Files to upload: ${filesToUpload.length}`);
} else {
  console.log(`New files: ${newCount}`);
  console.log(`Changed files: ${changedCount}`);
  console.log(`Unchanged files: ${unchangedCount}`);
  console.log(`Files to upload: ${filesToUpload.length}`);
}
console.log('===========================================================');

// If no files to upload, exit early
if (filesToUpload.length === 0 && !isForceUpload) {
  console.log('✅ No files have changed. Nothing to upload!');
  process.exit(0);
}

// Ask for confirmation before proceeding
const askToContinue = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Continue with deployment? (y/n) ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
};

// FTP config
const ftpConfig = {
  user: "u703958259", // FTP username
  password: password,  // FTP password
  host: "82.112.229.31", // FTP hostname
  port: 21, // FTP port
  localRoot: BUILD_DIR,
  remoteRoot: "/domains/kolkatachessacademy.in/public_html/dashboard/",
  include: ["*", "**/*"], // Default include all files
  exclude: [], // No exclusions
  deleteRemote: false, // Don't delete existing files on the remote server
  forcePasv: true, // Use passive mode
};

// Main deployment function that handles file uploads through FtpDeploy
const uploadFiles = async () => {
  // Create a list of specific files to upload (only changed/new files)
  const filePaths = filesToUpload.map(file => file.relativePath);
  
  // Confirm before proceeding
  const shouldContinue = await askToContinue();
  if (!shouldContinue) {
    console.log('Deployment cancelled by user.');
    process.exit(0);
  }
  
  console.log('\nStarting deployment...');
  
  // Create a new manifest to track this deployment
  const newManifest = loadManifest(); // Start with the existing manifest
  
  // Initialize the FTP deployment
  const ftpDeploy = new FtpDeploy();
  
  // Configure event handlers for the FTP deployment
  ftpDeploy.on('uploading', function(data) {
    const filename = data.filename.replace(BUILD_DIR.replace(/\\/g, '/'), '');
    
    // Find the file in our list
    const fileInfo = filesToUpload.find(f => f.relativePath === filename);
    if (!fileInfo) return; // Not a file we're tracking
    
    uploadedCount++;
    const percent = (uploadedCount / filesToUpload.length) * 100;
    const progressBar = drawProgressBar(percent);
    
    // Determine if the file is new or changed
    const fileType = !newManifest[filename] ? '(NEW)' : '(CHANGED)';
    
    // Update progress bar
    clearLine();
    process.stdout.write(`[${progressBar}] (${uploadedCount}/${filesToUpload.length}) Uploading: ${filename} ${fileType}`);
    
    // Update the manifest with the new hash
    newManifest[filename] = {
      hash: fileInfo.hash,
      uploadTime: Date.now()
    };
  });
  
  ftpDeploy.on('uploaded', function(data) {
    const filename = data.filename.replace(BUILD_DIR.replace(/\\/g, '/'), '');
    
    // Find the file in our list
    const fileInfo = filesToUpload.find(f => f.relativePath === filename);
    if (!fileInfo) return; // Not a file we're tracking
    
    // Determine if the file is new or changed
    const fileType = !newManifest[filename] ? '(NEW)' : '(CHANGED)';
    console.log(`\n✅ Uploaded: ${filename} ${fileType}`);
    
    uploadedFiles[filename] = true;
  });
  
  ftpDeploy.on('upload-error', function(data) {
    errorCount++;
    const filename = data.filename.replace(BUILD_DIR.replace(/\\/g, '/'), '');
    console.error(`\n❌ Error uploading: ${filename}`);
    errorFiles.push(filename);
  });
  
  try {
    // Create a custom config that specifies exactly which files to upload
    const customConfig = { ...ftpConfig };
    
    // Method 1: Use the include filter to specify exactly which files to upload
    if (!isForceUpload) {
      customConfig.include = filePaths.map(f => f.replace(/\\/g, '/').replace(/^\//, ''));
    }
    
    // Start the deployment
    await ftpDeploy.deploy(customConfig);
    
    // Save the manifest file
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(newManifest, null, 2));
    
    // Output summary
    console.log('\n===========================================================');
    console.log('DEPLOYMENT COMPLETED');
    console.log('===========================================================');
    console.log(`Total files processed: ${filesToUpload.length}`);
    console.log(`Files successfully uploaded: ${uploadedCount - errorCount}`);
    
    if (errorCount > 0) {
      console.log(`Files with errors: ${errorCount}`);
      console.log('Error files:');
      errorFiles.forEach((file, i) => {
        console.log(`  ${i + 1}. ${file}`);
      });
    }
    
    console.log(`\n✅ Deployment manifest updated for the next deployment`);
    console.log('===========================================================');
    
    return true;
  } catch (err) {
    console.error(`\nDeployment failed: ${err.message}`);
    return false;
  }
};

// Run the deployment
uploadFiles().then(success => {
  process.exit(success ? 0 : 1);
});
