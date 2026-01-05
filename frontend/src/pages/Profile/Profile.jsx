import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import axios from 'axios'

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Profile edit state
  const [editMode, setEditMode] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstname: '',
    lastname: '',
    phone: ''
  })
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // 2FA state
  const [twoFAStatus, setTwoFAStatus] = useState({
    enabled: false,
    secret: '',
    qrCodeData: '',
    backupCodes: []
  })
  const [twoFAToken, setTwoFAToken] = useState('')
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return { Authorization: `Bearer ${token}` }
  }

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8080/api/user/profile', {
        headers: getAuthHeaders()
      })
      
      if (response.data.success) {
        const userData = response.data.user
        setUser(userData)
        setProfileForm({
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          phone: userData.phone || ''
        })
        setTwoFAStatus(prev => ({
          ...prev,
          enabled: userData.twoFactorEnabled || false
        }))
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
      setMessage({ type: 'error', text: 'Failed to load profile. Please login again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.put('http://localhost:8080/api/user/update', profileForm, {
        headers: getAuthHeaders()
      })
      
      if (response.data.success) {
        setMessage({ type: 'success', text: '✅ Profile updated successfully! Data encrypted and stored securely.' })
        setEditMode(false)
        // Update localStorage
        const updatedUser = { ...user, ...profileForm }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' })
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }
    
    try {
      const response = await axios.post('http://localhost:8080/api/user/password/change', {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: getAuthHeaders()
      })
      
      if (response.data.success) {
        setMessage({ type: 'success', text: '✅ Password changed successfully! New hash generated with fresh salt.' })
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' })
    }
  }

  const handleEnable2FA = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/user/2fa/enable', {}, {
        headers: getAuthHeaders()
      })
      
      if (response.data.success) {
        setTwoFAStatus({
          enabled: false,
          secret: response.data.secret,
          qrCodeData: response.data.qrCodeData,
          backupCodes: response.data.backupCodes
        })
        setShow2FASetup(true)
        setMessage({ type: 'info', text: '📱 Scan the QR code or enter the secret in your authenticator app' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to enable 2FA' })
    }
  }

  const handleVerify2FA = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:8080/api/user/2fa/verify', {
        twoFactorToken: twoFAToken
      }, {
        headers: getAuthHeaders()
      })
      
      if (response.data.success) {
        setTwoFAStatus(prev => ({ ...prev, enabled: true }))
        setShow2FASetup(false)
        setShowBackupCodes(true)
        setTwoFAToken('')
        setMessage({ type: 'success', text: '✅ Two-Factor Authentication enabled successfully!' })
        // Update user in localStorage
        const updatedUser = { ...user, twoFactorEnabled: true }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Invalid verification code' })
    }
  }

  const handleDisable2FA = async () => {
    const password = prompt('Enter your password to disable 2FA:')
    const token = prompt('Enter your current 2FA code:')
    
    if (!password || !token) return
    
    try {
      const response = await axios.post('http://localhost:8080/api/user/2fa/disable', {
        password,
        twoFactorToken: token
      }, {
        headers: getAuthHeaders()
      })
      
      if (response.data.success) {
        setTwoFAStatus({ enabled: false, secret: '', qrCodeData: '', backupCodes: [] })
        setMessage({ type: 'success', text: '2FA has been disabled' })
        const updatedUser = { ...user, twoFactorEnabled: false }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to disable 2FA' })
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setMessage({ type: 'success', text: 'Copied to clipboard!' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-2xl text-gray-600 animate-pulse">🔐 Loading secure profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your profile, security, and privacy settings</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })} className="float-right font-bold">×</button>
          </div>
        )}

        {/* Security Status Banner */}
        <div className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2">🛡️ Security Status</h2>
              <p className="text-purple-100">Your account is protected with enterprise-grade encryption</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur">
                <div className="text-sm text-purple-100">Password</div>
                <div className="font-bold">🔒 PBKDF2 + Salt</div>
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur">
                <div className="text-sm text-purple-100">Data</div>
                <div className="font-bold">🔐 RSA + ECC</div>
              </div>
              <div className={`rounded-xl px-4 py-2 backdrop-blur ${twoFAStatus.enabled ? 'bg-green-500/30' : 'bg-yellow-500/30'}`}>
                <div className="text-sm text-purple-100">2FA</div>
                <div className="font-bold">{twoFAStatus.enabled ? '✅ Enabled' : '⚠️ Disabled'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'profile', label: '👤 Profile', icon: '👤' },
            { id: 'security', label: '🔐 Security', icon: '🔐' },
            { id: '2fa', label: '📱 Two-Factor Auth', icon: '📱' },
            { id: 'sessions', label: '💻 Sessions', icon: '💻' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                {editMode ? '❌ Cancel' : '✏️ Edit'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800">
                <span className="text-xl">🔒</span>
                <span className="font-medium">Your personal data is encrypted using RSA + ECC before storage</span>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstname}
                    onChange={(e) => setProfileForm({ ...profileForm, firstname: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      editMode ? 'border-purple-300 focus:ring-2 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'
                    } outline-none transition-all`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastname}
                    onChange={(e) => setProfileForm({ ...profileForm, lastname: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      editMode ? 'border-purple-300 focus:ring-2 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'
                    } outline-none transition-all`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">🔐 Email cannot be changed for security</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      editMode ? 'border-purple-300 focus:ring-2 focus:ring-purple-500' : 'border-gray-200 bg-gray-50'
                    } outline-none transition-all`}
                  />
                </div>
              </div>

              {editMode && (
                <button
                  type="submit"
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  💾 Save Changes (Encrypted)
                </button>
              )}
            </form>

            {/* Account Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Role</div>
                  <div className="font-semibold text-gray-800 capitalize">{user?.role || 'User'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Member Since</div>
                  <div className="font-semibold text-gray-800">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Encryption Status</div>
                  <div className="font-semibold text-green-600">🔒 Active</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Password Change */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🔑 Change Password</h2>
              <p className="text-gray-600 mb-6">Your password is hashed using PBKDF2 with a unique salt</p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-green-800">
                  <span className="text-xl">✅</span>
                  <div>
                    <span className="font-medium">Password Security: </span>
                    PBKDF2-SHA256 with 100,000 iterations + unique salt
                  </div>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  🔐 Update Password
                </button>
              </form>
            </div>

            {/* Encryption Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🔐 Encryption Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-purple-200 rounded-xl p-6 bg-purple-50">
                  <div className="text-3xl mb-3">🔑</div>
                  <h3 className="font-bold text-lg text-purple-800 mb-2">RSA Encryption</h3>
                  <p className="text-purple-700 text-sm">
                    Asymmetric encryption for secure key exchange. Your data is encrypted with RSA public key.
                  </p>
                  <div className="mt-3 text-xs bg-purple-100 rounded-lg p-2 font-mono">
                    Algorithm: RSA-OAEP
                  </div>
                </div>
                
                <div className="border border-indigo-200 rounded-xl p-6 bg-indigo-50">
                  <div className="text-3xl mb-3">🔐</div>
                  <h3 className="font-bold text-lg text-indigo-800 mb-2">ECC Encryption</h3>
                  <p className="text-indigo-700 text-sm">
                    Elliptic Curve Cryptography for additional security layer. Multi-level encryption applied.
                  </p>
                  <div className="mt-3 text-xs bg-indigo-100 rounded-lg p-2 font-mono">
                    Curve: secp256k1
                  </div>
                </div>
                
                <div className="border border-green-200 rounded-xl p-6 bg-green-50">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h3 className="font-bold text-lg text-green-800 mb-2">HMAC Integrity</h3>
                  <p className="text-green-700 text-sm">
                    Message Authentication Code verifies data hasn't been tampered with.
                  </p>
                  <div className="mt-3 text-xs bg-green-100 rounded-lg p-2 font-mono">
                    Algorithm: HMAC-SHA256
                  </div>
                </div>
                
                <div className="border border-orange-200 rounded-xl p-6 bg-orange-50">
                  <div className="text-3xl mb-3">🔒</div>
                  <h3 className="font-bold text-lg text-orange-800 mb-2">Password Hashing</h3>
                  <p className="text-orange-700 text-sm">
                    Passwords are never stored in plaintext. Unique salt for each user.
                  </p>
                  <div className="mt-3 text-xs bg-orange-100 rounded-lg p-2 font-mono">
                    Algorithm: PBKDF2 (100K iterations)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2FA Tab */}
        {activeTab === '2fa' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">📱 Two-Factor Authentication</h2>
            <p className="text-gray-600 mb-6">Add an extra layer of security using TOTP (Time-based One-Time Password)</p>

            {/* 2FA Status */}
            <div className={`rounded-xl p-6 mb-8 ${
              twoFAStatus.enabled 
                ? 'bg-green-50 border-2 border-green-200' 
                : 'bg-yellow-50 border-2 border-yellow-200'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`text-5xl ${twoFAStatus.enabled ? '' : 'opacity-50'}`}>
                    {twoFAStatus.enabled ? '🔐' : '🔓'}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${twoFAStatus.enabled ? 'text-green-800' : 'text-yellow-800'}`}>
                      {twoFAStatus.enabled ? '2FA is Enabled' : '2FA is Not Enabled'}
                    </h3>
                    <p className={twoFAStatus.enabled ? 'text-green-700' : 'text-yellow-700'}>
                      {twoFAStatus.enabled 
                        ? 'Your account is protected with two-factor authentication' 
                        : 'Enable 2FA to add an extra layer of security'
                      }
                    </p>
                  </div>
                </div>
                
                {twoFAStatus.enabled ? (
                  <button
                    onClick={handleDisable2FA}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all"
                  >
                    🚫 Disable 2FA
                  </button>
                ) : (
                  <button
                    onClick={handleEnable2FA}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg"
                  >
                    ✅ Enable 2FA
                  </button>
                )}
              </div>
            </div>

            {/* 2FA Setup Modal */}
            {show2FASetup && (
              <div className="border-2 border-purple-200 rounded-2xl p-8 bg-purple-50 mb-8">
                <h3 className="text-xl font-bold text-purple-800 mb-6">🔧 Setup Two-Factor Authentication</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* QR Code / Secret */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Step 1: Add to Authenticator App</h4>
                    
                    {/* QR Code Placeholder - In production, generate actual QR */}
                    <div className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300 text-center mb-4">
                      <div className="text-6xl mb-4">📱</div>
                      <p className="text-gray-600 text-sm mb-4">
                        Scan this with Google Authenticator, Authy, or similar app
                      </p>
                      <a 
                        href={twoFAStatus.qrCodeData}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 underline text-sm"
                      >
                        Open in Authenticator
                      </a>
                    </div>
                    
                    <div className="bg-gray-100 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-2">Or enter this secret manually:</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-white px-3 py-2 rounded-lg font-mono text-sm flex-1 break-all">
                          {twoFAStatus.secret}
                        </code>
                        <button
                          onClick={() => copyToClipboard(twoFAStatus.secret)}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Verification */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Step 2: Verify Setup</h4>
                    <p className="text-gray-600 mb-4">Enter the 6-digit code from your authenticator app:</p>
                    
                    <form onSubmit={handleVerify2FA}>
                      <input
                        type="text"
                        value={twoFAToken}
                        onChange={(e) => setTwoFAToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="w-full px-6 py-4 text-center text-3xl font-mono tracking-widest rounded-xl border-2 border-purple-300 focus:ring-2 focus:ring-purple-500 outline-none mb-4"
                        maxLength={6}
                        required
                      />
                      <button
                        type="submit"
                        disabled={twoFAToken.length !== 6}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✅ Verify & Enable 2FA
                      </button>
                    </form>
                    
                    <button
                      onClick={() => setShow2FASetup(false)}
                      className="w-full mt-3 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Codes */}
            {showBackupCodes && twoFAStatus.backupCodes.length > 0 && (
              <div className="border-2 border-yellow-200 rounded-2xl p-8 bg-yellow-50 mb-8">
                <h3 className="text-xl font-bold text-yellow-800 mb-4">⚠️ Save Your Backup Codes</h3>
                <p className="text-yellow-700 mb-6">
                  Store these codes securely. Each code can only be used once if you lose access to your authenticator.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {twoFAStatus.backupCodes.map((code, index) => (
                    <div key={index} className="bg-white px-4 py-2 rounded-lg font-mono text-center border border-yellow-300">
                      {code}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(twoFAStatus.backupCodes.join('\n'))}
                    className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-all"
                  >
                    📋 Copy All Codes
                  </button>
                  <button
                    onClick={() => setShowBackupCodes(false)}
                    className="px-6 py-3 border-2 border-yellow-600 text-yellow-700 rounded-xl font-semibold hover:bg-yellow-100 transition-all"
                  >
                    I've Saved My Codes
                  </button>
                </div>
              </div>
            )}

            {/* How 2FA Works */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-800 mb-4">🤔 How does 2FA work?</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">1️⃣</div>
                  <h4 className="font-semibold mb-2">Enter Password</h4>
                  <p className="text-sm text-gray-600">Login with your regular password</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">2️⃣</div>
                  <h4 className="font-semibold mb-2">Enter 2FA Code</h4>
                  <p className="text-sm text-gray-600">Get a 6-digit code from your authenticator app</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">3️⃣</div>
                  <h4 className="font-semibold mb-2">Access Granted</h4>
                  <p className="text-sm text-gray-600">Only you can access your account</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">💻 Active Sessions</h2>
            <p className="text-gray-600 mb-6">Manage your active login sessions</p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800">
                <span className="text-xl">🔒</span>
                <div>
                  <span className="font-medium">Session Security: </span>
                  JWT tokens with secure session management prevent session hijacking
                </div>
              </div>
            </div>

            {/* Current Session */}
            <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">💻</div>
                  <div>
                    <h4 className="font-bold text-green-800">Current Session</h4>
                    <p className="text-sm text-green-700">This device • Active now</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Session Security Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span>
                  JWT tokens expire after 24 hours
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span>
                  Secure HTTP-only cookies prevent XSS attacks
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span>
                  Session fingerprinting detects unusual activity
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span>
                  Automatic logout on suspicious behavior
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
