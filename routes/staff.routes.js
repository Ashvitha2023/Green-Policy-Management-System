const express = require("express");
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

const router = express.Router();


/* =========================
   🔐 STAFF AUTH PROTECTION
========================= */
router.use((req, res, next) => {

  if (!req.session.userId || req.session.role !== "staff") {
    return res.redirect("/");
  }

  next();
});


/* =========================
   📊 STAFF DASHBOARD
========================= */
router.get("/", (req, res) => {

  const staffId = req.session.userId;

  const sql = `
  SELECT
    sp.id AS spid,
    p.title,
    p.description,
    sp.status
  FROM staff_policies sp
  JOIN policies p ON sp.policy_id = p.id
  WHERE sp.staff_id = ?
  ORDER BY sp.id DESC
  `;

  db.query(sql, [staffId], (err, result) => {

    if (err) return res.send(err);

    res.render("staff/dashboard", {
      policies: result
    });

  });
});


/* =========================
   📄 POLICY DETAILS
========================= */
router.get("/policy/:id", (req, res) => {

  const staffId = req.session.userId;
  const spid = req.params.id;

  // Check ownership
  const policySql = `
  SELECT
    p.title,
    p.description,
    p.deadline,
    sp.status,
    sp.rejection_reason
  FROM staff_policies sp
  JOIN policies p ON sp.policy_id = p.id
  WHERE sp.id = ? AND sp.staff_id = ?
  `;

  db.query(policySql, [spid, staffId], (err, policy) => {

    if (err) return res.send(err);

    if (policy.length === 0) {
      return res.send("Unauthorized Access ❌");
    }

    // Get students
    const studentSql = `
    SELECT u.name, u.email, sg.acknowledged
    FROM student_groups sg
    JOIN users u ON sg.student_id = u.id
    WHERE sg.staff_policy_id = ?
    `;

    db.query(studentSql, [spid], (err, students) => {

      if (err) return res.send(err);

      res.render("staff/policy-details", {
        policy: policy[0],
        students,
        spid
      });

    });

  });
});


/* =========================
   📁 FILE UPLOAD SETUP
========================= */

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }

});

const upload = multer({ storage });


/* =========================
   📤 UPLOAD PROOF
========================= */
router.post("/upload/:id", upload.single("file"), (req, res) => {

  const spid = req.params.id;

  if (!req.file) {
    return res.send("No file uploaded.");
  }

  const filePath = "uploads/" + req.file.filename;

  // 1️⃣ Save file
  db.query(
    "INSERT INTO uploads (staff_policy_id, file_path) VALUES (?, ?)",
    [spid, filePath],
    (err) => {

      if (err) return res.send(err);

      // 2️⃣ Update status to pending_verification and clear rejection
      db.query(
        "UPDATE staff_policies SET status='pending_verification', rejection_reason=NULL WHERE id=?",
        [spid],
        (err2) => {

          if (err2) return res.send(err2);

          res.redirect("/staff");
        }
      );

    }
  );

});


module.exports = router;
