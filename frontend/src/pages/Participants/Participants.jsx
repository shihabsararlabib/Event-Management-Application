import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';

const Participants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventInfo, setEventInfo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchParticipants();
  }, [id]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8080/api/event/${id}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEventInfo(res.data.event);
      setParticipants(res.data.participants || []);
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError(err.response?.data?.message || 'Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (participantId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/event/${id}/attendance`,
        { participantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh participants list
      fetchParticipants();
      alert('Attendance marked successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className='min-h-screen'>
        <Navbar />
        <div className='flex items-center justify-center min-h-[80vh]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto'></div>
            <p className='mt-4 text-xl text-gray-600'>Loading participants...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen'>
        <Navbar />
        <div className='container mx-auto px-4 py-16'>
          <div className='max-w-2xl mx-auto text-center'>
            <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg'>
              <p className='font-bold text-xl mb-2'>Error</p>
              <p>{error}</p>
            </div>
            <button
              onClick={() => navigate('/my-created-events')}
              className='mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300'
            >
              ← Back to My Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      <Navbar />
      <div className='container mx-auto px-4 py-8'>
        {/* Header Section */}
        <div className='mb-8'>
          <button
            onClick={() => navigate('/my-created-events')}
            className='mb-4 text-purple-600 hover:text-purple-800 flex items-center gap-2 transition-colors duration-300'
          >
            <span className='text-2xl'>←</span>
            <span className='font-semibold'>Back to My Events</span>
          </button>
          
          <div className='bg-white rounded-2xl shadow-xl p-8'>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4'>
              Event Participants
            </h1>
            
            {eventInfo && (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6'>
                <div className='bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-4'>
                  <p className='text-sm text-gray-600 mb-1'>Event Name</p>
                  <p className='text-lg font-bold text-gray-800'>{eventInfo.eventName}</p>
                </div>
                
                <div className='bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-4'>
                  <p className='text-sm text-gray-600 mb-1'>Total Registered</p>
                  <p className='text-3xl font-bold text-blue-600'>{eventInfo.totalParticipants}</p>
                </div>
                
                <div className='bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-4'>
                  <p className='text-sm text-gray-600 mb-1'>Attended</p>
                  <p className='text-3xl font-bold text-green-600'>{eventInfo.attended}</p>
                </div>
                
                <div className='bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg p-4'>
                  <p className='text-sm text-gray-600 mb-1'>Attendance Rate</p>
                  <p className='text-3xl font-bold text-orange-600'>
                    {eventInfo.totalParticipants > 0 
                      ? Math.round((eventInfo.attended / eventInfo.totalParticipants) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className='mb-6'>
          <input
            type='text'
            placeholder='🔍 Search by name, email, or ticket ID...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full px-6 py-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-lg transition-colors duration-300'
          />
        </div>

        {/* Participants List */}
        {filteredParticipants.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-xl p-12 text-center'>
            <div className='text-6xl mb-4'>👥</div>
            <h3 className='text-2xl font-bold text-gray-800 mb-2'>
              {searchTerm ? 'No participants found' : 'No participants yet'}
            </h3>
            <p className='text-gray-600'>
              {searchTerm 
                ? 'Try a different search term'
                : 'Participants will appear here once they register for your event'}
            </p>
          </div>
        ) : (
          <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
            {/* Table Header */}
            <div className='bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4'>
              <div className='grid grid-cols-12 gap-4 text-white font-semibold'>
                <div className='col-span-3'>Participant Name</div>
                <div className='col-span-3'>Email</div>
                <div className='col-span-2'>Ticket ID</div>
                <div className='col-span-2'>Registered Date</div>
                <div className='col-span-1 text-center'>Status</div>
                <div className='col-span-1 text-center'>Action</div>
              </div>
            </div>

            {/* Table Body */}
            <div className='divide-y divide-gray-200'>
              {filteredParticipants.map((participant, index) => (
                <div
                  key={participant.userId}
                  className='px-6 py-4 hover:bg-purple-50 transition-colors duration-200'
                >
                  <div className='grid grid-cols-12 gap-4 items-center'>
                    {/* Name */}
                    <div className='col-span-3'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold'>
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className='font-semibold text-gray-800'>{participant.name}</p>
                          <p className='text-xs text-gray-500'>#{index + 1}</p>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className='col-span-3'>
                      <p className='text-gray-700'>{participant.email}</p>
                    </div>

                    {/* Ticket ID */}
                    <div className='col-span-2'>
                      <div className='flex items-center gap-2'>
                        <code className='text-xs bg-gray-100 px-2 py-1 rounded font-mono'>
                          {participant.ticketId.substring(0, 8)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(participant.ticketId)}
                          className='text-purple-600 hover:text-purple-800 transition-colors'
                          title='Copy full ticket ID'
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    {/* Registration Date */}
                    <div className='col-span-2'>
                      <p className='text-sm text-gray-600'>
                        {new Date(participant.registeredAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {new Date(participant.registeredAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className='col-span-1 text-center'>
                      {participant.attended ? (
                        <span className='inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold'>
                          ✓ Attended
                        </span>
                      ) : (
                        <span className='inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold'>
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className='col-span-1 text-center'>
                      {!participant.attended && (
                        <button
                          onClick={() => markAttendance(participant.userId)}
                          className='px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold'
                        >
                          Mark
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats at Bottom */}
        {filteredParticipants.length > 0 && (
          <div className='mt-6 bg-white rounded-2xl shadow-xl p-6'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-sm text-gray-600'>Showing</p>
                <p className='text-2xl font-bold text-gray-800'>
                  {filteredParticipants.length} of {participants.length} participants
                </p>
              </div>
              <div className='text-right'>
                <p className='text-sm text-gray-600'>Attendance Progress</p>
                <div className='flex items-center gap-3 mt-2'>
                  <div className='w-48 bg-gray-200 rounded-full h-3'>
                    <div
                      className='bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500'
                      style={{
                        width: `${participants.length > 0 ? (participants.filter(p => p.attended).length / participants.length) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className='text-lg font-bold text-gray-800'>
                    {participants.filter(p => p.attended).length} / {participants.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Participants;
