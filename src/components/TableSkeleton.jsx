'use client'

// MUI Imports
import Skeleton from '@mui/material/Skeleton'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

const TableSkeleton = ({ rows = 10, columns = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton animation='wave' variant='text' />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default TableSkeleton
