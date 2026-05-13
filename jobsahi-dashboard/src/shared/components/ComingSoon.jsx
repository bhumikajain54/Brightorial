import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ComingSoonPopup = ({ onClose, fallbackPath }) => {
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();

  // ✅ Prevent background scroll while modal is visible
  useEffect(() => {
    if (showModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [showModal]);

  const handleClose = () => {
    setShowModal(false);
    // ✅ Go back to previous page after a short delay (smooth close)
    setTimeout(() => {
      if (onClose) {
        onClose();
        return;
      }

      if (window.history.length > 1) {
        navigate(-1);
      } else if (fallbackPath) {
        navigate(fallbackPath, { replace: true });
      }
    }, 200);
  };

  return (
    <>
      {/* ✅ Modal Overlay */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[9999] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          {/* ✅ Modal Box */}
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] sm:w-[500px] md:w-[650px] p-6 sm:p-8 text-center animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
              <h5 className="text-2xl font-semibold text-gray-800">
                🚀 Coming Soon
              </h5>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                onClick={handleClose}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="text-gray-700 space-y-4">
              <p className="text-lg font-medium">
                This feature is currently under development.
              </p>
              <p className="text-gray-600">
                Stay tuned for updates and exciting features coming your way!
              </p>
            </div>

            {/* ✅ Optional Footer Button */}
            <div className="mt-8">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComingSoonPopup;
