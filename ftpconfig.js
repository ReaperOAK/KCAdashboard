// FTP deployment configuration
const ftpDeploy = require("ftp-deploy");
const ftp = new ftpDeploy();
require('dotenv').config(); // Load environment variables from .env file

// Check which password to use (command line or .env file)
const password = process.env.FTP_PASSWORD || process.env.ftp_password;
if (!password) {
  console.error("Error: No FTP password provided. Please set the FTP_PASSWORD environment variable.");
  process.exit(1);
}

const config = {  host: "82.112.229.31", // FTP hostname
  port: 21, // FTP port
  user: "u703958259", // FTP username
  password: "Oa786ak92*", // Using the password variable we defined above
  localRoot: __dirname + "/build/", // Local build folder
  remoteRoot: "/domains/kolkatachessacademy.in/public_html/dashboard/", // Remote directory
  include: ["*", "**/*"], // Include all files
  deleteRemote: false, // Don't delete existing files on the remote server
  forcePasv: true, // Use passive mode
  sftp: false, // Regular FTP, not SFTP
  log: console.log, // Enable logging
};

// Start deployment
console.log("Starting FTP deployment...");
ftp
  .deploy(config)
  .then((res) => console.log("Deployment finished successfully!"))
  .catch((err) => console.error("Error during deployment:", err));
