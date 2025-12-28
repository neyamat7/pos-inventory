'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
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

import TableSkeleton from '@/components/TableSkeleton'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import OptionMenu from '@core/components/option-menu'
import AddCategoryDrawer from './AddCategoryDrawer'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import EditCategoryModal from './EditCategoryModal'

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

const ProductCategoryTable = ({ categoryData, paginationData, loading, onPageChange, onPageSizeChange, onRefresh }) => {
  const [editOpen, setEditOpen] = useState(null)

  // States
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})

  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    if (categoryData) {
      setData(categoryData)
    }
  }, [categoryData])

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
      columnHelper.accessor('categoryName', {
        // Changed from categoryTitle
        header: 'Categories',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col items-start'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.categoryName} {/* Changed from categoryTitle */}
              </Typography>
              <Typography variant='body2'>{row.original.description}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('slug', {
        // New column for slug
        header: 'Slug',
        cell: ({ row }) => <Typography>{row.original.slug}</Typography>
      }),

      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => {
          return (
            <div className='flex items-center'>
              <OptionMenu
                tooltipProps={{ title: 'More options' }}
                iconClassName='text-textSecondary'
                iconButtonProps={{ size: 'small' }}
                options={[
                  {
                    text: 'Edit',
                    icon: <i className='tabler-edit mr-2 text-[18px]' />,
                    menuItemProps: {
                      onClick: () => setEditOpen(row.original),
                      className: 'flex items-center'
                    }
                  }
                ]}
              />
            </div>
          )
        },
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          {/* <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search'
            className='max-sm:is-full'
          /> */}
          <div></div>
          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <CustomTextField
              select
              value={paginationData?.limit || 10}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className='flex-auto max-sm:is-full sm:is-[70px]'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='15'>15</MenuItem>
              <MenuItem value='25'>25</MenuItem>
            </CustomTextField>
            <Button
              variant='contained'
              className='max-sm:is-full'
              onClick={() => setAddCategoryOpen(!addCategoryOpen)}
              startIcon={<i className='tabler-plus' />}
            >
              Add Category
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
      <AddCategoryDrawer
        open={addCategoryOpen}
        setData={setData}
        handleClose={() => setAddCategoryOpen(!addCategoryOpen)}
        onSuccess={onRefresh}
      />

      {/* Edit Modal */}
      {editOpen && (
        <EditCategoryModal
          open={!!editOpen}
          handleClose={() => setEditOpen(null)}
          rowData={editOpen}
          setData={setData}
        />
      )}
    </>
  )
}

export default ProductCategoryTable
