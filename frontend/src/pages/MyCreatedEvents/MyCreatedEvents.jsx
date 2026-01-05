import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';

const MyCreatedEvents = () => {
  const navigate = useNavigate();
  const [createdEvents, setCreatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyCreatedEvents();
  }, []);

  const fetchMyCreatedEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/event/my/created', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCreatedEvents(res.data.events || []);
    } catch (err) {
      console.error('Error fetching created events:', err);
      setError(err.response?.data?.message || 'Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  const viewParticipants = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8080/api/event/${eventId}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Navigate to participants page or show modal
      navigate(`/event/${eventId}/participants`, { state: { participants: res.data.participants } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load participants');
    }
  };

  const deleteEvent = async (eventId, eventName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${eventName}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/event/${eventId}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Event deleted successfully!');
      // Refresh the events list
      fetchMyCreatedEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
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
          <div className='text-7xl mb-6 animate-bounce'>📊</div>
          <p className='text-2xl font-semibold text-gray-700'>Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50'>
      <Navbar />
      
      <div className='max-w-7xl mx-auto px-8 py-12'>
        <div className='mb-12 flex items-center justify-between'>
          <div>
            <h1 className='text-5xl font-bold mb-4'>
              <span className='bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'>
                My Created Events
              </span>
            </h1>
            <p className='text-xl text-gray-600'>Manage your events and view participants</p>
          </div>
          <button
            onClick={() => navigate('/addevent')}
            className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105'
          >
            ➕ Create New Event
          </button>
        </div>

        {error && (
          <div className='mb-8 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center'>
            <p className='text-red-700 font-semibold'>{error}</p>
          </div>
        )}

        {createdEvents.length === 0 ? (
          <div className='text-center py-32 bg-white rounded-3xl shadow-xl border-2 border-purple-100'>
            <div className='text-8xl mb-6'>🎯</div>
            <h2 className='text-3xl font-bold text-gray-800 mb-4'>No Events Created Yet</h2>
            <p className='text-xl text-gray-600 mb-8'>
              Start creating events to manage participants and track attendance
            </p>
            <button
              onClick={() => navigate('/addevent')}
              className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105'
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className='grid lg:grid-cols-2 gap-8'>
            {createdEvents.map((event, index) => (
              <div 
                key={index}
                className='bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-purple-100'
              >
                {/* Event Image */}
                <div className='relative h-48 overflow-hidden'>
                  <img
                    src={getImageSrc(event)}
                    alt={event.eventName}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full font-bold shadow-lg'>
                    {event.participants?.length || 0} Registered
                  </div>
                </div>
                
                {/* Event Details */}
                <div className='p-6'>
                  <h3 className='text-2xl font-bold text-gray-800 mb-2'>
                    {event.eventName}
                  </h3>
                  
                  <p className='text-gray-600 mb-4 line-clamp-2'>
                    {event.description}
                  </p>
                  
                  <div className='space-y-3 mb-6'>
                    <div className='flex items-center gap-3 text-sm'>
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className='text-gray-700 font-medium'>
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className='flex items-center gap-3 text-sm'>
                      <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className='text-gray-700 font-medium'>{event.venue}</span>
                    </div>
                    
                    {event.maxParticipants && (
                      <div className='flex items-center gap-3 text-sm'>
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className='text-gray-700 font-medium'>
                          {event.participants?.length || 0} / {event.maxParticipants} participants
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className='flex gap-3'>
                    <button
                      onClick={() => navigate(`/event/${event._id}`)}
                      className='flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md'
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => viewParticipants(event._id)}
                      className='flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-3 rounded-xl transition-all'
                    >
                      👥 Participants
                    </button>
                  </div>
                  
                  <div className='mt-3'>
                    <button
                      onClick={() => deleteEvent(event._id, event.eventName)}
                      className='w-full border-2 border-red-500 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2'
                      title={event.participants?.length > 0 ? 'Cannot delete event with participants' : 'Delete event'}
                    >
                      🗑️ Delete Event
                    </button>
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

export default MyCreatedEvents;
