import React, { useState } from 'react'
import { 
  LuEye, 
  LuUser,
  LuMail,
  LuPhone,
  LuMapPin,
  LuCalendar,
  LuFileText,
  LuCreditCard,
  LuReceipt,
  LuDollarSign,
  LuBuilding,
  LuGlobe
} from 'react-icons/lu'
import { HiDotsVertical } from 'react-icons/hi'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import { Button } from '../../../../shared/components/Button'

export default function OrderHistory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false)
  const [paymentLogsModal, setPaymentLogsModal] = useState({ isOpen: false, order: null })

  // Handle View Details
  const handleViewDetails = (order) => {
    setPaymentLogsModal({ isOpen: true, order })
  }

  const handleCloseViewDetails = () => {
    setPaymentLogsModal({ isOpen: false, order: null })
  }

  // Demo data - replace with API data later
  const paymentLogs = [
    {   
      id: 'ORD-001',
      user: 'Rahul Sharma (Student)',
      amount: '₹2,999',
      paymentMethod: 'Razorpay',
      status: 'Completed',
      date: '01-01-2025'
    },
    {
      id: 'ORD-001',
      user: 'Rahul Sharma (Institute)',
      amount: '₹2,999',
      paymentMethod: 'Razorpay',
      status: 'Completed',
      date: '01-01-2025'
    },
    {
      id: 'ORD-001',
      user: 'Rahul Sharma (Institute)',
      amount: '₹2,999',
      paymentMethod: 'Razorpay',
      status: 'Completed',
      date: '01-01-2025'
    }
  ]

  const filteredLogs = paymentLogs.filter(log =>
    log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.amount.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Action Dropdown Component
  const ActionDropdown = ({ order, onViewDetails }) => {
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
      onViewDetails(order)
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

  // Payment Logs Modal Component
  const PaymentLogsModal = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null

    // Generate payment history for the order
    const generatePaymentHistory = (orderId) => {
      const history = []
      
      // Generate payment history entries
      const baseDate = new Date(order.date.split('-').reverse().join('-'))
      
      history.push({
        id: 1,
        date: order.date,
        amount: order.amount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        transactionId: `TXN-${orderId}-001`,
        description: 'Course enrollment payment',
        gateway: 'Razorpay',
        fees: '₹59.98',
        netAmount: order.amount.replace('₹', '').replace(',', '') - 59.98
      })

      // Add some additional payment history entries
      const additionalEntries = [
        {
          id: 2,
          date: '28-12-2024',
          amount: '₹1,999',
          status: 'Completed',
          paymentMethod: 'UPI',
          transactionId: `TXN-${orderId}-002`,
          description: 'Additional course material',
          gateway: 'Razorpay',
          fees: '₹39.98',
          netAmount: 1959.02
        },
        {
          id: 3,
          date: '15-12-2024',
          amount: '₹999',
          status: 'Failed',
          paymentMethod: 'Credit Card',
          transactionId: `TXN-${orderId}-003`,
          description: 'Course upgrade attempt',
          gateway: 'Razorpay',
          fees: '₹19.98',
          netAmount: 0
        }
      ]

      return [history[0], ...additionalEntries]
    }

    const paymentHistory = generatePaymentHistory(order.id)

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Payment Logs History</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Order Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuReceipt className="text-blue-600" size={20} />
                Order Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Order ID</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>#{order.id}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>User</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>{order.user}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Order Date</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                    <LuCalendar size={16} className="text-gray-400" />
                    {order.date}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Current Status</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {order.status}
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
                    {paymentHistory.filter(p => p.status === 'Completed').reduce((sum, p) => sum + parseFloat(p.amount.replace('₹', '').replace(',', '')), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
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
                    <span className="text-red-600 text-lg">❌</span>
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Failed Payments</span>
                  </div>
                  <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {paymentHistory.filter(p => p.status === 'Failed').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-600 text-lg">💳</span>
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Gateway Fees</span>
                  </div>
                  <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {paymentHistory.filter(p => p.status === 'Completed').reduce((sum, p) => sum + parseFloat(p.fees.replace('₹', '').replace(',', '')), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuFileText className="text-orange-600" size={20} />
                Payment History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Date
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Amount
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Payment Method
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Transaction ID
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Description
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Gateway
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                        Fees
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paymentHistory.map((historyItem) => (
                      <tr key={historyItem.id} className="hover:bg-gray-50">
                        <td className={`px-4 py-3 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          {historyItem.date}
                        </td>
                        <td className={`px-4 py-3 text-sm font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          {historyItem.amount}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            historyItem.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            historyItem.status === 'Failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {historyItem.status}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          <div className="flex items-center gap-2">
                            <LuCreditCard size={14} className="text-gray-400" />
                            {historyItem.paymentMethod}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                          {historyItem.transactionId}
                        </td>
                        <td className={`px-4 py-3 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          {historyItem.description}
                        </td>
                        <td className={`px-4 py-3 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          {historyItem.gateway}
                        </td>
                        <td className={`px-4 py-3 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          {historyItem.fees}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuUser className="text-purple-600" size={20} />
                User Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>User Name</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>{order.user.split(' (')[0]}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>User Type</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>{order.user.includes('(Student)') ? 'Student' : 'Institute'}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Email Address</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                    <LuMail size={16} className="text-gray-400" />
                    <a href={`mailto:${order.user.split(' (')[0].toLowerCase().replace(' ', '.')}@email.com`} className="text-blue-600 hover:underline">
                      {order.user.split(' (')[0].toLowerCase().replace(' ', '.')}@email.com
                    </a>
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Phone Number</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                    <LuPhone size={16} className="text-gray-400" />
                    <a href="tel:+919876543210" className="text-blue-600 hover:underline">
                      +91 9876543210
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuBuilding className="text-indigo-600" size={20} />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Billing Address</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>123 User Street, City, State 12345</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>IP Address</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>192.168.1.100</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Device</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>Chrome Browser - Windows 10</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Location</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>Mumbai, Maharashtra, India</p>
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
    <div className="max-w-7xl mx-auto  space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-[var(--color-primary)3c] shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Order History & Payment Logs</h1>
            <p className={`${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>Track Payment, invoices, and refunds</p>
          </div>
          
         
          
          <button className="bg-white hover:bg-[var(--color-secondary)] hover:text-white border-2 border-[var(--color-secondary)] text-[var(--color-secondary)] px-4 py-2 rounded-lg font-medium transition-colors">
            Export Data
          </button>
        </div>

        {/* Payment Logs Section */}
        <div className="  rounded-lg border border-[var(--color-primary)3c] shadow-sm">
          <div className="p-3 border-b border-[var(--color-primary)3c]">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Payment Logs</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-4 py-2 border border-[var(--color-primary)3c] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="order-history-table-container overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className=" ">
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                    Order ID
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                    User
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                    Amount
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                    Payment Method
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log, index) => (
                  <tr key={index} className="hover: ">
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      #{log.id}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {log.user}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {log.amount}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {log.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {log.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {log.date}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      <ActionDropdown 
                        order={log} 
                        onViewDetails={handleViewDetails} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <div className={TAILWIND_COLORS.TEXT_MUTED}>
                <p className="text-lg font-medium">No payment logs found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Logs Modal */}
      <PaymentLogsModal 
        order={paymentLogsModal.order}
        isOpen={paymentLogsModal.isOpen}
        onClose={handleCloseViewDetails}
      />
    </div>
  )
}
