import React from 'react'
import Card from "../../components/Card/Card"
import Navbar from "../../components/Navbar/Navbar"
import "./Dashboard.css"
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"

const Dashboard = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/event');
      console.log(res);
      setEventData(res.data.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setEventData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = eventData.filter(event => 
    event.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='min-h-screen'>
      <Navbar />
      
      <div className='max-w-7xl mx-auto px-8 py-12'>
        <div className='mb-12 text-center'>
          <h1 className='text-5xl font-bold mb-4'>
            <span className='bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'>
              Discover Events
            </span>
          </h1>
          <p className='text-xl text-gray-600 mb-6'>Find and register for amazing events happening around you</p>
          <button 
            onClick={() => navigate('/addevent')}
            className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105'
          >
            ➕ Create New Event
          </button>
        </div>

        <div className='mb-12 flex justify-center'>
          <div className="flex border-2 border-purple-200 rounded-full shadow-xl bg-white max-w-3xl w-full overflow-hidden">
            <input 
              type="text" 
              className="px-8 py-4 w-full outline-none text-lg" 
              placeholder="🔍 Search events by name, category, or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="flex items-center justify-center px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all">
              <svg className="w-6 h-6 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className='text-center py-32'>
            <div className='text-7xl mb-6 animate-bounce'>🎉</div>
            <p className='text-2xl font-semibold text-gray-700'>Loading amazing events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className='text-center py-32 bg-white rounded-3xl shadow-xl border-2 border-purple-100'>
            <div className='text-8xl mb-6'>📅</div>
            <h2 className='text-3xl font-bold text-gray-800 mb-4'>No Events Found</h2>
            <p className='text-xl text-gray-600 mb-8'>
              {searchTerm ? 'Try adjusting your search terms or browse all events' : 'Be the first to create an event!'}
            </p>
          </div>
        ) : (
          <>
            <div className='mb-8 flex items-center justify-between'>
              <div className='text-lg text-gray-600 font-medium'>
                <span className='text-purple-600 font-bold text-2xl'>{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''} available
              </div>
              <div className='flex gap-3'>
                <button className='px-4 py-2 border-2 border-purple-200 rounded-full hover:border-purple-600 hover:text-purple-600 transition-colors font-medium'>
                  📅 All Categories
                </button>
                <button className='px-4 py-2 border-2 border-purple-200 rounded-full hover:border-purple-600 hover:text-purple-600 transition-colors font-medium'>
                  📍 All Locations
                </button>
              </div>
            </div>
            <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8'>
              {filteredEvents.map((event, key) => (
                <Card key={key} data={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard;
