'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Link from 'next/link'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'

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
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import AddCustomerDrawer from './AddCustomerDrawer'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { updateCustomer } from '@/actions/customerActions'
import { addBalance } from '@/actions/supplierAction'
import { showSuccess } from '@/utils/toastUtils'

// -------------------- utils --------------------
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => setValue(initialValue), [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper()

// -------------------- component --------------------
const CustomerListTable = ({ customerData, paginationData, onPageChange, onPageSizeChange, isLoading = false }) => {
  // States
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  // For modals
  const [openBalanceModal, setOpenBalanceModal] = useState(false)
  const [openCrateModal, setOpenCrateModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [crateForm, setCrateForm] = useState({ type_1: 0, type_1_price: 0, type_2: 0, type_2_price: 0 })
  const [isUpdatingCrate, setIsUpdatingCrate] = useState(false)
  const [isAddingBalance, setIsAddingBalance] = useState(false)

  const [balanceForm, setBalanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    transaction_Id: '',
    slip_img: null,
    note: '',
    payment_method: 'cash'
  })

  // Re-sync data if prop changes
  useEffect(() => {
    if (Array.isArray(customerData)) {
      setData(customerData)
    } else if (customerData && customerData.customers) {
      setData(customerData.customers)
    } else {
      setData([])
    }
  }, [customerData])

  // Helpers
  const getAvatar = customer => {
    const image = customer?.basic_info?.avatar
    const name = customer?.basic_info?.name

    if (image) return <CustomAvatar src={image} skin='light' size={34} />

    return (
      <CustomAvatar skin='light' size={34}>
        {getInitials(name || '')}
      </CustomAvatar>
    )
  }

  const getCrateSummary = crateInfo => {
    if (!crateInfo) return '—'

    const summary = []

    if (crateInfo.type_1 > 0) summary.push(`Type 1: ${crateInfo.type_1}`)
    if (crateInfo.type_2 > 0) summary.push(`Type 2: ${crateInfo.type_2}`)

    return summary.length > 0 ? summary.join(' | ') : 'No crates'
  }

  // Columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },

      columnHelper.accessor('basic_info.sl', {
        header: 'SL',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.basic_info?.sl}</Typography>
      }),

      columnHelper.accessor('basic_info.name', {
        header: 'NAME',
        cell: ({ row }) => {
          const name = row.original.basic_info?.name
          const email = row.original.contact_info?.email
          const id = row.original._id

          return (
            <div className='flex items-center gap-3'>
              {getAvatar(row.original)}
              <div className='flex flex-col'>
                <Link href={`/apps/customers/details/${id || row.original.basic_info?.sl}`}>
                  <Typography className='font-medium hover:text-blue-500 hover:underline' color='text.primary'>
                    {name}
                  </Typography>
                </Link>
                {email ? <Typography variant='body2'>{email}</Typography> : null}
              </div>
            </div>
          )
        }
      }),

      columnHelper.accessor('contact_info.phone', {
        header: 'PHONE',
        cell: info => <Typography>{info.getValue()}</Typography>
      }),

      columnHelper.accessor('account_info.balance', {
        header: 'BALANCE',
        cell: info => <Typography>{Number(info.getValue() || 0).toLocaleString()} ৳</Typography>
      }),

      columnHelper.accessor('crate_info', {
        header: 'CRATE',
        cell: ({ row }) => <Typography>{getCrateSummary(row.original.crate_info)}</Typography>
      }),

      columnHelper.accessor('account_info.return_amount', {
        header: 'RETURN AMOUNT',
        cell: info => <Typography>{Number(info.getValue() || 0).toLocaleString()} ৳</Typography>
      }),

      columnHelper.accessor('account_info.due', {
        header: 'DUE',
        cell: info => {
          const val = Number(info.getValue() || 0)

          return <Typography className={val > 0 ? 'text-error font-medium' : ''}>{val.toLocaleString()} ৳</Typography>
        }
      }),

      columnHelper.accessor('contact_info.location', {
        header: 'LOCATION',
        cell: info => <Typography>{info.getValue() || '—'}</Typography>
      }),

      columnHelper.display({
        id: 'action',
        header: 'ACTION',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Add Balance',
                  icon: 'tabler-coin',
                  menuItemProps: {
                    onClick: () => {
                      setSelectedCustomer(row.original)
                      setBalanceForm({
                        date: new Date().toISOString().split('T')[0],
                        amount: '',
                        transaction_Id: '',
                        slip_img: null,
                        note: '',
                        payment_method: 'cash',
                        balance_for: ''
                      })
                      setOpenBalanceModal(true)
                    },
                    className: 'flex items-center'
                  }
                },
                {
                  text: 'Update Crate',
                  icon: 'tabler-box',
                  menuItemProps: {
                    onClick: () => {
                      setSelectedCustomer(row.original)
                      const crateInfo = row.original.crate_info || {}

                      setCrateForm({
                        type_1: crateInfo.type_1 || 0,
                        type_1_price: crateInfo.type_1_price || 0,
                        type_2: crateInfo.type_2 || 0,
                        type_2_price: crateInfo.type_2_price || 0
                      })
                      setOpenCrateModal(true)
                    },
                    className: 'flex items-center'
                  }
                },
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: async () => {
                      const Swal = (await import('sweetalert2')).default

                      Swal.fire({
                        title: 'Are you sure?',
                        text: `You are about to delete ${row.original.basic_info?.name}. This action cannot be undone.`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Yes, delete it!'
                      }).then(result => {
                        if (result.isConfirmed) {
                          setData(prev => prev.filter(item => item._id !== row.original._id))
                          Swal.fire('Deleted!', `${row.original.basic_info?.name} has been removed.`, 'success')
                        }
                      })
                    },
                    className: 'flex items-center text-red-500'
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [] // static columns for this table
  )

  // Table
  // Table
  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: {
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: (paginationData?.currentPage || 1) - 1,
        pageSize: paginationData?.limit || 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    pageCount: paginationData?.totalPages || 1,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const handleBalanceSubmit = async () => {
    // Validation
    if (!balanceForm.amount || !balanceForm.transaction_Id || !balanceForm.payment_method) {
      alert('Please fill in all required fields')

      return
    }

    setIsAddingBalance(true)

    // Create FormData for multer
    // const formData = new FormData()

    // formData.append('date', balanceForm.date)
    // formData.append('amount', balanceForm.amount)
    // formData.append('transaction_Id', balanceForm.transaction_Id)
    // formData.append('note', balanceForm.note)
    // formData.append('payment_method', balanceForm.payment_method)
    // formData.append('balance_for', balanceForm.balance_for)
    // formData.append('collection', selectedCustomer._id) // Customer ID

    // // Append image file if exists
    // if (balanceForm.slip_img) {
    //   formData.append('slip_img', balanceForm.slip_img)
    // }

    const balanceData = {
      date: balanceForm.date,
      amount: balanceForm.amount,
      transaction_Id: balanceForm.transaction_Id,
      note: balanceForm.note,
      payment_method: balanceForm.payment_method,
      balance_for: selectedCustomer._id,
      collection: 'customer',
      slip_img: 'https://i.postimg.cc/y86SS6X7/Chat-GPT-Image-Nov-4-2025-11-06-30-AM.png'
    }

    try {
      // Call the addBalance server action
      const result = await addBalance(balanceData)

      if (result.success) {
        // Update local state
        setData(prev =>
          prev.map(item =>
            item._id === selectedCustomer._id
              ? {
                  ...item,
                  account_info: {
                    ...item.account_info,
                    balance: (item.account_info?.balance || 0) + Number(balanceForm.amount)
                  }
                }
              : item
          )
        )

        // Show success message
        const Swal = (await import('sweetalert2')).default

        showSuccess('Balance added successfully')

        // Close modal and reset form
        setOpenBalanceModal(false)
        setBalanceForm({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          transaction_Id: '',
          slip_img: null,
          note: '',
          payment_method: 'cash'
        })
      } else {
        // Show error message
        const Swal = (await import('sweetalert2')).default

        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: result.error || 'Failed to add balance'
        })
      }
    } catch (error) {
      console.error('Error adding balance:', error)
      const Swal = (await import('sweetalert2')).default

      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'An unexpected error occurred'
      })
    } finally {
      setIsAddingBalance(false) // Stop loading
    }
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search name, phone, email'
            className='max-sm:is-full'
            disabled={isLoading}
          />
          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <CustomTextField
              select
              value={paginationData?.limit || table.getState().pagination.pageSize}
              onChange={e => {
                const newSize = Number(e.target.value)

                if (onPageSizeChange) {
                  onPageSizeChange(newSize)
                } else {
                  table.setPageSize(newSize)
                }
              }}
              className='is-full sm:is-[70px]'
              disabled={isLoading}
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
              <MenuItem value='100'>100</MenuItem>
            </CustomTextField>

            <Button
              variant='contained'
              color='primary'
              className='max-sm:is-full'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setCustomerUserOpen(!customerUserOpen)}
              disabled={isLoading}
            >
              Add Customer
            </Button>
          </div>
        </CardContent>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className='whitespace-nowrap border-r text-sm'>
                      {header.isPlaceholder ? null : (
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
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    <div className='flex flex-col items-center justify-center gap-2'>
                      <i className='tabler-loader-2 animate-spin text-2xl text-primary' />
                      <Typography variant='body2' className='text-textSecondary'>
                        Loading customers...
                      </Typography>
                    </div>
                  </td>
                </tr>
              ) : table.getFilteredRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    <div className='flex flex-col items-center justify-center gap-2'>
                      <i className='tabler-database-off text-2xl text-textSecondary' />
                      <Typography variant='body2' className='text-textSecondary'>
                        No data available
                      </Typography>
                    </div>
                  </td>
                </tr>
              ) : (
                table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td className='whitespace-nowrap border-r' key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          component={() => (
            <TablePaginationComponent
              table={table}
              paginationData={paginationData}
              onPageChange={onPageChange}
              disabled={isLoading}
            />
          )}
          count={paginationData?.total || 0}
          rowsPerPage={paginationData?.limit || 10}
          page={(paginationData?.currentPage || 1) - 1}
          onPageChange={(_, page) => onPageChange(page + 1)}
        />
      </Card>

      <AddCustomerDrawer
        open={customerUserOpen}
        handleClose={() => setCustomerUserOpen(!customerUserOpen)}
        setData={setData}
        customerData={data}
      />

      {/* Add Balance Modal */}
      {openBalanceModal && selectedCustomer && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
          onClick={e => {
            if (e.target === e.currentTarget) {
              setOpenBalanceModal(false)
            }
          }}
          style={{ backdropFilter: 'blur(4px)' }}
        >
          <div
            className='w-full max-w-md bg-white text-gray-800 rounded-2xl shadow-2xl p-6 transition-all duration-300 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
            onClick={e => e.stopPropagation()}
          >
            <Typography variant='h6' className='mb-4 font-semibold text-gray-900 text-center'>
              Add Balance for <span className='text-primary'>{selectedCustomer.basic_info?.name}</span>
            </Typography>

            <Typography variant='body2' className='text-gray-600 mb-4 text-center'>
              Fill in the transaction details below
            </Typography>

            {/* Date Input */}
            <CustomTextField
              fullWidth
              label='Date'
              type='date'
              value={balanceForm.date}
              onChange={e => setBalanceForm(prev => ({ ...prev, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                style: { backgroundColor: '#f9fafb', borderRadius: '8px', color: '#111827' }
              }}
              sx={{
                '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                '& input': { color: '#111827' },
                '& label': { color: '#6b7280' }
              }}
              className='mb-4'
            />

            {/* Amount Input */}
            <CustomTextField
              fullWidth
              label='Amount (৳)'
              type='number'
              required
              value={balanceForm.amount}
              onChange={e => setBalanceForm(prev => ({ ...prev, amount: e.target.value }))}
              InputProps={{
                style: { backgroundColor: '#f9fafb', borderRadius: '8px', color: '#111827' }
              }}
              sx={{
                '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                '& input': { color: '#111827' },
                '& label': { color: '#6b7280' }
              }}
              className='mb-4'
            />

            {/* Transaction ID */}
            <CustomTextField
              fullWidth
              label='Transaction ID'
              required
              value={balanceForm.transaction_Id}
              onChange={e => setBalanceForm(prev => ({ ...prev, transaction_Id: e.target.value }))}
              InputProps={{
                style: { backgroundColor: '#f9fafb', borderRadius: '8px', color: '#111827' }
              }}
              sx={{
                '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                '& input': { color: '#111827' },
                '& label': { color: '#6b7280' }
              }}
              className='mb-4'
            />

            {/* Payment Method */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Payment Method <span className='text-red-500'>*</span>
              </label>
              <select
                value={balanceForm.payment_method}
                onChange={e => setBalanceForm(prev => ({ ...prev, payment_method: e.target.value }))}
                className='w-full px-4 py-2.5 bg-[#f9fafb] border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400 cursor-pointer appearance-none'
                required
              >
                <option value='cash'>Cash</option>
                <option value='bank'>Bank</option>
                <option value='MFS'>MFS (Mobile Financial Service)</option>
              </select>
            </div>

            {/* Note Text Area */}
            <CustomTextField
              fullWidth
              label='Note (Optional)'
              multiline
              minRows={3}
              value={balanceForm.note}
              onChange={e => setBalanceForm(prev => ({ ...prev, note: e.target.value }))}
              placeholder='Additional notes...'
              InputProps={{
                style: { backgroundColor: '#f9fafb', borderRadius: '8px', color: '#111827' }
              }}
              sx={{
                '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                '& textarea': { color: '#111827' },
                '& label': { color: '#6b7280' }
              }}
              className='mb-4'
            />

            {/* Upload Slip Image */}
            <div className='flex flex-col gap-2 mb-4'>
              <label className='text-sm font-medium text-gray-700'>Upload Payment Slip (Optional)</label>
              <input
                type='file'
                accept='image/*'
                onChange={e => {
                  const file = e.target.files?.[0]

                  if (file) {
                    setBalanceForm(prev => ({ ...prev, slip_img: file }))
                  }
                }}
                className='w-full rounded-lg border border-gray-300 p-2 text-sm bg-gray-50 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition'
              />
              {balanceForm.slip_img && (
                <div className='mt-2 flex justify-center'>
                  <img
                    src={URL.createObjectURL(balanceForm.slip_img)}
                    alt='Payment Slip Preview'
                    className='max-h-40 rounded-lg shadow-md object-contain border border-gray-200'
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className='flex justify-end gap-3 mt-6 max-sm:flex-col'>
              <Button
                variant='outlined'
                onClick={() => {
                  setOpenBalanceModal(false)
                  setBalanceForm({
                    date: new Date().toISOString().split('T')[0],
                    amount: '',
                    transaction_Id: '',
                    slip_img: null,
                    note: '',
                    payment_method: 'cash'
                  })
                }}
                className='px-4 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition w-full sm:w-auto'
              >
                Cancel
              </Button>

              <Button
                variant='contained'
                color='primary'
                className='px-5 py-2 rounded-lg shadow-md w-full sm:w-auto'
                onClick={handleBalanceSubmit}
                disabled={isAddingBalance}
                startIcon={isAddingBalance ? <i className='tabler-loader-2 animate-spin' /> : null}
              >
                {isAddingBalance ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Crate Modal */}
      {openCrateModal && selectedCustomer && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <div className='w-full max-w-md bg-white text-gray-800 rounded-2xl shadow-2xl p-6 transition-all duration-300'>
            <Typography variant='h6' className='mb-4 font-semibold text-gray-900'>
              Update Crates for <span className='text-primary'>{selectedCustomer.basic_info?.name}</span>
            </Typography>

            <Typography variant='body2' className='text-gray-600 mb-3'>
              Update crate quantities and prices.
            </Typography>

            <div className='space-y-4 max-h-[60vh] overflow-y-auto pr-2'>
              {/* Type 1 */}
              <div className='grid grid-cols-2 gap-4 p-3 rounded-lg bg-gray-50 border border-gray-200'>
                <CustomTextField
                  label='Type 1 Quantity'
                  type='number'
                  value={crateForm.type_1}
                  onChange={e => setCrateForm(prev => ({ ...prev, type_1: Number(e.target.value) }))}
                  InputProps={{
                    style: { backgroundColor: '#f9fafb', borderRadius: '8px', color: '#111827' }
                  }}
                  sx={{
                    '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                    '& input': { color: '#111827' },
                    '& label': { color: '#6b7280' }
                  }}
                />
                <CustomTextField
                  label='Type 1 Price'
                  type='number'
                  value={crateForm.type_1_price}
                  onChange={e => setCrateForm(prev => ({ ...prev, type_1_price: Number(e.target.value) }))}
                  InputProps={{
                    style: { backgroundColor: '#f9fafb', borderRadius: '8px', color: '#111827' }
                  }}
                  sx={{
                    '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                    '& input': { color: '#111827' },
                    '& label': { color: '#6b7280' }
                  }}
                />
              </div>

              {/* Type 2 */}
              <div className='grid grid-cols-2 gap-4 p-3 rounded-lg bg-gray-50 border border-gray-200'>
                <CustomTextField
                  label='Type 2 Quantity'
                  type='number'
                  value={crateForm.type_2}
                  onChange={e => setCrateForm(prev => ({ ...prev, type_2: Number(e.target.value) }))}
                  InputProps={{
                    style: { backgroundColor: '#f9fafb', borderRadius: '8px', color: '#111827' }
                  }}
                  sx={{
                    '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                    '& input': { color: '#111827' },
                    '& label': { color: '#6b7280' }
                  }}
                />
                <CustomTextField
                  label='Type 2 Price'
                  type='number'
                  value={crateForm.type_2_price}
                  onChange={e => setCrateForm(prev => ({ ...prev, type_2_price: Number(e.target.value) }))}
                  InputProps={{
                    style: { backgroundColor: '#f9fafb', borderRadius: '8px', color: '#111827' }
                  }}
                  sx={{
                    '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                    '& input': { color: '#111827' },
                    '& label': { color: '#6b7280' }
                  }}
                />
              </div>
            </div>

            <div className='flex justify-end gap-3 mt-6'>
              <Button
                variant='outlined'
                disabled={isUpdatingCrate}
                onClick={() => setOpenCrateModal(false)}
                className='px-4 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition'
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                color='primary'
                disabled={isUpdatingCrate}
                className='px-5 py-2 rounded-lg shadow-md'
                onClick={async () => {
                  setIsUpdatingCrate(true)

                  try {
                    // Prepare complete customer data with updated crate info
                    const completeCustomerData = {
                      basic_info: {
                        sl: selectedCustomer.basic_info?.sl,
                        name: selectedCustomer.basic_info?.name,
                        role: selectedCustomer.basic_info?.role || 'customer',
                        avatar: selectedCustomer.basic_info?.avatar || ''
                      },
                      contact_info: {
                        email: selectedCustomer.contact_info?.email,
                        phone: selectedCustomer.contact_info?.phone,
                        location: selectedCustomer.contact_info?.location || ''
                      },
                      account_info: {
                        account_number: selectedCustomer.account_info?.account_number || '',
                        balance: selectedCustomer.account_info?.balance || 0,
                        due: selectedCustomer.account_info?.due || 0,
                        return_amount: selectedCustomer.account_info?.return_amount || 0
                      },
                      crate_info: {
                        type_1: crateForm.type_1 || 0,
                        type_1_price: crateForm.type_1_price || 0,
                        type_2: crateForm.type_2 || 0,
                        type_2_price: crateForm.type_2_price || 0
                      }
                    }

                    // Call the update API
                    const result = await updateCustomer(selectedCustomer._id, completeCustomerData)

                    if (result.success) {
                      // Update local state
                      setData(prev =>
                        prev.map(item =>
                          item._id === selectedCustomer._id
                            ? {
                                ...item,
                                crate_info: {
                                  type_1: crateForm.type_1 || 0,
                                  type_1_price: crateForm.type_1_price || 0,
                                  type_2: crateForm.type_2 || 0,
                                  type_2_price: crateForm.type_2_price || 0
                                }
                              }
                            : item
                        )
                      )

                      // Show success message
                      const Swal = (await import('sweetalert2')).default

                      Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: result.message || 'Crate information updated successfully',
                        timer: 2000,
                        showConfirmButton: false
                      })

                      // Close modal
                      setOpenCrateModal(false)
                    } else {
                      // Show error message
                      const Swal = (await import('sweetalert2')).default

                      Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: result.error || 'Failed to update crate information'
                      })
                    }
                  } catch (error) {
                    console.error('Error updating crate:', error)
                    const Swal = (await import('sweetalert2')).default

                    Swal.fire({
                      icon: 'error',
                      title: 'Error!',
                      text: 'An unexpected error occurred'
                    })
                  } finally {
                    setIsUpdatingCrate(false)
                  }
                }}
              >
                {isUpdatingCrate ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CustomerListTable
