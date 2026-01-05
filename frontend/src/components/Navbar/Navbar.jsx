import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/RouterConfig'

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  
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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg">
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
              className="text-gray-700 hover:text-purple-600 transition-colors cursor-pointer font-medium"
            >
              Home
            </span>
            <span 
              onClick={() => navigate(ROUTES.Dashboard)} 
              className="text-gray-700 hover:text-purple-600 transition-colors cursor-pointer font-medium"
            >
              Events
            </span>
            <span 
              onClick={() => navigate(ROUTES.About)} 
              className="text-gray-700 hover:text-purple-600 transition-colors cursor-pointer font-medium"
            >
              About
            </span>
            
            {user ? (
              // Logged in state
              <>
                <span 
                  onClick={() => navigate(ROUTES.MyEvents)} 
                  className="text-gray-700 hover:text-purple-600 transition-colors cursor-pointer font-medium"
                >
                  My Tickets
                </span>
                <span 
                  onClick={() => navigate(ROUTES.MyCreatedEvents)} 
                  className="text-gray-700 hover:text-purple-600 transition-colors cursor-pointer font-medium"
                >
                  My Events
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-800">
                      {user.firstname} {user.lastname}
                    </span>
                    <span className="text-xs text-gray-500">{user.email}</span>
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
                  className="text-purple-600 hover:text-purple-700 px-6 py-2 font-semibold transition-colors"
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