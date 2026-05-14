import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { COLORS, TAILWIND_COLORS } from '../WebConstant'
import { LuPhone, LuMail } from 'react-icons/lu'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { postMethod, putMethod, putMultipart } from '../../service/api'
import { getMethod } from '../../service/api'
import apiService from '../../shared/services/serviceUrl'


function AuthTabs({ mode, setMode }) {
  const items = [
    { key: 'OTP', label: 'OTP Login', icon: <LuPhone size={18} /> },
    { key: 'EMAIL', label: 'Email Login', icon: <LuMail size={18} /> },
  ]

  return (
    <div
      className=" rounded-full p-1 flex justify-between items-center gap-2 overflow-x-auto"
      style={{ backgroundColor: '#F7FBFF', border: '1px solid rgba(11,83,125,0.15)' }}
    >
      {items.map((item) => {
        const isActive = mode === item.key
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => setMode(item.key)}
            className="flex items-center gap-2 rounded-full px-2 py-2 whitespace-nowrap"
            style={
              isActive
                ? { backgroundColor: COLORS.GREEN_PRIMARY, color: 'white' }
                : { backgroundColor: 'white', color: COLORS.GREEN_PRIMARY, border: '1px solid rgba(11,83,125,0.15)' }
            }
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={
                isActive
                  ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }
                  : { backgroundColor: 'rgba(92,154,36,0.15)', color: COLORS.GREEN_PRIMARY }
              }
              aria-hidden
            >
              {item.icon}
            </span>
            <span className="text-sm font-medium me-10">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  
  // Redirect if admin is impersonating (shouldn't see login page)
  React.useEffect(() => {
    const isAdminImpersonating = localStorage.getItem("isAdminImpersonating") === "true";
    const authUser = localStorage.getItem("authUser");
    
    if (isAdminImpersonating && authUser) {
      try {
        const user = JSON.parse(authUser);
        if (user.role === "recruiter") {
          navigate("/recruiter/dashboard");
        } else if (user.role === "institute") {
          navigate("/institute/dashboard");
        }
      } catch (e) {
        // Invalid user data, continue with login
      }
    }
  }, [navigate]);
  const [mode, setMode] = useState('OTP') // 'OTP' | 'EMAIL'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpValues, setOtpValues] = useState(['', '', '', ''])
  const [showPassword, setShowPassword] = useState(false)
  const [userId, setUserId] = useState('')

  const isEmail = mode === 'EMAIL'

  // Function to update profile after login
  const updateProfileAfterLogin = async (profileData, userRole) => {
    try {
      if (profileData.role.toLowerCase() !== userRole.toLowerCase()) {
        console.warn('Profile role mismatch, skipping update');
        return;
      }

      if (profileData.role === 'Recruiter') {
        const payload = {
          company_name: profileData.company_name,
          industry: profileData.industry,
          website: profileData.website,
          location: profileData.location
        };

        if (profileData.hasLogo && profileData.logoBase64) {
          // Convert base64 to File
          const byteString = atob(profileData.logoBase64.split(',')[1]);
          const mimeString = profileData.logoBase64.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const file = new File([blob], profileData.logoFileName, { type: mimeString });

          const formData = new FormData();
          Object.entries(payload).forEach(([key, val]) => {
            if (val !== null && val !== undefined && val !== '') {
              formData.append(key, val);
            }
          });
          formData.append('company_logo', file);

          await putMultipart({
            apiUrl: apiService.updateRecruiterProfile,
            data: formData
          });
        } else {
          await putMethod({
            apiUrl: apiService.updateRecruiterProfile,
            payload
          });
        }

      } else if (profileData.role === 'Institute') {
        const payload = {
          institute_name: profileData.institute_name,
          institute_type: profileData.institute_type,
          website: profileData.website,
          description: profileData.description,
          address: profileData.address,
          contact_person: profileData.contact_person,
          contact_designation: profileData.contact_designation,
          accreditation: profileData.accreditation,
          courses_offered: profileData.courses_offered
        };

        if (profileData.hasLogo && profileData.logoBase64) {
          const byteString = atob(profileData.logoBase64.split(',')[1]);
          const mimeString = profileData.logoBase64.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const file = new File([blob], profileData.logoFileName, { type: mimeString });

          const formData = new FormData();
          Object.entries(payload).forEach(([key, val]) => {
            if (val !== null && val !== undefined && val !== '') {
              formData.append(key, val);
            }
          });
          formData.append('institute_logo', file);

          await putMultipart({
            apiUrl: apiService.updateInstituteProfile,
            data: formData
          });
        } else {
          await putMethod({
            apiUrl: apiService.updateInstituteProfile,
            payload
          });
        }

      } else if (profileData.role === 'Student') {
        const payload = {
          bio: profileData.bio,
          dob: profileData.dob,
          gender: profileData.gender,
          location: profileData.location,
          skills: profileData.skills,
          education: profileData.education,
          graduation_year: profileData.graduation_year,
          cgpa: profileData.cgpa,
          linkedin_url: profileData.linkedin_url,
          portfolio_link: profileData.portfolio_link,
          trade: profileData.trade
        };

        if (profileData.hasResume || profileData.hasProfilePhoto) {
          const formData = new FormData();
          Object.entries(payload).forEach(([key, val]) => {
            if (val !== null && val !== undefined && val !== '') {
              formData.append(key, val);
            }
          });

          if (profileData.hasResume && profileData.resumeBase64) {
            const byteString = atob(profileData.resumeBase64.split(',')[1]);
            const mimeString = profileData.resumeBase64.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            const file = new File([blob], profileData.resumeFileName, { type: mimeString });
            formData.append('resume', file);
          }

          if (profileData.hasProfilePhoto && profileData.profilePhotoBase64) {
            const byteString = atob(profileData.profilePhotoBase64.split(',')[1]);
            const mimeString = profileData.profilePhotoBase64.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            const file = new File([blob], profileData.profilePhotoFileName, { type: mimeString });
            formData.append('profile_photo', file);
          }

          await putMultipart({
            apiUrl: apiService.updateStudentProfile,
            data: formData
          });
        } else {
          await putMethod({
            apiUrl: apiService.updateStudentProfile,
            payload
          });
        }
      }

      console.log('Profile updated successfully after login');
    } catch (error) {
      console.error('Error updating profile after login:', error);
      throw error;
    }
  };

  // Check for pending registration on component mount
  React.useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    if (pendingEmail) {
      // Pre-fill email field
      setEmail(pendingEmail);
      // Clear the pending email (no popup needed - already shown in CreateAccount)
      localStorage.removeItem('pendingVerificationEmail');
    }
  }, [])

  //const baseURL = process.env.REACT_APP_BASEURL;

  const onSubmit = async (e) => {
    e.preventDefault()
    // Placeholder submit. Hook up to auth later.
    if (isEmail) {
      // eslint-disable-next-line no-console
      //console.log('login/email', { email, password })
      try {

        var data = {
          apiUrl: apiService.signin,
          payload: {
            email,
            password,
          },
        };

        var response = await postMethod(data);
        console.log(response);

        if (response.status === true) {
          // Clear old user-specific storage before login to prevent conflicts
          try {
            const oldKeys = [
              'job_drafts',
              'skillTestQuestions',
              'institute_course_detail_id',
            ];
            oldKeys.forEach(key => {
              // Remove old non-user-specific keys
              localStorage.removeItem(key);
              // Also remove any user-specific keys from previous session
              for (let i = localStorage.length - 1; i >= 0; i--) {
                const storedKey = localStorage.key(i);
                if (storedKey && storedKey.startsWith(key + '_')) {
                  localStorage.removeItem(storedKey);
                }
              }
            });
          } catch (error) {
            console.error('Error clearing old storage:', error);
          }
          
          // Save token + expiry
          localStorage.setItem("authToken", response.token)
          localStorage.setItem("authExpiry", response.expires_in)
          localStorage.setItem("authUser", JSON.stringify(response.user))

          // Check if there's pending profile update data
          const pendingProfileData = localStorage.getItem('pendingProfileUpdate');
          
          if (pendingProfileData) {
            try {
              const profileData = JSON.parse(pendingProfileData);
              
              // Update profile automatically after login
              await updateProfileAfterLogin(profileData, response.user.role);
              
              // Remove pending profile data after successful update
              localStorage.removeItem('pendingProfileUpdate');
            } catch (profileError) {
              console.error('Profile update error after login:', profileError);
              // Continue with login even if profile update fails
            }
          }

          // alert(response.message || "Login successful!")
          Swal.fire({
            title: "Success",
            text: "Login successful!",
            confirmButtonText: "Ok",
            icon: "success"
          }).then((result) => {
            /* Read more about isConfirmed */
            if (result.isConfirmed) {
              if (response.user.role === "recruiter") {
                navigate("/recruiter/dashboard")
              } else if (response.user.role === "institute") {
                navigate("/institute/dashboard")
              } else if (response.user.role === "student") {
                navigate("/student/dashboard")
              } else {
                navigate("/admin/dashboard")
              }
            }

          });
        } else {
          // console.error("Login Failed:", response)
          // alert(response.message || "Invalid email or password")
          Swal.fire({
            title: "Login Failed",
            text: response.message || "Invalid email or password",
            icon: "error"
          });
        }
      } catch (error) {
        // console.error("API Error:", error)
        // alert("Something went wrong. Please try again.")
        Swal.fire({
          title: "API Error",
          text: "Something went wrong. Please try again.",
          icon: "error"
        });
      }
    } else {
      // For OTP flow, open verification modal
      try {
        var data = {
          apiUrl: apiService.phoneLogin,
          payload: {
            phone_number: phone,
          },
        };

        var response = await postMethod(data);
        console.log(response);
        if (response.status === true) {
          setUserId(response.user_id);
          setShowOtpModal(true)
        } else {
          Swal.fire({
            title: "Failed",
            text: response.message || "Failed to generate OTP",
            icon: "error"
          });
        }
      } catch (error) {
        // console.error("API Error:", error)
        // alert("Something went wrong. Please try again.")
        Swal.fire({
          title: "API Error",
          text: "Something went wrong. Please try again.",
          icon: "error"
        });
      }
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otpValues]
    next[index] = value
    setOtpValues(next)
    const nextInput = document.getElementById(`otp-input-${index + 1}`)
    if (value && nextInput) nextInput.focus()
  }

  const handleOtpConfirm = async (e) => {
    e.preventDefault()
    const code = otpValues.join('')
    // eslint-disable-next-line no-console
    console.log('confirm-otp', { phone, code })
    try {
      var data = {
        apiUrl: apiService.verifyOtp,
        payload: {
          user_id: userId,
          otp: code
        },
      };

      var response = await postMethod(data);
      console.log(response);
      if (response.status === true) {
        // Close modal for now
        setShowOtpModal(false)
      } else {
        Swal.fire({
          title: "Failed",
          text: response.message || "Invalid OTP or Purpose. Please check and try again",
          icon: "error"
        });
      }
    } catch (error) {
      // console.error("API Error:", error)
      // alert("Something went wrong. Please try again.")
      Swal.fire({
        title: "API Error",
        text: "Something went wrong. Please try again.",
        icon: "error"
      });
    }
  }

  return (
    <div className={`mt-10 flex items-center justify-center px-4 py-8 ${TAILWIND_COLORS.BG_PRIMARY}`}>
      <div className="w-full max-w-3xl">
        {/* Header card */}
        <div className="rounded-2xl bg-white shadow-sm border border-[rgba(0,57,91,0.18)] px-6 md:px-10 py-6 md:py-7 mb-6">
          <h1 className="text-center text-xl md:text-2xl font-semibold text-gray-800">
            Login to your Account
          </h1>
          {/* Pills control */}
          <div className="mt-4 flex items-center justify-center">
            <AuthTabs mode={mode} setMode={setMode} />
          </div>
          {/* </div>

        <div className={`rounded-2xl p-6 md:p-8 ${TAILWIND_COLORS.CARD}`}> */}
          <form onSubmit={onSubmit} className="space-y-4">
            {isEmail ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter Email Address:"
                    className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                  placeholder="Enter your phone number"
                  className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm">
              <a href="/forgot-password" className="text-[#5B9821] hover:underline">Forgot Password?</a>
              <span className="text-gray-400">or</span>
              <a href="/create-account" className="text-[#5B9821] hover:underline">Create new Account</a>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full h-11 rounded-lg font-medium ${TAILWIND_COLORS.BTN_PRIMARY}`}
              >
                {isEmail ? 'LOGIN' : 'SEND OTP'}
              </button>
            </div>

            <div className="text-center text-xs text-gray-500 mt-2">Or Continue With</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Google */}
              <button
                type="button"
                className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white h-12 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.602 32.091 29.221 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 5.108 28.999 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z" />
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.655 16.095 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 5.108 28.999 3 24 3 16.318 3 9.656 7.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 43c5.166 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.164 34.091 26.72 35 24 35c-5.202 0-9.571-2.886-11.289-7.045l-6.5 5.02C9.485 38.556 16.227 43 24 43z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.093 3.008-3.386 5.421-6.084 6.566l.001-.001 6.191 5.238C33.164 40.355 44 34 44 23c0-1.341-.138-2.651-.389-3.917z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">continue with Google</span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white h-12 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-6 h-6 fill-[#0A66C2]"><path d="M100.28 448H7.4V148.9h92.88zm-46.44-340C24.29 108 0 83.5 0 53.64A53.64 53.64 0 0 1 53.83 0C83.5 0 108 24.29 108 53.64S83.5 108 53.83 108zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.7 37.7-55.7 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z" /></svg>
                <span className="text-sm font-medium text-gray-700">continue with Linkedin</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {!isEmail && showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-[rgba(0,57,91,0.18)]">
            <button
              aria-label="Close"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowOtpModal(false)}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
            </button>
            <h2 className="text-2xl font-semibold text-center text-gray-800">Verification</h2>
            <p className="text-center text-gray-500 mt-1">Enter the 4–digit verification code that was sent to your SMS.</p>

            <div className="mt-6 flex items-center justify-center gap-4">
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value.replace(/\D/g, ''))}
                  className="w-16 h-16 rounded-xl bg-gray-100 text-center text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B9821]"
                />
              ))}
            </div>

            <div className="mt-6">
              <button onClick={handleOtpConfirm} className={`w-full h-11 rounded-lg font-medium ${TAILWIND_COLORS.BTN_PRIMARY}`}>
                CONFIRM
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600">
              Didn’t receive code? <button className="text-[#5B9821] hover:underline" type="button" onClick={() => {/* eslint-disable-next-line no-console */ console.log('resend-otp', { phone }) }}>Resend</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


