import React from 'react'
import { useNavigate } from 'react-router-dom'

const Card = ({ data }) => {
  const navigate = useNavigate();
  
  // Convert buffer data to base64 string safely
  const getImageSrc = () => {
    try {
      if (data?.img?.data?.data) {
        // Convert array buffer to base64
        const base64 = btoa(
          new Uint8Array(data.img.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        return `data:${data.img.contentType};base64,${base64}`;
      }
    } catch (error) {
      console.error('Error loading image:', error);
    }
    // Fallback to placeholder gradient
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(124,58,237);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(79,70,229);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="300" fill="url(%23grad)" /%3E%3C/svg%3E';
  };

  const handleRegister = () => {
    // Navigate to event details or registration page
    navigate(`/event/${data._id}`);
  };

  return (
    <div className='bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-purple-100 hover:border-purple-300 transform hover:-translate-y-2'>
      <div className='relative h-48 overflow-hidden'>
        <img 
          src={getImageSrc()} 
          alt={data?.eventName || 'Event'} 
          className='w-full h-full object-cover'
        />
        <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full'>
          <span className='text-purple-600 font-bold text-sm'>
            {data?.date ? new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBA'}
          </span>
        </div>
      </div>
      
      <div className='p-6'>
        <h3 className='text-xl font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]'>
          {data?.eventName || 'Untitled Event'}
        </h3>
        
        <p className='text-gray-600 text-sm mb-4 line-clamp-3 min-h-[4rem]'>
          {data?.description || 'No description available'}
        </p>
        
        <div className='flex items-center gap-2 text-sm text-gray-500 mb-4'>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className='line-clamp-1'>{data?.venue || 'Online Event'}</span>
        </div>
        
        <button 
          onClick={handleRegister}
          className='w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-lg'
        >
          View Details & Register
        </button>
      </div>
    </div>
  )
}

export default Card;