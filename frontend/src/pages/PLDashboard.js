import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import "./PLDashboard.css";

function PLDashboard() {
  const [pl, setPL] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  
  // Real data from backend
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [reports, setReports] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [modules, setModules] = useState([]);
  
  // Form states
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAssignLecturer, setShowAssignLecturer] = useState(false);
  const [newModule, setNewModule] = useState({
    module_code: "",
    module_name: "",
    credits: 12,
    stream: "",
    description: ""
  });
  
  const [assignmentForm, setAssignmentForm] = useState({
    module_code: "",
    lecturer_id: "",
    course_name: "",
    semester: "1"
  });

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStream, setFilterStream] = useState("");

  // Streams data from database
  const [streams, setStreams] = useState([]);
  const [streamModules, setStreamModules] = useState({
    CS: [],
    IS: [],
    IT: [],
    SE: []
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setPL(userData);
    
    if (userData) {
      loadAllData();
    }
  }, []);

  // Load all real data from backend
  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStreams(),
        loadCourses(),
        loadLecturers(),
        loadReports(),
        loadRatings(),
        loadAllModules()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadStreams = async () => {
    try {
      const streamsData = await apiService.getStreams();
      setStreams(Array.isArray(streamsData) ? streamsData : []);
    } catch (error) {
      console.error("Error loading streams:", error);
      setStreams([]);
    }
  };

  const loadCourses = async () => {
    try {
      const coursesData = await apiService.getCourses();
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error("Error loading courses:", error);
      setCourses([]);
    }
  };

  const loadLecturers = async () => {
    try {
      const lecturersData = await apiService.getLecturers();
      setLecturers(Array.isArray(lecturersData) ? lecturersData : []);
    } catch (error) {
      console.error("Error loading lecturers:", error);
      setLecturers([]);
    }
  };

  const loadReports = async () => {
    try {
      const reportsData = await apiService.getReports();
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      console.error("Error loading reports:", error);
      setReports([]);
    }
  };

  const loadRatings = async () => {
    try {
      const ratingsData = await apiService.getRatings();
      setRatings(Array.isArray(ratingsData) ? ratingsData : []);
    } catch (error) {
      console.error("Error loading ratings:", error);
      setRatings([]);
    }
  };

  const loadAllModules = async () => {
    try {
      const modulesData = await apiService.getAllModules();
      setModules(Array.isArray(modulesData) ? modulesData : []);
      
      // Organize modules by stream
      const organizedModules = {
        CS: modulesData.filter(m => m.stream === "Computer Science"),
        IS: modulesData.filter(m => m.stream === "Information Systems"),
        IT: modulesData.filter(m => m.stream === "Information Technology"),
        SE: modulesData.filter(m => m.stream === "Software Engineering")
      };
      setStreamModules(organizedModules);
    } catch (error) {
      console.error("Error loading modules:", error);
      setModules([]);
    }
  };

  // Add new module to database
  const handleAddModule = async (e) => {
    e.preventDefault();
    
    if (!newModule.module_code || !newModule.module_name || !newModule.stream) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      // Determine the correct table based on stream
      let tableName = '';
      switch(newModule.stream) {
        case 'Computer Science':
          tableName = 'computer_science_modules';
          break;
        case 'Information Systems':
          tableName = 'information_systems_modules';
          break;
        case 'Information Technology':
          tableName = 'information_technology_modules';
          break;
        case 'Software Engineering':
          tableName = 'software_engineering_modules';
          break;
        default:
          alert('Invalid stream selected');
          return;
      }

      // For demo, we'll update local state
      const tempModule = {
        module_code: newModule.module_code,
        module_name: newModule.module_name,
        stream: newModule.stream
      };
      
      setModules(prev => [...prev, tempModule]);
      
      // Update stream modules
      setStreamModules(prev => ({
        ...prev,
        [newModule.stream.split(' ').map(word => word[0]).join('')]: [
          ...prev[newModule.stream.split(' ').map(word => word[0]).join('')],
          tempModule
        ]
      }));
      
      alert("Module added successfully!");
      
      setNewModule({
        module_code: "",
        module_name: "",
        credits: 12,
        stream: "",
        description: ""
      });
      setShowAddModule(false);
      
    } catch (error) {
      console.error("Error adding module:", error);
      alert("Failed to add module");
    } finally {
      setLoading(false);
    }
  };

  // Assign lecturer to module
  const handleAssignLecturer = async (e) => {
    e.preventDefault();
    
    if (!assignmentForm.module_code || !assignmentForm.lecturer_id) {
      alert("Please select a module and lecturer");
      return;
    }

    try {
      setLoading(true);
      
      // For demo, we'll just show success
      const selectedModule = modules.find(m => m.module_code === assignmentForm.module_code);
      const selectedLecturer = lecturers.find(l => l.user_id == assignmentForm.lecturer_id);
      
      alert(`Lecturer ${selectedLecturer?.name} assigned to ${selectedModule?.module_name} successfully!`);
      
      setAssignmentForm({
        module_code: "",
        lecturer_id: "",
        course_name: "",
        semester: "1"
      });
      setShowAssignLecturer(false);
      
    } catch (error) {
      console.error("Error assigning lecturer:", error);
      alert("Failed to assign lecturer");
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleModuleInputChange = (e) => {
    const { name, value } = e.target;
    setNewModule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Export to CSV functions (no external dependencies)
  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCoursesCSV = () => {
    const coursesData = modules.map(module => ({
      'Module Code': module.module_code,
      'Module Name': module.module_name,
      'Stream': module.stream,
      'Total Reports': reports.filter(r => r.course_code === module.module_code).length
    }));
    exportToCSV(coursesData, 'luct-courses-report');
  };

  const exportReportsCSV = () => {
    const reportsData = reports.map(report => ({
      'Report ID': report.report_id,
      'Course Code': report.course_code,
      'Lecturer': report.lecturer_name,
      'Week': report.week_of_reporting,
      'Date': new Date(report.date_of_lecture).toLocaleDateString(),
      'Topic': report.topic,
      'Students Present': report.students_present,
      'Total Students': report.total_students,
      'Attendance Rate': `${((report.students_present / report.total_students) * 100).toFixed(1)}%`,
      'PRL Feedback': report.prl_feedback || 'Pending',
      'Submitted Date': new Date(report.created_at).toLocaleDateString()
    }));
    exportToCSV(reportsData, 'luct-reports-summary');
  };

  const exportLecturersCSV = () => {
    const lecturersData = lecturers.map(lecturer => {
      const lecturerReports = reports.filter(r => r.lecturer_id == lecturer.user_id);
      const lecturerRatings = ratings.filter(r => r.lecturer_id == lecturer.user_id);
      const avgRating = lecturerRatings.length > 0 
        ? (lecturerRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / lecturerRatings.length).toFixed(1)
        : 0;

      return {
        'Lecturer ID': lecturer.user_id,
        'Name': lecturer.name,
        'Email': lecturer.email,
        'Total Reports': lecturerReports.length,
        'Total Ratings': lecturerRatings.length,
        'Average Rating': avgRating,
        'Assigned Modules': [...new Set(lecturerReports.map(r => r.course_code))].join(', ')
      };
    });
    exportToCSV(lecturersData, 'luct-lecturers-performance');
  };

  const exportComprehensiveCSV = () => {
    // Combine all data into one comprehensive CSV
    const comprehensiveData = reports.map(report => {
      const module = modules.find(m => m.module_code === report.course_code);
      const lecturer = lecturers.find(l => l.user_id == report.lecturer_id);
      
      return {
        'Report ID': report.report_id,
        'Module Code': report.course_code,
        'Module Name': module?.module_name || 'Unknown',
        'Stream': module?.stream || 'Unknown',
        'Lecturer': report.lecturer_name,
        'Lecturer Email': lecturer?.email || 'Unknown',
        'Week': report.week_of_reporting,
        'Date': new Date(report.date_of_lecture).toLocaleDateString(),
        'Topic': report.topic,
        'Students Present': report.students_present,
        'Total Students': report.total_students,
        'Attendance Rate': `${((report.students_present / report.total_students) * 100).toFixed(1)}%`,
        'Learning Outcomes': report.learning_outcomes || 'Not specified',
        'Recommendations': report.recommendations || 'None',
        'PRL Feedback': report.prl_feedback || 'Pending',
        'Status': report.prl_feedback ? 'Reviewed' : 'Pending Review',
        'Submitted Date': new Date(report.created_at).toLocaleDateString()
      };
    });
    
    exportToCSV(comprehensiveData, `luct-comprehensive-report-${new Date().toISOString().split('T')[0]}`);
  };

  // Filter functions
  const filteredModules = modules.filter(module => {
    const matchesSearch = searchTerm === "" || 
      module.module_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.module_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStream = filterStream === "" || 
      module.stream === filterStream;
    return matchesSearch && matchesStream;
  });

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === "" || 
      report.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.lecturer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Statistics
  const getStats = () => {
    const totalModules = modules.length;
    const totalLecturers = lecturers.length;
    const totalReports = reports.length;
    const totalRatings = ratings.length;
    
    const modulesByStream = streams.map(stream => ({
      name: stream.name,
      count: modules.filter(m => m.stream === stream.name).length
    }));

    const reportsByStream = streams.map(stream => ({
      name: stream.name,
      count: reports.filter(r => {
        const module = modules.find(m => m.module_code === r.course_code);
        return module?.stream === stream.name;
      }).length
    }));

    return {
      totalModules,
      totalLecturers,
      totalReports,
      totalRatings,
      modulesByStream,
      reportsByStream
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!pl) {
    return <div className="loading">Loading PL information...</div>;
  }

  const stats = getStats();

  return (
    <div className="pl-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>LUCT Program Leader Portal</h1>
          <div className="user-info">
            <span>Welcome, <strong>{pl.name}</strong> (Program Leader)</span>
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
          Overview
        </button>
        <button 
          className={`tab ${activeTab === "modules" ? "active" : ""}`}
          onClick={() => setActiveTab("modules")}
        >
          Modules
        </button>
        <button 
          className={`tab ${activeTab === "lecturers" ? "active" : ""}`}
          onClick={() => setActiveTab("lecturers")}
        >
          Lecturers
        </button>
        <button 
          className={`tab ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </button>
        <button 
          className={`tab ${activeTab === "streams" ? "active" : ""}`}
          onClick={() => setActiveTab("streams")}
        >
          Streams
        </button>
      </div>

      <div className="dashboard-content">
        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>Program Leader Dashboard</h2>
          <div className="pl-details">
            <p><strong>Name:</strong> {pl.name}</p>
            <p><strong>Email:</strong> {pl.email}</p>
            <p><strong>Role:</strong> Program Leader</p>
            <p><strong>Modules:</strong> {stats.totalModules} | <strong>Lecturers:</strong> {stats.totalLecturers}</p>
            <p><strong>Reports:</strong> {stats.totalReports} | <strong>Ratings:</strong> {stats.totalRatings}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="search-section">
          <div className="search-controls">
            <div className="search-group">
              <input
                type="text"
                placeholder="Search modules, lecturers, reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <select value={filterStream} onChange={(e) => setFilterStream(e.target.value)}>
                <option value="">All Streams</option>
                {streams.map(stream => (
                  <option key={stream.code} value={stream.name}>{stream.name}</option>
                ))}
              </select>
            </div>
            <div className="export-buttons">
              <button onClick={exportComprehensiveCSV} className="export-btn primary">
                Download Full Report
              </button>
              <button onClick={exportReportsCSV} className="export-btn secondary">
                Download Reports
              </button>
              <button onClick={exportLecturersCSV} className="export-btn tertiary">
                Download Lecturers
              </button>
            </div>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="tab-content">
            <div className="overview-dashboard">
              <h3>Program Overview</h3>
              
              {/* Statistics Grid */}
              <div className="stats-grid">
                <div className="stat-card stat-card-modules">
                  <div className="stat-info">
                    <div className="stat-label">Total Modules</div>
                    <div className="stat-number">{stats.totalModules}</div>
                    <div className="stat-description">Across all streams</div>
                  </div>
                </div>
                <div className="stat-card stat-card-lecturers">
                  <div className="stat-info">
                    <div className="stat-label">Lecturers</div>
                    <div className="stat-number">{stats.totalLecturers}</div>
                    <div className="stat-description">Teaching staff</div>
                  </div>
                </div>
                <div className="stat-card stat-card-reports">
                  <div className="stat-info">
                    <div className="stat-label">Reports</div>
                    <div className="stat-number">{stats.totalReports}</div>
                    <div className="stat-description">Teaching reports</div>
                  </div>
                </div>
                <div className="stat-card stat-card-ratings">
                  <div className="stat-info">
                    <div className="stat-label">Ratings</div>
                    <div className="stat-number">{stats.totalRatings}</div>
                    <div className="stat-description">Student feedback</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h4>Quick Actions</h4>
                <div className="action-buttons">
                  <button 
                    onClick={() => setShowAddModule(true)}
                    className="action-btn primary"
                  >
                    Add New Module
                  </button>
                  <button 
                    onClick={() => setShowAssignLecturer(true)}
                    className="action-btn secondary"
                  >
                    Assign Lecturer
                  </button>
                  <button 
                    onClick={exportComprehensiveCSV}
                    className="action-btn tertiary"
                  >
                    Download Full Report
                  </button>
                </div>
              </div>

              {/* Stream Distribution */}
              <div className="stream-distribution">
                <h4>Modules by Stream</h4>
                <div className="distribution-grid">
                  {stats.modulesByStream.map(stream => (
                    <div key={stream.name} className="distribution-card">
                      <h5>{stream.name}</h5>
                      <div className="distribution-count">{stream.count}</div>
                      <div className="distribution-bar">
                        <div 
                          className="distribution-fill"
                          style={{ 
                            width: `${(stream.count / Math.max(1, stats.totalModules)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULES TAB */}
        {activeTab === "modules" && (
          <div className="tab-content">
            <div className="modules-management">
              <div className="section-header">
                <h3>Module Management</h3>
                <div className="action-buttons">
                  <button 
                    onClick={() => setShowAddModule(true)}
                    className="add-btn"
                  >
                    Add Module
                  </button>
                  <button 
                    onClick={exportCoursesCSV}
                    className="export-btn secondary"
                  >
                    Export Modules
                  </button>
                </div>
              </div>

              {/* Modules List */}
              <div className="modules-list">
                <h4>All Modules ({filteredModules.length})</h4>
                {loading ? (
                  <p>Loading modules...</p>
                ) : filteredModules.length === 0 ? (
                  <p>No modules found. Add your first module to get started.</p>
                ) : (
                  <div className="modules-grid">
                    {filteredModules.map(module => (
                      <div key={module.module_code} className="module-card">
                        <div className="module-header">
                          <div className="module-code">{module.module_code}</div>
                          <div className="module-stream">{module.stream}</div>
                        </div>
                        <h5 className="module-name">{module.module_name}</h5>
                        <div className="module-footer">
                          <div className="module-stats">
                            <small>
                              Reports: {reports.filter(r => r.course_code === module.module_code).length}
                            </small>
                          </div>
                          <span className="stream-badge">{module.stream}</span>
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
              <div className="section-header">
                <h3>Lecturer Management</h3>
                <div className="action-buttons">
                  <button 
                    onClick={() => setShowAssignLecturer(true)}
                    className="add-btn"
                  >
                    Assign to Module
                  </button>
                  <button 
                    onClick={exportLecturersCSV}
                    className="export-btn secondary"
                  >
                    Export Lecturers
                  </button>
                </div>
              </div>

              {/* Lecturers List */}
              <div className="lecturers-list">
                <h4>All Lecturers ({lecturers.length})</h4>
                {loading ? (
                  <p>Loading lecturers...</p>
                ) : lecturers.length === 0 ? (
                  <p>No lecturers found.</p>
                ) : (
                  <div className="lecturers-grid">
                    {lecturers.map(lecturer => {
                      const lecturerReports = reports.filter(r => r.lecturer_id == lecturer.user_id);
                      const lecturerRatings = ratings.filter(r => r.lecturer_id == lecturer.user_id);
                      const avgRating = lecturerRatings.length > 0 
                        ? (lecturerRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / lecturerRatings.length).toFixed(1)
                        : 0;

                      return (
                        <div key={lecturer.user_id} className="lecturer-card">
                          <div className="lecturer-header">
                            <h5>{lecturer.name}</h5>
                            <span className="rating-badge">{avgRating}/5</span>
                          </div>
                          <div className="lecturer-details">
                            <p><strong>Email:</strong> {lecturer.email}</p>
                            <p><strong>Reports Submitted:</strong> {lecturerReports.length}</p>
                            <p><strong>Student Ratings:</strong> {lecturerRatings.length}</p>
                          </div>
                          <div className="lecturer-modules">
                            <strong>Assigned Modules:</strong>
                            {lecturerReports.length > 0 ? (
                              <div className="module-tags">
                                {[...new Set(lecturerReports.map(r => r.course_code))].slice(0, 3).map(code => (
                                  <span key={code} className="module-tag">{code}</span>
                                ))}
                              </div>
                            ) : (
                              <p>No modules assigned yet</p>
                            )}
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

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="tab-content">
            <div className="reports-management">
              <div className="section-header">
                <h3>System Reports & Monitoring</h3>
                <button 
                  onClick={exportReportsCSV}
                  className="export-btn primary"
                >
                  Export Reports
                </button>
              </div>

              {/* Reports List */}
              <div className="reports-section">
                <h4>All Lecturer Reports ({filteredReports.length})</h4>
                {loading ? (
                  <p>Loading reports...</p>
                ) : filteredReports.length === 0 ? (
                  <p>No reports found.</p>
                ) : (
                  <div className="reports-list detailed">
                    {filteredReports.map(report => (
                      <div key={report.report_id} className="report-card detailed">
                        <div className="report-header">
                          <div>
                            <strong>{report.course_code}</strong>
                            <br />
                            <small>by {report.lecturer_name}</small>
                          </div>
                          <div className="report-meta">
                            <span>Week {report.week_of_reporting}</span>
                            <span>{new Date(report.date_of_lecture).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="report-details">
                          <p><strong>Topic:</strong> {report.topic}</p>
                          <p><strong>Learning Outcomes:</strong> {report.learning_outcomes || "Not specified"}</p>
                          <p><strong>Attendance:</strong> {report.students_present}/{report.total_students}</p>
                          {report.recommendations && (
                            <p><strong>Recommendations:</strong> {report.recommendations}</p>
                          )}
                          {report.prl_feedback && (
                            <div className="feedback-display">
                              <strong>PRL Feedback:</strong> {report.prl_feedback}
                            </div>
                          )}
                        </div>
                        <div className="report-footer">
                          <small>Submitted on {new Date(report.created_at).toLocaleDateString()}</small>
                          <span className={`status ${report.prl_feedback ? 'reviewed' : 'pending'}`}>
                            {report.prl_feedback ? 'Reviewed by PRL' : 'Pending PRL Review'}
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

        {/* STREAMS TAB */}
        {activeTab === "streams" && (
          <div className="tab-content">
            <div className="streams-overview">
              <h3>Academic Streams Overview</h3>
              
              <div className="streams-grid">
                {streams.map(stream => {
                  const streamModules = modules.filter(m => m.stream === stream.name);
                  const streamReports = reports.filter(r => {
                    const module = modules.find(m => m.module_code === r.course_code);
                    return module?.stream === stream.name;
                  });
                  const streamLecturers = [...new Set(streamReports.map(r => r.lecturer_id))].length;
                  
                  return (
                    <div key={stream.code} className="stream-card">
                      <div className="stream-header">
                        <h4>{stream.name}</h4>
                        <span className="stream-code">{stream.code}</span>
                      </div>
                      
                      <div className="stream-stats">
                        <div className="stat">
                          <span className="number">{streamModules.length}</span>
                          <span className="label">Modules</span>
                        </div>
                        <div className="stat">
                          <span className="number">{streamReports.length}</span>
                          <span className="label">Reports</span>
                        </div>
                        <div className="stat">
                          <span className="number">{streamLecturers}</span>
                          <span className="label">Lecturers</span>
                        </div>
                      </div>

                      <div className="stream-modules">
                        <h5>Modules in this Stream:</h5>
                        {streamModules.length === 0 ? (
                          <p className="no-modules">No modules in this stream yet.</p>
                        ) : (
                          <div className="modules-list">
                            {streamModules.slice(0, 5).map(module => (
                              <div key={module.module_code} className="module-item">
                                <span className="module-code">{module.module_code}</span>
                                <span className="module-name">{module.module_name}</span>
                              </div>
                            ))}
                            {streamModules.length > 5 && (
                              <p className="more-modules">+{streamModules.length - 5} more modules</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Module</h3>
            
            <form onSubmit={handleAddModule}>
              <div className="form-group">
                <label>Module Code *</label>
                <input
                  type="text"
                  name="module_code"
                  value={newModule.module_code}
                  onChange={handleModuleInputChange}
                  placeholder="e.g., DIWA2110"
                  required
                />
              </div>

              <div className="form-group">
                <label>Module Name *</label>
                <input
                  type="text"
                  name="module_name"
                  value={newModule.module_name}
                  onChange={handleModuleInputChange}
                  placeholder="e.g., Web Application Development"
                  required
                />
              </div>

              <div className="form-group">
                <label>Credits</label>
                <select
                  name="credits"
                  value={newModule.credits}
                  onChange={handleModuleInputChange}
                >
                  <option value={12}>12 Credits</option>
                  <option value={24}>24 Credits</option>
                  <option value={36}>36 Credits</option>
                </select>
              </div>

              <div className="form-group">
                <label>Stream *</label>
                <select
                  name="stream"
                  value={newModule.stream}
                  onChange={handleModuleInputChange}
                  required
                >
                  <option value="">Select Stream</option>
                  {streams.map(stream => (
                    <option key={stream.code} value={stream.name}>{stream.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newModule.description}
                  onChange={handleModuleInputChange}
                  placeholder="Module description..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowAddModule(false)} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Adding..." : "Add Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Lecturer Modal */}
      {showAssignLecturer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Assign Lecturer to Module</h3>
            
            <form onSubmit={handleAssignLecturer}>
              <div className="form-group">
                <label>Module *</label>
                <select
                  name="module_code"
                  value={assignmentForm.module_code}
                  onChange={handleAssignmentChange}
                  required
                >
                  <option value="">Select Module</option>
                  {modules.map(module => (
                    <option key={module.module_code} value={module.module_code}>
                      {module.module_code} - {module.module_name} ({module.stream})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Lecturer *</label>
                <select
                  name="lecturer_id"
                  value={assignmentForm.lecturer_id}
                  onChange={handleAssignmentChange}
                  required
                >
                  <option value="">Select Lecturer</option>
                  {lecturers.map(lecturer => (
                    <option key={lecturer.user_id} value={lecturer.user_id}>
                      {lecturer.name} ({lecturer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  name="course_name"
                  value={assignmentForm.course_name}
                  onChange={handleAssignmentChange}
                  placeholder="e.g., Web Development Course"
                />
              </div>

              <div className="form-group">
                <label>Semester</label>
                <select
                  name="semester"
                  value={assignmentForm.semester}
                  onChange={handleAssignmentChange}
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowAssignLecturer(false)} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Assigning..." : "Assign Lecturer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PLDashboard;