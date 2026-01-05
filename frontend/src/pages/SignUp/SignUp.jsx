import React, { useState } from 'react'
import TextNIcon from '../../components/TextNIcon/TextNIcon'
import personIcon from "../../assets/icons/human_placeholder.png"
import email_icon from "../../assets/icons/email.png"
import pass_icon from "../../assets/icons/password.png"
import { useNavigate } from "react-router-dom"
import './SignUp.css'
import { ROUTES } from '../../routes/RouterConfig'
import axios from 'axios'

const styles = {
    body: "flex items-center justify-center min-h-screen font-openSans py-12",
    container: "signUp_container flex flex-col items-center justify-around py-[60px] border-0 border-purple-100 px-[30px] bg-white rounded-2xl shadow-2xl m-2 w-[90%] max-w-[480px]",
    title_div: "signUp_title_div text-left w-full",
    title_h1: "text-4xl md:text-5xl pb-0 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent",
    form: "w-full pt-[40px]",
    signUp_button: "text-center w-full text-xl font-semibold block mt-[30px] rounded-full py-[14px] text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    login_container: "flex mt-[40px] text-gray-700",
    login_text: "",
    login_link: "pl-2 font-semibold hover:underline hover:decoration-solid text-purple-600 hover:text-purple-700"
}


function SignUp() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [signUpForm, setSignUpForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
    })

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError('')

        // Validate password
        if (signUpForm.password.length < 8) {
            setError('Password must be at least 8 characters long')
            setLoading(false)
            return
        }

        try {
            const res = await axios.post('http://localhost:8080/api/user/signup', {
                firstname: signUpForm.firstname,
                lastname: signUpForm.lastname,
                email: signUpForm.email,
                password: signUpForm.password
            })

            console.log(res)
            console.log(res.data)
            setSuccess(true)
            
            // Redirect after showing success message
            setTimeout(() => {
                navigate("/login")
            }, 2000)

        } catch (err) {
            console.error('Signup error:', err)
            setError(err.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (event) => {
        const { name, value } = event.target
        setSignUpForm(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                {/* Security Badge */}
                <div className="w-full mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl py-2 px-4">
                        <span>🛡️</span>
                        <span>Your data will be encrypted with RSA + ECC</span>
                    </div>
                </div>

                <div className={styles.title_div}>
                    <h1 className={styles.title_h1}>Create Account</h1>
                    <p className="text-gray-600 mt-2 text-sm">Join EventShield with enterprise-grade security</p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="w-full mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">✅</span>
                            <div>
                                <p className="font-medium">Account Created Successfully!</p>
                                <p className="text-sm">Your data has been encrypted. Redirecting to login...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="w-full mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className="grid grid-cols-2 gap-3">
                        <TextNIcon
                            type="text"
                            icon={personIcon}
                            placeholder="First Name"
                            name="firstname"
                            value={signUpForm.firstname}
                            changehandler={handleChange}
                        />
                        <TextNIcon
                            type="text"
                            icon={personIcon}
                            placeholder="Last Name"
                            name="lastname"
                            value={signUpForm.lastname}
                            changehandler={handleChange}
                        />
                    </div>
                    <TextNIcon
                        type="email"
                        icon={email_icon}
                        placeholder="Email address"
                        name="email"
                        value={signUpForm.email}
                        changehandler={handleChange}
                    />
                    <TextNIcon
                        type="password"
                        icon={pass_icon}
                        placeholder="Password (min 8 characters)"
                        name="password"
                        value={signUpForm.password}
                        changehandler={handleChange}
                    />

                    {/* Password Strength Indicator */}
                    {signUpForm.password && (
                        <div className="mt-2">
                            <div className="flex gap-1">
                                <div className={`h-1 flex-1 rounded ${signUpForm.password.length >= 2 ? 'bg-red-400' : 'bg-gray-200'}`}></div>
                                <div className={`h-1 flex-1 rounded ${signUpForm.password.length >= 4 ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
                                <div className={`h-1 flex-1 rounded ${signUpForm.password.length >= 6 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                                <div className={`h-1 flex-1 rounded ${signUpForm.password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            </div>
                            <p className={`text-xs mt-1 ${signUpForm.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                                {signUpForm.password.length >= 8 ? '✓ Strong password' : `${8 - signUpForm.password.length} more characters needed`}
                            </p>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className={styles.signUp_button}
                        disabled={loading || success}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Encrypting & Creating Account...
                            </span>
                        ) : success ? (
                            '✅ Account Created!'
                        ) : (
                            '🔐 Create Secure Account'
                        )}
                    </button>
                </form>

                <div className={styles.login_container}>
                    <p className={styles.login_text}>Already have an account?</p>
                    <a href={ROUTES.Login} className={styles.login_link}>Log In</a>
                </div>

                {/* Security Features Info */}
                <div className="w-full mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center mb-3">🛡️ Your account will be protected with:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-purple-50 rounded-lg p-2 text-center">
                            <div className="font-semibold text-purple-700">🔒 RSA + ECC</div>
                            <div className="text-purple-600">Data Encryption</div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-2 text-center">
                            <div className="font-semibold text-indigo-700">🔑 PBKDF2</div>
                            <div className="text-indigo-600">Password Hashing</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2 text-center">
                            <div className="font-semibold text-green-700">📱 2FA</div>
                            <div className="text-green-600">Available After Login</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                            <div className="font-semibold text-blue-700">🛡️ HMAC</div>
                            <div className="text-blue-600">Data Integrity</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp