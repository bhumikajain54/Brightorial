import React from 'react'
import { LuHandshake, LuClock, LuRocket } from 'react-icons/lu'

export default function PlacementCompletion() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Coming Soon Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-full shadow-lg">
            <LuHandshake className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Placement Collaboration
        </h1>

        {/* Subheading */}
        <p className="text-xl text-text-muted mb-8 max-w-lg mx-auto">
          We're working hard to bring you an amazing placement collaboration experience. 
          Stay tuned for exciting features!
        </p>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-full text-lg font-semibold mb-8 shadow-lg">
          <LuClock className="w-5 h-5" />
          Coming Soon
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="w-12 h-12 bg-primary-10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <LuHandshake className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Partner Management</h3>
            <p className="text-sm text-text-muted">Connect with placement partners</p>
          </div>

          <div className="bg-bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <LuRocket className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Placement Tracking</h3>
            <p className="text-sm text-text-muted">Monitor placement success rates</p>
          </div>

          <div className="bg-bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="w-12 h-12 bg-primary-10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <LuClock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Interview Scheduling</h3>
            <p className="text-sm text-text-muted">Schedule and manage interviews</p>
          </div>
        </div>

        {/* Notification Signup */}
        <div className="bg-bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Get Notified When We Launch
          </h3>
          <p className="text-text-muted mb-4">
            Be the first to know when our placement collaboration features go live!
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
            <button className="bg-secondary hover:bg-secondary-dark text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
