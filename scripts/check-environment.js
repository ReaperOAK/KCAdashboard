/**
 * Environment compatibility check script
 * Helps users verify their Node.js and npm versions
 */

const chalk = require('chalk').default || require('chalk');

// Get current versions
const nodeVersion = process.versions.node;
const npmVersion = require('child_process')
  .execSync('npm --version')
  .toString()
  .trim();

// Parse version strings
const parseVersion = (versionStr) => {
  const [major, minor, patch] = versionStr.split('.').map(Number);
  return { major, minor, patch, full: versionStr };
};

const currentNode = parseVersion(nodeVersion);
const currentNpm = parseVersion(npmVersion);

// Check if version meets requirements
const meetsRequirement = (current, required) => {
  const req = parseVersion(required);
  return (
    current.major > req.major ||
    (current.major === req.major && current.minor >= req.minor)
  );
};

// Define requirements
const requiredNode = '20.17.0';
const requiredNpm = '10.0.0';

// Perform checks
const nodeCompatible = meetsRequirement(currentNode, requiredNode);
const npmCompatible = meetsRequirement(currentNpm, requiredNpm);

// Display results
console.log(chalk.bold('\n=== Environment Compatibility Check ===\n'));

console.log(
  `Node.js: ${currentNode.full} ${
    nodeCompatible
      ? chalk.green('✓ Compatible')
      : chalk.yellow('⚠ Recommended: >= ' + requiredNode)
  }`
);

console.log(
  `npm: ${currentNpm.full} ${
    npmCompatible
      ? chalk.green('✓ Compatible')
      : chalk.yellow('⚠ Recommended: >= ' + requiredNpm)
  }`
);

if (!nodeCompatible || !npmCompatible) {
  console.log(
    chalk.yellow(
      '\nYou may experience warnings due to version compatibility issues.'
    )
  );
  console.log(
    '\nTo update Node.js: Visit https://nodejs.org/ or use a version manager like nvm'
  );
  console.log('To update npm: Run ' + chalk.cyan('npm install -g npm@latest'));
} else {
  console.log(chalk.green('\nYour environment meets all requirements! ✓'));
}

console.log(chalk.bold('\n=========================================\n'));
