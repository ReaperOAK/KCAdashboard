#!/bin/bash

# Deployment script to fix git divergent branches issue
echo "Starting deployment process..."

# Configure git to use merge strategy for pulls
git config pull.rebase false

# Pull from the repository (this will merge changes)
git pull origin main

# Install dependencies (if needed)
# npm install

# Run post-deployment PHP script to handle fixed packages
php api/deploy-setup.php

echo "Deployment completed successfully"
