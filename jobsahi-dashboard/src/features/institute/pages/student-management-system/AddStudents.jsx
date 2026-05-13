import React, { useState } from 'react'
import { LuCalendar, LuDownload, LuUpload, LuFileText, LuX } from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import Button from '../../../../shared/components/Button'

const AddStudents = () => {
  const [formData, setFormData] = useState({
    fullName: 'Aaruu Nathani',
    email: 'aaru@2gmail.com',
    phone: '98765 43210',
    dateOfBirth: '',
    aadharNumber: '1234-5678-9101',
    course: '',
    batch: '',
    address: ''
  })

  const [uploadedFile, setUploadedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const courses = [
    'Select Course',
    'Electrician',
    'Fitter',
    'Welder',
    'Mechanic',
    'Plumber'
  ]

  const batches = [
    'Select Batch',
    'ELE-2025-M1',
    'FIT-2025-M1',
    'WEL-2025-M1',
    'MEC-2025-M1',
    'PLU-2025-M1'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the data to your API
    alert('Student added successfully!')
  }

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      aadharNumber: '',
      course: '',
      batch: '',
      address: ''
    })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0])
    }
  }

  const handleBulkUpload = () => {
    if (uploadedFile) {
      // Here you would typically process the file and upload students
      alert('Students uploaded successfully!')
      setUploadedFile(null)
    } else {
      alert('Please select a file first')
    }
  }

  const handleDownloadTemplate = () => {
    // Create and download CSV template
    const csvContent = 'Name,Email,Phone,Course,Batch,Address,DOB,Aadhar\n' +
      'John Doe,john@example.com,9876543210,Electrician,ELE-2025-M1,123 Main St,John Sr,1995-01-01,1234-5678-9012\n' +
      'Jane Smith,jane@example.com,9876543211,Fitter,FIT-2025-M1,456 Oak Ave,Jane Sr,1996-02-02,1234-5678-9013'
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  return (
    <div className="p-2 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Student Manually Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-6`}>Add Student Manually</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Date of birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] focus:border-transparent cursor-pointer"
                    placeholder="Select date of birth"
                  />
                 
                </div>
               
              </div>

              
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Aadhar number
                </label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] focus:border-transparent"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] focus:border-transparent"
                  required
                >
                  {courses.map((course, index) => (
                    <option key={index} value={course === 'Select Course' ? '' : course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Batch
                </label>
                <select
                  name="batch"
                  value={formData.batch}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] focus:border-transparent"
                >
                  {batches.map((batch, index) => (
                    <option key={index} value={batch === 'Select Batch' ? '' : batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete address.."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="font-medium"
              >
                Add Student
              </Button>
              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                size="md"
                className="font-medium"
              >
                Reset
              </Button>
            </div>
          </form>
        </div>

        {/* Bulk Upload Students Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-6`}>Bulk Upload Students</h2>
          
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-[#5B9821] bg-green-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <LuFileText className="w-12 h-12 text-[#5B9821]" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{uploadedFile.name}</p>
                  <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <LuX className="w-4 h-4 mx-auto" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <LuUpload className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                <div>
                  <p className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Upload CSV/ Excel File</p>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                    Drag and Drop your file here, or click to browse
                  </p>
                </div>
                <input
                  type="file"
                  id="file-upload"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-[#5B9821] text-white rounded-lg hover:bg-[#3f6917] transition-colors cursor-pointer font-medium"
                >
                  Choose File
                </label>
              </div>
            )}
          </div>

          {/* File Requirements */}
          <div className="mt-6">
            <h3 className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>File Requirements:</h3>
            <ul className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} space-y-1`}>
              <li>• File format: CSV or Excel (.xlsx)</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Required columns: Name, Email, Phone, Course</li>
              <li>• Optional Columns: Batch, Address, DOB, Aadhar</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={handleDownloadTemplate}
              variant="primary"
              size="md"
              icon={<LuDownload className="w-4 h-4" />}
              className="font-medium"
            >
              Download Template
            </Button>
            <Button
              onClick={handleBulkUpload}
              variant="outline"
              size="md"
              className="font-medium"
            >
              Upload Students
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddStudents