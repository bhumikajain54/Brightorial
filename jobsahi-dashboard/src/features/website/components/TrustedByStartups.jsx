import React, { useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaQuoteLeft } from 'react-icons/fa';
import { WEBSITE_COLOR_CLASSES } from './colorClasses';

const { TEXT } = WEBSITE_COLOR_CLASSES;

export const TRUSTED_BY_STARTUPS_DEFAULT_TESTIMONIALS = Object.freeze([
  {
    text: 'JobSahi has simplified our campus hiring process. We connected with skilled ITI candidates in minutes!',
    author: 'Rahul Verma',
    position: 'HR Manager, Sigma Tools Pvt. Ltd.',
  },
  {
    text: "Posting jobs and tracking applications on JobSahi is seamless. It's the go-to platform for technical hiring.",
    author: 'Sunita Singh',
    position: 'Training & Placement Officer',
  },
  {
    text: "Posting jobs and tracking applications on JobSahi is seamless. It's the go-to platform for technical hiring.",
    author: 'Rajesh Kumar',
    position: 'Principal, Delhi ITI',
  },
  {
    text: "Posting jobs and tracking applications on JobSahi is seamless. It's the go-to platform for technical hiring.",
    author: 'Meera Sharma',
    position: 'Head of Placements, Mumbai Polytechnic',
  },
]);

const STATUS_INDICATOR = (
  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
    <span className="w-2 h-2 rounded-full bg-[#A1E366]" />
    #1 Portal Job Platform
  </div>
);

export const TRUSTED_BY_STARTUPS_DEFAULT_HEADER = Object.freeze({
  status: STATUS_INDICATOR,
  title: (
    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
      <span className={TEXT.ACCENT_SKY}>Trusted</span> By
      <br />
      Leading Startups
    </h2>
  ),
  description: (
    <p className="text-white text-lg leading-relaxed">
      Join 300+ companies and skill partners hiring through JobSahi. From MSMEs to skill partners, trusted by industry
      leaders to find the right skilled talent fast.
    </p>
  ),
});

const clampItemsPerSlide = (value, override) => {
  if (typeof override !== 'number' || Number.isNaN(override)) {
    return value;
  }

  const safeOverride = Math.max(1, Math.floor(override));
  return Math.min(value, safeOverride);
};

const determineItemsPerSlide = (override) => {
  if (typeof window === 'undefined') {
    return clampItemsPerSlide(1, override);
  }

  const base = window.innerWidth >= 1024 ? 2 : 1;
  return clampItemsPerSlide(base, override);
};

const TrustedByStartups = ({
  testimonials: incomingTestimonials,
  headerContent: incomingHeaderContent,
  maxItemsPerSlide,
  forceNavigation = false,
} = {}) => {
  const [itemsPerSlide, setItemsPerSlide] = useState(() => determineItemsPerSlide(maxItemsPerSlide));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);

  const testimonials = useMemo(() => {
    if (Array.isArray(incomingTestimonials) && incomingTestimonials.length > 0) {
      return incomingTestimonials;
    }

    return TRUSTED_BY_STARTUPS_DEFAULT_TESTIMONIALS;
  }, [incomingTestimonials]);

  const headerContent = useMemo(() => {
    if (incomingHeaderContent == null) {
      return TRUSTED_BY_STARTUPS_DEFAULT_HEADER;
    }

    return {
      ...TRUSTED_BY_STARTUPS_DEFAULT_HEADER,
      ...incomingHeaderContent,
    };
  }, [incomingHeaderContent]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(determineItemsPerSlide(maxItemsPerSlide));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [maxItemsPerSlide]);

  const slides = useMemo(() => {
    if (!testimonials.length) {
      return [];
    }

    const grouped = [];
    for (let index = 0; index < testimonials.length; index += itemsPerSlide) {
      grouped.push(testimonials.slice(index, index + itemsPerSlide));
    }

    return grouped;
  }, [itemsPerSlide, testimonials]);

  const baseSlides = useMemo(() => {
    if (slides.length) {
      return slides;
    }

    if (testimonials.length) {
      return [testimonials];
    }

    return [];
  }, [slides, testimonials]);

  const extendedSlides = useMemo(() => {
    if (baseSlides.length <= 1) {
      return baseSlides;
    }

    const first = baseSlides[0];
    const last = baseSlides[baseSlides.length - 1];
    return [last, ...baseSlides, first];
  }, [baseSlides]);

  const logicalSlideCount = baseSlides.length || 1;
  const isLoopingEnabled = baseSlides.length > 1 && extendedSlides.length > baseSlides.length;

  useEffect(() => {
    if (!baseSlides.length) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex(isLoopingEnabled ? 1 : 0);
    setIsTransitionEnabled(true);
  }, [baseSlides.length, isLoopingEnabled]);

  useEffect(() => {
    if (!isLoopingEnabled) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setCurrentIndex((previous) => previous + 1);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isLoopingEnabled]);

  const goToSlide = (index) => {
    if (!logicalSlideCount) {
      return;
    }

    if (!isLoopingEnabled) {
      setCurrentIndex(0);
      return;
    }

    const safeIndex = (index + logicalSlideCount) % logicalSlideCount;
    setCurrentIndex(safeIndex + 1);
  };

  const handlePrev = () => {
    if (!isLoopingEnabled) {
      return;
    }

    setCurrentIndex((previous) => previous - 1);
  };

  const handleNext = () => {
    if (!isLoopingEnabled) {
      return;
    }

    setCurrentIndex((previous) => previous + 1);
  };

  const handleTransitionEnd = () => {
    if (!isLoopingEnabled) {
      return;
    }

    if (currentIndex === extendedSlides.length - 1) {
      setIsTransitionEnabled(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      setIsTransitionEnabled(false);
      setCurrentIndex(extendedSlides.length - 2);
    }
  };

  useEffect(() => {
    if (isTransitionEnabled) {
      return undefined;
    }

    let cancelled = false;

    const enableTransition = () => {
      if (!cancelled) {
        setIsTransitionEnabled(true);
      }
    };

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      const frameId = window.requestAnimationFrame(enableTransition);

      return () => {
        cancelled = true;
        if (typeof window.cancelAnimationFrame === 'function') {
          window.cancelAnimationFrame(frameId);
        }
      };
    }

    const timeoutId = setTimeout(enableTransition, 16);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isTransitionEnabled]);

  const activeSlideIndex = useMemo(() => {
    if (!logicalSlideCount) {
      return 0;
    }

    if (!isLoopingEnabled) {
      return ((currentIndex % logicalSlideCount) + logicalSlideCount) % logicalSlideCount;
    }

    const computed = (currentIndex - 1 + logicalSlideCount) % logicalSlideCount;
    return computed < 0 ? computed + logicalSlideCount : computed;
  }, [currentIndex, isLoopingEnabled, logicalSlideCount]);

  let navigationContent;
  if (typeof headerContent?.navigation === 'function') {
    navigationContent = headerContent.navigation({
      onPrev: handlePrev,
      onNext: handleNext,
      currentSlide: activeSlideIndex,
      totalSlides: logicalSlideCount,
    });
  } else if (headerContent?.navigation && React.isValidElement(headerContent.navigation)) {
    navigationContent = headerContent.navigation;
  } else {
    navigationContent = (
      <>
        <button
          aria-label="Previous testimonial"
          className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#00395B] transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePrev}
          type="button"
          disabled={!isLoopingEnabled}
        >
          <FaChevronLeft className="text-base sm:text-lg" />
        </button>
        <button
          aria-label="Next testimonial"
          className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#00395B] transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleNext}
          type="button"
          disabled={!isLoopingEnabled}
        >
          <FaChevronRight className="text-base sm:text-lg" />
        </button>
      </>
    );
  }

  const shouldShowNavigation = logicalSlideCount > 1 || forceNavigation;

  const trackSlides = isLoopingEnabled ? extendedSlides : baseSlides;
  const trackTransformIndex = trackSlides.length ? (isLoopingEnabled ? currentIndex : activeSlideIndex) : 0;

  return (
    <section className="bg-white py-8 sm:py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-[#00395B] rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-10 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-start">
          {/* Left Section - Text Content */}
          <div className="space-y-8">
            {/* Main Heading */}
            <div className="space-y-6">
              {headerContent?.status && (
                <div>
                  {headerContent.status}
                </div>
              )}
              {headerContent?.title && (
                <div>
                  {headerContent.title}
                </div>
              )}
              {headerContent?.description && (
                <div>
                  {headerContent.description}
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {shouldShowNavigation && (
              <div className="flex space-x-3 sm:space-x-4">
                {navigationContent}
              </div>
            )}
          </div>

          {/* Right Section - Testimonial Cards */}
          <div className="overflow-hidden w-full">
            <div
              className="flex"
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translateX(-${trackTransformIndex * 100}%)`,
                transition: isTransitionEnabled ? 'transform 500ms ease-in-out' : 'none',
                willChange: 'transform',
              }}
            >
              {trackSlides.map((slide, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0 px-2">
                  <div className={`grid gap-4 items-stretch ${itemsPerSlide > 1 ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
                    {slide.map((testimonial, index) => (
                      <div 
                        key={index} 
                        className="bg-white rounded-xl p-4 sm:p-5 shadow-lg h-full flex flex-col min-h-[240px] sm:min-h-[260px]"
                      >
                        {/* Quote Icon */}
                        <div className="mb-3">
                          <FaQuoteLeft className="text-[#5C9A24] text-2xl sm:text-3xl" />
                        </div>

                        {/* Testimonial Text */}
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 flex-grow">
                          {testimonial.text}
                        </p>

                        {/* Divider Line */}
                        <div className="border-t border-gray-200 mb-3" />

                        {/* Author Details */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          {/* Avatar Placeholder */}
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#5C9A24] to-[#2E7D32] rounded-full flex-shrink-0 flex items-center justify-center">
                            <span className="text-white font-semibold text-xs sm:text-sm">
                              {testimonial.author.charAt(0)}
                            </span>
                          </div>

                          {/* Author Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[#5C9A24] font-semibold text-xs sm:text-sm truncate">
                              {testimonial.author}
                            </h4>
                            <p className="text-gray-500 text-[10px] sm:text-xs line-clamp-2">
                              {testimonial.position}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {shouldShowNavigation && (
            <div className="lg:col-span-2 flex justify-center mt-6 sm:mt-8 space-x-2">
              {Array.from({ length: logicalSlideCount }).map((_, index) => (
                <button
                  key={`testimonial-dot-${index}`}
                  aria-label={`Go to testimonial slide ${index + 1}`}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === activeSlideIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  onClick={() => goToSlide(index)}
                  type="button"
                />
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedByStartups;
