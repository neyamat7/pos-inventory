'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
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

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableSkeleton from '@/components/TableSkeleton'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { createExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from '@/actions/expenseActions'

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

// Add Category Modal Component
const AddCategoryModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Swal.fire('Error', 'Category name is required', 'error')

      return
    }

    setLoading(true)

    try {
      const result = await createExpenseCategory(formData)

      if (result.success) {
        Swal.fire('Success', 'Category created successfully', 'success')
        setFormData({ name: '', description: '' })
        onClose()

        // Refresh data after successful creation
        await onSuccess()
      } else {
        Swal.fire('Error', result.error || 'Failed to create category', 'error')
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to create category', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', description: '' })
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle className='flex justify-between items-center'>
        <Typography variant='h5' component='div' fontWeight='bold'>
          Add Expense Category
        </Typography>
        <IconButton onClick={handleClose}>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className='flex flex-col gap-4 mt-4'>
          <CustomTextField
            fullWidth
            label='Category Name'
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder='Enter category name'
          />
          <CustomTextField
            fullWidth
            multiline
            rows={3}
            label='Description'
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder='Enter category description (optional)'
          />
        </div>
      </DialogContent>
      <DialogActions className='p-4'>
        <Button variant='outlined' color='secondary' onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={handleSubmit}
          disabled={loading || !formData.name.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Creating...' : 'Create Category'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Edit Category Modal Component
const EditCategoryModal = ({ open, onClose, category, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || ''
      })
    }
  }, [category])

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Swal.fire('Error', 'Category name is required', 'error')

      return
    }

    setLoading(true)

    try {
      const result = await updateExpenseCategory(category._id, formData)

      if (result.success) {
        Swal.fire('Success', 'Category updated successfully', 'success')
        onClose()

        // Refresh data after successful update
        await onSuccess()
      } else {
        Swal.fire('Error', result.error || 'Failed to update category', 'error')
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to update category', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', description: '' })
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle className='flex justify-between items-center'>
        <Typography variant='h5' component='div' fontWeight='bold'>
          Edit Expense Category
        </Typography>
        <IconButton onClick={handleClose}>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className='flex flex-col gap-4 mt-4'>
          <CustomTextField
            fullWidth
            label='Category Name'
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder='Enter category name'
          />
          <CustomTextField
            fullWidth
            multiline
            rows={3}
            label='Description'
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder='Enter category description'
          />
        </div>
      </DialogContent>
      <DialogActions className='p-4'>
        <Button variant='outlined' color='secondary' onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={handleSubmit}
          disabled={loading || !formData.name.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Updating...' : 'Update Category'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const ExpenseCategoryTable = ({
  categoryData,
  paginationData,
  loading,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onRefresh, // NEW: Add this prop to refresh data
  searchTerm
}) => {
  // States
  const [data, setData] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Update local data when props change
  useEffect(() => {
    if (categoryData) {
      setData(categoryData)
    }
  }, [categoryData])

  // Handle search
  useEffect(() => {
    if (onSearch) {
      onSearch(globalFilter)
    }
  }, [globalFilter, onSearch])

  // Handle delete category
  const handleDelete = async category => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete category "${category.name}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteExpenseCategory(category._id)

        if (deleteResult.success) {
          Swal.fire('Deleted!', `Category "${category.name}" has been removed.`, 'success')

          // Refresh data after successful deletion
          if (onRefresh) {
            await onRefresh()
          }
        } else {
          Swal.fire('Error', deleteResult.error || 'Failed to delete category', 'error')
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete category', 'error')
      }
    }
  }

  // Handle edit category
  const handleEdit = category => {
    setSelectedCategory(category)
    setEditModalOpen(true)
  }

  // Handle success - just refresh data
  const handleSuccess = async () => {
    if (onRefresh) {
      await onRefresh()
    }
  }

  // Table columns
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
      {
        accessorKey: 'name',
        header: 'Category Name',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.name}</Typography>
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <Typography className='max-w-xs truncate' title={row.original.description}>
            {row.original.description || '-'}
          </Typography>
        )
      },
      {
        accessorKey: 'createdAt',
        header: 'Created Date',
        cell: ({ row }) => (
          <Typography>
            {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-'}
          </Typography>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Button
              variant='outlined'
              size='small'
              color='primary'
              startIcon={<i className='tabler-edit' />}
              onClick={() => handleEdit(row.original)}
            >
              Edit
            </Button>
            <Button
              variant='outlined'
              size='small'
              color='error'
              startIcon={<i className='tabler-trash' />}
              onClick={() => handleDelete(row.original)}
            >
              Delete
            </Button>
          </div>
        ),
        enableSorting: false
      }
    ],
    []
  )

  const table = useReactTable({
    data: data || [],
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
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search categories...'
            className='max-sm:is-full'
          />
          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <CustomTextField
              select
              value={paginationData?.limit || 10}
              onChange={e => onPageSizeChange(Number(e.target.value))}
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
              onClick={() => setAddModalOpen(true)}
            >
              Add Category
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
              {loading ? (
                <TableSkeleton columns={table.getVisibleFlatColumns().length} />
              ) : table.getFilteredRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                    No categories found
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

      {/* Add Category Modal */}
      <AddCategoryModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={handleSuccess} />

      {/* Edit Category Modal */}
      <EditCategoryModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default ExpenseCategoryTable
