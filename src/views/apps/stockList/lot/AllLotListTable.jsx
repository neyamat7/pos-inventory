'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import classnames from 'classnames'
import Swal from 'sweetalert2'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
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
import { IconButton } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Util Imports
import tableStyles from '@core/styles/table.module.css'
import { updateLotStatus } from '@/actions/lotActions'

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const AllLotListTable = ({ lotData = [], paginationData, loading, onPageChange, onPageSizeChange }) => {
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    setData(lotData)
  }, [lotData])

  // Updated status change handler with proper revert logic
  const handleStatusChange = async (lotId, newStatus) => {
    // Store the original status before optimistic update
    const originalItem = data.find(item => item._id === lotId)
    const originalStatus = originalItem?.status

    try {
      // Optimistic UI update
      setData(prevData => prevData.map(item => (item._id === lotId ? { ...item, status: newStatus } : item)))

      // Call server action
      const result = await updateLotStatus(lotId, newStatus)

      if (!result.success) {
        // Revert to original status if failed
        setData(prevData => prevData.map(item => (item._id === lotId ? { ...item, status: originalStatus } : item)))
        Swal.fire('Error!', result.message, 'error')
      } else {
        Swal.fire('Updated!', 'Lot status updated successfully.', 'success')
      }
    } catch (error) {
      // Revert to original status on error
      setData(prevData => prevData.map(item => (item._id === lotId ? { ...item, status: originalStatus } : item)))
      Swal.fire('Error!', 'Failed to update lot status', 'error')
    }
  }

  const handleDelete = row => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${row.original.lot_name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        setData(prev => prev.filter(item => item._id !== row.original._id))
        Swal.fire('Deleted!', 'The lot has been deleted.', 'success')
      }
    })
  }

  const columns = [
    {
      accessorKey: 'purchase_date',
      header: 'Purchase Date',
      cell: ({ getValue }) => {
        const value = getValue()

        if (!value) return '—'
        const date = new Date(value)

        return date.toLocaleDateString('en-GB')
      }
    },
    {
      accessorKey: 'lot_name',
      header: 'Lot Name'
    },
    {
      accessorKey: 'productsId.productName',
      header: 'Product',
      cell: ({ row }) => row.original.productsId?.productName || '—'
    },
    {
      accessorKey: 'supplierId.basic_info.name',
      header: 'Supplier',
      cell: ({ row }) => row.original.supplierId?.basic_info?.name || '—'
    },
    {
      accessorKey: 'carat',
      header: 'Total Carat',
      cell: ({ row }) => {
        const carat1 = row.original.carat?.carat_Type_1 || 0
        const carat2 = row.original.carat?.carat_Type_2 || 0

        return carat1 + carat2
      }
    },
    {
      accessorKey: 'box_quantity',
      header: 'Total Boxes',
      cell: ({ row }) => {
        const boxQty = row.original.box_quantity || 0

        return boxQty > 0 ? boxQty : '—'
      }
    },
    {
      accessorKey: 'costs.unitCost',
      header: 'Unit Cost',
      cell: ({ getValue }) => {
        const value = getValue()

        return value ? `৳${value}` : '—'
      }
    },
    {
      accessorKey: 'sales.totalKgSold',
      header: 'Sold (kg)',
      cell: ({ getValue }) => getValue() || 0
    },
    {
      accessorKey: 'sold_boxes',
      header: 'Sold (Boxes)',
      cell: ({ row }) => {
        const totalBoxes = row.original.box_quantity || 0
        const remainingBoxes = row.original.remaining_boxes || 0
        const soldBoxes = totalBoxes - remainingBoxes

        // Only show if lot has boxes
        return totalBoxes > 0 ? soldBoxes : '—'
      }
    },

    {
      accessorKey: 'sales.totalSoldPrice',
      header: 'Sold Amount',
      cell: ({ getValue }) => {
        const value = getValue()

        return value ? `৳${value}` : '৳0'
      }
    },
    {
      accessorKey: 'profits.totalProfit',
      header: 'Profit',
      cell: ({ getValue }) => {
        const value = getValue()

        return value ? `৳${value}` : '৳0'
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status

        return (
          <CustomTextField
            select
            size='small'
            value={status}
            onChange={e => handleStatusChange(row.original._id, e.target.value)}
            sx={{
              minWidth: 120,
              '& .MuiSelect-select': {
                color: status === 'in stock' ? '#2e7d32' : '#d32f2f',
                fontWeight: 500
              }
            }}
          >
            <MenuItem value='in stock' sx={{ color: '#2e7d32', fontWeight: 500 }}>
              In Stock
            </MenuItem>
            <MenuItem value='stock out' sx={{ color: '#d32f2f', fontWeight: 500 }}>
              Stock Out
            </MenuItem>
          </CustomTextField>
        )
      }
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex items-center'>
          <IconButton aria-label='Delete' onClick={() => handleDelete(row)}>
            <i className='tabler-trash text-textSecondary' />
          </IconButton>
        </div>
      ),
      enableSorting: false
    }
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: paginationData?.totalPages || 1
  })

  return (
    <Card>
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Lot'
          className='sm:is-auto'
        />
        <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
          <CustomTextField
            select
            value={paginationData?.limit || 10}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className='is-[70px] max-sm:is-full'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
            <MenuItem value='100'>100</MenuItem>
          </CustomTextField>
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

          {data.length === 0 ? (
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
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className={classnames('whitespace-nowrap border border-solid border-gray-200 text-gray-800')}
                      >
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
      {/* SERVER-SIDE Pagination */}
      <TablePagination
        component={() => (
          <TablePaginationComponent table={table} paginationData={paginationData} onPageChange={onPageChange} />
        )}
        count={paginationData?.total || 0}
        rowsPerPage={paginationData?.limit || 10}
        page={(paginationData?.currentPage || 1) - 1}
        onPageChange={(_, page) => {
          onPageChange(page + 1)
        }}
      />
    </Card>
  )
}

export default AllLotListTable
