import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '@/services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token')
      
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const response = await authAPI.getCurrentUser()
        setUser(response.data)
        setToken(storedToken)
      } catch (error) {
        console.error('Auth check failed:', error)
        // Token is invalid, clear it
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      const { access_token } = response.data
      
      localStorage.setItem('token', access_token)
      setToken(access_token)
      
      // Fetch user data
      const userResponse = await authAPI.getCurrentUser()
      setUser(userResponse.data)
      
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed. Please try again.'
      }
    }
  }

  const register = async (email, password, name) => {
    try {
      await authAPI.register(email, password, name)
      
      // Auto-login after registration
      return await login(email, password)
    } catch (error) {
      console.error('Registration failed:', error)
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed. Please try again.'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
