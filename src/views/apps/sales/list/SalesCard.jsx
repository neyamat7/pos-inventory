// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/material/Box'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const SalesCard = ({ salesData }) => {
  // Calculate stats from sales data
  const totalSales = salesData?.length || 0
  const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.payment_details?.payable_amount || 0), 0) || 0
  const totalDue = salesData?.reduce((sum, sale) => sum + (sale.payment_details?.due_amount || 0), 0) || 0
  const totalProfit = salesData?.reduce((sum, sale) => sum + (sale.total_profit || 0), 0) || 0

  const data = [
    {
      value: totalSales,
      title: 'Total Sales',
      icon: 'tabler-shopping-cart',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      iconBg: '#eef2ff'
    },
    {
      value: totalRevenue,
      title: 'Total Revenue',
      icon: 'tabler-currency-taka',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      iconBg: '#fef2f2'
    },
    {
      value: totalDue,
      title: 'Total Due',
      icon: 'tabler-wallet',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      iconBg: '#f0f9ff'
    },
    {
      value: totalProfit,
      title: 'Total Profit',
      icon: 'tabler-chart-bar',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      iconBg: '#f0fdf4'
    }
  ]

  // Hooks
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  return (
    <Card
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.8)',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2.5}>
          {data.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Box
                sx={{
                  position: 'relative',
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '20px 18px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                    borderColor: 'transparent',
                    '& .icon-circle': {
                      transform: 'rotate(-10deg) scale(1.15)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    },
                    '& .gradient-bar': {
                      width: '100%'
                    },
                    '& .stat-number': {
                      transform: 'scale(1.05)'
                    }
                  }
                }}
              >
                {/* Top gradient indicator */}
                <Box
                  className='gradient-bar'
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '5px',
                    width: '40%',
                    background: item.gradient,
                    borderRadius: '20px 0 20px 0',
                    transition: 'width 0.4s ease'
                  }}
                />

                <Box display='flex' flexDirection='column' gap={1.5}>
                  {/* Icon section */}
                  <Box display='flex' justifyContent='space-between' alignItems='center'>
                    <Box
                      className='icon-circle'
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '14px',
                        background: item.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        border: '2px solid #f8fafc'
                      }}
                    >
                      <i
                        className={classnames(item.icon)}
                        style={{
                          fontSize: '26px',
                          background: item.gradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      />
                    </Box>

                    {/* Small trend indicator */}
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '8px',
                        background: item.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i
                        className='tabler-trending-up'
                        style={{
                          fontSize: '16px',
                          background: item.gradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Stats section */}
                  <Box>
                    <Typography
                      className='stat-number'
                      sx={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        background: item.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1.2,
                        mb: 0.5,
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      {item.value.toLocaleString()}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#64748b',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                </Box>

                {/* Bottom right decoration */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    width: 60,
                    height: 60,
                    background: item.gradient,
                    opacity: 0.05,
                    borderRadius: '50%',
                    pointerEvents: 'none'
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default SalesCard
