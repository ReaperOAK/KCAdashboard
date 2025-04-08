/**
 * Script to check Stockfish configuration in production
 * Run this via Node.js after deployment
 */

const https = require('https');
const http = require('http');
const chalk = require('chalk').default || require('chalk');

// Domain to check (adjust this to your actual domain)
const domain = 'dashboard.kolkatachessacademy.in';
const protocol = 'https'; // Change to 'http' if needed
const stockfishPath = '/stockfish/stockfish.js';

console.log(chalk.bold('\nChecking Stockfish configuration on:'), chalk.cyan(`${protocol}://${domain}${stockfishPath}`));

// Function to check the file and its MIME type
function checkStockfishFile() {
  const client = protocol === 'https' ? https : http;
  
  const options = {
    hostname: domain,
    path: stockfishPath,
    method: 'HEAD'
  };
  
  const req = client.request(options, (res) => {
    console.log(chalk.bold('\nServer response:'));
    console.log(chalk.yellow(`Status: ${res.statusCode} ${res.statusMessage}`));
    console.log(chalk.yellow(`Content-Type: ${res.headers['content-type'] || 'not specified'}`));
    
    // Check content type
    const contentType = res.headers['content-type'] || '';
    if (contentType.includes('application/javascript')) {
      console.log(chalk.green('\n✓ Content-Type is correct!'));
    } else {
      console.log(chalk.red('\n✗ Content-Type is INCORRECT!'));
      console.log(chalk.red(`  Received: ${contentType}`));
      console.log(chalk.red(`  Expected: application/javascript`));
      
      if (contentType.includes('text/html')) {
        console.log(chalk.red('\nProbable issue: Server is returning an HTML error page instead of JavaScript'));
        console.log(chalk.yellow('\nPossible solutions:'));
        console.log('1. Ensure the file exists at the correct location');
        console.log('2. Check file permissions');
        console.log('3. Configure the server to serve .js files with the correct MIME type');
        console.log('4. Check if any rewrite rules are interfering with the file path');
      }
    }
    
    // Now make a GET request to see the actual content
    performGetRequest();
  });
  
  req.on('error', (e) => {
    console.error(chalk.red('\nError making request:'), e.message);
  });
  
  req.end();
}

// Function to get the file content
function performGetRequest() {
  const client = protocol === 'https' ? https : http;
  
  console.log(chalk.bold('\nFetching file content to check:'));
  
  const req = client.request({
    hostname: domain,
    path: stockfishPath,
    method: 'GET'
  }, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      // Check first few characters to determine content type
      const firstChars = data.substring(0, 50).trim();
      
      if (firstChars.startsWith('<!DOCTYPE html>') || firstChars.startsWith('<html>')) {
        console.log(chalk.red('✗ Content appears to be HTML, not JavaScript!'));
        console.log(chalk.yellow('First 50 characters:'), chalk.gray(firstChars));
      } else {
        console.log(chalk.green('✓ Content appears to be JavaScript'));
        console.log(chalk.yellow('First 50 characters:'), chalk.gray(firstChars));
      }
      
      console.log(chalk.bold('\nNext steps:'));
      console.log('1. Ensure the stockfish.js file is properly deployed');
      console.log('2. Verify server MIME type configuration');
      console.log('3. Check for server-side rewrite rules interfering with JavaScript files');
    });
  });
  
  req.on('error', (e) => {
    console.error(chalk.red('\nError fetching content:'), e.message);
  });
  
  req.end();
}

// Run the check
checkStockfishFile();
