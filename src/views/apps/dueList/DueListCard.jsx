'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const DueListCard = ({ tableData, selectedType }) => {
  // Calculate total due from current table data using the nested structure
  const totalDue =
    tableData?.reduce((acc, item) => {
      const dueAmount = item?.account_info?.due || 0

      return acc + dueAmount
    }, 0) || 0

  // Vars
  const data = [
    {
      value: totalDue,
      title: `${selectedType === 'suppliers' ? 'Suppliers' : 'Customers'} Due`,
      icon: selectedType === 'suppliers' ? 'tabler-users' : 'tabler-user',
      color: selectedType === 'suppliers' ? 'primary' : 'success'
    }
  ]

  return (
    <Grid container spacing={6}>
      {data.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card sx={{ borderBottom: 4, borderColor: `${item.color}.main` }}>
            <CardContent className='flex justify-between gap-4'>
              <div className='flex flex-col items-start'>
                <Typography variant='h4' color={`${item.color}.main`} sx={{ fontWeight: 700 }}>
                  ৳{item.value.toLocaleString()}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {item.title}
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  {tableData?.length || 0} {selectedType === 'suppliers' ? 'Suppliers' : 'Customers'}
                </Typography>
              </div>
              <CustomAvatar variant='rounded' size={48} skin='light' color={item.color}>
                <i className={classnames(item.icon, 'text-[28px]')} />
              </CustomAvatar>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default DueListCard
