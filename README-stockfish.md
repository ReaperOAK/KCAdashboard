# Stockfish Chess Engine Setup

This document provides instructions for setting up the Stockfish chess engine for the KCA Dashboard.

## Automatic Setup

The Stockfish chess engine should be automatically set up during the `npm install` process. The setup script will:

1. Create a directory at `public/stockfish/`
2. Download the Stockfish JavaScript and WebAssembly files
3. Create a simple loader script and test HTML file

## Manual Setup (if automatic setup fails)

If the automatic setup fails, you can manually install Stockfish:

1. Download Stockfish from [the official website](https://stockfishchess.org/download/) or [GitHub Releases](https://github.com/official-stockfish/Stockfish/releases)
2. Place the JavaScript file at `public/stockfish/stockfish.js`
3. Place the WebAssembly file at `public/stockfish/stockfish.wasm` (if available)

Alternatively, you can use a CDN version by modifying the `ChessEngine.js` file to use:
```javascript
this.worker = new Worker('https://cdn.jsdelivr.net/npm/stockfish.js@latest/stockfish.js');
```

## Testing the Installation

To test if Stockfish is working properly:

1. Start your development server: `npm start`
2. Navigate to `/stockfish/test.html` in your browser
3. Click the "Test Stockfish" button
4. If working correctly, you should see "Stockfish loaded successfully!" followed by a best move calculation

## Troubleshooting

If you encounter issues with Stockfish:

1. Check browser console for errors
2. Make sure your browser supports Web Workers and WebAssembly
3. Try using an older version of Stockfish (10 or 11) which may have better compatibility
4. If using the application on a server, ensure proper MIME types are set for .wasm files

## Using Stockfish in Development

The ChessEngine.js utility provides an easy way to use Stockfish:

```javascript
import ChessEngine from './utils/ChessEngine';

// Create engine instance with skill level
const engine = new ChessEngine(10); 

// Get best move for a position
const bestMove = await engine.getBestMove('rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2');

// Analyze a position
const analysis = await engine.evaluatePosition('rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2');

// Terminate engine when done
engine.terminate();
```
