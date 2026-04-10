# 🌿 Green Policy Management System

> *Turning environmental policies from words on paper into verified, 
trackable, real-world action.*

---

## 🚀 Overview

Most institutions **declare** green policies. Very few can **prove** they 
implemented them.

The **Green Policy Management System** is a role-based web platform that 
automates the complete lifecycle of institutional environmental policy 
management — from creation and smart assignment to execution tracking, 
evidence verification, and automated deadline enforcement.

No more chasing staff over emails. No more lost paperwork. 
Just clean, automated, accountable governance.

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MySQL |
| Frontend | EJS (Embedded JavaScript) |
| Auth | Express-Session |
| File Uploads | Multer |
| Scheduler | Node-Cron |
| Email | Nodemailer |

---

## 🎯 Key Features

- 🔐 **Role-Based Access Control** — Separate dashboards for Admin, Staff, and Student
- 🧠 **Smart Auto-Assignment** — Minimum-load-first algorithm for fair policy delegation
- 📋 **Policy Lifecycle Tracking** — Pending → Pending Verification → Completed / Rejected
- 📁 **Secure Evidence Upload** — Staff submit proof, Admin verifies with approve/reject
- ⏰ **Automated Reminders** — Daily cron job emails overdue staff automatically
- 📊 **Real-Time Dashboard** — Live policy status monitoring across all departments

---

## 👥 User Roles
Admin  →  Create policies → Monitor dashboard → Approve/Reject proof
Staff  →  View assignment → Execute initiative → Upload evidence
Student → View policy    → Acknowledge task

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Ashvitha2023/Green-Policy-Management-System.git
cd green-policy-management-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=green_policy_db
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=yourapppassword
SESSION_SECRET=yoursecretkey
PORT=3000
```

### 4. Set up the database
```bash
mysql -u root -p < database/schema.sql
```

### 5. Run the server
```bash
node app.js
```
Visit `http://localhost:3000`

---

## 📁 Project Structure
green-policy-management-system/
│
├── app.js                  # Entry point
├── routes/                 # Express route handlers
├── controllers/            # Business logic (MVC)
├── models/                 # Database query functions
├── views/                  # EJS templates
│   ├── admin/
│   ├── staff/
│   └── student/
├── public/                 # Static assets (CSS, JS)
├── uploads/                # Evidence file storage
├── database/
│   └── schema.sql          # MySQL schema
└── .env                    # Environment variables

## 📸 Screenshots
![alt text](<Screenshot 2026-04-07 143635.png>)
![alt text](<Screenshot 2026-04-06 234710.png>)
![alt text](<Screenshot 2026-04-06 233805.png>)
![alt text](<Screenshot 2026-04-07 143710.png>)
