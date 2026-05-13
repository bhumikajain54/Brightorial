import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import textunderline from "../assets/website_text_underline.png";

const MeetOurTeam = ({ teamMembers, title, description }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 4; // Show 4 team members at a time

  const nextSlide = () => {
    setCurrentSlide(
      (prev) => (prev + 1) % Math.ceil(teamMembers.length / itemsPerSlide)
    );
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.ceil(teamMembers.length / itemsPerSlide)) %
        Math.ceil(teamMembers.length / itemsPerSlide)
    );
  };

  return (
    <section className="py-20 mt-10 bg-white ">
      <div className="max-w-[90%] mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16">
          {/* Left Side - Title */}
          <div className="flex flex-col items-center justify-center text-center mb-5 md:mb-12 ">
            <h2 className="max-w-3xl text-start text-4xl md:text-5xl lg:text-6xl font-bold text-[#0B537D] leading-tight">
            {title} 
            </h2>
            <img
              src={textunderline}
              alt=""
              className=" w-[45%] h-[18px] md:h-[24px]"
            />
          </div>

          {/* Right Side - Description and Navigation */}
          <div className="flex flex-col lg:items-end space-y-4">
            <p className="text-gray-600 text-lg md:text-xl max-w-md lg:text-right">
              {description}
            </p>

            {/* Navigation Arrows */}
           {/* <div className="flex space-x-3">
              <button
                onClick={prevSlide}
                className="w-12 h-12 border-2 border-[#5C9A24] rounded-full flex items-center justify-center text-[#5C9A24] hover:bg-[#5C9A24] hover:text-white transition-all duration-300"
              >
                <FaChevronLeft className="text-lg" />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 border-2 border-[#5C9A24] rounded-full flex items-center justify-center text-[#5C9A24] hover:bg-[#5C9A24] hover:text-white transition-all duration-300"
              >
                <FaChevronRight className="text-lg" />
              </button>
            </div> */}
          </div>
        </div>

        {/* Team Members Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({
                length: Math.ceil(teamMembers.length / itemsPerSlide),
              }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {teamMembers
                      .slice(
                        slideIndex * itemsPerSlide,
                        (slideIndex + 1) * itemsPerSlide
                      )
                      .map((member, index) => (
                        <div key={index} className="text-center">
                          {/* Profile Image */}
                          <div className="w-36 h-52 md:w-40 md:h-56 mx-auto mb-6 rounded-full overflow-hidden shadow-md">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-100" />
                            )}
                          </div>

                          {/* Member Name */}
                          <h3 className="text-[#5C9A24] font-bold text-xl md:text-2xl mb-3">
                            {member.name}
                          </h3>

                          {/* Member Role */}
                          <p className="text-gray-700 text-base md:text-lg">{member.role}</p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetOurTeam;
