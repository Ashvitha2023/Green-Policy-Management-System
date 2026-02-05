const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Show login
router.get("/login",(req,res)=>{
  res.render("login");
});

// Handle login
router.post("/login",(req,res)=>{
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email,password],
    (err,result)=>{
      if(err) throw err;

      if(result.length === 0){
        return res.send("Invalid Login");
      }

      const user = result[0];

      if(user.role === "admin"){
        res.render("admin",{ user });
      }else{
        res.render("faculty",{ user });
      }
    }
  );
});

module.exports = router;
