import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TAILWIND_COLORS, COLORS } from '../WebConstant'
import LogoutConfirmationModal from './LogoutConfirmationModal'

import { postMethod } from '../../service/api'
import { getMethod } from '../../service/api'
import apiService from '../../shared/services/serviceUrl'

const UserDropdown = ({ user: propUser = { user_name: 'Admin', role: 'Administrator' } }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  
  // Get user from localStorage or use prop
  const [user, setUser] = useState(() => {
    try {
      const authUser = localStorage.getItem("authUser")
      return authUser ? JSON.parse(authUser) : propUser
    } catch {
      return propUser
    }
  })

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const authUser = localStorage.getItem("authUser")
        if (authUser) {
          setUser(JSON.parse(authUser))
        }
      } catch (error) {
        console.error('Error updating user in dropdown:', error)
      }
    }

    // Listen to custom event
    window.addEventListener('profileUpdated', handleProfileUpdate)
    
    // Also listen to storage events (for cross-tab updates)
    window.addEventListener('storage', () => {
      try {
        const authUser = localStorage.getItem("authUser")
        if (authUser) {
          setUser(JSON.parse(authUser))
        }
      } catch (error) {
        console.error('Error updating user from storage:', error)
      }
    })

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProfileClick = () => {
    // Navigate based on user role
    const role = user.role?.toLowerCase()
    if (role === 'recruiter') {
      navigate(`/${user.role}/company-profile`)
    } else if (role === 'institute') {
      navigate('/institute/profile-setting')
    } else {
      navigate(`/${user.role}/profile`)
    }
    setIsOpen(false)
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
    setIsOpen(false)
  }

  const confirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Add logout logic here (clear tokens, call logout API, etc.)
      console.log('Logging out...')

      var data = {
        apiUrl: apiService.logout,
        payload: {
          uid: user.id
        },

      };

      var response = await postMethod(data);

      // Simulate logout process
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (response.status === true) {
        // Clear user-specific storage before clearing all
        try {
          const userId = user.id || user.uid;
          const userRole = user.role;
          if (userId && userRole) {
            const prefix = `_${userRole}_${userId}`;
            const keysToRemove = [];
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const key = localStorage.key(i);
              if (key && key.endsWith(prefix)) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
          }
        } catch (error) {
          console.error('Error clearing user-specific storage:', error);
        }
        
        setShowLogoutModal(true)
        setIsOpen(false)
        navigate('/login')
        localStorage.clear();
        localStorage.removeItem("authToken");
        localStorage.removeItem("authExpiry");
        localStorage.removeItem("authUser");

      } else {
        console.error("Logout Failed:", response)
        alert(response.message || "Logout Failed")
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Handle logout error if needed
    } finally {
      setIsLoggingOut(false)
    }
  }

  const closeLogoutModal = () => {
    setShowLogoutModal(false)
  }

  const handleLogin = () => {
    localStorage.clear();
    localStorage.removeItem("authToken");
    localStorage.removeItem("authExpiry");
    localStorage.removeItem("authUser");
    navigate('/login')
    setIsOpen(false)
  }

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile & Settings',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 22a8 8 0 1116 0" />
        </svg>
      ),
      onClick: handleProfileClick
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      ),
      onClick: handleLogout,
      isDestructive: true
    }
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Mobile: Only show avatar, Desktop: Show name + avatar */}
        <div className="hidden sm:block text-right">
          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.user_name}</div>
          <div className="text-[10px] sm:text-xs text-gray-500 truncate">{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}</div>
        </div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 grid place-items-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 sm:w-4 sm:h-4 sm:w-5 sm:h-5 text-white">
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 22a8 8 0 1116 0" />
          </svg>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 grid place-items-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 sm:w-5 sm:h-5 text-white">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 22a8 8 0 1116 0" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.user_name}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 truncate">{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm text-left hover:bg-gray-50 transition-colors duration-150 ${item.isDestructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                  }`}
              >
                <span className={`${item.isDestructive ? 'text-red-500' : 'text-gray-400'} flex-shrink-0`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
        userName={user.user_name}
        isLoading={isLoggingOut}
      />
    </div>
  )
}

export default UserDropdown
