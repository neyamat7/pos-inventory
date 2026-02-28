'use client'

// React Imports
import ListPrintHandler from '@/components/prints/ListPrintHandler'
import { useEffect, useMemo, useRef, useState } from 'react'

// MUI Imports
import Link from 'next/link'

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

import { uploadImage } from '@/actions/imageActions'
import { showError, showInfo, showSuccess } from '@/utils/toastUtils'
import Swal from 'sweetalert2'

// Component Imports
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import GiveDiscountModal from '../GiveDiscountModal'
import AddCustomerDrawer from './AddCustomerDrawer'

import TableSkeleton from '@/components/TableSkeleton'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import { addCustomerBalance, archiveCustomer, updateCustomer } from '@/actions/customerActions'
import tableStyles from '@core/styles/table.module.css'

import { getImageUrl } from '@/utils/getImageUrl'
import { createPortal } from 'react-dom'

// -------------------- utils --------------------
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)
  const isTypingRef = useRef(false)

  useEffect(() => {
    // Only update if user is not actively typing
    if (!isTypingRef.current) {
      setValue(initialValue)
    }
  }, [initialValue])

  useEffect(() => {
    isTypingRef.current = true
    const timeout = setTimeout(() => {
      onChange(value)
      isTypingRef.current = false
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper()

// -------------------- component --------------------
const CustomerListTable = ({
  customerData,
  paginationData,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  onSearchChange,
  refreshData,
  searchValue = ''
}) => {
  // States
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [printData, setPrintData] = useState([])
  const [triggerPrint, setTriggerPrint] = useState(false)

  // Ref to maintain input focus
  const searchInputRef = useRef(null)

  // For modals
  const [openBalanceModal, setOpenBalanceModal] = useState(false)
  const [openCrateModal, setOpenCrateModal] = useState(false)
  const [openDiscountModal, setOpenDiscountModal] = useState(false)
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

  // Use customerData directly - no need to sync to local state
  const tableData = Array.isArray(customerData) ? customerData : customerData?.customers || []

  // Maintain focus on search input after re-renders
  useEffect(() => {
    if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
      const wasSearchInputFocused = document.activeElement?.placeholder === 'Search name, phone, email'
      if (wasSearchInputFocused) {
        searchInputRef.current.focus()
      }
    }
  }, [tableData])

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
          const avatar = row.original.basic_info?.avatar || row.original.image

          return (
            <div className='flex items-center gap-3'>
              {/* Updated avatar with helper function */}
              {avatar ? (
                <CustomAvatar src={getImageUrl(avatar)} skin='light' size={34} />
              ) : (
                <CustomAvatar skin='light' size={34}>
                  {getInitials(name || 'C')}
                </CustomAvatar>
              )}

              <div className='flex flex-col items-start'>
                <Typography
                  component={Link}
                  color='text.primary'
                  href={`/apps/customers/details/${id}`}
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
          <div className='flex items-center gap-1'>
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
                        payment_method: 'cash'
                      })
                      setOpenBalanceModal(true)
                    },
                    className: 'flex items-center'
                  }
                },
                {
                  text: 'Give Discount',
                  icon: 'tabler-discount',
                  menuItemProps: {
                    onClick: () => {
                      setSelectedCustomer(row.original)
                      setOpenDiscountModal(true)
                    },
                    className: 'flex items-center text-info',
                    disabled: (row.original.account_info?.due || 0) <= 0
                  }
                },
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: async () => {
                      const customer = row.original
                      const result = await Swal.fire({
                        title: 'Delete Customer?',
                        html: `<p>Are you sure you want to delete <strong>${customer.basic_info?.name}</strong>?</p><p class="text-sm text-gray-500 mt-2">This customer will be moved to deleted list and won't appear in active customers.</p>`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Yes, Archive',
                        cancelButtonText: 'Cancel'
                      })

                      if (result.isConfirmed) {
                        Swal.fire({
                          title: 'Archiving...',
                          allowOutsideClick: false,
                          didOpen: () => Swal.showLoading()
                        })

                        const response = await archiveCustomer(customer._id)

                        if (response.success) {
                          Swal.fire({
                            title: 'Archived!',
                            text: response.message,
                            icon: 'success',
                            timer: 2000
                          })
                          refreshData()
                        } else {
                          Swal.fire({
                            title: 'Error!',
                            text: response.error,
                            icon: 'error'
                          })
                        }
                      }
                    },
                    className: 'flex items-center text-error'
                  }
                }
                // {
                //   text: 'Update Crate',
                //   icon: 'tabler-box',
                //   menuItemProps: {
                //     onClick: () => {
                //       setSelectedCustomer(row.original)
                //       const crateInfo = row.original.crate_info || {}

                //       setCrateForm({
                //         type_1: crateInfo.type_1 || 0,
                //         type_1_price: crateInfo.type_1_price || 0,
                //         type_2: crateInfo.type_2 || 0,
                //         type_2_price: crateInfo.type_2_price || 0
                //       })
                //       setOpenCrateModal(true)
                //     },
                //     className: 'flex items-center'
                //   }
                // }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    []
  )

  const handleBalanceSubmit = async () => {
    if (!balanceForm.amount || !balanceForm.transaction_Id || !balanceForm.payment_method) {
      showInfo('Please fill in all required fields')

      return
    }

    setIsAddingBalance(true)

    try {
      let slipImageUrl = balanceForm.slip_img

      if (balanceForm.slip_img && typeof balanceForm.slip_img !== 'string') {
        const formData = new FormData()

        formData.append('image', balanceForm.slip_img)

        const uploadResult = await uploadImage(formData)

        if (uploadResult.success) {
          slipImageUrl = uploadResult.data?.filepath || uploadResult.data.imageUrl
        } else {
          showError(`Slip image upload failed: ${uploadResult.error}`)
          setIsAddingBalance(false)

          return
        }
      }

      const balanceData = {
        date: balanceForm.date,
        amount: Number(balanceForm.amount),
        transaction_Id: balanceForm.transaction_Id,
        note: balanceForm.note,
        payment_method: balanceForm.payment_method,
        balance_for: selectedCustomer._id,
        role: 'customer',
        slip_img: slipImageUrl || null
      }

      const result = await addCustomerBalance(balanceData)

      if (result.success) {
        setData(prev =>
          prev.map(item => {
            if (item._id === selectedCustomer._id) {
              const currentBalance = Number(item.account_info?.balance || 0)
              const currentDue = Number(item.account_info?.due || 0)

              return {
                ...item,
                account_info: {
                  ...item.account_info,
                  balance: currentBalance + Number(balanceForm.amount),
                  due: Math.max(0, currentDue - Number(balanceForm.amount))
                }
              }
            }

            return item
          })
        )

        showSuccess('Balance added successfully')
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

  // Table
  const table = useReactTable({
    data: tableData,
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

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <CustomTextField
            inputRef={searchInputRef}
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
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
              variant='tonal'
              color='secondary'
              className='max-sm:is-full'
              startIcon={<i className='tabler-printer' />}
              disabled={Object.keys(rowSelection).length === 0 || isLoading}
              onClick={() => {
                const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
                setPrintData(selectedRows)
                setTriggerPrint(true)
              }}
            >
              Print
            </Button>

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
        refreshData={refreshData}
      />

      <ListPrintHandler
        data={printData}
        type='customer'
        triggerPrint={triggerPrint}
        onPrintComplete={() => setTriggerPrint(false)}
      />

      {/* Add Balance Modal */}
      {openBalanceModal &&
        selectedCustomer &&
        createPortal(
          <div
            className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4'
            onClick={e => {
              if (e.target === e.currentTarget) setOpenBalanceModal(false)
            }}
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <div
              className='w-full max-w-md bg-white backdrop-blur-lg text-gray-800 rounded-2xl shadow-2xl p-6 transition-all duration-300 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
              onClick={e => e.stopPropagation()}
            >
              <Typography variant='h6' className='mb-4 font-semibold text-gray-900 text-center'>
                Add Balance for <span className='text-primary'>{selectedCustomer.basic_info?.name}</span>
              </Typography>

              <Typography variant='body2' className='text-gray-600 mb-4 text-center'>
                Fill in the transaction details below
              </Typography>

              <CustomTextField
                fullWidth
                label='Date'
                type='date'
                value={balanceForm.date}
                onChange={e => setBalanceForm(prev => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                className='mb-4'
              />

              <CustomTextField
                fullWidth
                label='Amount (৳)'
                type='number'
                required
                value={balanceForm.amount}
                onChange={e => setBalanceForm(prev => ({ ...prev, amount: e.target.value }))}
                className='mb-4'
              />

              <CustomTextField
                fullWidth
                label='Transaction ID'
                required
                value={balanceForm.transaction_Id}
                onChange={e => setBalanceForm(prev => ({ ...prev, transaction_Id: e.target.value }))}
                className='mb-4'
              />

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
                  <option value='MFS'>MFS</option>
                </select>
              </div>

              <CustomTextField
                fullWidth
                label='Note (Optional)'
                multiline
                minRows={3}
                value={balanceForm.note}
                onChange={e => setBalanceForm(prev => ({ ...prev, note: e.target.value }))}
                placeholder='Additional notes...'
                className='mb-4'
              />

              <div className='flex flex-col gap-2 mb-4'>
                <label className='text-sm font-medium text-gray-700'>
                  Upload Payment Slip {isAddingBalance && '(Uploading...)'}
                </label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={e => {
                    const file = e.target.files?.[0]

                    if (file) setBalanceForm(prev => ({ ...prev, slip_img: file }))
                  }}
                  disabled={isAddingBalance}
                  className={`w-full rounded-lg border border-gray-300 p-2 text-sm bg-gray-50 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition ${
                    isAddingBalance ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                {balanceForm.slip_img && (
                  <div className='mt-2 flex flex-col items-center gap-2'>
                    <img
                      src={
                        typeof balanceForm.slip_img === 'string'
                          ? balanceForm.slip_img
                          : URL.createObjectURL(balanceForm.slip_img)
                      }
                      alt='Preview'
                      className='max-h-40 rounded-lg shadow-md object-contain border border-gray-200'
                    />
                  </div>
                )}
              </div>

              <div className='flex justify-end gap-3 mt-6 max-sm:flex-col'>
                <Button
                  variant='outlined'
                  onClick={() => setOpenBalanceModal(false)}
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

      {/* Give Discount Modal */}
      <GiveDiscountModal
        open={openDiscountModal}
        handleClose={() => setOpenDiscountModal(false)}
        customerId={selectedCustomer?._id}
        customerName={selectedCustomer?.basic_info?.name}
        currentDue={selectedCustomer?.account_info?.due || 0}
        onSave={() => refreshData()}
      />
    </>
  )
}

export default CustomerListTable
