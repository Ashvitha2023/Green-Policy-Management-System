const express = require("express");
const db = require("../config/db");

const router = express.Router();


// ================= SHOW LOGIN =================
router.get("/", (req, res) => {
  res.render("login");
});


// ================= LOGIN =================
router.post("/login", (req, res) => {

  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, result) => {

      if (err) return res.send(err);

      if (result.length === 0) {
        return res.send("Invalid Login");
      }

      // Save session
      req.session.userId = result[0].id;
      req.session.role = result[0].role;

      if (result[0].role === "admin")
        return res.redirect("/admin");

      if (result[0].role === "staff")
        return res.redirect("/staff");

      if (result[0].role === "student")
        return res.redirect("/student");
    }
  );
});


// ================= LOGOUT =================
router.get("/logout", (req, res) => {

  req.session.destroy(() => {
    res.redirect("/");
  });

});


module.exports = router;
