import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { COLOR_CLASSES } from '../components/colorClasses'

const Error_Page = () => {
  const navigate = useNavigate()

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className={` ${COLOR_CLASSES.bg.navy}`}>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4">
      {/* Main Content Container */}
      <div className="relative w-full max-w-2xl">
        {/* Main Content Area with Custom Shape */}
        <div className={`relative ${COLOR_CLASSES.bg.surfaceSoftBlue} rounded-t-[30px] rounded-bl-[20px] rounded-br-[20px] p-12 md:p-16 text-center overflow-hidden`}>
          
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Top Left Circle */}
            <div className={`absolute -top-4 -left-4 w-16 h-16 border border-white/30 rounded-full ${COLOR_CLASSES.bg.surfaceMutedGreen}`}></div>
            <div className="absolute -top-8 -left-8 w-24 h-24 border border-white/20 rounded-full "></div>
            
            {/* Top Right Circle */}
            <div className={`absolute -top-4 -right-4 w-20 h-20 border border-white/30 rounded-full ${COLOR_CLASSES.bg.surfaceMutedGreen}`}></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 border border-white/20 rounded-full"></div>
            
            {/* Middle Left Circle */}
            <div className={`absolute top-1/3 -left-6 w-12 h-12 border border-white/30 rounded-full ${COLOR_CLASSES.bg.surfaceMutedGreen}`}></div>
            <div className="absolute top-1/3 -left-8 w-20 h-20 border border-white/20 rounded-full"></div>
            
            {/* Bottom Right Circle */}
            <div className={`absolute -bottom-6 -right-6 w-18 h-18 border border-white/30 rounded-full ${COLOR_CLASSES.bg.surfaceMutedGreen}`}></div>
            <div className="absolute -bottom-8 -right-8 w-28 h-28 border border-white/20 rounded-full"></div>
            
            {/* Bottom Left Small Circle */}
            <div className={`absolute -bottom-4 -left-4 w-8 h-8 border border-white/30 rounded-full ${COLOR_CLASSES.bg.surfaceMutedGreen}`}></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Large 404 Number */}
            <h1 className={`text-8xl md:text-9xl font-bold ${COLOR_CLASSES.text.navy} mb-6 leading-none`}>
              404
            </h1>

            {/* Main Heading */}
            <h2 className={`text-2xl md:text-3xl font-semibold ${COLOR_CLASSES.text.neutralSlate} mb-6`}>
              Woops! Page Not Found
            </h2>

            {/* Explanatory Text */}
            <div className={`${COLOR_CLASSES.text.neutralBlueGray} text-base md:text-lg leading-relaxed mb-8 max-w-md mx-auto`}>
              <p className="mb-2">
                Sorry, we could not find the page that you are looking for.
              </p>
              <p>
                Please go back to HOME by click the button bellow
              </p>
            </div>

            {/* Back To Home Button */}
            <button
              onClick={handleBackToHome}
              className={`inline-block px-8 py-3 border-2 ${COLOR_CLASSES.border.accentGreen} ${COLOR_CLASSES.text.accentGreen} rounded-full font-medium ${COLOR_CLASSES.hoverBg.accentGreen} hover:text-white transition-all duration-300`}
            >
              Back To Home
            </button>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  )
}

export default Error_Page
