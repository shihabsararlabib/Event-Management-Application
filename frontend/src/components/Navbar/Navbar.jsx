import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/RouterConfig'

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  
  // Check dark mode preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  // Check if user is logged in on component mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (error) {
          console.error('Error parsing user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }
    
    checkAuth()
    
    // Listen for storage changes (e.g., login in another tab)
    window.addEventListener('storage', checkAuth)
    
    return () => window.removeEventListener('storage', checkAuth)
  }, [])
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate(ROUTES.Home)
  }
  
  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg dark:shadow-purple-900/20">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate(ROUTES.Home)}
          >
            <img 
              src="/logo192.png" 
              alt="EventShield Logo" 
              className="w-10 h-10 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              EventShield
            </span>
          </div>

          <div className="flex items-center gap-8">
            <span 
              onClick={() => navigate(ROUTES.Home)} 
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer font-medium"
            >
              Home
            </span>
            <span 
              onClick={() => navigate(ROUTES.Dashboard)} 
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer font-medium"
            >
              Events
            </span>
            <span 
              onClick={() => navigate(ROUTES.About)} 
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer font-medium"
            >
              About
            </span>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            {user ? (
              // Logged in state
              <>
                <span 
                  onClick={() => navigate(ROUTES.MyEvents)} 
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer font-medium"
                >
                  My Tickets
                </span>
                <span 
                  onClick={() => navigate(ROUTES.MyCreatedEvents)} 
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer font-medium"
                >
                  My Events
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {user.firstname} {user.lastname}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {user.firstname?.[0]}{user.lastname?.[0]}
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              // Logged out state
              <>
                <button 
                  onClick={() => navigate(ROUTES.Login)} 
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 px-6 py-2 font-semibold transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate(ROUTES.SignUp)} 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar