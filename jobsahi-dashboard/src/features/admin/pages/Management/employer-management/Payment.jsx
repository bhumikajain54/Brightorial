import React, { useState } from 'react'
import { 
  LuEye, 
  LuBuilding,
  LuMail,
  LuPhone,
  LuGlobe,
  LuMapPin,
  LuUsers,
  LuBriefcase,
  LuCalendar,
  LuFileText,
  LuCreditCard,
  LuReceipt,
  LuDollarSign
} from 'react-icons/lu'
import { HiDotsVertical } from 'react-icons/hi'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant.js'
import { Button } from '../../../../../shared/components/Button.jsx'
import ComingSoonPopup from '../../../../../shared/components/ComingSoon.jsx'

// Payment History & Subscription Status Component
function PaymentHistory({ onComingSoonClose }) {
  const [timeFilter, setTimeFilter] = useState('All Time')
  const [paymentDetailsModal, setPaymentDetailsModal] = useState({ isOpen: false, payment: null })
  const [showComingSoon, setShowComingSoon] = useState(true)

  const handleComingSoonClose = () => {
    setShowComingSoon(false)
    if (typeof onComingSoonClose === 'function') {
      onComingSoonClose()
    }
  }

  // Handle View Details
  const handleViewDetails = (payment) => {
    setPaymentDetailsModal({ isOpen: true, payment })
  }

  const handleCloseViewDetails = () => {
    setPaymentDetailsModal({ isOpen: false, payment: null })
  }

  const timeFilterOptions = [
    'All Time',
    'Last 7 Days',
    'Last 30 Days',
    'Last 3 Months',
    'Last 6 Months',
    'Last Year'
  ]

  const paymentData = [
    {
      id: 1,
      company: 'TechCorp',
      subscriptionPlan: 'Premium',
      amount: 25000,
      paymentDate: '01-01-2025',
      status: 'Paid',
      invoice: 'INV-2025-001'
    },
    {
      id: 2,
      company: 'InnovateTech',
      subscriptionPlan: 'Basic',
      amount: 15000,
      paymentDate: '02-01-2025',
      status: 'Paid',
      invoice: 'INV-2025-002'
    },
    {
      id: 3,
      company: 'DataSoft Solutions',
      subscriptionPlan: 'Premium',
      amount: 25000,
      paymentDate: '28-12-2024',
      status: 'Pending',
      invoice: 'INV-2024-125'
    },
    {
      id: 4,
      company: 'CloudTech Inc',
      subscriptionPlan: 'Enterprise',
      amount: 50000,
      paymentDate: '03-01-2025',
      status: 'Paid',
      invoice: 'INV-2025-003'
    },
    {
      id: 5,
      company: 'StartupHub',
      subscriptionPlan: 'Basic',
      amount: 15000,
      paymentDate: '30-12-2024',
      status: 'Overdue',
      invoice: 'INV-2024-124'
    },
    {
      id: 6,
      company: 'WebCraft Studio',
      subscriptionPlan: 'Premium',
      amount: 25000,
      paymentDate: '29-12-2024',
      status: 'Paid',
      invoice: 'INV-2024-123'
    }
  ]

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Overdue': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status}
      </span>
    )
  }

  const getPlanBadge = (plan) => {
    const planStyles = {
      'Basic': 'bg-blue-100 text-blue-800',
      'Premium': 'bg-purple-100 text-purple-800',
      'Enterprise': 'bg-indigo-100 text-indigo-800'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${planStyles[plan]}`}>
        {plan}
      </span>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Action Dropdown Component
  const ActionDropdown = ({ payment, onViewDetails }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = React.useRef(null)

    // Close dropdown when clicking outside
    React.useEffect(() => {
      function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleViewDetails = () => {
      setIsOpen(false)
      onViewDetails(payment)
    }

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
        >
          <HiDotsVertical className={TAILWIND_COLORS.TEXT_MUTED} size={18} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
            <button
              onClick={handleViewDetails}
              className={`w-full px-4 py-2 text-left text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200`}
            >
              <LuEye size={16} />
              View Details
            </button>
          </div>
        )}
      </div>
    )
  }

  // Payment Details Modal Component
  const PaymentDetailsModal = ({ payment, isOpen, onClose }) => {
    if (!isOpen || !payment) return null

    // Generate payment history for the company
    const generatePaymentHistory = (company) => {
      const baseAmount = payment.amount
      const history = []
      
      // Generate 6 months of payment history
      for (let i = 0; i < 6; i++) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        
        history.push({
          id: i + 1,
          month: monthName,
          amount: baseAmount + (Math.random() * 5000 - 2500), // Random variation
          status: i === 0 ? payment.status : (Math.random() > 0.1 ? 'Paid' : 'Pending'),
          invoice: `INV-${date.getFullYear()}-${String(i + 1).padStart(3, '0')}`,
          paymentDate: date.toLocaleDateString('en-GB'),
          paymentMethod: ['Credit Card', 'Bank Transfer', 'UPI', 'Net Banking'][Math.floor(Math.random() * 4)]
        })
      }
      
      return history.reverse() // Show oldest first
    }

    const paymentHistory = generatePaymentHistory(payment.company)

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Payment Details & History</h2>
            <Button
              onClick={onClose}
              variant="unstyled"
              className={`${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY} transition-colors duration-200 p-2`}
            >
              <span className="text-2xl">&times;</span>
            </Button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Company Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuBuilding className="text-blue-600" size={20} />
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Company Name</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>{payment.company}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Current Subscription Plan</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payment.subscriptionPlan === 'Basic' ? 'bg-blue-100 text-blue-800' :
                    payment.subscriptionPlan === 'Premium' ? 'bg-purple-100 text-purple-800' :
                    'bg-indigo-100 text-indigo-800'
                  }`}>
                    {payment.subscriptionPlan}
                  </span>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Current Amount</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-bold text-lg`}>{formatCurrency(payment.amount)}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Current Status</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Statistics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuDollarSign className="text-green-600" size={20} />
                Payment Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 text-lg">💰</span>
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Total Paid</span>
                  </div>
                  <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {formatCurrency(paymentHistory.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600 text-lg">📊</span>
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Total Transactions</span>
                  </div>
                  <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{paymentHistory.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-600 text-lg">⏰</span>
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Pending Payments</span>
                  </div>
                  <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {paymentHistory.filter(p => p.status === 'Pending').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-600 text-lg">💳</span>
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Avg. Amount</span>
                  </div>
                  <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {formatCurrency(paymentHistory.reduce((sum, p) => sum + p.amount, 0) / paymentHistory.length)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuReceipt className="text-orange-600" size={20} />
                Payment History (Last 6 Months)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Month
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Amount
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Payment Date
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Payment Method
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paymentHistory.map((historyItem) => (
                      <tr key={historyItem.id} className="hover:bg-gray-50">
                        <td className={`px-4 py-3 text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          {historyItem.month}
                        </td>
                        <td className={`px-4 py-3 text-sm font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          {formatCurrency(historyItem.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            historyItem.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {historyItem.status}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          {historyItem.paymentDate}
                        </td>
                        <td className={`px-4 py-3 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          <div className="flex items-center gap-2">
                            <LuCreditCard size={14} className={TAILWIND_COLORS.TEXT_MUTED} />
                            {historyItem.paymentMethod}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                          {historyItem.invoice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuFileText className="text-purple-600" size={20} />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Billing Address</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>123 Business Street, Tech City, TC 12345</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Tax ID</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>TAX-2024-TC-001</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Payment Terms</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>Net 30 Days</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Auto-Renewal</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>Enabled</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
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
    )
  }

  return (
    <div className="space-y-6">
      {showComingSoon && (
        <ComingSoonPopup onClose={handleComingSoonClose} />
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg font-bold">💰</span>
            </div>
            <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Payment History & Subscription Status</h2>
          </div>
          <p className={`${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>Monitor payment transactions and subscription management</p>
        </div>
        
        {/* Time Filter */}
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className={`appearance-none bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY} px-4 py-2 pr-8 rounded-lg text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {timeFilterOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className={TAILWIND_COLORS.TEXT_MUTED}>▼</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Total Revenue</p>
              <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>₹4,50,000</p>
              <p className="text-sm text-green-600 mt-1">+15% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Pending Payments</p>
              <p className="text-2xl font-bold text-red-600">₹45,000</p>
              <p className="text-sm text-red-600 mt-1">3 overdue invoices</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-xl">⏰</span>
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Active Subscriptions</p>
              <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>1,234</p>
              <p className="text-sm text-green-600 mt-1">98% retention rate</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Company
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Subscription Plan
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Amount
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Payment Date
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Invoice
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{item.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPlanBadge(item.subscriptionPlan)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{formatCurrency(item.amount)}</div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {item.paymentDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-600 font-medium">{item.invoice}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ActionDropdown 
                      payment={item} 
                      onViewDetails={handleViewDetails} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      <PaymentDetailsModal 
        payment={paymentDetailsModal.payment}
        isOpen={paymentDetailsModal.isOpen}
        onClose={handleCloseViewDetails}
      />
    </div>
  )
}

export default PaymentHistory
