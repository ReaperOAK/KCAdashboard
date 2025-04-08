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

## Critical Production Steps

### 1. Verify Stockfish Files Exist
Ensure these three files are properly deployed to your server:
- `/stockfish/stockfish.js` - The chess engine
- `/stockfish/stockfish-loader.js` - The loader utility
- `/stockfish/test.html` - The test page

If not, run this command locally before building your production files:
```bash
node scripts/prepare-chess-files.js
```

### 2. Check File Permissions
Make sure the web server has read access to all files in the `/stockfish/` directory.

### 3. Verify MIME Type Configuration
Confirm JavaScript files are correctly configured in your server:

For IIS:
1. Open IIS Manager
2. Select your site
3. Open "MIME Types" feature
4. Add or verify: `.js` extension maps to `application/javascript` MIME type

For Apache:
- Ensure `.htaccess` files are processed (AllowOverride setting)
- Add to your main Apache config if needed:
  ```
  AddType application/javascript .js
  ```

### 4. Test Stockfish Engine
After deployment, test that the Stockfish engine is working correctly by visiting:
