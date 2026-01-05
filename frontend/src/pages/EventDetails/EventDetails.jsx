import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8080/api/event/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      setEvent(res.data.event);
      setIsRegistered(res.data.event?.isRegistered || false);
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to register for events');
      navigate('/login');
      return;
    }

    try {
      setRegistering(true);
      const res = await axios.post(
        `http://localhost:8080/api/event/${id}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Successfully registered for the event!');
      setIsRegistered(true);
    } catch (err) {
      console.error('Error registering:', err);
      alert(err.response?.data?.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const getImageSrc = () => {
    try {
      if (event?.img?.data?.data) {
        const base64 = btoa(
          new Uint8Array(event.img.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        return `data:${event.img.contentType};base64,${base64}`;
      }
    } catch (error) {
      console.error('Error loading image:', error);
    }
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(124,58,237);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(79,70,229);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="400" fill="url(%23grad)" /%3E%3C/svg%3E';
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50'>
        <Navbar />
        <div className='max-w-7xl mx-auto px-8 py-12 text-center'>
          <div className='text-7xl mb-6 animate-bounce'>🎉</div>
          <p className='text-2xl font-semibold text-gray-700'>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50'>
        <Navbar />
        <div className='max-w-7xl mx-auto px-8 py-12 text-center'>
          <div className='text-8xl mb-6'>😔</div>
          <h2 className='text-3xl font-bold text-gray-800 mb-4'>Event Not Found</h2>
          <p className='text-xl text-gray-600 mb-8'>{error || 'The event you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all'
          >
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50'>
      <Navbar />
      
      <div className='max-w-7xl mx-auto px-8 py-12'>
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className='mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors'
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Events
        </button>

        <div className='bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-100'>
          {/* Event Image */}
          <div className='relative h-96 overflow-hidden'>
            <img
              src={getImageSrc()}
              alt={event.eventName}
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'></div>
            <div className='absolute bottom-8 left-8 right-8'>
              <h1 className='text-5xl font-bold text-white mb-4'>{event.eventName}</h1>
              <div className='flex flex-wrap gap-4'>
                <span className='bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-purple-600 font-semibold flex items-center gap-2'>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span className='bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-indigo-600 font-semibold flex items-center gap-2'>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {event.venue}
                </span>
              </div>
            </div>
          </div>

          <div className='p-8 lg:p-12'>
            <div className='grid lg:grid-cols-3 gap-8'>
              {/* Main Content */}
              <div className='lg:col-span-2 space-y-8'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3'>
                    <span className='text-4xl'>📋</span>
                    About This Event
                  </h2>
                  <p className='text-lg text-gray-700 leading-relaxed whitespace-pre-wrap'>
                    {event.description || 'No description available'}
                  </p>
                </div>

                {event.speakers && event.speakers.length > 0 && (
                  <div>
                    <h2 className='text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3'>
                      <span className='text-4xl'>🎤</span>
                      Speakers
                    </h2>
                    <div className='flex flex-wrap gap-3'>
                      {event.speakers.map((speaker, index) => (
                        <span key={index} className='bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 rounded-full text-purple-700 font-semibold'>
                          {speaker}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.highlights && event.highlights.length > 0 && (
                  <div>
                    <h2 className='text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3'>
                      <span className='text-4xl'>✨</span>
                      Highlights
                    </h2>
                    <ul className='space-y-3'>
                      {event.highlights.map((highlight, index) => (
                        <li key={index} className='flex items-start gap-3'>
                          <span className='text-purple-600 text-xl mt-1'>•</span>
                          <span className='text-lg text-gray-700'>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className='space-y-6'>
                <div className='bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200'>
                  <h3 className='text-2xl font-bold text-gray-800 mb-6'>Event Details</h3>
                  <div className='space-y-4'>
                    <div className='flex items-start gap-3'>
                      <svg className="w-6 h-6 text-purple-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <div>
                        <p className='text-sm text-gray-600'>Max Participants</p>
                        <p className='text-xl font-bold text-gray-800'>
                          {event.maxParticipants || 'Unlimited'}
                        </p>
                      </div>
                    </div>

                    {event.contactPhone && (
                      <div className='flex items-start gap-3'>
                        <svg className="w-6 h-6 text-purple-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <div>
                          <p className='text-sm text-gray-600'>Contact</p>
                          <p className='text-lg font-semibold text-gray-800'>{event.contactPhone}</p>
                        </div>
                      </div>
                    )}

                    {event.contactEmail && (
                      <div className='flex items-start gap-3'>
                        <svg className="w-6 h-6 text-purple-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <div>
                          <p className='text-sm text-gray-600'>Email</p>
                          <p className='text-lg font-semibold text-gray-800 break-all'>{event.contactEmail}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Registration Button */}
                <button
                  onClick={handleRegister}
                  disabled={isRegistered || registering}
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform hover:scale-105 ${
                    isRegistered
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : registering
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                  }`}
                >
                  {isRegistered ? '✓ Already Registered' : registering ? 'Registering...' : '🎟️ Register Now'}
                </button>

                {isRegistered && (
                  <div className='bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center'>
                    <p className='text-green-700 font-semibold'>
                      You're registered for this event! 🎉
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
