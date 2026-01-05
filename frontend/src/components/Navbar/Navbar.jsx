import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/RouterConfig'

function Navbar() {
  const navigate = useNavigate()
  
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
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar