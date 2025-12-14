import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token here if needed
    // const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const meetingAPI = {
  // Join a meeting
  joinMeeting: (meetingUrl) => api.post('/meetings/join', { url: meetingUrl }),
  
  // Get meeting status
  getMeetingStatus: (meetingId) => api.get(`/meetings/${meetingId}/status`),
  
  // Get live transcript
  getLiveTranscript: (meetingId) => api.get(`/meetings/${meetingId}/transcript`),
  
  // Get meeting history
  getMeetingHistory: () => api.get('/meetings/history'),
  
  // Get meeting report
  getMeetingReport: (meetingId) => api.get(`/meetings/${meetingId}/report`),
  
  // End meeting
  endMeeting: (meetingId) => api.post(`/meetings/${meetingId}/end`),
  
  // Download PDF
  downloadPDF: (meetingId) => api.get(`/meetings/${meetingId}/pdf`, { responseType: 'blob' }),
  
  // Get action items
  getActionItems: (meetingId) => api.get(`/meetings/${meetingId}/actions`),
}

export default api
