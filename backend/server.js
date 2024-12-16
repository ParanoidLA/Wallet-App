const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./user");

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON body

// Routes
app.use("/api", userRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});