import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import textunderline from '../assets/website_text_underline.png';

const FAQ = ({ faqs = [], headerContent }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [heights, setHeights] = useState({});
  const contentRefs = useRef({});

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    // Measure content heights when component mounts or FAQs change
    const newHeights = {};
    faqs.forEach((_, index) => {
      if (contentRefs.current[index]) {
        newHeights[index] = contentRefs.current[index].scrollHeight;
      }
    });
    setHeights(newHeights);
  }, [faqs]);

  return (
    <section className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header Section */}
        {headerContent && (
          <div className="text-center mb-12">
            <div className="flex flex-col items-center justify-center text-center mb-5 md:mb-12 "> <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-[#0B537D]">
              {headerContent.title}
            </h1>
             <img src={textunderline} alt="" className="w-[40%] h-[15px] md:h-[20px] -mt-4" /></div>       
            <p className="text-gray-600 max-w-2xl mx-auto">
              {headerContent.description}
            </p>
          </div>
        )}

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`${
                  isOpen 
                    ? 'bg-gray-100 rounded-lg shadow-sm' 
                    : 'bg-transparent'
                } transition-all duration-300 ease-in-out overflow-hidden`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className={`w-full px-6 py-4 text-left flex items-center justify-between ${
                    isOpen 
                      ? 'hover:bg-gray-200' 
                      : 'hover:bg-gray-50'
                  } transition-colors duration-200 rounded-lg`}
                >
                  <h3 className="text-lg font-semibold text-gray-800 pr-4">
                    {faq.question}
                  </h3>
                  <div className={`flex-shrink-0 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    {isOpen ? (
                      <FaMinus className="text-gray-600 text-lg transition-opacity duration-300" />
                    ) : (
                      <FaPlus className="text-gray-600 text-lg transition-opacity duration-300" />
                    )}
                  </div>
                </button>
                <div
                  ref={el => contentRefs.current[index] = el}
                  className="overflow-hidden"
                  style={{
                    maxHeight: isOpen ? `${heights[index] || 500}px` : '0px',
                    opacity: isOpen ? 1 : 0,
                    transition: isOpen 
                      ? 'max-height 0.5s ease-in-out, opacity 0.3s ease-in-out 0.2s'
                      : 'opacity 0.2s ease-in-out, max-height 0.5s ease-in-out 0.2s',
                  }}
                >
                  <div className="px-6 pb-4 pt-2">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
