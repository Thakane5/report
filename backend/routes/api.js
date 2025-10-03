const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// -------------------- REGISTER --------------------
router.post("/register", async (req,res)=>{
  const {name,email,password,role} = req.body;

  if(!name || !email || !password || !role){
    return res.status(400).json({message:"All fields are required"});
  }

  const existingUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(existingUserQuery,[email], async (err,results)=>{
    if(err) return res.status(500).json({message: err.message});
    if(results.length > 0) return res.status(409).json({message:"User already exists"});

    let passwordToStore = password;
    if(!password.startsWith('$2b$')) passwordToStore = await bcrypt.hash(password,10);

    const insertQuery = `INSERT INTO users (name,email,password,role)
                         VALUES (?,?,?,?)`;
    db.query(insertQuery,[name,email,passwordToStore,role],(err,result)=>{
      if(err) return res.status(500).json({message: err.message});
      const newUser = {
        id: result.insertId,
        name,email,role
      };
      res.status(201).json({message:"Registration successful", user:newUser});
    });
  });
});

// -------------------- LOGIN --------------------
router.post("/login",(req,res)=>{
  const {email,password} = req.body;
  if(!email || !password) return res.status(400).json({message:"Email and password are required"});

  const query = "SELECT * FROM users WHERE email=?";
  db.query(query,[email], async (err,results)=>{
    if(err) return res.status(500).json({message:err.message});
    if(results.length===0) return res.status(401).json({message:"Invalid email or password"});

    const user = results[0];
    let match=false;
    if(user.password.startsWith('$2b$')) match = await bcrypt.compare(password,user.password);
    else match = (password===user.password);

    if(!match) return res.status(401).json({message:"Invalid email or password"});
    res.json({message:"Login successful",
      user:{
        id:user.user_id,
        name:user.name,
        email:user.email,
        role:user.role
      }
    });
  });
});

// -------------------- GET LECTURERS --------------------
router.get("/prl/lecturers",(req,res)=>{
  const query = "SELECT user_id,name,email,role FROM users WHERE role='lecturer'";
  db.query(query,(err,results)=>{
    if(err) return res.status(500).json({message: err.message});
    res.json(results);
  });
});

// -------------------- ADD LECTURER --------------------
router.post("/prl/lecturers",(req,res)=>{
  const {name,email} = req.body;
  if(!name || !email) return res.status(400).json({message:"All fields are required"});

  const checkQuery = "SELECT * FROM users WHERE email=?";
  db.query(checkQuery,[email],(err,results)=>{
    if(err) return res.status(500).json({message:err.message});
    if(results.length>0) return res.status(409).json({message:"Lecturer already exists"});

    const tempPassword = "temp123";
    const insertQuery = "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)";
    db.query(insertQuery,[name,email,tempPassword,'lecturer'],(err,result)=>{
      if(err) return res.status(500).json({message:err.message});
      res.json({message:"Lecturer added successfully", lecturerId: result.insertId});
    });
  });
});

module.exports = router;