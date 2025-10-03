import React, { useState, useEffect } from "react";
import "./PRLDashboard.css";

function PRLDashboard() {
  const [prl, setPRL] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [reports, setReports] = useState([]);
  const [performanceReports, setPerformanceReports] = useState([]);
  const [studentReports, setStudentReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  
  // Filter states
  const [filter, setFilter] = useState({
    lecturer: "",
    course: "",
    week: "",
    stream: ""
  });
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState("");
  
  // Streams and Modules Management
  const [streams, setStreams] = useState([
    {
      id: 1,
      name: "Information Technology (IT)",
      code: "IT",
      modules: [
        { id: 1, code: "IT101", name: "IT Fundamentals", credits: 12 },
        { id: 2, code: "IT102", name: "Network Infrastructure", credits: 12 },
        { id: 3, code: "IT103", name: "Database Management", credits: 12 },
        { id: 4, code: "IT104", name: "System Administration", credits: 12 },
        { id: 5, code: "IT105", name: "IT Project Management", credits: 12 }
      ]
    },
    {
      id: 2,
      name: "Software Engineering",
      code: "SE",
      modules: [
        { id: 6, code: "SE201", name: "Software Design Patterns", credits: 12 },
        { id: 7, code: "SE202", name: "Agile Development", credits: 12 },
        { id: 8, code: "SE203", name: "Testing & Quality Assurance", credits: 12 },
        { id: 9, code: "SE204", name: "Software Architecture", credits: 12 },
        { id: 10, code: "SE205", name: "DevOps Practices", credits: 12 }
      ]
    },
    {
      id: 3,
      name: "Information Systems",
      code: "IS",
      modules: [
        { id: 11, code: "IS301", name: "Business Analysis", credits: 12 },
        { id: 12, code: "IS302", name: "Enterprise Systems", credits: 12 },
        { id: 13, code: "IS303", name: "Data Analytics", credits: 12 },
        { id: 14, code: "IS304", name: "IT Governance", credits: 12 },
        { id: 15, code: "IS305", name: "Digital Transformation", credits: 12 }
      ]
    },
    {
      id: 4,
      name: "Computer Science",
      code: "CS",
      modules: [
        { id: 16, code: "CS401", name: "Algorithms & Data Structures", credits: 12 },
        { id: 17, code: "CS402", name: "Artificial Intelligence", credits: 12 },
        { id: 18, code: "CS403", name: "Machine Learning", credits: 12 },
        { id: 19, code: "CS404", name: "Computer Networks", credits: 12 },
        { id: 20, code: "CS405", name: "Cybersecurity Fundamentals", credits: 12 }
      ]
    }
  ]);

  // Manage lecturers and courses
  const [lecturers, setLecturers] = useState([]);
  const [showAddLecturer, setShowAddLecturer] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [newLecturer, setNewLecturer] = useState({ 
    name: "", 
    email: "", 
    stream: "" 
  });
  const [newModule, setNewModule] = useState({ 
    code: "", 
    name: "", 
    credits: 12, 
    stream: "" 
  });

  // Student reports state
  const [studentFeedback, setStudentFeedback] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setPRL(userData);
    
    // Load streams from localStorage
    const savedStreams = JSON.parse(localStorage.getItem('prlStreams')) || streams;
    setStreams(savedStreams);
    
    // Load data from backend/API
    loadLecturersFromBackend();
    loadReports();
    loadPerformanceReports();
    loadStudentReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [filter, reports]);

  // Fetch lecturers from actual backend database
  const loadLecturersFromBackend = async () => {
    try {
      const response = await fetch('/api/prl/lecturers');
      
      if (response.ok) {
        const lecturersData = await response.json();
        
        // Map database structure to frontend expected structure
        const mappedLecturers = lecturersData.map(lecturer => ({
          id: lecturer.lecturer_id || lecturer.user_id,
          name: lecturer.name,
          email: lecturer.email || `${lecturer.name.toLowerCase().replace(/\s+/g, '.')}@luct.ac.za`,
          faculty: lecturer.faculty_name || lecturer.faculty || "ICT",
          stream: lecturer.faculty_name || lecturer.faculty || "FICT"
        }));
        
        setLecturers(mappedLecturers);
      } else {
        console.error('Failed to fetch lecturers from backend');
        setLecturers([]);
      }
    } catch (error) {
      console.error('Error fetching lecturers from backend:', error);
      setLecturers([]);
    }
  };

  const loadReports = () => {
    const lecturerReports = JSON.parse(localStorage.getItem('lecturerReports')) || [];
    
    if (lecturerReports.length === 0) {
      const sampleReports = [
        {
          id: 1,
          lecturer_id: 1,
          lecturerName: "Dr. Sarah Johnson",
          facultyName: "ICT",
          className: "BIT-2A",
          courseName: "Web Application Development",
          courseCode: "DIWA2110",
          weekOfReporting: 6,
          dateOfLecture: "2024-03-15",
          students_present: 24,
          total_students: 30,
          venue: "Room 302",
          scheduled_time: "14:00",
          topic: "React Components and State Management",
          learning_outcomes: "Students learned to create functional components and manage state using hooks",
          recommendations: "More practice needed with useEffect hook",
          created_at: new Date().toISOString(),
          stream: "Software Engineering"
        },
        {
          id: 2,
          lecturer_id: 2,
          lecturerName: "Prof. Michael Brown",
          facultyName: "ICT",
          className: "BCS-2B",
          courseName: "Database Management",
          courseCode: "IT103",
          weekOfReporting: 6,
          dateOfLecture: "2024-03-16",
          students_present: 28,
          total_students: 32,
          venue: "Lab 201",
          scheduled_time: "10:00",
          topic: "SQL Queries and Normalization",
          learning_outcomes: "Students mastered basic SQL queries and understanding of database normalization",
          recommendations: "Need more practice with complex joins",
          created_at: new Date().toISOString(),
          stream: "Information Technology"
        }
      ];
      setReports(sampleReports);
      setFilteredReports(sampleReports);
    } else {
      setReports(lecturerReports);
      setFilteredReports(lecturerReports);
    }
  };

  const loadPerformanceReports = () => {
    const perfReports = JSON.parse(localStorage.getItem('performanceReports')) || [];
    setPerformanceReports(perfReports);
  };

  const loadStudentReports = () => {
    // ONLY load actual student reports from localStorage - no default samples
    const studentReports = JSON.parse(localStorage.getItem('studentReports')) || [];
    setStudentReports(studentReports);
  };

  // Lecturer Management
  const handleAddLecturer = async () => {
    if (!newLecturer.name || !newLecturer.email || !newLecturer.stream) {
      alert("Please fill in all fields");
      return;
    }

    try {
      // Send to backend API to add lecturer to database
      const response = await fetch('/api/prl/lecturers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newLecturer.name,
          email: newLecturer.email,
          faculty: newLecturer.stream
        }),
      });

      if (response.ok) {
        // Refresh lecturers list from backend database
        await loadLecturersFromBackend();
        
        setNewLecturer({ name: "", email: "", stream: "" });
        setShowAddLecturer(false);
        alert("Lecturer added successfully to database!");
      } else {
        const errorData = await response.json();
        alert(`Failed to add lecturer: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding lecturer:', error);
      alert("Failed to add lecturer. Please try again.");
    }
  };

  const handleRemoveLecturer = async (id) => {
    if (!window.confirm("Are you sure you want to remove this lecturer?")) {
      return;
    }

    try {
      // Remove from backend database
      const response = await fetch(`/api/lecturers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh lecturers list from backend database
        await loadLecturersFromBackend();
        alert("Lecturer removed successfully from database!");
      } else {
        throw new Error('Failed to remove lecturer from database');
      }
    } catch (error) {
      console.error('Error removing lecturer:', error);
      alert("Failed to remove lecturer. Please try again.");
    }
  };

  // Module Management
  const handleAddModule = () => {
    if (!newModule.code || !newModule.name || !newModule.stream) {
      alert("Please fill in all fields");
      return;
    }

    const updatedStreams = streams.map(stream => {
      if (stream.name === newModule.stream) {
        const newModuleObj = {
          id: Date.now(),
          code: newModule.code,
          name: newModule.name,
          credits: newModule.credits
        };
        return {
          ...stream,
          modules: [...stream.modules, newModuleObj]
        };
      }
      return stream;
    });

    setStreams(updatedStreams);
    localStorage.setItem('prlStreams', JSON.stringify(updatedStreams));
    
    setNewModule({ code: "", name: "", credits: 12, stream: "" });
    setShowAddModule(false);
    alert("Module added successfully!");
  };

  const handleRemoveModule = (streamId, moduleId) => {
    const updatedStreams = streams.map(stream => {
      if (stream.id === streamId) {
        return {
          ...stream,
          modules: stream.modules.filter(module => module.id !== moduleId)
        };
      }
      return stream;
    });

    setStreams(updatedStreams);
    localStorage.setItem('prlStreams', JSON.stringify(updatedStreams));
  };

  // Filter functions
  const filterReports = () => {
    let filtered = reports;

    if (filter.lecturer) {
      filtered = filtered.filter(report => 
        report.lecturerName.toLowerCase().includes(filter.lecturer.toLowerCase())
      );
    }

    if (filter.course) {
      filtered = filtered.filter(report => 
        report.courseCode.toLowerCase().includes(filter.course.toLowerCase()) ||
        report.courseName.toLowerCase().includes(filter.course.toLowerCase())
      );
    }

    if (filter.week) {
      filtered = filtered.filter(report => 
        report.weekOfReporting.toString() === filter.week
      );
    }

    if (filter.stream) {
      filtered = filtered.filter(report => 
        report.stream === filter.stream
      );
    }

    setFilteredReports(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Report Feedback
  const handleViewReport = (report) => {
    setSelectedReport(report);
    const existingFeedback = localStorage.getItem(`feedback_${report.id}`) || "";
    setFeedback(existingFeedback);
  };

  const handleSubmitFeedback = () => {
    if (!selectedReport) return;

    localStorage.setItem(`feedback_${selectedReport.id}`, feedback);
    
    const updatedReports = reports.map(report => 
      report.id === selectedReport.id 
        ? { ...report, prl_feedback: feedback, feedback_date: new Date().toISOString() }
        : report
    );
    
    setReports(updatedReports);
    setFilteredReports(updatedReports);
    
    // Also update in localStorage
    localStorage.setItem('lecturerReports', JSON.stringify(updatedReports));
    
    alert("Feedback submitted successfully!");
    setSelectedReport(null);
    setFeedback("");
  };

  // Student Report Management
  const handleViewStudentReport = (report) => {
    setSelectedReport(report);
    const existingFeedback = localStorage.getItem(`student_feedback_${report.id}`) || "";
    setStudentFeedback(existingFeedback);
  };

  const handleSubmitStudentFeedback = () => {
    if (!selectedReport) return;

    localStorage.setItem(`student_feedback_${selectedReport.id}`, studentFeedback);
    
    const updatedStudentReports = studentReports.map(report => 
      report.id === selectedReport.id 
        ? { 
            ...report, 
            prl_feedback: studentFeedback, 
            feedback_date: new Date().toISOString(),
            status: studentFeedback ? "reviewed" : report.status
          }
        : report
    );
    
    setStudentReports(updatedStudentReports);
    localStorage.setItem('studentReports', JSON.stringify(updatedStudentReports));
    
    alert("Feedback submitted to student!");
    setSelectedReport(null);
    setStudentFeedback("");
  };

  // Performance Report Management
  const handleViewPerformanceReport = (report) => {
    setSelectedReport(report);
    const existingFeedback = localStorage.getItem(`performance_feedback_${report.id}`) || "";
    setFeedback(existingFeedback);
  };

  const handleSubmitPerformanceFeedback = () => {
    if (!selectedReport) return;

    localStorage.setItem(`performance_feedback_${selectedReport.id}`, feedback);
    
    const updatedPerformanceReports = performanceReports.map(report => 
      report.id === selectedReport.id 
        ? { ...report, prl_feedback: feedback, feedback_date: new Date().toISOString() }
        : report
    );
    
    setPerformanceReports(updatedPerformanceReports);
    localStorage.setItem('performanceReports', JSON.stringify(updatedPerformanceReports));
    
    alert("Feedback submitted to lecturer!");
    setSelectedReport(null);
    setFeedback("");
  };

  // Statistics
  const getDashboardStats = () => {
    const totalLecturers = lecturers.length;
    const totalModules = streams.reduce((sum, stream) => sum + stream.modules.length, 0);
    const totalReports = reports.length;
    const pendingStudentReports = studentReports.filter(report => report.status === 'pending').length;
    const totalPerformanceReports = performanceReports.length;

    return {
      totalLecturers,
      totalModules,
      totalReports,
      pendingStudentReports,
      totalPerformanceReports,
      streams: streams.length
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!prl) {
    return <div className="loading">Loading PRL information...</div>;
  }

  const stats = getDashboardStats();

  return (
    <div className="prl-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>LUCT Principal Lecturer Portal</h1>
          <div className="user-info">
            <span>Welcome, <strong>{prl.name}</strong> (PRL)</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === "streams" ? "active" : ""}`}
          onClick={() => setActiveTab("streams")}
        >
          🎓 Streams & Modules
        </button>
        <button 
          className={`tab ${activeTab === "lecturers" ? "active" : ""}`}
          onClick={() => setActiveTab("lecturers")}
        >
          👨‍🏫 Lecturers
        </button>
        <button 
          className={`tab ${activeTab === "lecturer-reports" ? "active" : ""}`}
          onClick={() => setActiveTab("lecturer-reports")}
        >
          📋 Lecturer Reports
        </button>
        <button 
          className={`tab ${activeTab === "performance-reports" ? "active" : ""}`}
          onClick={() => setActiveTab("performance-reports")}
        >
          📈 Performance Reports
        </button>
        <button 
          className={`tab ${activeTab === "student-reports" ? "active" : ""}`}
          onClick={() => setActiveTab("student-reports")}
        >
          🎒 Student Reports
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>👑 Principal Lecturer Dashboard</h2>
          <div className="prl-details">
            <p><strong>Name:</strong> {prl.name}</p>
            <p><strong>Email:</strong> {prl.email}</p>
            <p><strong>Faculty:</strong> {prl.faculty_name || "ICT"}</p>
            <p><strong>Role:</strong> Principal Lecturer (PRL)</p>
            <p><strong>Streams:</strong> {stats.streams} • <strong>Modules:</strong> {stats.totalModules} • <strong>Lecturers:</strong> {stats.totalLecturers}</p>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="tab-content">
            <div className="overview-dashboard">
              <h3>📊 Streams Overview</h3>
              
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🎓</div>
                  <div className="stat-info">
                    <h4>Streams</h4>
                    <div className="stat-number">{stats.streams}</div>
                    <p>Academic streams</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-info">
                    <h4>Modules</h4>
                    <div className="stat-number">{stats.totalModules}</div>
                    <p>Total modules</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">👨‍🏫</div>
                  <div className="stat-info">
                    <h4>Lecturers</h4>
                    <div className="stat-number">{stats.totalLecturers}</div>
                    <p>Teaching staff</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-info">
                    <h4>Reports</h4>
                    <div className="stat-number">{stats.totalReports}</div>
                    <p>Lecturer reports</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-info">
                    <h4>Performance</h4>
                    <div className="stat-number">{stats.totalPerformanceReports}</div>
                    <p>Performance reports</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🎒</div>
                  <div className="stat-info">
                    <h4>Student Reports</h4>
                    <div className="stat-number">{stats.pendingStudentReports}</div>
                    <p>Pending review</p>
                  </div>
                </div>
              </div>

              {/* Streams Summary */}
              <div className="streams-summary">
                <h4>Streams Summary</h4>
                <div className="streams-grid">
                  {streams.map(stream => (
                    <div key={stream.id} className="stream-card">
                      <h5>{stream.name}</h5>
                      <div className="stream-stats">
                        <span>{stream.modules.length} Modules</span>
                        <span>
                          {lecturers.filter(lect => lect.stream === stream.name).length} Lecturers
                        </span>
                      </div>
                      <div className="modules-preview">
                        {stream.modules.slice(0, 3).map(module => (
                          <div key={module.id} className="module-tag">
                            {module.code}
                          </div>
                        ))}
                        {stream.modules.length > 3 && (
                          <div className="module-tag more">
                            +{stream.modules.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STREAMS & MODULES TAB */}
        {activeTab === "streams" && (
          <div className="tab-content">
            <div className="streams-management">
              <div className="section-header">
                <h3>🎓 Streams & Modules Management</h3>
                <button 
                  onClick={() => setShowAddModule(true)}
                  className="add-btn"
                >
                  + Add Module
                </button>
              </div>

              <div className="streams-list">
                {streams.map(stream => (
                  <div key={stream.id} className="stream-card detailed">
                    <div className="stream-header">
                      <h4>{stream.name} ({stream.code})</h4>
                      <span className="module-count">{stream.modules.length} modules</span>
                    </div>
                    
                    <div className="modules-list">
                      <h5>Modules:</h5>
                      {stream.modules.length === 0 ? (
                        <p className="no-modules">No modules added yet.</p>
                      ) : (
                        <div className="modules-grid">
                          {stream.modules.map(module => (
                            <div key={module.id} className="module-card">
                              <div className="module-info">
                                <strong>{module.code}</strong>
                                <span>{module.name}</span>
                                <small>{module.credits} Credits</small>
                              </div>
                              <button 
                                onClick={() => handleRemoveModule(stream.id, module.id)}
                                className="remove-btn small"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LECTURERS TAB */}
        {activeTab === "lecturers" && (
          <div className="tab-content">
            <div className="lecturers-management">
              <div className="section-header">
                <h3>👨‍🏫 Lecturers Management</h3>
                <button 
                  onClick={() => setShowAddLecturer(true)}
                  className="add-btn"
                >
                  + Add Lecturer
                </button>
              </div>

              <div className="lecturers-grid">
                {lecturers.length === 0 ? (
                  <p>Loading lecturers from database...</p>
                ) : (
                  lecturers.map(lecturer => (
                    <div key={lecturer.id} className="lecturer-card">
                      <div className="lecturer-avatar">
                        {lecturer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="lecturer-info">
                        <h5>{lecturer.name}</h5>
                        <p>{lecturer.email}</p>
                        <div className="lecturer-meta">
                          <span className="stream-badge">{lecturer.stream}</span>
                          <span className="faculty">{lecturer.faculty}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveLecturer(lecturer.id)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* LECTURER REPORTS TAB */}
        {activeTab === "lecturer-reports" && (
          <div className="tab-content">
            <div className="reports-management">
              <h3>📋 Lecturer Reports</h3>
              
              {/* Filters */}
              <div className="filters-section">
                <div className="filter-controls">
                  <div className="filter-group">
                    <label>Lecturer</label>
                    <select name="lecturer" value={filter.lecturer} onChange={handleFilterChange}>
                      <option value="">All Lecturers</option>
                      {lecturers.map(lecturer => (
                        <option key={lecturer.id} value={lecturer.name}>{lecturer.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Stream</label>
                    <select name="stream" value={filter.stream} onChange={handleFilterChange}>
                      <option value="">All Streams</option>
                      {streams.map(stream => (
                        <option key={stream.id} value={stream.name}>{stream.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Week</label>
                    <select name="week" value={filter.week} onChange={handleFilterChange}>
                      <option value="">All Weeks</option>
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(week => (
                        <option key={week} value={week}>Week {week}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Reports List */}
              <div className="reports-list-section">
                <h4>Reports ({filteredReports.length})</h4>
                {filteredReports.length === 0 ? (
                  <p>No reports found matching your filters.</p>
                ) : (
                  <div className="reports-grid">
                    {filteredReports.map(report => (
                      <div key={report.id} className="report-card">
                        <div className="report-header">
                          <div className="report-title">
                            <strong>{report.courseCode}</strong> - {report.className}
                            <div className="report-meta">
                              <span>by {report.lecturerName}</span>
                              <span className="stream-tag">{report.stream}</span>
                            </div>
                          </div>
                          <div className="report-dates">
                            <span>Week {report.weekOfReporting}</span>
                            <span>{new Date(report.dateOfLecture).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="report-details">
                          <p><strong>Topic:</strong> {report.topic}</p>
                          <p><strong>Attendance:</strong> {report.students_present}/{report.total_students}</p>
                          <p><strong>Venue:</strong> {report.venue} at {report.scheduled_time}</p>
                          <p><strong>Learning Outcomes:</strong> {report.learning_outcomes}</p>
                          {report.recommendations && (
                            <p><strong>Lecturer Recommendations:</strong> {report.recommendations}</p>
                          )}
                          {report.prl_feedback && (
                            <div className="feedback-display">
                              <strong>Your Feedback:</strong> {report.prl_feedback}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => handleViewReport(report)}
                          className="feedback-btn"
                        >
                          {report.prl_feedback ? "View/Edit Feedback" : "Add Feedback"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PERFORMANCE REPORTS TAB */}
        {activeTab === "performance-reports" && (
          <div className="tab-content">
            <div className="performance-reports-management">
              <h3>📈 Performance Reports from Lecturers</h3>
              
              <div className="reports-list-section">
                {performanceReports.length === 0 ? (
                  <p>No performance reports received yet.</p>
                ) : (
                  <div className="reports-grid">
                    {performanceReports.map(report => (
                      <div key={report.id} className="report-card performance">
                        <div className="report-header">
                          <div className="report-title">
                            <strong>Performance Report</strong>
                            <div className="report-meta">
                              <span>by {report.lecturer_name}</span>
                              <span>{new Date(report.report_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="report-stats">
                            <span>Total Students: <strong>{report.performance_summary?.totalStudents}</strong></span>
                            <span>High Performers: <strong>{report.performance_summary?.highPerformerCount}</strong></span>
                            <span>Needing Support: <strong>{report.performance_summary?.interventionNeeded}</strong></span>
                          </div>
                        </div>
                        <div className="report-details">
                          {report.recommendations && (
                            <div className="recommendations">
                              <strong>Lecturer Recommendations:</strong>
                              <ul>
                                {report.recommendations.map((rec, index) => (
                                  <li key={index}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {report.prl_feedback && (
                            <div className="feedback-display">
                              <strong>Your Feedback:</strong> {report.prl_feedback}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => handleViewPerformanceReport(report)}
                          className="feedback-btn"
                        >
                          {report.prl_feedback ? "View/Edit Feedback" : "Provide Feedback"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STUDENT REPORTS TAB */}
        {activeTab === "student-reports" && (
          <div className="tab-content">
            <div className="student-reports-management">
              <h3>🎒 Student Reports & Feedback</h3>
              
              <div className="reports-list-section">
                {studentReports.length === 0 ? (
                  <p>No student reports received yet.</p>
                ) : (
                  <div className="reports-grid">
                    {studentReports.map(report => (
                      <div key={report.id} className={`report-card student ${report.status}`}>
                        <div className="report-header">
                          <div className="report-title">
                            <strong>{report.reportType}</strong>
                            <div className="report-meta">
                              <span>{report.studentName} ({report.studentId})</span>
                              <span className="stream-tag">{report.stream}</span>
                              <span className={`status-badge ${report.status}`}>
                                {report.status}
                              </span>
                            </div>
                          </div>
                          <div className="report-dates">
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="report-details">
                          <p><strong>Subject:</strong> {report.subject}</p>
                          <p><strong>Message:</strong> {report.message}</p>
                          <p><strong>Programme:</strong> {report.programme} - Year {report.year}</p>
                          {report.prl_feedback && (
                            <div className="feedback-display">
                              <strong>Your Response:</strong> {report.prl_feedback}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => handleViewStudentReport(report)}
                          className="feedback-btn"
                        >
                          {report.prl_feedback ? "View/Edit Response" : "Respond to Student"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Lecturer Modal */}
      {showAddLecturer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>👨‍🏫 Add New Lecturer</h3>
            <div className="form-group">
              <label>Lecturer Name *</label>
              <input
                type="text"
                value={newLecturer.name}
                onChange={(e) => setNewLecturer({...newLecturer, name: e.target.value})}
                placeholder="Dr. John Smith"
              />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={newLecturer.email}
                onChange={(e) => setNewLecturer({...newLecturer, email: e.target.value})}
                placeholder="john.smith@luct.ac.za"
              />
            </div>
            <div className="form-group">
              <label>Stream *</label>
              <select
                value={newLecturer.stream}
                onChange={(e) => setNewLecturer({...newLecturer, stream: e.target.value})}
              >
                <option value="">Select Stream</option>
                {streams.map(stream => (
                  <option key={stream.id} value={stream.name}>{stream.name}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddLecturer(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleAddLecturer} className="submit-btn">Add Lecturer</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>📚 Add New Module</h3>
            <div className="form-group">
              <label>Module Code *</label>
              <input
                type="text"
                value={newModule.code}
                onChange={(e) => setNewModule({...newModule, code: e.target.value})}
                placeholder="IT101"
              />
            </div>
            <div className="form-group">
              <label>Module Name *</label>
              <input
                type="text"
                value={newModule.name}
                onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                placeholder="IT Fundamentals"
              />
            </div>
            <div className="form-group">
              <label>Credits</label>
              <select
                value={newModule.credits}
                onChange={(e) => setNewModule({...newModule, credits: parseInt(e.target.value)})}
              >
                <option value={12}>12 Credits</option>
                <option value={24}>24 Credits</option>
                <option value={36}>36 Credits</option>
              </select>
            </div>
            <div className="form-group">
              <label>Stream *</label>
              <select
                value={newModule.stream}
                onChange={(e) => setNewModule({...newModule, stream: e.target.value})}
              >
                <option value="">Select Stream</option>
                {streams.map(stream => (
                  <option key={stream.id} value={stream.name}>{stream.name}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddModule(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleAddModule} className="submit-btn">Add Module</button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modals */}
      {selectedReport && activeTab === "lecturer-reports" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>💬 Provide Feedback to Lecturer</h3>
            <div className="report-preview">
              <p><strong>Lecturer:</strong> {selectedReport.lecturerName}</p>
              <p><strong>Course:</strong> {selectedReport.courseCode} - {selectedReport.courseName}</p>
              <p><strong>Week:</strong> {selectedReport.weekOfReporting}</p>
              <p><strong>Topic:</strong> {selectedReport.topic}</p>
            </div>
            <div className="feedback-form">
              <label>Your Feedback/Recommendations:</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback, recommendations, or approvals for this lecture report..."
                rows="6"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setSelectedReport(null)} className="cancel-btn">Cancel</button>
              <button onClick={handleSubmitFeedback} className="submit-btn">Submit Feedback</button>
            </div>
          </div>
        </div>
      )}

      {selectedReport && activeTab === "performance-reports" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>💬 Provide Feedback on Performance Report</h3>
            <div className="report-preview">
              <p><strong>Lecturer:</strong> {selectedReport.lecturer_name}</p>
              <p><strong>Report Date:</strong> {new Date(selectedReport.report_date).toLocaleDateString()}</p>
              <p><strong>Total Students:</strong> {selectedReport.performance_summary?.totalStudents}</p>
            </div>
            <div className="feedback-form">
              <label>Your Feedback:</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback on the performance report and recommendations..."
                rows="6"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setSelectedReport(null)} className="cancel-btn">Cancel</button>
              <button onClick={handleSubmitPerformanceFeedback} className="submit-btn">Submit Feedback</button>
            </div>
          </div>
        </div>
      )}

      {selectedReport && activeTab === "student-reports" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>💬 Respond to Student Report</h3>
            <div className="report-preview">
              <p><strong>Student:</strong> {selectedReport.studentName} ({selectedReport.studentId})</p>
              <p><strong>Programme:</strong> {selectedReport.programme} - Year {selectedReport.year}</p>
              <p><strong>Report Type:</strong> {selectedReport.reportType}</p>
              <p><strong>Subject:</strong> {selectedReport.subject}</p>
              <p><strong>Message:</strong> {selectedReport.message}</p>
            </div>
            <div className="feedback-form">
              <label>Your Response to Student:</label>
              <textarea
                value={studentFeedback}
                onChange={(e) => setStudentFeedback(e.target.value)}
                placeholder="Provide your response, solution, or feedback to the student..."
                rows="6"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setSelectedReport(null)} className="cancel-btn">Cancel</button>
              <button onClick={handleSubmitStudentFeedback} className="submit-btn">Send Response</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PRLDashboard;