import React from 'react'
import { LuX, LuCalendar, LuUpload } from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import { Button, IconButton, PreviewButton } from '../../../../shared/components/Button'

const ViewJobModal = ({ isOpen, onClose, job }) => {
  if (!isOpen || !job) return null

  const handlePreviewFile = () => {
    if (job.fileAttachment || job.fileUrl) {
      // Open file in new tab or handle file preview
      const fileUrl = job.fileUrl || job.fileAttachment
      window.open(fileUrl, '_blank')
    } else {
      // Show message if no file is attached
      alert('No file attachment available for this job posting.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] flex flex-col shadow-2xl">
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className={`text-2xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>JOB DETAILS</h2>
          <IconButton
            label="Close"
            onClick={onClose}
            variant="light"
            className="hover:bg-gray-100"
          >
            <LuX size={20} />
          </IconButton>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
          {/* Basic Information Form */}
          <div className="bg-white rounded-xl border border-[var(--color-primary)3C] p-5">
            <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-8`}>Basic Information</h2>
            
            <div className="space-y-8">
              {/* Job Title */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    JOB TITLE
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Add position name</p>
                </div>
                <div className="lg:col-span-2">
                  <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {job.title || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Job Sector */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    JOB SECTOR
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Choose category</p>
                </div>
                <div className="lg:col-span-2">
                  <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {job.jobSector || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    JOB DESCRIPTION
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>For effective candidate selection, enhance the job description with</p>
                </div>
                <div className="lg:col-span-2">
                  <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY} min-h-[100px]`}>
                    {job.description || 'No description provided'}
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    SALARY
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Choose category</p>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex gap-4">
                    <div className={`px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {job.salaryType || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={TAILWIND_COLORS.TEXT_MUTED}>₹</span>
                      <div className={`w-24 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {job.minSalary || 'N/A'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={TAILWIND_COLORS.TEXT_MUTED}>₹</span>
                      <div className={`w-24 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {job.maxSalary || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Type */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    JOB TYPE
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Choose job type</p>
                </div>
                <div className="lg:col-span-2">
                  <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {job.jobType || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Required Skills */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    REQUIRED SKILLS
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>List needed skills</p>
                </div>
                <div className="lg:col-span-2">
                  <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {job.requiredSkills || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    EXPERIENCE
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Choose required experience</p>
                </div>
                <div className="lg:col-span-2">
                  <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {job.experience || 'N/A'}
                  </div>
                </div>
              </div>

              {/* File Attachment */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    FILE ATTACHMENT
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Upload related documents.</p>
                </div>
                <div className="lg:col-span-2">
                  <PreviewButton 
                    onClick={handlePreviewFile}
                    disabled={!job.fileAttachment && !job.fileUrl}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address / Location Form */}
          <div className="bg-white rounded-xl border border-[var(--color-primary)3C] p-5">
            <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-8`}>Address / Location</h2>
            
            <div className="space-y-8">
              {/* Country */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    COUNTRY
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Select job location country</p>
                </div>
                <div className="lg:col-span-2">
                  <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {job.country || 'N/A'}
                  </div>
                </div>
              </div>

              {/* City */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    CITY
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Choose job city</p>
                </div>
                <div className="lg:col-span-2">
                  <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {job.city || 'N/A'}
                  </div>
                </div>
              </div>

              {/* State */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    STATE
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Choose job state</p>
                </div>
                <div className="lg:col-span-2">
                  <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {job.state || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Full Address */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    FULL ADDRESS
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Enter complete location</p>
                </div>
                <div className="lg:col-span-2">
                  <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {job.fullAddress || job.location || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information and Dates and Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information Form */}
            <div className="bg-white rounded-xl border border-[var(--color-primary)3C] p-5">
              <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-8`}>Contact information</h2>
              
              <div className="space-y-8">
                {/* Person */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                      PERSON
                    </label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Enter contact person's name</p>
                  </div>
                  <div>
                    <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {job.contactPerson || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                      PHONE
                    </label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Add contact number</p>
                  </div>
                  <div>
                    <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {job.phone || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Additional Contact */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                      ADDITIONAL CONTACT
                    </label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Add alternate contact</p>
                  </div>
                  <div>
                    <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {job.additionalContact || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates and Status Form */}
            <div className="bg-white rounded-xl border border-[var(--color-primary)3C] p-5">
              <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-8`}>Dates and Status</h2>
              
              <div className="space-y-8">
                {/* Vacancy Status */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                      VACANCY STATUS
                    </label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Select hiring status</p>
                  </div>
                  <div>
                    <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {job.status?.toLowerCase() === 'paused' ? 'draft' : (job.status || 'N/A')}
                    </div>
                  </div>
                </div>

                {/* Opening Date */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                      OPENING
                    </label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Choose job post start</p>
                  </div>
                  <div>
                    <div className="relative">
                      <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY} pr-10`}>
                        {job.openingDate || 'N/A'}
                      </div>
                      <LuCalendar className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} pointer-events-none`} size={20} />
                    </div>
                  </div>
                </div>

                {/* Closing Date */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                      CLOSING
                    </label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Choose job post end</p>
                  </div>
                  <div>
                    <div className="relative">
                      <div className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY} pr-10`}>
                        {job.closingDate || 'N/A'}
                      </div>
                      <LuCalendar className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} pointer-events-none`} size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
            <Button
              onClick={onClose}
              variant="light"
              size="lg"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewJobModal
