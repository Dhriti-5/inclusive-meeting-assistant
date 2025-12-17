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
    return Promise.reject(error)
  }
)

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
}

export default api
