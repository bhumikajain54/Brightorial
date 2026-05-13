import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BrowseJobByCategory from "../../components/UI8Cards.jsx";
import FAQ from "../../components/FAQ";
import NewsletterSubscription from "../../components/NewsletterSubscription";
import { WEBSITE_COLOR_CLASSES, getWebsiteColor } from "../../components/colorClasses";
import uploadresumebg from "../../assets/uploadresumebg.png";
import textunderline from "../../assets/website_text_underline.png";
import homebanner from "../../assets/home/homebanner.jpg";
import jobsahi from "../../assets/home/jobsahi.jpg";
import homesquare from "../../assets/home/homesquare.jpg";
import homesq from "../../assets/home/homesq.jpg";
import homesmall from "../../assets/home/homesmall.jpg";
import { COLOR_CLASSES } from "../../components/colorClasses";
import { getMethod, postMultipart } from "../../../../service/api";
import serviceUrl from "../../services/serviceUrl";
import Swal from "sweetalert2";

const TrustedByStartups = lazy(() =>
  import("../../components/TrustedByStartups.jsx")
);

import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaSearch,
  FaUpload,
  FaFileAlt,
  FaCheckCircle,
  FaGraduationCap,
  FaUsers,
  FaChartLine,
  FaHandshake,
  FaUserPlus,
  FaPlay,
  FaCalendarAlt,
  FaArrowRight,
  FaChevronDown,
  FaRobot,
  FaWrench,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaBolt,
  FaFire,
  FaCogs,
  FaIndustry,
  FaTools,
  FaSnowflake,
  FaHandsHelping,
  FaUser,
  FaStar,
} from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const { BG, TEXT, BORDER, HOVER_BG, HOVER_TEXT } = WEBSITE_COLOR_CLASSES;
  const colorHex = getWebsiteColor;

  const [isMediaDropdownOpen, setIsMediaDropdownOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobCategories, setJobCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loadingMatchedJobs, setLoadingMatchedJobs] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);

  const handleSubscribe = (emailValue) => {
    console.log("Subscribed with email:", emailValue);
    setIsSubscribed(true);
    setEmail("");
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setLoadingMatchedJobs(true);
      setResumeUploaded(false);
      
      try {
        // Upload resume
        const formData = new FormData();
        formData.append('resume', file);
        
        const uploadResponse = await postMultipart({
          apiUrl: serviceUrl.uploadResume,
          data: formData
        });

        if (uploadResponse.status || uploadResponse.success) {
          setResumeUploaded(true);
          
          // Fetch matched jobs immediately after upload
          const jobsResponse = await getMethod({
            apiUrl: serviceUrl.getMatchedJobs,
            params: {}
          });

          if (jobsResponse.status || jobsResponse.success) {
            let jobsData = [];
            if (Array.isArray(jobsResponse.data)) {
              jobsData = jobsResponse.data;
            } else if (Array.isArray(jobsResponse.jobs)) {
              jobsData = jobsResponse.jobs;
            }

            // Transform jobs data similar to FindJob page
            const transformedJobs = jobsData.map((job, index) => {
              const rawSkills = job.skills_required || job.skills || job.required_skills || '';
              let skillsArray = [];
              if (rawSkills) {
                if (Array.isArray(rawSkills)) {
                  skillsArray = rawSkills.map(s => s.trim()).filter(s => s);
                } else if (typeof rawSkills === 'string') {
                  skillsArray = rawSkills.split(',').map(s => s.trim()).filter(s => s);
                }
              }

              const salaryDisplay = job.salary_min && job.salary_max 
                ? `${job.salary_min}-${job.salary_max}/Monthly`
                : job.salary || job.salary_range || '1500/Monthly';

              return {
                id: job.id || job.job_id || index + 1,
                title: job.title || job.job_title || 'Job Title',
                company: job.company_name || job.employer_name || 'Company',
                location: job.location || job.city || 'Location',
                type: job.employment_type || job.job_type || job.type || 'Full Time',
                category: job.category_name || job.category || job.job_category || 'Other',
                salary: salaryDisplay,
                applied: job.applied_count || job.applications_count || 0,
                capacity: job.capacity || job.max_applications || job.no_of_vacancies || 100,
                skills: skillsArray.length > 0 ? skillsArray : ['Skill'],
                logo: (job.company_name || job.employer_name || 'C')[0].toUpperCase(),
                logoColor: '#00395B',
                experience: job.experience_required || job.experience_level || job.experience || 'Entry Level',
                postedOn: job.created_at || job.posted_date || new Date().toLocaleDateString(),
                applyBefore: job.deadline || job.apply_before || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                description: job.description || job.job_description || 'Job description not available.',
                responsibilities: job.responsibilities ? (Array.isArray(job.responsibilities) ? job.responsibilities : job.responsibilities.split(',')) : [],
                requirements: job.requirements ? (Array.isArray(job.requirements) ? job.requirements : job.requirements.split(',')) : [],
                benefits: job.benefits ? (Array.isArray(job.benefits) ? job.benefits : job.benefits.split(',').map(b => ({ title: b, icon: 'FaShieldAlt', description: b }))) : []
              };
            });

            setMatchedJobs(transformedJobs);
            
            // Scroll to matched jobs section
            setTimeout(() => {
              const matchedJobsSection = document.getElementById('matched-jobs-section');
              if (matchedJobsSection) {
                matchedJobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 500);

            Swal.fire({
              icon: 'success',
              title: 'Resume Uploaded!',
              text: `Found ${transformedJobs.length} matching jobs for you!`,
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            // If matched jobs API fails, fetch all jobs as fallback
            const allJobsResponse = await getMethod({
              apiUrl: serviceUrl.getJobs,
              params: {}
            });

            if (allJobsResponse.status || allJobsResponse.success) {
              let jobsData = [];
              if (Array.isArray(allJobsResponse.data)) {
                jobsData = allJobsResponse.data.slice(0, 10); // Show first 10 jobs
              }

              const transformedJobs = jobsData.map((job, index) => {
                const rawSkills = job.skills_required || job.skills || job.required_skills || '';
                let skillsArray = [];
                if (rawSkills) {
                  if (Array.isArray(rawSkills)) {
                    skillsArray = rawSkills.map(s => s.trim()).filter(s => s);
                  } else if (typeof rawSkills === 'string') {
                    skillsArray = rawSkills.split(',').map(s => s.trim()).filter(s => s);
                  }
                }

                return {
                  id: job.id || job.job_id || index + 1,
                  title: job.title || job.job_title || 'Job Title',
                  company: job.company_name || job.employer_name || 'Company',
                  location: job.location || job.city || 'Location',
                  type: job.employment_type || job.job_type || job.type || 'Full Time',
                  category: job.category_name || job.category || job.job_category || 'Other',
                  salary: job.salary_min && job.salary_max ? `${job.salary_min}-${job.salary_max}/Monthly` : job.salary || '1500/Monthly',
                  skills: skillsArray.length > 0 ? skillsArray : ['Skill'],
                  logo: (job.company_name || job.employer_name || 'C')[0].toUpperCase(),
                  logoColor: '#00395B'
                };
              });

              setMatchedJobs(transformedJobs);
              
              setTimeout(() => {
                const matchedJobsSection = document.getElementById('matched-jobs-section');
                if (matchedJobsSection) {
                  matchedJobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 500);

              Swal.fire({
                icon: 'success',
                title: 'Resume Uploaded!',
                text: `Showing ${transformedJobs.length} jobs for you!`,
                timer: 3000,
                showConfirmButton: false
              });
            }
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: uploadResponse.message || 'Failed to upload resume. Please try again.',
          });
        }
      } catch (error) {
        console.error('Error uploading resume:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong. Please try again.',
        });
      } finally {
        setLoadingMatchedJobs(false);
      }
    }
  };

  const handleUploadClick = () => {
    const input = document.getElementById("fileInput");
    if (input) input.click();
  };

  // Filter locations and categories based on search input
  const filteredLocations = useMemo(() => {
    if (!searchLocation) return locations;
    return locations.filter(loc => 
      loc.toLowerCase().includes(searchLocation.toLowerCase())
    );
  }, [locations, searchLocation]);

  const filteredCategories = useMemo(() => {
    if (!searchCategory) return categories;
    return categories.filter(cat => 
      cat.toLowerCase().includes(searchCategory.toLowerCase())
    );
  }, [categories, searchCategory]);

  const navigateToFindJob = () => {
    // Build URL with search params
    const params = new URLSearchParams();
    if (searchLocation.trim()) {
      params.set('location', searchLocation.trim());
    }
    if (searchCategory.trim()) {
      params.set('category', searchCategory.trim());
    }
    
    const queryString = params.toString();
    const url = queryString ? `/find-job?${queryString}` : '/find-job';
    
    navigate(url);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 850);
    };

    handleResize(); // initial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    if (name.includes('mechanic') || name.includes('automotive')) return FaWrench;
    return FaBriefcase; // Default icon
  };

  // Fetch job categories and jobs count
  useEffect(() => {
    const fetchJobCategories = async () => {
      try {
        setLoadingCategories(true);
        
        // Fetch categories and jobs in parallel
        const [categoriesResponse, jobsResponse] = await Promise.all([
          getMethod({ apiUrl: serviceUrl.getJobCategory }),
          getMethod({ apiUrl: serviceUrl.getJobs })
        ]);

        console.log('Categories API Response:', categoriesResponse);
        console.log('Jobs API Response:', jobsResponse);

        let categories = [];
        let jobs = [];

        // Extract categories - API returns { status: true, categories: [...] }
        if (categoriesResponse?.status === true || categoriesResponse?.status === 'success') {
          if (Array.isArray(categoriesResponse.categories)) {
            categories = categoriesResponse.categories;
          } else if (Array.isArray(categoriesResponse.data)) {
            categories = categoriesResponse.data;
          }
        }

        // Extract jobs
        if (jobsResponse?.status === true || jobsResponse?.status === 'success') {
          if (Array.isArray(jobsResponse.data)) {
            jobs = jobsResponse.data;
          } else if (Array.isArray(jobsResponse.jobs)) {
            jobs = jobsResponse.jobs;
          }
        }

        console.log('Extracted Categories:', categories);
        console.log('Extracted Jobs:', jobs);

        // Count jobs per category
        const categoryCounts = {};
        jobs.forEach(job => {
          const categoryName = job.category || job.job_category || job.category_name || 'Other';
          const formattedCategory = categoryName.trim().toLowerCase();
          categoryCounts[formattedCategory] = (categoryCounts[formattedCategory] || 0) + 1;
        });

        console.log('Category Counts:', categoryCounts);

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
              subject: "Jobs Available",
              icon: getCategoryIcon(formattedName),
            };
          })
          .sort((a, b) => b.count - a.count) // Sort by count descending
          .slice(0, 8); // Limit to 8 categories

        console.log('Mapped Categories:', mappedCategories);
        setJobCategories(mappedCategories);

        // Extract unique locations and categories for search dropdowns
        const uniqueLocations = [...new Set(jobs.map(job => job.location || job.city).filter(Boolean))].sort();
        const uniqueCategories = [...new Set(jobs.map(job => {
          const catName = job.category || job.job_category || job.category_name || 'Other';
          return catName.trim();
        }).filter(Boolean))].sort();
        
        setLocations(uniqueLocations);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching job categories:', error);
        // Fallback to empty array
        setJobCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchJobCategories();
  }, []);

  const faqs = [
    {
      question: "How do I create an account on JOBSAHI?",
      answer:
        'Creating an account is simple! Just click on the "Sign Up" button, fill in your basic information, verify your email, and you\'re ready to start your job search journey.',
    },
    {
      question: "Is JOBSAHI free for candidates?",
      answer:
        "Yes, JOBSAHI is completely free for ITI and Polytechnic candidates. We believe in providing equal opportunities for all candidates to access quality job opportunities.",
    },
    {
      question: "What types of jobs are available on JOBSAHI?",
      answer:
        "We offer a wide range of job opportunities including engineering positions, technical roles, manufacturing jobs, healthcare positions, and many more across various industries.",
    },
    {
      question: "How does the job matching work?",
      answer:
        "Our AI-powered system analyzes your profile, skills, and preferences to match you with relevant job opportunities. The more complete your profile, the better the matches.",
    },
    {
      question: "Can I apply for jobs directly through JOBSAHI?",
      answer:
        "Yes! You can apply for jobs directly through our platform. Simply browse jobs, click apply, and your application will be sent to the recruiter.",
    },
    {
      question: "How do I update my resume on JOBSAHI?",
      answer:
        "You can easily update your resume by going to your profile settings and uploading a new version. We recommend keeping your resume updated with your latest skills and experience.",
    },
  ];

  const blogPosts = [
    {
      title: "strategies for success: customer engagement art copy",
      excerpt:
        "Discover the most in-demand skills that will boost your career prospects...",
      author: "John Doe",
      date: "March 20, 2024",
      category: "Design",
      location: "New York",
      tags: ["Design", "Marketing", "Creative"],
    },
    {
      title: "How to Prepare for Technical Interviews",
      excerpt:
        "A comprehensive guide to ace your technical interviews and land your dream job...",
      author: "Jane Smith",
      date: "March 18, 2024",
      category: "Interview Tips",
      location: "London",
      tags: ["Career", "Interview", "Skills"],
    },
    {
      title: "Polytechnic vs ITI: Which Path is Right for You?",
      excerpt:
        "Compare the benefits and career opportunities of both educational paths...",
      author: "Mike Johnson",
      date: "March 15, 2024",
      category: "Education",
      location: "Delhi",
      tags: ["Education", "Career", "Guidance"],
    },
    {
      title: "Digital Marketing Trends for 2024",
      excerpt:
        "Stay ahead with the latest digital marketing strategies and trends...",
      author: "Sarah Wilson",
      date: "March 12, 2024",
      category: "Marketing",
      location: "Mumbai",
      tags: ["Marketing", "Digital", "Trends"],
    },
    {
      title: "Building a Strong Professional Network",
      excerpt:
        "Learn how to build meaningful professional relationships that advance your career...",
      author: "David Brown",
      date: "March 10, 2024",
      category: "Networking",
      location: "Bangalore",
      tags: ["Networking", "Career", "Professional"],
    },
  ];

  const getTotalSlides = () => {
    return Math.ceil(blogPosts.length / (isMobile ? 1 : 3));
  };

  const nextSlide = () => {
    const totalSlides = getTotalSlides();
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    const totalSlides = getTotalSlides();
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const totalSlides = Math.ceil(blogPosts.length / (isMobile ? 1 : 3));
        if (totalSlides === 0) return 0;
        return (prev + 1) % totalSlides;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, blogPosts.length]);

  useEffect(() => {
    const totalSlides = getTotalSlides();
    setCurrentSlide((prev) => {
      if (totalSlides === 0) return 0;
      return prev % totalSlides;
    });
  }, [isMobile]);


  const browseJobHeaderContent = {
    title: (
      <>
        Browse <span className={TEXT.ACCENT_SKY}>The Job</span>{" "}
        <span className="block sm:inline">By{" "}
        <span className={TEXT.ACCENT_SKY}>Category</span></span>
      </>
    ),
    description: (
      <>
        Find Jobs That Match Your Technical Skills — Electrician, Welder,
        Fitter, Machinist &amp; More.
      </>
    ),
    cta: (
      <button
        onClick={navigateToFindJob}
        className="inline-flex items-center justify-center text-[#A1E366] text-xs sm:text-sm md:text-base lg:text-lg font-semibold border border-[#A1E366] rounded-full px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 hover:bg-[#A1E366] hover:text-[#00395B] transition-colors duration-200 w-full sm:w-auto"
      >
        <span className="text-center">Explore Your Field And Start Applying Today</span>
        <FaArrowRight className="ml-2 text-xs sm:text-sm flex-shrink-0" />
      </button>
    ),
  };

  const faqHeaderContent = {
    title: <>We've Got The Answers</>,
    description:
      "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor",
  };

  const newsletterHeaderContent = {
    title:
      "Get Fresh Job Openings, Apprenticeships, And Career Tips Straight To Your Inbox.",
  };

  return (
    <div className={BG.PRIMARY_NAVY}>
      <Navbar />

      {/* HERO SECTION – Figma Accurate */}
      <section className="min-h-screen bg-[#E7F3FD] mx-1 sm:mx-2 md:mx-3 lg:mx-4 rounded-[20px] sm:rounded-[30px] md:rounded-[40px] lg:rounded-[50px] relative overflow-x-hidden overflow-y-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 py-6 sm:py-8 md:py-10 lg:py-12 relative z-0">
          {/* Top Tag */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className={`inline-block border-2 ${COLOR_CLASSES.border.accentGreen} ${COLOR_CLASSES.text.accentGreen} px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold`}>
              #1 PORTAL JOB PLATFORM
            </div>
          </div>

          {/* Heading & underline */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-2">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#00395B] leading-[1.1] sm:leading-tight mb-3 sm:mb-4">
              The Easiest Way To Get Your New Job
            </h1>
            <div className="flex justify-center -mt-2 sm:-mt-3 md:-mt-4">
              <img
                src={textunderline}
                alt="Decorative underline for heading"
                className="w-[70%] xs:w-[65%] sm:w-[55%] md:w-[50%] lg:w-[45%] max-w-sm h-auto min-h-[10px] xs:min-h-[12px] sm:min-h-[15px] md:min-h-[18px] lg:min-h-[25px] xl:min-h-[30px] object-contain"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>

          {/* Description */}
          <div className="text-center mb-8 sm:mb-12 md:mb-14 lg:mb-16 max-w-4xl mx-auto px-2">
            <p className="text-sm sm:text-base md:text-lg font-light mb-3 sm:mb-4 leading-relaxed text-gray-700">
              Every month, over 5 lakh ITI candidates use JobSahi to explore jobs,
              apprenticeships, and courses. Start your career journey with just
              one click.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-[#00395B] font-medium">
              अपना शहर और ट्रेड चुनें और नई नौकरी की शुरुआत करें!
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-4xl mx-auto mb-6 sm:mb-8 md:mb-12 lg:mb-16 xl:mb-20 px-2 xs:px-3 sm:px-4">
            <div className="bg-white rounded-xl xs:rounded-2xl sm:rounded-full shadow-xl px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 xl:px-7 py-2.5 xs:py-3 sm:py-3.5 md:py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 relative z-10 overflow-visible">
              {/* Location Search Input */}
              <div className="flex-1 relative w-full sm:w-auto min-w-0 z-50" data-location-input>
                <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 w-full min-h-[44px] xs:min-h-[46px] sm:min-h-[44px] md:min-h-0 px-2 xs:px-2.5 sm:px-3 md:px-2 lg:px-0 py-2 xs:py-2.5 sm:py-2 md:py-0 rounded-lg xs:rounded-xl sm:rounded-none bg-transparent">
                  <FaMapMarkerAlt className="text-[#8CD63E] text-sm xs:text-base sm:text-lg md:text-xl flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Location..."
                    value={searchLocation}
                    onChange={(e) => {
                      setSearchLocation(e.target.value);
                      setShowLocationDropdown(true);
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    onBlur={(e) => {
                      setTimeout(() => {
                        if (!e.currentTarget.contains(document.activeElement)) {
                          setShowLocationDropdown(false);
                        }
                      }, 200);
                    }}
                    className="flex-1 text-xs xs:text-sm sm:text-base text-[#8CD63E] placeholder-[#8CD63E]/60 outline-none bg-transparent min-w-0 w-0"
                  />
                  <FaChevronDown className="text-[#8CD63E] text-[10px] xs:text-xs sm:text-sm flex-shrink-0 ml-0.5" />
                </div>
                {/* Location Dropdown */}
                {showLocationDropdown && filteredLocations.length > 0 && (
                  <div 
                    className="absolute z-[100] w-full mt-0.5 xs:mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                    style={{ 
                      top: '100%',
                      left: 0,
                      right: 0,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredLocations.map((location, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSearchLocation(location);
                          setShowLocationDropdown(false);
                        }}
                        className="px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 hover:bg-gray-100 cursor-pointer text-xs xs:text-sm transition-colors"
                        style={{ color: '#00395B' }}
                      >
                        {location}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider - Desktop */}
              <div className="hidden sm:block w-px h-6 sm:h-7 md:h-8 lg:h-9 bg-[#8CD63E] flex-shrink-0" />

              {/* Mobile Divider */}
              <div className="block sm:hidden w-full h-px bg-gray-200 -mx-2 xs:-mx-3" />

              {/* Category Search Input */}
              <div className="flex-1 relative w-full sm:w-auto min-w-0 z-50" data-category-input>
                <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 w-full min-h-[44px] xs:min-h-[46px] sm:min-h-[44px] md:min-h-0 px-2 xs:px-2.5 sm:px-3 md:px-2 lg:px-0 py-2 xs:py-2.5 sm:py-2 md:py-0 rounded-lg xs:rounded-xl sm:rounded-none bg-transparent">
                  <FaBriefcase className="text-[#8CD63E] text-sm xs:text-base sm:text-lg md:text-xl flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Category..."
                    value={searchCategory}
                    onChange={(e) => {
                      setSearchCategory(e.target.value);
                      setShowCategoryDropdown(true);
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    onBlur={(e) => {
                      setTimeout(() => {
                        if (!e.currentTarget.contains(document.activeElement)) {
                          setShowCategoryDropdown(false);
                        }
                      }, 200);
                    }}
                    className="flex-1 text-xs xs:text-sm sm:text-base text-[#8CD63E] placeholder-[#8CD63E]/60 outline-none bg-transparent min-w-0 w-0"
                  />
                  <FaChevronDown className="text-[#8CD63E] text-[10px] xs:text-xs sm:text-sm flex-shrink-0 ml-0.5" />
                </div>
                {/* Category Dropdown */}
                {showCategoryDropdown && filteredCategories.length > 0 && (
                  <div 
                    className="absolute z-[100] w-full mt-0.5 xs:mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                    style={{ 
                      top: '100%',
                      left: 0,
                      right: 0,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredCategories.map((category, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSearchCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                        className="px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 hover:bg-gray-100 cursor-pointer text-xs xs:text-sm transition-colors"
                        style={{ color: '#00395B' }}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Divider */}
              <div className="block sm:hidden w-full h-px bg-gray-200 -mx-2 xs:-mx-3" />

              {/* Search Button */}
              <button
                onClick={navigateToFindJob}
                className="w-full sm:w-auto sm:flex-shrink-0 border-2 border-[#8CD63E] text-[#8CD63E] hover:bg-[#8CD63E] hover:text-white active:bg-[#7BC52E] active:border-[#7BC52E] rounded-lg xs:rounded-xl sm:rounded-full px-3 xs:px-4 sm:px-5 md:px-6 py-2 xs:py-2.5 sm:py-2 md:py-2.5 font-semibold text-xs xs:text-sm sm:text-base md:text-lg flex items-center justify-center gap-1.5 xs:gap-2 transition-all duration-200 min-h-[44px] xs:min-h-[46px] sm:min-h-[44px] md:min-h-0 shadow-sm sm:shadow-none whitespace-nowrap"
              >
                <span className="whitespace-nowrap">नौकरी खोजें</span>
                <span className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 bg-[#8CD63E] rounded-full flex items-center justify-center flex-shrink-0">
                  <FaSearch className="text-white text-[10px] xs:text-xs sm:text-xs md:text-sm" />
                </span>
              </button>
            </div>
          </div>

          {/* Illustration Area */}
          <div className="relative w-full flex justify-center mt-8 sm:mt-12 md:mt-16 lg:mt-24 xl:mt-32 mb-12 sm:mb-16 md:mb-20 lg:mb-24 xl:mb-32 px-3 sm:px-4 md:px-6 overflow-visible">
            <div className="relative w-full max-w-6xl mx-auto overflow-visible">
              
              {/* Left green bubbles - horizontally aligned design with improved spacing */}
              <div className="absolute -top-1 sm:-top-1.5 md:-top-2 left-0 sm:left-1 md:left-2 lg:left-4 z-40 animate-fade-in">
                <div className="relative flex items-center">
                  {/* First pill - overlapping */}
                  <div className="w-6 h-4 xs:w-7 xs:h-5 sm:w-9 sm:h-6 md:w-11 md:h-7 bg-[#CFF49A] rounded-full shadow-[0_4px_15px_rgba(207,244,154,0.5)] -mr-1 xs:-mr-1.5 sm:-mr-2 md:-mr-2.5" />
                  {/* Second pill - overlapping */}
                  <div className="w-6 h-4 xs:w-7 xs:h-5 sm:w-9 sm:h-6 md:w-11 md:h-7 bg-[#CFF49A] rounded-full shadow-[0_4px_15px_rgba(207,244,154,0.5)] -mr-1 xs:-mr-1.5 sm:-mr-2 md:-mr-2.5" />
                  {/* Third pill - overlapping */}
                  <div className="w-6 h-4 xs:w-7 xs:h-5 sm:w-9 sm:h-6 md:w-11 md:h-7 bg-[#CFF49A] rounded-full shadow-[0_4px_15px_rgba(207,244,154,0.5)] -mr-0.5 xs:-mr-1 sm:-mr-1.5 md:-mr-2" />
                  {/* Plus icon circle */}
                  <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 bg-[#8CD63E] rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(140,214,62,0.4)] ring-2 ring-white/50">
                    <FaPlus className="text-white text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px]" />
                  </div>
                </div>
              </div>
              {/* Main white chat box with image */}
              <div className="w-full h-auto md:h-[350px] lg:h-[400px] xl:h-[450px] 2xl:h-[500px] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.12)] relative overflow-hidden border border-gray-100/50 bg-gray-100">
                {/* Mobile Image - jobsahi.jpg - Visible only on mobile (< 768px) - Auto height */}
                <img 
                  src={jobsahi} 
                  alt="JobSahi - The easiest way to get your new job. Find opportunities for ITI and Polytechnic candidates." 
                  className="block md:hidden w-full h-auto max-h-[400px] xs:max-h-[420px] sm:max-h-[450px] object-contain object-center rounded-2xl sm:rounded-3xl"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  sizes="100vw"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                {/* Desktop Image - homebanner.jpg - Visible only on desktop (>= 768px) - Fixed height */}
                <img 
                  src={homebanner} 
                  alt="JobSahi - The easiest way to get your new job. Find opportunities for ITI and Polytechnic candidates." 
                  className="hidden md:block absolute top-0 left-0 w-full h-full object-cover object-center rounded-2xl sm:rounded-3xl md:rounded-[2.5rem]"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    maxWidth: '100%'
                  }}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  sizes="(max-width: 1024px) 90vw, 1200px"
                />
                {/* Subtle overlay for better visual effect - Desktop only */}
                <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] pointer-events-none z-10" />
              </div>

              {/* Right side white box with improved styling - Desktop only */}
              <div className="hidden md:block absolute -bottom-16 sm:-bottom-20 md:-bottom-24 lg:-bottom-28 xl:-bottom-32 right-0 z-30 animate-slide-in-right overflow-visible">
                <div className="w-[140px] h-[120px] sm:w-[180px] sm:h-[160px] md:w-[200px] md:h-[180px] lg:w-[240px] lg:h-[220px] bg-white rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.12)] relative overflow-hidden border border-gray-100/50">
                  <img 
                    src={homesquare} 
                    alt="JobSahi platform showcase - Career opportunities for candidates" 
                    className="absolute inset-0 w-full h-full object-cover object-center rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-[2.5rem]"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 1024px) 200px, 240px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-blue-50/30 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(207,244,154,0.1),_transparent_70%)]" />
                </div>
              </div>

              {/* Top-right tag - light green speech bubble with enhanced design - Desktop only */}
              <div className="hidden md:block absolute -top-2 sm:-top-3 md:-top-4 lg:-top-6 xl:-top-8 right-2 sm:right-4 md:right-6 lg:right-8 xl:right-10 bg-gradient-to-br from-[#CFF49A] to-[#B8E87A] text-gray-800 px-3 sm:px-4 md:px-5 lg:px-7 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl md:rounded-3xl text-[10px] sm:text-xs md:text-sm font-semibold shadow-[0_8px_25px_rgba(207,244,154,0.4)] z-40 border border-[#8CD63E]/40 backdrop-blur-sm hover:shadow-[0_10px_30px_rgba(207,244,154,0.5)] transition-all duration-300">
                <p className="leading-tight drop-shadow-sm">
                  Let&apos;s Find Your Opportunity
                  <br />
                  <span className="text-[#4A7C0F]">To Grow</span>
                </p>
              </div>

      
            

              {/* Bottom-left tag - light green speech bubble with enhanced styling - Desktop only */}
              <div className="hidden md:block absolute -bottom-6 sm:-bottom-7 md:-bottom-8 lg:-bottom-10 xl:-bottom-12 left-2 sm:left-4 md:left-6 lg:left-8 bg-gradient-to-br from-[#CFF49A] to-[#B8E87A] border-2 border-[#8CD63E] px-3 sm:px-4 md:px-5 lg:px-7 py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-[0_10px_30px_rgba(207,244,154,0.4)] z-40 hover:shadow-[0_12px_35px_rgba(207,244,154,0.5)] transition-all duration-300">
                <p className="text-[#4A7C0F] text-xs sm:text-sm md:text-base font-bold leading-tight drop-shadow-sm">
                  Start Your Career With{" "}
                  JobSahi
                </p>
              </div>

              {/* Center play button with text - Responsive design for all screens */}
              <div className="absolute -bottom-8 sm:-bottom-10 md:-bottom-12 lg:-bottom-14 xl:-bottom-16 left-1/2 -translate-x-1/2 z-40 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-5">
                <button
                  onClick={navigateToFindJob}
                  className="cursor-pointer group flex-shrink-0 focus:outline-none focus:ring-4 focus:ring-[#8CD63E]/30 rounded-full transition-all duration-300"
                  aria-label="Search Jobs"
                >
                  <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px] bg-gradient-to-br from-[#00395B] to-[#002A42] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,57,91,0.4)] group-hover:scale-110 group-hover:shadow-[0_15px_40px_rgba(0,57,91,0.6)] transition-all duration-300 group-active:scale-95">
                    <FaPlay className="text-white text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl ml-0.5 xs:ml-1 drop-shadow-md" />
                  </div>
                </button>
                <p className="text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold text-[#00395B] whitespace-nowrap text-center sm:text-left drop-shadow-sm px-2">
                  Search Jobs, Give Skill Tests, Get Hired
                </p>
              </div>
            </div>
          </div>

          {/* Company Logos Section - Below Illustration Area */}
          <div className="relative w-full max-w-6xl mx-auto mt-8 sm:mt-12 md:mt-16 lg:mt-20 px-3 sm:px-4">
         
            {/* Bottom section with logos - Lighter blue/white background (30%) */}
            <div className="w-full bg-blue-50/50 rounded-b-2xl sm:rounded-b-3xl md:rounded-b-[2.5rem] py-6 sm:py-8 md:py-10 lg:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                {/* Ashok Leyland Logo */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[#00395B] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">A</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#00395B] font-bold text-xs sm:text-sm md:text-base uppercase mb-0.5 sm:mb-1 truncate">
                      ASHOK LEYLAND
                    </h3>
                    <p className="text-[#00395B] text-[10px] sm:text-xs md:text-sm uppercase opacity-70 line-clamp-2">
                      YOUR TAGLINE GOES HERE
                    </p>
                  </div>
                </div>

                {/* Yamaha Logo */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[#00395B] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base sm:text-lg md:text-xl">Y</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#00395B] font-bold text-xs sm:text-sm md:text-base uppercase mb-0.5 sm:mb-1 truncate">
                      YAMAHA
                    </h3>
                    <p className="text-[#00395B] text-[10px] sm:text-xs md:text-sm uppercase opacity-70 line-clamp-2">
                      YOUR TAGLINE GOES HERE
                    </p>
                  </div>
                </div>

                {/* Hero Honda Logo */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[#00395B] rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border-2 border-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 border border-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#00395B] font-bold text-xs sm:text-sm md:text-base uppercase mb-0.5 sm:mb-1 truncate">
                      HERO HONDA
                    </h3>
                    <p className="text-[#00395B] text-[10px] sm:text-xs md:text-sm uppercase opacity-70 line-clamp-2">
                      YOUR TAGLINE GOES HERE
                    </p>
                  </div>
                </div>

                {/* Maruti Suzuki Logo */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[#00395B] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base sm:text-lg md:text-xl">S</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#00395B] font-bold text-xs sm:text-sm md:text-base uppercase mb-0.5 sm:mb-1 truncate">
                      MARUTI SUZUKI
                    </h3>
                    <p className="text-[#00395B] text-[10px] sm:text-xs md:text-sm uppercase opacity-70 line-clamp-2">
                      YOUR TAGLINE GOES HERE
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Job */}
      <BrowseJobByCategory
        jobCategories={jobCategories}
        headerContent={browseJobHeaderContent}
        loading={loadingCategories}
      />

      {/* Upload Resume */}
      <section className="my-4 sm:my-6 md:my-8 lg:my-10 px-2 sm:px-3 md:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Main Card */}
            <div className="shadow-2xl relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[350px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px]">
              <img 
                src={uploadresumebg} 
                alt="Upload your resume background - Get matched with job opportunities instantly on JobSahi" 
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
                sizes="100vw"
              />
              {/* Main Content */}
              <div className="text-center relative px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-12 lg:py-16 z-10">
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <div
                    className={`inline-block ${BG.ACCENT_GREEN} text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full font-bold text-xs sm:text-sm`}
                  >
                    #1 PORTAL JOB PLATFORM
                  </div>
                </div>

                <div className="pb-4 sm:pb-6 md:pb-8 lg:pb-10 my-4 sm:my-6 md:my-8 lg:my-10">
                  {/* Main Heading */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-4 sm:mb-5 md:mb-6 leading-tight px-2">
                    Upload Your{" "}
                    <span className={TEXT.PRIMARY_DEEP_BLUE}>Resume</span> &amp;
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>
                    Get{" "}
                    <span className={TEXT.PRIMARY_DEEP_BLUE}>
                      Matched Instantly
                    </span>
                  </h2>

                  {/* Descriptive Text */}
                  <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg mb-3 sm:mb-4">
                      Don&apos;t wait! Just upload your resume and let
                      <br className="hidden sm:block" />
                      <span className="sm:hidden"> </span>
                      JobSahi find the perfect job for you.
                    </p>
                    <p
                      className={`text-sm sm:text-base md:text-lg font-medium ${TEXT.PRIMARY_DEEP_BLUE} mb-2`}
                    >
                      हर महीने लाखों ITI छात्र ऐसे ही नौकरी पाते हैं
                    </p>
                    <div className="font-bold text-sm sm:text-base text-gray-700">
                      नीचे अपना रिज़्यूमे अपलोड करें
                    </div>
                  </div>

                  {/* Upload Button */}
                  <div className="flex justify-center px-2">
                    <input
                      type="file"
                      id="fileInput"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={handleUploadClick}
                      className={`border-2 ${BORDER.ACCENT_GREEN} ${TEXT.ACCENT_GREEN} px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base md:text-lg ${HOVER_BG.ACCENT_GREEN} hover:text-white flex items-center space-x-2 sm:space-x-3 transition-all duration-200`}
                    >
                      <span>Upload CV</span>
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${BG.ACCENT_GREEN} rounded-full flex items-center justify-center`}
                      >
                        <FaUpload className="text-white text-xs sm:text-sm" />
                      </div>
                    </button>
                  </div>

                  {/* Selected File Display */}
                  {selectedFile && (
                    <div className="flex justify-center mt-4 px-2">
                      <div className="bg-green-50 border border-green-200 rounded-lg px-3 sm:px-4 py-2 flex items-center space-x-2 max-w-[90%] sm:max-w-none">
                        {loadingMatchedJobs ? (
                          <>
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-green-800 font-medium text-xs sm:text-sm">
                              Processing resume and finding jobs...
                            </span>
                          </>
                        ) : (
                          <>
                            <FaFileAlt className="text-green-600 text-sm sm:text-base flex-shrink-0" />
                            <span className="text-green-800 font-medium text-xs sm:text-sm truncate">
                              Selected: {selectedFile.name}
                            </span>
                            {resumeUploaded && (
                              <FaCheckCircle className="text-green-600 text-sm sm:text-base flex-shrink-0" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matched Jobs Section */}
      {matchedJobs.length > 0 && (
        <section id="matched-jobs-section" className="my-6 sm:my-8 md:my-10 lg:my-12 px-2 sm:px-3 md:px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3" style={{ color: '#00395B' }}>
                Jobs Matched for You
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Based on your resume, we found {matchedJobs.length} matching job{matchedJobs.length !== 1 ? 's' : ''} for you!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {matchedJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/find-job?jobId=${job.id}`)}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                    {/* Company Logo */}
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl md:text-2xl flex-shrink-0"
                      style={{ backgroundColor: job.logoColor || '#00395B' }}
                    >
                      {job.logo}
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 break-words" style={{ color: '#00395B' }}>
                        {job.title}
                      </h3>
                      <p className="mb-2 sm:mb-3 text-sm sm:text-base break-words text-gray-600">
                        {job.company} • {job.location}
                      </p>

                      {/* Job Type & Salary */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-3 sm:mb-4 gap-2 sm:gap-0">
                        <div className="flex items-center space-x-2">
                          <FaBriefcase className="text-xs sm:text-sm text-gray-500" />
                          <span className="text-xs sm:text-sm text-gray-600">{job.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs sm:text-sm text-gray-600">{job.salary}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                          {job.skills.slice(0, 3).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium rounded-full bg-green-100 text-green-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium rounded-full bg-gray-100 text-gray-600">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    className="w-full px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 font-semibold rounded-lg transition-colors text-sm sm:text-base text-white"
                    style={{ backgroundColor: '#8CD63E' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#7BC52E'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#8CD63E'}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/find-job?jobId=${job.id}`);
                    }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* View All Jobs Button */}
            <div className="text-center mt-6 sm:mt-8 md:mt-10">
              <button
                onClick={() => navigate('/find-job')}
                className="px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 font-semibold rounded-full text-sm sm:text-base md:text-lg text-white transition-all duration-200"
                style={{ backgroundColor: '#00395B' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#002d47'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#00395B'}
              >
                View All Jobs
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Right For You */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
          {/* Left visuals */}
          <div className="relative mb-6 lg:mb-0 flex justify-center lg:justify-start">
          <div className="w-[85%] sm:w-[80%] lg:w-auto -mt-2 sm:-mt-3 md:-mt-4 lg:-mt-5 px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            <div className="w-56 h-56 sm:w-60 sm:h-60 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-blue-100 rounded-3xl relative overflow-hidden border-[6px] sm:border-[8px] md:border-[10px] lg:border-[12px] border-white mx-auto lg:mx-0">
              <img 
                src={homesq} 
                alt="Home abstract shapes" 
                className="w-full h-full object-cover rounded-3xl"
              />
              <div className="absolute top-0 left-0 w-full h-full">
                {/* Green Badge */}
                <div className="absolute border-[3px] sm:border-[4px] md:border-[5px] border-white -top-1 sm:-top-1.5 md:-top-2 -left-1 sm:-left-1.5 md:-left-2 bg-[#CFF49A] rounded-md sm:rounded-lg md:rounded-lg p-1 sm:p-1.5 md:p-2 shadow-md z-10">
                  <div className="text-center">
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-white rounded-full flex items-center justify-center mx-auto mb-0.5 sm:mb-0.5 md:mb-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-[#CFF49A] rounded-full" />
                    </div>
                    <p className="text-black font-bold text-[7px] sm:text-[8px] md:text-[9px]">Top No. 1</p>
                    <p className="text-black text-[6px] sm:text-[7px] md:text-[8px]">Portal Job Web</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute border-[5px] sm:border-[6px] md:border-[7px] lg:border-[8px] border-white -bottom-6 sm:-bottom-8 md:-bottom-10 left-1/2 sm:left-1/2 md:left-1/2 lg:left-72 transform -translate-x-1/2 lg:translate-x-0 w-20 h-16 sm:w-24 sm:h-20 md:w-32 md:h-24 lg:w-48 lg:h-40 bg-blue-100 rounded-2xl overflow-hidden">
              <img 
                src={homesmall} 
                alt="Home small" 
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            </div>
          </div>

          {/* Right content */}
          <div className="w-full flex flex-col justify-center text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-3 sm:mb-4 md:mb-6">
              Find{" "}
              <span className={TEXT.PRIMARY_DEEP_BLUE}>The One</span> That&apos;s{" "}
              <span className={TEXT.PRIMARY_DEEP_BLUE}>Right For You</span>
            </h2>
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-5 sm:mb-6 md:mb-8 lg:mb-10">
              With JobSahi, searching for the perfect job is quick,{" "}
              <span className="block">easy, and tailored to your skills.</span>
            </p>

            <div className="space-y-3 sm:space-y-4 md:space-y-6 flex flex-col items-center lg:items-start">
              <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 w-full lg:w-auto">
                <FaCheckCircle
                  className={`${TEXT.ACCENT_GREEN} text-base sm:text-lg flex-shrink-0 mt-0.5 sm:mt-0`}
                />
                <span className="text-gray-800 font-medium text-sm sm:text-base">
                  Fast &amp; Simple Job Search Experience
                </span>
              </div>
              <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 w-full lg:w-auto">
                <FaCheckCircle
                  className={`${TEXT.ACCENT_GREEN} text-base sm:text-lg flex-shrink-0 mt-0.5 sm:mt-0`}
                />
                <span className="text-gray-800 font-medium text-sm sm:text-base">
                  Top Job Listings Across Industries
                </span>
              </div>
              <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 w-full lg:w-auto">
                <FaCheckCircle
                  className={`${TEXT.ACCENT_GREEN} text-base sm:text-lg flex-shrink-0 mt-0.5 sm:mt-0`}
                />
                <span className="text-gray-800 font-medium text-sm sm:text-base">
                  Secure And Trusted Application Process
                </span>
              </div>
            </div>

            <div className="pt-2 sm:pt-4 md:pt-6 flex justify-center lg:justify-start">
              <button
                onClick={navigateToFindJob}
                className={`border-2 ${BORDER.ACCENT_GREEN} ${TEXT.ACCENT_GREEN} px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base md:text-lg ${HOVER_BG.ACCENT_GREEN} hover:text-white flex items-center space-x-2 sm:space-x-3 transition-all duration-200`}
              >
                <span>Search Job</span>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${BG.ACCENT_GREEN} rounded-full flex items-center justify-center`}
                >
                  <FaArrowRight className="text-white text-xs sm:text-sm" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 sm:py-10 md:py-12 bg-white px-3 sm:px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-bold ${TEXT.PRIMARY_DEEP_BLUE} mb-3 sm:mb-4`}
            >
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${BG.ACCENT_LIME} rounded-full flex items-center justify-center`}
                >
                  <FaUserPlus className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl" />
                </div>
              </div>
              <h3
                className={`text-xl sm:text-2xl font-bold ${TEXT.PRIMARY_DEEP_BLUE} mb-2 sm:mb-3`}
              >
                Create Account
              </h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed px-2">
                It&apos;s super easy to sign up and begin your job journey.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${BG.ACCENT_LIME} rounded-full flex items-center justify-center`}
                >
                  <FaFileAlt className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl" />
                </div>
              </div>
              <h3
                className={`text-xl sm:text-2xl font-bold ${TEXT.PRIMARY_DEEP_BLUE} mb-2 sm:mb-3 md:mb-4`}
              >
                Complete Your Profile
              </h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed px-2">
                Fill in your details to get noticed by recruiters faster.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center sm:col-span-2 md:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${BG.ACCENT_LIME} rounded-full flex items-center justify-center`}
                >
                  <FaHandshake className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl" />
                </div>
              </div>
              <h3
                className={`text-xl sm:text-2xl font-bold ${TEXT.PRIMARY_DEEP_BLUE} mb-2 sm:mb-3 md:mb-4`}
              >
                Apply Job Or Hire
              </h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed px-2">
                Apply to jobs that match your skills or post a job if you&apos;re
                a recruiter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Startups */}
      <Suspense
        fallback={
          <div className="text-white text-center py-10">
            Loading testimonials...
          </div>
        }
      >
        <TrustedByStartups />
      </Suspense>

      {/* Blog Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white px-3 sm:px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-3 sm:mb-4">
              <span>Blog You</span>{" "}
              <span className={TEXT.PRIMARY_DEEP_BLUE}>
                Might Be Interested In
              </span>
            </h2>
            <p className="text-gray-700 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              Together with useful notifications, collaboration, insights, and
              improvement tip lorem etc.
            </p>
          </div>

          <div className="relative">
            {/* Arrows */}
            <button
              onClick={prevSlide}
              className={`absolute left-0 sm:left-2 md:-left-4 lg:-left-6 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 ${BORDER.ACCENT_GREEN} rounded-full flex items-center justify-center ${TEXT.ACCENT_GREEN} ${HOVER_BG.ACCENT_GREEN} hover:text-white transition-all duration-300 shadow-lg hover:scale-110 active:scale-95`}
              aria-label="Previous slide"
            >
              <FaChevronLeft className="text-base sm:text-lg" />
            </button>

            <button
              onClick={nextSlide}
              className={`absolute right-0 sm:right-2 md:-right-4 lg:-right-6 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 ${BORDER.ACCENT_GREEN} rounded-full flex items-center justify-center ${TEXT.ACCENT_GREEN} ${HOVER_BG.ACCENT_GREEN} hover:text-white transition-all duration-300 shadow-lg hover:scale-110 active:scale-95`}
              aria-label="Next slide"
            >
              <FaChevronRight className="text-base sm:text-lg" />
            </button>

            {/* Cards Container */}
            <div className="overflow-hidden mx-8 sm:mx-10 md:mx-12 lg:mx-16">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${
                    currentSlide * (100 / (isMobile ? 1 : 3))
                  }%)`,
                }}
              >
                {blogPosts.map((post, index) => (
                  <div
                    key={index}
                    className="w-full md:w-1/3 flex-shrink-0 px-2 sm:px-3 md:px-4"
                  >
                    <article className="w-full h-full bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                      {/* Image Section */}
                      <div className="w-full aspect-[16/10] min-h-[180px] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[240px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                        <span className="text-gray-400 text-xs sm:text-sm md:text-base font-medium z-10">
                          Blog Image
                        </span>
                      </div>

                      {/* Content Section */}
                      <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                        {/* Location and Date */}
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 flex-wrap gap-1">
                          <span className="truncate flex items-center">
                            <FaMapMarkerAlt className="mr-1 text-[10px]" />
                            {post.location}
                          </span>
                          <span className="mx-1">•</span>
                          <span className="truncate flex items-center">
                            <FaCalendarAlt className="mr-1 text-[10px]" />
                            {post.date}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 leading-tight line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                          {post.title}
                        </h3>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-auto">
                          {post.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] sm:text-xs font-medium rounded-full transition-colors duration-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center items-center mt-6 sm:mt-8 space-x-2">
              {Array.from({ length: getTotalSlides() }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? `${BG.ACCENT_GREEN} scale-125`
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ faqs={faqs} headerContent={faqHeaderContent} />

      {/* Newsletter */}
      <NewsletterSubscription
        headerContent={newsletterHeaderContent}
        onSubscribe={handleSubscribe}
        email={email}
        setEmail={setEmail}
        isSubscribed={isSubscribed}
      />

      <Footer />
    </div>
  );
};

export default Home;
