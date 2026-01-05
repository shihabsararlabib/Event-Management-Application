import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/RouterConfig'
import Navbar from '../../components/Navbar/Navbar'

const Home = () => {
    const navigate = useNavigate()

  return (
    <div className='Home min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50'>
        <Navbar />
        
        {/* Hero Section */}
        <div className='relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-full h-full opacity-5'>
                <div className='absolute top-20 left-20 w-72 h-72 bg-purple-600 rounded-full blur-3xl'></div>
                <div className='absolute bottom-20 right-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl'></div>
            </div>

            <div className='relative flex flex-col items-center justify-center min-h-[85vh] px-8 py-12'>
                <div className='text-center max-w-5xl'>
                    <div className='inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6'>
                        <span className='w-2 h-2 bg-purple-600 rounded-full animate-pulse'></span>
                        Secure • Reliable • Professional
                    </div>

                    <h1 className='text-7xl font-extrabold mb-6 leading-tight'>
                        <span className='bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'>
                            EventShield
                        </span>
                    </h1>
                    <p className='text-3xl font-semibold text-gray-700 mb-4'>
                        Your Complete Event Management Solution
                    </p>
                    <p className='text-xl text-gray-600 mb-12 max-w-3xl mx-auto'>
                        Create, manage, and secure events with military-grade encryption. 
                        Streamline registrations, track attendance, and ensure data privacy.
                    </p>
                    
                    <div className='flex gap-6 justify-center flex-wrap mb-12'>
                        <button 
                            className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xl font-semibold px-12 py-4 rounded-full shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl'
                            onClick={() => navigate(ROUTES.SignUp)}
                        >
                            🚀 Create Account
                        </button>
                        
                        <button 
                            className='bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600 text-xl font-semibold px-12 py-4 rounded-full shadow-lg transition-all transform hover:scale-105'
                            onClick={() => navigate(ROUTES.Dashboard)}
                        >
                            📅 Browse Events
                        </button>
                    </div>

                    <div className='grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-16'>
                        <div className='text-center'>
                            <div className='text-4xl font-bold text-purple-600 mb-1'>1000+</div>
                            <div className='text-gray-600'>Events Hosted</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-4xl font-bold text-indigo-600 mb-1'>50K+</div>
                            <div className='text-gray-600'>Attendees</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-4xl font-bold text-purple-600 mb-1'>100%</div>
                            <div className='text-gray-600'>Secure</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Features Section */}
        <div className='bg-white py-20'>
            <div className='max-w-7xl mx-auto px-8'>
                <div className='text-center mb-16'>
                    <h2 className='text-4xl font-bold text-gray-800 mb-4'>Why Choose EventShield?</h2>
                    <p className='text-xl text-gray-600'>Industry-leading features for modern event management</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                    <div className='bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2'>
                        <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg'>
                            📅
                        </div>
                        <h3 className='text-xl font-bold mb-3 text-gray-800'>Easy Event Creation</h3>
                        <p className='text-gray-600'>Create and customize events in minutes with our intuitive interface</p>
                    </div>
                    
                    <div className='bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2'>
                        <div className='w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg'>
                            🎟️
                        </div>
                        <h3 className='text-xl font-bold mb-3 text-gray-800'>Smart Registration</h3>
                        <p className='text-gray-600'>Seamless registration process with automated confirmations</p>
                    </div>
                    
                    <div className='bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2'>
                        <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg'>
                            ✅
                        </div>
                        <h3 className='text-xl font-bold mb-3 text-gray-800'>Attendance Tracking</h3>
                        <p className='text-gray-600'>Real-time check-in and attendance monitoring system</p>
                    </div>

                    <div className='bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2'>
                        <div className='w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg'>
                            🔐
                        </div>
                        <h3 className='text-xl font-bold mb-3 text-gray-800'>Military-Grade Security</h3>
                        <p className='text-gray-600'>Custom encryption and 2FA protect all your data</p>
                    </div>
                </div>
            </div>
        </div>

        {/* CTA Section */}
        <div className='bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 py-20'>
            <div className='max-w-4xl mx-auto text-center px-8'>
                <h2 className='text-4xl font-bold text-white mb-6'>Ready to Host Your Next Event?</h2>
                <p className='text-xl text-purple-100 mb-10'>Join thousands of event organizers who trust EventShield</p>
                <div className='flex gap-6 justify-center flex-wrap'>
                    <button 
                        onClick={() => navigate(ROUTES.SignUp)}
                        className='bg-white text-purple-600 hover:bg-gray-100 text-xl font-semibold px-10 py-4 rounded-full shadow-xl transition-all transform hover:scale-105'
                    >
                        Get Started Free
                    </button>
                    <button 
                        onClick={() => navigate(ROUTES.About)}
                        className='border-2 border-white text-white hover:bg-white hover:text-purple-600 text-xl font-semibold px-10 py-4 rounded-full transition-all transform hover:scale-105'
                    >
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Home