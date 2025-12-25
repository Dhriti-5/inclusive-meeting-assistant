import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Moon, Sun, User, LayoutDashboard, LogOut, Settings, ChevronDown, Hand } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/shared/Button'

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    navigate('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">
              InclusiveMeet
            </span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/sign-language"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/sign-language'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Hand className="w-4 h-4" />
                Sign Language
              </Link>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="md"
              onClick={toggleTheme}
              className="rounded-full p-2"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* User Profile Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings & Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="md">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
