const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "2005",
  database: "green_policy_db"
});

db.connect(err => {
  if (err) {
    console.error("DB Connection Failed:", err);
    return;
  }
  console.log("DB Connected");
});

module.exports = db;
