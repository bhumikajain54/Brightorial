import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import whiteunderline from "../assets/white_curls.png"
const NewsletterSubscription = ({ headerContent, onSubscribe, email, setEmail, isSubscribed }) => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      if (onSubscribe) {
        onSubscribe(email);
      }
    }
  };

  return (
    <section className="py-16 bg-[#00395B]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Side - Text Content */}
          <div className="flex-1 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {headerContent?.title}
            </h2>
            {/* Decorative wavy line */}
            <img src={whiteunderline} alt="" className="" />
          </div>

          {/* Right Side - Subscription Form */}
          <div className="flex-1 max-w-lg ">
            <div className="sm:bg-white rounded-full p-2 shadow-lg  ">
              <form onSubmit={handleSubscribe} className="flex items-center flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email Here..."
                  className="flex-1 px-6 py-4 text-gray-800 placeholder-gray-400 focus:outline-none rounded-full"
                  required
                />
                <button
                  type="submit"
                  className="bg-white border-2 border-[#5C9A24] text-[#5C9A24] px-6 py-4 rounded-full font-semibold hover:bg-[#5C9A24] hover:text-white transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Subscribe</span>
                  <FaArrowRight className="text-sm" />
                </button>
              </form>
            </div>
            
            {/* Success Message */}
            {isSubscribed && (
              <div className="mt-4 text-center">
                <p className="text-green-300 text-sm">
                  Thank you for subscribing! Check your inbox for confirmation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSubscription;
