import React from 'react'
import { Link } from 'react-router-dom'
import { colors } from '../../../shared/colors'
import { FaSearch, FaBriefcase, FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import colorlogo from "../assets/coloredlogo.png"

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      {/* Main Footer Content */}
      <div className="max-w-[90%] mx-auto px-6 py-12">
        <div className="flex flex-col flex-wrap sm:flex-row gap-8 md:gap-16">
          
          {/* Brand Information Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo */}
            <img src={colorlogo} alt="" className="h-10" />
            
            {/* Description */}
            <p className="text-gray-700 text-sm leading-relaxed mb-6 md:max-w-md">
              JOBSAHI Is A Dedicated Platform Connecting ITI And Polytechnic Students With Job Opportunities, Apprenticeships, And Skill Enhancement Programs.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-3">
              {/* Facebook */}
              <a 
                href="https://facebook.com/jobsahi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer hover:bg-[#5C9A24] border-[#5C9A24] text-[#5C9A24] hover:text-white transition-colors"
              >
                <FaFacebookF className="text-sm " />
              </a>

              {/* Twitter */}
              <a 
                href="https://twitter.com/jobsahi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer hover:bg-[#5C9A24] border-[#5C9A24] text-[#5C9A24] hover:text-white transition-colors"
              >
                <FaTwitter className="text-sm" />
              </a>

              {/* LinkedIn */}
              <a 
                href="https://linkedin.com/company/jobsahi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer hover:bg-[#5C9A24] border-[#5C9A24] text-[#5C9A24] hover:text-white transition-colors"
              >
                <FaLinkedinIn className="text-sm"/>
              </a>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-8 md:gap-16 lg:gap-24 sm:flex-row">
           
            {/* About Column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/courses" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link 
                  to="/news" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  News
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Dashboard Column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dashboard</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Student
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Recruiter
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Skill Partners
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Super Admin
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources Column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/courses" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Find Courses
                </Link>
              </li>
              <li>
                <Link 
                  to="/news" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Job Updates
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Career Tips
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Us Column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://wa.me/1234567890" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  <FaWhatsapp className="text-lg" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@jobsahi.com" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  <FaEnvelope className="text-lg" />
                  <span>Email</span>
                </a>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Social Media
                </Link>
              </li>
            </ul>
          </div>
          </div>
        </div>
      </div>
      
      {/* Separator Line */}
      <div 
        className="w-full h-px bg-[#5C9A24]"
        // style={{ backgroundColor: colors.accent.lightGreen }}
      ></div>
      
      {/* Bottom Section - Copyright and Legal Links */}
      <div className=" max-w-[90%] mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          {/* Copyright */}
          <div className="text-gray-600 text-sm">
            © 2025 JOBSAHI All Right Reserved.
          </div>
          
          {/* Legal Links */}
          <div className="flex space-x-6">
            <Link 
              to="/privacy-policy" 
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-conditions" 
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Term & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
