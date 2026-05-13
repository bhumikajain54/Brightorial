import React, { useState, useEffect } from 'react'
import { LuPencil, LuX, LuFileText, LuDownload, LuBriefcase } from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import { Button } from '../../../../shared/components/Button'

const ManageSkillPage = () => {
  const [allQuestions, setAllQuestions] = useState([])
  const [editingJobId, setEditingJobId] = useState(null)
  const [editingQuestions, setEditingQuestions] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  // Load questions from localStorage
  useEffect(() => {
    const savedQuestions = localStorage.getItem('skillTestQuestions')
    if (savedQuestions) {
      try {
        setAllQuestions(JSON.parse(savedQuestions))
      } catch (err) {
        console.error('Error loading questions from localStorage:', err)
      }
    }
  }, [])

  // Group questions by job
  const questionsByJob = allQuestions.reduce((acc, question) => {
    const jobId = question.jobId
    const jobTitle = question.jobTitle || 'Untitled Job'
    
    if (!acc[jobId]) {
      acc[jobId] = {
        jobId,
        jobTitle,
        questions: []
      }
    }
    acc[jobId].questions.push(question)
    return acc
  }, {})

  const jobCards = Object.values(questionsByJob)

  const handleEdit = (jobId) => {
    const jobQuestions = questionsByJob[jobId]?.questions || []
    // Create editable copies of questions
    setEditingQuestions(jobQuestions.map(q => ({ ...q })))
    setEditingJobId(jobId)
    setErrorMessage('')
  }

  const handleCancelEdit = () => {
    setEditingJobId(null)
    setEditingQuestions([])
    setErrorMessage('')
  }

  const handleQuestionChange = (questionId, field, value) => {
    setEditingQuestions(prev => 
      prev.map(q => {
        if (q.id === questionId) {
          if (field === 'questionText') {
            return { ...q, questionText: value }
          } else if (field.startsWith('option')) {
            const index = parseInt(field.replace('option', ''))
            const newOptions = [...q.options]
            newOptions[index] = value
            return { ...q, options: newOptions }
          } else if (field === 'correctAnswer') {
            return { ...q, correctAnswer: parseInt(value) }
          }
        }
        return q
      })
    )
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('')
    }
  }

  const handleSave = () => {
    // Validation
    for (const question of editingQuestions) {
      if (!question.questionText.trim()) {
        setErrorMessage('Please fill all fields. Question text is required for all questions.')
        return
      }
      const hasEmptyOptions = question.options.some(opt => !opt.trim())
      if (hasEmptyOptions) {
        setErrorMessage('Please fill all fields. All options are required for all questions.')
        return
      }
    }

    // Update questions in allQuestions
    const updatedQuestions = allQuestions.map(q => {
      const editedQuestion = editingQuestions.find(eq => eq.id === q.id)
      return editedQuestion || q
    })

    // Save to localStorage
    localStorage.setItem('skillTestQuestions', JSON.stringify(updatedQuestions))
    setAllQuestions(updatedQuestions)
    setEditingJobId(null)
    setEditingQuestions([])
    setErrorMessage('')
  }

  const handleExport = (jobId) => {
    const jobQuestions = questionsByJob[jobId]?.questions || []
    const jobTitle = questionsByJob[jobId]?.jobTitle || 'SkillTest'
    
    // Format questions for export
    const exportData = {
      jobTitle: jobTitle,
      jobId: jobId,
      exportDate: new Date().toISOString(),
      totalQuestions: jobQuestions.length,
      questions: jobQuestions.map((q, index) => ({
        questionNumber: index + 1,
        question: q.questionText,
        options: q.options.map((opt, optIdx) => ({
          option: optIdx + 1,
          text: opt,
          isCorrect: optIdx === q.correctAnswer
        })),
        correctAnswer: `Option ${q.correctAnswer + 1}`
      }))
    }

    // Create JSON file and download
    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${jobTitle.replace(/[^a-z0-9]/gi, '_')}_SkillTest_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
        Manage Skill Tests
      </h2>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Job Cards */}
      {jobCards.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className={`text-lg ${TAILWIND_COLORS.TEXT_MUTED}`}>
            No skill tests created yet. Create tests in the "Create Test" tab.
          </p>
        </div>
      ) : (
        <>
          {editingJobId ? (
            /* Edit Mode - Show Questions for Editing */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  Editing Questions for: {questionsByJob[editingJobId]?.jobTitle}
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <LuX size={20} className={TAILWIND_COLORS.TEXT_MUTED} />
                </button>
              </div>

              {editingQuestions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h4 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
                    Question {index + 1}
                  </h4>

                  {/* Question Text */}
                  <div className="mb-4">
                    <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                      Question Text
                    </label>
                    <textarea
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(question.id, 'questionText', e.target.value)}
                      placeholder="Enter your question here"
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none resize-y ${
                        errorMessage && !question.questionText.trim() ? 'border-red-500' : 'border-gray-300'
                      } ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>
                      Options (Select correct answer)
                    </label>
                    <div className="space-y-3">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correctAnswer-${question.id}`}
                            checked={question.correctAnswer === optIndex}
                            onChange={() => handleQuestionChange(question.id, 'correctAnswer', optIndex)}
                            className="w-5 h-5 text-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleQuestionChange(question.id, `option${optIndex}`, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none ${
                              errorMessage && !option.trim() ? 'border-red-500' : 'border-gray-300'
                            } ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleCancelEdit}
                  variant="light"
                  size="md"
                  className="flex items-center gap-2"
                >
                  <LuX size={16} />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="primary"
                  size="md"
                  className="flex items-center gap-2"
                >
                  <LuFileText size={16} />
                  Update / Save
                </Button>
              </div>
            </div>
          ) : (
            /* View Mode - Show Job Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobCards.map((job) => (
                <div
                  key={job.jobId}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-5"
                >
                  <div className="flex items-center justify-between">
                    {/* Job Name */}
                    <div className="flex-1 pr-4">
                      <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} line-clamp-2`}>
                        {job.jobTitle}
                      </h3>
                      <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                        {job.questions.length} {job.questions.length === 1 ? 'question' : 'questions'}
                      </p>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(job.jobId)}
                        className="p-2.5 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 rounded-lg transition-colors"
                        title="Edit Questions"
                      >
                        <LuPencil size={20} />
                      </button>
                      <button
                        onClick={() => handleExport(job.jobId)}
                        className="p-2.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                        title="Export Questions"
                      >
                        <LuDownload size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ManageSkillPage
