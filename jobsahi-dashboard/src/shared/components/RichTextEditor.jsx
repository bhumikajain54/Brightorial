import React from 'react'
import { Editor } from 'primereact/editor'

const RichTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Enter text...', 
  height = '200px',
  className = '',
  required = false,
  returnPlainText = false, // ✅ New prop to return plain text instead of HTML
  ...props 
}) => {
  const handleTextChange = (e) => {
    if (onChange) {
      if (returnPlainText) {
        // Return plain text without HTML tags
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = e.htmlValue || ''
        onChange(tempDiv.textContent || tempDiv.innerText || '')
      } else {
        // Return HTML content (default behavior)
        onChange(e.htmlValue)
      }
    }
  }

  return (
    <Editor
      value={value}
      onTextChange={handleTextChange}
      style={{ height }}
      placeholder={placeholder}
      className={`w-full ${className}`}
      showHeader={true} // ✅ enables default toolbar safely
      {...props}
    />
  )
}

export default RichTextEditor
