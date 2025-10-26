// MUI Imports
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

const TablePaginationComponent = ({ table, paginationData, onPageChange }) => {
  // Use server-side data if available, otherwise fallback to client-side
  const totalItems = paginationData?.total || table.getFilteredRowModel().rows.length
  const currentPage = paginationData?.currentPage || table.getState().pagination.pageIndex + 1
  const pageSize = paginationData?.limit || table.getState().pagination.pageSize
  const totalPages = paginationData?.totalPages || Math.ceil(totalItems / pageSize)

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
      <Typography color='text.disabled'>{`Showing ${startItem} to ${endItem} of ${totalItems} entries`}</Typography>
      <Pagination
        shape='rounded'
        color='primary'
        variant='tonal'
        count={totalPages}
        page={currentPage}
        onChange={(_, page) => {
          if (onPageChange) {
            onPageChange(page) // Server-side pagination
          } else {
            table.setPageIndex(page - 1) // Client-side pagination (fallback)
          }
        }}
        showFirstButton
        showLastButton
      />
    </div>
  )
}

export default TablePaginationComponent
