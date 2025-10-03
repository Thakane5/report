import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import "./LecturerDashboard.css";

function LecturerDashboard() {
  const [lecturer, setLecturer] = useState(null);
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  
  // Dropdown data
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState("");
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [modulesLoading, setModulesLoading] = useState(false);

  // Report form state
  const [reportForm, setReportForm] = useState({
    week_of_reporting: "",
    date_of_lecture: "",
    students_present: "",
    total_students: "",
    topic_learned: "", // Changed from learning_outcomes to topic_learned
    recommendations: "",
    // Class performance ratings
    class_ratings: {
      teaching_quality: 0,
      preparation: 0,
      support: 0,
      fairness: 0,
      engagement: 0
    }
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setLecturer(userData);
    
    if (userData) {
      loadLecturerReports(userData.user_id);
      loadLecturerRatings(userData.user_id);
      loadStreams();
    }
  }, []);

  // Load all available streams
  const loadStreams = async () => {
    try {
      const streamsData = await apiService.getStreams();
      setStreams(streamsData);
    } catch (error) {
      console.error("Error loading streams:", error);
    }
  };

  // Load modules based on selected stream
  const loadModulesByStream = async (streamName) => {
    try {
      setModulesLoading(true);
      const modulesData = await apiService.getModulesByStream(streamName);
      setModules(modulesData);
      setSelectedModule(""); // Reset module selection when stream changes
    } catch (error) {
      console.error("Error loading modules:", error);
      setModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  // LOAD REPORTS FROM BACKEND - ONLY LECTURER'S OWN
  const loadLecturerReports = async (lecturerId) => {
    try {
      setReportsLoading(true);
      const reportsData = await apiService.getReportsByLecturer(lecturerId);
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      console.error("Error loading reports:", error);
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  // LOAD RATINGS FROM BACKEND - ONLY FOR THIS LECTURER
  const loadLecturerRatings = async (lecturerId) => {
    try {
      setRatingsLoading(true);
      const ratingsData = await apiService.getRatingsByLecturer(lecturerId);
      setRatings(Array.isArray(ratingsData) ? ratingsData : []);
    } catch (error) {
      console.error("Error loading ratings:", error);
      setRatings([]);
    } finally {
      setRatingsLoading(false);
    }
  };

  // Handle stream selection change
  const handleStreamChange = (e) => {
    const stream = e.target.value;
    setSelectedStream(stream);
    
    if (stream) {
      loadModulesByStream(stream);
    } else {
      setModules([]);
      setSelectedModule("");
    }
  };

  // Handle module selection
  const handleModuleSelect = (e) => {
    setSelectedModule(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle class rating changes
  const handleClassRatingChange = (criterion, value) => {
    setReportForm(prev => ({
      ...prev,
      class_ratings: {
        ...prev.class_ratings,
        [criterion]: parseInt(value)
      }
    }));
  };

  // SUBMIT REPORT TO BACKEND
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedStream || !selectedModule || !reportForm.week_of_reporting || !reportForm.date_of_lecture || 
          !reportForm.students_present || !reportForm.total_students || !reportForm.topic_learned) {
        alert("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const selectedModuleData = modules.find(module => module.module_code === selectedModule);

      // Calculate average class rating
      const ratingsArray = Object.values(reportForm.class_ratings).filter(r => r > 0);
      const averageClassRating = ratingsArray.length > 0 
        ? (ratingsArray.reduce((a, b) => a + b) / ratingsArray.length).toFixed(1)
        : 0;

      const reportData = {
        lecturer_id: lecturer.user_id,
        course_code: selectedModule,
        week_of_reporting: parseInt(reportForm.week_of_reporting),
        date_of_lecture: reportForm.date_of_lecture,
        topic: `${reportForm.topic_learned} | Class Performance: ${averageClassRating}/5`,
        learning_outcomes: `Stream: ${selectedStream} | Module: ${selectedModuleData?.module_name || selectedModule}`,
        recommendations: reportForm.recommendations || "",
        students_present: parseInt(reportForm.students_present),
        total_students: parseInt(reportForm.total_students),
        class_ratings: JSON.stringify(reportForm.class_ratings)
      };

      const result = await apiService.createReport(reportData);
      
      if (result.message === "Report submitted successfully") {
        alert("Report submitted successfully!");
        await loadLecturerReports(lecturer.user_id);
        
        // Reset form
        setReportForm({
          week_of_reporting: "",
          date_of_lecture: "",
          students_present: "",
          total_students: "",
          topic_learned: "",
          recommendations: "",
          class_ratings: {
            teaching_quality: 0,
            preparation: 0,
            support: 0,
            fairness: 0,
            engagement: 0
          }
        });
        setSelectedStream("");
        setSelectedModule("");
        setModules([]);
      } else {
        alert("Failed to submit report: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report: " + (error.message || "Check console for details"));
    } finally {
      setLoading(false);
    }
  };

  // CALCULATE STATS
  const getStats = () => {
    const totalReports = reports.length;
    const totalRatings = ratings.length;
    
    const averageRating = ratings.length > 0 
      ? (ratings.reduce((sum, rating) => sum + (rating.rating || 0), 0) / ratings.length).toFixed(1)
      : 0;

    return {
      totalReports,
      totalRatings,
      averageRating
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!lecturer) {
    return <div className="loading">Loading lecturer information...</div>;
  }

  const stats = getStats();

  return (
    <div className="lecturer-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>LUCT Lecturer Portal</h1>
          <div className="user-info">
            <span>Welcome, <strong>{lecturer.name}</strong></span>
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
          Reports
        </button>
        <button 
          className={`tab ${activeTab === "ratings" ? "active" : ""}`}
          onClick={() => setActiveTab("ratings")}
        >
          Ratings
        </button>
      </div>

      <div className="dashboard-content">
        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>Lecturer Dashboard</h2>
          <div className="lecturer-details">
            <p><strong>Name:</strong> {lecturer.name}</p>
            <p><strong>Email:</strong> {lecturer.email}</p>
            <p><strong>Role:</strong> Lecturer</p>
            <p><strong>Reports Submitted:</strong> {stats.totalReports}</p>
            <p><strong>Ratings Received:</strong> {stats.totalRatings}</p>
            {stats.totalRatings > 0 && (
              <p><strong>Average Rating:</strong> {stats.averageRating}/5</p>
            )}
          </div>
        </div>

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="tab-content">
            {/* Report Form */}
            <div className="report-form-section">
              <div className="section-header">
                <h3>Create New Lecture Report</h3>
                <p>Submit your lecture reports for PRL review</p>
              </div>
              <form onSubmit={handleSubmitReport} className="report-form">
                {/* Stream Selection */}
                <div className="form-group">
                  <label>Select Stream *</label>
                  <select 
                    name="stream" 
                    value={selectedStream} 
                    onChange={handleStreamChange}
                    required
                  >
                    <option value="">Choose stream</option>
                    {streams.map(stream => (
                      <option key={stream.code} value={stream.name}>
                        {stream.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Module Selection - Only show when stream is selected */}
                {selectedStream && (
                  <div className="form-group">
                    <label>Select Module *</label>
                    <select 
                      name="module" 
                      value={selectedModule} 
                      onChange={handleModuleSelect}
                      required
                      disabled={modulesLoading}
                    >
                      <option value="">{modulesLoading ? "Loading modules..." : "Choose module"}</option>
                      {modules.map(module => (
                        <option key={module.module_code} value={module.module_code}>
                          {module.module_name} ({module.module_code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Week of Reporting *</label>
                    <input 
                      type="number" 
                      name="week_of_reporting" 
                      placeholder="e.g., 6" 
                      min="1" 
                      max="15"
                      value={reportForm.week_of_reporting} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Lecture *</label>
                    <input 
                      type="date" 
                      name="date_of_lecture" 
                      value={reportForm.date_of_lecture} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Students Present *</label>
                    <input 
                      type="number" 
                      name="students_present" 
                      placeholder="e.g., 24" 
                      min="0"
                      value={reportForm.students_present} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Students *</label>
                    <input 
                      type="number" 
                      name="total_students" 
                      placeholder="e.g., 30" 
                      min="0"
                      value={reportForm.total_students} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>

                {/* Class Performance Rating Section */}
                <div className="rating-section">
                  <h4>Rate Class Performance (1-5)</h4>
                  <div className="rating-criteria">
                    {[
                      ["teaching_quality", "Teaching Quality & Clarity"],
                      ["preparation", "Preparation & Organization"],
                      ["support", "Support & Availability"],
                      ["fairness", "Fairness & Respect"],
                      ["engagement", "Engagement & Participation"]
                    ].map(([field, label]) => (
                      <div className="rating-criterion" key={field}>
                        <label className="criterion-label">{label}</label>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <label key={num} className="star-label">
                              <input
                                type="radio"
                                name={field}
                                value={num}
                                checked={reportForm.class_ratings[field] === num}
                                onChange={() => handleClassRatingChange(field, num)}
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
                  <label>Topic Learned *</label>
                  <textarea 
                    name="topic_learned" 
                    placeholder="What topic was covered in this lecture?" 
                    rows="3"
                    value={reportForm.topic_learned} 
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Lecturer's Recommendations</label>
                  <textarea 
                    name="recommendations" 
                    placeholder="Any recommendations or follow-up actions..." 
                    rows="3"
                    value={reportForm.recommendations} 
                    onChange={handleInputChange}
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Report to PRL"}
                </button>
              </form>
            </div>

            {/* Recent Reports */}
            <div className="reports-section">
              <h3>My Reports ({reports.length})</h3>
              {reportsLoading ? (
                <p>Loading reports...</p>
              ) : reports.length === 0 ? (
                <div className="empty-state">
                  <p>No reports submitted yet.</p>
                  <p>Create your first report using the form above.</p>
                </div>
              ) : (
                <div className="reports-list">
                  {reports.map(report => (
                    <div key={report.report_id} className="report-card">
                      <div className="report-header">
                        <span><strong>{report.course_code}</strong></span>
                        <span>Week {report.week_of_reporting}</span>
                      </div>
                      <div className="report-details">
                        <p><strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()}</p>
                        <p><strong>Attendance:</strong> {report.students_present}/{report.total_students}</p>
                        <p><strong>Topic:</strong> {report.topic}</p>
                        {report.recommendations && (
                          <p><strong>Recommendations:</strong> {report.recommendations}</p>
                        )}
                      </div>
                      <div className="report-footer">
                        <small>Submitted on {new Date(report.created_at).toLocaleDateString()}</small>
                        <span className="status submitted">
                          Submitted to PRL
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RATINGS TAB */}
        {activeTab === "ratings" && (
          <div className="tab-content">
            <div className="ratings-overview">
              <h3>Student Ratings & Feedback</h3>
              
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
                      <p>Based on {stats.totalRatings} student ratings</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ratings List */}
              <div className="ratings-list-section">
                <h4>Student Feedback ({ratings.length})</h4>
                {ratingsLoading ? (
                  <p>Loading ratings...</p>
                ) : ratings.length === 0 ? (
                  <div className="empty-state">
                    <p>No ratings received yet.</p>
                    <p>Student ratings will appear here once they rate your lectures.</p>
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
                            <span><strong>Programme:</strong> {rating.programme || "Not specified"}</span>
                            <span><strong>Year:</strong> {rating.year_of_study || "Not specified"}</span>
                          </div>
                          <p><strong>Student:</strong> {rating.student_name || "Anonymous"}</p>
                        </div>
                        {rating.comments && rating.comments !== "No additional comments" && (
                          <div className="rating-comments">
                            <strong>Feedback:</strong> "{rating.comments}"
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
      </div>
    </div>
  );
}

export default LecturerDashboard;