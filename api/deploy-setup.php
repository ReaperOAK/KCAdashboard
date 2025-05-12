<?php
/**
 * Post-deployment script to handle fixed packages
 * This script copies the fixed packages from public/fixed-packages to node_modules
 */

// Set error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define paths
$publicFixedPackagesPath = dirname(__DIR__) . '/public/fixed-packages';
$nodeModulesPath = dirname(__DIR__) . '/node_modules';

// Create log file
$logFile = dirname(__FILE__) . '/logs/deploy-setup.log';
file_put_contents($logFile, "Deploy setup started: " . date('Y-m-d H:i:s') . "\n");

// Function to log messages
function logMessage($message) {
    global $logFile;
    file_put_contents($logFile, $message . "\n", FILE_APPEND);
    echo $message . "\n";
}

// Check if fixed-packages directory exists in public
if (!is_dir($publicFixedPackagesPath)) {
    logMessage("Error: Fixed packages directory not found at: $publicFixedPackagesPath");
    exit(1);
}

// Check if node_modules directory exists
if (!is_dir($nodeModulesPath)) {
    logMessage("node_modules directory not found. Creating directory.");
    mkdir($nodeModulesPath, 0755, true);
}

// Function to recursively copy directories
function copyDirectory($source, $destination) {
    global $logFile;
    
    if (!is_dir($source)) {
        logMessage("Source is not a directory: $source");
        return false;
    }
    
    // Create destination directory if it doesn't exist
    if (!is_dir($destination)) {
        mkdir($destination, 0755, true);
    }
    
    $handle = opendir($source);
    $result = true;
    
    while (($file = readdir($handle)) !== false) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        
        $sourcePath = $source . '/' . $file;
        $destPath = $destination . '/' . $file;
        
        if (is_dir($sourcePath)) {
            $result = $result && copyDirectory($sourcePath, $destPath);
        } else {
            if (copy($sourcePath, $destPath)) {
                logMessage("Copied: $sourcePath -> $destPath");
            } else {
                logMessage("Failed to copy: $sourcePath -> $destPath");
                $result = false;
            }
        }
    }
    
    closedir($handle);
    return $result;
}

// Process each package in the fixed-packages directory
$packagesDirHandle = opendir($publicFixedPackagesPath);
if ($packagesDirHandle) {
    while (($packageName = readdir($packagesDirHandle)) !== false) {
        if ($packageName === '.' || $packageName === '..') {
            continue;
        }
        
        $sourcePackagePath = $publicFixedPackagesPath . '/' . $packageName;
        $destPackagePath = $nodeModulesPath . '/' . $packageName;
        
        if (is_dir($sourcePackagePath)) {
            logMessage("Processing package: $packageName");
            
            // Create package directory in node_modules if needed
            if (!is_dir($destPackagePath)) {
                mkdir($destPackagePath, 0755, true);
                logMessage("Created directory: $destPackagePath");
            }
            
            // Copy package files
            if (copyDirectory($sourcePackagePath, $destPackagePath)) {
                logMessage("Successfully copied package: $packageName");
            } else {
                logMessage("Error copying package: $packageName");
            }
        }
    }
    closedir($packagesDirHandle);
}

logMessage("Deploy setup completed: " . date('Y-m-d H:i:s'));
