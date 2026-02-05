
const express = require("express");
const app = express();

require("./config/db");

// Middleware
app.use(express.urlencoded({ extended: true }));

// View Engine
app.set("view engine", "ejs");

// Test Route
app.get("/", (req, res) => {
  res.send("Green Policy System is Running 🚀");
});

// Start Server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
app.use("/", require("./routes/auth"));
