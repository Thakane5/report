const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// =============== DATABASE CONNECTION ===============
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "veronica",
  database: "luct"
});

db.connect(err => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }
  console.log("MySQL Connected...");
});

// =============== ROOT ROUTE ====================
app.get("/", (req, res) => {
  res.json({ 
    message: "LUCT Backend Server is running!",
    endpoints: {
      auth: {
        login: "POST /api/login",
        register: "POST /api/register"
      },
      ratings: {
        add: "POST /api/ratings",
        getAll: "GET /api/ratings", 
        getByStudent: "GET /api/ratings/student/:studentId",
        getByLecturer: "GET /api/ratings/lecturer/:lecturerId"
      },
      reports: {
        create: "POST /api/reports",
        getAll: "GET /api/reports",
        getByLecturer: "GET /api/reports/lecturer/:lecturerId"
      },
      lecturers: "GET /api/prl/lecturers",
      courses: "GET /api/courses",
      streams: {
        getAll: "GET /api/streams",
        getAllModules: "GET /api/modules",
        getModulesByStream: "GET /api/modules/:stream"
      }
    }
  });
});

// =============== AUTH ENDPOINTS ====================
// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    let isMatch = false;

    try {
      if (user.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = (password === user.password);
      }

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Return user data without password
      const userResponse = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      res.json({ 
        message: "Login successful", 
        user: userResponse 
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
});

// Manual registration
app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if user already exists
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { 
        name, 
        email, 
        password: hashedPassword, 
        role
      };

      db.query("INSERT INTO users SET ?", newUser, (err, result) => {
        if (err) {
          console.error("Registration error:", err);
          return res.status(500).json({ message: "Registration failed" });
        }

        const userResponse = {
          user_id: result.insertId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        };

        res.json({ 
          message: "User registered successfully", 
          user: userResponse 
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
});

// =============== RATINGS ENDPOINTS ===========================
app.post("/api/ratings", (req, res) => {
  const {
    student_id,
    lecturer_id,
    lecturer_name,
    module_name,
    module_code,
    programme,
    year_of_study,
    rating,
    comments,
  } = req.body;

  if (!student_id || !lecturer_id || !rating) {
    return res.status(400).json({ message: "Student ID, lecturer ID and rating are required" });
  }

  const query = `
    INSERT INTO ratings 
      (student_id, lecturer_id, lecturer_name, module_name, module_code, programme, year_of_study, rating, comments, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    query,
    [
      student_id,
      lecturer_id,
      lecturer_name || '',
      module_name || '',
      module_code || '',
      programme || '',
      year_of_study || '',
      rating,
      comments || '',
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting rating:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ 
        message: "Rating added successfully", 
        ratingId: result.insertId
      });
    }
  );
});

// Get all ratings
app.get("/api/ratings", (req, res) => {
  const query = `
    SELECT r.*, u.name AS lecturer_name 
    FROM ratings r
    LEFT JOIN users u ON r.lecturer_id = u.user_id
    ORDER BY r.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching ratings:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// Get ratings by student ID
app.get("/api/ratings/student/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const query = `
    SELECT 
      r.rating_id,
      r.student_id,
      r.lecturer_id,
      r.lecturer_name,
      r.module_name,
      r.module_code,
      r.programme,
      r.year_of_study,
      r.rating,
      r.comments,
      r.created_at,
      u.name AS lecturer_name
    FROM ratings r
    LEFT JOIN users u ON r.lecturer_id = u.user_id
    WHERE r.student_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching student ratings:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// Get ratings by lecturer ID
app.get("/api/ratings/lecturer/:lecturerId", (req, res) => {
  const lecturerId = req.params.lecturerId;

  const query = `
    SELECT r.*, u.name AS student_name
    FROM ratings r
    JOIN users u ON r.student_id = u.user_id
    WHERE r.lecturer_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(query, [lecturerId], (err, results) => {
    if (err) {
      console.error("Error fetching lecturer ratings:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// =============== REPORTS ENDPOINTS ===========================
app.post("/api/reports", (req, res) => {
  const { 
    lecturer_id, 
    course_code, 
    week_of_reporting, 
    date_of_lecture, 
    topic,
    learning_outcomes,
    recommendations,
    students_present, 
    total_students 
  } = req.body;

  console.log("Received report data:", req.body);

  // Check required fields
  if (!lecturer_id || !course_code || !week_of_reporting || !date_of_lecture || !topic) {
    return res.status(400).json({ 
      message: "Lecturer ID, course code, week, date and topic are required" 
    });
  }

  const sql = `
    INSERT INTO reports 
    (lecturer_id, course_code, week_of_reporting, date_of_lecture, topic, learning_outcomes, recommendations, students_present, total_students) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    lecturer_id, 
    course_code, 
    week_of_reporting, 
    date_of_lecture, 
    topic,
    learning_outcomes || '',
    recommendations || '',
    students_present || 0, 
    total_students || 0
  ], (err, result) => {
    if (err) {
      console.error("Report database error:", err);
      return res.status(500).json({ 
        message: "Failed to save report: " + err.message 
      });
    }

    res.json({ 
      message: "Report submitted successfully", 
      report_id: result.insertId 
    });
  });
});

// Get all reports
app.get("/api/reports", (req, res) => {
  const sql = `
    SELECT r.*, u.name AS lecturer_name 
    FROM reports r 
    JOIN users u ON r.lecturer_id = u.user_id 
    ORDER BY r.created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Reports fetch error:", err);
      return res.status(500).json({ message: "Failed to fetch reports" });
    }
    res.json(results);
  });
});

// Get reports by lecturer ID
app.get("/api/reports/lecturer/:lecturerId", (req, res) => {
  const lecturerId = req.params.lecturerId;

  const sql = `
    SELECT r.*, u.name AS lecturer_name 
    FROM reports r 
    JOIN users u ON r.lecturer_id = u.user_id 
    WHERE r.lecturer_id = ?
    ORDER BY r.created_at DESC
  `;
  
  db.query(sql, [lecturerId], (err, results) => {
    if (err) {
      console.error("Lecturer reports fetch error:", err);
      return res.status(500).json({ message: "Failed to fetch lecturer reports" });
    }
    res.json(results);
  });
});

// =============== LECTURERS ENDPOINTS =========================
app.get("/api/prl/lecturers", (req, res) => {
  let sql = "SELECT user_id, name, email, role FROM users WHERE role = 'lecturer'";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Lecturers fetch error:", err);
      return res.status(500).json({ message: "Failed to fetch lecturers" });
    }
    res.json(results);
  });
});

// Add lecturer
app.post("/api/prl/lecturers", (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const checkQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "Lecturer already exists" });
    }

    const tempPassword = "temp123";
    const insertQuery = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'lecturer')";
    
    db.query(insertQuery, [name, email, tempPassword], (err, result) => {
      if (err) {
        console.error("Lecturer insert error:", err);
        return res.status(500).json({ message: "Failed to add lecturer" });
      }

      res.json({ 
        message: "Lecturer added successfully", 
        lecturerId: result.insertId 
      });
    });
  });
});

// =============== STREAMS & MODULES ENDPOINTS =================
// Get all streams
app.get("/api/streams", (req, res) => {
  const streams = [
    { name: "Information Systems", code: "IS" },
    { name: "Information Technology", code: "IT" },
    { name: "Computer Science", code: "CS" },
    { name: "Software Engineering", code: "SE" }
  ];
  res.json(streams);
});

// Get all modules from all streams
app.get("/api/modules", (req, res) => {
  const queries = [
    "SELECT module_code, module_name, 'Information Systems' as stream FROM information_systems_modules",
    "SELECT module_code, module_name, 'Information Technology' as stream FROM information_technology_modules", 
    "SELECT module_code, module_name, 'Computer Science' as stream FROM computer_science_modules",
    "SELECT module_code, module_name, 'Software Engineering' as stream FROM software_engineering_modules"
  ];

  // Execute all queries and combine results
  const executeQuery = (query) => {
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  };

  Promise.all(queries.map(executeQuery))
    .then(results => {
      const allModules = [].concat(...results);
      res.json(allModules);
    })
    .catch(err => {
      console.error("Modules fetch error:", err);
      res.status(500).json({ message: "Failed to fetch modules" });
    });
});

// Get modules by specific stream
app.get("/api/modules/:stream", (req, res) => {
  const stream = req.params.stream;
  let tableName;

  switch(stream.toLowerCase()) {
    case 'information systems':
      tableName = 'information_systems_modules';
      break;
    case 'information technology':
      tableName = 'information_technology_modules';
      break;
    case 'computer science':
      tableName = 'computer_science_modules';
      break;
    case 'software engineering':
      tableName = 'software_engineering_modules';
      break;
    default:
      return res.status(400).json({ message: "Invalid stream name" });
  }

  const sql = `SELECT module_code, module_name FROM ${tableName}`;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Stream modules fetch error:", err);
      return res.status(500).json({ message: "Failed to fetch stream modules" });
    }
    res.json(results);
  });
});

// =============== COURSES ENDPOINTS =========================
app.get("/api/courses", (req, res) => {
  db.query("SELECT * FROM courses", (err, results) => {
    if (err) {
      console.error("Courses fetch error:", err);
      return res.status(500).json({ message: "Failed to fetch courses" });
    }
    res.json(results);
  });
});

// =============== START SERVER ======================
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));