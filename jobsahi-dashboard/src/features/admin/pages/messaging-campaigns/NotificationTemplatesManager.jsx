import React, { useState } from 'react';
import { TAILWIND_COLORS } from '../../../../shared/WebConstant.js';
import Button from '../../../../shared/components/Button.jsx';
import { 
  LuEye, 
  LuPencil, 
  LuTrash2, 
  LuX, 
  LuSave,
  LuCopy,
  LuMail,
  LuMessageSquare,
  LuBell
} from 'react-icons/lu';
import Swal from 'sweetalert2';

const NotificationTemplatesManager = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Job Alert Email',
      category: 'Job Alerts',
      type: 'Email',
      status: 'Active',
      lastModified: '1 hour ago',
      usage: 2345
    },
    {
      id: 2,
      name: 'Interview reminder SMS',
      category: 'Reminders',
      type: 'SMS',
      status: 'Active',
      lastModified: '2 hours ago',
      usage: 1890
    },
    {
      id: 3,
      name: 'Welcome Push Notification',
      category: 'Onboarding',
      type: 'Push',
      status: 'Active',
      lastModified: '3 hours ago',
      usage: 3200
    },
    {
      id: 4,
      name: 'Profile Completion',
      category: 'Job Alerts',
      type: 'Email',
      status: 'Active',
      lastModified: '5 hours ago',
      usage: 1567
    },
    {
      id: 5,
      name: 'Job Match SMS',
      category: 'Job Alerts',
      type: 'SMS',
      status: 'Active',
      lastModified: '1 day ago',
      usage: 2890
    },
    {
      id: 6,
      name: 'System Maintenance Notice',
      category: 'System',
      type: 'Push',
      status: 'Active',
      lastModified: '2 days ago',
      usage: 450
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [viewModal, setViewModal] = useState({ isOpen: false, template: null });
  const [editModal, setEditModal] = useState({ isOpen: false, template: null });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedChannel === 'all') return matchesSearch;
    return matchesSearch && template.type.toLowerCase() === selectedChannel.toLowerCase();
  });

  const handleViewTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    setViewModal({ isOpen: true, template });
  };

  const handleCloseView = () => {
    setViewModal({ isOpen: false, template: null });
  };

  const handleEditTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    setEditModal({ isOpen: true, template });
  };

  const handleCloseEdit = () => {
    setEditModal({ isOpen: false, template: null });
  };

  const handleSaveEdit = (templateId, updatedData) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, ...updatedData, lastModified: 'Just now' }
        : template
    ));
    setEditModal({ isOpen: false, template: null });
  };

  const handleDeleteTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    
    Swal.fire({
      title: "Delete Template",
      text: `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        setTemplates(prev => prev.filter(template => template.id !== templateId));
        Swal.fire({
          title: "Deleted!",
          text: "Template has been deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const handleDuplicateTemplate = (templateId) => {
    console.log('Duplicate template:', templateId);
    // Add duplicate functionality here
  };

  // Modal Components
  const ViewTemplateModal = ({ template, isOpen, onClose }) => {
    if (!isOpen || !template) return null;

    const getTypeIcon = (type) => {
      switch (type.toLowerCase()) {
        case 'email':
          return <LuMail className="w-5 h-5" />;
        case 'sms':
          return <LuMessageSquare className="w-5 h-5" />;
        case 'push':
          return <LuBell className="w-5 h-5" />;
        default:
          return <LuBell className="w-5 h-5" />;
      }
    };

    const getTypeColor = (type) => {
      switch (type.toLowerCase()) {
        case 'email':
          return 'text-blue-600 bg-blue-100';
        case 'sms':
          return 'text-green-600 bg-green-100';
        case 'push':
          return 'text-purple-600 bg-purple-100';
        default:
          return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Template Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <LuX size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Template Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>{template.name}</h3>
                <p className={`${TAILWIND_COLORS.TEXT_MUTED} mb-4`}>{template.category}</p>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(template.type)}`}>
                    {getTypeIcon(template.type)}
                    {template.type}
                  </span>
                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {template.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Template Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>Usage Statistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={TAILWIND_COLORS.TEXT_MUTED}>Total Usage:</span>
                    <span className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{template.usage.toLocaleString()} times</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={TAILWIND_COLORS.TEXT_MUTED}>Last Modified:</span>
                    <span className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{template.lastModified}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>Template Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={TAILWIND_COLORS.TEXT_MUTED}>Template ID:</span>
                    <span className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>#{template.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={TAILWIND_COLORS.TEXT_MUTED}>Category:</span>
                    <span className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{template.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Content */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>Sample Content</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>
                  <strong>Subject:</strong> {template.name} - Your {template.category.toLowerCase()} notification
                </div>
                <div className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  <strong>Message:</strong> This is a sample {template.type.toLowerCase()} message for the "{template.name}" template. 
                  This template is used for {template.category.toLowerCase()} and has been used {template.usage.toLocaleString()} times.
                </div>
              </div>
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="neutral"
              size="md"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const EditTemplateModal = ({ template, isOpen, onClose, onSave }) => {
    const [editForm, setEditForm] = useState({
      name: '',
      category: '',
      type: '',
      status: '',
      content: ''
    });

    React.useEffect(() => {
      if (template) {
        setEditForm({
          name: template.name || '',
          category: template.category || '',
          type: template.type || '',
          status: template.status || '',
          content: `Sample content for ${template.name} template. This is a ${template.type.toLowerCase()} message for ${template.category.toLowerCase()}.`
        });
      }
    }, [template]);

    const handleInputChange = (field, value) => {
      setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
      if (!editForm.name.trim() || !editForm.category.trim() || !editForm.type.trim()) {
        Swal.fire({
          title: "Validation Error",
          text: "Please fill in all required fields!",
          icon: "error"
        });
        return;
      }

      onSave(template.id, editForm);
      Swal.fire({
        title: "Updated!",
        text: "Template has been updated successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    };

    if (!isOpen || !template) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Edit Template</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <LuX size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Template Name */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Template Name*</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter template name"
              />
            </div>

            {/* Category and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Category*</label>
                <select
                  value={editForm.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Category</option>
                  <option value="Job Alerts">Job Alerts</option>
                  <option value="Reminders">Reminders</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="System">System</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Type*</label>
                <select
                  value={editForm.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Type</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Push">Push</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Status</label>
              <select
                value={editForm.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            {/* Template Content */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Template Content</label>
              <textarea
                value={editForm.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Enter template content"
              />
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="neutral"
              size="md"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              size="md"
              icon={<LuSave size={16} />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
        {/* Header Section */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
          </div>
          <div>
            <h1 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Notification Templates Manager
            </h1>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
              create and manage reusable message templates
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search templates"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          {/* Channel Selector */}
          <div className="lg:w-64">
            <div className="relative">
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full h-12 px-4 pr-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm appearance-none bg-white"
              >
                <option value="all">Select Channel</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>{template.name}</h3>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{template.category}</p>
                </div>
                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {template.type}
                </span>
              </div>

              {/* Usage Statistics */}
              <div className="space-y-1 mb-6">
                <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  <span className="font-medium">Used {template.usage.toLocaleString()} times</span>
                </div>
                <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  Last used {template.lastModified}
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleViewTemplate(template.id)}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
                  title="View template"
                >
                  <LuEye size={20} />
                </button>
                <button
                  onClick={() => handleEditTemplate(template.id)}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
                  title="Edit template"
                >
                  <LuPencil size={20} />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
                  title="Delete template"
                >
                  <LuTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📄</div>
            <h3 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>No templates found</h3>
            <p className={`${TAILWIND_COLORS.TEXT_MUTED} mb-6`}>
              {searchTerm ? 'Try adjusting your search terms.' : 'Create your first notification template to get started.'}
            </p>
            <Button variant="primary" size="lg">
              + Create New Template
            </Button>
          </div>
        )}
      </div>

      {/* View Template Modal */}
      <ViewTemplateModal
        template={viewModal.template}
        isOpen={viewModal.isOpen}
        onClose={handleCloseView}
      />

      {/* Edit Template Modal */}
      <EditTemplateModal
        template={editModal.template}
        isOpen={editModal.isOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default NotificationTemplatesManager;
 