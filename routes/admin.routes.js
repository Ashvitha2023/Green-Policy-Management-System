const express = require("express");
const db = require("../config/db");

const router = express.Router();


// ================= ADMIN AUTH =================
router.use((req, res, next) => {

  if (!req.session.userId || req.session.role !== "admin") {
    return res.redirect("/");
  }

  next();
});


// ================= DASHBOARD =================
router.get("/", (req, res) => {
  res.render("admin/dashboard");
});


// ================= SHOW CREATE POLICY =================
router.get("/create-policy", (req, res) => {

  db.query("SELECT * FROM departments", (err, depts) => {

    if (err) {
      console.log(err);
      return res.send("Database Error");
    }

    res.render("admin/create-policy", {
      departments: depts
    });
  });
});


// ================= CREATE POLICY =================
router.post("/create-policy", (req, res) => {

  const { title, description, department_id, deadline } = req.body;

  // Insert policy
  db.query(
    "INSERT INTO policies (title, description, department_id, deadline) VALUES (?, ?, ?, ?)",
    [title, description, department_id, deadline],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.send("Database Error");
      }

      const policyId = result.insertId;


      // Smart Staff Assignment
      db.query(
        `
        SELECT u.id, COUNT(sp.id) as active_count
        FROM users u
        LEFT JOIN staff_policies sp ON u.id = sp.staff_id AND sp.status IN ('pending', 'pending_verification')
        WHERE u.role = 'staff' AND u.department_id = ?
        GROUP BY u.id
        ORDER BY active_count ASC, u.created_at ASC
        LIMIT 1
        `,
        [department_id],
        (err, staff) => {

          if (err) return res.send(err);

          if (staff.length === 0) {
            return res.send("No staff available in this department");
          }

          const staffId = staff[0].id;


          // Assign staff
          db.query(
            `
            INSERT INTO staff_policies (policy_id, staff_id, status)
            VALUES (?, ?, 'pending')
            `,
            [policyId, staffId],
            (err, result2) => {

              if (err) return res.send(err);

              const staffPolicyId = result2.insertId;


              // Smart Student Assignment
              db.query(
                `
                INSERT INTO student_groups (staff_policy_id, student_id)
                SELECT ?, sub.id
                FROM (
                  SELECT u.id, COUNT(sg.id) as participation_count
                  FROM users u
                  LEFT JOIN student_groups sg ON u.id = sg.student_id
                  WHERE u.role = 'student' AND u.department_id = ?
                  GROUP BY u.id
                  ORDER BY participation_count ASC, u.created_at ASC
                  LIMIT 10
                ) sub
                `,
                [staffPolicyId, department_id],
                (err, result3) => {

                  if (err) return res.send(err);

                  if (result3.affectedRows < 10) {
                    return res.redirect(`/admin/monitor?warning=Only ${result3.affectedRows} students available in this department`);
                  }

                  res.redirect("/admin/monitor");
                }
              );
            }
          );
        }
      );
    }
  );
});


// ================= MONITOR =================
router.get("/monitor", (req, res) => {

  const warning = req.query.warning || null;

  const sql = `
  SELECT

    sp.id AS spid,
    p.title AS policy,
    d.name AS department,
    u.name AS staff,
    sp.status,

    (
      SELECT COUNT(*)
      FROM staff_policies sp2
      WHERE sp2.staff_id = sp.staff_id AND sp2.status IN ('pending', 'pending_verification')
    ) AS staff_active_count,

    (
      SELECT COUNT(*)
      FROM student_groups sg
      WHERE sg.staff_policy_id = sp.id
    ) AS students,

    (
      SELECT GROUP_CONCAT(CONCAT(su.name, ' - ', (SELECT COUNT(*) FROM student_groups sg2 WHERE sg2.student_id = su.id), ' initiatives') SEPARATOR '|')
      FROM student_groups sg
      JOIN users su ON sg.student_id = su.id
      WHERE sg.staff_policy_id = sp.id
    ) AS student_details,

    (
      SELECT file_path
      FROM uploads up
      WHERE up.staff_policy_id = sp.id
      ORDER BY up.id DESC
      LIMIT 1
    ) AS file_path

  FROM staff_policies sp

  JOIN policies p ON sp.policy_id = p.id
  JOIN users u ON sp.staff_id = u.id
  JOIN departments d ON p.department_id = d.id

  ORDER BY sp.id DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.log(err);
      return res.send("Database Error");
    }

    res.render("admin/monitor", {
      reports: results,
      warning: warning
    });
  });
});


// ================= VERIFY =================
router.post("/verify", (req, res) => {

  const { id, action, rejection_reason } = req.body;

  let status = "pending";
  let reason = null;

  if (action === "approve") status = "completed";
  if (action === "reject") {
    status = "rejected";
    reason = rejection_reason || "No reason provided.";
  }

  db.query(
    "UPDATE staff_policies SET status=?, rejection_reason=? WHERE id=?",
    [status, reason, id],
    (err) => {

      if (err) return res.send(err);

      res.redirect("/admin/monitor");
    }
  );
});


module.exports = router;
