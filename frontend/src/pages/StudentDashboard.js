import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import "./StudentDashboard.css";

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("attendance");
  const [ratings, setRatings] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Rating form state
  const [ratingForm, setRatingForm] = useState({
    moduleName: "",
    moduleCode: "",
    programme: "",
    yearOfStudy: "",
    lecturerId: "",
    lecturerName: "",
    ratings: {
      teachingQuality: 0,
      preparation: 0,
      support: 0,
      fairness: 0,
      engagement: 0,
    },
    comments: "",
  });

  // Attendance form state
  const [attendanceForm, setAttendanceForm] = useState({
    stream: "",
    moduleCode: "",
    moduleName: "",
    date: "",
    lecturerId: "",
    lecturerName: "",
    topic: "",
    status: "present"
  });

  // PRL Report form state
  const [reportForm, setReportForm] = useState({
    reportType: "academic",
    subject: "",
    message: "",
    urgency: "medium"
  });

  // Dropdown data
  const [lecturersList, setLecturersList] = useState([]);
  const [lecturersLoading, setLecturersLoading] = useState(false);
  const [streams, setStreams] = useState([]);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  // Load student + lecturers + ratings on mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setStudent(userData);

    if (userData) {
      loadLecturers();
      loadStudentRatings(userData.user_id);
      loadStudentAttendance(userData.user_id);
      loadStreams();
    }
  }, []);

  // Fetch ratings for this student - ONLY THEIR OWN
  const loadStudentRatings = async (studentId) => {
    try {
      setLoading(true);
      const ratingsData = await apiService.getRatingsByStudent(studentId);
      setRatings(Array.isArray(ratingsData) ? ratingsData : []);
    } catch (err) {
      console.error("Error loading ratings:", err);
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance for this student - ONLY THEIR OWN
  const loadStudentAttendance = async (studentId) => {
    try {
      setAttendanceLoading(true);
      const allAttendance = JSON.parse(localStorage.getItem('studentAttendance')) || [];
      const studentAttendance = allAttendance.filter(
        record => String(record.student_id) === String(studentId)
      );
      setAttendance(studentAttendance);
    } catch (err) {
      console.error("Error loading attendance:", err);
      setAttendance([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Fetch lecturers for dropdown
  const loadLecturers = async () => {
    try {
      setLecturersLoading(true);
      const data = await apiService.getLecturers();
      setLecturersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading lecturers:", err);
      setLecturersList([]);
    } finally {
      setLecturersLoading(false);
    }
  };

  // Load available streams
  const loadStreams = async () => {
    try {
      const streamsData = await apiService.getStreams();
      setStreams(Array.isArray(streamsData) ? streamsData : []);
    } catch (err) {
      console.error("Error loading streams:", err);
      setStreams([]);
    }
  };

  // Load modules based on selected stream
  const loadModulesByStream = async (streamName) => {
    if (!streamName) {
      setModules([]);
      return;
    }

    try {
      setModulesLoading(true);
      const modulesData = await apiService.getModulesByStream(streamName);
      setModules(Array.isArray(modulesData) ? modulesData : []);
    } catch (err) {
      console.error("Error loading modules:", err);
      setModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  // Handle rating changes
  const handleRatingChange = (criterion, value) => {
    setRatingForm((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [criterion]: parseInt(value),
      },
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRatingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAttendanceChange = (e) => {
    const { name, value } = e.target;
    setAttendanceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReportForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLecturerSelect = (e) => {
    const selectedId = e.target.value;
    const lecturer = lecturersList.find(
      (l) => String(l.user_id) === String(selectedId)
    );
    setRatingForm((prev) => ({
      ...prev,
      lecturerId: selectedId,
      lecturerName: lecturer ? lecturer.name : "",
    }));
  };

  const handleAttendanceLecturerSelect = (e) => {
    const selectedId = e.target.value;
    const lecturer = lecturersList.find(
      (l) => String(l.user_id) === String(selectedId)
    );
    setAttendanceForm((prev) => ({
      ...prev,
      lecturerId: selectedId,
      lecturerName: lecturer ? lecturer.name : "",
    }));
  };

  // Handle stream selection change
  const handleStreamChange = (e) => {
    const stream = e.target.value;
    setAttendanceForm(prev => ({
      ...prev,
      stream: stream,
      moduleCode: "",
      moduleName: ""
    }));
    
    // Load modules for the selected stream
    loadModulesByStream(stream);
  };

  // Handle module selection
  const handleModuleSelect = (e) => {
    const selectedCode = e.target.value;
    const module = modules.find(m => m.module_code === selectedCode);
    if (module) {
      setAttendanceForm(prev => ({
        ...prev,
        moduleCode: module.module_code,
        moduleName: module.module_name
      }));
    }
  };

  // Submit Attendance
  const handleSubmitAttendance = async (e) => {
    e.preventDefault();

    if (!attendanceForm.stream || !attendanceForm.moduleCode || !attendanceForm.date || !attendanceForm.lecturerId) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const attendanceData = {
        student_id: student.user_id,
        student_name: student.name,
        ...attendanceForm,
        submitted_at: new Date().toISOString()
      };

      // Save to localStorage
      const existingAttendance = JSON.parse(localStorage.getItem('studentAttendance')) || [];
      const newAttendance = {
        id: Date.now(),
        ...attendanceData
      };
      
      const updatedAttendance = [...existingAttendance, newAttendance];
      localStorage.setItem('studentAttendance', JSON.stringify(updatedAttendance));
      
      alert("Attendance submitted successfully!");
      
      // Update local state - only show this student's attendance
      setAttendance(prev => [newAttendance, ...prev]);
      
      // Reset form
      setAttendanceForm({
        stream: "",
        moduleCode: "",
        moduleName: "",
        date: "",
        lecturerId: "",
        lecturerName: "",
        topic: "",
        status: "present"
      });

    } catch (err) {
      alert("Failed to submit attendance: " + (err.message || "Unknown error"));
      console.error("Attendance submission error:", err);
    }
  };

  // Submit Rating
  const handleSubmitRating = async (e) => {
    e.preventDefault();

    if (
      !ratingForm.moduleName ||
      !ratingForm.moduleCode ||
      !ratingForm.lecturerId ||
      !ratingForm.lecturerName ||
      !ratingForm.programme ||
      !ratingForm.yearOfStudy
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const hasRating = Object.values(ratingForm.ratings).some((r) => r > 0);
    if (!hasRating) {
      alert("Please provide at least one rating");
      return;
    }

    try {
      const ratingsArray = Object.values(ratingForm.ratings).filter((r) => r > 0);
      const averageRating =
        ratingsArray.length > 0
          ? Math.round(ratingsArray.reduce((a, b) => a + b) / ratingsArray.length)
          : 0;

      const ratingData = {
        student_id: student.user_id,
        lecturer_id: ratingForm.lecturerId,
        lecturer_name: ratingForm.lecturerName,
        module_name: ratingForm.moduleName,
        module_code: ratingForm.moduleCode,
        programme: ratingForm.programme,
        year_of_study: ratingForm.yearOfStudy,
        rating: averageRating,
        comments: ratingForm.comments || "No additional comments"
      };

      const result = await apiService.addRating(ratingData);
      
      if (result.message === "Rating added successfully") {
        alert("Rating submitted successfully!");
        
        // Reload ratings
        await loadStudentRatings(student.user_id);
        
        // Reset form
        setRatingForm({
          moduleName: "",
          moduleCode: "",
          programme: "",
          yearOfStudy: "",
          lecturerId: "",
          lecturerName: "",
          ratings: {
            teachingQuality: 0,
            preparation: 0,
            support: 0,
            fairness: 0,
            engagement: 0,
          },
          comments: "",
        });
      } else {
        alert("Failed to submit rating");
      }
    } catch (err) {
      alert("Failed to submit rating: " + (err.message || "Unknown error"));
      console.error("Rating submission error:", err);
    }
  };

  // Submit Report to PRL
  const handleSubmitReport = async (e) => {
    e.preventDefault();

    if (!reportForm.subject || !reportForm.message) {
      alert("Please fill in subject and message");
      return;
    }

    try {
      const reportData = {
        id: Date.now(),
        student_id: student.user_id,
        student_name: student.name,
        student_email: student.email,
        programme: "Not specified",
        year: "2nd Year",
        ...reportForm,
        status: "pending",
        created_at: new Date().toISOString()
      };

      // Save to localStorage for PRL to access
      const existingReports = JSON.parse(localStorage.getItem('studentReports')) || [];
      const updatedReports = [...existingReports, reportData];
      localStorage.setItem('studentReports', JSON.stringify(updatedReports));

      alert("Report submitted to PRL successfully!");
      
      // Reset form
      setReportForm({
        reportType: "academic",
        subject: "",
        message: "",
        urgency: "medium"
      });

    } catch (err) {
      alert("Failed to submit report: " + (err.message || "Unknown error"));
      console.error("Report submission error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Function to render stars
  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  // Statistics
  const getStudentStats = () => {
    const totalRatings = ratings.length;
    const totalAttendance = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0;

    return {
      totalRatings,
      totalAttendance,
      attendanceRate: `${attendanceRate}%`,
      presentCount
    };
  };

  if (!student) {
    return <div className="loading">Loading student information...</div>;
  }

  const stats = getStudentStats();

  return (
    <div className="student-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>LUCT Student Portal</h1>
          <div className="user-info">
            <span>
              Welcome, <strong>{student.name}</strong>
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance
        </button>
        <button 
          className={`tab ${activeTab === "ratings" ? "active" : ""}`}
          onClick={() => setActiveTab("ratings")}
        >
          Rate Lecturers
        </button>
        <button 
          className={`tab ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          Report to PRL
        </button>
        <button 
          className={`tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          My History
        </button>
      </div>

      <div className="dashboard-content">
        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>Student Dashboard</h2>
          <div className="student-details">
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Role:</strong> Student</p>
            <p>
              <strong>Attendance:</strong> {stats.presentCount}/{stats.totalAttendance} ({stats.attendanceRate}) • 
              <strong> Ratings:</strong> {stats.totalRatings}
            </p>
          </div>
        </div>

        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <div className="tab-content">
            <div className="attendance-section">
              <div className="section-header">
                <h3>Mark Your Attendance</h3>
                <div className="attendance-stats">
                  <span>Current Rate: <strong>{stats.attendanceRate}</strong></span>
                </div>
              </div>

              <form onSubmit={handleSubmitAttendance} className="attendance-form">
                {/* Stream Selection */}
                <div className="form-group">
                  <label>Stream *</label>
                  <select
                    name="stream"
                    value={attendanceForm.stream}
                    onChange={handleStreamChange}
                    required
                  >
                    <option value="">Select Stream</option>
                    {streams.map(stream => (
                      <option key={stream.code} value={stream.name}>
                        {stream.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Module Selection - Only show when stream is selected */}
                {attendanceForm.stream && (
                  <div className="form-group">
                    <label>Module *</label>
                    <select
                      name="moduleCode"
                      value={attendanceForm.moduleCode}
                      onChange={handleModuleSelect}
                      required
                      disabled={modulesLoading}
                    >
                      <option value="">{modulesLoading ? "Loading modules..." : "Select Module"}</option>
                      {modules.map(module => (
                        <option key={module.module_code} value={module.module_code}>
                          {module.module_name} ({module.module_code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Module Name (auto-filled) */}
                {attendanceForm.moduleCode && (
                  <div className="form-group">
                    <label>Module Name *</label>
                    <input
                      type="text"
                      name="moduleName"
                      placeholder="Auto-filled from module selection"
                      value={attendanceForm.moduleName}
                      readOnly
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Lecture *</label>
                    <input
                      type="date"
                      name="date"
                      value={attendanceForm.date}
                      onChange={handleAttendanceChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Lecturer *</label>
                    <select
                      name="lecturerId"
                      value={attendanceForm.lecturerId}
                      onChange={handleAttendanceLecturerSelect}
                      required
                    >
                      <option value="">Select Lecturer</option>
                      {lecturersLoading ? (
                        <option value="">Loading lecturers...</option>
                      ) : (
                        lecturersList.map((lect) => (
                          <option key={lect.user_id} value={lect.user_id}>
                            {lect.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Lecturer Name (auto-filled) */}
                {attendanceForm.lecturerId && (
                  <div className="form-group">
                    <label>Lecturer Name *</label>
                    <input
                      type="text"
                      name="lecturerName"
                      placeholder="Auto-filled from lecturer selection"
                      value={attendanceForm.lecturerName}
                      readOnly
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Topic Covered</label>
                  <input
                    type="text"
                    name="topic"
                    placeholder="e.g., React Components, Database Design..."
                    value={attendanceForm.topic}
                    onChange={handleAttendanceChange}
                  />
                </div>

                <div className="form-group">
                  <label>Attendance Status *</label>
                  <div className="status-options">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="status"
                        value="present"
                        checked={attendanceForm.status === "present"}
                        onChange={handleAttendanceChange}
                      />
                      <span className="status-present">Present</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="status"
                        value="absent"
                        checked={attendanceForm.status === "absent"}
                        onChange={handleAttendanceChange}
                      />
                      <span className="status-absent">Absent</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="submit-btn">
                  Submit Attendance
                </button>
              </form>

              {/* Recent Attendance - ONLY USER'S OWN DATA */}
              <div className="recent-attendance">
                <h4>My Attendance Records ({attendance.length})</h4>
                {attendanceLoading ? (
                  <p>Loading attendance records...</p>
                ) : attendance.length === 0 ? (
                  <div className="empty-state">
                    <p>No attendance records yet.</p>
                    <p className="empty-subtitle">Mark your first attendance using the form above.</p>
                  </div>
                ) : (
                  <div className="attendance-list">
                    {attendance.map(record => (
                      <div key={record.id} className={`attendance-card ${record.status}`}>
                        <div className="attendance-header">
                          <strong>{record.moduleCode}</strong>
                          <span className={`status-badge ${record.status}`}>
                            {record.status === 'present' ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="attendance-details">
                          <p><strong>Stream:</strong> {record.stream}</p>
                          <p><strong>Module:</strong> {record.moduleName}</p>
                          <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
                          <p><strong>Lecturer:</strong> {record.lecturerName}</p>
                          {record.topic && <p><strong>Topic:</strong> {record.topic}</p>}
                          <p><strong>Submitted:</strong> {new Date(record.submitted_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RATINGS TAB */}
        {activeTab === "ratings" && (
          <div className="tab-content">
            <div className="rating-form-section">
              <h3>Rate a Lecturer</h3>
              <form onSubmit={handleSubmitRating} className="rating-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Module Name *</label>
                    <input
                      type="text"
                      name="moduleName"
                      placeholder="e.g., Web Development"
                      value={ratingForm.moduleName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Module Code *</label>
                    <input
                      type="text"
                      name="moduleCode"
                      placeholder="e.g., DIWA2110"
                      value={ratingForm.moduleCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Programme *</label>
                    <input
                      type="text"
                      name="programme"
                      placeholder="e.g., BIT, DIT"
                      value={ratingForm.programme}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Year of Study *</label>
                    <select
                      name="yearOfStudy"
                      value={ratingForm.yearOfStudy}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                {/* Lecturer dropdown */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Lecturer *</label>
                    <select
                      name="lecturerId"
                      value={ratingForm.lecturerId}
                      onChange={handleLecturerSelect}
                      required
                    >
                      <option value="">Select Lecturer</option>
                      {lecturersLoading ? (
                        <option value="">Loading lecturers...</option>
                      ) : (
                        lecturersList.map((lect) => (
                          <option key={lect.user_id} value={lect.user_id}>
                            {lect.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Lecturer Name *</label>
                    <input
                      type="text"
                      name="lecturerName"
                      placeholder="Lecturer name (auto-filled)"
                      value={ratingForm.lecturerName}
                      readOnly
                    />
                  </div>
                </div>

                {/* Rating Criteria */}
                <div className="rating-criteria">
                  <h4>Rate the Lecturer (1-5):</h4>
                  <div className="criteria-grid">
                    {[
                      ["teachingQuality", "Teaching Quality & Clarity"],
                      ["preparation", "Preparation & Organization"],
                      ["support", "Support & Availability"],
                      ["fairness", "Fairness & Respect"],
                      ["engagement", "Engagement & Participation"],
                    ].map(([field, label]) => (
                      <div className="criterion-card" key={field}>
                        <label className="criterion-label">{label}</label>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <label key={num} className="star-label">
                              <input
                                type="radio"
                                name={field}
                                value={num}
                                checked={ratingForm.ratings[field] === num}
                                onChange={() => handleRatingChange(field, num)}
                                className="star-input"
                              />
                              <span className="star">{num}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Additional Comments (Optional)</label>
                  <textarea
                    name="comments"
                    placeholder="Any additional feedback for the lecturer..."
                    rows="3"
                    value={ratingForm.comments}
                    onChange={handleInputChange}
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Submit Rating
                </button>
              </form>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="tab-content">
            <div className="report-section">
              <h3>Send Report to PRL</h3>
              <p className="report-description">
                Use this form to report any academic issues, concerns, or suggestions directly to the Principal Lecturer (PRL).
              </p>

              <form onSubmit={handleSubmitReport} className="report-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Report Type *</label>
                    <select
                      name="reportType"
                      value={reportForm.reportType}
                      onChange={handleReportChange}
                      required
                    >
                      <option value="academic">Academic Concern</option>
                      <option value="administrative">Administrative Issue</option>
                      <option value="facility">Facility/Infrastructure</option>
                      <option value="suggestion">Suggestion/Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Urgency Level</label>
                    <select
                      name="urgency"
                      value={reportForm.urgency}
                      onChange={handleReportChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Brief subject of your report..."
                    value={reportForm.subject}
                    onChange={handleReportChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Detailed Message *</label>
                  <textarea
                    name="message"
                    placeholder="Please provide detailed information about your concern, issue, or suggestion..."
                    rows="6"
                    value={reportForm.message}
                    onChange={handleReportChange}
                    required
                  />
                </div>

                <div className="form-info">
                  <p><strong>Note:</strong> Your report will be sent directly to the PRL who will review it and provide feedback.</p>
                </div>

                <button type="submit" className="submit-btn">
                  Send Report to PRL
                </button>
              </form>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="tab-content">
            <div className="history-section">
              <h3>My Activity History</h3>
              
              {/* Ratings History - ONLY USER'S OWN DATA */}
              <div className="history-subsection">
                <h4>My Rating History ({ratings.length})</h4>
                {loading ? (
                  <p>Loading ratings...</p>
                ) : ratings.length === 0 ? (
                  <div className="empty-state">
                    <p>No ratings submitted yet.</p>
                    <p className="empty-subtitle">Rate your first lecturer using the "Rate Lecturers" tab.</p>
                  </div>
                ) : (
                  <div className="ratings-table-container">
                    <table className="ratings-table">
                      <thead>
                        <tr>
                          <th>Lecturer</th>
                          <th>Module</th>
                          <th>Module Code</th>
                          <th>Programme</th>
                          <th>Year</th>
                          <th>Rating</th>
                          <th>Comments</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ratings.map((rating, index) => (
                          <tr key={rating.rating_id || index}>
                            <td className="lecturer-cell">
                              <strong>{rating.lecturer_name || "Unknown"}</strong>
                            </td>
                            <td>{rating.module_name || "N/A"}</td>
                            <td className="code-cell">{rating.module_code || "N/A"}</td>
                            <td>{rating.programme || "N/A"}</td>
                            <td className="year-cell">{rating.year_of_study || "N/A"}</td>
                            <td className="rating-cell">
                              <div className="rating-display">
                                <span className="stars">{renderStars(rating.rating || 0)}</span>
                                <span className="rating-number">({rating.rating}/5)</span>
                              </div>
                            </td>
                            <td className="comments-cell">
                              {rating.comments && rating.comments !== "No additional comments" 
                                ? rating.comments 
                                : "-"
                              }
                            </td>
                            <td className="date-cell">
                              {rating.created_at
                                ? new Date(rating.created_at).toLocaleDateString()
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Attendance History - ONLY USER'S OWN DATA */}
              <div className="history-subsection">
                <h4>My Attendance History ({attendance.length})</h4>
                {attendanceLoading ? (
                  <p>Loading attendance records...</p>
                ) : attendance.length === 0 ? (
                  <div className="empty-state">
                    <p>No attendance records yet.</p>
                    <p className="empty-subtitle">Mark your first attendance using the "Attendance" tab.</p>
                  </div>
                ) : (
                  <div className="attendance-table-container">
                    <table className="attendance-table">
                      <thead>
                        <tr>
                          <th>Stream</th>
                          <th>Module</th>
                          <th>Date</th>
                          <th>Lecturer</th>
                          <th>Topic</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map(record => (
                          <tr key={record.id}>
                            <td>{record.stream}</td>
                            <td>
                              <strong>{record.moduleCode}</strong>
                              <br />
                              <small>{record.moduleName}</small>
                            </td>
                            <td>{new Date(record.date).toLocaleDateString()}</td>
                            <td>{record.lecturerName}</td>
                            <td>{record.topic || "-"}</td>
                            <td>
                              <span className={`status-badge ${record.status}`}>
                                {record.status === 'present' ? 'Present' : 'Absent'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;