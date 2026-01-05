import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';

const MyEvents = () => {
  const navigate = useNavigate();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/event/my/registered', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRegisteredEvents(res.data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  const getImageSrc = (event) => {
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
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(124,58,237);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(79,70,229);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="200" fill="url(%23grad)" /%3E%3C/svg%3E';
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50'>
        <Navbar />
        <div className='max-w-7xl mx-auto px-8 py-12 text-center'>
          <div className='text-7xl mb-6 animate-bounce'>🎟️</div>
          <p className='text-2xl font-semibold text-gray-700'>Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50'>
      <Navbar />
      
      <div className='max-w-7xl mx-auto px-8 py-12'>
        <div className='mb-12 text-center'>
          <h1 className='text-5xl font-bold mb-4'>
            <span className='bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'>
              My Tickets
            </span>
          </h1>
          <p className='text-xl text-gray-600'>View all events you've registered for</p>
        </div>

        {error && (
          <div className='mb-8 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center'>
            <p className='text-red-700 font-semibold'>{error}</p>
          </div>
        )}

        {registeredEvents.length === 0 ? (
          <div className='text-center py-32 bg-white rounded-3xl shadow-xl border-2 border-purple-100'>
            <div className='text-8xl mb-6'>🎫</div>
            <h2 className='text-3xl font-bold text-gray-800 mb-4'>No Tickets Yet</h2>
            <p className='text-xl text-gray-600 mb-8'>
              You haven't registered for any events yet
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105'
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className='space-y-6'>
            {registeredEvents.map((registration, index) => (
              <div 
                key={index}
                className='bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-purple-100'
              >
                <div className='flex flex-col lg:flex-row'>
                  {/* Event Image */}
                  <div className='lg:w-1/3 h-64 lg:h-auto'>
                    <img
                      src={getImageSrc(registration)}
                      alt={registration.eventName}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  
                  {/* Event Details */}
                  <div className='lg:w-2/3 p-8'>
                    <div className='flex justify-between items-start mb-4'>
                      <div>
                        <h3 className='text-2xl font-bold text-gray-800 mb-2'>
                          {registration.eventName || 'Event'}
                        </h3>
                        <p className='text-gray-600 mb-4'>
                          {registration.description?.substring(0, 150)}
                          {registration.description?.length > 150 ? '...' : ''}
                        </p>
                      </div>
                      {registration.attended && (
                        <span className='bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold'>
                          ✓ Attended
                        </span>
                      )}
                    </div>
                    
                    <div className='grid md:grid-cols-2 gap-4 mb-6'>
                      <div className='flex items-center gap-3'>
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className='text-xs text-gray-500'>Event Date</p>
                          <p className='font-semibold text-gray-800'>
                            {registration.date ? 
                              new Date(registration.date).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              }) : 'TBA'}
                          </p>
                        </div>
                      </div>
                      
                      <div className='flex items-center gap-3'>
                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className='text-xs text-gray-500'>Venue</p>
                          <p className='font-semibold text-gray-800'>
                            {registration.venue || 'Online'}
                          </p>
                        </div>
                      </div>
                      
                      <div className='flex items-center gap-3'>
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <div>
                          <p className='text-xs text-gray-500'>Registered On</p>
                          <p className='font-semibold text-gray-800'>
                            {registration.registeredAt ? new Date(registration.registeredAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className='flex items-center gap-3'>
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className='text-xs text-gray-500'>Ticket ID</p>
                          <p className='font-semibold text-gray-800 font-mono text-sm'>
                            {registration.ticketId?.substring(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className='flex gap-4'>
                      <button
                        onClick={() => navigate(`/event/${registration.eventId}`)}
                        className='flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-105 shadow-md'
                      >
                        View Event Details
                      </button>
                      <button
                        className='px-6 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-3 rounded-xl transition-all'
                        onClick={() => {
                          navigator.clipboard.writeText(registration.ticketId);
                          alert('Ticket ID copied to clipboard!');
                        }}
                      >
                        Copy Ticket ID
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
