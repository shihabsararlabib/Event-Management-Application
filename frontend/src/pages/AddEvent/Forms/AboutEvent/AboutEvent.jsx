import React from 'react'

function AboutEvent(props) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <span className="text-3xl">📋</span>
          Additional Event Details
        </h2>
        <p className="text-gray-600">Provide more information to make your event stand out</p>
      </div>

      {/* Speakers/Hosts */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Speakers / Hosts
        </label>
        <input
          type="text"
          name="speakers"
          placeholder="e.g., Dr. John Smith, Prof. Jane Doe"
          value={props.state.speakers}
          onChange={props.changeHandler}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400"
        />
        <p className="text-sm text-gray-500 mt-1">Separate multiple names with commas</p>
      </div>

      {/* Event Highlights */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Event Highlights
        </label>
        <textarea
          name="highlights"
          placeholder="• Keynote by industry leaders&#10;• Networking opportunities&#10;• Hands-on workshops&#10;• Certificate of participation"
          value={props.state.highlights}
          onChange={props.changeHandler}
          rows="5"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400 resize-none"
        ></textarea>
        <p className="text-sm text-gray-500 mt-1">List the key features and benefits of attending</p>
      </div>

      {/* Schedule/Agenda */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Event Schedule / Agenda
        </label>
        <textarea
          name="schedule"
          placeholder="09:00 AM - Registration&#10;10:00 AM - Opening Ceremony&#10;11:00 AM - Keynote Speech&#10;01:00 PM - Lunch Break&#10;02:00 PM - Panel Discussion"
          value={props.state.schedule}
          onChange={props.changeHandler}
          rows="5"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400 resize-none"
        ></textarea>
        <p className="text-sm text-gray-500 mt-1">Provide a timeline of activities</p>
      </div>

      {/* Prize/Awards */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Prizes / Awards
        </label>
        <input
          type="text"
          name="Prize"
          placeholder="e.g., Winner: $1000, Runner-up: $500, Certificate for all participants"
          value={props.state.Prize}
          onChange={props.changeHandler}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400"
        />
        <p className="text-sm text-gray-500 mt-1">Mention any prizes, rewards, or certificates</p>
      </div>

      {/* Requirements/Prerequisites */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Requirements / Prerequisites
        </label>
        <textarea
          name="requirements"
          placeholder="• Basic knowledge of programming&#10;• Laptop required&#10;• Interest in technology&#10;• No prior experience needed"
          value={props.state.requirements}
          onChange={props.changeHandler}
          rows="4"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400 resize-none"
        ></textarea>
        <p className="text-sm text-gray-500 mt-1">List any prerequisites or what attendees should bring</p>
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h3 className="font-semibold text-purple-800 mb-1">Make It Engaging</h3>
            <p className="text-sm text-purple-700">
              The more details you provide, the more likely people are to attend. 
              Highlight what makes your event unique and valuable!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutEvent