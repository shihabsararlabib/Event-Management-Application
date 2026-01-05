import React from 'react'

function Contact(props) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <span className="text-3xl">📞</span>
          Contact Information
        </h2>
        <p className="text-gray-600">Help attendees reach out for questions or support</p>
      </div>

      {/* Contact Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Contact Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">📱</span>
          <input
            type="tel"
            name="contact"
            placeholder="+880 1234-567890"
            value={props.state.contact}
            onChange={props.changeHandler}
            pattern="[0-9+\-\s]+"
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Include country code for international events</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Contact Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">✉️</span>
          <input
            type="email"
            name="email"
            placeholder="events@example.com"
            value={props.state.email}
            onChange={props.changeHandler}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Official email for event-related queries</p>
      </div>

      {/* Social Media Links */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🌐</span>
          Social Media (Optional)
        </h3>
        
        {/* LinkedIn */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            LinkedIn Profile/Page
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 text-lg">in</span>
            <input
              type="url"
              name="linkedIn"
              placeholder="https://linkedin.com/in/your-profile"
              value={props.state.linkedIn}
              onChange={props.changeHandler}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Instagram */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Instagram Handle
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-600 text-lg">📷</span>
            <input
              type="url"
              name="instagram"
              placeholder="https://instagram.com/yourevent"
              value={props.state.instagram}
              onChange={props.changeHandler}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Event Website
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🌍</span>
            <input
              type="url"
              name="website"
              placeholder="https://yourevent.com"
              value={props.state.website}
              onChange={props.changeHandler}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Additional Contact Info */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          name="additionalInfo"
          placeholder="Any other contact details or instructions for attendees..."
          value={props.state.additionalInfo}
          onChange={props.changeHandler}
          rows="3"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400 resize-none"
        ></textarea>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="font-semibold text-green-800 mb-1">Almost Done!</h3>
            <p className="text-sm text-green-700">
              Review all the details and click "Create Event" to publish your event. 
              You can edit it anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact