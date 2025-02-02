// Import Express module
const express = require('express');

// Initialize an Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Define a route for the home page
app.get('/', (req, res) => {
  res.send('Hello, World!');
});




// Set the server to listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});