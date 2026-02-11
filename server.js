const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: "greenpolicysecret",
  resave: false,
  saveUninitialized: true
}));

// View engine
app.set("view engine", "ejs");
app.set("views", "views");

// Static files
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Routes
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const staffRoutes = require("./routes/staff.routes");
const studentRoutes = require("./routes/student.routes");

app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/staff", staffRoutes);
app.use("/student", studentRoutes);

// Server start
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
