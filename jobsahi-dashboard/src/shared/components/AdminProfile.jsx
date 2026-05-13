import React from 'react'
import { TAILWIND_COLORS } from '../WebConstant'

export default function AdminProfile() {
  return (
    <div className="space-y-4 max-w-xl">
      <h1 className={`text-2xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Admin Profile</h1>
      <div className={`${TAILWIND_COLORS.CARD} p-4 space-y-3`}>
        <div className="flex items-center gap-3">
          <img className="w-16 h-16 rounded-full" src="https://via.placeholder.com/150" alt="Admin" />
          <div>
            <div className="font-medium">Admin</div>
            <div className="text-sm text-gray-500">admin@jobsahi.com</div>
          </div>
        </div>
        <Button className={`px-4 py-2 rounded-lg`} variant="light">Edit Profile</Button>
      </div>
    </div>
  )
}
