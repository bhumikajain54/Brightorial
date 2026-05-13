import React, { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer";
import MeetOurTeam from "../../components/Rounded4Cards.jsx";
import FAQ from "../../components/FAQ";
import NewsletterSubscription from "../../components/NewsletterSubscription";
import {
  FaPlay,
  FaCheckCircle,
  FaUserPlus,
  FaFileAlt,
  FaHandshake,
  FaArrowRight,
  FaSearch,
  FaUsers,
  FaBriefcase,
  FaBuilding,
  FaCube
} from "react-icons/fa";
import textunderline from "../../assets/website_text_underline.png";
import aboutImage from "../../assets/about.jpg";
import aboutSmallImage from "../../assets/aboutsmall.jpg";
import { COLOR_CLASSES } from "../../components/colorClasses";

const TrustedByStartups = lazy(() => import("../../components/TrustedByStartups.jsx"));

const About = () => {
  const navigate = useNavigate();
  // Newsletter subscription state
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Team members data
  const teamMembers = [
    {
      name: "Pooja ",
      role: "Product Designer"
    },
    {
      name: "Aarti", 
      role: "Developer"
    },
    {
      name: "Yuvraj",
      role: "UI Designer"
    },
    {
    name: "Himanshu",
      role: "Product Designer"
    }
  ];

  // Team section content
  const teamTitle = (
    <>
      Let's Meet Our <br /> Awesome Team
    </>
  );
  const teamDescription = "A dedicated crew delivering your career goals:";

  // FAQ data
  const faqs = [
    {
      question: "How do I create an account on JOBSAHI?",
      answer: "Creating an account is simple! Just click on the \"Sign Up\" button, fill in your basic information, verify your email, and you're ready to start your job search journey."
    },
    {
      question: "Is JOBSAHI free for candidates?",
      answer: "Yes, JOBSAHI is completely free for ITI and Polytechnic candidates. We believe in providing equal opportunities for all candidates to access quality job opportunities."
    },
    {
      question: "What types of jobs are available on JOBSAHI?",
      answer: "We offer a wide range of job opportunities including engineering positions, technical roles, manufacturing jobs, healthcare positions, and many more across various industries."
    },
    {
      question: "How does the job matching work?",
      answer: "Our AI-powered system analyzes your profile, skills, and preferences to match you with relevant job opportunities. The more complete your profile, the better the matches."
    },
    {
      question: "Can I apply for jobs directly through JOBSAHI?",
      answer: "Yes! You can apply for jobs directly through our platform. Simply browse jobs, click apply, and your application will be sent to the recruiter."
    },
    {
      question: "How do I update my resume on JOBSAHI?",
      answer: "You can easily update your resume by going to your profile settings and uploading a new version. We recommend keeping your resume updated with your latest skills and experience."
    }
  ];

  const faqHeaderContent = {
    title: "We've Got The Answers",
    description: "Find answers to commonly asked questions about JobSahi and our services."
  };

  // Newsletter subscription handler
  const handleSubscribe = (email) => {
    console.log('Subscribed with email:', email);
    setIsSubscribed(true);
    setEmail("");
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  // Newsletter header content
  const newsletterHeaderContent = {
    title: "Get Fresh Job Openings, Apprenticeships, And Career Tips Straight To Your Inbox."
  };

  return (
    <div className={`${COLOR_CLASSES.bg.navy} min-h-screen`}>
      <Navbar />
      
      {/* Get To Know About Us Section */}
      <section className={`py-8 sm:py-10 md:py-12 ${COLOR_CLASSES.bg.surfacePaleBlue} mx-2 sm:mx-4 lg:mx-8 rounded-[30px] sm:rounded-[32px] md:rounded-[50px] my-4 sm:my-6 md:my-8`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center">
            {/* Top Banner */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              <div className={`inline-block border-2 ${COLOR_CLASSES.border.accentGreen} ${COLOR_CLASSES.text.accentGreen} px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide`}>
                #1 PORTAL JOB PLATFORM
              </div>
            </div>

            {/* Main Heading */}
            <div className="flex flex-col items-center justify-center text-center mb-4 sm:mb-5 md:mb-8 lg:mb-12">
              <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 lg:mb-8 px-2 sm:px-4 md:px-8 lg:px-20 ${COLOR_CLASSES.text.deepBlue} leading-tight`}>
                Get To Know About Us
              </h1>
              <img
                src={textunderline}
                alt=""
                className="w-24 sm:w-28 md:w-36 lg:w-48 xl:w-60 h-[8px] sm:h-[10px] md:h-[15px] lg:h-[20px] xl:h-[25px] -mt-3 sm:-mt-4 md:-mt-6 lg:-mt-8 xl:-mt-10"
              />
            </div>

            {/* Description */}
            <p className={`${COLOR_CLASSES.text.neutralSlate} text-sm sm:text-base md:text-lg px-2`}>
              Let's get to know us a little more closely.
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className={`py-8 sm:py-12 md:py-16 ${COLOR_CLASSES.bg.pureWhite} mx-2 sm:mx-4 lg:mx-8 rounded-[30px] sm:rounded-[32px] md:rounded-[50px] my-4 sm:my-6 md:my-8`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <div className={`${COLOR_CLASSES.bg.surfaceSoftBlue} rounded-2xl aspect-[16/9] sm:aspect-[5/3] w-full flex items-center justify-center relative overflow-hidden p-4 sm:p-6 md:p-8`}>
                <div className="text-center">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 ${COLOR_CLASSES.bg.accentGreen} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 cursor-pointer ${COLOR_CLASSES.hoverBg.accentGreenDark} transition-colors`}>
                    <FaPlay className={`${COLOR_CLASSES.text.pureWhite} text-lg sm:text-xl md:text-2xl ml-0.5 sm:ml-1`} />
                  </div>
                  <p className={`${COLOR_CLASSES.text.neutralSlate} text-sm sm:text-base md:text-lg`}>Watch Our Story</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={`py-8 sm:py-12 md:py-16 ${COLOR_CLASSES.bg.pureWhite} mx-2 sm:mx-4 lg:mx-8 rounded-[30px] sm:rounded-[32px] md:rounded-[50px] my-4 sm:my-6 md:my-8`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {/* Stat 1 */}
            <div className="text-center px-2 sm:px-4">
              <div className={`text-4xl sm:text-5xl md:text-6xl font-semibold ${COLOR_CLASSES.text.accentGreen} mb-3 sm:mb-4`}>
                25K+
              </div>
              <h3 className={`text-lg sm:text-xl font-semibold ${COLOR_CLASSES.text.deepBlue} mb-2 sm:mb-3`}>
                Successful Placements
              </h3>
              <p className={`${COLOR_CLASSES.text.neutralSlate} text-sm sm:text-base`}>
                Connecting skilled professionals with their ideal roles.
              </p>
            </div>

            {/* Stat 2 */}
            <div className="text-center px-2 sm:px-4">
              <div className={`text-4xl sm:text-5xl md:text-6xl font-semibold ${COLOR_CLASSES.text.accentGreen} mb-3 sm:mb-4`}>
                100K
              </div>
              <h3 className={`text-lg sm:text-xl font-semibold ${COLOR_CLASSES.text.deepBlue} mb-2 sm:mb-3`}>
                Registered Users
              </h3>
              <p className={`${COLOR_CLASSES.text.neutralSlate} text-sm sm:text-base`}>
                A vibrant community of job seekers and recruiters.
              </p>
            </div>

            {/* Stat 3 */}
            <div className="text-center px-2 sm:px-4">
              <div className={`text-4xl sm:text-5xl md:text-6xl font-semibold ${COLOR_CLASSES.text.accentGreen} mb-3 sm:mb-4`}>
                30+
              </div>
              <h3 className={`text-lg sm:text-xl font-semibold ${COLOR_CLASSES.text.deepBlue} mb-2 sm:mb-3`}>
                Industry Partners
              </h3>
              <p className={`${COLOR_CLASSES.text.neutralSlate} text-sm sm:text-base`}>
                Trusted by leaders across ITI, polytechnic, government & private sectors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Find The One That's Right For You Section */}
      <section className={`py-8 sm:py-12 md:py-16 ${COLOR_CLASSES.bg.pureWhite} mx-2 sm:mx-4 lg:mx-8 rounded-[30px] sm:rounded-[32px] md:rounded-[50px] my-4 sm:my-6 md:my-8`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            {/* Left Side - Visual Elements */}
            <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="w-full max-w-md space-y-4 sm:space-y-5 md:space-y-6">
                {/* Search Bar with Button */}
                <div className="flex gap-2 sm:gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Trusted Job Vacancies...."
                    className={`flex-1 ${COLOR_CLASSES.bg.pureWhite} rounded-xl px-3 sm:px-4 py-2 sm:py-3 ${COLOR_CLASSES.text.neutralSlate} shadow-md border-none outline-none text-xs sm:text-sm md:text-base placeholder:text-[#8C9BA0]`}
                    readOnly
                  />
                  <button className={`w-12 h-12 sm:w-14 sm:h-14 ${COLOR_CLASSES.bg.accentLime} rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow flex-shrink-0`}>
                    <FaSearch className={`${COLOR_CLASSES.text.pureWhite} text-sm sm:text-base md:text-lg`} />
                  </button>
                </div>

                {/* Content Blocks Container */}
                <div className="relative flex justify-center lg:justify-start">
                  <div className="relative">
                    {/* Large Grey Block */}
                    <div className={`w-56 h-56 sm:w-60 sm:h-60 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-blue-100 rounded-3xl relative overflow-hidden border-[6px] sm:border-[8px] md:border-[10px] lg:border-[12px] ${COLOR_CLASSES.border.pureWhite}`}>
                      <img 
                        src={aboutImage} 
                        alt="About us" 
                        className="w-full h-full object-cover rounded-3xl"
                      />
                    </div>
                    
                    {/* Green Badge with Cube Icon */}
                    <div className={`absolute -top-2 -left-2 sm:-top-2.5 sm:-left-2.5 md:-top-3 md:-left-3 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 ${COLOR_CLASSES.bg.accentLime} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg z-10 border-[3px] sm:border-[4px] md:border-[5px] ${COLOR_CLASSES.border.pureWhite}`}>
                      <FaCube className={`${COLOR_CLASSES.text.pureWhite} text-xs sm:text-sm md:text-base`} />
                    </div>

                    {/* Smaller Grey Block */}
                    <div className={`absolute -bottom-4 -right-6 sm:-bottom-5 sm:-right-8 md:-bottom-6 md:-right-10 lg:-right-12 w-28 h-24 sm:w-32 sm:h-28 md:w-40 md:h-32 lg:w-48 lg:h-40 ${COLOR_CLASSES.bg.surfacePaleBlue} rounded-2xl overflow-hidden z-10 border-[5px] sm:border-[6px] md:border-[7px] lg:border-[8px] ${COLOR_CLASSES.border.pureWhite}`}>
                      <img 
                        src={aboutSmallImage} 
                        alt="About us small" 
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6 order-1 lg:order-2">
              <div className="flex flex-col mb-4 sm:mb-5 md:mb-8 lg:mb-12">
                <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${COLOR_CLASSES.text.deepBlue} leading-tight`}>
                  Find The One That's Right For You
                </h2>
                <img
                  src={textunderline}
                  alt=""
                  className="w-28 sm:w-32 md:w-40 lg:w-52 xl:w-64 h-[10px] sm:h-[12px] md:h-[16px] lg:h-[20px] xl:h-[24px] mt-2 sm:mt-2.5 md:mt-3"
                />
              </div>

              <p className={`${COLOR_CLASSES.text.neutralSlate} text-sm sm:text-base md:text-lg leading-relaxed`}>
                Our intelligent matching engine connects the right talent with the right opportunities, 
                ensuring successful placements across various industries.
              </p>

              {/* Feature List */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                  <FaCheckCircle className={`${COLOR_CLASSES.text.accentGreen} text-base sm:text-lg flex-shrink-0 mt-0.5 sm:mt-0`} />
                  <span className={`${COLOR_CLASSES.text.deepBlue} font-medium text-sm sm:text-base`}>
                    For Job Seekers - Discover Fresh, Verified Listings.
                  </span>
                </div>
                <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                  <FaCheckCircle className={`${COLOR_CLASSES.text.accentGreen} text-base sm:text-lg flex-shrink-0 mt-0.5 sm:mt-0`} />
                  <span className={`${COLOR_CLASSES.text.deepBlue} font-medium text-sm sm:text-base`}>
                    For Recruiters - Tap Into A Motivated Talent Pool.
                  </span>
                </div>
                <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                  <FaCheckCircle className={`${COLOR_CLASSES.text.accentGreen} text-base sm:text-lg flex-shrink-0 mt-0.5 sm:mt-0`} />
                  <span className={`${COLOR_CLASSES.text.deepBlue} font-medium text-sm sm:text-base`}>
                    For Partners - Access A Platform Built For Scalability.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button
                  className={`w-full sm:w-auto border-2 ${COLOR_CLASSES.border.accentGreen} ${COLOR_CLASSES.text.accentGreen} px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-semibold text-sm sm:text-base md:text-lg ${COLOR_CLASSES.hoverBg.accentGreen} ${COLOR_CLASSES.hoverText.accentGreenDark} flex items-center justify-center space-x-2 sm:space-x-3 transition-colors`}
                  onClick={() => navigate("/find-job")}
                >
                  <span>Search Job</span>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 ${COLOR_CLASSES.bg.accentGreen} rounded-full flex items-center justify-center`}>
                    <FaArrowRight className={`${COLOR_CLASSES.text.pureWhite} text-xs sm:text-sm`} />
                  </div>
                </button>
                <button className={`w-full sm:w-auto ${COLOR_CLASSES.text.accentGreen} font-semibold text-sm sm:text-base md:text-lg ${COLOR_CLASSES.hoverText.accentGreenDark} transition-colors flex items-center justify-center sm:justify-start space-x-2`}>
                  <span>Post Job</span>
                  <div className={`w-6 h-6 border-2 ${COLOR_CLASSES.border.accentGreen} rounded-full flex items-center justify-center`}>
                    <span className={`${COLOR_CLASSES.text.accentGreen} text-xs sm:text-sm`}>×</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It's Works Section */}
      <section className="py-8 sm:py-12 md:py-16 mx-2 sm:mx-4 lg:mx-8 my-4 sm:my-6 md:my-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${COLOR_CLASSES.text.pureWhite} mb-3 sm:mb-4`}>
              How It Works?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {/* Step 1: Create Account */}
            <div className="p-4 sm:p-6 md:p-8 text-center h-full">
              <div className="w-16 h-16 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${COLOR_CLASSES.bg.accentLime} rounded-full flex items-center justify-center relative`}>
                  <FaUserPlus className={`${COLOR_CLASSES.text.pureWhite} text-lg sm:text-xl md:text-2xl`} />
                  <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 ${COLOR_CLASSES.bg.pureWhite} rounded-full flex items-center justify-center`}>
                    <FaCheckCircle className={`${COLOR_CLASSES.text.accentLime} text-xs sm:text-sm`} />
                  </div>
                </div>
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold ${COLOR_CLASSES.text.pureWhite} mb-3 sm:mb-4`}>
                Create Account
              </h3>
              <p className="text-white text-sm sm:text-base md:text-lg font-light px-2">
                Sign up quickly using your mobile number or email.
              </p>
            </div>

            {/* Step 2: Complete Your Profile */}
            <div className="p-4 sm:p-6 md:p-8 text-center h-full">
              <div className="w-16 h-16 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${COLOR_CLASSES.bg.accentLime} rounded-full flex items-center justify-center`}>
                  <FaFileAlt className={`${COLOR_CLASSES.text.pureWhite} text-lg sm:text-xl md:text-2xl`} />
                </div>
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold ${COLOR_CLASSES.text.pureWhite} mb-3 sm:mb-4`}>
                Complete Your Profile
              </h3>
              <p className="text-white text-sm sm:text-base md:text-lg font-light px-2">
                Upload your resume, education, and skills.
              </p>
            </div>

            {/* Step 3: Apply Job Or Hire */}
            <div className="p-4 sm:p-6 md:p-8 text-center h-full">
              <div className="w-16 h-16 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${COLOR_CLASSES.bg.accentLime} rounded-full flex items-center justify-center`}>
                  <FaHandshake className={`${COLOR_CLASSES.text.pureWhite} text-lg sm:text-xl md:text-2xl`} />
                </div>
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold ${COLOR_CLASSES.text.pureWhite} mb-3 sm:mb-4`}>
                Apply Job Or Hire
              </h3>
              <p className="text-white text-sm sm:text-base md:text-lg font-light px-2">
                Browse listings and apply directly—no middleman.
              </p>
            </div>
          </div>
        </div>
      </section>

       {/* Meet Our Awesome Team */}
       <MeetOurTeam 
         teamMembers={teamMembers} 
         title={teamTitle}
         description={teamDescription}
       />

       
        {/* TrustedByStartups */}
        <Suspense fallback={<div className={`${COLOR_CLASSES.text.pureWhite} text-center py-10`}>Loading testimonials...</div>}>
          <TrustedByStartups />
        </Suspense>

          {/* FAQ Section */}
          <FAQ 
            faqs={faqs} 
            headerContent={faqHeaderContent} 
          />

        {/* Newsletter Subscription */}
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

export default About;
