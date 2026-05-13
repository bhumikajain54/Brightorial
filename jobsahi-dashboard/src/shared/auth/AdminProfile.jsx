import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { LuLock, LuEye, LuEyeOff } from 'react-icons/lu'
import { TAILWIND_COLORS, COLORS } from '../WebConstant'
import { postMethod } from '../../service/api'
import { getMethod } from '../../service/api'
import { putMethod } from '../../service/api'
import apiService from '../../shared/services/serviceUrl'
import { Button } from '../components/Button'
import LogoutConfirmationModal from '../components/LogoutConfirmationModal'

export default function AdminProfile() {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  var authUser = localStorage.getItem("authUser")
  var user = JSON.parse(authUser);
  const navigate = useNavigate()

  const onLogout = async () => {
    localStorage.clear();
    navigate('/login')
    console.log('Logging out...')

  }
  const [profile, setProfile] = useState({
    name: user.user_name,
    email: user.email,
    phone: user.phone_number,
    role: user.role,
  })
  const [phoneError, setPhoneError] = useState('')

  // Change Password State
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({})

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Add logout logic here (clear tokens, call logout API, etc.)
      console.log('Logging out...')

      var data = {
        apiUrl: apiService.logout,
        payload: {
          uid: user.id
        },

      };

      var response = await postMethod(data);

      // Simulate logout process
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (response.status === true) {
        setShowLogoutModal(true)
        navigate('/login')
        localStorage.clear();
        localStorage.removeItem("authToken");
        localStorage.removeItem("authExpiry");
        localStorage.removeItem("authUser");

      } else {
        console.error("Logout Failed:", response)
        alert(response.message || "Logout Failed")
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Handle logout error if needed
    } finally {
      setIsLoggingOut(false)
    }
  }

  const closeLogoutModal = () => {
    setShowLogoutModal(false)
  }

  const onChangeField = (key) => (e) => {
    let value = e.target.value
    if (key === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10)
      if (value.length !== 10) {
        setPhoneError('Enter a valid 10-digit phone number')
      } else {
        setPhoneError('')
      }
    }
    setProfile((p) => ({ ...p, [key]: value }))
  }

  const onSave = async (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(profile.phone)) {
      setPhoneError('Enter a valid 10-digit phone number')
      return
    }
    // eslint-disable-next-line no-console
    console.log('save-profile', profile)
    try {
      var data = {
        apiUrl: apiService.updateUser,
        payload: {
          uid: user.id,
          uname: profile.name,
          uemail: profile.email,
          //upassword: "password123",
          urole: profile.role,
          uphone: profile.phone,
          uverified: user.is_verified
        },
      };

      var response = await postMethod(data);
      console.log(response);

      if (response.status === true) {
        // Update localStorage for real-time name update
        const authUser = localStorage.getItem("authUser")
        if (authUser) {
          const userObj = JSON.parse(authUser)
          userObj.user_name = profile.name
          localStorage.setItem("authUser", JSON.stringify(userObj))
          
          // Dispatch custom event for real-time header update
          window.dispatchEvent(new CustomEvent('profileUpdated'))
        }

        Swal.fire({
          title: "Success",
          text: response.message || "User updated successfully!",
          icon: "success"
        });


      } else {
        // console.error("Failed to update user:", response)
        // alert(response.message || "Failed to update user")
        Swal.fire({
          title: "Failed",
          text: response.message || "Failed to update user",
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 grid place-items-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-gray-600">
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 22a8 8 0 1116 0" />
          </svg>
        </div>
        <div>
          <h1 className={`text-2xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} Profile</h1>
          <div className="text-sm text-gray-500">Manage your profile and account settings</div>
        </div>
      </div>

      <div className={`${TAILWIND_COLORS.CARD} p-4`}>
        <div className="font-medium mb-3">Profile Information</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Full Name</label>
            <input className="w-full h-11 rounded-lg border border-gray-300 px-3 bg-white" value={profile.name} onChange={onChangeField('name')} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input className="w-full h-11 rounded-lg border border-gray-300 px-3 bg-white" value={profile.email} onChange={onChangeField('email')} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input
              className={`w-full h-11 rounded-lg px-3 bg-white border ${phoneError ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-[#5B9821]'}`}
              value={profile.phone}
              onChange={onChangeField('phone')}
              inputMode="numeric"
              placeholder="Enter 10-digit phone"
            />
            {phoneError ? <div className="mt-1 text-xs text-red-600">{phoneError}</div> : null}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Role</label>
            <input className="w-full h-11 rounded-lg border border-gray-300 px-3 bg-gray-50" readOnly value={profile.role} />
          </div>
        </div>
        <div className="mt-4">
          <button onClick={onSave} className={`px-4 py-2 rounded-lg ${TAILWIND_COLORS.BTN_PRIMARY}`}>Save Changes</button>
        </div>
      </div>

      {/* Change Password Section */}
      <div className={`${TAILWIND_COLORS.CARD} p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <LuLock className={`${TAILWIND_COLORS.SECONDARY}`} size={20} />
          <h3 className={`font-semibold text-lg ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Change Password
          </h3>
        </div>
        <p className={`text-sm mb-6 ${TAILWIND_COLORS.TEXT_MUTED}`}>
          Update your account password to keep your account secure.
        </p>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className={`text-sm font-medium mb-2 block ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.current_password}
                onChange={(e) => {
                  setPasswordData(prev => ({ ...prev, current_password: e.target.value }));
                  if (passwordErrors.current_password) {
                    setPasswordErrors(prev => ({ ...prev, current_password: "" }));
                  }
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 pr-10 ${
                  passwordErrors.current_password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                {showPasswords.current ? <LuEyeOff size={18} /> : <LuEye size={18} />}
              </button>
            </div>
            {passwordErrors.current_password && (
              <p className="text-red-500 text-xs mt-1">{passwordErrors.current_password}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className={`text-sm font-medium mb-2 block ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.new_password}
                onChange={(e) => {
                  setPasswordData(prev => ({ ...prev, new_password: e.target.value }));
                  if (passwordErrors.new_password) {
                    setPasswordErrors(prev => ({ ...prev, new_password: "" }));
                  }
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 pr-10 ${
                  passwordErrors.new_password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter new password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                {showPasswords.new ? <LuEyeOff size={18} /> : <LuEye size={18} />}
              </button>
            </div>
            {passwordErrors.new_password && (
              <p className="text-red-500 text-xs mt-1">{passwordErrors.new_password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className={`text-sm font-medium mb-2 block ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirm_password}
                onChange={(e) => {
                  setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }));
                  if (passwordErrors.confirm_password) {
                    setPasswordErrors(prev => ({ ...prev, confirm_password: "" }));
                  }
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 pr-10 ${
                  passwordErrors.confirm_password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                {showPasswords.confirm ? <LuEyeOff size={18} /> : <LuEye size={18} />}
              </button>
            </div>
            {passwordErrors.confirm_password && (
              <p className="text-red-500 text-xs mt-1">{passwordErrors.confirm_password}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            variant="primary"
            onClick={async () => {
              // Validate form
              const errors = {};
              if (!passwordData.current_password.trim()) {
                errors.current_password = "Current password is required";
              }
              if (!passwordData.new_password.trim()) {
                errors.new_password = "New password is required";
              } else if (passwordData.new_password.length < 6) {
                errors.new_password = "Password must be at least 6 characters";
              }
              if (!passwordData.confirm_password.trim()) {
                errors.confirm_password = "Please confirm your new password";
              } else if (passwordData.new_password !== passwordData.confirm_password) {
                errors.confirm_password = "Passwords do not match";
              }
              if (passwordData.current_password === passwordData.new_password) {
                errors.new_password = "New password must be different from current password";
              }

              setPasswordErrors(errors);
              if (Object.keys(errors).length > 0) return;

              try {
                setIsChangingPassword(true);
                const authUser = localStorage.getItem("authUser");
                if (!authUser) {
                  Swal.fire({
                    title: "Error",
                    text: "User information not found. Please login again.",
                    icon: "error",
                    confirmButtonColor: '#d33'
                  });
                  return;
                }

                const userObj = JSON.parse(authUser);
                const userId = userObj.id || userObj.user_id || userObj.uid;

                if (!userId) {
                  Swal.fire({
                    title: "Error",
                    text: "User ID not found. Please login again.",
                    icon: "error",
                    confirmButtonColor: '#d33'
                  });
                  return;
                }

                const payload = {
                  user_id: userId,
                  current_password: passwordData.current_password.trim(),
                  new_password: passwordData.new_password.trim()
                };

                const response = await putMethod({
                  apiUrl: apiService.changePassword,
                  payload: payload
                });

                const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true;

                if (isSuccess) {
                  Swal.fire({
                    title: "Success!",
                    text: response?.message || "Password changed successfully!",
                    icon: "success",
                    confirmButtonColor: '#5C9A24'
                  }).then(() => {
                    setPasswordData({
                      current_password: "",
                      new_password: "",
                      confirm_password: ""
                    });
                    setPasswordErrors({});
                  });
                } else {
                  const errorMessage = response?.message || response?.error || "Failed to change password. Please try again.";
                  Swal.fire({
                    title: "Error",
                    text: errorMessage,
                    icon: "error",
                    confirmButtonColor: '#d33'
                  });
                }
              } catch (error) {
                Swal.fire({
                  title: "Error",
                  text: error?.message || "Something went wrong. Please try again.",
                  icon: "error",
                  confirmButtonColor: '#d33'
                });
              } finally {
                setIsChangingPassword(false);
              }
            }}
            disabled={isChangingPassword}
            className="min-w-[150px]"
          >
            {isChangingPassword ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
        userName={profile.name}
        isLoading={isLoggingOut}
      />
    </div>
  )
}


