import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/RouterConfig'
import Navbar from '../../components/Navbar/Navbar'

const About = () => {
    const navigate = useNavigate()

  return (
    <div className='About min-h-screen bg-gradient-to-br from-blue-50 to-orange-50'>
        <Navbar />
        
        <div className='max-w-6xl mx-auto px-8 py-12'>
            <h1 className='text-5xl font-bold text-gray-800 mb-6 text-center'>
                About <span className='text-orange-600'>EventShield</span>
            </h1>
            
            <p className='text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto'>
                A military-grade secure event registration and attendance system built for CSE447 Lab Project
            </p>

            {/* Security Features Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-12'>
                <div className='bg-white p-8 rounded-xl shadow-lg'>
                    <div className='text-5xl mb-4'>🔐</div>
                    <h3 className='text-2xl font-bold mb-3'>Multi-Level Encryption</h3>
                    <ul className='text-gray-700 space-y-2'>
                        <li>• RSA-2048 encryption (custom implementation)</li>
                        <li>• ECC secp256k1 encryption (custom)</li>
                        <li>• Double encryption (RSA → ECC)</li>
                        <li>• All data encrypted before storage</li>
                    </ul>
                </div>

                <div className='bg-white p-8 rounded-xl shadow-lg'>
                    <div className='text-5xl mb-4'>🔑</div>
                    <h3 className='text-2xl font-bold mb-3'>Password Security</h3>
                    <ul className='text-gray-700 space-y-2'>
                        <li>• Custom SHA-256 implementation</li>
                        <li>• Salt + 10,000 iterations</li>
                        <li>• No built-in crypto libraries</li>
                        <li>• Account lockout after 5 failed attempts</li>
                    </ul>
                </div>

                <div className='bg-white p-8 rounded-xl shadow-lg'>
                    <div className='text-5xl mb-4'>📱</div>
                    <h3 className='text-2xl font-bold mb-3'>Two-Factor Authentication</h3>
                    <ul className='text-gray-700 space-y-2'>
                        <li>• TOTP implementation (RFC 6238)</li>
                        <li>• Google Authenticator compatible</li>
                        <li>• Backup codes for recovery</li>
                        <li>• Time-based verification</li>
                    </ul>
                </div>

                <div className='bg-white p-8 rounded-xl shadow-lg'>
                    <div className='text-5xl mb-4'>✅</div>
                    <h3 className='text-2xl font-bold mb-3'>Data Integrity</h3>
                    <ul className='text-gray-700 space-y-2'>
                        <li>• HMAC-SHA256 verification</li>
                        <li>• CBC-MAC implementation</li>
                        <li>• Timestamped MACs</li>
                        <li>• Replay attack prevention</li>
                    </ul>
                </div>

                <div className='bg-white p-8 rounded-xl shadow-lg'>
                    <div className='text-5xl mb-4'>👥</div>
                    <h3 className='text-2xl font-bold mb-3'>Access Control</h3>
                    <ul className='text-gray-700 space-y-2'>
                        <li>• Role-Based Access Control (RBAC)</li>
                        <li>• Admin and User roles</li>
                        <li>• Permission-based operations</li>
                        <li>• Granular access management</li>
                    </ul>
                </div>

                <div className='bg-white p-8 rounded-xl shadow-lg'>
                    <div className='text-5xl mb-4'>🗝️</div>
                    <h3 className='text-2xl font-bold mb-3'>Key Management</h3>
                    <ul className='text-gray-700 space-y-2'>
                        <li>• Automated key generation</li>
                        <li>• 30-day key rotation</li>
                        <li>• Secure key storage</li>
                        <li>• Key revocation support</li>
                    </ul>
                </div>
            </div>

            {/* Tech Stack */}
            <div className='bg-gradient-to-r from-blue-600 to-orange-600 text-white p-8 rounded-xl shadow-xl mb-8'>
                <h2 className='text-3xl font-bold mb-6 text-center'>Technology Stack</h2>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-6 text-center'>
                    <div>
                        <div className='text-4xl mb-2'>⚛️</div>
                        <div className='font-semibold'>React.js</div>
                    </div>
                    <div>
                        <div className='text-4xl mb-2'>🟢</div>
                        <div className='font-semibold'>Node.js</div>
                    </div>
                    <div>
                        <div className='text-4xl mb-2'>🍃</div>
                        <div className='font-semibold'>MongoDB</div>
                    </div>
                    <div>
                        <div className='text-4xl mb-2'>⚡</div>
                        <div className='font-semibold'>Express.js</div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className='text-center'>
                <h2 className='text-3xl font-bold mb-4'>Ready to Experience Secure Events?</h2>
                <div className='flex gap-4 justify-center'>
                    <button 
                        onClick={() => navigate(ROUTES.SignUp)}
                        className='bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all transform hover:scale-105'
                    >
                        Create Account
                    </button>
                    <button 
                        onClick={() => navigate(ROUTES.Home)}
                        className='bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all transform hover:scale-105'
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default About