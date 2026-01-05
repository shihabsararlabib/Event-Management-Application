import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/RouterConfig'
import Navbar from '../../components/Navbar/Navbar'

const Home = () => {
    const navigate = useNavigate()

  return (
    <div className='Home min-h-screen'>
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
                        🔐 End-to-End Encrypted • Military-Grade Security
                    </div>

                    <h1 className='text-6xl md:text-7xl font-extrabold mb-6 leading-tight'>
                        <span className='bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'>
                            EventShield
                        </span>
                    </h1>
                    <p className='text-2xl md:text-3xl font-semibold text-gray-700 mb-4'>
                        Secure Event Management Platform
                    </p>
                    <p className='text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto'>
                        Create, manage, and secure events with custom-built RSA + ECC encryption. 
                        Your data is protected with two-factor authentication, HMAC integrity checks, and role-based access control.
                    </p>
                    
                    <div className='flex gap-4 md:gap-6 justify-center flex-wrap mb-12'>
                        <button 
                            className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg md:text-xl font-semibold px-8 md:px-12 py-4 rounded-full shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl'
                            onClick={() => navigate(ROUTES.SignUp)}
                        >
                            🔐 Create Secure Account
                        </button>
                        
                        <button 
                            className='bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600 text-lg md:text-xl font-semibold px-8 md:px-12 py-4 rounded-full shadow-lg transition-all transform hover:scale-105'
                            onClick={() => navigate(ROUTES.Dashboard)}
                        >
                            📅 Browse Events
                        </button>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mb-16'>
                        <div className='text-center bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg'>
                            <div className='text-3xl md:text-4xl font-bold text-purple-600 mb-1'>RSA+ECC</div>
                            <div className='text-gray-600 text-sm'>Encryption</div>
                        </div>
                        <div className='text-center bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg'>
                            <div className='text-3xl md:text-4xl font-bold text-indigo-600 mb-1'>2FA</div>
                            <div className='text-gray-600 text-sm'>Authentication</div>
                        </div>
                        <div className='text-center bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg'>
                            <div className='text-3xl md:text-4xl font-bold text-purple-600 mb-1'>HMAC</div>
                            <div className='text-gray-600 text-sm'>Data Integrity</div>
                        </div>
                        <div className='text-center bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg'>
                            <div className='text-3xl md:text-4xl font-bold text-indigo-600 mb-1'>RBAC</div>
                            <div className='text-gray-600 text-sm'>Access Control</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Security Features Section */}
        <div className='bg-gray-900 py-20'>
            <div className='max-w-7xl mx-auto px-8'>
                <div className='text-center mb-16'>
                    <span className='inline-block bg-purple-600/20 text-purple-400 px-4 py-2 rounded-full text-sm font-semibold mb-4'>
                        🛡️ SECURITY FEATURES
                    </span>
                    <h2 className='text-4xl font-bold text-white mb-4'>Enterprise-Grade Protection</h2>
                    <p className='text-xl text-gray-400'>Custom-built security algorithms protecting every aspect of your data</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <div className='bg-gradient-to-br from-purple-900/50 to-gray-900 p-8 rounded-2xl border border-purple-500/30 hover:border-purple-500 transition-all'>
                        <div className='text-4xl mb-4'>🔐</div>
                        <h3 className='text-xl font-bold mb-3 text-white'>RSA Encryption</h3>
                        <p className='text-gray-400 mb-4'>Asymmetric encryption for secure key exchange and data protection</p>
                        <div className='text-xs font-mono bg-gray-800 rounded px-3 py-2 text-purple-400'>
                            Algorithm: RSA-OAEP (Custom Implementation)
                        </div>
                    </div>

                    <div className='bg-gradient-to-br from-indigo-900/50 to-gray-900 p-8 rounded-2xl border border-indigo-500/30 hover:border-indigo-500 transition-all'>
                        <div className='text-4xl mb-4'>🔑</div>
                        <h3 className='text-xl font-bold mb-3 text-white'>ECC Encryption</h3>
                        <p className='text-gray-400 mb-4'>Elliptic Curve Cryptography for multi-level security layer</p>
                        <div className='text-xs font-mono bg-gray-800 rounded px-3 py-2 text-indigo-400'>
                            Curve: secp256k1 (Custom Implementation)
                        </div>
                    </div>

                    <div className='bg-gradient-to-br from-green-900/50 to-gray-900 p-8 rounded-2xl border border-green-500/30 hover:border-green-500 transition-all'>
                        <div className='text-4xl mb-4'>📱</div>
                        <h3 className='text-xl font-bold mb-3 text-white'>Two-Factor Authentication</h3>
                        <p className='text-gray-400 mb-4'>TOTP-based 2FA with backup codes for account recovery</p>
                        <div className='text-xs font-mono bg-gray-800 rounded px-3 py-2 text-green-400'>
                            Protocol: TOTP (RFC 6238 Custom)
                        </div>
                    </div>

                    <div className='bg-gradient-to-br from-orange-900/50 to-gray-900 p-8 rounded-2xl border border-orange-500/30 hover:border-orange-500 transition-all'>
                        <div className='text-4xl mb-4'>🔒</div>
                        <h3 className='text-xl font-bold mb-3 text-white'>Password Hashing</h3>
                        <p className='text-gray-400 mb-4'>PBKDF2 with unique salt per user, 100K iterations</p>
                        <div className='text-xs font-mono bg-gray-800 rounded px-3 py-2 text-orange-400'>
                            Algorithm: PBKDF2-SHA256 (Custom)
                        </div>
                    </div>

                    <div className='bg-gradient-to-br from-blue-900/50 to-gray-900 p-8 rounded-2xl border border-blue-500/30 hover:border-blue-500 transition-all'>
                        <div className='text-4xl mb-4'>🛡️</div>
                        <h3 className='text-xl font-bold mb-3 text-white'>HMAC Integrity</h3>
                        <p className='text-gray-400 mb-4'>Message Authentication Codes verify data hasn't been tampered</p>
                        <div className='text-xs font-mono bg-gray-800 rounded px-3 py-2 text-blue-400'>
                            Algorithm: HMAC-SHA256 (Custom)
                        </div>
                    </div>

                    <div className='bg-gradient-to-br from-pink-900/50 to-gray-900 p-8 rounded-2xl border border-pink-500/30 hover:border-pink-500 transition-all'>
                        <div className='text-4xl mb-4'>👥</div>
                        <h3 className='text-xl font-bold mb-3 text-white'>Role-Based Access</h3>
                        <p className='text-gray-400 mb-4'>RBAC with admin/user roles restricting sensitive operations</p>
                        <div className='text-xs font-mono bg-gray-800 rounded px-3 py-2 text-pink-400'>
                            Roles: Admin, User, Event Creator
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Features Section */}
        <div className='bg-white py-20'>
            <div className='max-w-7xl mx-auto px-8'>
                <div className='text-center mb-16'>
                    <h2 className='text-4xl font-bold text-gray-800 mb-4'>Event Management Features</h2>
                    <p className='text-xl text-gray-600'>Powerful tools for modern event organizers</p>
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
                        <h3 className='text-xl font-bold mb-3 text-gray-800'>Encrypted Tickets</h3>
                        <p className='text-gray-600'>Digital tickets with ECC encryption for tamper-proof verification</p>
                    </div>
                    
                    <div className='bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2'>
                        <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg'>
                            ✅
                        </div>
                        <h3 className='text-xl font-bold mb-3 text-gray-800'>Secure Check-in</h3>
                        <p className='text-gray-600'>Real-time attendance tracking with HMAC-verified data</p>
                    </div>

                    <div className='bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2'>
                        <div className='w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg'>
                            👤
                        </div>
                        <h3 className='text-xl font-bold mb-3 text-gray-800'>Profile Security</h3>
                        <p className='text-gray-600'>All user data encrypted at rest with 2FA protection</p>
                    </div>
                </div>
            </div>
        </div>

        {/* CTA Section */}
        <div className='bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 py-20'>
            <div className='max-w-4xl mx-auto text-center px-8'>
                <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>Ready to Host Your Next Secure Event?</h2>
                <p className='text-lg md:text-xl text-purple-100 mb-10'>
                    Join EventShield and experience military-grade security for your events
                </p>
                <div className='flex gap-4 md:gap-6 justify-center flex-wrap'>
                    <button 
                        onClick={() => navigate(ROUTES.SignUp)}
                        className='bg-white text-purple-600 hover:bg-gray-100 text-lg md:text-xl font-semibold px-8 md:px-10 py-4 rounded-full shadow-xl transition-all transform hover:scale-105'
                    >
                        🔐 Get Started Free
                    </button>
                    <button 
                        onClick={() => navigate(ROUTES.About)}
                        className='border-2 border-white text-white hover:bg-white hover:text-purple-600 text-lg md:text-xl font-semibold px-8 md:px-10 py-4 rounded-full transition-all transform hover:scale-105'
                    >
                        Learn More
                    </button>
                </div>
            </div>
        </div>

        {/* Footer */}
        <footer className='bg-gray-900 py-12'>
            <div className='max-w-7xl mx-auto px-8'>
                <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
                    <div className='flex items-center gap-3'>
                        <span className='text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent'>
                            EventShield
                        </span>
                        <span className='text-gray-500 text-sm'>|</span>
                        <span className='text-gray-400 text-sm'>Secure Event Management</span>
                    </div>
                    <div className='flex items-center gap-6 text-sm text-gray-400'>
                        <span className='flex items-center gap-2'>
                            <span className='text-green-500'>●</span>
                            All Systems Encrypted
                        </span>
                        <span>© 2026 EventShield</span>
                    </div>
                </div>
            </div>
        </footer>
    </div>
  )
}

export default Home