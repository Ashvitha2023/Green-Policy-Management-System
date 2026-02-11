const express = require("express");
const db = require("../config/db");

const router = express.Router();


// ================= STAFF DASHBOARD (CARDS) =================
router.get("/", (req, res) => {

  // TEMP: replace later with session id
  const staffId = req.session.userId;
 // use your staff id for testing

  const sql = `
  SELECT
    sp.id AS spid,
    p.title,
    p.description,
    sp.status
  FROM staff_policies sp
  JOIN policies p ON sp.policy_id = p.id
  WHERE sp.staff_id = ?
  `;

  db.query(sql, [staffId], (err, result) => {

    if (err) return res.send(err);

    res.render("staff/dashboard", {
      policies: result
    });
  });
});

// ================= POLICY DETAILS =================
router.get("/policy/:id", (req, res) => {

  // 🔐 Check Login
  if (!req.session.userId || req.session.role !== "staff") {
    return res.redirect("/");
  }

  const staffId = req.session.userId;   // logged-in staff
  const spid = req.params.id;           // staff_policy_id


  // ✅ Check if this policy belongs to this staff
  const policySql = `
  SELECT
    p.title,
    p.description,
    sp.status
  FROM staff_policies sp
  JOIN policies p ON sp.policy_id = p.id
  WHERE sp.id = ? AND sp.staff_id = ?
  `;

  db.query(policySql, [spid, staffId], (err, policy) => {

    if (err) return res.send(err);

    // ❗ If no record → not his policy
    if (policy.length === 0) {
      return res.send("Unauthorized Access ❌");
    }

    // Get students
    const studentSql = `
    SELECT u.name, u.email
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



// ================= VIEW STUDENTS =================
router.get("/students/:id", (req, res) => {

  const spid = req.params.id;

  const sql = `
  SELECT u.name, u.email
  FROM student_groups sg
  JOIN users u ON sg.student_id = u.id
  WHERE sg.staff_policy_id = ?
  `;

  db.query(sql, [spid], (err, result) => {

    if (err) return res.send(err);

    res.render("staff/students", {
      students: result
    });
  });

});


// ================= UPLOAD PROOF =================
const multer = require("multer");

const storage = multer.diskStorage({

  destination: "uploads/",

  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }

});

const upload = multer({ storage });


router.post("/upload/:id", upload.single("file"), (req, res) => {

  const spid = req.params.id;

  // Save upload
  db.query(
    "INSERT INTO uploads (staff_policy_id,file_path) VALUES (?,?)",
    [spid, req.file.path],
    (err) => {

      if (err) return res.send(err);

      // Update status
      db.query(
        "UPDATE staff_policies SET status='pending_verification' WHERE id=?",
        [spid]
      );

      res.redirect("/staff");
    }
  );
});


module.exports = router;
