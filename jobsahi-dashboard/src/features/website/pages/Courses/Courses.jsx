import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Rounded4Cards from "../../components/Rounded4Cards";
import UI8Cards from "../../components/UI8Cards";
import { FaChevronLeft, FaChevronRight, FaArrowUp, FaArrowRight, FaBolt, FaWrench, FaCog, FaPlug, FaHammer, FaCar, FaHardHat, FaUserCheck, FaClipboardList, FaPencilAlt, FaWater, FaGraduationCap, FaUsers, FaBookReader, FaBriefcase, FaFire, FaCogs, FaIndustry, FaTools, FaSnowflake, FaHandsHelping } from "react-icons/fa";
import textunderline from "../../assets/website_text_underline.png";
import howitworksbg from "../../assets/Worksbg_courses.png"
import { COLOR_CLASSES } from "../../components/colorClasses";
import { getMethod } from "../../../../service/api";
import serviceUrl from "../../services/serviceUrl";
import copaImage from "../../assets/courses/COPA.jpg";
import electricianImage from "../../assets/courses/Electrician.jpg";
import fitterImage from "../../assets/courses/Fitter.jpg";
import mechanicImage from "../../assets/courses/Mechanic (Diesel Engine).jpg";
import govImage from "../../assets/courses/gov.jpg";
import workerImage from "../../assets/courses/worker.jpg";
import companyImage from "../../assets/courses/company.jpg";
import tipsImage from "../../assets/courses/tips.jpg";
import coursesPageImage from "../../assets/courses/Coursespage.jpg";

const Courses = () => {
  const navigate = useNavigate();
  // Course cards data
  const courseCards = [
    { title: "Electrician Apprentice", image: electricianImage },
    { title: "COPA", image: copaImage },
    { title: "Fitter", image: fitterImage },
    { title: "Automotive Mechanic", image: mechanicImage }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const getInitialVisibleCards = () => {
    const totalCourses = courseCards.length;
    const width = typeof window !== "undefined" ? window.innerWidth : 1024;

    if (width < 768) return Math.min(1, totalCourses);
    if (width < 1024) return Math.min(3, totalCourses);
    return Math.min(3, totalCourses);
  };
  const [visibleCards, setVisibleCards] = useState(getInitialVisibleCards);

  // Team members data for Rounded4Cards component
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
    }
  ];

  // Rounded4Cards header content
  const rounded4CardsHeaderContent = {
    title: "Explore what's growing in popularity",
    description: "Begin your journey toward a better future—completely free!"
  };

  // State for dynamic categories
  const [courseCategories, setCourseCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Icon mapping for categories
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('electrician') || name.includes('electrical')) return FaBolt;
    if (name.includes('welder') || name.includes('welding')) return FaFire;
    if (name.includes('fitter') || name.includes('fitting')) return FaCogs;
    if (name.includes('cnc') || name.includes('operator')) return FaIndustry;
    if (name.includes('plumber') || name.includes('plumbing')) return FaTools;
    if (name.includes('ac') || name.includes('air conditioning') || name.includes('technician')) return FaSnowflake;
    if (name.includes('helper') || name.includes('assistant')) return FaHandsHelping;
    if (name.includes('maintenance') || name.includes('machine')) return FaCogs;
    if (name.includes('mechanic') || name.includes('automotive')) return FaCar;
    if (name.includes('construction') || name.includes('builder')) return FaHardHat;
    if (name.includes('carpentry') || name.includes('carpenter')) return FaHammer;
    return FaBriefcase; // Default icon
  };

  // Fetch course categories and courses count
  useEffect(() => {
    const fetchCourseCategories = async () => {
      try {
        setLoadingCategories(true);
        
        // Fetch course categories and courses in parallel
        const [categoriesResponse, coursesResponse] = await Promise.all([
          getMethod({ apiUrl: serviceUrl.getCourseCategory }),
          getMethod({ apiUrl: serviceUrl.getCourses })
        ]);

        console.log('Course Categories API Response:', categoriesResponse);
        console.log('Courses API Response:', coursesResponse);

        let categories = [];
        let courses = [];

        // Extract course categories - API returns { status: true, categories: [...] }
        if (categoriesResponse?.status === true || categoriesResponse?.status === 'success') {
          if (Array.isArray(categoriesResponse.categories)) {
            categories = categoriesResponse.categories;
          } else if (Array.isArray(categoriesResponse.data)) {
            categories = categoriesResponse.data;
          }
        }

        // Extract courses
        if (coursesResponse?.status === true || coursesResponse?.status === 'success') {
          if (Array.isArray(coursesResponse.courses)) {
            courses = coursesResponse.courses;
          } else if (Array.isArray(coursesResponse.data)) {
            courses = coursesResponse.data;
          }
        }

        console.log('Extracted Course Categories:', categories);
        console.log('Extracted Courses:', courses);

        // Count courses per category
        const categoryCounts = {};
        courses.forEach(course => {
          const categoryName = course.category_name || course.category || 'Other';
          const formattedCategory = categoryName.trim().toLowerCase();
          categoryCounts[formattedCategory] = (categoryCounts[formattedCategory] || 0) + 1;
        });

        console.log('Course Category Counts:', categoryCounts);

        // Map categories with counts and icons
        const mappedCategories = categories
          .map(cat => {
            const categoryName = cat.category_name || cat.name || cat.title || 'Other';
            const formattedName = categoryName.trim();
            const formattedNameLower = formattedName.toLowerCase();
            const count = categoryCounts[formattedNameLower] || 0;
            
            return {
              title: formattedName,
              count: count,
              subject: "courses Available",
              icon: getCategoryIcon(formattedName),
            };
          })
          .filter(cat => cat.count > 0) // Only show categories with courses
          .sort((a, b) => b.count - a.count) // Sort by count descending
          .slice(0, 8); // Limit to 8 categories

        console.log('Mapped Course Categories:', mappedCategories);
        setCourseCategories(mappedCategories);
      } catch (error) {
        console.error('Error fetching course categories:', error);
        setCourseCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCourseCategories();
  }, []);

  // Courses for Grow Your Skill Set section
  const skillSetCourses = [
    {
      title: "Computer Operator & Programming Assistant (COPA)",
      shortTitle: "COPA",
      category: "Digital Skills",
      image: copaImage
    },
    {
      title: "Electrician Apprentice",
      shortTitle: "Electrician Apprentice",
      category: "Electrical",
      image: electricianImage
    },
    {
      title: "Fitter",
      shortTitle: "Fitter",
      category: "Mechanical",
      image: fitterImage
    },
    {
      title: "Automotive Mechanic",
      shortTitle: "Automotive Mechanic",
      category: "Automotive",
      image: mechanicImage
    }
  ];

  // UI8Cards header content
  const ui8CardsHeaderContent = {
    title: "Explore Job Sahi",
    description: "Find jobs that match your technical skills — electrician, welder, fitter, machinist & more.",
    cta: (
      <button
        type="button"
        onClick={() => navigate("/find-job")}
        className={`px-6 py-3 rounded-full font-semibold text-base text-white flex items-center justify-center gap-2 ${COLOR_CLASSES.bg.accentGreen} ${COLOR_CLASSES.hoverBg.accentGreenDark} transition-colors`}
      >
        <span>Explore your field and start applying today.</span>
        <FaArrowRight className="text-sm" />
      </button>
    )
  };

  // ITI Benefits data
  const itiBenefits = [
    {
      icon: FaUserCheck,
      title: "Practical, Skill-Based Training",
      description: "ITI offline courses focus on real-world, hands-on training that prepares students directly for industry demands."
    },
    {
      icon: FaClipboardList,
      title: "Direct Access To Tools And Machinery",
      description: "Learn using actual industrial equipment and tools—something online courses can't fully replicate."
    },
    {
      icon: FaPencilAlt,
      title: "One-On-One Mentorship",
      description: "Get personal guidance from experienced instructors to better understand technical concepts and improve skills."
    },
    {
      icon: FaGraduationCap,
      title: "Improved Discipline And Focus",
      description: "Structured class schedules and physical presence help build discipline and reduce distractions compared to online learning."
    },
    {
      icon: FaUsers,
      title: "Peer Learning & Teamwork",
      description: "Collaborate with classmates on group projects and practical sessions, enhancing your teamwork and communication skills."
    },
    {
      icon: FaBookReader,
      title: "Industry-Relevant Course Curriculum",
      description: "Progress through course modules co-created with instructors and recruiters so the skills you learn match the latest job requirements."
    }
  ];


  // Handle window resize
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      const totalCourses = courseCards.length;
      const width = typeof window !== "undefined" ? window.innerWidth : 1024;
      let nextVisibleCards = 3;

      if (width < 768) nextVisibleCards = 1;
      else if (width < 1024) nextVisibleCards = 3;

      nextVisibleCards = Math.min(nextVisibleCards, totalCourses);
      setVisibleCards((prev) => (prev === nextVisibleCards ? prev : nextVisibleCards));
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [courseCards.length]);

  useEffect(() => {
    const maxSlides = Math.max(1, courseCards.length - visibleCards + 1);
    setCurrentSlide((prev) => Math.min(prev, maxSlides - 1));
  }, [visibleCards, courseCards.length]);

  const nextSlide = () => {
    const maxSlides = Math.max(1, courseCards.length - visibleCards + 1);
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlides - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const maxSlides = Math.max(1, courseCards.length - visibleCards + 1);
  const canGoPrev = currentSlide > 0;
  const canGoNext = currentSlide < maxSlides - 1;
  const trackWidth = visibleCards > 0 ? (courseCards.length / visibleCards) * 100 : 100;
  const translatePercentage = courseCards.length > 0 ? (currentSlide * 100) / courseCards.length : 0;

  return (
    <div className={`${COLOR_CLASSES.bg.navy} min-h-screen`}>
      <Navbar />
      
      {/* Our Top Courses Header Section */}
      <section className={`py-10 ${COLOR_CLASSES.bg.surfacePaleBlue} mx-4 rounded-[50px] my-8 border-t-4 border-l-4 border-r-4 ${COLOR_CLASSES.border.deepBlue}`}>
        <div className="max-w-[90%] mx-auto px-6">
          <div className="text-center">
            {/* Top Banner */}
            <div className="mb-5">
              <div className={`inline-block border-2 ${COLOR_CLASSES.border.accentGreen} ${COLOR_CLASSES.text.accentGreen} px-6 py-2 rounded-full text-sm font-semibold`}>
                #1 PORTAL JOB PLATFORM
              </div>
            </div>

            {/* Main Heading */}
            <div className="flex flex-col items-center justify-center text-center mb-5 md:mb-12">
              <h1 className={`text-4xl sm:text-5xl md:text-7xl lg:px-20 font-bold mb-8 ${COLOR_CLASSES.text.deepBlue} leading-tight`}>
                Our Top <span className="relative">Courses
                  <img src={textunderline} alt="" className="absolute -bottom-2 left-0 w-full h-6 " />
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-lg">
              Get the latest news, updates and tips.
            </p>
          </div>
        </div>
      </section>

      {/* New On Job Sahi Courses Section */}
      <section className="py-10 bg-white ">
        <div className="max-w-[90%] mx-auto px-6">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className={`text-4xl md:text-5xl font-bold ${COLOR_CLASSES.text.deepBlue} mb-4`}>
              New On Job Sahi
            </h2>
            <p className="text-gray-700 text-lg">
              Explore our newest programs, focused on delivering in-demand skills.
            </p>
          </div>

          {/* Course Cards Carousel */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button 
              onClick={prevSlide}
              type="button"
              disabled={!canGoPrev}
              className={`-mx-5 md:-mx-10 absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 md:-translate-x-4 w-10 h-10 md:w-12 md:h-12 ${COLOR_CLASSES.bg.accentGreen} rounded-full flex items-center justify-center text-white ${COLOR_CLASSES.hoverBg.accentGreenDark} transition-colors z-10 shadow-lg ${!canGoPrev ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Previous courses"
              aria-disabled={!canGoPrev}
            >
              <FaChevronLeft className="text-sm md:text-lg" />
            </button>
            
            <button 
              onClick={nextSlide}
              type="button"
              disabled={!canGoNext}
              className={`-mx-5 md:-mx-10 absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 md:translate-x-4 w-10 h-10 md:w-12 md:h-12 ${COLOR_CLASSES.bg.accentGreen} rounded-full flex items-center justify-center text-white ${COLOR_CLASSES.hoverBg.accentGreenDark} transition-colors z-10 shadow-lg ${!canGoNext ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Next courses"
              aria-disabled={!canGoNext}
            >
              <FaChevronRight className="text-sm md:text-lg" />
            </button>

            {/* Course Cards Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out "
                style={{ 
                  transform: `translateX(-${translatePercentage}%)`,
                  width: `${trackWidth}%`
                }}
              >
                {courseCards.map((course, index) => (
                  <div 
                    key={index} 
                    className="flex-shrink-0 px-4 md:px-10"
                    style={{ 
                      flex: `0 0 ${100 / courseCards.length}%`,
                      maxWidth: `${100 / courseCards.length}%`
                    }}
                  >
                    <div 
                      onClick={() => navigate('/skill-assessment', { state: { course } })}
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg cursor-pointer transition-transform hover:scale-105"
                    >
                      {/* Course Image Placeholder */}
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-48 rounded-xl mb-4 object-cover object-center"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-xl mb-4"></div>
                      )}
                      
                      {/* Course Title */}
                      <h3 className="text-lg font-semibold text-gray-800">
                        {course.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <button className={`border-2 ${COLOR_CLASSES.border.accentGreen} ${COLOR_CLASSES.text.accentGreen} px-8 py-3 rounded-full font-semibold text-lg ${COLOR_CLASSES.hoverBg.accentGreen} hover:text-white transition-colors`}>
              View all
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto  lg:px-6 relative ">
          <img src={howitworksbg} alt="" className="absolute rounded-2xl h-full " />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 lg:gap-12 items-center m-4">
            {/* Left Side - Image */}
            <div className="relative m-4">
              <div className="w-full h-96 rounded-3xl overflow-hidden shadow-xl">
                <img
                  src={coursesPageImage}
                  alt="Steps to start your course journey"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Side - Content */}
            <div className=" p-5 md:p-12 relative md:-ml-8 ">
              <div className="space-y-6">
                {/* Main Heading */}
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  How It Works
                </h2>
                
                {/* Sub Heading */}
                <h3 className="text-xl md:text-2xl font-semibold text-white">
                  WHERE DO I START?
                </h3>

                {/* Description */}
                <p className="text-white text-lg leading-relaxed">
                  Looking to break into a new career quickly and affordably? Get started today with our free introductory course designed to guide you into a high-demand industry—no prior experience or college degree required!
                </p>

                {/* Start For Free Button */}
                <div className="pt-4">
                  <button className={`${COLOR_CLASSES.bg.deepBlue} border-2 ${COLOR_CLASSES.border.accentGreen} text-white px-8 py-4 rounded-full font-semibold text-lg ${COLOR_CLASSES.hoverBg.accentGreen} transition-colors flex items-center space-x-3`}>
                    <span>Start For Free</span>
                    <div className={`w-8 h-8 ${COLOR_CLASSES.bg.accentGreen} rounded-full flex items-center justify-center`}>
                      <FaArrowUp className="text-white text-sm" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grow Your Skill Set Section */}
      <section className="py-16  my-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Grow Your Skill Set
            </h2>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {skillSetCourses.map((course) => (
              <div
                key={course.title}
                onClick={() => navigate('/skill-assessment', { state: { course: { title: course.shortTitle } } })}
                className="bg-gray-100 rounded-2xl p-6 shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl"
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 rounded-xl mb-4 object-cover object-center"
                  loading="lazy"
                />

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-300 rounded" />
                    <span className="text-gray-600 text-sm">By Job Sahi</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800">
                    {course.title}
                  </h3>

                  <p className="text-gray-600">
                    Category: {course.category}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <button className={`${COLOR_CLASSES.bg.accentGreen} text-white px-8 py-4 rounded-full font-semibold text-lg ${COLOR_CLASSES.hoverBg.accentGreenDark} transition-colors`}>
              View All
            </button>
          </div>
        </div>
      </section>

      {/* explore whats growing in popularity */}
      <Rounded4Cards 
        teamMembers={teamMembers}
        title={rounded4CardsHeaderContent.title}
        description={rounded4CardsHeaderContent.description}
      />

      {/* Browse Courses by Category */}
      <UI8Cards 
        jobCategories={courseCategories}
        headerContent={ui8CardsHeaderContent}
        loadingCategories={loadingCategories}
        isCoursesPage={true}
      />

      {/* Why ITI Offline Courses Are The Best Section */}
      <section className="py-10 bg-white my-8">
        <div className="max-w-[90%] mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${COLOR_CLASSES.text.deepBlue} mb-4`}>
              Why ITI Offline Courses Are The Best
            </h2>
            <p className={`text-xl ${COLOR_CLASSES.text.deepBlue}`}>
              Top Reasons To Choose Hands-On Learning
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* First Row - 3 Cards */}
            {itiBenefits.slice(0, 3).map((benefit, index) => (
              <div key={index} className="text-center  hover:shadow-md rounded-lg p-4 hover:border">
                {/* Icon */}
                <div className={`w-20 h-20 ${COLOR_CLASSES.bg.accentLime} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <benefit.icon className={`${COLOR_CLASSES.text.pureWhite} text-3xl`} />
                </div>
                
                {/* Title */}
                <h3 className={`text-xl font-bold ${COLOR_CLASSES.text.deepBlue} mb-4`}>
                  {benefit.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}

            {/* Second Row - 2 Cards (centered) */}
            {itiBenefits.slice(3).map((benefit, index) => (
              <div key={index + 3} className="text-center md:col-span-1 lg:col-span-1 hover:shadow-md rounded-lg p-4">
                {/* Icon */}
                <div className={`w-20 h-20 ${COLOR_CLASSES.bg.accentLime} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <benefit.icon className={`${COLOR_CLASSES.text.pureWhite} text-3xl`} />
                </div>
                
                {/* Title */}
                <h3 className={`text-xl font-bold ${COLOR_CLASSES.text.deepBlue} mb-4`}>
                  {benefit.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
