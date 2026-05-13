import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { colors } from '../../../shared/colors'
import { FaSearch, FaBriefcase, FaChevronDown, FaAngleDoubleRight } from 'react-icons/fa'
import logo from "../assets/whitelogo.png"
const Navbar = () => {
  const location = useLocation()
  const [activePage, setActivePage] = useState('Home')
  const [isMediaDropdownOpen, setIsMediaDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Jobs', path: '/find-job' },
    { name: 'Courses', path: '/courses' },
    { name: 'Media', path: '/media', hasDropdown: true },
    { name: 'Contact', path: '/contact' },
  ]

  // Update active page based on current location
  useEffect(() => {
    const currentPath = location.pathname
    
    // Check if we're on news or blog pages to highlight Media
    if (currentPath === '/news' || currentPath === '/blog') {
      setActivePage('Media')
    } else {
      const currentItem = navigationItems.find(item => item.path === currentPath)
      if (currentItem) {
        setActivePage(currentItem.name)
      }
    }
  }, [location.pathname])

  return (
    <nav 
      className="w-full px-6 py-4 relative"
    >
      <div className="max-w-full mx-auto md:mx-10 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="flex items-center text-white text-2xl font-bold">
            <img src={logo} alt="logo" className=" h-10" />
            {/* <span className="relative">
              JOBS
              <span className="relative inline-block ml-1">
                <FaSearch className="absolute -top-1 -right-1 text-sm" />
                <FaBriefcase className="text-xs" />
              </span>
              AHI
            </span> */}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center space-x-5">
          {navigationItems.map((item) => (
            <div key={item.name} className="relative">
              {item.hasDropdown ? (
                <button
                  onClick={() => {
                    setIsMediaDropdownOpen(!isMediaDropdownOpen)
                  }}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors duration-200 ${
                    activePage === item.name
                      ? 'text-[#A1E366] font-bold'
                      : 'text-white hover:text-gray-200'
                  }`}
                >
                  <span>{item.name}</span>
                  <FaChevronDown className="text-xs" />
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors duration-200 ${
                    activePage === item.name
                      ? 'text-[#A1E366] font-bold'
                      : 'text-white hover:text-gray-200'
                  }`}
                >
                  <span>{item.name}</span>
                </Link>
              )}
              
              {/* Media Dropdown */}
              {item.hasDropdown && isMediaDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <div className="py-2">
                    <Link to="/news" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      News
                    </Link>
                    <Link to="/blog" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Blog
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Actions - Hidden on Mobile */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* Register Link */}
          <Link
            to="/register"
            className="flex items-center space-x-1 text-white hover:text-gray-200 transition-colors duration-200"
          >
            <span>Register</span>
            <FaAngleDoubleRight className="text-sm" />
          </Link>

          {/* Sign Up Button */}
          <Link
            to="/login"
            className="px-6 py-2 text-white hover:text-[#00395B] font-semibold border border-white rounded-full hover:bg-white "
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="px-6 py-4 space-y-4">
            {/* Navigation Links */}
            {navigationItems.map((item) => (
              <div key={item.name}>
                {item.hasDropdown ? (
                  <button
                    onClick={() => {
                      setIsMediaDropdownOpen(!isMediaDropdownOpen)
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-md transition-colors duration-200 ${
                      activePage === item.name
                        ? 'text-[#A1E366] font-bold '
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.name}</span>
                    <FaChevronDown className={`text-xs transition-transform duration-200 ${
                      isMediaDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-md transition-colors duration-200 ${
                      activePage === item.name
                        ? 'text-[#A1E366] font-bold '
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.name}</span>
                  </Link>
                )}
                
                {/* Mobile Media Dropdown */}
                {item.hasDropdown && isMediaDropdownOpen && (
                  <div className="ml-4 mt-2 space-y-2">
                    <Link 
                      to="/news" 
                      className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      News
                    </Link>
                    <Link 
                      to="/blog" 
                      className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Blog
                    </Link>
                  </div>
                )}
              </div>
            ))}

            {/* Mobile User Actions */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Link
                to="/register"
                className="flex items-center justify-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Register</span>
                <FaAngleDoubleRight className="text-sm" />
              </Link>
              
              <Link
                to="/login"
                className="w-full px-4 py-2 text-white border border-gray-300 rounded-full hover:bg-gray-50 hover:text-[#00395B] transition-colors duration-200 block text-center"
                style={{
                  backgroundColor: colors.primary.darkBlue,
                  borderColor: colors.primary.darkBlue
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
      </nav>
    
  )
}

export default Navbar
