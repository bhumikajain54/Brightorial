import React, { useState } from 'react'
import { 
  LuPencil,
  LuTrash2,
  LuX,
  LuSave,
  LuPlus
} from 'react-icons/lu'
import Swal from 'sweetalert2'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import { Button, NeutralButton, SuccessButton, DangerButton, IconButton } from '../../../../shared/components/Button'

export default function SubscriptionPlan() {
  const [editModal, setEditModal] = useState({ isOpen: false, plan: null })
  const [createModal, setCreateModal] = useState({ isOpen: false })
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'Basic Plan',
      targetAudience: 'For individual job seekers',
      status: 'Active',
      price: '₹999',
      period: '/month',
      features: [
        '10 job applications',
        'Basic profile visibility',
        'Email support'
      ],
      freeCredits: 5,
      isActive: true
    },
    {
      id: 2,
      name: 'Premium Plan',
      targetAudience: 'For professionals',
      status: 'Active',
      price: '₹1999',
      period: '/month',
      features: [
        'Unlimited job applications',
        'Premium profile visibility',
        'Priority support',
        'Advanced search filters'
      ],
      freeCredits: 10,
      isActive: true
    },
    {
      id: 3,
      name: 'Enterprise Plan',
      targetAudience: 'For companies',
      status: 'Inactive',
      price: '₹4999',
      period: '/month',
      features: [
        'Unlimited everything',
        'Custom branding',
        'Dedicated account manager',
        'API access'
      ],
      freeCredits: 50,
      isActive: false
    }
  ])

  const togglePlanStatus = (planId) => {
    setPlans(plans.map(plan => 
      plan.id === planId 
        ? { ...plan, isActive: !plan.isActive, status: !plan.isActive ? 'Active' : 'Inactive' }
        : plan
    ))
  }

  const handleEdit = (planId) => {
    const plan = plans.find(p => p.id === planId)
    setEditModal({ isOpen: true, plan })
  }

  const handleCloseEdit = () => {
    setEditModal({ isOpen: false, plan: null })
  }

  const handleSaveEdit = (planId, updatedPlan) => {
    setPlans(plans.map(plan => 
      plan.id === planId ? { ...plan, ...updatedPlan } : plan
    ))
    setEditModal({ isOpen: false, plan: null })
  }

  const handleDelete = (planId) => {
    const plan = plans.find(p => p.id === planId)
    
    Swal.fire({
      title: "Delete Subscription Plan",
      text: `Are you sure you want to delete "${plan.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        setPlans(plans.filter(plan => plan.id !== planId))
        Swal.fire({
          title: "Deleted!",
          text: "Subscription plan has been deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        })
      }
    })
  }

  const handleCreateNew = () => {
    setCreateModal({ isOpen: true })
  }

  const handleCloseCreate = () => {
    setCreateModal({ isOpen: false })
  }

  const handleSaveCreate = (newPlan) => {
    const newId = Math.max(...plans.map(p => p.id)) + 1
    const planToAdd = {
      id: newId,
      ...newPlan,
      status: newPlan.isActive ? 'Active' : 'Inactive'
    }
    setPlans([...plans, planToAdd])
    setCreateModal({ isOpen: false })
    
    Swal.fire({
      title: "Created!",
      text: "New subscription plan has been created successfully.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false
    })
  }

  // Edit Plan Modal Component
  const EditPlanModal = ({ plan, isOpen, onClose, onSave }) => {
    const [editForm, setEditForm] = useState({
      name: '',
      targetAudience: '',
      price: '',
      period: '',
      features: [],
      freeCredits: 0,
      isActive: true
    })

    // Initialize form when plan changes
    React.useEffect(() => {
      if (plan) {
        setEditForm({
          name: plan.name,
          targetAudience: plan.targetAudience,
          price: plan.price.replace('₹', ''),
          period: plan.period,
          features: [...plan.features],
          freeCredits: plan.freeCredits,
          isActive: plan.isActive
        })
      }
    }, [plan])

    const handleInputChange = (field, value) => {
      setEditForm(prev => ({ ...prev, [field]: value }))
    }

    const handleFeatureChange = (index, value) => {
      const newFeatures = [...editForm.features]
      newFeatures[index] = value
      setEditForm(prev => ({ ...prev, features: newFeatures }))
    }

    const addFeature = () => {
      setEditForm(prev => ({ ...prev, features: [...prev.features, ''] }))
    }

    const removeFeature = (index) => {
      const newFeatures = editForm.features.filter((_, i) => i !== index)
      setEditForm(prev => ({ ...prev, features: newFeatures }))
    }

    const handleSave = () => {
      // Validate form
      if (!editForm.name.trim() || !editForm.targetAudience.trim() || !editForm.price.trim()) {
        Swal.fire({
          title: "Validation Error",
          text: "Please fill in all required fields!",
          icon: "error"
        })
        return
      }

      if (editForm.features.length === 0) {
        Swal.fire({
          title: "Validation Error",
          text: "Please add at least one feature!",
          icon: "error"
        })
        return
      }

      // Save the plan
      onSave(plan.id, {
        ...editForm,
        price: `₹${editForm.price}`,
        status: editForm.isActive ? 'Active' : 'Inactive'
      })

      Swal.fire({
        title: "Updated!",
        text: "Subscription plan has been updated successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      })
    }

    if (!isOpen || !plan) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Edit Subscription Plan</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <LuX size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Plan Name*</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter plan name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Target Audience*</label>
                  <input
                    type="text"
                    value={editForm.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter target audience"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Price*</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="999"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Period</label>
                  <select
                    value={editForm.period}
                    onChange={(e) => handleInputChange('period', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="/month">Per Month</option>
                    <option value="/year">Per Year</option>
                    <option value="/quarter">Per Quarter</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Features</h3>
                <Button
                  onClick={addFeature}
                  variant="success"
                  size="sm"
                  icon={<LuPlus size={16} />}
                >
                  Add Feature
                </Button>
              </div>
              <div className="space-y-3">
                {editForm.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter feature"
                    />
                    <button
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <LuX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Free Credits */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">Free Credits</h3>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Number of Free Credits</label>
                <input
                  type="number"
                  value={editForm.freeCredits}
                  onChange={(e) => handleInputChange('freeCredits', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="5"
                  min="0"
                />
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">Status</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Plan Status</span>
                <Button
                  onClick={() => handleInputChange('isActive', !editForm.isActive)}
                  variant="unstyled"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    editForm.isActive ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editForm.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <NeutralButton
              onClick={onClose}
              size="md"
            >
              Cancel
            </NeutralButton>
            <SuccessButton
              onClick={handleSave}
              size="md"
              icon={<LuSave size={16} />}
            >
              Save Changes
            </SuccessButton>
          </div>
        </div>
      </div>
    )
  }

  // Create New Plan Modal Component
  const CreateNewPlanModal = ({ isOpen, onClose, onSave }) => {
    const [createForm, setCreateForm] = useState({
      name: '',
      targetAudience: '',
      price: '',
      period: '/month',
      features: [''],
      freeCredits: 0,
      isActive: true
    })

    const handleInputChange = (field, value) => {
      setCreateForm(prev => ({ ...prev, [field]: value }))
    }

    const handleFeatureChange = (index, value) => {
      const newFeatures = [...createForm.features]
      newFeatures[index] = value
      setCreateForm(prev => ({ ...prev, features: newFeatures }))
    }

    const addFeature = () => {
      setCreateForm(prev => ({ ...prev, features: [...prev.features, ''] }))
    }

    const removeFeature = (index) => {
      const newFeatures = createForm.features.filter((_, i) => i !== index)
      setCreateForm(prev => ({ ...prev, features: newFeatures }))
    }

    const handleSave = () => {
      // Validate form
      if (!createForm.name.trim() || !createForm.targetAudience.trim() || !createForm.price.trim()) {
        Swal.fire({
          title: "Validation Error",
          text: "Please fill in all required fields!",
          icon: "error"
        })
        return
      }

      if (createForm.features.length === 0 || createForm.features.every(f => !f.trim())) {
        Swal.fire({
          title: "Validation Error",
          text: "Please add at least one feature!",
          icon: "error"
        })
        return
      }

      // Filter out empty features
      const validFeatures = createForm.features.filter(f => f.trim())

      // Save the plan
      onSave({
        ...createForm,
        features: validFeatures,
        price: `₹${createForm.price}`
      })
    }

    const handleClose = () => {
      // Reset form when closing
      setCreateForm({
        name: '',
        targetAudience: '',
        price: '',
        period: '/month',
        features: [''],
        freeCredits: 0,
        isActive: true
      })
      onClose()
    }

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Create New Subscription Plan</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <LuX size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Plan Name*</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter plan name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Target Audience*</label>
                  <input
                    type="text"
                    value={createForm.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter target audience"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Price*</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={createForm.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="999"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Period</label>
                  <select
                    value={createForm.period}
                    onChange={(e) => handleInputChange('period', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="/month">Per Month</option>
                    <option value="/year">Per Year</option>
                    <option value="/quarter">Per Quarter</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Features</h3>
                <Button
                  onClick={addFeature}
                  variant="success"
                  size="sm"
                  icon={<LuPlus size={16} />}
                >
                  Add Feature
                </Button>
              </div>
              <div className="space-y-3">
                {createForm.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter feature"
                    />
                    {createForm.features.length > 1 && (
                      <button
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <LuX size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Free Credits */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">Free Credits</h3>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Number of Free Credits</label>
                <input
                  type="number"
                  value={createForm.freeCredits}
                  onChange={(e) => handleInputChange('freeCredits', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="5"
                  min="0"
                />
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">Status</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Plan Status</span>
                <Button
                  onClick={() => handleInputChange('isActive', !createForm.isActive)}
                  variant="unstyled"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    createForm.isActive ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      createForm.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <NeutralButton
              onClick={handleClose}
              size="md"
            >
              Cancel
            </NeutralButton>
            <SuccessButton
              onClick={handleSave}
              size="md"
              icon={<LuSave size={16} />}
            >
              Create Plan
            </SuccessButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto  space-y-4 bg-white border border-[var(--color-primary)3c] rounded-lg p-2 md:p-4">
      {/* Header */}
      <div className=" rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Subscription Plan Manager</h1>
            <p className="text-[var(--color-text-muted)] mt-1">Create, edit, and manage subscription plans</p>
          </div>
          <Button 
            onClick={handleCreateNew}
            variant="outline"
            size="md"
            icon={<LuPlus size={16} />}
          >
            Create New Plan
          </Button>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="hover:shadow-md rounded-lg border border-[var(--color-primary)3c] p-4">
            {/* Plan Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{plan.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">{plan.targetAudience}</p>
              </div>
              <span className={`inline-flex items-center px-3 border-[var(--color-secondary)] border py-1 rounded-full text-xs font-medium ${
                plan.status === 'Active' 
                  ? 'bg-green-100 text-[var(--color-success)]' 
                  : 'bg-red-100 text-[var(--color-error)]'
              }`}>
                {plan.status}
              </span>
            </div>

            {/* Pricing */}
            <div className="mb-2">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-[var(--color-text-primary)]">{plan.price}</span>
                <span className="text-[var(--color-text-muted)] ml-1">{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Features:</h4>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm text-[var(--color-text-primary)]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Free Credits */}
            <div className="mb-6">
              <p className="text-sm text-[var(--color-text-primary)]">
                <span className="font-medium">Free Credits:</span> {plan.freeCredits}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Plan Status</span>
                <Button
                  onClick={() => togglePlanStatus(plan.id)}
                  variant="unstyled"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    plan.isActive ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      plan.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={() => handleEdit(plan.id)}
                variant="outline"
                size="md"
                fullWidth
                icon={<LuPencil size={16} />}
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(plan.id)}
                variant="outline"
                size="md"
                fullWidth
                icon={<LuTrash2 size={16} />}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="text-center py-12">
          <div className="text-[var(--color-text-muted)]">
            <p className="text-lg font-medium">No subscription plans found</p>
            <p className="text-sm">Create your first subscription plan to get started</p>
            <Button 
              onClick={handleCreateNew}
              variant="success"
              size="lg"
              icon={<LuPlus size={16} />}
              className="mt-4"
            >
              Create New Plan
            </Button>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      <EditPlanModal 
        plan={editModal.plan}
        isOpen={editModal.isOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />

      {/* Create New Plan Modal */}
      <CreateNewPlanModal 
        isOpen={createModal.isOpen}
        onClose={handleCloseCreate}
        onSave={handleSaveCreate}
      />
    </div>
  )
}
