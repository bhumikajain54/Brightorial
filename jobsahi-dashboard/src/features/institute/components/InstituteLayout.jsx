import React from 'react'
import AppLayout from '../../../shared/components/AppLayout'
import InstituteHeader from './InstituteHeader'
import { instituteSidebarItems } from './instituteSidebarItems.jsx'

export default function InstituteLayout() {
  return (
    <AppLayout header={InstituteHeader} sidebarItems={instituteSidebarItems} brand="JOBSAHI" roleLabel="Institute" />
  )
}
