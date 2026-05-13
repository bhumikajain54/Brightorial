import React, { useState, useEffect } from "react";
import {
  LuX,
  LuPlus,
  LuUpload,
  LuUser,
  LuSearch,
  LuFileImage,
} from "react-icons/lu";
import Button from "../../../../shared/components/Button";
import { TAILWIND_COLORS } from "../../../../shared/WebConstant";
import {postMethod, getMethod } from "../../../../service/api";
import apiService from "../../services/serviceUrl.js";
import { SERVICE_URL } from "../../../../service/api";

const CreateBatchModal = ({ isOpen, onClose, courseId, courseTitle, onBatchCreated }) => {



const [showTimePicker, setShowTimePicker] = useState(false);
const [tempStart, setTempStart] = useState("");
const [tempEnd, setTempEnd] = useState("");



  const [formData, setFormData] = useState({
    batchName: "",
    course: courseId ? String(courseId) : "",
    startDate: "",
    endDate: "",
    timeSlot: "", // ✅ keep this field here
    instructor: "",
    students: [],
  });

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await getMethod({
        apiUrl: apiService.getCourses,
      });
      if (response.status && response.courses) {
        setCourses(response.courses);
      } else {
        setCourses([]);
      }
    } catch (err) {
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
      fetchInstructors();
      // ✅ Reset form when modal opens, but set course if courseId is provided
      if (courseId) {
        setFormData(prev => ({
          ...prev,
          course: String(courseId)
        }));
      }
    }
  }, [isOpen, courseId]);

  // ✅ Auto-select course when courses are loaded and courseId is provided
  useEffect(() => {
    if (courseId && courses.length > 0) {
      const courseExists = courses.find(c => c.id === courseId || c.course_id === courseId);
      if (courseExists) {
        setFormData(prev => ({
          ...prev,
          course: String(courseId)
        }));
      }
    }
  }, [courses, courseId]);

  // const [formData, setFormData] = useState({
  //   batchName: '',
  //   course: courseTitle || '',
  //   startDate: '',
  //   endDate: '',
  //   timeSlot: '10:00 AM - 12:00 PM',
  //   instructor: '',
  //   students: []
  // })

  const [searchStudent, setSearchStudent] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [dragActiveCsv, setDragActiveCsv] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showCreateInstructorModal, setShowCreateInstructorModal] =
    useState(false);
  const [newInstructorData, setNewInstructorData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Instructors data from database
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  // Available courses for selection
  const availableCourses = [
    { id: 1, name: "Full Stack Web Development (6 months)" },
    { id: 2, name: "Fundamentals of Electricity" },
    { id: 3, name: "Wiring & Circuit Installation" },
    { id: 4, name: "Transformer Installation" },
    { id: 5, name: "Power Distribution Systems" },
    { id: 6, name: "Motor Winding Techniques" },
    { id: 7, name: "House & Industrial Wiring" },
  ];

  // Sample students data (UI only)
  const availableStudents = [
    "himanshushrirang@gmail.com",
    "student1@example.com",
    "student2@example.com",
    "student3@example.com",
    "student4@example.com",
    "student5@example.com",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddStudent = () => {
    if (searchStudent && !formData.students.includes(searchStudent)) {
      setFormData((prev) => ({
        ...prev,
        students: [...prev.students, searchStudent],
      }));
      setSearchStudent("");
    }
  };

  const handleRemoveStudent = (studentToRemove) => {
    setFormData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s !== studentToRemove),
    }));
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (file) setCsvFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActiveCsv(true);
    else if (e.type === "dragleave") setDragActiveCsv(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveCsv(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCsvFile(e.dataTransfer.files[0]);
    }
  };

  const removeCsvFile = () => setCsvFile(null);

  const resetState = () => {
    setFormData({
      batchName: "",
      course: courseId ? String(courseId) : "",
      startDate: "",
      endDate: "",
      timeSlot: "",
      instructor: "",
      students: [],
    });
    setSearchStudent("");
    setCsvFile(null);
    setIsSubmitting(false);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleCancel = () => {
    resetState();
    onClose && onClose();
  };

  const handleCreateInstructor = async () => {
    if (
      !newInstructorData.name.trim() ||
      !newInstructorData.email.trim() ||
      !newInstructorData.phone.trim()
    ) {
      setErrorMsg("Please fill all fields");
      return;
    }

    try {
      const payload = {
        name: newInstructorData.name.trim(),
        email: newInstructorData.email.trim(),
        phone: newInstructorData.phone.trim(),
      };


      const response = await postMethod({
        apiUrl: apiService.createFaculty,
        payload,
      });


      if (response.status) {
        // Refresh instructors list from database
        await fetchInstructors();
        // ✅ Set instructor ID from response (same as EditBatchModal)
        const newInstructorId = response.data?.id || response.data?.faculty_id || null;
        if (newInstructorId) {
          setFormData((prev) => ({ ...prev, instructor: String(newInstructorId) }));
        }
        setShowCreateInstructorModal(false);
        setNewInstructorData({ name: "", email: "", phone: "" });
        setSuccessMsg("Instructor created successfully");
      } else {
        setErrorMsg(response.message || "Failed to create instructor");
      }
    } catch (err) {
      setErrorMsg("Unexpected error occurred.");
    }
  };

  const handleCloseCreateInstructorModal = () => {
    setShowCreateInstructorModal(false);
    setNewInstructorData({ name: "", email: "", phone: "" });
  };

  const handleInstructorDataChange = (field, value) => {
    setNewInstructorData((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch instructors from database
  const fetchInstructors = async () => {
    try {
      setLoadingInstructors(true);
      const response = await getMethod({
        apiUrl: apiService.getFaculty,
      });

      if (response.status && response.data) {
        setInstructors(response.data);
      } else {
        setInstructors([]);
      }
    } catch (err) {
      setInstructors([]);
    } finally {
      setLoadingInstructors(false);
    }
  };

  // Load instructors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInstructors();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // ✅ Use instructor ID directly from formData (same as EditBatchModal)
      const instructor_id = formData.instructor ? Number(formData.instructor) : 0;

      // ✅ Construct payload as expected by backend
      const payload = {
        course_id: Number(formData.course), // ✅ courseId select box se
        name: formData.batchName.trim(),
        batch_time_slot: formData.timeSlot,
        start_date: formData.startDate,
        end_date: formData.endDate,
        instructor_id: instructor_id,
        media: csvFile
          ? { csv_filename: csvFile.name, size: csvFile.size }
          : null,
      };


      // ✅ Use the proper API service method
      const result = await postMethod({
        apiUrl: apiService.createBatch,
        payload,
      });

      setIsSubmitting(false);

      if (result.status) {
        setSuccessMsg(result.message || "Batch created successfully");
        // Notify parent component to refresh batch list
        if (onBatchCreated) {
          onBatchCreated();
        }
        setTimeout(() => {
          onClose();
          resetState();
        }, 1000);
      } else {
        setErrorMsg(result.message || "Failed to create batch");
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Create New Batch
          </h2>
          <button
            onClick={handleCancel}
            className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-text-primary transition-colors`}
            disabled={isSubmitting}
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Scrollable Content */}
          <div className="p-6 space-y-8 overflow-y-auto flex-1">
            {/* Inline alerts */}
            {errorMsg && (
              <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="rounded-md bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm">
                {successMsg}
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h3
                className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
              >
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Batch Name */}
                <div className="md:col-span-2">
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                  >
                    BATCH NAME
                  </label>
                  <input
                    type="text"
                    value={formData.batchName}
                    onChange={(e) =>
                      handleInputChange("batchName", e.target.value)
                    }
                    placeholder="e.g., Assistant Electrician, Web Developer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Select Course */}
                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                  >
                    SELECT COURSE
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) =>
                      handleInputChange("course", e.target.value)
                    }
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      courseId ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    required
                    disabled={loadingCourses || !!courseId}
                  >
                    <option value="">
                      {loadingCourses
                        ? "Loading courses..."
                        : "Select a course"}
                    </option>

                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {courseId 
                      ? "Course is pre-selected and cannot be changed" 
                      : "Choose the course for this batch"}
                  </p>
                </div>

                {/* Batch Time Slot */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Batch Time Slot
  </label>

  {/* Display field */}
  <input
    type="text"
    placeholder="Select time"
    value={formData.timeSlot}
    readOnly
    onClick={() => setShowTimePicker(true)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 cursor-pointer"
  />
  <div className="absolute right-3 top-2.5 pointer-events-none">
    <svg
      className="w-4 h-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>

  {/* Time Picker Popup */}
  {showTimePicker && (
    <div className="absolute bg-white shadow-lg border border-gray-200 rounded-lg p-4 mt-2 z-50 w-64">
      <p className="text-sm font-medium text-gray-700 mb-2">Select Time Slot</p>

      <div className="flex items-center justify-between space-x-2">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Start</label>
          <input
            type="time"
            value={tempStart}
            onChange={(e) => setTempStart(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <span className="text-gray-500">–</span>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">End</label>
          <input
            type="time"
            value={tempEnd}
            onChange={(e) => setTempEnd(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end mt-3 space-x-2">
        <button
          type="button"
          onClick={() => setShowTimePicker(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
        <button
  type="button"
  onClick={() => {
    if (tempStart && tempEnd) {
      // ✅ Convert 24h time → 12h AM/PM format
      const formatTime = (time) => {
        let [h, m] = time.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        return `${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")} ${ampm}`;
      };

      const formatted = `${formatTime(tempStart)} - ${formatTime(tempEnd)}`;

      // ✅ Update state properly and close popup after that
      setFormData((prev) => ({ ...prev, timeSlot: formatted }));

      // ✅ Reset temp times so next time popup opens clean
      setTempStart("");
      setTempEnd("");

      setShowTimePicker(false);
    } else {
      alert("Please select both start and end time");
    }
  }}
  className="bg-blue-500 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-600"
>
  OK
</button>

      </div>
    </div>
  )}
</div>


                {/* Start Date */}
                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                  >
                    STARTING DATE
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                  >
                    END DATE
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Assignment */}
            <div>
              <h3
                className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
              >
                Instructor Assignment
              </h3>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                >
                  ASSIGN INSTRUCTOR
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <select
                      value={formData.instructor}
                      onChange={(e) =>
                        handleInputChange("instructor", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      disabled={loadingInstructors}
                    >
                      <option value="">
                        {loadingInstructors
                          ? "Loading instructors..."
                          : "Select Instructor"}
                      </option>
                      {instructors.map((instructor, index) => (
                        <option
                          key={instructor.id || index}
                          value={instructor.id}
                        >
                          {instructor.name}
                        </option>
                      ))}
                    </select>
                    <LuUser
                      className={`absolute right-3 top-2.5 w-5 h-5 ${TAILWIND_COLORS.TEXT_MUTED} pointer-events-none`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    icon={<LuPlus className="w-4 h-4" />}
                    className="whitespace-nowrap"
                    onClick={() => setShowCreateInstructorModal(true)}
                  >
                    Create Instructor
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              size="md"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </div>

      {/* Create Instructor Modal */}
      {showCreateInstructorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2
                className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                Create New Instructor
              </h2>
              <button
                onClick={handleCloseCreateInstructorModal}
                className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-text-primary transition-colors`}
              >
                <LuX className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                >
                  INSTRUCTOR NAME
                </label>
                <input
                  type="text"
                  value={newInstructorData.name}
                  onChange={(e) =>
                    handleInstructorDataChange("name", e.target.value)
                  }
                  placeholder="Enter instructor name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                >
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={newInstructorData.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInstructorDataChange("email", value);
                  }}
                  placeholder="Enter email address"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                    newInstructorData.email &&
                    !/^[\w.%+-]+@gmail\.com$/.test(newInstructorData.email)
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                  }`}
                />
                {newInstructorData.email &&
                  !/^[\w.%+-]+@gmail\.com$/.test(newInstructorData.email) && (
                    <p className="text-red-500 text-sm mt-1">
                      Please enter a valid Gmail address (e.g.,
                      example@gmail.com)
                    </p>
                  )}
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                >
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  value={newInstructorData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers and up to 10 digits
                    if (/^\d{0,10}$/.test(value)) {
                      handleInstructorDataChange("phone", value);
                    }
                  }}
                  placeholder="Enter phone number"
                  maxLength={10}
                  pattern="\d{10}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {newInstructorData.phone.length > 0 &&
                  newInstructorData.phone.length < 10 && (
                    <p className="text-red-500 text-sm mt-1">
                      Phone number must be 10 digits.
                    </p>
                  )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleCloseCreateInstructorModal}
                variant="outline"
                size="md"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateInstructor}
                variant="primary"
                size="md"
                disabled={
                  !newInstructorData.name.trim() ||
                  !newInstructorData.email.trim() ||
                  !newInstructorData.phone.trim()
                }
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBatchModal;
