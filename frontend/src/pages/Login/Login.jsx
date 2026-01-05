import React, { useState } from 'react'
import "./Login.css"
import email_icon from "../../assets/icons/email.png"
import pass_icon from "../../assets/icons/password.png"
import TextNIcon from '../../components/TextNIcon/TextNIcon'
import { ROUTES } from '../../routes/RouterConfig'
import axios from "axios"
import { useNavigate } from "react-router-dom"

const styles = {
    body: "login__body flex items-center justify-center min-h-screen font-openSans py-12",
    login__container: "login__container flex flex-col items-center justify-around py-[60px] border-0 border-purple-100 px-[30px] bg-white rounded-2xl shadow-2xl m-2 w-[90%] max-w-[480px]",
    login__title: "login__title text-left w-full",
    login__title_h1: "login__title--h1 text-4xl md:text-5xl pb-0 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent",
    login__form: "login__form w-full pt-[40px]",
    RemFor_container: "flex justify-between items-center mt-[30px]",
    checkbox__container: "checkbox__container flex items-center",
    checkbox__box: "accent-purple-600",
    checkbox__label: "ml-1 checkbox__label text-gray-700",
    forgotPass__conatiner: "ml-auto",
    forgotPass__link: "forgotPass__link hover:underline hover:decoration-solid text-purple-600 hover:text-purple-700",
    login__button: "login__button text-center w-full text-xl font-semibold block mt-[30px] rounded-full py-[14px] text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    signUp__container: "flex mt-[40px] text-gray-700",
    signUp__text: "",
    signup__link: "login__signup pl-2 font-semibold hover:underline hover:decoration-solid text-purple-600 hover:text-purple-700"
}

function Login() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1: credentials, 2: 2FA
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [loginForm, setLoginForm] = useState({
        email: "",
        password: "",
        rememberMe: false,
        twoFactorToken: ""
    })

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError('')

        try {
            const payload = {
                email: loginForm.email,
                password: loginForm.password
            }

            // Include 2FA token if in step 2
            if (step === 2) {
                payload.twoFactorToken = loginForm.twoFactorToken
            }

            const res = await axios.post('http://localhost:8080/api/user/login', payload)

            // Store token and user data in localStorage
            if (res.data.token) {
                localStorage.setItem('token', res.data.token)
            }
            if (res.data.user) {
                localStorage.setItem('user', JSON.stringify(res.data.user))
            }

            navigate("/dashboard")

        } catch (err) {
            console.error('Login error:', err)
            
            // Check if 2FA is required
            if (err.response?.status === 403 && 
                (err.response?.data?.message?.includes('2FA') || 
                 err.response?.data?.requires2FA)) {
                setStep(2)
                setError('')
            } else {
                setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target
        setLoginForm(prevState => ({
            ...prevState,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const handleBackToStep1 = () => {
        setStep(1)
        setLoginForm(prev => ({ ...prev, twoFactorToken: '' }))
        setError('')
    }

    return (
        <div className={styles.body}>
            <div className={styles.login__container}>
                {/* Security Badge */}
                <div className="w-full mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl py-2 px-4">
                        <span>🔒</span>
                        <span>Secure Login • RSA + ECC Encrypted</span>
                    </div>
                </div>

                <div className={styles.login__title}>
                    <h1 className={styles.login__title_h1}>
                        {step === 1 ? 'Log In' : '🔐 2FA Verification'}
                    </h1>
                    {step === 2 && (
                        <p className="text-gray-600 mt-2 text-sm">
                            Enter the 6-digit code from your authenticator app
                        </p>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="w-full mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.login__form}>
                    {step === 1 ? (
                        // Step 1: Email & Password
                        <>
                            <TextNIcon
                                icon={email_icon}
                                type="email"
                                placeholder="Email address"
                                name="email"
                                value={loginForm.email}
                                changehandler={handleChange}
                            />
                            <TextNIcon
                                icon={pass_icon}
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={loginForm.password}
                                changehandler={handleChange}
                            />

                            <div className={styles.RemFor_container}>
                                <div className={styles.checkbox__container}>
                                    <input
                                        type="checkbox"
                                        id='rememberMe'
                                        className={styles.checkbox__box}
                                        name="rememberMe"
                                        onChange={handleChange}
                                        checked={loginForm.rememberMe}
                                    />
                                    <label htmlFor="rememberMe" className={styles.checkbox__label}>
                                        Remember Me
                                    </label>
                                </div>
                                <div className={styles.forgotPass__conatiner}>
                                    <a href={ROUTES.Forgotpassword} className={styles.forgotPass__link}>
                                        Forgot Password?
                                    </a>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Step 2: 2FA Token
                        <>
                            <div className="mb-6">
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">📱</span>
                                        <div>
                                            <p className="font-medium text-purple-800">
                                                Two-Factor Authentication Required
                                            </p>
                                            <p className="text-sm text-purple-600">
                                                Open your authenticator app (Google Authenticator, Authy, etc.)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter 6-digit code
                                </label>
                                <input
                                    type="text"
                                    name="twoFactorToken"
                                    value={loginForm.twoFactorToken}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                                        setLoginForm(prev => ({ ...prev, twoFactorToken: value }))
                                    }}
                                    placeholder="000000"
                                    className="w-full px-6 py-4 text-center text-3xl font-mono tracking-[0.5em] rounded-xl border-2 border-purple-300 focus:ring-2 focus:ring-purple-500 outline-none"
                                    maxLength={6}
                                    autoFocus
                                    required
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleBackToStep1}
                                className="w-full text-purple-600 hover:text-purple-700 text-sm mb-4 hover:underline"
                            >
                                ← Back to login
                            </button>
                        </>
                    )}

                    <button
                        type="submit"
                        className={styles.login__button}
                        disabled={loading || (step === 2 && loginForm.twoFactorToken.length !== 6)}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {step === 1 ? 'Authenticating...' : 'Verifying...'}
                            </span>
                        ) : (
                            step === 1 ? '🔐 Log In Securely' : '✅ Verify & Continue'
                        )}
                    </button>
                </form>

                {step === 1 && (
                    <div className={styles.signUp__container}>
                        <p className={styles.signUp__text}>Need an account?</p>
                        <a href={ROUTES.SignUp} className={styles.signup__link}>Sign Up</a>
                    </div>
                )}

                {/* Security Info */}
                <div className="w-full mt-8 pt-6 border-t border-gray-200">
                    <div className="text-xs text-gray-500 text-center">
                        <p className="mb-2">🛡️ Your connection is secured with:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="bg-gray-100 px-2 py-1 rounded">RSA Encryption</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">ECC</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">PBKDF2</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">HMAC</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login