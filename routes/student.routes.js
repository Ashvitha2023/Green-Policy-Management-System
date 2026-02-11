const express = require("express");
const db = require("../config/db");

const router = express.Router();


// ================= STUDENT AUTH =================
router.use((req, res, next) => {

  if (!req.session.userId || req.session.role !== "student") {
    return res.redirect("/");
  }

  next();
});


// ================= STUDENT DASHBOARD =================
router.get("/", (req, res) => {

  const studentId = req.session.userId;

  const sql = `
  SELECT
    p.title,
    p.description,
    d.name AS department,
    u.name AS staff,
    sp.status

  FROM student_groups sg

  JOIN staff_policies sp
    ON sg.staff_policy_id = sp.id

  JOIN policies p
    ON sp.policy_id = p.id

  JOIN users u
    ON sp.staff_id = u.id

  JOIN departments d
    ON p.department_id = d.id

  WHERE sg.student_id = ?
  `;

  db.query(sql, [studentId], (err, result) => {

    if (err) return res.send(err);

    res.render("student/dashboard", {
      policies: result
    });
  });
});


module.exports = router;
