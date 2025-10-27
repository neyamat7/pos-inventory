// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import UserListTable from './UserListTable'
import UserListCards from './UserListCards'

const UserList = ({ userData, paginationData, loading, onPageChange, onPageSizeChange }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserListTable
          userData={userData}
          paginationData={paginationData}
          loading={loading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </Grid>
    </Grid>
  )
}

export default UserList
