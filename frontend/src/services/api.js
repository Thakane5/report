const API_BASE = "https://report-backend-i8m1.onrender.com/";

export const apiService = {
  // ==================== AUTH ENDPOINTS ====================
  async login(email, password) {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async register(userData) {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // ==================== COURSES ENDPOINTS ====================
  async getCourses() {
    const response = await fetch(`${API_BASE}/courses`);
    return response.json();
  },

  // ==================== REPORTS ENDPOINTS ====================
  async createReport(reportData) {
    const response = await fetch(`${API_BASE}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData),
    });
    return response.json();
  },

  async getReports() {
    const response = await fetch(`${API_BASE}/reports`);
    return response.json();
  },

  async getReportsByLecturer(lecturerId) {
    const response = await fetch(`${API_BASE}/reports/lecturer/${lecturerId}`);
    return response.json();
  },

  // ==================== RATINGS ENDPOINTS ====================
  async addRating(ratingData) {
    const response = await fetch(`${API_BASE}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ratingData),
    });
    return response.json();
  },

  async getRatings() {
    const response = await fetch(`${API_BASE}/ratings`);
    return response.json();
  },

  async getRatingsByStudent(studentId) {
    const response = await fetch(`${API_BASE}/ratings/student/${studentId}`);
    return response.json();
  },

  async getRatingsByLecturer(lecturerId) {
    const response = await fetch(`${API_BASE}/ratings/lecturer/${lecturerId}`);
    return response.json();
  },

  // ==================== PRL MANAGEMENT ENDPOINTS ====================
  async addLecturer(lecturerData) {
    const response = await fetch(`${API_BASE}/prl/lecturers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lecturerData),
    });
    return response.json();
  },

  async getLecturers() {
    const response = await fetch(`${API_BASE}/prl/lecturers`);
    return response.json();
  },

  // ==================== STREAMS & MODULES ENDPOINTS ====================
  async getStreams() {
    const response = await fetch(`${API_BASE}/streams`);
    return response.json();
  },

  async getAllModules() {
    const response = await fetch(`${API_BASE}/modules`);
    return response.json();
  },

  async getModulesByStream(stream) {
    const response = await fetch(`${API_BASE}/modules/${encodeURIComponent(stream)}`);
    return response.json();
  }
};

export default apiService;
