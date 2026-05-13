import React, { useState } from 'react';
import { TAILWIND_COLORS } from '../../../../shared/WebConstant.js';
import Button from '../../../../shared/components/Button.jsx';

const SystemwidePush = () => {
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    type: '',
    message: ''
  });

  // Sample data based on the image
  const recentNotifications = [
    {
      id: 1,
      title: 'New job opportunities available',
      recipients: '123 users',
      time: '2 hour ago',
      tags: ['job alert', 'Delivered']
    },
    {
      id: 2,
      title: 'System maintenance tonight',
      recipients: 'All users',
      time: '1 day ago',
      tags: ['system', 'Delivered']
    },
    {
      id: 3,
      title: 'Complete your profile',
      recipients: '55 users',
      time: '2 days ago',
      tags: ['reminder', 'Delivered']
    }
  ];

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    // Handle notification submission
    console.log('Notification submitted:', notificationForm);
    setNotificationForm({ title: '', type: '', message: '' });
  };


  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* System-wide Push Notifications Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>System-wide Push Notifications</h2>
            {/* <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>System-wide Push Notifications</p> */}
          </div>
        </div>

        <form onSubmit={handleNotificationSubmit} className="space-y-6">
          {/* Notification Title and Type in first row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Notification Title</label>
              <input
                type="text"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                placeholder="Enter notification title"
                className={`w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-transparent text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Type</label>
              <div className="relative">
                <select
                  value={notificationForm.type}
                  onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                  className={`w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-transparent text-sm appearance-none bg-white ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                >
                  <option value="">select notification type</option>
                  <option value="job-alert">Job Alert</option>
                  <option value="system">System Notification</option>
                  <option value="reminder">Reminder</option>
                  <option value="promotion">Promotion</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Message textarea */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Message</label>
            <textarea
              value={notificationForm.message}
              onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
              placeholder="Enter your notification message"
              rows="4"
              className={`w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-transparent text-sm resize-none ${TAILWIND_COLORS.TEXT_PRIMARY}`}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              size="md"
              className="w-full sm:w-auto h-12"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              }
            >
              Send Now
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="md"
              className="w-full sm:w-auto h-12 border-2 border-[var(--color-secondary)] text-[var(--color-secondary)] "
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              }
            >
              Schedule
            </Button>
          </div>
        </form>
      </div>

      {/* Recent System-wide Push Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
        <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 sm:mb-6`}> Manage Push Notifications</h2>

        <div className="space-y-3">
          {recentNotifications.map((notification) => (
            <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>{notification.title}</h3>
                <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>{notification.recipients} - {notification.time}</p>
              </div>
              <div className="flex gap-2 ml-4">
                {notification.tags.map((tag, index) => {
                  const isDelivered = tag.toLowerCase() === 'delivered';
                  const base = 'px-3 py-1 text-sm font-medium rounded-md whitespace-nowrap';
                  const style = isDelivered
                    ? 'text-[var(--color-secondary)] border-2 border-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-white'
                    : 'bg-[var(--color-secondary)] hover:bg-secondary-dark text-white';
                  return (
                    <span key={index} className={`${base} ${style}`}>
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemwidePush;
