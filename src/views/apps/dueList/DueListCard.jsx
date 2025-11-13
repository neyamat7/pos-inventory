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

  // Hooks
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          {data.map((item, index) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              key={index}
              className={classnames({
                '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie':
                  isBelowMdScreen && !isBelowSmScreen,
                '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
              })}
            >
              <div className='flex justify-between gap-4'>
                <div className='flex flex-col items-start'>
                  <Typography variant='h4' color='primary'>
                    ৳{totalDue.toLocaleString()}
                  </Typography>
                  <Typography color='text.primary' className='font-medium'>
                    {item.title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {tableData?.length || 0} {selectedType === 'suppliers' ? 'Suppliers' : 'Customers'}
                  </Typography>
                </div>
                <CustomAvatar variant='rounded' size={42} skin='light' color={item.color}>
                  <i className={classnames(item.icon, 'text-[26px]')} />
                </CustomAvatar>
              </div>
              {isBelowMdScreen && !isBelowSmScreen && index < data.length - 2 && (
                <Divider
                  className={classnames('mbs-6', {
                    'mie-6': index % 2 === 0
                  })}
                />
              )}
              {isBelowSmScreen && index < data.length - 1 && <Divider className='mbs-6' />}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default DueListCard
