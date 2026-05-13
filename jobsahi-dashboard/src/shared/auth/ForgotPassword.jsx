import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { COLORS, TAILWIND_COLORS } from '../WebConstant'
import { LuPhone, LuMail, LuLock, LuEye, LuEyeOff } from 'react-icons/lu'
import { postMethod } from '../../service/api'
import { getMethod } from '../../service/api'
import { putMethod } from '../../service/api'
import apiService from '../../shared/services/serviceUrl'

function AuthTabs({ mode, setMode }) {
  const items = [
    { key: 'OTP', label: 'OTP Reset', icon: <LuPhone size={18} /> },
    { key: 'EMAIL', label: 'Email Reset', icon: <LuMail size={18} /> },
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

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('OTP') // 'OTP' | 'EMAIL'
  const [step, setStep] = useState('input') // 'input' | 'otp' | 'new-password'
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otpValues, setOtpValues] = useState(['', '', '', ''])
  //const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState('')

  const isEmail = mode === 'EMAIL'

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otpValues]
    next[index] = value
    setOtpValues(next)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (step === 'input') {
        // Send OTP/Reset link

        if (isEmail) {
          console.log('send-reset-email', { email })
          var data = {
            apiUrl: apiService.forgotPassword,
            payload: {
              email: email,
              purpose: 'password_reset'
            },
          };

          var response = await postMethod(data);
          console.log(response);

          if (response.status === true) {
            Swal.fire({
              title: "Success",
              text: response.message || "OTP sent successfully for password reset",
              icon: "success"
            });
            setStep('otp')
            setUserId(response.user_id)
          } else {
            Swal.fire({
              title: "Failed",
              text: response.message || "Failed to send OTP email",
              icon: "error"
            });
          }

        } else {
          console.log('send-reset-otp', { phone })
        }

      } else if (step === 'otp') {
        // Verify OTP
        const code = otpValues.join('')
        if (code.length === 4) {
          console.log('verify-otp', {
            [isEmail ? 'email' : 'phone']: isEmail ? email : phone,
            code
          })

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
            Swal.fire({
              title: "Success",
              text: response.message || "OTP verified successfully",
              icon: "success"
            });
            setStep('new-password')
          } else {
            Swal.fire({
              title: "Failed",
              text: response.message || "Invalid OTP or Purpose. Please check and try again",
              icon: "error"
            });
          }
        }
      } else if (step === 'new-password') {
        // Reset password
        if (newPassword === confirmPassword) {
          console.log('reset-password', {
            [isEmail ? 'email' : 'phone']: isEmail ? email : phone,
            newPassword
          })

          var data = {
            apiUrl: apiService.changePassword,
            payload: {
              user_id: userId,
              new_password: newPassword
            },
          };

          var response = await postMethod(data);
          console.log(response);

          if (response.status === true) {
            Swal.fire({
              title: "Success",
              text: response.message || "Password reset successfully! Please login with your new password.",
              confirmButtonText: "Ok",
              icon: "success"
            }).then((result) => {
              /* Read more about isConfirmed */
              if (result.isConfirmed) {
                navigate('/login')
              }

            });

          } else {
            Swal.fire({
              title: "Failed",
              text: response.message || 'Failed to update password',
              icon: "error"
            });
          }
        } else {
          //alert('Passwords do not match!')
          Swal.fire({
            title: "Failed",
            text: "Passwords do not match!",
            icon: "error"
          });
        }
      }
    } catch (error) {
      // console.error('Reset password error:', error)
      // alert('Something went wrong. Please try again.')
      Swal.fire({
        title: "Failed",
        text: "Something went wrong. Please try again.",
        icon: "error"
      });
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async (e) => {
    e.preventDefault()
    console.log('resend-otp', { [isEmail ? 'email' : 'phone']: isEmail ? email : phone })
    setOtpValues(['', '', '', ''])

    try {
      var data = {
        apiUrl: apiService.resendOtp,
        payload: {
          email: email,
          purpose: 'password_reset'
        },
      };

      var response = await postMethod(data);
      console.log(response);

      if (response.status === true) {
        Swal.fire({
          title: "Success",
          text: response.message || "New OTP sent successfully",
          icon: "success"
        });
        setStep('otp')
        setUserId(response.user_id)
      } else {
        Swal.fire({
          title: "Failed",
          text: response.message || "Failed to send OTP email",
          icon: "error"
        });
      }
    } catch (error) {
      // console.error('Reset password error:', error)
      // alert('Something went wrong. Please try again.')
      Swal.fire({
        title: "Failed",
        text: "Something went wrong. Please try again.",
        icon: "error"
      });
    }
  }

  const goBack = () => {
    if (step === 'otp') {
      setStep('input')
    } else if (step === 'new-password') {
      setStep('otp')
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 'input':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEmail ? 'Email Address:' : 'Phone Number:'}
              </label>
              <input
                type={isEmail ? 'email' : 'tel'}
                value={isEmail ? email : phone}
                onChange={(e) => {
                  if (isEmail) {
                    setEmail(e.target.value)
                  } else {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                }}
                required
                placeholder={isEmail ? 'Enter Email Address' : 'Enter your phone number'}
                className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 bg-white"
              />
            </div>
            <div className="text-center text-sm text-gray-600">
              {isEmail
                ? 'We\'ll send you a password reset link via email'
                : 'We\'ll send you a verification code via SMS'
              }
            </div>
          </>
        )

      case 'otp':
        return (
          <>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Enter Verification Code</h3>
              <p className="text-sm text-gray-600 mb-6">
                We've sent a 4-digit code to{' '}
                <span className="font-medium text-[#5B9821]">
                  {isEmail ? email : `+91 ${phone}`}
                </span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-16 h-16 rounded-xl bg-gray-100 text-center text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B9821] border border-gray-200"
                />
              ))}
            </div>

            <div className="text-center text-sm text-gray-600">
              Didn't receive code?{' '}
              <button
                type="button"
                className="text-[#5B9821] hover:underline font-medium"
                onClick={handleResendOtp}
              >
                Resend
              </button>
            </div>
          </>
        )

      case 'new-password':
        return (
          <>
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Create New Password</h3>
              <p className="text-sm text-gray-600">
                Please enter your new password below
              </p>
            </div>

            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 pr-10 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    className="w-full h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B9821] px-3 pr-10 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

  const getButtonText = () => {
    if (isLoading) return 'Processing...'

    switch (step) {
      case 'input':
        return isEmail ? 'SEND RESET LINK' : 'SEND OTP'
      case 'otp':
        return 'VERIFY CODE'
      case 'new-password':
        return 'RESET PASSWORD'
      default:
        return 'SUBMIT'
    }
  }

  return (
    <div className={`mt-10 flex items-center justify-center px-4 py-8 ${TAILWIND_COLORS.BG_PRIMARY}`}>
      <div className="w-full max-w-md">
        {/* Header card */}
        <div className="rounded-2xl bg-white shadow-sm border border-[rgba(0,57,91,0.18)] px-6 md:px-10 py-6 md:py-7 mb-6">
          <div className="flex items-center justify-between mb-4">
            {step !== 'input' && (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
            <h1 className={`text-center text-xl md:text-2xl font-semibold text-gray-800 ${step !== 'input' ? 'flex-1' : ''}`}>
              {step === 'input' ? 'Reset Password' : step === 'otp' ? 'Verify Code' : 'New Password'}
            </h1>
            {step !== 'input' && <div className="w-8"></div>}
          </div>

          {step === 'input' && (
            <div className="flex items-center justify-center">
              <AuthTabs mode={mode} setMode={setMode} />
            </div>
          )}
        </div>

        {/* Form card */}
        <div className={`rounded-2xl p-6 md:p-8 ${TAILWIND_COLORS.CARD}`}>
          <form onSubmit={onSubmit} className="space-y-4">
            {renderStepContent()}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || (step === 'otp' && otpValues.join('').length !== 4)}
                className={`w-full h-11 rounded-lg font-medium ${TAILWIND_COLORS.BTN_PRIMARY} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {getButtonText()}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Remember your password?{' '}
              <a href="/login" className="text-[#5B9821] hover:underline font-medium">
                Back to Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
