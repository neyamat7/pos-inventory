'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
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

import AddCategoryDrawer from './AddCategoryDrawer'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

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

// Vars
const categoryData = [
  {
    id: 1,
    categoryTitle: 'Fresh Fruits',
    description: 'Buy a variety of fresh and seasonal fruits sourced directly from farms.',
    totalProduct: 1245,
    totalEarning: 85742,
    image: '/images/apps/ecommerce/fruits-1.png'
  },
  {
    id: 2,
    categoryTitle: 'Leafy Vegetables',
    description: 'Shop fresh spinach, lettuce, kale, and other leafy greens for a healthy diet.',
    totalProduct: 978,
    totalEarning: 65412,
    image: '/images/apps/ecommerce/veggies-1.png'
  },
  {
    id: 3,
    categoryTitle: 'Root Vegetables',
    description: 'Explore carrots, potatoes, onions, beets, and more farm-fresh root vegetables.',
    totalProduct: 1689,
    totalEarning: 74218,
    image: '/images/apps/ecommerce/veggies-2.png'
  },
  {
    id: 4,
    categoryTitle: 'Citrus Fruits',
    description: 'Enjoy vitamin-rich oranges, lemons, and limes fresh from the orchard.',
    totalProduct: 1457,
    totalEarning: 62540,
    image: '/images/apps/ecommerce/fruits-2.png'
  },
  {
    id: 5,
    categoryTitle: 'Berries',
    description: 'Shop for strawberries, blueberries, raspberries, and other sweet berries.',
    totalProduct: 856,
    totalEarning: 58210,
    image: '/images/apps/ecommerce/fruits-3.png'
  },
  {
    id: 6,
    categoryTitle: 'Tropical Fruits',
    description: 'Taste exotic tropical fruits like mango, pineapple, papaya, and banana.',
    totalProduct: 1325,
    totalEarning: 69842,
    image: '/images/apps/ecommerce/fruits-4.png'
  },
  {
    id: 7,
    categoryTitle: 'Herbs & Spices',
    description: 'Fresh herbs like coriander, basil, mint, and other aromatic greens.',
    totalProduct: 623,
    totalEarning: 31258,
    image: '/images/apps/ecommerce/veggies-3.png'
  },
  {
    id: 8,
    categoryTitle: 'Organic Vegetables',
    description: 'Certified organic produce grown without pesticides or synthetic fertilizers.',
    totalProduct: 1478,
    totalEarning: 85236,
    image: '/images/apps/ecommerce/veggies-4.png'
  },
  {
    id: 9,
    categoryTitle: 'Seasonal Fruits',
    description: 'Discover the best seasonal fruits available fresh each month.',
    totalProduct: 1034,
    totalEarning: 75984,
    image: '/images/apps/ecommerce/fruits-5.png'
  },
  {
    id: 10,
    categoryTitle: 'Exotic Vegetables',
    description: 'Premium range of imported and gourmet vegetables like broccoli, zucchini, and asparagus.',
    totalProduct: 698,
    totalEarning: 56234,
    image: '/images/apps/ecommerce/veggies-5.png'
  },
  {
    id: 11,
    categoryTitle: 'Mushrooms',
    description: 'Fresh white, button, and oyster mushrooms perfect for every dish.',
    totalProduct: 524,
    totalEarning: 42357,
    image: '/images/apps/ecommerce/veggies-6.png'
  },
  {
    id: 12,
    categoryTitle: 'Nuts & Dried Fruits',
    description: 'Healthy nuts and dried fruits including almonds, cashews, raisins, and dates.',
    totalProduct: 875,
    totalEarning: 69542,
    image: '/images/apps/ecommerce/fruits-6.png'
  }
]

// Column Definitions
const columnHelper = createColumnHelper()

const ProductCategoryTable = () => {
  const [editOpen, setEditOpen] = useState(null)

  // States
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(...[categoryData])
  const [globalFilter, setGlobalFilter] = useState('')

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
      columnHelper.accessor('categoryTitle', {
        header: 'Categories',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {/* <img src={row.original.image} width={38} height={38} className='rounded bg-actionHover' /> */}
            <div className='flex flex-col items-start'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.categoryTitle}
              </Typography>
              <Typography variant='body2'>{row.original.description}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('totalProduct', {
        header: 'Total Products',
        cell: ({ row }) => <Typography>{row.original.totalProduct.toLocaleString()}</Typography>
      }),
      columnHelper.accessor('totalEarning', {
        header: 'Total Earning',
        cell: ({ row }) => (
          <Typography>
            {row.original.totalEarning.toLocaleString('en-IN', { style: 'currency', currency: 'USD' })}
          </Typography>
        )
      }),
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => {
          const handleDelete = () => {
            Swal.fire({
              title: 'Are you sure?',
              text: `You are about to delete "${row.original.categoryTitle}". This action cannot be undone.`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, delete it!'
            }).then(result => {
              if (result.isConfirmed) {
                setData(prev => prev.filter(category => category.id !== row.original.id))
                Swal.fire('Deleted!', `"${row.original.categoryTitle}" has been removed.`, 'success')
              }
            })
          }

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
                  },
                  {
                    text: 'Delete',
                    icon: <i className='tabler-trash mr-2 text-[18px]' />,
                    menuItemProps: {
                      onClick: handleDelete,
                      className: 'flex items-center text-red-500'
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
    [data]
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
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
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
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search'
            className='max-sm:is-full'
          />
          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
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
                  .map(row => {
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
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>
      <AddCategoryDrawer
        open={addCategoryOpen}
        categoryData={data}
        setData={setData}
        handleClose={() => setAddCategoryOpen(!addCategoryOpen)}
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
