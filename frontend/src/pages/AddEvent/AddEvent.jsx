import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AboutEvent from './Forms/AboutEvent/AboutEvent'
import BasicDetails from './Forms/BasicDetails/BasicDetails'
import Contact from './Forms/Contact/Contact'
import Navbar from '../../components/Navbar/Navbar'

function AddEvent() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    // Check authentication on component mount
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
        }
    }, [navigate])

    const [details, setDetails] = useState({
        eventName: "",
        date: "",
        description: "",
        venue: "",
        speakers: "",
        maxParticipants: 100,
        contact: "",
        email: "",
        instagram: "",
        linkedIn: "",
        website: "",
        Prize: "",
        highlights: "",
        schedule: "",
        requirements: "",
        additionalInfo: ""
    })

    const [form, setForm] = useState('basic')
    const [currentStep, setCurrentStep] = useState(1)

    const handleForm = (event, step) => {
        event.preventDefault()
        const id = event.target.id
        setForm(id)
        setCurrentStep(step)
    }

    const handleData = (event) => {
        const {name, value} = event.target
        setDetails(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleNext = () => {
        if (currentStep < 3) {
            const steps = ['basic', 'aboutEvent', 'contact']
            setForm(steps[currentStep])
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            const steps = ['basic', 'aboutEvent', 'contact']
            setForm(steps[currentStep - 2])
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            // Validate required fields
            if (!details.eventName || !details.date || !details.description || !details.venue) {
                setError('Please fill in all required fields (Event Name, Date, Description, Venue)')
                setLoading(false)
                return
            }

            // Get token from localStorage
            const token = localStorage.getItem('token')
            if (!token) {
                setError('You must be logged in to create an event')
                setLoading(false)
                setTimeout(() => navigate('/login'), 2000)
                return
            }

            // Prepare event data
            const eventData = {
                eventName: details.eventName,
                description: details.description,
                date: details.date,
                venue: details.venue,
                maxParticipants: details.maxParticipants || 100,
                speakers: details.speakers ? details.speakers.split(',').map(s => s.trim()) : [],
                Prize: details.Prize || '',
                contact: details.contact || '',
                email: details.email || '',
                linkedIn: details.linkedIn || '',
                instagram: details.instagram || '',
                website: details.website || ''
            }

            console.log('Submitting event data:', eventData)

            // Make API call
            const response = await axios.post(
                'http://localhost:8080/api/event/create',
                { data: JSON.stringify(eventData) },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            console.log('Response:', response.data)

            if (response.data.success) {
                setSuccess('Event created successfully! Redirecting to dashboard...')
                setTimeout(() => {
                    navigate('/dashboard')
                }, 2000)
            }
        } catch (err) {
            console.error('Error creating event:', err)
            if (err.response) {
                setError(err.response.data.message || 'Failed to create event')
            } else if (err.request) {
                setError('No response from server. Please check if backend is running.')
            } else {
                setError('An error occurred while creating the event')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            <Navbar />
            
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
                <div className="max-w-5xl mx-auto px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            Event Creation
                        </div>
                        <h1 className="text-5xl font-extrabold mb-4">
                            Create Amazing Event
                        </h1>
                        <p className="text-xl text-purple-100">Share your event with the world in just 3 simple steps</p>
                    </div>
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="max-w-5xl mx-auto px-8 -mt-8">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="flex items-center justify-between mb-12">
                        {/* Step 1 */}
                        <div className="flex-1">
                            <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                                    currentStep >= 1 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                                }`}>
                                    {currentStep > 1 ? '✓' : '1'}
                                </div>
                                <span className={`mt-2 text-sm font-semibold ${
                                    currentStep >= 1 ? 'text-purple-600' : 'text-gray-400'
                                }`}>Basic Info</span>
                            </div>
                        </div>
                        <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                            currentStep >= 2 ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-200'
                        }`}></div>
                        
                        {/* Step 2 */}
                        <div className="flex-1">
                            <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                                    currentStep >= 2 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                                }`}>
                                    {currentStep > 2 ? '✓' : '2'}
                                </div>
                                <span className={`mt-2 text-sm font-semibold ${
                                    currentStep >= 2 ? 'text-purple-600' : 'text-gray-400'
                                }`}>About Event</span>
                            </div>
                        </div>
                        <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                            currentStep >= 3 ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-200'
                        }`}></div>
                        
                        {/* Step 3 */}
                        <div className="flex-1">
                            <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                                    currentStep >= 3 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                                }`}>
                                    3
                                </div>
                                <span className={`mt-2 text-sm font-semibold ${
                                    currentStep >= 3 ? 'text-purple-600' : 'text-gray-400'
                                }`}>Contact Info</span>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center justify-center gap-4 mb-8 bg-gray-50 p-2 rounded-xl">
                        <button 
                            id='basic' 
                            onClick={(e) => handleForm(e, 1)} 
                            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                                form === 'basic' 
                                ? 'bg-white text-purple-600 shadow-md transform scale-105' 
                                : 'text-gray-600 hover:bg-white/50'
                            }`}
                        >
                            <span className="text-xl mr-2">📝</span>
                            Basic Details
                        </button>
                        <button 
                            id='aboutEvent' 
                            onClick={(e) => handleForm(e, 2)} 
                            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                                form === 'aboutEvent' 
                                ? 'bg-white text-purple-600 shadow-md transform scale-105' 
                                : 'text-gray-600 hover:bg-white/50'
                            }`}
                        >
                            <span className="text-xl mr-2">📋</span>
                            About Event
                        </button>
                        <button 
                            id='contact' 
                            onClick={(e) => handleForm(e, 3)} 
                            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                                form === 'contact' 
                                ? 'bg-white text-purple-600 shadow-md transform scale-105' 
                                : 'text-gray-600 hover:bg-white/50'
                            }`}
                        >
                            <span className="text-xl mr-2">📞</span>
                            Contact
                        </button>
                    </div>

                    {/* Error and Success Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">❌</span>
                                <div>
                                    <h3 className="font-semibold text-red-800">Error</h3>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">✅</span>
                                <div>
                                    <h3 className="font-semibold text-green-800">Success!</h3>
                                    <p className="text-sm text-green-700">{success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="mt-8">
                        <div className="min-h-[400px]">
                            {form === 'basic' && <BasicDetails state={details} changeHandler={handleData} />}
                            {form === 'aboutEvent' && <AboutEvent state={details} changeHandler={handleData} />}
                            {form === 'contact' && <Contact state={details} changeHandler={handleData} />}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-12 pt-8 border-t-2 border-gray-100">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={currentStep === 1}
                                className={`px-8 py-3 rounded-full font-semibold transition-all ${
                                    currentStep === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                                }`}
                            >
                                ← Previous
                            </button>

                            <div className="text-sm text-gray-500">
                                Step {currentStep} of 3
                            </div>

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                                >
                                    Next →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transition-all transform ${
                                        loading 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : 'hover:from-green-600 hover:to-emerald-700 hover:shadow-xl hover:scale-105'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <span className="inline-block animate-spin mr-2">⏳</span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>✓ Create Event</>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Bottom Spacing */}
            <div className="h-20"></div>
        </div>
    )
}

export default AddEvent