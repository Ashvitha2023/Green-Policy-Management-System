const cron = require("node-cron");
const db = require("./config/db");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Run every day at 8:00 AM
cron.schedule("0 8 * * *", () => {
  console.log("Running Daily Policy Deadline Check...");

  const sql = `
    SELECT 
      sp.id, 
      u.email, 
      u.name, 
      p.title, 
      p.deadline 
    FROM staff_policies sp
    JOIN policies p ON sp.policy_id = p.id
    JOIN users u ON sp.staff_id = u.id
    WHERE p.deadline < CURDATE() 
      AND sp.status != 'completed'
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Cron Job Error fetching data:", err);
      return;
    }

    if (results.length === 0) {
      console.log("No overdue policies found today.");
      return;
    }

    console.log(`Found ${results.length} overdue policies! Sending emails...`);

    results.forEach(record => {
      const mailOptions = {
        from: '"Green Policy System" <noreply@greenpolicy.local>',
        to: record.email,
        subject: `⚠️ OVERDUE: ${record.title}`,
        html: `
          <h3>Action Required: Overdue Policy</h3>
          <p>Hello ${record.name},</p>
          <p>This is a reminder that the compliance documentation for the policy <strong>${record.title}</strong> is overdue.</p>
          <p>The deadline was: <strong>${new Date(record.deadline).toLocaleDateString()}</strong>.</p>
          <p>Please log into the Green Policy System and submit the required documentation as soon as possible.</p>
          <br/>
          <p>Thank you.</p>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Failed to send email to ${record.email}:`, error);
        } else {
          console.log(`Reminder email sent to ${record.email}: %s`, info.messageId);
        }
      });
    });
  });
});

console.log("Cron scheduler started: Daily deadline checker configured.");
