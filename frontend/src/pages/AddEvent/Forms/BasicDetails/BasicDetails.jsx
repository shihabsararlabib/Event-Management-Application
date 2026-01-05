import React from 'react'

function BasicDetails(props) {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-3xl">📅</span>
                    Basic Event Information
                </h2>
                <p className="text-gray-600">Let's start with the essentials of your event</p>
            </div>

            {/* Event Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="eventName"
                    placeholder="e.g., Tech Conference 2026, Annual Meetup"
                    value={props.state.eventName}
                    onChange={props.changeHandler}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400"
                    required
                />
            </div>

            {/* Date and Venue Row */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Event Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        name="date"
                        value={props.state.date}
                        onChange={props.changeHandler}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800"
                        required
                    />
                </div>

                {/* Venue */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Venue <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="venue"
                        placeholder="e.g., BRAC University Auditorium"
                        value={props.state.venue}
                        onChange={props.changeHandler}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400"
                        required
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="description"
                    placeholder="Tell attendees what your event is about, what they'll learn, and why they should attend..."
                    value={props.state.description}
                    onChange={props.changeHandler}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400 resize-none"
                    required
                ></textarea>
                <p className="text-sm text-gray-500 mt-1">Minimum 50 characters recommended</p>
            </div>

            {/* Max Participants */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum Participants
                </label>
                <input
                    type="number"
                    name="maxParticipants"
                    placeholder="100"
                    value={props.state.maxParticipants}
                    onChange={props.changeHandler}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400"
                />
                <p className="text-sm text-gray-500 mt-1">Set the maximum number of attendees allowed</p>
            </div>

            {/* Tips Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <h3 className="font-semibold text-blue-800 mb-1">Pro Tips</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Use a clear, descriptive event name that captures attention</li>
                            <li>• Include specific dates and times to avoid confusion</li>
                            <li>• Write a compelling description highlighting key benefits</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BasicDetails