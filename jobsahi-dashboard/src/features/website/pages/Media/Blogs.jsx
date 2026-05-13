import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import NewsletterSubscription from '../../components/NewsletterSubscription'
import { FaArrowRight, FaSearch, FaNewspaper, FaBriefcase, FaGraduationCap, FaCog, FaHardHat, FaClipboardList, FaPencilAlt, FaBookOpen, FaFacebookF, FaTwitter, FaLinkedinIn, FaReply, FaArrowLeft } from 'react-icons/fa'
import textunderline from "../../assets/website_text_underline.png";
import { WEBSITE_COLOR_CLASSES } from '../../components/colorClasses'

const {
  TEXT: TEXT_COLORS,
  BG: BG_COLORS,
  BORDER: BORDER_COLORS,
  HOVER_TEXT: HOVER_TEXT_COLORS,
  HOVER_BG: HOVER_BG_COLORS,
} = WEBSITE_COLOR_CLASSES

const Blogs = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    comment: ''
  })

  // Sample blog data
  const blogData = [
    {
      id: 1,
      title: "How to Prepare for Technical Interviews: A Complete Guide",
      excerpt: "Master the art of technical interviews with our comprehensive guide covering everything from coding challenges to behavioral questions.",
      content: "Technical interviews can be daunting, but with the right preparation, you can confidently showcase your skills and land your dream job...",
      category: "career-tips",
      author: "JobSahi Team",
      date: "2024-01-15",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
      featured: true,
      readTime: "8 min read"
    },
    {
      id: 2,
      title: "Building a Strong Resume for Technical Jobs",
      excerpt: "Learn how to craft a compelling resume that stands out to technical recruiters and hiring managers.",
      content: "Your resume is often the first impression you make on potential recruiters. Here's how to make it count...",
      category: "resume-tips",
      author: "Career Expert",
      date: "2024-01-12",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&h=300&fit=crop",
      featured: false,
      readTime: "6 min read"
    },
    {
      id: 3,
      title: "The Future of Technical Education in India",
      excerpt: "Exploring emerging trends and opportunities in technical education and skill development.",
      content: "The landscape of technical education is rapidly evolving. Here's what you need to know about the future...",
      category: "education",
      author: "Education Specialist",
      date: "2024-01-10",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop",
      featured: false,
      readTime: "7 min read"
    },
    {
      id: 4,
      title: "Success Stories: From ITI to Industry Leader",
      excerpt: "Inspiring journey of professionals who started their careers from ITI and achieved remarkable success.",
      content: "Meet the inspiring individuals who prove that with determination and the right skills, anything is possible...",
      category: "success-stories",
      author: "JobSahi Team",
      date: "2024-01-08",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=500&h=300&fit=crop",
      featured: true,
      readTime: "5 min read"
    },
    {
      id: 5,
      title: "Essential Soft Skills for Technical Professionals",
      excerpt: "Beyond technical expertise: the soft skills that can make or break your career in technical fields.",
      content: "While technical skills are crucial, soft skills often determine your long-term success in the workplace...",
      category: "soft-skills",
      author: "HR Professional",
      date: "2024-01-05",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
      featured: false,
      readTime: "4 min read"
    },
    {
      id: 6,
      title: "Industry Insights: What Recruiters Look For",
      excerpt: "Get insider knowledge about what technical recruiters really want from their candidates.",
      content: "Understanding recruiter expectations can give you a significant advantage in your job search...",
      category: "industry-insights",
      author: "Industry Expert",
      date: "2024-01-03",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop",
      featured: false,
      readTime: "6 min read"
    }
  ]

  const categories = [
    { id: 'all', name: 'All Blogs', icon: <FaBookOpen /> },
    { id: 'career-tips', name: 'Career Tips', icon: <FaBriefcase /> },
    { id: 'resume-tips', name: 'Resume Tips', icon: <FaPencilAlt /> },
    { id: 'education', name: 'Education', icon: <FaGraduationCap /> },
    { id: 'success-stories', name: 'Success Stories', icon: <FaClipboardList /> },
    { id: 'soft-skills', name: 'Soft Skills', icon: <FaCog /> },
    { id: 'industry-insights', name: 'Industry Insights', icon: <FaHardHat /> }
  ]

  const placeholderImage = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&h=300&fit=crop'

  const formatCategoryName = (category) =>
    category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  const featuredBlogs = blogData.filter(blog => blog.featured)
  const filteredBlogs = blogData.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory
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
    return categoryData ? categoryData.icon : <FaBookOpen />
  }

  // Newsletter subscription handler
  const handleNewsletterSubscribe = (email) => {
    // Here you would typically send the email to your backend
    console.log('Newsletter subscription:', email)
    setIsSubscribed(true)
    setEmail('')
    // Reset success message after 3 seconds
    setTimeout(() => {
      setIsSubscribed(false)
    }, 3000)
  }

  // Newsletter header content
  const newsletterHeaderContent = {
    title: "New Things Will Always Update Regularly"
  }

  // Sample comments data
  const commentsData = [
    {
      id: 1,
      author: "Nathalie Kiel",
      date: "19th May 2024",
      comment: "The bee's knees bite your arm off bits and bobshe nickedit gosh gutted mate blimey, old off his nut."
    },
    {
      id: 2,
      author: "John Smith",
      date: "20th May 2024",
      comment: "Great article! Really helpful tips for resume building. Thanks for sharing this valuable information."
    }
  ]

  // Handlers
  const handleBlogClick = (blog) => {
    setSelectedBlog(blog)
  }

  const handleBackToList = () => {
    setSelectedBlog(null)
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the comment to your backend
    console.log('New comment:', commentForm)
    setCommentForm({ name: '', email: '', comment: '' })
  }

  const handleCommentChange = (field, value) => {
    setCommentForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className={`min-h-screen ${BG_COLORS.PRIMARY_NAVY}`}>
      <Navbar />
      
      {/* Hero Section */}
      <section className={`py-10 ${BG_COLORS.SURFACE_PALE_BLUE} mx-4 sm:mx-6 lg:mx-10 rounded-3xl sm:rounded-[50px] my-6 sm:my-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center">
            {/* Top Banner */}
            <div className="mb-5">
              <div className={`inline-block border-2 ${BORDER_COLORS.ACCENT_GREEN} ${TEXT_COLORS.ACCENT_GREEN} px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide`}>
                FOR JOB ASPIRANTS
              </div>
            </div>

            {/* Main Heading */}
            <div className="flex flex-col items-center justify-center text-center mb-5">
              <h1 className={`text-4xl sm:text-5xl md:text-7xl lg:px-20 font-bold mb-6 md:mb-8 ${TEXT_COLORS.PRIMARY_DEEP_BLUE} leading-tight md:leading-tight`}>
                Read Our Blogs & News
              </h1>
              <img src={textunderline} alt="" className="w-2/3 max-w-xs sm:max-w-sm md:max-w-md h-3 md:h-6 -mt-6 md:-mt-10" />
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm sm:text-base md:text-lg sm:mx-10 lg:mx-28 max-w-3xl mx-auto">
              Stay informed with fresh insights from the ITI, polytechnic, and government job market. Check back regularly for the latest opportunities, expert tips, and platform updates.
            </p>
          </div>
        </div>
      </section>

      {/* Conditional Rendering: Blog List or Blog Detail */}
      {!selectedBlog ? (
        /* Main Blog Content Section */
        <section className="py-10 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 xl:gap-14">
              
              {/* Left Sidebar */}
              <div className="lg:col-span-1">
                {/* Search Bar */}
                <div className="mb-8">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search...."
                      className="w-full px-4 py-3 pl-10 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${TEXT_COLORS.ACCENT_GREEN}`} />
                  </div>
                </div>

                {/* Recent News Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Recent News</h3>
                  <div className="space-y-4">
                    {blogData.slice(0, 3).map((blog) => (
                      <div key={blog.id} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-b-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img
                            src={blog.image || placeholderImage}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-800 leading-tight mb-1">
                            {blog.title.length > 60 ? blog.title.substring(0, 60) + '...' : blog.title}
                          </h4>
                          <p className="text-xs text-gray-500 flex flex-wrap gap-1">
                            <span>{blog.author}</span>
                            <span>•</span>
                            <span>{formatDate(blog.date)}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags Section */}
                <div className="hidden lg:block">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Browse Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories
                      .filter(category => category.id !== 'all')
                      .map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? `${BG_COLORS.ACCENT_GREEN} ${TEXT_COLORS.NEUTRAL_WHITE}`
                            : 'bg-blue-50 text-gray-700 hover:bg-blue-100'
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3">
                {/* Category Filter */}
                <div className="mb-8">
                  <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Browse by Category
                    </h3>
                    <p className="text-sm text-gray-500">
                      Showing {filteredBlogs.length} {filteredBlogs.length === 1 ? 'result' : 'results'}
                    </p>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 lg:mx-0 lg:px-0 lg:flex-wrap">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
                          selectedCategory === category.id
                            ? `${BG_COLORS.ACCENT_GREEN} ${TEXT_COLORS.NEUTRAL_WHITE} border-transparent`
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-base">{category.icon}</span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blog Articles Grid */}
                {filteredBlogs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8 mb-8">
                    {filteredBlogs.map((blog) => (
                      <article
                        key={blog.id}
                        className="flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-green-100"
                        onClick={() => handleBlogClick(blog)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleBlogClick(blog)
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Read blog ${blog.title}`}
                      >
                        {/* Article Image */}
                        <div className="mx-3 mt-3 rounded-2xl h-48 bg-gray-200 relative overflow-hidden">
                          <img
                            src={blog.image || placeholderImage}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20"></div> */}
                        </div>
                        
                        {/* Article Content */}
                        <div className="flex flex-col flex-1 p-6">
                          {/* Meta Info */}
                          <p className="text-sm text-gray-500 mb-2">
                            {blog.author} • {formatDate(blog.date)}
                          </p>
                          
                          {/* Title */}
                          <h2 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
                            {blog.title}
                          </h2>
                          <p className="text-sm text-gray-600 mb-4">
                            {blog.excerpt}
                          </p>
                          
                          {/* Tags */}
                          <div className="mt-auto flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {formatCategoryName(blog.category)}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {blog.readTime}
                            </span>
                            {blog.featured && (
                              <span className={`${TEXT_COLORS.ACCENT_GREEN} bg-green-50 border border-green-100 px-2 py-1 text-xs rounded font-semibold`}>
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center bg-blue-50 border border-blue-100 rounded-3xl p-10 mb-8">
                    <FaNewspaper className="text-4xl text-blue-400 mb-4" />
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">No blogs found</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Try adjusting your search or pick a different category to explore more stories.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('all')
                      }}
                      className={`${BG_COLORS.ACCENT_GREEN} ${TEXT_COLORS.NEUTRAL_WHITE} px-5 py-2 rounded-full font-medium ${HOVER_BG_COLORS.ACCENT_GREEN_DARKER} transition-colors`}
                    >
                      Reset filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-center space-x-4">
                  <button className={`w-10 h-10 flex items-center justify-center ${TEXT_COLORS.ACCENT_GREEN} hover:bg-green-50 rounded-full transition-colors`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[1, 2, 3, 4].map((page) => (
                    <button
                      key={page}
                      className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                        page === 1
                          ? `${BG_COLORS.ACCENT_GREEN} ${TEXT_COLORS.NEUTRAL_WHITE}`
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button className={`w-10 h-10 flex items-center justify-center ${TEXT_COLORS.ACCENT_GREEN} hover:bg-green-50 rounded-full transition-colors`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Blog Detail View */
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button 
              onClick={handleBackToList}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors"
            >
              <FaArrowLeft className="text-sm" />
              Back to Blogs
            </button>

            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                {selectedBlog.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {formatCategoryName(selectedBlog.category)}
                </span>
                <span className="flex items-center gap-2">
                  {formatDate(selectedBlog.date)}
                </span>
                <span className="flex items-center gap-2">
                  By {selectedBlog.author}
                </span>
              </div>
            </div>

            {/* Main Article Image */}
            <div className="w-full h-64 md:h-80 bg-gray-200 rounded-lg mb-8 overflow-hidden">
              <img
                src={selectedBlog.image || placeholderImage}
                alt={selectedBlog.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed mb-6">
                {selectedBlog.content}
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Key Takeaways</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 text-base">
                    <li>Understand the fundamentals before you specialize</li>
                    <li>Build a portfolio that showcases real-world projects</li>
                    <li>Stay updated on industry trends and certifications</li>
                    <li>Network with mentors and peers regularly</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Next Steps</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 text-base">
                    <li>Schedule focused study sessions each week</li>
                    <li>Practice with mock interviews or tests</li>
                    <li>Tailor your resume to each opportunity</li>
                    <li>Follow up on applications with confidence</li>
                  </ul>
                </div>
              </div>

              {/* Quote Section */}
              <div className={`${BG_COLORS.PRIMARY_DEEP_BLUE} rounded-lg p-8 my-8 text-center`}>
                <blockquote className={`text-2xl font-bold ${TEXT_COLORS.ACCENT_LIME} mb-4`}>
                  "Everything Is Designed. Few Things Are Designed Well"
                </blockquote>
                <cite className={`${TEXT_COLORS.NEUTRAL_WHITE} text-lg`}>Ryan Gigs - Senior Designer</cite>
              </div>
            </div>

            {/* Footer Meta Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6 border-t border-b border-gray-200 mb-8">
              <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-700">Tags:</span>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                  {formatCategoryName(selectedBlog.category)}
                </span>
                {selectedBlog.featured && (
                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-700">
                    Featured Story
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Share</span>
                <div className="flex gap-3">
                  <button className={`w-8 h-8 ${BG_COLORS.ACCENT_GREEN} rounded-full flex items-center justify-center ${TEXT_COLORS.NEUTRAL_WHITE} ${HOVER_BG_COLORS.ACCENT_GREEN_DARKER} transition-colors`}>
                    <FaFacebookF className="text-sm" />
                  </button>
                  <button className={`w-8 h-8 ${BG_COLORS.ACCENT_GREEN} rounded-full flex items-center justify-center ${TEXT_COLORS.NEUTRAL_WHITE} ${HOVER_BG_COLORS.ACCENT_GREEN_DARKER} transition-colors`}>
                    <FaTwitter className="text-sm" />
                  </button>
                  <button className={`w-8 h-8 ${BG_COLORS.ACCENT_GREEN} rounded-full flex items-center justify-center ${TEXT_COLORS.NEUTRAL_WHITE} ${HOVER_BG_COLORS.ACCENT_GREEN_DARKER} transition-colors`}>
                    <FaLinkedinIn className="text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Comments Section</h3>
              
              <div className="space-y-6 mb-8">
                {commentsData.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800">{comment.author}</h4>
                        <button className={`${TEXT_COLORS.ACCENT_GREEN} text-sm ${HOVER_TEXT_COLORS.ACCENT_GREEN_DARK} transition-colors`}>
                          Reply <FaReply className="inline ml-1 text-xs" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{comment.date}</p>
                      <p className="text-gray-700">{comment.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave A Comment Form */}
            <div className={`${BG_COLORS.SURFACE_SOFT_GREEN} p-8 rounded-lg`}>
              <h3 className={`text-xl font-bold ${TEXT_COLORS.ACCENT_GREEN_DARK} mb-6`}>Leave A Comment</h3>
              
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={commentForm.name}
                      onChange={(e) => handleCommentChange('name', e.target.value)}
                      placeholder="Your name here"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={commentForm.email}
                      onChange={(e) => handleCommentChange('email', e.target.value)}
                      placeholder="Your email here"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                  <textarea
                    value={commentForm.comment}
                    onChange={(e) => handleCommentChange('comment', e.target.value)}
                    placeholder="Your comment here"
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className={`${BG_COLORS.ACCENT_GREEN} ${TEXT_COLORS.NEUTRAL_WHITE} px-6 py-3 rounded-lg font-semibold ${HOVER_BG_COLORS.ACCENT_GREEN_DARKER} transition-colors flex items-center gap-2 shadow-lg`}
                >
                  Post Comment
                  <FaArrowRight className="text-sm" />
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Subscription Section */}
      <NewsletterSubscription 
        headerContent={newsletterHeaderContent}
        onSubscribe={handleNewsletterSubscribe}
        email={email}
        setEmail={setEmail}
        isSubscribed={isSubscribed}
      />

      <Footer />
    </div>
  )
}

export default Blogs
