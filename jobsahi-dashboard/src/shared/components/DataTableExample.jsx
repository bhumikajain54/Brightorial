import React from 'react'
import DataTable from './DataTable'

// Example usage of DataTable component
const DataTableExample = () => {
  // Sample data for different use cases
  const employeeData = [
    { id: 1, name: 'John Doe', department: 'Engineering', salary: '$75,000', status: 'Active' },
    { id: 2, name: 'Jane Smith', department: 'Marketing', salary: '$65,000', status: 'Active' },
    { id: 3, name: 'Bob Johnson', department: 'Sales', salary: '$70,000', status: 'Inactive' }
  ]

  const productData = [
    { id: 1, name: 'Laptop', category: 'Electronics', price: '$999', stock: 'In Stock' },
    { id: 2, name: 'Mouse', category: 'Accessories', price: '$25', stock: 'Low Stock' },
    { id: 3, name: 'Keyboard', category: 'Accessories', price: '$75', stock: 'Out of Stock' }
  ]

  // Column configurations
  const employeeColumns = [
    { key: 'name', header: 'Employee Name' },
    { key: 'department', header: 'Department' },
    { key: 'salary', header: 'Salary' },
    { key: 'status', header: 'Status' }
  ]

  const productColumns = [
    { key: 'name', header: 'Product Name' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price' },
    { key: 'stock', header: 'Stock Status' }
  ]

  // Action configurations
  const employeeActions = [
    {
      label: 'Edit',
      variant: 'primary',
      onClick: (row) => console.log('Edit employee:', row)
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => console.log('Delete employee:', row)
    }
  ]

  const productActions = [
    {
      label: 'View',
      variant: 'primary',
      onClick: (row) => console.log('View product:', row)
    },
    {
      label: 'Edit',
      variant: 'success',
      onClick: (row) => console.log('Edit product:', row)
    }
  ]

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-gray-900">DataTable Component Examples</h1>
      
      {/* Employee Table */}
      <DataTable
        title="Employee Management"
        columns={employeeColumns}
        data={employeeData}
        actions={employeeActions}
      />

      {/* Product Table */}
      <DataTable
        title="Product Inventory"
        columns={productColumns}
        data={productData}
        actions={productActions}
      />

      {/* Table without actions */}
      <DataTable
        title="Simple Data Table"
        columns={employeeColumns}
        data={employeeData}
        showActions={false}
      />
    </div>
  )
}

export default DataTableExample
