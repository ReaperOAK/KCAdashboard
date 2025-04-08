# KCAdashboard
student teacher dashboard for KCA

## Chess Engine Integration

The interactive chess board feature uses a pure JavaScript/WebAssembly implementation of Stockfish that runs directly in the user's browser. This approach eliminates the need to run Stockfish on the server, making it compatible with basic hosting plans.

### Setup Instructions

1. The required Stockfish files are automatically downloaded during the npm install process.
2. If you need to set up Stockfish manually, run:
   ```
   npm run setup-stockfish
   ```

### How it Works

- Stockfish.js runs in a Web Worker in the user's browser
- The engine analysis is performed client-side without server dependencies
- All computation happens in the user's browser, conserving server resources

### Considerations

- The analysis depth and quality depends on the user's device capabilities
- Deeper analysis may be slower on mobile devices
- The maximum skill level is limited compared to native Stockfish implementations
