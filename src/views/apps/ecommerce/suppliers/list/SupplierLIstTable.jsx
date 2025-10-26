'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

import { unstable_noStore as noStore } from 'next/cache'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

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
  getPaginationRowModel,
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
  noStore()

  const getCrateSummary = crate => {
    if (!crate) return '—'

    // show each crate type with qty only
    return Object.entries(crate)
      .map(([key, val]) => `${key.replace('_', ' ')}: ${val.qty}`)
      .join(' | ')
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
  const [openProfitModal, setOpenProfitModal] = useState(false)
  const [profitPercentage, setProfitPercentage] = useState('')
  const [balanceNote, setBalanceNote] = useState('')
  const [balanceFile, setBalanceFile] = useState('')

  // New states for lot selection in profit modal
  const [supplierLots, setSupplierLots] = useState([]) // store fetched lots
  const [selectedLot, setSelectedLot] = useState(null) // selected lot
  const [lotError, setLotError] = useState('') // validation message

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
      columnHelper.accessor('sl', {
        header: 'SL',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.sl}</Typography>
      }),
      columnHelper.accessor('name', {
        header: 'name',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ avatar: row.original.image, customer: row.original.name })}
            <div className='flex flex-col items-start'>
              <Typography
                component={Link}
                color='text.primary'
                href={`/apps/suppliers/details/${row.original.sl}`}
                className='font-medium hover:text-primary'
              >
                {row.original.name}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Typography>{row.original.phone}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('balance', {
        header: 'Balance',
        cell: ({ row }) => <Typography color='text.primary'>৳{row.original.balance}</Typography>
      }),
      columnHelper.accessor('crate', {
        header: 'Crate',
        cell: ({ row }) => <Typography>{getCrateSummary(row.original.crate)}</Typography>
      }),
      columnHelper.accessor('cost', {
        header: 'Cost',
        cell: ({ row }) => <Typography color='text.primary'>৳{row.original.cost}</Typography>
      }),
      columnHelper.accessor('due', {
        header: 'Due',
        cell: ({ row }) => <Typography>৳{row.original.due}</Typography>
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
                  text: 'Adjust Profit',
                  icon: 'tabler-percentage',
                  menuItemProps: {
                    onClick: async () => {
                      const supplier = row.original

                      setSelectedSupplier(supplier)
                      setProfitPercentage('')
                      setSelectedLot(null)
                      setLotError('')

                      // Fetch last 6 lots for this supplier
                      const lots = await fetchLotsBySupplier(supplier.sl)

                      setSupplierLots(lots)

                      setOpenProfitModal(true)
                    },
                    className: 'flex items-center text-blue-600'
                  }
                },

                {
                  text: 'Add Crate',
                  icon: 'tabler-box',
                  menuItemProps: {
                    onClick: () => {
                      setSelectedSupplier(row.original)
                      const crateObj = row.original.crate || {}

                      const newForm = Object.keys(crateObj).reduce((acc, key) => {
                        acc[key] = { qty: crateObj[key].qty, price: crateObj[key].price }

                        return acc
                      }, {})

                      setCrateForm(newForm)
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
                        text: `You are about to delete ${row.original.name}. This action cannot be undone.`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Yes, delete it!'
                      }).then(result => {
                        if (result.isConfirmed) {
                          setData(prev => prev.filter(item => item.sl !== row.original.sl))
                          Swal.fire('Deleted!', `${row.original.name} has been removed.`, 'success')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const getAvatar = params => {
    const { avatar, customer } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(customer)}
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
                      prev.map(item =>
                        item.sl === selectedSupplier.sl
                          ? {
                              ...item,
                              balance: item.balance + Number(newBalance),
                              note: balanceNote,
                              document: balanceFile
                            }
                          : item
                      )
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
                Update Crates for <span className='text-primary'>{selectedSupplier.name}</span>
              </Typography>

              <Typography variant='body2' className='text-gray-600 mb-3'>
                You can adjust the quantity and price for each crate type.
              </Typography>

              <div className='space-y-4 max-h-[60vh] overflow-y-auto pr-2'>
                {Object.entries(crateForm).map(([key, val]) => (
                  <div key={key} className='grid grid-cols-2 gap-4 p-3 rounded-lg bg-gray-50 border border-gray-200'>
                    <CustomTextField
                      label={`${key.replace('_', ' ')} Qty`}
                      type='number'
                      value={val.qty}
                      onChange={e =>
                        setCrateForm(prev => ({
                          ...prev,
                          [key]: { ...prev[key], qty: Number(e.target.value) }
                        }))
                      }
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
                      label={`${key.replace('_', ' ')} Price`}
                      type='number'
                      value={val.price}
                      onChange={e =>
                        setCrateForm(prev => ({
                          ...prev,
                          [key]: { ...prev[key], price: Number(e.target.value) }
                        }))
                      }
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
                ))}
              </div>

              <div className='flex justify-end gap-3 mt-6'>
                <Button
                  variant='outlined'
                  onClick={() => setOpenCrateModal(false)}
                  className='px-4 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition'
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  className='px-5 py-2 rounded-lg shadow-md'
                  onClick={() => {
                    setData(prev =>
                      prev.map(item => (item.sl === selectedSupplier.sl ? { ...item, crate: crateForm } : item))
                    )
                    setOpenCrateModal(false)
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Adjust Profit Modal */}
      {/* Adjust Profit Modal */}
      {openProfitModal &&
        selectedSupplier &&
        createPortal(
          <div className='fixed inset-0 z-[9999] flex items-center h-screen justify-center bg-black/40 p-4'>
            <div className='w-full max-w-md bg-white/80 backdrop-blur-lg text-gray-800 rounded-2xl shadow-2xl border border-gray-200 p-6 animate-fadeIn scale-100 transition-all duration-300 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
              <div className='text-center mb-5'>
                <div className='w-14 h-14 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center'>
                  <i className='tabler-percentage text-3xl text-blue-600'></i>
                </div>
                <Typography variant='h6' className='font-semibold text-gray-900'>
                  Adjust Profit Share
                </Typography>
                <Typography variant='body2' className='text-gray-600 mt-1'>
                  Select a lot and enter the profit percentage for{' '}
                  <span className='font-medium text-blue-600'>{selectedSupplier.name}</span>.
                </Typography>
              </div>

              {/* Profit Input */}
              <CustomTextField
                fullWidth
                label='Profit Share (%)'
                type='number'
                value={profitPercentage}
                onChange={e => setProfitPercentage(e.target.value)}
                placeholder='e.g. 10'
                InputProps={{
                  style: { backgroundColor: '#f9fafb', borderRadius: '10px', color: '#111827' }
                }}
                sx={{
                  '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '10px' },
                  '& input': { color: '#111827', textAlign: 'center', fontWeight: 500, fontSize: '18px' },
                  '& label': { color: '#6b7280' }
                }}
                className='mb-5'
              />

              {/* Select Lot Section */}
              <Typography variant='subtitle2' className='mb-2 text-gray-700 font-medium'>
                Select Lot to Apply Profit Share
              </Typography>

              <div className='max-h-[220px] overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-2 space-y-2'>
                {supplierLots.length === 0 ? (
                  <Typography variant='body2' className='text-gray-500 text-center py-3'>
                    No lots found for this supplier.
                  </Typography>
                ) : (
                  supplierLots.map(lot => (
                    <label
                      key={lot.lot_name}
                      className={`flex items-start gap-3 cursor-pointer border rounded-lg p-3 transition-all duration-200 ${
                        selectedLot?.lot_name === lot.lot_name
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type='radio'
                        name='selectedLot'
                        value={lot.lot_name}
                        checked={selectedLot?.lot_name === lot.lot_name}
                        onChange={() => {
                          setSelectedLot(lot)
                          setLotError('')
                        }}
                        className='mt-1 accent-blue-600'
                      />
                      <div className='flex flex-col'>
                        <Typography variant='body2' className='font-semibold text-gray-900'>
                          {lot.lot_name}
                        </Typography>
                        <Typography variant='body2' className='text-gray-600'>
                          {lot.product} — {lot.category}
                        </Typography>
                        <Typography variant='caption' className='text-gray-500'>
                          Purchased: {lot.purchaseDate}
                        </Typography>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {lotError && (
                <Typography variant='caption' className='text-red-500 mt-1'>
                  {lotError}
                </Typography>
              )}

              {/* Buttons */}
              <div className='flex justify-end gap-3 mt-6 max-sm:flex-col pb-2'>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setOpenProfitModal(false)
                    setSelectedLot(null)
                    setSupplierLots([])
                    setProfitPercentage('')
                    setLotError('')
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
                    if (!profitPercentage) return setLotError('Enter a profit percentage.')
                    if (!selectedLot) return setLotError('Please select a lot before saving.')

                    setData(prev =>
                      prev.map(item =>
                        item.sl === selectedSupplier.sl
                          ? {
                              ...item,
                              profitShare: Number(profitPercentage),
                              selectedLot: selectedLot.lot_name
                            }
                          : item
                      )
                    )
                    setOpenProfitModal(false)
                    setSelectedLot(null)
                    setSupplierLots([])
                  }}
                >
                  Save
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
