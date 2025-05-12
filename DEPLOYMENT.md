# Kolkata Chess Academy Dashboard - Deployment Guide

This project includes scripts to build the React application and deploy it to the Hostinger hosting service via FTP.

## Deployment Steps

### Option 1: Using the Deployment Batch File (Recommended)

1. Run the deployment batch file:
   ```
   .\deploy.bat
   ```

2. When prompted, enter your FTP password.

3. The script will automatically:
   - Prepare the Stockfish chess engine files
   - Build the React application
   - Copy necessary server configuration files (.htaccess, web.config)
   - Deploy the build files to Hostinger via FTP

### Option 2: Using PowerShell Script Directly

```powershell
# Run the PowerShell script with your password
.\deploy-to-hostinger.ps1 -Password "your-password-here"
```

### Option 3: Using npm Script Directly

```bash
# Set FTP password as environment variable (PowerShell)
$env:FTP_PASSWORD="your-password-here"

# Run the build and deployment script
npm run build-deploy
```

## FTP Configuration

The FTP deployment is configured to:
- Host: ftp://82.112.229.31 (ftp.kolkatachessacademy.in)
- Username: u703958259
- Target directory: /domains/kolkatachessacademy.in/public_html/
- Port: 21

You can modify these settings in the `ftpconfig.js` file if needed.

## Server Configuration Files

The deployment automatically copies necessary server configuration files:

1. `.htaccess` - For Apache servers (commonly used at Hostinger)
   - Sets proper MIME types for JavaScript files
   - Configures CORS headers for Web Workers
   - Handles SPA routing with 404 redirects to index.html

2. `web.config` - For IIS servers (if you decide to host on Windows Server)
   - Configures MIME types for JavaScript and WASM files
   - Sets CORS headers

## Stockfish Chess Engine Setup

The deployment script automatically prepares Stockfish files for production:

1. Copies Stockfish engine files from node_modules to the build
2. Creates a helper loader script
3. Adds a test page to verify the engine works correctly

After deployment, you can verify Stockfish is working by visiting:
`https://kolkatachessacademy.in/stockfish/test.html`

## Troubleshooting

### If Files Aren't Uploading
- Check the FTP credentials
- Ensure the remote directory path is correct
- Verify the server allows FTP connections on port 21

### If Stockfish Engine Doesn't Work
- Verify MIME type configuration on your server
- Check browser console for any errors
- Ensure the stockfish.js file is properly served

### If You Need a Clean Deployment
To delete existing files on the server before uploading:
1. Open `ftpconfig.js`
2. Change `deleteRemote: false` to `deleteRemote: true` (use with caution!)

## Security Notes

- The FTP password is never stored in any file and must be provided during each deployment process
- Consider using SFTP if available on your hosting plan for better security
- Always deploy from a secure environment

## Additional Resources

- [Hostinger FTP Guide](https://support.hostinger.com/en/articles/4455771-how-to-use-ftp-to-upload-files)
- [React Deployment Best Practices](https://create-react-app.dev/docs/deployment/)
- [Stockfish Documentation](https://github.com/lichess-org/stockfish.js)
