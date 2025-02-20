const express = require('express');
const cors = require("cors");
const ytapis = require("./routes/ytapis.js");
const musicapis = require("./routes/musicapis.js");
require('dotenv').config()


// Initialize an Express app
const app = express();

// Middlewares  to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())


//Routes
app.use('/ytapis', ytapis)
app.use('/musicapis', musicapis)


app.get("/", (req, res) => {
  res.send("Playnow --- Streaming on the Goo")
})

// Set the server to listen on port 3000
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

