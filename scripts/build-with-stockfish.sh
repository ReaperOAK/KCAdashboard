#!/bin/bash

# Make a backup of our stockfish implementation
mkdir -p .stockfish_backup
cp -f src/utils/stockfish.min.js .stockfish_backup/stockfish.min.js

# Run the standard build process
npm run build

# Ensure the stockfish directory exists in the build output
mkdir -p build/stockfish

# Copy our stockfish implementation to the build directory
cp -f .stockfish_backup/stockfish.min.js build/stockfish/stockfish.min.js

echo "Build complete with Stockfish engine preserved"
