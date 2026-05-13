import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { COLORS, TAILWIND_COLORS } from '../WebConstant'
import { LuUsers } from 'react-icons/lu'
import { LuGraduationCap } from 'react-icons/lu'
import { FaUserShield, FaBuilding, FaSchool, FaEye, FaEyeSlash } from 'react-icons/fa'
import { postMethod, putMethod, putMultipart, postMultipart } from '../../service/api'
import apiService from '../../shared/services/serviceUrl'

function Pills({ items = [], activeKey, onChange }) {
  return (
    <div
      className="rounded-full p-1 flex justify-between items-center gap-2 overflow-x-auto"
      style={{ backgroundColor: '#F7FBFF', border: '1px solid rgba(11,83,125,0.15)' }}
    >
      {items.map((item) => {
        const isActive = activeKey === item.key
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange?.(item.key)}
            className="flex items-center gap-2 rounded-full px-2 py-2 whitespace-nowrap"
            style={
              isActive
                ? { backgroundColor: COLORS.GREEN_PRIMARY, color: 'white' }
                : { backgroundColor: 'white', color: COLORS.GREEN_PRIMARY, border: '1px solid rgba(11,83,125,0.15)' }
            }
          >
            {item.icon ? (
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={
                  isActive
                    ? { backgroundColor: 'rgba(255,255,255,0.9)', color: COLORS.GREEN_PRIMARY }
                    : { backgroundColor: 'rgba(92,154,36,0.15)', color: COLORS.GREEN_PRIMARY }
                }
                aria-hidden
              >
                {item.icon}
              </span>
            ) : null}
            <span className="text-sm font-medium md:me-10">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function CreateAccount() {
  const navigate = useNavigate()
  const [role, setRole] = useState('Admin') // Admin | Recruiter | Institute | Student
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Creating Account...')
  const [form, setForm] = useState({
    // Common fields
    password: '',
    confirmPassword: '',
    // Admin fields
    fullName: '',
    officialEmail: '',
    mobileNumber: '',
    employeeId: '',
    profilePhoto: null,
    // Recruiter fields
    companyName: '',
    companyEmail: '',
    companyContact: '',
    companyWebsite: '',
    designation: '',
    industryType: '',
    officeAddress: '',
    companyLogo: null,
    gstPan: '', 
    // Institute fields
    instituteName: '',
    instituteType: '',
    registrationNumber: '',
    affiliationDetails: '',
    principalName: '',
    instituteEmail: '',
    instituteContact: '',
    instituteLogo: null,
    coursesOffered: [],
    instituteAddress: '',
    instituteWebsite: '',
    postalCode: '',
    establishedYear: '',
    instituteDescription: '',
    // Student fields
    studentFullName: '',
    dateOfBirth: '',
    gender: '',
    studentEmail: '',
    studentMobileNumber: '',
    studentProfilePhoto: null,
    bio: '',
    location: '', // Single address field
    skills: '', // Comma-separated string
    resumeCv: null,
    education: [{ // Array of education entries
      qualification: '',
      institute: '',
      start_year: '',
      end_year: '',
      is_pursuing: false,
      pursuing_year: null,
      cgpa: null
    }],
    socialLinks: [{ // Array of social links
      title: '',
      profile_url: ''
    }],
    experience: [{ // Array of experience entries
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: ''
    }],
    projects: [{ // Array of projects
      name: '',
      description: '',
      technologies: '',
      link: ''
    }],
  })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    
    // Validate password confirmation
    if (form.password !== form.confirmPassword) {
      Swal.fire({
        title: "Validation Error",
        text: "Password and confirm password do not match!",
        icon: "error"
      });
      return;
    }
    
    // is_verified: 0 for Recruiter and Institute (admin approval required)
    // is_verified: 1 for Admin and Student (directly verified)
    const isVerified = (role === 'Recruiter' || role === 'Institute') ? 0 : 1;
    
    // Show loading
    setIsLoading(true);
    setLoadingText('Creating Account...');

    try {
      // ============================================
      // Single API Call: Create User + Profile with all fields
      // ============================================
      console.log('📤 Creating account with all fields in single API call...');
      
      const formData = new FormData();
      
      // Common fields for users table
      formData.append('password', form.password);
      formData.append('role', role.toLowerCase());
      formData.append('is_verified', isVerified);
      formData.append('status', 'active');
      
      // Role-specific fields
      if (role === 'Admin') {
        formData.append('user_name', form.fullName);
        formData.append('email', form.officialEmail);
        formData.append('phone_number', form.mobileNumber);
        if (form.employeeId) formData.append('employee_id', form.employeeId);
        if (form.profilePhoto) formData.append('profile_photo', form.profilePhoto);
        
      } else if (role === 'Recruiter') {
        formData.append('user_name', form.companyName);
        formData.append('email', form.companyEmail);
        formData.append('phone_number', form.companyContact);
        if (form.companyWebsite) formData.append('company_website', form.companyWebsite);
        if (form.designation) formData.append('designation', form.designation);
        if (form.industryType) formData.append('industry_type', form.industryType);
        if (form.officeAddress) formData.append('office_address', form.officeAddress);
        if (form.gstPan) formData.append('gst_pan', form.gstPan);
        if (form.companyLogo) formData.append('company_logo', form.companyLogo);
        
      } else if (role === 'Institute') {
        formData.append('user_name', form.instituteName);
        formData.append('email', form.instituteEmail);
        formData.append('phone_number', form.instituteContact);
        if (form.instituteType) formData.append('institute_type', form.instituteType);
        if (form.registrationNumber) formData.append('registration_number', form.registrationNumber);
        if (form.affiliationDetails) formData.append('affiliation_details', form.affiliationDetails);
        if (form.principalName) formData.append('principal_name', form.principalName);
        if (form.instituteAddress) formData.append('institute_address', form.instituteAddress);
        if (form.instituteWebsite) formData.append('institute_website', form.instituteWebsite);
        if (form.postalCode) formData.append('postal_code', form.postalCode);
        if (form.establishedYear) formData.append('established_year', form.establishedYear);
        if (form.instituteDescription) formData.append('description', form.instituteDescription);
        if (form.coursesOffered && form.coursesOffered.length > 0) {
          formData.append('courses_offered', Array.isArray(form.coursesOffered) ? form.coursesOffered.join(', ') : form.coursesOffered);
        }
        if (form.instituteLogo) formData.append('institute_logo', form.instituteLogo);
        
      } else if (role === 'Student') {
        formData.append('user_name', form.studentFullName);
        formData.append('email', form.studentEmail);
        formData.append('phone_number', form.studentMobileNumber);
        if (form.dateOfBirth) formData.append('date_of_birth', form.dateOfBirth);
        if (form.gender) formData.append('gender', form.gender.toLowerCase());
        if (form.bio) formData.append('bio', form.bio);
        if (form.location) formData.append('location', form.location);
        if (form.skills) formData.append('skills', form.skills);
        if (form.education && form.education.length > 0) {
          // Filter out empty entries and stringify
          const validEducation = form.education.filter(edu => edu.qualification || edu.institute);
          if (validEducation.length > 0) {
            formData.append('education', JSON.stringify(validEducation));
          }
        }
        if (form.socialLinks && form.socialLinks.length > 0) {
          // Filter out empty entries and stringify
          const validSocialLinks = form.socialLinks.filter(link => link.title || link.profile_url);
          if (validSocialLinks.length > 0) {
            formData.append('socials', JSON.stringify(validSocialLinks));
          }
        }
        if (form.experience && form.experience.length > 0) {
          // Filter out empty entries and stringify
          const validExperience = form.experience.filter(exp => exp.company || exp.position);
          if (validExperience.length > 0) {
            formData.append('experience', JSON.stringify(validExperience));
          }
        }
        if (form.projects && form.projects.length > 0) {
          // Filter out empty entries and stringify
          const validProjects = form.projects.filter(proj => proj.name);
          if (validProjects.length > 0) {
            formData.append('projects', JSON.stringify(validProjects));
          }
        }
        if (form.studentProfilePhoto) formData.append('profile_photo', form.studentProfilePhoto);
        if (form.resumeCv) formData.append('resume', form.resumeCv);
      }
      
      console.log('📤 FormData keys:', Array.from(formData.keys()));
      
      const userResponse = await postMultipart({
        apiUrl: apiService.signup,
        data: formData
      });
      
      console.log('✅ Response - User + Profile Creation:', userResponse)
      
      // Hide loading
      setIsLoading(false);

      // Check if registration was successful
      const isSuccess = (userResponse.status === true || 
          userResponse.status === 'success' || 
          userResponse.success === true || 
          (userResponse.data && userResponse.data.success === true) ||
          userResponse.message === 'User registered successfully' ||
          (userResponse.message && userResponse.message.includes('successfully')) ||
          userResponse.httpStatus === 200) &&
          !userResponse.message?.includes('already exists') &&
          !userResponse.message?.includes('failed') &&
          !userResponse.message?.includes('error');

      if (isSuccess) {
        // Get email for redirect
        const userEmail = role === 'Admin' ? form.officialEmail :
                         role === 'Recruiter' ? form.companyEmail :
                         role === 'Institute' ? form.instituteEmail :
                         form.studentEmail;
        
        Swal.fire({
          title: "Success",
          text: userResponse.message || "Account and profile created successfully! You can now login.",
          confirmButtonText: "Ok",
          icon: "success"
        }).then((result) => {
          if (result.isConfirmed) {
            if (userEmail) {
              localStorage.setItem('pendingVerificationEmail', userEmail);
            }
            navigate("/login")
          }
        });
      } else {
        // Handle specific error cases with proper messages
        const errorMessage = userResponse.message || "";
        let alertTitle = "Registration Failed";
        let alertText = "Registration failed. Please try again.";
        
        // Check for specific error messages
        if (errorMessage.toLowerCase().includes('email already exists') || 
            errorMessage.toLowerCase().includes('email already registered')) {
          alertTitle = "Email Already Exists";
          alertText = "This email address is already registered. Please use a different email or try logging in.";
        } else if (errorMessage.toLowerCase().includes('phone number already exists') ||
                   errorMessage.toLowerCase().includes('phone already registered')) {
          alertTitle = "Phone Number Already Exists";
          alertText = "This phone number is already registered. Please use a different phone number or try logging in.";
        } else if (errorMessage.toLowerCase().includes('already exists')) {
          alertTitle = "Account Already Exists";
          alertText = "An account with these details already exists. Please use different information or try logging in.";
        } else if (errorMessage.toLowerCase().includes('not found') ||
                   errorMessage.toLowerCase().includes('does not exist') ||
                   errorMessage.toLowerCase().includes('id not found')) {
          alertTitle = "Invalid Information";
          alertText = "The provided information is invalid or not found. Please check your details and try again.";
        } else if (errorMessage.toLowerCase().includes('validation') ||
                   errorMessage.toLowerCase().includes('invalid')) {
          alertTitle = "Validation Error";
          alertText = errorMessage || "Please check all the fields and ensure they are filled correctly.";
        } else if (errorMessage) {
          // Use the actual error message from API if available
          alertText = errorMessage;
        }
        
        Swal.fire({
          title: alertTitle,
          text: alertText,
          icon: "error",
          confirmButtonText: "Ok"
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      
      // Handle specific error cases in catch block
      const errorMessage = error.message || error.response?.data?.message || "";
      let alertTitle = "API Error";
      let alertText = "Something went wrong. Please try again.";
      
      if (errorMessage.toLowerCase().includes('email already exists') || 
          errorMessage.toLowerCase().includes('email already registered')) {
        alertTitle = "Email Already Exists";
        alertText = "This email address is already registered. Please use a different email or try logging in.";
      } else if (errorMessage.toLowerCase().includes('phone number already exists') ||
                 errorMessage.toLowerCase().includes('phone already registered')) {
        alertTitle = "Phone Number Already Exists";
        alertText = "This phone number is already registered. Please use a different phone number or try logging in.";
      } else if (errorMessage.toLowerCase().includes('already exists')) {
        alertTitle = "Account Already Exists";
        alertText = "An account with these details already exists. Please use different information or try logging in.";
      } else if (errorMessage.toLowerCase().includes('not found') ||
                 errorMessage.toLowerCase().includes('does not exist') ||
                 errorMessage.toLowerCase().includes('id not found')) {
        alertTitle = "Invalid Information";
        alertText = "The provided information is invalid or not found. Please check your details and try again.";
      } else if (errorMessage) {
        alertText = errorMessage;
      }
      
      Swal.fire({
        title: alertTitle,
        text: alertText,
        icon: "error",
        confirmButtonText: "Ok"
      });
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${TAILWIND_COLORS.BG_PRIMARY}`}>
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="rounded-2xl bg-white shadow-sm border border-[rgba(0,57,91,0.18)] px-6 md:px-10 py-6 md:py-7 mb-6">
          <h1 className="text-center text-xl md:text-2xl font-semibold text-gray-800">Create your account</h1>
          <div className="mt-4 flex items-center justify-center">
            <div className=" ">
              <Pills
                items={[
                  { key: 'Admin', label: 'Admin', icon: <FaUserShield size={18} /> },
                  { key: 'Recruiter', label: 'Recruiter', icon: <FaBuilding size={18} /> },
                  { key: 'Institute', label: 'Institute', icon: <FaSchool size={18} /> },
                  { key: 'Student', label: 'Student', icon: <FaSchool size={18} /> },
                ]}
                activeKey={role}
                onChange={setRole}
              />
            </div>
          </div>
          {/* </div>

        <div className={`rounded-2xl p-6 md:p-8 ${TAILWIND_COLORS.CARD}`}> */}
          <form onSubmit={onSubmit} className="space-y-4 mt-6">
            {/* Admin Form */}
            {role === 'Admin' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={update('fullName')}
                      required
                      placeholder="Enter your full name"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Official Email*</label>
                    <input
                      type="email"
                      value={form.officialEmail}
                      onChange={update('officialEmail')}
                      required
                      placeholder="Enter your official email"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number*</label>
                    <input
                      type="tel"
                      value={form.mobileNumber}
                      onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      required
                      placeholder="Enter your mobile number"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Photo <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm((f) => ({ ...f, profilePhoto: e.target.files[0] }))}
                    className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">You can add this later from your profile settings</p>
                </div>
                </div>
              </>
            )}

            {/* Recruiter Form */}
            {role === 'Recruiter' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name*</label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={update('companyName')}
                      required
                      placeholder="Enter company name"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Email*</label>
                    <input
                      type="email"
                      value={form.companyEmail}
                      onChange={update('companyEmail')}
                      required
                      placeholder="Enter company email"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Contact Number*</label>
                    <input
                      type="tel"
                      value={form.companyContact}
                      onChange={(e) => setForm((f) => ({ ...f, companyContact: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      required
                      placeholder="Enter company contact number"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry Type*</label>
                    <input
                      type="text"
                      value={form.industryType}
                      onChange={update('industryType')}
                      required
                      placeholder="Enter industry type"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Website / LinkedIn Page*</label>
                  <input
                    type="url"
                    value={form.companyWebsite}
                    onChange={update('companyWebsite')}
                    required
                    placeholder="Enter company website or LinkedIn page"
                    className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Office Address*</label>
                  <textarea
                    value={form.officeAddress}
                    onChange={update('officeAddress')}
                    required
                    placeholder="Enter office address"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 py-2 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Logo <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm((f) => ({ ...f, companyLogo: e.target.files[0] }))}
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">You can add this later from your profile settings</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST / PAN (If Required)</label>
                    <input
                      type="text"
                      value={form.gstPan}
                      onChange={(e) => setForm((f) => ({ ...f, gstPan: e.target.value.toUpperCase().slice(0, 10) }))}
                      placeholder="Enter GST or PAN number"
                      maxLength={10}
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Institute Form */}
            {role === 'Institute' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institute Name*</label>
                    <input
                      type="text"
                      value={form.instituteName}
                      onChange={update('instituteName')}
                      required
                      placeholder="Enter institute name"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institute Email*</label>
                    <input
                      type="email"
                      value={form.instituteEmail}
                      onChange={update('instituteEmail')}
                      required
                      placeholder="Enter institute email"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institute Contact Number*</label>
                    <input
                      type="tel"
                      value={form.instituteContact}
                      onChange={(e) => setForm((f) => ({ ...f, instituteContact: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      required
                      placeholder="Enter institute contact number"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institute Type*</label>
                    <select
                      value={form.instituteType}
                      onChange={update('instituteType')}
                      required
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    >
                      <option value="">Select Institute Type</option>
                      <option value="Private">Private</option>
                      <option value="Public">Public</option>
                      <option value="Government">Government</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number*</label>
                    <input
                      type="text"
                      value={form.registrationNumber}
                      onChange={update('registrationNumber')}
                      required
                      placeholder="Enter registration number (Govt. or Private)"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation / Accreditation Details*</label>
                    <select
                      value={form.affiliationDetails}
                      onChange={update('affiliationDetails')}
                      required
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    >
                      <option value="">Select Affiliation</option>
                      <option value="UGC">UGC</option>
                      <option value="AICTE">AICTE</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principal / Head Name*</label>
                  <input
                    type="text"
                    value={form.principalName}
                    onChange={update('principalName')}
                    required
                    placeholder="Enter principal or head name"
                    className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institute Logo <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm((f) => ({ ...f, instituteLogo: e.target.files[0] }))}
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">You can add this later from your profile settings</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institute Website (If Available)</label>
                    <input
                      type="url"
                      value={form.instituteWebsite}
                      onChange={update('instituteWebsite')}
                      placeholder="Enter institute website"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={form.postalCode}
                      onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value.replace(/\D/g, '').slice(0, 20) }))}
                      placeholder="Enter postal code"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                    <input
                      type="number"
                      value={form.establishedYear}
                      onChange={update('establishedYear')}
                      placeholder="Enter established year"
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institute Address*</label>
                  <textarea
                    value={form.instituteAddress}
                    onChange={update('instituteAddress')}
                    required
                    placeholder="Enter institute address"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institute Description</label>
                  <textarea
                    value={form.instituteDescription}
                    onChange={update('instituteDescription')}
                    placeholder="Enter institute description"
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 py-2 bg-white"
                  />
                </div>
              </>
            )}

            {/* Student Form */}
            {role === 'Student' && (
              <>
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                    <input
                      type="text"
                      value={form.studentFullName}
                      onChange={update('studentFullName')}
                      required
                      placeholder="Enter your full name"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth*</label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={update('dateOfBirth')}
                      required
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
                    <select
                      value={form.gender}
                      onChange={update('gender')}
                      required
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                    <input
                      type="email"
                      value={form.studentEmail}
                      onChange={update('studentEmail')}
                      required
                      placeholder="Enter your email address"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number*</label>
                    <input
                      type="tel"
                      value={form.studentMobileNumber}
                      onChange={(e) => setForm((f) => ({ ...f, studentMobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      required
                      placeholder="Enter your mobile number"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Photo <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm((f) => ({ ...f, studentProfilePhoto: e.target.files[0] }))}
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">You can add this later from your profile settings</p>
                  </div>
                </div>

                {/* Bio and Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio (Optional)</label>
                  <textarea
                    value={form.bio}
                    onChange={update('bio')}
                    placeholder="Tell us about yourself"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address*</label>
                  <textarea
                    value={form.location}
                    onChange={update('location')}
                    required
                    placeholder="Enter your complete address"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 py-2 bg-white"
                  />
                </div>

                {/* Educational Details - Dynamic */}
                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Educational Details</h3>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({
                        ...f,
                        education: [...f.education, { qualification: '', institute: '', start_year: '', end_year: '', is_pursuing: false, pursuing_year: null, cgpa: null }]
                      }))}
                      className="text-sm text-[#5B9821] hover:underline"
                    >
                      + Add More
                    </button>
                  </div>
                  
                  {form.education && form.education.length > 0 && form.education.map((edu, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Qualification*</label>
                      <select
                            value={edu.qualification}
                            onChange={(e) => {
                              const newEducation = [...form.education];
                              newEducation[index].qualification = e.target.value;
                              setForm((f) => ({ ...f, education: newEducation }));
                            }}
                        required
                        className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                      >
                            <option value="">Select Qualification</option>
                        <option value="10th">10th</option>
                        <option value="12th">12th</option>
                        <option value="Graduation">Graduation</option>
                        <option value="Post Graduation">Post Graduation</option>
                      </select>
                    </div>
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Institute Name*</label>
                      <input
                        type="text"
                            value={edu.institute}
                            onChange={(e) => {
                              const newEducation = [...form.education];
                              newEducation[index].institute = e.target.value;
                              setForm((f) => ({ ...f, education: newEducation }));
                            }}
                        required
                            placeholder="Enter institute name"
                        className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                      />
                    </div>
                  </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                      <input
                        type="number"
                            value={edu.start_year}
                            onChange={(e) => {
                              const newEducation = [...form.education];
                              newEducation[index].start_year = e.target.value;
                              setForm((f) => ({ ...f, education: newEducation }));
                            }}
                            placeholder="Start year"
                        min="1990"
                        max="2030"
                        className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                      />
                    </div>
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                      <input
                            type="number"
                            value={edu.end_year}
                            onChange={(e) => {
                              const newEducation = [...form.education];
                              newEducation[index].end_year = e.target.value;
                              setForm((f) => ({ ...f, education: newEducation }));
                            }}
                            placeholder="End year"
                            min="1990"
                            max="2030"
                            disabled={edu.is_pursuing}
                            className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                          <input
                            type="number"
                            step="0.01"
                            value={edu.cgpa || ''}
                            onChange={(e) => {
                              const newEducation = [...form.education];
                              newEducation[index].cgpa = e.target.value ? parseFloat(e.target.value) : null;
                              setForm((f) => ({ ...f, education: newEducation }));
                            }}
                            placeholder="CGPA (e.g., 8.5)"
                        className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                      />
                    </div>
                  </div>
                      <div className="mt-4 flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={edu.is_pursuing}
                            onChange={(e) => {
                              const newEducation = [...form.education];
                              newEducation[index].is_pursuing = e.target.checked;
                              if (e.target.checked) {
                                newEducation[index].pursuing_year = new Date().getFullYear();
                              }
                              setForm((f) => ({ ...f, education: newEducation }));
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Currently Pursuing</span>
                        </label>
                        {form.education.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newEducation = form.education.filter((_, i) => i !== index);
                              setForm((f) => ({ ...f, education: newEducation }));
                            }}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills and Additional Information */}
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Skills & Additional Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills*</label>
                    <input
                      type="text"
                      value={form.skills}
                      onChange={update('skills')}
                      required
                      placeholder="Enter skills separated by commas (e.g., JavaScript, React, Python)"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
                  </div>

                  <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Resume / CV Upload*</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setForm((f) => ({ ...f, resumeCv: e.target.files[0] }))}
                        required
                        className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
                    </div>
                </div>

                {/* Social Links - Dynamic */}
                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Social Links (Optional)</h3>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({
                        ...f,
                        socialLinks: [...f.socialLinks, { title: '', profile_url: '' }]
                      }))}
                      className="text-sm text-[#5B9821] hover:underline"
                    >
                      + Add More
                    </button>
                  </div>
                  
                  {form.socialLinks && form.socialLinks.length > 0 && form.socialLinks.map((link, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title (e.g., LinkedIn, Portfolio)</label>
                      <input
                        type="text"
                            value={link.title}
                            onChange={(e) => {
                              const newLinks = [...form.socialLinks];
                              newLinks[index].title = e.target.value;
                              setForm((f) => ({ ...f, socialLinks: newLinks }));
                            }}
                            placeholder="Enter title"
                        className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                      />
                    </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Profile URL</label>
                          <input
                            type="url"
                            value={link.profile_url}
                            onChange={(e) => {
                              const newLinks = [...form.socialLinks];
                              newLinks[index].profile_url = e.target.value;
                              setForm((f) => ({ ...f, socialLinks: newLinks }));
                            }}
                            placeholder="Enter profile URL"
                            className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                          />
                        </div>
                      </div>
                      {form.socialLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newLinks = form.socialLinks.filter((_, i) => i !== index);
                            setForm((f) => ({ ...f, socialLinks: newLinks }));
                          }}
                          className="mt-2 text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  </div>

                {/* Experience - Dynamic */}
                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Work Experience (Optional)</h3>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({
                        ...f,
                        experience: [...f.experience, { company: '', position: '', start_date: '', end_date: '', is_current: false, description: '' }]
                      }))}
                      className="text-sm text-[#5B9821] hover:underline"
                    >
                      + Add More
                    </button>
                  </div>
                  
                  {form.experience && form.experience.length > 0 && form.experience.map((exp, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const newExp = [...form.experience];
                              newExp[index].company = e.target.value;
                              setForm((f) => ({ ...f, experience: newExp }));
                            }}
                            placeholder="Enter company name"
                            className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => {
                              const newExp = [...form.experience];
                              newExp[index].position = e.target.value;
                              setForm((f) => ({ ...f, experience: newExp }));
                            }}
                            placeholder="Enter position"
                            className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={exp.start_date}
                            onChange={(e) => {
                              const newExp = [...form.experience];
                              newExp[index].start_date = e.target.value;
                              setForm((f) => ({ ...f, experience: newExp }));
                            }}
                            className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            value={exp.end_date}
                            onChange={(e) => {
                              const newExp = [...form.experience];
                              newExp[index].end_date = e.target.value;
                              setForm((f) => ({ ...f, experience: newExp }));
                            }}
                            disabled={exp.is_current}
                            className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                  <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => {
                            const newExp = [...form.experience];
                            newExp[index].description = e.target.value;
                            setForm((f) => ({ ...f, experience: newExp }));
                          }}
                          placeholder="Enter job description"
                          rows={2}
                          className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 py-2 bg-white"
                        />
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={exp.is_current}
                            onChange={(e) => {
                              const newExp = [...form.experience];
                              newExp[index].is_current = e.target.checked;
                              setForm((f) => ({ ...f, experience: newExp }));
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Currently Working</span>
                        </label>
                        {form.experience.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newExp = form.experience.filter((_, i) => i !== index);
                              setForm((f) => ({ ...f, experience: newExp }));
                            }}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Projects - Dynamic */}
                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Projects (Optional)</h3>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({
                        ...f,
                        projects: [...f.projects, { name: '', description: '', technologies: '', link: '' }]
                      }))}
                      className="text-sm text-[#5B9821] hover:underline"
                    >
                      + Add More
                    </button>
                  </div>
                  
                  {form.projects && form.projects.length > 0 && form.projects.map((proj, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                          <input
                            type="text"
                            value={proj.name}
                            onChange={(e) => {
                              const newProjects = [...form.projects];
                              newProjects[index].name = e.target.value;
                              setForm((f) => ({ ...f, projects: newProjects }));
                            }}
                            placeholder="Enter project name"
                            className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                          <input
                            type="text"
                            value={proj.technologies}
                            onChange={(e) => {
                              const newProjects = [...form.projects];
                              newProjects[index].technologies = e.target.value;
                              setForm((f) => ({ ...f, projects: newProjects }));
                            }}
                            placeholder="Enter technologies used"
                            className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={proj.description}
                          onChange={(e) => {
                            const newProjects = [...form.projects];
                            newProjects[index].description = e.target.value;
                            setForm((f) => ({ ...f, projects: newProjects }));
                          }}
                          placeholder="Enter project description"
                          rows={2}
                          className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 py-2 bg-white"
                        />
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Link (Optional)</label>
                    <input
                      type="url"
                          value={proj.link}
                          onChange={(e) => {
                            const newProjects = [...form.projects];
                            newProjects[index].link = e.target.value;
                            setForm((f) => ({ ...f, projects: newProjects }));
                          }}
                          placeholder="Enter project URL"
                      className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                    />
                  </div>
                      {form.projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newProjects = form.projects.filter((_, i) => i !== index);
                            setForm((f) => ({ ...f, projects: newProjects }));
                          }}
                          className="mt-2 text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={update('password')}
                    required
                    placeholder="Enter your password"
                    className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 pr-10 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5B9821] focus:outline-none"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password*</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    required
                    placeholder="Confirm your password"
                    className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 pr-10 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5B9821] focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600 pt-1">
              <input id="terms" type="checkbox" className="w-4 h-4" required />
              <label htmlFor="terms">By clicking checkbox, you agree to our <a className="text-[#5B9821] hover:underline" href="#">Terms and Conditions</a> and Privacy Policy</label>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full h-11 rounded-lg font-medium ${TAILWIND_COLORS.BTN_PRIMARY} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {loadingText}
                  </span>
                ) : (
                  'SIGN UP'
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-gray-600">Already have an account?</span>
              <a href="/login" className="text-[#5B9821] hover:underline">Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


