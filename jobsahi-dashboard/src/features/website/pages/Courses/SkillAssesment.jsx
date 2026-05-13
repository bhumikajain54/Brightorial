import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import FAQ from '../../components/FAQ'
import textunderline from '../../assets/website_text_underline.png'
import { COLOR_CLASSES } from '../../components/colorClasses'

const SkillAssesment = () => {
  const location = useLocation()
  const course = location.state?.course
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(900) // 15 minutes in seconds (15 * 60)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [testResults, setTestResults] = useState({ correct: 0, wrong: 0, unanswered: 0 })
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [])

  // Assessment info cards data
  const assessmentInfo = [
    {
      value: '14',
      highlight: 'MCQs',
      suffix: 'in 15 Mins',
      description: 'Quick quiz in Hindi with 14 questions to complete in 15 minutes.',
      highlightColor: COLOR_CLASSES.text.deepBlue
    },
    {
      value: '42%',
      highlight: 'Marks',
      suffix: '',
      description: 'Quick quiz in Hindi with 14 questions to complete in 15 minutes.',
      highlightColor: COLOR_CLASSES.text.deepBlue
    },
    {
      value: '1st',
      highlight: 'Attempt',
      suffix: '',
      description: 'Quick quiz in Hindi with 14 questions to complete in 15 minutes.',
      highlightColor: COLOR_CLASSES.text.deepBlue
    },
    {
      value: 'Results',
      highlight: 'Private',
      suffix: '',
      description: 'Quick quiz in Hindi with 14 questions to complete in 15 minutes.',
      highlightColor: COLOR_CLASSES.text.deepBlue
    }
  ]

  // Instructions data
  const instructions = [
    {
      text: 'Make Sure Your Internet Connection Is Stable.',
      bgColor: COLOR_CLASSES.bg.surfaceSoftGreen,
      dotColor: COLOR_CLASSES.bg.accentGreenDark
    },
    {
      text: 'Once You Click "Attempt Test," You Cannot Exit Or Pause.',
      bgColor: COLOR_CLASSES.bg.surfacePaleBlue,
      dotColor: COLOR_CLASSES.bg.mediumBlue
    },
    {
      text: 'Read All Questions Carefully Before Answering.',
      bgColor: COLOR_CLASSES.bg.surfaceSoftGreen,
      dotColor: COLOR_CLASSES.bg.accentGreenDark
    },
    {
      text: 'Final Results Will Be Available After Submission.',
      bgColor: COLOR_CLASSES.bg.surfacePaleBlue,
      dotColor: COLOR_CLASSES.bg.mediumBlue
    }
  ]

  // FAQ data for skill assessment
  const faqData = [
    {
      question: 'How often is the news section updated?',
      answer: 'We refresh daily—new vacancies, company updates, and guidance posts go live each morning.'
    },
    {
      question: 'Can we apply directly from the article?',
      answer: 'Yes, you can apply directly from the article by clicking the "Apply Now" button.'
    },
    {
      question: 'How long do alerts take to arrive?',
      answer: 'Within 30 minutes.'
    }
  ]

  const faqHeaderContent = {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about the skill assessment process.'
  }

  // Quiz questions data (14 questions with correct answers)
  const quizQuestions = [
    {
      question: 'Which Skill Tests Are Required After Completing ITI Studies?',
      options: [
        { id: 'A', text: 'Tests practical skills needed for the job.' },
        { id: 'B', text: 'Checks technical knowledge and concepts.' },
        { id: 'C', text: 'Includes both Skill and Technical Tests.' },
        { id: 'D', text: 'Same as option C.' }
      ],
      correctAnswer: 'C'
    },
    {
      question: 'What is the primary purpose of an ITI certificate?',
      options: [
        { id: 'A', text: 'To certify completion of theoretical studies.' },
        { id: 'B', text: 'To demonstrate practical vocational skills.' },
        { id: 'C', text: 'To replace a college degree.' },
        { id: 'D', text: 'To qualify for government jobs only.' }
      ],
      correctAnswer: 'B'
    },
    {
      question: 'Which tool is commonly used by electricians?',
      options: [
        { id: 'A', text: 'Hammer and nails.' },
        { id: 'B', text: 'Multimeter and wire strippers.' },
        { id: 'C', text: 'Wrench and pliers only.' },
        { id: 'D', text: 'Soldering iron only.' }
      ],
      correctAnswer: 'B'
    },
    {
      question: 'What safety equipment is essential for welding?',
      options: [
        { id: 'A', text: 'Safety goggles only.' },
        { id: 'B', text: 'Welding helmet, gloves, and protective clothing.' },
        { id: 'C', text: 'Ear plugs and mask.' },
        { id: 'D', text: 'Steel-toed boots only.' }
      ],
      correctAnswer: 'B'
    },
    {
      question: 'What does NCVT stand for in ITI context?',
      options: [
        { id: 'A', text: 'National Council for Vocational Training.' },
        { id: 'B', text: 'National Center for Vocational Testing.' },
        { id: 'C', text: 'National Certificate of Vocational Training.' },
        { id: 'D', text: 'National Committee for Vocational Technology.' }
      ],
      correctAnswer: 'A'
    },
    {
      question: 'Which trade requires knowledge of circuit diagrams?',
      options: [
        { id: 'A', text: 'Carpenter.' },
        { id: 'B', text: 'Electrician.' },
        { id: 'C', text: 'Plumber.' },
        { id: 'D', text: 'Welder.' }
      ],
      correctAnswer: 'B'
    },
    {
      question: 'What is the typical duration of an ITI course?',
      options: [
        { id: 'A', text: '6 months to 2 years.' },
        { id: 'B', text: '3 to 4 years.' },
        { id: 'C', text: '1 month to 6 months.' },
        { id: 'D', text: '5 years.' }
      ],
      correctAnswer: 'A'
    },
    {
      question: 'Which measurement unit is used for electrical resistance?',
      options: [
        { id: 'A', text: 'Volts.' },
        { id: 'B', text: 'Amperes.' },
        { id: 'C', text: 'Ohms.' },
        { id: 'D', text: 'Watts.' }
      ],
      correctAnswer: 'C'
    },
    {
      question: 'What is the main function of a lathe machine?',
      options: [
        { id: 'A', text: 'To cut and shape metal by rotating the workpiece.' },
        { id: 'B', text: 'To weld metal pieces together.' },
        { id: 'C', text: 'To drill holes only.' },
        { id: 'D', text: 'To polish surfaces.' }
      ],
      correctAnswer: 'A'
    },
    {
      question: 'Which type of welding uses an electric arc?',
      options: [
        { id: 'A', text: 'Gas welding.' },
        { id: 'B', text: 'Arc welding.' },
        { id: 'C', text: 'Friction welding.' },
        { id: 'D', text: 'Laser welding.' }
      ],
      correctAnswer: 'B'
    },
    {
      question: 'What does PPE stand for in workplace safety?',
      options: [
        { id: 'A', text: 'Personal Protection Equipment.' },
        { id: 'B', text: 'Professional Protective Equipment.' },
        { id: 'C', text: 'Personal Protective Equipment.' },
        { id: 'D', text: 'Primary Protection Equipment.' }
      ],
      correctAnswer: 'C'
    },
    {
      question: 'Which instrument measures voltage?',
      options: [
        { id: 'A', text: 'Ammeter.' },
        { id: 'B', text: 'Voltmeter.' },
        { id: 'C', text: 'Ohmmeter.' },
        { id: 'D', text: 'Thermometer.' }
      ],
      correctAnswer: 'B'
    },
    {
      question: 'What material is commonly used in electrical wiring?',
      options: [
        { id: 'A', text: 'Aluminum and copper.' },
        { id: 'B', text: 'Steel and iron.' },
        { id: 'C', text: 'Plastic and rubber only.' },
        { id: 'D', text: 'Wood and fiber.' }
      ],
      correctAnswer: 'A'
    },
    {
      question: 'What is the first step in troubleshooting an electrical fault?',
      options: [
        { id: 'A', text: 'Replace all components.' },
        { id: 'B', text: 'Identify the problem through testing and inspection.' },
        { id: 'C', text: 'Ignore the issue.' },
        { id: 'D', text: 'Call a supervisor immediately.' }
      ],
      correctAnswer: 'B'
    }
  ]

  // Get current question
  const currentQuestion = quizQuestions[currentQuestionIndex]
  const selectedOption = selectedAnswers[currentQuestionIndex] || null

  // Timer countdown effect
  useEffect(() => {
    if (!hasStarted) {
      return
    }

    if (timeRemaining <= 0 && !showResultsModal) {
      // Time's up - auto submit
      const autoSubmit = () => {
        let correct = 0
        let wrong = 0
        let unanswered = 0

        quizQuestions.forEach((question, index) => {
          const userAnswer = selectedAnswers[index]
          if (!userAnswer) {
            unanswered++
          } else if (userAnswer === question.correctAnswer) {
            correct++
          } else {
            wrong++
          }
        })

        setTestResults({ correct, wrong, unanswered })
        setShowResultsModal(true)
      }
      
      autoSubmit()
      return
    }

    if (showResultsModal) {
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [hasStarted, timeRemaining, showResultsModal, selectedAnswers, quizQuestions])
  const handleStartAssessment = () => {
    setHasStarted(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setTimeRemaining(900)
    setShowResultsModal(false)
    setTestResults({ correct: 0, wrong: 0, unanswered: 0 })
  }


  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Navigation handlers
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (!selectedAnswers[currentQuestionIndex]) {
      return
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleOptionSelect = (optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionId
    })
  }

  const handleSubmit = () => {
    if (!selectedAnswers[currentQuestionIndex]) {
      return
    }

    // Calculate results
    let correct = 0
    let wrong = 0
    let unanswered = 0

    quizQuestions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index]
      if (!userAnswer) {
        unanswered++
      } else if (userAnswer === question.correctAnswer) {
        correct++
      } else {
        wrong++
      }
    })

    setTestResults({ correct, wrong, unanswered })
    setShowResultsModal(true)
  }

  const closeResultsModal = () => {
    setShowResultsModal(false)
    setHasStarted(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setTimeRemaining(900)
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Your progress will be lost.')) {
      window.history.back()
    }
  }

  return (
    <div className={`${COLOR_CLASSES.bg.navy} min-h-screen`}>
      <Navbar />

      {/* Skills Assessment Header Section */}
      <section className={`py-10 ${COLOR_CLASSES.bg.surfacePaleBlue} mx-4 sm:mx-6 md:mx-8 rounded-[30px] md:rounded-[50px] my-8 border-t-4 border-l-4 border-r-4 ${COLOR_CLASSES.border.deepBlue}`}>
        <div className="max-w-[95%] md:max-w-[90%] mx-auto px-4 sm:px-6">
          <div className="text-center space-y-6">
            {/* Top Banner */}
            <div className="mb-5">
              <div className={`inline-block border-2 ${COLOR_CLASSES.border.accentGreen} ${COLOR_CLASSES.text.accentGreen} px-6 py-2 rounded-full text-sm font-semibold`}>
                #1 PORTAL JOB PLATFORM
              </div>
            </div>

            {/* Main Heading */}
            <div className="flex flex-col items-center justify-center text-center mb-5 md:mb-8">
              <h1 className={`text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl lg:px-20 font-bold mb-6 sm:mb-8 ${COLOR_CLASSES.text.deepBlue} leading-tight`}>
                Skills <span className="relative">Assessment
                  <img src={textunderline} alt="" className="absolute -bottom-2 left-0 w-full h-6" />
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm sm:text-base md:text-lg max-w-3xl md:max-w-4xl mx-auto px-2 sm:px-4 leading-relaxed">
              This quick 15-minute test will assess your knowledge with 14 multiple-choice questions. Pass with 42% or higher to receive a private result and unlock your next opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* Assessment Info Cards Section */}
      <section className="py-10 bg-white ">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {assessmentInfo.map((info, index) => (
              <div 
                key={index}
                className={`${COLOR_CLASSES.bg.surfacePaleBlue} rounded-2xl md:rounded-3xl p-6 md:p-10 text-center shadow-sm hover:shadow-lg transition-shadow`}
              >
                {/* Value and Highlight */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2">
                  {info.value} <span className={info.highlightColor}>{info.highlight}</span>
                  {info.suffix && <span className="text-gray-800 text-2xl md:text-3xl"> {info.suffix}</span>}
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-4 leading-relaxed">
                  {info.description}
                </p>
              </div>
            ))}
          </div>

          {/* Start Assessment Button */}
          <div className="text-center mt-10 sm:mt-12">
            <button
              onClick={handleStartAssessment}
              disabled={hasStarted}
              className={`${COLOR_CLASSES.bg.accentGreen} text-white w-full sm:w-auto px-10 sm:px-12 py-4 rounded-full font-semibold text-base sm:text-lg ${COLOR_CLASSES.hoverBg.accentGreenDark} transition-colors shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {hasStarted ? 'Assessment In Progress' : 'Start Assessment'}
            </button>
          </div>
        </div>
      </section>

      {/* Instructions Before You Start Section */}
      <section className="py-10 bg-white ">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Section Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8 sm:mb-10">
            Instructions Before You Start
          </h2>

          {/* Instructions List */}
          <div className="space-y-3 sm:space-y-4">
            {instructions.map((instruction, index) => (
              <div 
                key={index}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-5 rounded-2xl sm:rounded-full ${instruction.bgColor} shadow-sm`}
              >
                {/* Dot Indicator */}
                <div className={`w-6 h-6 sm:w-8 sm:h-8 ${instruction.dotColor} rounded-full flex-shrink-0 border-4 border-gray-300`}></div>
                
                {/* Instruction Text */}
                <p className="text-gray-800 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
                  {instruction.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Test Section */}
      {hasStarted && (
        <section className={`py-10 ${COLOR_CLASSES.bg.surfacePaleBlue}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Title */}
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${COLOR_CLASSES.text.deepBlue} text-center mb-6 sm:mb-8`}>
            Skills Test
          </h2>

          {/* Quiz Card */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 shadow-lg">
            {/* Timer and Question Counter */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-6 mb-6">
              {/* Question Counter */}
              <div className="text-gray-600 font-semibold text-base sm:text-lg">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </div>
              
              {/* Timer */}
              <div className={`self-start sm:self-auto border-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                timeRemaining <= 60 
                  ? 'bg-red-50 border-red-500' 
                  : `${COLOR_CLASSES.bg.surfaceSoftGreen} ${COLOR_CLASSES.border.accentGreen}`
              }`}>
                <span className={`font-bold text-base sm:text-lg ${
                  timeRemaining <= 60 ? 'text-red-600' : COLOR_CLASSES.text.accentGreenDark
                }`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>

            {/* Question */}
            <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold ${COLOR_CLASSES.text.accentGreen} mb-6 sm:mb-8`}>
              {currentQuestion.question}
            </h3>

            {/* Options */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {currentQuestion.options.map((option) => (
                <div 
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`flex items-start gap-3 sm:gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedOption === option.id 
                      ? `${COLOR_CLASSES.bg.surfaceSoftGreen} ${COLOR_CLASSES.border.accentGreen}` 
                      : `${COLOR_CLASSES.bg.surfacePaleBlue} border-gray-200 hover:border-gray-300`
                  }`}
                >
                  {/* Option Letter */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-base sm:text-lg ${
                    selectedOption === option.id 
                      ? `${COLOR_CLASSES.bg.accentGreen} text-white` 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {option.id}
                  </div>
                  
                  {/* Option Text */}
                  <p className="text-gray-800 text-sm sm:text-base md:text-lg pt-2">
                    {option.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
              {/* Previous Button */}
              <button 
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`w-full md:w-auto flex items-center justify-center md:justify-start gap-2 px-6 py-3 rounded-full font-semibold transition-colors ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : `${COLOR_CLASSES.bg.deepBlue} text-white ${COLOR_CLASSES.hoverBg.hoverNavy}`
                }`}
              >
                <FaArrowLeft />
                <span>Previous</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
                {/* Cancel Button */}
                <button 
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>

                {/* Continue/Submit Button */}
                {currentQuestionIndex === quizQuestions.length - 1 ? (
                  <button 
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full ${COLOR_CLASSES.bg.accentGreen} text-white font-semibold ${COLOR_CLASSES.hoverBg.accentGreenDark} transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <span>Submit</span>
                    <FaArrowRight />
                  </button>
                ) : (
                  <button 
                    onClick={handleNext}
                    disabled={!selectedOption}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full ${COLOR_CLASSES.bg.accentGreen} text-white font-semibold ${COLOR_CLASSES.hoverBg.accentGreenDark} transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <span>Continue</span>
                    <FaArrowRight />
                  </button>
                )}
              </div>
            </div>
          </div>
          </div>
        </section>
      )}

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 max-w-xl md:max-w-2xl w-full shadow-2xl">
            {/* Modal Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-700 text-center mb-6 sm:mb-8">
              Test Results
            </h2>

            {/* Results Cards */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {/* Total Questions */}
              <div className={`${COLOR_CLASSES.bg.surfacePaleBlue} rounded-2xl p-5 sm:p-6 flex justify-between items-center border-2 border-gray-200`}>
                <span className={`text-lg sm:text-xl md:text-2xl font-bold ${COLOR_CLASSES.text.deepBlue}`}>Total Questions</span>
                <span className={`text-2xl sm:text-3xl md:text-4xl font-bold ${COLOR_CLASSES.text.deepBlue}`}>{quizQuestions.length}</span>
              </div>

              {/* Correct Answers */}
              <div className={`${COLOR_CLASSES.bg.surfacePaleBlue} rounded-2xl p-5 sm:p-6 flex justify-between items-center border-2 border-gray-200`}>
                <span className={`text-lg sm:text-xl md:text-2xl font-bold ${COLOR_CLASSES.text.deepBlue}`}>Correct Answer</span>
                <span className={`text-2xl sm:text-3xl md:text-4xl font-bold ${COLOR_CLASSES.text.accentGreen}`}>{testResults.correct}</span>
              </div>

              {/* Wrong Answers */}
              <div className={`${COLOR_CLASSES.bg.surfacePaleBlue} rounded-2xl p-5 sm:p-6 flex justify-between items-center border-2 border-gray-200`}>
                <span className={`text-lg sm:text-xl md:text-2xl font-bold ${COLOR_CLASSES.text.deepBlue}`}>Wrong Answer</span>
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-500">{testResults.wrong}</span>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6 sm:mb-8">
              <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${COLOR_CLASSES.text.accentGreen}`}>
                {testResults.correct >= quizQuestions.length * 0.42 ? 'Well Done!' : 'Keep Trying!'}
              </h3>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                {testResults.correct >= quizQuestions.length * 0.42 
                  ? `You passed with ${Math.round((testResults.correct / quizQuestions.length) * 100)}%!`
                  : `You need 42% to pass. Try again!`
                }
              </p>
            </div>

            {/* Close Button */}
            <div className="text-center">
              <button 
                onClick={closeResultsModal}
                className={`px-8 sm:px-10 py-3 rounded-full ${COLOR_CLASSES.bg.deepBlue} text-white font-semibold text-base sm:text-lg ${COLOR_CLASSES.hoverBg.hoverNavy} transition-colors shadow-lg w-full sm:w-auto`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <FAQ faqs={faqData} headerContent={faqHeaderContent} />

      <Footer />
    </div>
  )
}

export default SkillAssesment
