# Kolkata Chess Academy Dashboard

## Prerequisites

- Node.js version 20.17.0 or higher
- npm version 10.0.0 or higher

## Environment Setup

```bash
# Using nvm (recommended)
nvm install 20.17.0
nvm use 20.17.0

# Or update Node.js directly from nodejs.org
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Chess Engine

This project uses a minimal Stockfish implementation for chess analysis. The implementation is automatically set up during installation.

To test if the chess engine is working:
1. Start the development server
2. Navigate to `/stockfish/test.html` in your browser
3. Click the "Test Stockfish" button

## Troubleshooting

If you experience issues with the chess engine:

```bash
# Manually run the setup script
npm run setup-stockfish
```

## License

Copyright © 2023-2024 Kolkata Chess Academy. All rights reserved.
