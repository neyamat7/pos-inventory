// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import { toast } from 'react-toastify'

import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

export const paymentStatus = {
  1: { text: 'Paid', color: 'success', colorClassName: 'text-success' },
  2: { text: 'Pending', color: 'warning', colorClassName: 'text-warning' },
  3: { text: 'Cancelled', color: 'secondary', colorClassName: 'text-secondary' },
  4: { text: 'Failed', color: 'error', colorClassName: 'text-error' }
}
export const statusChipColor = {
  Delivered: { color: 'success' },
  'Out for Delivery': { color: 'primary' },
  'Ready to Pickup': { color: 'info' },
  Dispatched: { color: 'warning' }
}

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Definitions
const columnHelper = createColumnHelper()

const ReturnSalesTable = ({ salesReturnData = [] }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(...[salesReturnData])
  const [globalFilter, setGlobalFilter] = useState('')

  // Return Modal State
  const [addReturnModal, setAddReturnModal] = useState({
    open: false
  })

  // Edit Modal State
  const [editModal, setEditModal] = useState({
    open: false,
    item: null
  })

  // Open modal and load item data
  const handleOpenEditModal = item => {
    setEditModal({ open: true, item })
  }

  // Close modal
  const handleCloseEditModal = () => {
    setEditModal({ open: false, item: null })
  }

  // Handle submit/update
  const handleEditSubmit = e => {
    e.preventDefault()
    const formData = new FormData(e.target)

    const updatedItem = {
      ...editModal.item,
      date: formData.get('date'),
      customerName: formData.get('customerName'),
      product: formData.get('product'),
      quantity: Number(formData.get('quantity')),
      amount: Number(formData.get('amount')),
      paid: Number(formData.get('paid')),
      returnAmount: Number(formData.get('returnAmount')),
      reason: formData.get('reason')
    }

    setData(prev => prev.map(item => (item.lot_name === updatedItem.lot_name ? updatedItem : item)))

    handleCloseEditModal()
  }

  // Open Modal
  const handleOpenAddReturnModal = () => setAddReturnModal({ open: true })

  // Close Modal
  const handleCloseAddReturnModal = () => setAddReturnModal({ open: false })

  // For controlled inputs
  const [newReturnData, setNewReturnData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    supplierName: '',
    product: '',
    lot_name: '',
    quantity: '',
    amount: '',
    paid: '',
    returnAmount: '',
    reason: ''
  })

  // Handle input changes
  const handleNewReturnChange = e => {
    const { name, value } = e.target

    setNewReturnData(prev => ({ ...prev, [name]: value }))
  }

  // Handle submit new return
  const handleAddReturnSubmit = e => {
    e.preventDefault()

    if (!newReturnData.supplierName || !newReturnData.lot_name) {
      toast.error('Please select supplier and lot name.')

      return
    }

    const newEntry = {
      ...newReturnData,
      date: newReturnData.date || new Date().toISOString().split('T')[0],
      customerId: `SUP-${Math.floor(Math.random() * 1000)}`,
      customerName: newReturnData.customerName || 'Unknown Customer'
    }

    setData(prev => [...prev, newEntry])
    setAddReturnModal({ open: false })
    setNewReturnData({
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      supplierName: '',
      product: '',
      lot_name: '',
      quantity: '',
      amount: '',
      paid: '',
      returnAmount: '',
      reason: ''
    })
  }

  const columns = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'customerName', header: 'Customer' },
    { accessorKey: 'lot_name', header: 'Lot' },
    { accessorKey: 'amount', header: 'Total' },
    { accessorKey: 'paid', header: 'Paid' },
    { accessorKey: 'returnAmount', header: 'Return Amount' },
    { accessorKey: 'reason', header: 'Reason' },

    // Optional: Action columns
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <OptionMenu
          iconButtonProps={{ size: 'medium' }}
          iconClassName='text-textSecondary'
          options={[
            {
              text: 'Edit',
              icon: 'tabler-edit',
              menuItemProps: {
                onClick: () => handleOpenEditModal(row.original),
                className: 'flex items-center gap-2 w-full px-2 py-1 text-blue-500'
              }
            },
            {
              text: 'Delete',
              icon: 'tabler-trash',
              menuItemProps: {
                onClick: () => setData(prev => prev.filter(item => item.lot_name !== row.original.lot_name)),
                className: 'flex items-center gap-2 w-full px-2 py-1 text-red-500'
              }
            }
          ]}
        />
      ),
      enableSorting: false
    }
  ]

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card>
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Order'
          className='sm:is-auto'
        />
        <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='is-[70px] max-sm:is-full'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
            <MenuItem value='100'>100</MenuItem>
          </CustomTextField>

          <Button
            variant='contained'
            color='primary'
            className='!bg-indigo-600 hover:!bg-indigo-700 text-white px-5 py-2 rounded-md'
            onClick={handleOpenAddReturnModal}
          >
            + Add Return
          </Button>
        </div>
      </CardContent>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th className='whitespace-nowrap border-r' key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-xl' />,
                            desc: <i className='tabler-chevron-down text-xl' />
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td className='whitespace-nowrap border-r' key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
      />

      {/* Edit Modal */}
      {editModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative animate-fadeIn'>
            <h2 className='text-xl font-semibold mb-4 text-gray-800 border-b pb-2'>Edit Return Details</h2>

            <form onSubmit={handleEditSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Date</label>
                  <input
                    type='date'
                    name='date'
                    defaultValue={editModal.item?.date}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Customer</label>
                  <input
                    type='text'
                    name='customerName'
                    defaultValue={editModal.item?.customerName}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Product</label>
                  <input
                    type='text'
                    name='product'
                    defaultValue={editModal.item?.product}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Quantity</label>
                  <input
                    type='number'
                    name='quantity'
                    defaultValue={editModal.item?.quantity}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Amount</label>
                  <input
                    type='number'
                    name='amount'
                    defaultValue={editModal.item?.amount}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Paid</label>
                  <input
                    type='number'
                    name='paid'
                    defaultValue={editModal.item?.paid}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Return Amount</label>
                  <input
                    type='number'
                    name='returnAmount'
                    defaultValue={editModal.item?.returnAmount}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>Reason</label>
                <textarea
                  name='reason'
                  defaultValue={editModal.item?.reason}
                  className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none resize-none'
                  rows='3'
                />
              </div>

              <div className='flex justify-end gap-3 mt-4'>
                <button
                  type='button'
                  onClick={handleCloseEditModal}
                  className='px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100 transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition'
                >
                  Save Changes
                </button>
              </div>
            </form>

            <button onClick={handleCloseEditModal} className='absolute top-3 right-3 text-gray-400 hover:text-gray-600'>
              <i className='tabler-x text-xl'></i>
            </button>
          </div>
        </div>
      )}

      {/* Add Return Modal */}
      {addReturnModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative animate-fadeIn'>
            <h2 className='text-xl font-semibold mb-4 text-gray-800 border-b pb-2'>Add New Product Return</h2>

            <form onSubmit={handleAddReturnSubmit} className='space-y-5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                {/* Date */}
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Date</label>
                  <input
                    type='date'
                    name='date'
                    value={newReturnData.date}
                    onChange={handleNewReturnChange}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>

                {/* Customer Name */}
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Customer Name</label>
                  <input
                    type='text'
                    name='customerName'
                    value={newReturnData.customerName}
                    onChange={handleNewReturnChange}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                    placeholder='Enter customer name'
                  />
                </div>

                {/* Supplier Dropdown */}
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Supplier</label>
                  <select
                    name='supplierName'
                    value={newReturnData.supplierName}
                    onChange={handleNewReturnChange}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  >
                    <option value=''>Select Supplier</option>
                    {[...new Set(data.map(item => item.customerName))].map((supplier, idx) => (
                      <option key={idx} value={supplier}>
                        {supplier}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lot Dropdown (filtered by supplier) */}
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Lot Name</label>
                  <select
                    name='lot_name'
                    value={newReturnData.lot_name}
                    onChange={handleNewReturnChange}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  >
                    <option value=''>Select Lot</option>
                    {data
                      .filter(item => item.customerName === newReturnData.supplierName)
                      .map((item, idx) => (
                        <option key={idx} value={item.lot_name}>
                          {item.lot_name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Product */}
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Product</label>
                  <input
                    type='text'
                    name='product'
                    value={newReturnData.product}
                    onChange={handleNewReturnChange}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                    placeholder='Enter product name'
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Quantity</label>
                  <input
                    type='number'
                    name='quantity'
                    value={newReturnData.quantity}
                    onChange={handleNewReturnChange}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Amount</label>
                  <input
                    type='number'
                    name='amount'
                    value={newReturnData.amount}
                    onChange={handleNewReturnChange}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>

                {/* Paid */}
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Paid</label>
                  <input
                    type='number'
                    name='paid'
                    value={newReturnData.paid}
                    onChange={handleNewReturnChange}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>

                {/* Return Amount */}
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>Return Amount</label>
                  <input
                    type='number'
                    name='returnAmount'
                    value={newReturnData.returnAmount}
                    onChange={handleNewReturnChange}
                    className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>Reason</label>
                <textarea
                  name='reason'
                  value={newReturnData.reason}
                  onChange={handleNewReturnChange}
                  rows='3'
                  className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none resize-none'
                  placeholder='Enter reason for return...'
                />
              </div>

              {/* Actions */}
              <div className='flex justify-end gap-3 mt-6'>
                <button
                  type='button'
                  onClick={handleCloseAddReturnModal}
                  className='px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100 transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition'
                >
                  Add Return
                </button>
              </div>
            </form>

            <button
              onClick={handleCloseAddReturnModal}
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-600'
            >
              <i className='tabler-x text-xl'></i>
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default ReturnSalesTable
