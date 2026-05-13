import React, { useState } from 'react'
import { FaEnvelope, FaPhone, FaGlobe } from 'react-icons/fa'
import Navbar from '../../components/Navbar'
import NewsletterSubscription from '../../components/NewsletterSubscription'
import Footer from '../../components/Footer'
import textunderline from '../../assets/website_text_underline.png'
import contactImage from '../../assets/contact.jpg'
import contactSmallImage from '../../assets/contactsmall.jpg'
import { COLOR_CLASSES } from '../../components/colorClasses'
import { postMethod } from '../../../../service/api'
import serviceUrl from '../../services/serviceUrl'
import Swal from 'sweetalert2'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await postMethod({
        apiUrl: serviceUrl.submitContactForm,
        payload: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }
      })

      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: response.message || 'Your message has been sent successfully. We will get back to you soon.',
          timer: 3000,
          showConfirmButton: false
        })
        setFormData({ name: '', email: '', phone: '', message: '' })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to send message. Please try again.',
        })
      }
    } catch (error) {
      console.error('Contact form error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again later.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewsletterSubscribe = async (subscriberEmail) => {
    try {
      const response = await postMethod({
        apiUrl: serviceUrl.subscribeNewsletter,
        payload: {
          email: subscriberEmail
        }
      })

      if (response.status) {
        setIsSubscribed(true)
        setNewsletterEmail('')
        Swal.fire({
          icon: 'success',
          title: 'Subscribed!',
          text: response.message || 'Thank you for subscribing to our newsletter.',
          timer: 3000,
          showConfirmButton: false
        })
        setTimeout(() => {
          setIsSubscribed(false)
        }, 5000)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to subscribe. Please try again.',
        })
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again later.',
      })
    }
  }

  return (
    <div className={`${COLOR_CLASSES.bg.navy} min-h-screen`}>
      <Navbar />

      {/* Header Section */}
      <section className={`py-6 sm:py-8 md:py-10 ${COLOR_CLASSES.bg.surfacePaleBlue} mx-2 sm:mx-4 rounded-[30px] sm:rounded-[40px] md:rounded-[50px] my-4 sm:my-6 md:my-8 border-t-4 border-l-4 border-r-4 ${COLOR_CLASSES.border.deepBlue} overflow-hidden`}>
        <div className="max-w-[95%] sm:max-w-[90%] mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center">
            {/* Top Banner */}
            <div className="mb-4 sm:mb-6">
              <div className={`inline-block border-2 ${COLOR_CLASSES.border.accentGreen} ${COLOR_CLASSES.text.accentGreen} px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide`}>
                #1 PORTAL JOB PLATFORM
              </div>
            </div>

            {/* Main Heading */}
            <div className="flex flex-col items-center justify-center text-center mb-4 sm:mb-5 md:mb-10">
              <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl px-2 sm:px-4 md:px-8 lg:px-24 font-bold mb-3 sm:mb-4 md:mb-6 ${COLOR_CLASSES.text.deepBlue} leading-tight`}>
                Feel Free To <span className="relative inline-block">
                  Contact Us
                  <img src={textunderline} alt="underline" className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3 md:h-4 object-contain" />
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-1">
              We would love to hear from you! Share your questions, feedback, or collaboration ideas and our team will reach out shortly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
          {/* Left visuals */}
          <div className="relative mb-6 lg:mb-0 flex flex-col items-center lg:items-start">
          <div className="w-full sm:w-[90%] md:w-[85%] lg:w-[80%] -mt-2 sm:-mt-3 md:-mt-4 lg:-mt-5 px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 mx-auto lg:mx-0">
            {/* Contact Us Input Section - Before Image */}
            <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-1 bg-white rounded-xl p-2.5 sm:p-3 md:p-4 shadow-lg relative min-w-0">
                  <input 
                    type="text" 
                    placeholder="Contact Us..." 
                    className="w-full text-gray-700 bg-transparent border-none outline-none text-xs sm:text-sm md:text-base lg:text-lg placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base"
                    readOnly
                  />
                </div>
                <button className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 ${COLOR_CLASSES.bg.accentLime} rounded-xl flex items-center justify-center shadow-lg relative flex-shrink-0`}>
                  <FaPhone className="text-white text-xs sm:text-sm md:text-base lg:text-lg" />
                  <div className={`absolute inset-0 ${COLOR_CLASSES.bg.accentLime} rounded-xl opacity-30 blur-sm`}></div>
                </button>
              </div>
            </div>
            
            {/* Image Section */}
            <div className="relative mx-auto lg:mx-0">
              <div className="w-56 h-56 sm:w-60 sm:h-60 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-blue-100 rounded-3xl relative overflow-hidden border-4 sm:border-[6px] md:border-8 lg:border-[12px] border-white mx-auto lg:mx-0">
                <img 
                  src={contactImage} 
                  alt="Contact Us" 
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
              <div className="absolute border-4 sm:border-4 md:border-[6px] lg:border-8 border-white -bottom-6 sm:-bottom-8 md:-bottom-10 left-1/2 -translate-x-1/2 sm:left-1/2 sm:-translate-x-1/2 md:left-40 md:translate-x-0 lg:left-72 lg:translate-x-0 w-20 h-16 sm:w-24 sm:h-20 md:w-32 md:h-24 lg:w-48 lg:h-40 bg-blue-100 rounded-2xl overflow-hidden">
                <img 
                  src={contactSmallImage} 
                  alt="Contact Us Small" 
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
            </div>
          </div>

          {/* Right content */}
          <div className="w-full">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">
              Contact Us For Your Any Help & Needs.
            </h2>
            <p className="text-gray-600 mb-5 sm:mb-6 md:mb-8 lg:mb-10 leading-relaxed text-xs sm:text-sm md:text-base">
              We highly value your feedback and inquiries at Jobsahi. Whether you have questions about our services, require assistance, or are interested in exploring potential collaborations.
            </p>

            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Email */}
                <div className="flex items-center space-x-2.5 sm:space-x-3 md:space-x-4">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 ${COLOR_CLASSES.bg.accentGreen} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                  <FaEnvelope className="text-xs sm:text-sm md:text-base" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800">Email</h3>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base break-words">hello@jobsahi.com</p>
                </div>
              </div>

              {/* Call */}
              <div className="flex items-center space-x-2.5 sm:space-x-3 md:space-x-4">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 ${COLOR_CLASSES.bg.accentGreen} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                  <FaPhone className="text-xs sm:text-sm md:text-base" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800">Call Support</h3>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base break-words">+91-98765-43210</p>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-center space-x-2.5 sm:space-x-3 md:space-x-4">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 ${COLOR_CLASSES.bg.accentGreen} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                  <FaGlobe className="text-xs sm:text-sm md:text-base" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800">Website Link</h3>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base break-words">www.jobsahi.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className={`py-8 sm:py-12 md:py-16 lg:py-20 ${COLOR_CLASSES.bg.surfacePaleBlue}`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 text-center">
          <h2 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold ${COLOR_CLASSES.text.accentGreen} mb-5 sm:mb-6 md:mb-8 lg:mb-10 px-2`}>
            Do You Have Any Questions? Let Us Know!
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            <input type="text" name="name" value={formData.name} onChange={handleInputChange}
              placeholder="Your name here" className="w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border rounded-xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500" required />
            <input type="email" name="email" value={formData.email} onChange={handleInputChange}
              placeholder="Your email here" className="w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border rounded-xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500" required />
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
              placeholder="Your Number here" className="w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border rounded-xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500" required />
            <textarea name="message" value={formData.message} onChange={handleInputChange}
              placeholder="Tell us about your messages" rows={4} className="w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border rounded-xl text-xs sm:text-sm md:text-base resize-none focus:outline-none focus:ring-2 focus:ring-green-500" required />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`${COLOR_CLASSES.bg.accentGreen} text-white px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-xl ${COLOR_CLASSES.hoverBg.accentGreenDeepest} text-xs sm:text-sm md:text-base font-semibold w-full sm:w-auto transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Message'}
            </button>
          </form>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSubscription 
        headerContent={{
          title: "New Things Will Always Update Regularly"
        }}
        email={newsletterEmail}
        setEmail={setNewsletterEmail}
        onSubscribe={handleNewsletterSubscribe}
        isSubscribed={isSubscribed}
      />

      <Footer />
    </div>
  )
}

export default Contact
