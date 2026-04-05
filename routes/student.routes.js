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
    sp.id AS spid,
    p.title,
    p.description,
    p.deadline,
    d.name AS department,
    u.name AS staff,
    sp.status,
    sg.acknowledged

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

// ================= ACKNOWLEDGE POLICY =================
router.post("/acknowledge/:spid", (req, res) => {
  const studentId = req.session.userId;
  const spid = req.params.spid;

  const sql = "UPDATE student_groups SET acknowledged = 1 WHERE staff_policy_id = ? AND student_id = ?";
  db.query(sql, [spid, studentId], (err) => {
    if (err) return res.send(err);
    res.redirect("/student");
  });
});

module.exports = router;
