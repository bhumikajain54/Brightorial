import React from 'react'
import AppLayout from '../../../shared/components/AppLayout'
import RecruiterHeader from './RecruiterHeader'
import { recruiterSidebarItems } from './RecruiterSidebarItems.jsx'

export default function RecruiterLayout() {
  return (
    <AppLayout header={RecruiterHeader} sidebarItems={recruiterSidebarItems} brand="JOBSAHI" roleLabel="Recruiter" />
  )
}
