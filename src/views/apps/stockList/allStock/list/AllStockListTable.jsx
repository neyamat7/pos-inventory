'use client'

// React Imports
import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

// Next Imports

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import classnames from 'classnames'
import Swal from 'sweetalert2'
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
import { IconButton } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import OptionMenu from '@core/components/option-menu'
import ProductViewModal from './ProductViewModal'

// Util Imports
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

// Column Definitions
const columnHelper = createColumnHelper()

const AllStockListTable = ({ stockProductsData = [] }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(...[stockProductsData])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState(null)

  const handleEdit = row => {
    setEditFormData(row.original)
    setEditModalOpen(true)
  }

  const handleEditSubmit = () => {
    setData(prevData => prevData.map(item => (item.sl === editFormData.sl ? editFormData : item)))
    setEditModalOpen(false)
    Swal.fire('Updated!', 'Product information updated successfully.', 'success')
  }

  const handleDelete = row => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${row.original.product}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        setData(prev => prev.filter(item => item.sl !== row.original.sl))
        Swal.fire('Deleted!', 'The product has been deleted.', 'success')
      }
    })
  }

  const columns = [
    { accessorKey: 'sl', header: 'SL' },
    { accessorKey: 'product', header: 'Product' },
    { accessorKey: 'supplier_name', header: 'Supplier' },
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'cost', header: 'Cost' },
    { accessorKey: 'qty', header: 'Quantity' },
    { accessorKey: 'sale', header: 'Sale Price' },
    {
      id: 'stockValue',
      header: 'Stock Value',
      cell: ({ row }) => row.original.cost * row.original.qty
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex items-center'>
          {/* Edit Button */}
          <IconButton aria-label='Edit' onClick={() => handleEdit(row)} color='primary'>
            <i className='tabler-edit text-textSecondary' />
          </IconButton>

          {/* Delete Button with SweetAlert2 confirm */}
          <IconButton
            aria-label='Delete'
            onClick={() => {
              Swal.fire({
                title: 'Are you sure?',
                text: `You are about to delete "${row.original.product}". This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
              }).then(result => {
                if (result.isConfirmed) {
                  handleDelete(row)
                  Swal.fire('Deleted!', `"${row.original.product}" has been removed successfully.`, 'success')
                }
              })
            }}
          >
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
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
      <Card>
        <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Product'
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
                  .map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td className='whitespace-nowrap border-r' key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
        />
      </Card>
      {/* Edit Product Modal */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        fullWidth
        maxWidth='md'
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 4,
            p: 2,
            backgroundColor: 'background.paper'
          }
        }}
      >
        <DialogTitle className='text-lg font-semibold border-b pb-2'>Edit Product Details</DialogTitle>

        <DialogContent dividers>
          {editFormData && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Product Name'
                  value={editFormData.product}
                  onChange={e => setEditFormData({ ...editFormData, product: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Supplier Name'
                  value={editFormData.supplier_name}
                  onChange={e => setEditFormData({ ...editFormData, supplier_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Category'
                  value={editFormData.category}
                  onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Code'
                  value={editFormData.code}
                  onChange={e => setEditFormData({ ...editFormData, code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  label='Cost'
                  type='number'
                  value={editFormData.cost}
                  onChange={e => setEditFormData({ ...editFormData, cost: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  label='Quantity'
                  type='number'
                  value={editFormData.qty}
                  onChange={e => setEditFormData({ ...editFormData, qty: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  label='Sale Price'
                  type='number'
                  value={editFormData.sale}
                  onChange={e => setEditFormData({ ...editFormData, sale: Number(e.target.value) })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions className='border-t pt-3'>
          <Button variant='outlined' color='secondary' onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>
          <Button variant='contained' color='primary' onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {selectedProduct && <ProductViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </>
  )
}

export default AllStockListTable
