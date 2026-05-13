import React, { createContext, useContext, useState } from 'react'

const CourseContext = createContext()

export const useCourseContext = () => {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error('useCourseContext must be used within a CourseProvider')
  }
  return context
}

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([
    {
      id: 1,
      team: 'Maximoz Team',
      status: 'Active',
      title: 'Assistant Electrician',
      category: 'ENGINEERING DESIGN',
      skills: ['Wiring', 'Safety Measures'],
      additionalSkills: 2,
      description: 'This course trains individuals in basic electrical work, wiring, safety protocols, and equipment handling for assisting certified electricians in residential and commercial settings.',
      price: '2,000'
    },
    {
      id: 2,
      team: 'Maximoz Team',
      status: 'Active',
      title: 'Junior Welder',
      category: 'MANUFACTURING TECH',
      skills: ['Wiring', 'Safety Measures'],
      additionalSkills: 2,
      description: 'This course provides hands-on training in basic welding techniques, safety procedures, and handling welding equipment for use in manufacturing and construction',
      price: '1,800'
    },
    {
      id: 3,
      team: 'Maximoz Team',
      status: 'Active',
      title: 'Assistant Electrician',
      category: 'ENGINEERING DESIGN',
      skills: ['Wiring', 'Safety Measures'],
      additionalSkills: 2,
      description: 'This course trains individuals in basic electrical work, wiring, safety protocols, and equipment handling for assisting certified electricians in residential and commercial settings.',
      price: '1,700'
    },
    {
      id: 4,
      team: 'Maximoz Team',
      status: 'Active',
      title: 'Data Entry Operator',
      category: 'OFFICE ADMIN',
      skills: ['Typing Skills', 'MS Office'],
      additionalSkills: 2,
      description: 'Learn efficient typing, data accuracy techniques, and computer basics to perform clerical and digital data entry tasks in small and large organizations.',
      price: '4,000'
    }
  ])

  const addCourse = (courseData) => {
    const newCourse = {
      id: Date.now(), // Simple ID generation
      team: 'Maximoz Team',
      status: courseData.courseStatus || 'Active',
      title: courseData.courseTitle,
      category: courseData.category?.toUpperCase() || 'GENERAL',
      skills: courseData.taggedSkills ? courseData.taggedSkills.split(',').map(skill => skill.trim()) : [],
      additionalSkills: 0,
      description: courseData.description || 'No description provided',
      price: courseData.price || '0'
    }
    setCourses(prev => [...prev, newCourse])
  }

  const updateCourse = (id, updatedData) => {
    setCourses(prev => prev.map(course => 
      course.id === id ? { ...course, ...updatedData } : course
    ))
  }

  const deleteCourse = (id) => {
    setCourses(prev => prev.filter(course => course.id !== id))
  }

  const value = {
    courses,
    addCourse,
    updateCourse,
    deleteCourse
  }

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  )
}
