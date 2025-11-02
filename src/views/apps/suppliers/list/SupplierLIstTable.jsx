'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'

import { createPortal } from 'react-dom'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
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
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import AddSupplierDrawer from './AddSupplierDrawer'
import OptionMenu from '@/@core/components/option-menu'
import { updateSupplier } from '@/actions/supplierAction'
import { showError, showSuccess } from '@/utils/toastUtils'

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

const SupplierListTable = ({ supplierData = [], paginationData, onPageChange, onPageSizeChange }) => {
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
  const [newBalance, setNewBalance] = useState('')
  const [crateForm, setCrateForm] = useState({})
  const [balanceNote, setBalanceNote] = useState('')
  const [balanceFile, setBalanceFile] = useState('')
  const [isUpdatingCrate, setIsUpdatingCrate] = useState(false)

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

          return (
            <div className='flex items-center gap-3'>
              {getAvatar(row.original)}
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
                      setNewBalance('')
                      setOpenBalanceModal(true)
                    },
                    className: 'flex items-center'
                  }
                },

                {
                  text: 'Add Crate',
                  icon: 'tabler-box',
                  menuItemProps: {
                    onClick: () => {
                      setSelectedSupplier(row.original)
                      const crateInfo = row.original.crate_info || {}

                      // Initialize crateForm with only crate1 and crate2
                      setCrateForm({
                        crate1: {
                          qty: crateInfo.crate1 || 0,
                          price: crateInfo.crate1Price || 0
                        },
                        crate2: {
                          qty: crateInfo.crate2 || 0,
                          price: crateInfo.crate2Price || 0
                        }
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
                      const name = row.original.basic_info?.name || row.original.name
                      const sl = row.original.basic_info?.sl || row.original.sl

                      Swal.fire({
                        title: 'Are you sure?',
                        text: `You are about to delete ${name}. This action cannot be undone.`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Yes, delete it!'
                      }).then(result => {
                        if (result.isConfirmed) {
                          setData(prev => prev.filter(item => (item.basic_info?.sl || item.sl) !== sl))
                          Swal.fire('Deleted!', `${name} has been removed.`, 'success')
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

  const getAvatar = supplier => {
    const avatar = supplier?.basic_info?.avatar || supplier?.image
    const name = supplier?.basic_info?.name || supplier?.name

    // Add safety check
    if (!name) {
      return (
        <CustomAvatar skin='light' size={34}>
          S
        </CustomAvatar>
      )
    }

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(name)}
        </CustomAvatar>
      )
    }
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search'
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
                {table.getRowModel().rows.map(row => {
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
      />

      {/* Add Balance Modal */}
      {openBalanceModal &&
        selectedSupplier &&
        createPortal(
          <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
            <div className='w-full max-w-md bg-white/80 backdrop-blur-lg text-gray-800 rounded-2xl shadow-2xl p-6 transition-all duration-300 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
              <Typography variant='h6' className='mb-4 font-semibold text-gray-900 text-center'>
                Add Balance for <span className='text-primary'>{selectedSupplier.name}</span>
              </Typography>

              <Typography variant='body2' className='text-gray-600 mb-3 text-center'>
                Enter the amount, attach a note, and upload a document (optional).
              </Typography>

              {/* Amount Input */}
              <CustomTextField
                fullWidth
                label='Amount (৳)'
                type='number'
                value={newBalance}
                onChange={e => setNewBalance(e.target.value)}
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

              {/* Note Text Area */}
              <CustomTextField
                fullWidth
                label='Note'
                multiline
                minRows={3}
                value={balanceNote}
                onChange={e => setBalanceNote(e.target.value)}
                placeholder='Write any additional notes here...'
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

              {/* Upload Document */}
              <div className='flex flex-col gap-2 mb-4'>
                <label className='text-sm font-medium text-gray-700'>Upload Document (optional)</label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={e => {
                    const file = e.target.files[0]

                    if (file) {
                      const reader = new FileReader()

                      reader.onload = () => setBalanceFile(reader.result)
                      reader.readAsDataURL(file)
                    }
                  }}
                  className='w-full rounded-lg border border-gray-300 p-2 text-sm bg-gray-50 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition'
                />
                {balanceFile && (
                  <div className='mt-2 flex justify-center'>
                    <img
                      src={balanceFile}
                      alt='Uploaded Document'
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
                    setBalanceFile('')
                    setBalanceNote('')
                  }}
                  className='px-4 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition w-full sm:w-auto'
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  className='px-5 py-2 rounded-lg shadow-md w-full sm:w-auto'
                  onClick={() => {
                    if (!newBalance) return
                    setData(prev =>
                      prev.map(item => {
                        const itemSl = item.basic_info?.sl || item.sl
                        const selectedSl = selectedSupplier.basic_info?.sl || selectedSupplier.sl

                        if (itemSl === selectedSl) {
                          if (item.account_info) {
                            // New structure
                            return {
                              ...item,
                              account_info: {
                                ...item.account_info,
                                balance: (item.account_info.balance || 0) + Number(newBalance)
                              }
                            }
                          } else {
                            // Old structure
                            return {
                              ...item,
                              balance: (item.balance || 0) + Number(newBalance),
                              note: balanceNote,
                              document: balanceFile
                            }
                          }
                        }

                        return item
                      })
                    )
                    setOpenBalanceModal(false)
                    setBalanceFile('')
                    setBalanceNote('')
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Add Crate Modal */}
      {openCrateModal &&
        selectedSupplier &&
        createPortal(
          <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
            <div className='w-full max-w-lg bg-white text-gray-800 rounded-2xl shadow-2xl p-6 transition-all duration-300 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
              <Typography variant='h6' className='mb-4 font-semibold text-gray-900'>
                Update Crates for{' '}
                <span className='text-primary'>{selectedSupplier.basic_info?.name || selectedSupplier.name}</span>
              </Typography>

              <Typography variant='body2' className='text-gray-600 mb-3'>
                You can adjust the quantity and price for each crate type.
              </Typography>

              <div className='space-y-4 max-h-[60vh] overflow-y-auto pr-2'>
                {/* Crate 1 Section */}
                <div className='p-3 rounded-lg bg-gray-50 border border-gray-200'>
                  <Typography variant='subtitle1' className='mb-3 font-medium text-gray-900'>
                    Crate 1
                  </Typography>
                  <div className='grid grid-cols-2 gap-4'>
                    <CustomTextField
                      label='Quantity'
                      type='number'
                      value={crateForm.crate1?.qty || crateForm.crate1 || 0}
                      onChange={e => {
                        const value = Number(e.target.value)

                        setCrateForm(prev => ({
                          ...prev,
                          crate1: { ...prev.crate1, qty: value }
                        }))
                      }}
                      InputProps={{
                        style: {
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          color: '#111827'
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                        '& input': { color: '#111827' },
                        '& label': { color: '#6b7280' }
                      }}
                    />
                    <CustomTextField
                      label='Price'
                      type='number'
                      value={crateForm.crate1?.price || crateForm.crate1Price || 0}
                      onChange={e => {
                        const value = Number(e.target.value)

                        setCrateForm(prev => ({
                          ...prev,
                          crate1: { ...prev.crate1, price: value }
                        }))
                      }}
                      InputProps={{
                        style: {
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          color: '#111827'
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                        '& input': { color: '#111827' },
                        '& label': { color: '#6b7280' }
                      }}
                    />
                  </div>
                </div>

                {/* Crate 2 Section */}
                <div className='p-3 rounded-lg bg-gray-50 border border-gray-200'>
                  <Typography variant='subtitle1' className='mb-3 font-medium text-gray-900'>
                    Crate 2
                  </Typography>
                  <div className='grid grid-cols-2 gap-4'>
                    <CustomTextField
                      label='Quantity'
                      type='number'
                      value={crateForm.crate2?.qty || crateForm.crate2 || 0}
                      onChange={e => {
                        const value = Number(e.target.value)

                        setCrateForm(prev => ({
                          ...prev,
                          crate2: { ...prev.crate2, qty: value }
                        }))
                      }}
                      InputProps={{
                        style: {
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          color: '#111827'
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                        '& input': { color: '#111827' },
                        '& label': { color: '#6b7280' }
                      }}
                    />
                    <CustomTextField
                      label='Price'
                      type='number'
                      value={crateForm.crate2?.price || crateForm.crate2Price || 0}
                      onChange={e => {
                        const value = Number(e.target.value)

                        setCrateForm(prev => ({
                          ...prev,
                          crate2: { ...prev.crate2, price: value }
                        }))
                      }}
                      InputProps={{
                        style: {
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          color: '#111827'
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                        '& input': { color: '#111827' },
                        '& label': { color: '#6b7280' }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className='flex justify-end gap-3 mt-6'>
                <Button
                  variant='outlined'
                  onClick={() => setOpenCrateModal(false)}
                  disabled={isUpdatingCrate}
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
                      // Prepare complete supplier data with updated crate info
                      const completeSupplierData = {
                        basic_info: {
                          sl: selectedSupplier.basic_info?.sl || selectedSupplier.sl,
                          name: selectedSupplier.basic_info?.name || selectedSupplier.name,
                          avatar: selectedSupplier.basic_info?.avatar || selectedSupplier.avatar || '',
                          role: selectedSupplier.basic_info?.role || 'supplier'
                        },
                        contact_info: {
                          email: selectedSupplier.contact_info?.email || selectedSupplier.email || '',
                          phone: selectedSupplier.contact_info?.phone || selectedSupplier.phone || '',
                          location: selectedSupplier.contact_info?.location || selectedSupplier.location || ''
                        },
                        account_info: {
                          accountNumber:
                            selectedSupplier.account_info?.accountNumber || selectedSupplier.accountNumber || '',
                          balance: selectedSupplier.account_info?.balance || selectedSupplier.balance || 0,
                          due: selectedSupplier.account_info?.due || selectedSupplier.due || 0,
                          cost: selectedSupplier.account_info?.cost || selectedSupplier.cost || 0
                        },
                        crate_info: {
                          crate1: crateForm.crate1?.qty || 0,
                          crate1Price: crateForm.crate1?.price || 0,
                          needToGiveCrate1: selectedSupplier.crate_info?.needToGiveCrate1 || 0,
                          crate2: crateForm.crate2?.qty || 0,
                          crate2Price: crateForm.crate2?.price || 0,
                          needToGiveCrate2: selectedSupplier.crate_info?.needToGiveCrate2 || 0
                        }
                      }

                      // Call the update API
                      const result = await updateSupplier(selectedSupplier._id, completeSupplierData)

                      if (result.success) {
                        // Update local state
                        setData(prev =>
                          prev.map(item => {
                            const itemSl = item.basic_info?.sl || item.sl
                            const selectedSl = selectedSupplier.basic_info?.sl || selectedSupplier.sl

                            if (itemSl === selectedSl) {
                              return {
                                ...item,
                                crate_info: {
                                  ...item.crate_info,
                                  crate1: crateForm.crate1?.qty || 0,
                                  crate1Price: crateForm.crate1?.price || 0,
                                  crate2: crateForm.crate2?.qty || 0,
                                  crate2Price: crateForm.crate2?.price || 0
                                }
                              }
                            }

                            return item
                          })
                        )

                        showSuccess('Crate information updated successfully')

                        // Close modal
                        setOpenCrateModal(false)
                      } else {
                        showError('Failed to update crate information')
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
          </div>,
          document.body
        )}
    </>
  )
}

export default SupplierListTable
