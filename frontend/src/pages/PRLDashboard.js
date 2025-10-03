import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import "./PRLDashboard.css";

function PRLDashboard() {
  const [prl, setPRL] = useState(null);
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [studentReports, setStudentReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [lecturersLoading, setLecturersLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(true);

  // Feedback state
  const [feedbackForm, setFeedbackForm] = useState({
    reportId: "",
    feedback: ""
  });

  // Add lecturer state
  const [newLecturer, setNewLecturer] = useState({
    name: "",
    email: ""
  });

  // PL Report state
  const [plReport, setPlReport] = useState({
    reportType: "performance",
    timeRange: "month",
    includeDetails: true
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setPRL(userData);
    
    if (userData) {
      loadAllReports();
      loadAllLecturers();
      loadAllRatings();
      loadStudentReports();
    }
  }, []);

  // LOAD ALL REPORTS FROM BACKEND
  const loadAllReports = async () => {
    try {
      setReportsLoading(true);
      const reportsData = await apiService.getReports();
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      console.error("Error loading reports:", error);
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  // LOAD ALL LECTURERS FROM BACKEND
  const loadAllLecturers = async () => {
    try {
      setLecturersLoading(true);
      const lecturersData = await apiService.getLecturers();
      setLecturers(Array.isArray(lecturersData) ? lecturersData : []);
    } catch (error) {
      console.error("Error loading lecturers:", error);
      setLecturers([]);
    } finally {
      setLecturersLoading(false);
    }
  };

  // LOAD ALL RATINGS FROM BACKEND
  const loadAllRatings = async () => {
    try {
      setRatingsLoading(true);
      const ratingsData = await apiService.getRatings();
      setRatings(Array.isArray(ratingsData) ? ratingsData : []);
    } catch (error) {
      console.error("Error loading ratings:", error);
      setRatings([]);
    } finally {
      setRatingsLoading(false);
    }
  };

  // LOAD STUDENT REPORTS
  const loadStudentReports = async () => {
    try {
      const studentReportsData = JSON.parse(localStorage.getItem('studentReports')) || [];
      setStudentReports(studentReportsData);
    } catch (error) {
      console.error("Error loading student reports:", error);
      setStudentReports([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLecturerInputChange = (e) => {
    const { name, value } = e.target;
    setNewLecturer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlReportChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlReport(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // SUBMIT FEEDBACK TO LECTURER
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.reportId || !feedbackForm.feedback) {
      alert("Please select a report and provide feedback");
      return;
    }

    setLoading(true);
    try {
      // Update report with PRL feedback
      const updatedReports = reports.map(report => 
        report.report_id == feedbackForm.reportId 
          ? { ...report, prl_feedback: feedbackForm.feedback, status: "reviewed" }
          : report
      );
      
      setReports(updatedReports);
      alert("Feedback submitted successfully!");
      
      setFeedbackForm({
        reportId: "",
        feedback: ""
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  // ADD NEW LECTURER
  const handleAddLecturer = async (e) => {
    e.preventDefault();
    if (!newLecturer.name || !newLecturer.email) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.addLecturer(newLecturer);
      
      if (result.message === "Lecturer added successfully") {
        alert("Lecturer added successfully!");
        await loadAllLecturers();
        
        setNewLecturer({
          name: "",
          email: ""
        });
      } else {
        alert("Failed to add lecturer: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding lecturer:", error);
      alert("Failed to add lecturer: " + (error.message || "Check console for details"));
    } finally {
      setLoading(false);
    }
  };

  // GENERATE PL REPORT
  const generatePLReport = () => {
    const reportData = generateReportData();
    const reportContent = formatReportForPL(reportData);
    
    // For demo purposes, we'll show an alert with the report summary
    // In real implementation, this would generate PDF/Excel
    alert(`PL Report Generated!\n\nReport Type: ${plReport.reportType}\nTime Range: ${plReport.timeRange}\n\nSummary prepared for Program Leader review.`);
    
    // Here you would typically:
    // 1. Generate PDF/Excel file
    // 2. Save to database
    // 3. Send to PL via email
    // 4. Or display in a modal for download
  };

  // GENERATE REPORT DATA
  const generateReportData = () => {
    const currentLecturers = lecturers;
    const currentReports = reports;
    const currentRatings = ratings;

    // Calculate metrics
    const totalStudents = currentReports.reduce((sum, report) => sum + (report.total_students || 0), 0);
    const avgAttendance = currentReports.length > 0 
      ? ((currentReports.reduce((sum, report) => sum + (report.students_present || 0), 0) / 
         currentReports.reduce((sum, report) => sum + (report.total_students || 1), 0)) * 100).toFixed(1)
      : 0;

    const avgRating = currentRatings.length > 0 
      ? (currentRatings.reduce((sum, rating) => sum + (rating.rating || 0), 0) / currentRatings.length).toFixed(1)
      : 0;

    // Lecturer performance
    const lecturerPerformance = currentLecturers.map(lecturer => {
      const lecturerReports = currentReports.filter(r => r.lecturer_id == lecturer.user_id);
      const lecturerRatings = currentRatings.filter(r => r.lecturer_id == lecturer.user_id);
      
      const avgLecturerRating = lecturerRatings.length > 0 
        ? (lecturerRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / lecturerRatings.length).toFixed(1)
        : 0;

      return {
        name: lecturer.name,
        reportsCount: lecturerReports.length,
        avgRating: avgLecturerRating,
        studentFeedback: lecturerRatings.length
      };
    });

    return {
      summary: {
        totalLecturers: currentLecturers.length,
        totalReports: currentReports.length,
        totalRatings: currentRatings.length,
        totalStudents,
        avgAttendance: `${avgAttendance}%`,
        avgRating,
        timePeriod: plReport.timeRange
      },
      lecturerPerformance,
      recommendations: generateRecommendations(currentReports, currentRatings)
    };
  };

  // GENERATE RECOMMENDATIONS
  const generateRecommendations = (reports, ratings) => {
    const recommendations = [];
    
    // Low attendance recommendation
    const lowAttendanceReports = reports.filter(r => {
      const attendanceRate = (r.students_present / r.total_students) * 100;
      return attendanceRate < 70;
    });
    
    if (lowAttendanceReports.length > 0) {
      recommendations.push(`Address low attendance in ${lowAttendanceReports.length} modules`);
    }

    // Low ratings recommendation
    const lowRatings = ratings.filter(r => r.rating < 3);
    if (lowRatings.length > 0) {
      recommendations.push(`Review teaching methods for ${lowRatings.length} low-rated sessions`);
    }

    // Pending feedback recommendation
    const pendingFeedback = reports.filter(r => !r.prl_feedback);
    if (pendingFeedback.length > 0) {
      recommendations.push(`Provide feedback for ${pendingFeedback.length} pending reports`);
    }

    return recommendations.length > 0 ? recommendations : ["All metrics within acceptable ranges"];
  };

  // FORMAT REPORT FOR PL
  const formatReportForPL = (reportData) => {
    return {
      title: `Academic Performance Report - ${new Date().toLocaleDateString()}`,
      ...reportData
    };
  };

  // CALCULATE STATS
  const getStats = () => {
    const totalReports = reports.length;
    const totalLecturers = lecturers.length;
    const totalRatings = ratings.length;
    const totalStudentReports = studentReports.length;
    
    const pendingReports = reports.filter(report => !report.prl_feedback).length;
    const averageRating = ratings.length > 0 
      ? (ratings.reduce((sum, rating) => sum + (rating.rating || 0), 0) / ratings.length).toFixed(1)
      : 0;

    return {
      totalReports,
      totalLecturers,
      totalRatings,
      totalStudentReports,
      pendingReports,
      averageRating
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!prl) {
    return <div className="loading">Loading PRL information...</div>;
  }

  const stats = getStats();

  return (
    <div className="prl-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>LUCT PRL Portal</h1>
          <div className="user-info">
            <span>Welcome, <strong>{prl.name}</strong> (PRL)</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          Reports Review
        </button>
        <button 
          className={`tab ${activeTab === "lecturers" ? "active" : ""}`}
          onClick={() => setActiveTab("lecturers")}
        >
          Lecturers
        </button>
        <button 
          className={`tab ${activeTab === "ratings" ? "active" : ""}`}
          onClick={() => setActiveTab("ratings")}
        >
          Ratings Overview
        </button>
        <button 
          className={`tab ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Student Reports
        </button>
        <button 
          className={`tab ${activeTab === "pl-reports" ? "active" : ""}`}
          onClick={() => setActiveTab("pl-reports")}
        >
          PL Reports
        </button>
      </div>

      <div className="dashboard-content">
        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>Principal Lecturer Dashboard</h2>
          <div className="prl-details">
            <p><strong>Name:</strong> {prl.name}</p>
            <p><strong>Email:</strong> {prl.email}</p>
            <p><strong>Role:</strong> Principal Lecturer (PRL)</p>
            <div className="stats-grid">
              <div className="stat-item">
                <strong>Total Reports:</strong> {stats.totalReports}
              </div>
              <div className="stat-item">
                <strong>Pending Review:</strong> {stats.pendingReports}
              </div>
              <div className="stat-item">
                <strong>Lecturers:</strong> {stats.totalLecturers}
              </div>
              <div className="stat-item">
                <strong>Student Ratings:</strong> {stats.totalRatings}
              </div>
            </div>
          </div>
        </div>

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="tab-content">
            <div className="reports-review-section">
              <h3>Lecturer Reports Review</h3>
              
              {/* Feedback Form */}
              <div className="feedback-section">
                <h4>Provide Feedback to Lecturers</h4>
                <form onSubmit={handleSubmitFeedback} className="feedback-form">
                  <div className="form-group">
                    <label>Select Report</label>
                    <select 
                      name="reportId" 
                      value={feedbackForm.reportId} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Choose a report to review</option>
                      {reports.map(report => (
                        <option key={report.report_id} value={report.report_id}>
                          {report.course_code} - {report.lecturer_name} - Week {report.week_of_reporting}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Your Feedback</label>
                    <textarea 
                      name="feedback" 
                      placeholder="Provide constructive feedback for the lecturer..."
                      rows="4"
                      value={feedbackForm.feedback} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Feedback to Lecturer"}
                  </button>
                </form>
              </div>

              {/* Reports List */}
              <div className="reports-section">
                <h4>All Lecturer Reports ({reports.length})</h4>
                {reportsLoading ? (
                  <p>Loading reports...</p>
                ) : reports.length === 0 ? (
                  <div className="empty-state">
                    <p>No reports submitted yet.</p>
                    <p>Reports will appear here once lecturers submit them.</p>
                  </div>
                ) : (
                  <div className="reports-list">
                    {reports.map(report => (
                      <div key={report.report_id} className={`report-card ${report.prl_feedback ? 'reviewed' : 'pending'}`}>
                        <div className="report-header">
                          <span><strong>{report.course_code}</strong></span>
                          <span>Week {report.week_of_reporting}</span>
                          <span className={`status ${report.prl_feedback ? 'reviewed' : 'pending'}`}>
                            {report.prl_feedback ? 'Reviewed' : 'Pending Review'}
                          </span>
                        </div>
                        <div className="report-details">
                          <p><strong>Lecturer:</strong> {report.lecturer_name}</p>
                          <p><strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()}</p>
                          <p><strong>Attendance:</strong> {report.students_present}/{report.total_students}</p>
                          <p><strong>Topic:</strong> {report.topic}</p>
                          {report.learning_outcomes && (
                            <p><strong>Learning Outcomes:</strong> {report.learning_outcomes}</p>
                          )}
                          {report.recommendations && (
                            <p><strong>Lecturer Recommendations:</strong> {report.recommendations}</p>
                          )}
                          {report.prl_feedback && (
                            <div className="feedback-section">
                              <strong>PRL Feedback:</strong> 
                              <div className="feedback-content">{report.prl_feedback}</div>
                            </div>
                          )}
                        </div>
                        <div className="report-footer">
                          <small>Submitted on {new Date(report.created_at).toLocaleDateString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LECTURERS TAB */}
        {activeTab === "lecturers" && (
          <div className="tab-content">
            <div className="lecturers-management">
              <h3>Lecturer Management & Monitoring</h3>
              
              {/* Add Lecturer Form */}
              <div className="add-lecturer-section">
                <h4>Add New Lecturer</h4>
                <form onSubmit={handleAddLecturer} className="lecturer-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        placeholder="Enter lecturer's full name"
                        value={newLecturer.name} 
                        onChange={handleLecturerInputChange}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="lecturer.email@luct.ac.ls"
                        value={newLecturer.email} 
                        onChange={handleLecturerInputChange}
                        required 
                      />
                    </div>
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Adding..." : "Add Lecturer"}
                  </button>
                </form>
              </div>

              {/* Lecturer Performance Monitoring */}
              <div className="lecturer-monitoring">
                <h4>Lecturer Performance Monitoring</h4>
                {lecturersLoading ? (
                  <p>Loading lecturer data...</p>
                ) : lecturers.length === 0 ? (
                  <div className="empty-state">
                    <p>No lecturers found.</p>
                  </div>
                ) : (
                  <div className="performance-grid">
                    {lecturers.map(lecturer => {
                      const lecturerReports = reports.filter(r => r.lecturer_id == lecturer.user_id);
                      const lecturerRatings = ratings.filter(r => r.lecturer_id == lecturer.user_id);
                      const avgRating = lecturerRatings.length > 0 
                        ? (lecturerRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / lecturerRatings.length).toFixed(1)
                        : 0;

                      return (
                        <div key={lecturer.user_id} className="performance-card">
                          <div className="lecturer-header">
                            <h5>{lecturer.name}</h5>
                            <span className="rating-badge">{avgRating}/5</span>
                          </div>
                          <div className="performance-metrics">
                            <div className="metric">
                              <span className="metric-label">Reports Submitted</span>
                              <span className="metric-value">{lecturerReports.length}</span>
                            </div>
                            <div className="metric">
                              <span className="metric-label">Student Ratings</span>
                              <span className="metric-value">{lecturerRatings.length}</span>
                            </div>
                            <div className="metric">
                              <span className="metric-label">Avg Rating</span>
                              <span className="metric-value">{avgRating}/5</span>
                            </div>
                          </div>
                          <div className="lecturer-contact">
                            <p><strong>Email:</strong> {lecturer.email}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RATINGS TAB */}
        {activeTab === "ratings" && (
          <div className="tab-content">
            <div className="ratings-overview">
              <h3>Student Ratings Overview</h3>
              
              {/* Rating Summary */}
              {stats.totalRatings > 0 && (
                <div className="rating-summary">
                  <div className="summary-card">
                    <div className="average-rating-display">
                      <div className="rating-score">{stats.averageRating}/5</div>
                      <div className="stars-large">
                        {"★".repeat(Math.round(stats.averageRating))}
                        {"☆".repeat(5 - Math.round(stats.averageRating))}
                      </div>
                      <p>Overall average from {stats.totalRatings} student ratings</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ratings List */}
              <div className="ratings-list-section">
                <h4>All Student Ratings ({ratings.length})</h4>
                {ratingsLoading ? (
                  <p>Loading ratings...</p>
                ) : ratings.length === 0 ? (
                  <div className="empty-state">
                    <p>No ratings submitted yet.</p>
                    <p>Ratings will appear here once students rate lecturers.</p>
                  </div>
                ) : (
                  <div className="ratings-list">
                    {ratings.map(rating => (
                      <div key={rating.rating_id} className="rating-card">
                        <div className="rating-header">
                          <div className="module-info">
                            <strong>{rating.module_name}</strong> 
                            <span className="module-code">({rating.module_code})</span>
                          </div>
                          <div className="rating-stars">
                            <span className="stars-display">
                              {"★".repeat(rating.rating || 0)}
                              {"☆".repeat(5 - (rating.rating || 0))}
                            </span>
                            <span className="rating-number">({rating.rating}/5)</span>
                          </div>
                        </div>
                        <div className="rating-details">
                          <div className="student-info">
                            <span><strong>Student:</strong> {rating.student_name || "Anonymous"}</span>
                            <span><strong>Lecturer:</strong> {rating.lecturer_name}</span>
                          </div>
                          <div className="course-info">
                            <span><strong>Programme:</strong> {rating.programme || "Not specified"}</span>
                            <span><strong>Year:</strong> {rating.year_of_study || "Not specified"}</span>
                          </div>
                        </div>
                        {rating.comments && rating.comments !== "No additional comments" && (
                          <div className="rating-comments">
                            <strong>Student Feedback:</strong> "{rating.comments}"
                          </div>
                        )}
                        <div className="rating-date">
                          Rated on {rating.created_at ? new Date(rating.created_at).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STUDENT REPORTS TAB */}
        {activeTab === "students" && (
          <div className="tab-content">
            <div className="student-reports-section">
              <h3>Student Reports & Concerns</h3>
              
              <div className="reports-section">
                <h4>Student Reports to PRL ({studentReports.length})</h4>
                {studentReports.length === 0 ? (
                  <div className="empty-state">
                    <p>No student reports submitted yet.</p>
                    <p>Students can submit reports using the "Report to PRL" feature.</p>
                  </div>
                ) : (
                  <div className="reports-list">
                    {studentReports.map(report => (
                      <div key={report.id} className="report-card student-report">
                        <div className="report-header">
                          <span><strong>{report.subject}</strong></span>
                          <span className={`urgency-${report.urgency}`}>{report.urgency} urgency</span>
                        </div>
                        <div className="report-details">
                          <p><strong>Student:</strong> {report.student_name} ({report.student_email})</p>
                          <p><strong>Type:</strong> {report.reportType}</p>
                          <p><strong>Message:</strong> {report.message}</p>
                          <p><strong>Programme:</strong> {report.programme}</p>
                          <p><strong>Year:</strong> {report.year}</p>
                        </div>
                        <div className="report-footer">
                          <small>Submitted on {new Date(report.created_at).toLocaleDateString()}</small>
                          <span className={`status ${report.status}`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PL REPORTS TAB */}
        {activeTab === "pl-reports" && (
          <div className="tab-content">
            <div className="pl-reports-section">
              <h3>Generate Reports for Program Leader</h3>
              
              {/* Report Configuration */}
              <div className="report-configuration">
                <h4>Report Configuration</h4>
                <form className="pl-report-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Report Type</label>
                      <select 
                        name="reportType" 
                        value={plReport.reportType} 
                        onChange={handlePlReportChange}
                      >
                        <option value="performance">Performance Summary</option>
                        <option value="attendance">Attendance Analysis</option>
                        <option value="quality">Quality Assurance</option>
                        <option value="comprehensive">Comprehensive Report</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Time Range</label>
                      <select 
                        name="timeRange" 
                        value={plReport.timeRange} 
                        onChange={handlePlReportChange}
                      >
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="quarter">Last Quarter</option>
                        <option value="semester">Current Semester</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="includeDetails"
                        checked={plReport.includeDetails}
                        onChange={handlePlReportChange}
                      />
                      Include detailed analysis and recommendations
                    </label>
                  </div>

                  <button 
                    type="button" 
                    className="generate-btn"
                    onClick={generatePLReport}
                  >
                    Generate PL Report
                  </button>
                </form>
              </div>

              {/* Report Preview */}
              <div className="report-preview">
                <h4>Report Summary Preview</h4>
                <div className="preview-content">
                  <div className="preview-section">
                    <h5>Executive Summary</h5>
                    <ul>
                      <li><strong>Total Lecturers:</strong> {stats.totalLecturers}</li>
                      <li><strong>Reports Submitted:</strong> {stats.totalReports}</li>
                      <li><strong>Student Ratings:</strong> {stats.totalRatings}</li>
                      <li><strong>Average Rating:</strong> {stats.averageRating}/5</li>
                      <li><strong>Pending Reviews:</strong> {stats.pendingReports}</li>
                    </ul>
                  </div>
                  
                  <div className="preview-section">
                    <h5>Key Metrics</h5>
                    <ul>
                      <li>Lecturer reporting compliance: {((stats.totalReports / (stats.totalLecturers * 4)) * 100).toFixed(1)}%</li>
                      <li>Student satisfaction rate: {(stats.averageRating / 5 * 100).toFixed(1)}%</li>
                      <li>Feedback completion rate: {(((stats.totalReports - stats.pendingReports) / stats.totalReports) * 100).toFixed(1)}%</li>
                    </ul>
                  </div>

                  <div className="preview-section">
                    <h5>Recommendations for PL</h5>
                    <ul>
                      {stats.pendingReports > 0 && (
                        <li>Review and provide feedback for {stats.pendingReports} pending reports</li>
                      )}
                      {stats.averageRating < 3.5 && (
                        <li>Address teaching quality concerns with average rating of {stats.averageRating}/5</li>
                      )}
                      <li>Monitor lecturer reporting compliance and provide support where needed</li>
                      <li>Review student feedback for actionable insights</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PRLDashboard;