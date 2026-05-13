import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home-Pages/home.jsx'
import About from './pages/About-Pages/About.jsx'
import Courses from './pages/Courses/Courses.jsx'
import Contact from './pages/Contact/contact.jsx'
import FindJob from './pages/FindJob/FindJob.jsx'
import SkillAssesment from './pages/Courses/SkillAssesment.jsx'
import News from './pages/Media/News.jsx'
import Blogs from './pages/Media/Blogs.jsx'
import PrivacyPolicy from './pages/Privacy-Policy/PrivacyPolicy.jsx'
import TermsConditions from './pages/Terms-Conditions/TermsConditions.jsx'
import Error_Page from './pages/Error_Page.jsx'
import Login from '../../shared/auth/Login.jsx'
import CreateAccount from '../../shared/auth/CreateAccount.jsx'

export default function WebsiteRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/find-job" element={<FindJob />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/skill-assessment" element={<SkillAssesment />} />
      <Route path="/news" element={<News />} />
      <Route path="/blog" element={<Blogs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<CreateAccount />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/404" element={<Error_Page />} />
      <Route path="*" element={<Error_Page />} />
    </Routes>
  )
}
