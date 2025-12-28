'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'

import { createPortal } from 'react-dom'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import classnames from 'classnames'

// Component Imports
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

import OptionMenu from '@/@core/components/option-menu'
import { uploadImage } from '@/actions/imageActions'
import { addBalance } from '@/actions/supplierAction'
import TableSkeleton from '@/components/TableSkeleton'
import { getImageUrl } from '@/utils/getImageUrl'
import { showError, showInfo, showSuccess } from '@/utils/toastUtils'
import AddSupplierDrawer from './AddSupplierDrawer'

export const paymentStatus = {
  1: { text: 'Paid', color: 'success' },
  2: { text: 'Pending', color: 'warning' },
  3: { text: 'Cancelled', color: 'secondary' },
  4: { text: 'Failed', color: 'error' }
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

const SupplierListTable = ({
  supplierData = [],
  paginationData,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  refreshData,
  searchValue = '',
  onSearchChange
}) => {
  const getCrateSummary = crateInfo => {
    if (!crateInfo) return '—'

    // Handle both old and new crate structures
    const summary = []

    if (crateInfo.crate1 > 0) {
      summary.push(`Crate 1: ${crateInfo.crate1}`)
    }

    if (crateInfo.crate2 > 0) {
      summary.push(`Crate 2: ${crateInfo.crate2}`)
    }

    // Handle old dynamic crate format
    Object.entries(crateInfo).forEach(([key, val]) => {
      if (typeof val === 'object' && val.qty > 0) {
        summary.push(`${key.replace('_', ' ')}: ${val.qty}`)
      }
    })

    return summary.length > 0 ? summary.join(' | ') : 'No crates'
  }

  // States
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(supplierData)
  const [globalFilter, setGlobalFilter] = useState('')

  // For modals
  const [openBalanceModal, setOpenBalanceModal] = useState(false)
  const [openCrateModal, setOpenCrateModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)

  const [isAddingBalance, setIsAddingBalance] = useState(false)

  const [balanceForm, setBalanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    transaction_Id: '',
    slip_img: null,
    note: '',
    payment_method: 'cash'
  })

  useEffect(() => {
    setData(supplierData)
  }, [supplierData])

  const handlePageSizeChange = newSize => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize)
    } else {
      table.setPageSize(newSize)
    }
  }

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
        cell: ({ row }) => (
          <Typography color='text.primary'>{row.original.basic_info?.sl || row.original.sl}</Typography>
        )
      }),
      columnHelper.accessor('basic_info.name', {
        header: 'Name',
        cell: ({ row }) => {
          const name = row.original.basic_info?.name || row.original.name
          const email = row.original.contact_info?.email || row.original.email
          const avatar = row.original.basic_info?.avatar || row.original.image

          return (
            <div className='flex items-center gap-3'>
              {/* Updated avatar with helper function */}
              {avatar ? (
                <CustomAvatar src={getImageUrl(avatar)} skin='light' size={34} />
              ) : (
                <CustomAvatar skin='light' size={34}>
                  {getInitials(name || 'S')}
                </CustomAvatar>
              )}

              <div className='flex flex-col items-start'>
                <Typography
                  component={Link}
                  color='text.primary'
                  href={`/apps/suppliers/details/${row.original._id}`}
                  className='font-medium hover:text-primary'
                >
                  {name || 'No Name'}
                </Typography>
                {email && <Typography variant='body2'>{email}</Typography>}
              </div>
            </div>
          )
        }
      }),

      columnHelper.accessor('contact_info.phone', {
        header: 'Phone',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Typography>{row.original.contact_info?.phone || row.original.phone || '-'}</Typography>
          </div>
        )
      }),

      columnHelper.accessor('account_info.balance', {
        header: 'Balance',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            ৳{row.original.account_info?.balance || row.original.balance || 0}
          </Typography>
        )
      }),
      columnHelper.accessor('crate_info', {
        header: 'Crate',
        cell: ({ row }) => <Typography>{getCrateSummary(row.original.crate_info || row.original.crate)}</Typography>
      }),
      columnHelper.accessor('account_info.cost', {
        header: 'Cost',
        cell: ({ row }) => (
          <Typography color='text.primary'>৳{row.original.account_info?.cost || row.original.cost || 0}</Typography>
        )
      }),
      columnHelper.accessor('account_info.due', {
        header: 'Due',
        cell: ({ row }) => <Typography>৳{row.original.account_info?.due || row.original.due || 0}</Typography>
      }),

      {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Add Balance',
                  icon: 'tabler-coin',
                  menuItemProps: {
                    onClick: () => {
                      setSelectedSupplier(row.original)
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
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      }
    ],
    []
  )

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
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const handleBalanceSubmit = async () => {
    // Validation
    if (!balanceForm.amount || !balanceForm.transaction_Id || !balanceForm.payment_method) {
      showInfo('Please fill in all required fields')

      return
    }

    setIsAddingBalance(true)

    try {
      let slipImageUrl = balanceForm.slip_img

      // ========== UPLOAD SLIP IMAGE IF FILE EXISTS ==========
      if (balanceForm.slip_img && typeof balanceForm.slip_img !== 'string') {
        const formData = new FormData()

        formData.append('image', balanceForm.slip_img)

        const uploadResult = await uploadImage(formData)

        if (uploadResult.success) {
          // Extract filename and construct proper URL
          const imagePath = uploadResult.data?.filepath || uploadResult.data.imageUrl

          slipImageUrl = imagePath
        } else {
          showError(`Slip image upload failed: ${uploadResult.error}`)
          setIsAddingBalance(false)

          return
        }
      }

      // ========== PREPARE BALANCE DATA ==========
      const balanceData = {
        date: balanceForm.date,
        amount: balanceForm.amount,
        transaction_Id: balanceForm.transaction_Id,
        note: balanceForm.note,
        payment_method: balanceForm.payment_method,
        balance_for: selectedSupplier._id,
        role: 'supplier',
        slip_img: slipImageUrl || null
      }

      // ========== CALL ADD BALANCE ACTION ==========
      const result = await addBalance(balanceData)

      if (result.success) {
        // Update local state
        setData(prev =>
          prev.map(item => {
            if (item._id === selectedSupplier._id) {
              if (item.account_info) {
                return {
                  ...item,
                  account_info: {
                    ...item.account_info,
                    balance: (item.account_info.balance || 0) + Number(balanceForm.amount)
                  }
                }
              } else {
                return {
                  ...item,
                  balance: (item.balance || 0) + Number(balanceForm.amount)
                }
              }
            }

            return item
          })
        )

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
        showError(result.error || 'Failed to add balance')
      }
    } catch (error) {
      console.error('Error adding balance:', error)
      showError('An unexpected error occurred')
    } finally {
      setIsAddingBalance(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <CustomTextField
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            placeholder='Search by supplier name...'
            className='max-sm:is-full'
          />
          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <CustomTextField
              select
              value={paginationData?.limit || table.getState().pagination.pageSize}
              onChange={e => handlePageSizeChange(Number(e.target.value))}
              className='is-full sm:is-[70px]'
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
            >
              Add Supplier
            </Button>
          </div>
        </CardContent>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className='whitespace-nowrap border-r'>
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

            <tbody>
              {isLoading ? (
                <TableSkeleton columns={table.getVisibleFlatColumns().length} />
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
                table.getRowModel().rows.map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td className='whitespace-nowrap border-r' key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          component={() => (
            <TablePaginationComponent table={table} paginationData={paginationData} onPageChange={onPageChange} />
          )}
          count={paginationData?.total || table.getFilteredRowModel().rows.length}
          rowsPerPage={paginationData?.limit || table.getState().pagination.pageSize}
          page={(paginationData?.currentPage || table.getState().pagination.pageIndex + 1) - 1}
          onPageChange={(_, page) => {
            if (onPageChange) {
              onPageChange(page + 1)
            } else {
              table.setPageIndex(page)
            }
          }}
        />
      </Card>
      <AddSupplierDrawer
        open={customerUserOpen}
        handleClose={() => setCustomerUserOpen(!customerUserOpen)}
        setData={setData}
        supplierData={data}
        refreshData={refreshData}
      />

      {/* Add Balance Modal */}
      {openBalanceModal &&
        selectedSupplier &&
        createPortal(
          <div
            className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4'
            onClick={e => {
              // Close modal when clicking backdrop
              if (e.target === e.currentTarget) {
                setOpenBalanceModal(false)
              }
            }}
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <div
              className='w-full max-w-md bg-white backdrop-blur-lg text-gray-800 rounded-2xl shadow-2xl p-6 transition-all duration-300 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
              onClick={e => e.stopPropagation()}
            >
              <Typography variant='h6' className='mb-4 font-semibold text-gray-900 text-center'>
                Add Balance for{' '}
                <span className='text-primary'>{selectedSupplier.basic_info?.name || selectedSupplier.name}</span>
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
                  className='w-full px-4 py-2.5 bg-[#f9fafb] border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400 cursor-pointer appearance-none}
                  required'
                >
                  <option value='cash'>Cash</option>
                  <option value='bank'>Bank</option>
                  <option value='MFS'>MFS</option>
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
                <label className='text-sm font-medium text-gray-700'>
                  Upload Payment Slip {isAddingBalance && '(Uploading...)'}
                </label>

                <input
                  type='file'
                  accept='image/*'
                  onChange={e => {
                    const file = e.target.files?.[0]

                    if (file) {
                      setBalanceForm(prev => ({ ...prev, slip_img: file }))
                    }
                  }}
                  disabled={isAddingBalance}
                  className={`w-full rounded-lg border border-gray-300 p-2 text-sm bg-gray-50 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition ${
                    isAddingBalance ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />

                {/* ========== IMAGE PREVIEW ========== */}
                {balanceForm.slip_img && (
                  <div className='mt-2 flex flex-col items-center gap-2'>
                    <Typography variant='body2' color='text.secondary'>
                      Preview:
                    </Typography>
                    <img
                      src={
                        typeof balanceForm.slip_img === 'string'
                          ? balanceForm.slip_img
                          : URL.createObjectURL(balanceForm.slip_img)
                      }
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
          </div>,
          document.body
        )}
    </>
  )
}

export default SupplierListTable
