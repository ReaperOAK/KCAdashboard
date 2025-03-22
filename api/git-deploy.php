<?php
/**
 * Hostinger Git Deployment Helper
 * 
 * This script configures git to use merge strategy for pulls
 * and then pulls from the build branch to resolve divergent branch issues.
 */

// Set proper content type for output
header('Content-Type: text/plain');

// Output buffer to collect all messages
$output = [];

// Function to safely execute commands and capture output
function run_command($command) {
    global $output;
    
    $output[] = "> Executing: $command";
    exec($command . " 2>&1", $result, $return_code);
    
    foreach ($result as $line) {
        $output[] = $line;
    }
    
    if ($return_code !== 0) {
        $output[] = "Command failed with exit code: $return_code";
        return false;
    }
    
    return true;
}

// Get current directory
$output[] = "Current working directory: " . getcwd();

// Configure git to use merge strategy (not rebase)
if (!run_command("git config pull.rebase false")) {
    $output[] = "Failed to configure git pull strategy.";
} else {
    $output[] = "Successfully configured git to use merge strategy for pulls.";
}

// Pull from build branch
if (!run_command("git pull origin build")) {
    $output[] = "Failed to pull from build branch.";
} else {
    $output[] = "Successfully pulled latest changes from build branch.";
}

// Display all output
echo implode("\n", $output);

// For security, you might want to add authentication to this script 
// before using it in production
?>
