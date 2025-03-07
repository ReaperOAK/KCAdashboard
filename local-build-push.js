/**
 * Local build and push to build branch script
 * Run with: node local-build-push.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== KCA Dashboard Local Build & Push Tool ===${colors.reset}\n`);

try {
  // Ensure we're on the main branch before starting
  console.log(`${colors.yellow}Checking current branch...${colors.reset}`);
  const currentBranch = execSync('git branch --show-current').toString().trim();
  
  if (currentBranch !== 'main') {
    console.log(`${colors.yellow}Currently on branch '${currentBranch}'. Switching to main branch...${colors.reset}`);
    execSync('git checkout main');
  }

  // Initialize and update Git submodules
  console.log(`${colors.yellow}Initializing and updating Git submodules...${colors.reset}`);
  try {
    execSync('git submodule update --init --recursive');
  } catch (e) {
    console.log(`${colors.yellow}No submodules found or error updating them (this is often fine).${colors.reset}`);
  }

  console.log(`${colors.yellow}Pulling latest changes from main...${colors.reset}`);
  execSync('git pull origin main');

  // Step 1: Build the React app
  console.log(`${colors.yellow}Building React application...${colors.reset}`);
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}Build successful!${colors.reset}\n`);

  // Step 2: Copy API files to build directory
  console.log(`${colors.yellow}Copying API files to build directory...${colors.reset}`);
  
  const buildDir = path.join(__dirname, 'build');
  const apiDir = path.join(__dirname, 'api');
  
  // Create api directory in build if it doesn't exist
  if (!fs.existsSync(path.join(buildDir, 'api'))) {
    fs.mkdirSync(path.join(buildDir, 'api'), { recursive: true });
  }
  
  // Copy API files recursively
  function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to, { recursive: true });
    }
    
    const files = fs.readdirSync(from);
    files.forEach(file => {
      const fromPath = path.join(from, file);
      const toPath = path.join(to, file);
      
      // Skip .git directories and git submodule directories
      if (file === '.git' || file === '.gitmodules') {
        return;
      }
      
      try {
        const stats = fs.statSync(fromPath);
        
        if (stats.isDirectory()) {
          // Skip vendor directory - often causes issues with Git submodules
          if (file === 'vendor' && from.includes('api')) {
            console.log(`${colors.yellow}Skipping vendor directory to avoid submodule issues${colors.reset}`);
            return;
          }
          copyFolderSync(fromPath, toPath);
        } else {
          fs.copyFileSync(fromPath, toPath);
        }
      } catch (err) {
        console.log(`${colors.yellow}Warning: Could not copy ${fromPath} - ${err.message}${colors.reset}`);
      }
    });
  }
  
  copyFolderSync(apiDir, path.join(buildDir, 'api'));
  
  // Copy .htaccess if it exists
  const htaccessPath = path.join(__dirname, '.htaccess');
  if (fs.existsSync(htaccessPath)) {
    fs.copyFileSync(htaccessPath, path.join(buildDir, '.htaccess'));
  }
  
  console.log(`${colors.green}Files copied successfully!${colors.reset}\n`);

  // Step 3: Create a temporary directory for build files
  console.log(`${colors.yellow}Creating temporary directory for build branch...${colors.reset}`);
  
  // Save current branch to return to it later
  const originalBranch = execSync('git branch --show-current').toString().trim();
  
  // Create a separate temp directory for the build branch
  const tempDir = path.join(__dirname, '..', 'kca-build-temp');
  if (fs.existsSync(tempDir)) {
    // Clean up existing directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  
  // Create temp directory and copy build files
  fs.mkdirSync(tempDir, { recursive: true });
  copyFolderSync(buildDir, tempDir);
  
  // Create or switch to build branch using a cleaner approach
  console.log(`${colors.yellow}Setting up build branch...${colors.reset}`);
  
  try {
    // Check if build branch exists locally
    execSync('git show-ref --verify --quiet refs/heads/build');
    console.log(`${colors.yellow}Found existing local build branch.${colors.reset}`);
    // Delete existing build branch locally
    execSync('git branch -D build');
  } catch (e) {
    console.log(`${colors.yellow}No existing local build branch found, will create new one.${colors.reset}`);
  }
  
  // Create a fresh orphan build branch
  execSync('git checkout --orphan build');
  
  // Remove all tracked files from the working directory
  console.log(`${colors.yellow}Clearing build branch...${colors.reset}`);
  try {
    execSync('git rm -rf .');
  } catch (e) {
    console.log(`${colors.yellow}Warning: Clean operation failed, manually cleaning directory...${colors.reset}`);
    // Manually clean the directory
    fs.readdirSync(__dirname, { withFileTypes: true })
      .filter(item => item.name !== '.git')
      .forEach(item => {
        const itemPath = path.join(__dirname, item.name);
        try {
          if (item.isDirectory()) {
            fs.rmSync(itemPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(itemPath);
          }
        } catch (err) {
          console.log(`${colors.yellow}Warning: Could not remove ${itemPath} - ${err.message}${colors.reset}`);
        }
      });
  }
  
  // Copy build files into the root of the repository
  console.log(`${colors.yellow}Copying build files to repository...${colors.reset}`);
  copyFolderSync(tempDir, __dirname);
  
  // Add files to git
  console.log(`${colors.yellow}Committing build files...${colors.reset}`);
  execSync('git add .');
  
  try {
    execSync('git commit -m "Build: Local build push"');
    // Force push to remote build branch
    console.log(`${colors.yellow}Pushing to remote build branch...${colors.reset}`);
    execSync('git push -f origin build');
    console.log(`${colors.green}Successfully pushed to build branch!${colors.reset}`);
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      console.log(`${colors.yellow}No changes to commit.${colors.reset}`);
    } else {
      throw error;
    }
  }
  
  // Return to original branch and clean up
  console.log(`${colors.yellow}Returning to ${originalBranch} branch...${colors.reset}`);
  execSync(`git checkout ${originalBranch}`);
  
  // Clean up temporary directory
  console.log(`${colors.yellow}Cleaning up temporary files...${colors.reset}`);
  fs.rmSync(tempDir, { recursive: true, force: true });
  
  console.log(`\n${colors.bright}${colors.green}=== Build successfully pushed to 'build' branch ===${colors.reset}`);
  console.log(`${colors.cyan}The GitHub Actions workflow will now deploy automatically.${colors.reset}`);

} catch (error) {
  console.error(`${colors.red}Error:${colors.reset}`, error.message);
  console.log(`\n${colors.yellow}Attempting to return to your original branch...${colors.reset}`);
  
  try {
    const branch = execSync('git branch --show-current').toString().trim();
    if (branch === 'build') {
      execSync('git checkout main');
    }
  } catch (e) {
    // Best effort to return to main branch
    console.error(`${colors.red}Could not automatically return to original branch.${colors.reset}`);
  }
  
  process.exit(1);
}
