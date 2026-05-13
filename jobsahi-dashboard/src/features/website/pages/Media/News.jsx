import React, { useState, useEffect, lazy, Suspense } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import MeetOurTeam from '../../components/Rounded4Cards'
import FAQ from '../../components/FAQ'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaUser, FaArrowRight, FaSearch, FaFilter, FaNewspaper, FaBullhorn, FaChartLine, FaBriefcase, FaGraduationCap, FaCog, FaWrench, FaCar, FaBolt, FaHardHat, FaClipboardList, FaPencilAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import textunderline from "../../assets/website_text_underline.png";
import subscribebg from "../../assets/news_subscribebg.png"
import govImage from "../../assets/courses/gov.jpg"
import workerImage from "../../assets/courses/worker.jpg"
import companyImage from "../../assets/courses/company.jpg"
import tipsImage from "../../assets/courses/tips.jpg"
import newsmall from "../../assets/newsmall.jpg"
import news from "../../assets/news.jpg"
import { WEBSITE_COLOR_CLASSES } from '../../components/colorClasses'
import { TRUSTED_BY_STARTUPS_DEFAULT_HEADER } from '../../components/TrustedByStartups.jsx'

const TrustedByStartups = lazy(() => import('../../components/TrustedByStartups.jsx'))

const {
  TEXT: TEXT_COLORS,
  BORDER: BORDER_COLORS,
  HOVER_TEXT: HOVER_TEXT_COLORS,
  HOVER_BG: HOVER_BG_COLORS,
  GROUP_HOVER: GROUP_HOVER_CLASSES,
} = WEBSITE_COLOR_CLASSES

const News = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentSlide, setCurrentSlide] = useState(0)

  // Sample news data
  const newsData = [
    {
      id: 1,
      title: "New Electrician Apprenticeship Program Launched",
      excerpt: "Government announces 10,000 new electrician apprenticeship positions across the country with guaranteed job placement.",
      content: "The Ministry of Skill Development has launched a comprehensive electrician apprenticeship program that will train 10,000 individuals over the next two years. The program includes both theoretical knowledge and hands-on practical training...",
      category: "apprenticeships",
      author: "Ministry of Skill Development",
      date: "2024-01-15",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&h=300&fit=crop",
      featured: true,
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "ITI Students Get 100% Placement in Technical Companies",
      excerpt: "All 500 students from Delhi ITI have secured jobs in leading technical companies with average salary of ₹25,000 per month.",
      content: "In a remarkable achievement, all 500 students from Delhi Industrial Training Institute have secured employment in leading technical companies across the country...",
      category: "placements",
      author: "Delhi ITI",
      date: "2024-01-12",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop",
      featured: false,
      readTime: "3 min read"
    },
    {
      id: 3,
      title: "Welding Technology Course Now Available Online",
      excerpt: "Learn advanced welding techniques from industry experts through our new online platform with virtual reality training modules.",
      content: "Our new online welding technology course combines traditional learning with cutting-edge virtual reality technology to provide hands-on training experience...",
      category: "courses",
      author: "JobsAhi Team",
      date: "2024-01-10",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&h=300&fit=crop",
      featured: false,
      readTime: "4 min read"
    },
    {
      id: 4,
      title: "Automotive Industry Hiring 50,000 Technicians",
      excerpt: "Major automotive companies announce massive hiring drive for skilled technicians and mechanics across India.",
      content: "Leading automotive companies including Maruti Suzuki, Tata Motors, and Mahindra have announced a joint hiring initiative to recruit 50,000 skilled technicians...",
      category: "jobs",
      author: "Automotive Industry Association",
      date: "2024-01-08",
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&h=300&fit=crop",
      featured: true,
      readTime: "6 min read"
    },
    {
      id: 5,
      title: "HVAC Technician Certification Program",
      excerpt: "New certification program for HVAC technicians with industry-recognized credentials and job placement assistance.",
      content: "The HVAC Technician Certification Program is designed to provide comprehensive training in heating, ventilation, and air conditioning systems...",
      category: "certifications",
      author: "HVAC Training Institute",
      date: "2024-01-05",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&h=300&fit=crop",
      featured: false,
      readTime: "3 min read"
    },
    {
      id: 6,
      title: "Construction Safety Training Mandatory",
      excerpt: "Government mandates safety training for all construction workers with new certification requirements.",
      content: "The Ministry of Labour has announced that all construction workers must complete mandatory safety training and obtain certification...",
      category: "safety",
      author: "Ministry of Labour",
      date: "2024-01-03",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&h=300&fit=crop",
      featured: false,
      readTime: "4 min read"
    }
  ]

  const categories = [
    { id: 'all', name: 'All News', icon: <FaNewspaper /> },
    { id: 'apprenticeships', name: 'Apprenticeships', icon: <FaGraduationCap /> },
    { id: 'placements', name: 'Placements', icon: <FaBriefcase /> },
    { id: 'courses', name: 'Courses', icon: <FaPencilAlt /> },
    { id: 'jobs', name: 'Jobs', icon: <FaClipboardList /> },
    { id: 'certifications', name: 'Certifications', icon: <FaCog /> },
    { id: 'safety', name: 'Safety', icon: <FaHardHat /> }
  ]

  // Career guidance data
  const careerGuidanceData = [
    {
      id: 1,
      title: "How to Build a Winning Polytechnic Resume",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500&h=300&fit=crop",
      description: "Learn the essential tips to create a compelling resume that stands out to recruiters in the technical field."
    },
    {
      id: 2,
      title: "Interview Preparation for ITI Students",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&h=300&fit=crop",
      description: "Master the art of technical interviews with our comprehensive guide designed specifically for ITI graduates."
    },
    {
      id: 3,
      title: "Career Growth in Technical Fields",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=300&fit=crop",
      description: "Discover the various career paths available for technical professionals and how to advance your career."
    },
    {
      id: 4,
      title: "Skills Development for Modern Industries",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop",
      description: "Stay updated with the latest skills required in today's rapidly evolving technical landscape."
    },
    {
      id: 5,
      title: "Networking Strategies for Technical Professionals",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=500&h=300&fit=crop",
      description: "Build meaningful professional connections that can accelerate your career in the technical domain."
    },
    {
      id: 6,
      title: "Industry Certifications That Matter",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=300&fit=crop",
      description: "Discover which technical certifications can boost your career prospects and increase your earning potential."
    },
    {
      id: 7,
      title: "Salary Negotiation Tips for Technicians",
      image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=500&h=300&fit=crop",
      description: "Learn how to negotiate better salaries and benefits in the technical field with confidence."
    },
    {
      id: 8,
      title: "Career Transition from ITI to Engineering",
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&h=300&fit=crop",
      description: "Step-by-step guide to advancing from technical training to professional engineering roles."
    }
  ]

  const createStatusBadge = (label) => (
    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
      <span className="w-2 h-2 rounded-full bg-[#A1E366]" />
      {label}
    </div>
  )

  // TrustedByStartups data
  const testimonialsData = [
    {
      text: "JobsAhi has been instrumental in helping our students find quality technical jobs. The platform's focus on ITI and polytechnic graduates makes it unique in the market.",
      author: "Dr. Rajesh Kumar",
      position: "Principal, Delhi ITI"
    },
    {
      text: "The career guidance and placement support provided by JobsAhi has significantly improved our students' job prospects. Highly recommended platform!",
      author: "Prof. Meera Sharma",
      position: "Head of Placements, Mumbai Polytechnic"
    },
    {
      text: "As a recruiter, I find JobsAhi to be the best platform for finding skilled technical candidates. The quality of profiles is exceptional.",
      author: "Amit Patel",
      position: "HR Manager, TechCorp Industries"
    },
    {
      text: "JobsAhi helped me transition from ITI to a full-time engineering role. The guidance and resources were invaluable for my career growth.",
      author: "Priya Singh",
      position: "Mechanical Engineer, AutoTech Ltd"
    }
  ]

  const headerContent = {
    ...TRUSTED_BY_STARTUPS_DEFAULT_HEADER,
    status: createStatusBadge('Education Partners'),
    title: (
      <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
        Trusted by Leading
        <span className="block text-[#A1E366]">Educational Institutions</span>
      </h2>
    ),
    description: (
      <p className="text-white/90 text-lg leading-relaxed">
        Join thousands of candidates, institutions, and recruiters who trust JobsAhi for career advancement and quality placements in the technical field.
      </p>
    )
  }

  // Platform Updates data for TrustedByStartups component
  const platformUpdatesData = [
    {
      text: "Option to download certificates immediately after completing online skill modules.",
      author: "New",
      position: ""
    },
    {
      text: "In-app chat support for instant help with job applications.",
      author: "Coming Soon",
      position: ""
    }
  ]

  const platformUpdatesHeader = {
    ...TRUSTED_BY_STARTUPS_DEFAULT_HEADER,
    status: createStatusBadge('Product News'),
    title: (
      <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
        Platform Updates
      </h2>
    ),
    description: (
      <p className="text-white/90 text-lg leading-relaxed">
        Stay updated with our latest features and improvements to enhance your experience.
      </p>
    )
  }

  // Team members data for MeetOurTeam component
  const teamMembers = [
    {
      name: "Govt. Jobs",
      role: "Central & State technical vacancies",
      image: govImage
    },
    {
      name: "Apprenticeships",
      role: "ITI/polytechnic skill programs",
      image: workerImage
    },
    {
      name: "Company News",
      role: "Campus drives & recruitment announcements",
      image: companyImage
    },
    {
      name: "Career Tips",
      role: "Resumes, interviews & soft skills",
      image: tipsImage
    },
    {
      name: "Jobs & Placements",
      role: "Job fairs & placement drives"
    },
    {
      name: "Certifications",
      role: "Industry-recognized certifications"
    },
    {
      name: "Safety",
      role: "Construction & industrial safety"
    },
    {
      name: "Courses",
      role: "Technical & vocational training"
    }
  ]

  const teamSectionContent = {
    title: "Explore By Category",
    description: "Connect with industry professionals and career experts who are dedicated to helping you succeed in your technical career journey."
  }

  // FAQ data
  const faqData = [
    {
      question: "How often is the news section updated?",
      answer: "We refresh daily—new vacancies, company updates, and guidance posts go live each morning."
    },
    {
      question: "Can we apply directly from the article?",
      answer: "Yes, you can apply directly from the article by clicking the 'Apply Now' button."
    },
    {
      question: "How long do alerts take to arrive?",
      answer: "Typically within 5 minutes of posting."
    }
  ]

  const faqHeaderContent = {
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about JobsAhi services, job applications, and career opportunities in the technical field."
  }

  // Carousel functions
  const [screenSize, setScreenSize] = useState('lg')
  
  // Determine cards per view based on screen size
  const getCardsPerView = () => {
    if (screenSize === 'sm') return 1
    if (screenSize === 'md') return 2
    return 3
  }
  
  const cardsPerView = getCardsPerView()
  const maxSlide = Math.max(0, careerGuidanceData.length - cardsPerView)

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setScreenSize('sm')
      } else if (window.innerWidth < 1024) {
        setScreenSize('md')
      } else {
        setScreenSize('lg')
      }
    }

    handleResize() // Set initial size
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Reset current slide when screen size changes
  useEffect(() => {
    setCurrentSlide(0)
  }, [cardsPerView])

  // Auto navigate slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [maxSlide])

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      if (prev >= maxSlide) {
        return 0 // Loop back to first slide when reaching the end
      }
      return prev + 1
    })
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (prev <= 0) {
        return maxSlide // Go to last slide when at the beginning
      }
      return prev - 1
    })
  }

  const goToSlide = (index) => {
    setCurrentSlide(Math.min(index, maxSlide))
  }

  const featuredNews = newsData.filter(news => news.featured)
  const filteredNews = newsData.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || news.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(cat => cat.id === category)
    return categoryData ? categoryData.icon : <FaNewspaper />
  }

  return (
    <div className="min-h-screen bg-[#00395B]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-6 sm:py-8 md:py-10 bg-[#EAF5FB] mx-2 sm:mx-4 rounded-[30px] sm:rounded-[40px] md:rounded-[50px] my-4 sm:my-6 md:my-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center">
            {/* Top Banner */}
            <div className="mb-3 sm:mb-4 md:mb-5">
              <div className={`inline-block border-2 ${BORDER_COLORS.ACCENT_GREEN} ${TEXT_COLORS.ACCENT_GREEN} px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold`}>
                #1 PORTAL JOB PLATFORM
              </div>
            </div>

            {/* Main Heading */}
            <div className="flex flex-col items-center justify-center text-center mb-4 sm:mb-5">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl px-4 sm:px-8 md:px-12 lg:px-20 font-bold mb-6 sm:mb-7 md:mb-8 ${TEXT_COLORS.PRIMARY_DEEP_BLUE} leading-tight`}>
              Latest News & Updates
              </h1>
              <img src={textunderline} alt="" className="w-[40%] sm:w-[35%] md:w-[30%] h-[12px] sm:h-[15px] md:h-[20px] lg:h-[25px] -mt-6 sm:-mt-8 md:-mt-10" />
            </div>

            {/* Description */}
            <p className="text-gray-700 text-base sm:text-lg px-4 sm:px-6 md:px-10 lg:px-28">
            Stay informed with fresh insights from the ITI, polytechnic, and government job market. Check back regularly for the latest opportunities, expert tips, and platform updates.
            </p>
          </div>
        </div>
      </section>

      {/* Search Job Section */}
      <section className={`bg-[#00395B] ${TEXT_COLORS.NEUTRAL_WHITE} py-8 sm:py-12 md:py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-start">
            {/* Left Side - White Cards */}
            <div className="relative mb-6 lg:mb-0 flex flex-col items-center lg:items-start">
              <div className="w-full sm:w-[90%] md:w-[85%] lg:w-[80%] -mt-2 sm:-mt-3 md:-mt-4 lg:-mt-5 px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 mx-auto lg:mx-0">
                <div className="relative mx-auto lg:mx-0">
                  <div className="w-56 h-56 sm:w-60 sm:h-60 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-blue-100 rounded-3xl relative overflow-hidden border-[6px] sm:border-[8px] md:border-[10px] lg:border-[12px] border-[#00395B] mx-auto lg:mx-0">
                    <img 
                      src={news} 
                      alt="News" 
                      className="w-full h-full object-cover rounded-3xl"
                    />
                    <div className="absolute top-0 left-0 w-full h-full">
                      {/* Green Badge */}
                      <div className="absolute border-[3px] sm:border-[3px] md:border-[4px] lg:border-[4px] border-[#00395B] -top-1 sm:-top-1.5 md:-top-2 -left-1 sm:-left-1.5 md:-left-2 bg-[#CFF49A] rounded-md sm:rounded-lg md:rounded-lg p-1 sm:p-1 md:p-1.5 lg:p-1.5 shadow-md z-10">
                        <div className="text-center">
                          <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5 bg-white rounded-full flex items-center justify-center mx-auto mb-0.5 sm:mb-0.5 md:mb-1">
                            <div className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 lg:w-2 lg:h-2 bg-[#CFF49A] rounded-full" />
                          </div>
                          <p className="text-black font-bold text-[7px] sm:text-[8px] md:text-[9px]">Top No. 1</p>
                          <p className="text-black text-[6px] sm:text-[7px] md:text-[8px]">Portal Job Web</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute border-[5px] sm:border-[6px] md:border-[7px] lg:border-[8px] border-[#00395B] -bottom-6 sm:-bottom-8 md:-bottom-10 left-1/2 -translate-x-1/2 sm:left-1/2 sm:-translate-x-1/2 md:left-40 md:translate-x-0 lg:left-72 lg:translate-x-0 w-20 h-16 sm:w-24 sm:h-20 md:w-32 md:h-24 lg:w-48 lg:h-40 bg-blue-100 rounded-2xl overflow-hidden">
                    <img 
                      src={newsmall} 
                      alt="News small" 
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - News Snippets */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* News Snippet 1 */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#A1E366] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                    Govt. Apprenticeship Drive Extended - 5,000 More Vacancies!
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    Discover How The Government Has Launched 5,000 New Apprenticeship Posts For ITI Graduates. Learn Who's Eligible, The Timeline, And How To Apply.
                  </p>
                </div>
              </div>

              {/* News Snippet 2 */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#A1E366] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                    Polytechnic Campus Hiring Trends 2025
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    Analysis Of Emerging Industries And Which States Are Hosting The Most On-Campus Recruitment Drives.
                  </p>
                </div>
              </div>

              {/* News Snippet 3 */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#A1E366] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2">
                    Success Story: From ITI To Engineer In 6 Months
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    Read How Priya Sharma Leveraged JobsAhi's Resume Tools And Interview Resources To Land A Full-Time Mechanical Engineering Role.
                  </p>
                </div>
              </div>

              {/* Search Job Button */}
              <div className="pt-2 sm:pt-3 md:pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/find-job')}
                  className={`inline-flex ${TEXT_COLORS.NEUTRAL_WHITE} ${HOVER_TEXT_COLORS.ACCENT_LIME} items-center gap-2 sm:gap-3 bg-transparent border-2 ${BORDER_COLORS.PRIMARY_NAVY} px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base ${HOVER_BG_COLORS.PRIMARY_NAVY} transition-all duration-300 group`}
                >
                  <span>Search Job</span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-[#A1E366] rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                    <FaArrowRight className={`text-xs sm:text-sm ${TEXT_COLORS.NEUTRAL_WHITE} ${GROUP_HOVER_CLASSES.TEXT_ACCENT_LIME}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Guidance & Tips Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold ${TEXT_COLORS.PRIMARY_DEEP_BLUE} mb-3 sm:mb-4`}>
              Career Guidance & Tips
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto px-4">
              Together with useful notifications, collaboration, insights, and improvement tips to help you succeed in your technical career.
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className={`md:-mx-5 lg:-mx-16 absolute top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#5C9A24] ${TEXT_COLORS.NEUTRAL_WHITE} rounded-full flex items-center justify-center shadow-lg hover:bg-[#4a7d1f] transition-colors duration-300 ${cardsPerView === 1 ? 'left-1 sm:left-2' : cardsPerView === 2 ? 'left-2 sm:left-4' : 'left-4'}`}
            >
              <FaChevronLeft className="text-xs sm:text-sm md:text-lg" />
            </button>

            <button
              onClick={nextSlide}
              className={`md:-mx-5 lg:-mx-16 absolute top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#5C9A24] ${TEXT_COLORS.NEUTRAL_WHITE} rounded-full flex items-center justify-center shadow-lg hover:bg-[#4a7d1f] transition-colors duration-300 ${cardsPerView === 1 ? 'right-1 sm:right-2' : cardsPerView === 2 ? 'right-2 sm:right-4' : 'right-4'}`}
            >
              <FaChevronRight className="text-xs sm:text-sm md:text-lg" />
            </button>

            {/* Cards Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * (100 / cardsPerView)}%)` }}
              >
                {careerGuidanceData.map((item, index) => (
                  <div key={item.id} className={`${cardsPerView === 1 ? 'w-full' : cardsPerView === 2 ? 'w-1/2' : 'w-1/3'} flex-shrink-0 px-2 sm:px-3`}>
                    <div className="bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                      {/* Image Placeholder */}
                      <div className="h-48 sm:h-52 md:h-56 lg:h-60 w-full bg-gray-200 relative overflow-hidden flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 text-center p-3 sm:p-4">
                            <div className="text-3xl sm:text-4xl mb-2">📋</div>
                            <div className="text-xs sm:text-sm font-medium">Career Tips</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 leading-tight line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed flex-1 line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-4 sm:mt-6 md:mt-8 space-x-1.5 sm:space-x-2">
              {Array.from({ length: maxSlide + 1 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-colors duration-300 ${
                    index === currentSlide 
                      ? 'bg-[#5C9A24]' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Platform Updates Section */}
        <Suspense fallback={<div className="text-white text-center py-10">Loading testimonials...</div>}>
          <TrustedByStartups 
            testimonials={platformUpdatesData}
            headerContent={platformUpdatesHeader}
          />
        </Suspense>
        
      </section>

        {/* Subscribe To Our Job News Alerts Section */}
        <section className="py-6 sm:py-8 bg-[#00395B]">
          <div className="max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[70%] relative mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <img src={subscribebg} alt="" className="absolute h-full w-full object-cover rounded-2xl sm:rounded-3xl" />
            {/* Main Card */}
            <div className="relative p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">

              {/* Header Section */}
              <div className="text-center p-3 sm:p-4 md:p-5 mb-6 sm:mb-8 md:mb-10 lg:mb-12 relative z-10">
                <h2 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold ${TEXT_COLORS.PRIMARY_DEEP_BLUE} mb-2 sm:mb-3 md:mb-4 leading-tight px-2`}>
                  Subscribe To Our Job News Alerts
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg px-2">
                  Enter Your Email Or Mobile Number To Receive:
                </p>
              </div>

              {/* Features Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10 relative z-10">
                {/* Breaking Vacancy Alerts */}
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[#5C9A24] rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                    <svg className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 ${TEXT_COLORS.NEUTRAL_WHITE}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-gray-800 text-xs sm:text-sm md:text-base lg:text-lg font-medium px-2">
                    Breaking Vacancy Alerts
                  </h3>
                </div>

                {/* Job Search Tips */}
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[#5C9A24] rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                    <svg className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 ${TEXT_COLORS.NEUTRAL_WHITE}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  </div>
                  <h3 className="text-gray-800 text-xs sm:text-sm md:text-base lg:text-lg font-medium px-2">
                    Job Search Tips
                  </h3>
                </div>

                {/* Skill Program Updates */}
                <div className="text-center sm:col-span-2 md:col-span-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[#5C9A24] rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                    <svg className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 ${TEXT_COLORS.NEUTRAL_WHITE}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-gray-800 text-xs sm:text-sm md:text-base lg:text-lg font-medium px-2">
                    Skill Program Updates
                  </h3>
                </div>
              </div>

              {/* Subscribe Button */}
              <div className="text-center relative z-10 mb-3 sm:mb-4 md:mb-5">
                <button className="inline-flex rounded-full items-center gap-2 sm:gap-3 bg-transparent border-2 border-gray-600 text-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm md:text-base hover:bg-gray-50 transition-all duration-300 group">
                  <span>Subscribe Now</span>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 bg-[#5C9A24] rounded-full flex items-center justify-center group-hover:bg-[#4a7d1f] transition-colors duration-300">
                    <FaArrowRight className={`text-[10px] sm:text-xs md:text-sm ${TEXT_COLORS.NEUTRAL_WHITE}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Meet Our Expert Team Section */}
        <MeetOurTeam 
          teamMembers={teamMembers}
          title={teamSectionContent.title}
          description={teamSectionContent.description}
        />

        {/* FAQ Section */}
        <FAQ 
          faqs={faqData}
          headerContent={faqHeaderContent}
        />
        
      <Footer />
    </div>
  )
}

export default News
