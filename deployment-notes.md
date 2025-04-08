# Deployment Notes for KCA Dashboard

## Stockfish Engine Configuration

When deploying the application, make sure:

1. The `/stockfish/stockfish.js` file is served with the correct MIME type (`application/javascript`). 
   The application includes both `.htaccess` and `web.config` files to help with this.

2. If using IIS, ensure the MIME type mappings are correct:
   - `.js` → `application/javascript`
   - `.mjs` → `application/javascript`
   - `.wasm` → `application/wasm` (for future WebAssembly support)

3. For Apache, the included `.htaccess` file should handle proper configuration.

## Testing Stockfish

After deployment, test that the Stockfish engine is working correctly by visiting:
