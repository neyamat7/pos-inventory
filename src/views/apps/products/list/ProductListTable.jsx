// ProductListTable.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'

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
import Swal from 'sweetalert2'

import TableFilters from './TableFilters'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import ProductViewModal from './ProductViewModal'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

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

const columnHelper = createColumnHelper()

const ProductListTable = ({ productData, paginationData, loading, onPageChange, onPageSizeChange }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])

  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    if (productData) {
      setData(productData)
      setFilteredData(productData)
    }
  }, [productData])

  const handleDelete = row => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${row.original.productName}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        setData(prev => prev?.filter(p => p._id !== row.original._id))
        setFilteredData(prev => prev?.filter(p => p._id !== row.original._id))
        Swal.fire('Deleted!', `"${row.original.productName}" has been removed.`, 'success')
      }
    })
  }

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },
      columnHelper.accessor('productName', {
        header: 'Product',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <img
              src={row.original.productImage}
              width={38}
              height={38}
              className='rounded bg-actionHover object-cover'
              alt={row.original.productName}
            />
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.productName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {row.original.description?.substring(0, 30)}...
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('basePrice', {
        header: 'Price',
        cell: ({ row }) => <Typography>৳{row.original.basePrice?.toLocaleString() || '0'}</Typography>
      }),
      columnHelper.accessor('commissionRate', {
        header: 'Commission',
        cell: ({ row }) => {
          const commission = row.original.commissionRate
          const allowCommission = row.original.allowCommission

          return <Typography>{allowCommission ? `${commission}%` : 'N/A'}</Typography>
        }
      }),
      columnHelper.accessor('categoryId', {
        header: 'Category',
        cell: ({ row }) => <Typography>{row.original.categoryId?.categoryName || 'No Category'}</Typography>
      }),
      columnHelper.accessor('isCrated', {
        header: 'Crate',
        cell: ({ row }) => (
          <Chip
            label={row.original.isCrated ? 'Yes' : 'No'}
            color={row.original.isCrated ? 'success' : 'default'}
            variant='tonal'
            size='small'
          />
        )
      }),
      columnHelper.accessor('isBoxed', {
        header: 'Box',
        cell: ({ row }) => (
          <Chip
            label={row.original.isBoxed ? 'Yes' : 'No'}
            color={row.original.isBoxed ? 'success' : 'default'}
            variant='tonal'
            size='small'
          />
        )
      }),
      columnHelper.accessor('allowCommission', {
        header: 'Commission Allowed',
        cell: ({ row }) => (
          <Chip
            label={row.original.allowCommission ? 'Yes' : 'No'}
            color={row.original.allowCommission ? 'success' : 'default'}
            variant='tonal'
            size='small'
          />
        )
      }),
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton aria-label='View' onClick={() => setSelectedProduct(row.original)}>
              <i className='tabler-eye text-textSecondary' />
            </IconButton>
            <Link href={`/apps/products/edit/${row.original._id}`}>
              <IconButton aria-label='Edit'>
                <i className='tabler-edit text-textSecondary' />
              </IconButton>
            </Link>
            <IconButton aria-label='Delete' onClick={() => handleDelete(row)}>
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
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

  return (
    <>
      <Card>
        <h1 className='text-3xl font-semibold mt-3 ml-4'>Product List</h1>
        <CardHeader title='Filters' />
        <TableFilters setData={setFilteredData} productData={data} />
        <Divider />
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Product'
            className='max-sm:is-full'
          />
          <div className='flex flex-wrap items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
            <CustomTextField
              select
              value={paginationData?.limit || 10}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className='flex-auto is-[70px] max-sm:is-full'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>
            <Button
              variant='contained'
              component={Link}
              className='max-sm:is-full is-auto'
              href='/apps/products/add'
              startIcon={<i className='tabler-plus' />}
            >
              Add Product
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className='whitespace-nowrap border-r'>
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
            {
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      Loading...
                    </td>
                  </tr>
                ) : table.getFilteredRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No data available
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
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
            }
          </table>
        </div>

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

      {/* View Modal */}
      {selectedProduct && <ProductViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </>
  )
}

export default ProductListTable
