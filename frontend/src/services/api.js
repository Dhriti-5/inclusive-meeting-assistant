import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token here when authentication is fully implemented
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export const authAPI = {
  // Register new user
  register: (email, password, name) => 
    api.post('/api/auth/register', { email, password, name }),
  
  // Login user
  login: (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email) // OAuth2 expects 'username' field
    formData.append('password', password)
    
    return api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },
  
  // Get current user info
  getCurrentUser: () => api.get('/api/auth/me'),
}

export const meetingAPI = {
  // Join a meeting (create new session)
  joinMeeting: (meetingName = 'Untitled Meeting', meetingUrl = null) => 
    api.post('/api/meetings/join', { name: meetingName, url: meetingUrl }),
  
  // Upload audio file for processing
  uploadAudio: (meetingId, audioFile, language = 'en') => {
    const formData = new FormData()
    formData.append('audio', audioFile)
    formData.append('lang', language)
    
    return api.post(`/api/meetings/${meetingId}/upload-audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // Get meeting status
  getMeetingStatus: (meetingId) => api.get(`/api/meetings/${meetingId}/status`),
  
  // Get live transcript
  getLiveTranscript: (meetingId) => api.get(`/api/meetings/${meetingId}/transcript`),
  
  // Get meeting history
  getMeetingHistory: () => api.get('/api/meetings/history'),
  
  // Get meeting report
  getMeetingReport: (meetingId) => api.get(`/api/meetings/${meetingId}/report`),
  
  // End meeting
  endMeeting: (meetingId) => api.post(`/api/meetings/${meetingId}/end`),
  
  // Download PDF
  downloadPDF: (meetingId) => api.get(`/api/meetings/${meetingId}/pdf`, { responseType: 'blob' }),
  
  // Get action items
  getActionItems: (meetingId) => api.get(`/api/meetings/${meetingId}/actions`),
  
  // Send meeting summary via email
  sendEmail: (meetingId, email) => api.post(`/api/meetings/${meetingId}/email`, null, {
    params: { email }
  }),
  
  // Chat with meeting (RAG)
  chatWithMeeting: (meetingId, question) => 
    api.post(`/api/meetings/${meetingId}/chat`, { meeting_id: meetingId, question }),
  
  // Check RAG availability
  checkRAGHealth: (meetingId) => api.get(`/api/meetings/${meetingId}/chat/health`),
}

export default api
