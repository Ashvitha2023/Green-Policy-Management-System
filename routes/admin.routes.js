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

  const { title, description, department_id } = req.body;

  // Insert policy
  db.query(
    "INSERT INTO policies (title, description, department_id) VALUES (?, ?, ?)",
    [title, description, department_id],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.send("Database Error");
      }

      const policyId = result.insertId;


      // Find free staff
      db.query(
        `
        SELECT *
        FROM users
        WHERE role='staff'
          AND department_id=?
          AND id NOT IN (
            SELECT staff_id
            FROM staff_policies
            WHERE status IN ('pending','pending_verification')
          )
        ORDER BY RAND()
        LIMIT 1
        `,
        [department_id],
        (err, staff) => {

          if (err) return res.send(err);

          if (staff.length === 0) {
            return res.send("No free staff available");
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


              // Select students
              db.query(
                `
                INSERT INTO student_groups (staff_policy_id, student_id)

                SELECT ?, u.id
                FROM users u

                WHERE u.role='student'
                  AND u.department_id=?
                  AND u.id NOT IN (

                    SELECT sg.student_id
                    FROM student_groups sg
                    JOIN staff_policies sp
                      ON sg.staff_policy_id = sp.id
                    WHERE sp.status IN ('pending','pending_verification')

                  )

                ORDER BY RAND()
                LIMIT 10
                `,
                [staffPolicyId, department_id],
                (err, result3) => {

                  if (err) return res.send(err);

                  if (result3.affectedRows < 10) {
                    return res.send("Not enough students");
                  }

                  res.redirect("/admin");
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

  const sql = `
  SELECT

    sp.id AS spid,
    p.title AS policy,
    d.name AS department,
    u.name AS staff,
    sp.status,

    (
      SELECT COUNT(*)
      FROM student_groups sg
      WHERE sg.staff_policy_id = sp.id
    ) AS students,

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
      reports: results
    });
  });
});


// ================= VERIFY =================
router.post("/verify", (req, res) => {

  const { id, action } = req.body;

  let status = "pending";

  if (action === "approve") status = "completed";
  if (action === "reject") status = "rejected";

  db.query(
    "UPDATE staff_policies SET status=? WHERE id=?",
    [status, id],
    (err) => {

      if (err) return res.send(err);

      res.redirect("/admin/monitor");
    }
  );
});


module.exports = router;
