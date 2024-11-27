// Import necessary dependencies
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Set up MySQL connection
const db = mysql.createConnection({
  host: "localhost", // Example: 'localhost'
  user: "u703958259_admin", // Your MySQL username
  password: "1!jqkNyFs", // Your MySQL password
  database: "u703958259_dashboard"
});

db.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

// Test Route (for checking the server)
app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

app.get("/api/attendance", (req, res) => {
  // Fetch attendance data from the database
  const attendanceData = [
    { id: 1, className: "Math 101", date: "2024-11-27" },
    { id: 2, className: "Science 102", date: "2024-11-28" }
  ];
  res.json(attendanceData);
});


// Port for the server to listen
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
