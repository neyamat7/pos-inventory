'use client'

import { useRef, useState, useEffect } from 'react'

import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Divider,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  Alert,
  AlertTitle
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Assessment,
  Warning,
  CheckCircle,
  Print,
  Download,
  CalendarToday,
  ShowChart,
  AccountBalance,
  Receipt,
  LocalAtm,
  MoneyOff,
  Inventory,
  ShoppingCart,
  Insights
} from '@mui/icons-material'
import { useReactToPrint } from 'react-to-print'

export default function ProfitLoss({ profitLossData }) {
  const [filterDate, setFilterDate] = useState('')
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })
  const contentRef = useRef(null)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

    setFilterDate(today)
    setDateRange({ startDate: firstDay, endDate: today })
  }, [])

  const handlePrint = useReactToPrint({ contentRef })

  // Use the props data or dummy data
  const {
    totalCustomerProfit = 125000,
    totalLotProfit = 85000,
    totalCombinedProfit = 210000,
    totalLoss = 15000,
    totalRevenue = 450000,
    totalExpenses = 240000,
    grossProfit = 225000,
    netProfit = 210000,
    profitMargin = 46.67,
    totalSales = 350,
    totalPurchases = 280,
    inventoryValue = 180000,
    operationalCosts = 45000,
    administrativeCosts = 25000,
    marketingCosts = 12000,
    otherExpenses = 8000
  } = profitLossData || {}

  // Calculate percentages and metrics
  const netProfitMargin = ((netProfit / totalRevenue) * 100).toFixed(2)
  const grossProfitMargin = ((grossProfit / totalRevenue) * 100).toFixed(2)
  const expenseRatio = ((totalExpenses / totalRevenue) * 100).toFixed(2)
  const profitGrowth = 12.5 // Example growth percentage

  // Status determination
  const isProfitable = netProfit > 0
  const profitStatus = isProfitable ? 'success' : 'error'
  const profitIcon = isProfitable ? <TrendingUp /> : <TrendingDown />

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Box>
            <Typography variant='h4' fontWeight={700} color='text.primary' gutterBottom>
              Profit & Loss Statement
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Comprehensive financial performance analysis
            </Typography>
          </Box>

          <Stack direction='row' spacing={2} className='no-print'>
            <Tooltip title='Print Report'>
              <IconButton onClick={handlePrint} color='primary' sx={{ bgcolor: 'primary.50' }}>
                <Print />
              </IconButton>
            </Tooltip>
            <Tooltip title='Download Report'>
              <IconButton color='success' sx={{ bgcolor: 'success.50' }}>
                <Download />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Date Filters */}
        <Card elevation={0} sx={{ bgcolor: 'white', border: 1, borderColor: 'grey.200' }} className='no-print'>
          <CardContent>
            <Grid container spacing={2} alignItems='center'>
              <Grid item>
                <CalendarToday color='primary' />
              </Grid>
              <Grid item xs>
                <TextField
                  label='Start Date'
                  type='date'
                  size='small'
                  value={dateRange.startDate}
                  onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs>
                <TextField
                  label='End Date'
                  type='date'
                  size='small'
                  value={dateRange.endDate}
                  onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <Button variant='contained' color='primary' size='large'>
                  Apply Filter
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <div ref={contentRef}>
        {/* Key Performance Indicators */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Net Profit KPI */}
          <Grid item xs={12} md={6} lg={3}>
            <Card
              elevation={0}
              sx={{
                bgcolor: isProfitable ? 'success.50' : 'error.50',
                border: 2,
                borderColor: isProfitable ? 'success.main' : 'error.main',
                position: 'relative',
                overflow: 'visible'
              }}
            >
              <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      NET PROFIT
                    </Typography>
                    <Typography
                      variant='h4'
                      fontWeight={700}
                      color={isProfitable ? 'success.dark' : 'error.dark'}
                      sx={{ my: 1 }}
                    >
                      ৳{netProfit.toLocaleString()}
                    </Typography>
                    <Chip
                      icon={profitGrowth > 0 ? <TrendingUp /> : <TrendingDown />}
                      label={`${profitGrowth > 0 ? '+' : ''}${profitGrowth}%`}
                      size='small'
                      color={profitGrowth > 0 ? 'success' : 'error'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Avatar sx={{ bgcolor: isProfitable ? 'success.main' : 'error.main', width: 56, height: 56 }}>
                    {profitIcon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Revenue */}
          <Grid item xs={12} md={6} lg={3}>
            <Card elevation={0} sx={{ bgcolor: 'primary.50', border: 2, borderColor: 'primary.main' }}>
              <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      TOTAL REVENUE
                    </Typography>
                    <Typography variant='h4' fontWeight={700} color='primary.dark' sx={{ my: 1 }}>
                      ৳{totalRevenue.toLocaleString()}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      From {totalSales} sales
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <AttachMoney />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Expenses */}
          <Grid item xs={12} md={6} lg={3}>
            <Card elevation={0} sx={{ bgcolor: 'warning.50', border: 2, borderColor: 'warning.main' }}>
              <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      TOTAL EXPENSES
                    </Typography>
                    <Typography variant='h4' fontWeight={700} color='warning.dark' sx={{ my: 1 }}>
                      ৳{totalExpenses.toLocaleString()}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {expenseRatio}% of revenue
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                    <Receipt />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Profit Margin */}
          <Grid item xs={12} md={6} lg={3}>
            <Card elevation={0} sx={{ bgcolor: 'info.50', border: 2, borderColor: 'info.main' }}>
              <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      PROFIT MARGIN
                    </Typography>
                    <Typography variant='h4' fontWeight={700} color='info.dark' sx={{ my: 1 }}>
                      {netProfitMargin}%
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Net margin ratio
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                    <ShowChart />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Profit Breakdown Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Revenue Breakdown */}
          <Grid item xs={12} lg={6}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'grey.200', height: '100%' }}>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2} mb={3}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <AccountBalance />
                  </Avatar>
                  <Box>
                    <Typography variant='h6' fontWeight={700}>
                      Revenue Breakdown
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Income sources analysis
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2.5}>
                  <Box>
                    <Box display='flex' justifyContent='space-between' mb={1}>
                      <Typography variant='body2' color='text.secondary'>
                        Customer Profit
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        ৳{totalCustomerProfit.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={(totalCustomerProfit / totalRevenue) * 100}
                      sx={{ height: 8, borderRadius: 1, bgcolor: 'success.50' }}
                      color='success'
                    />
                  </Box>

                  <Box>
                    <Box display='flex' justifyContent='space-between' mb={1}>
                      <Typography variant='body2' color='text.secondary'>
                        Lot Profit
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        ৳{totalLotProfit.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={(totalLotProfit / totalRevenue) * 100}
                      sx={{ height: 8, borderRadius: 1, bgcolor: 'info.50' }}
                      color='info'
                    />
                  </Box>

                  <Box>
                    <Box display='flex' justifyContent='space-between' mb={1}>
                      <Typography variant='body2' color='text.secondary'>
                        Other Income
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        ৳{(totalRevenue - totalCustomerProfit - totalLotProfit).toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={((totalRevenue - totalCustomerProfit - totalLotProfit) / totalRevenue) * 100}
                      sx={{ height: 8, borderRadius: 1, bgcolor: 'primary.50' }}
                      color='primary'
                    />
                  </Box>

                  <Divider />

                  <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ pt: 1 }}>
                    <Typography variant='h6' fontWeight={700}>
                      Total Revenue
                    </Typography>
                    <Typography variant='h6' fontWeight={700} color='success.main'>
                      ৳{totalRevenue.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Expense Breakdown */}
          <Grid item xs={12} lg={6}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'grey.200', height: '100%' }}>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2} mb={3}>
                  <Avatar sx={{ bgcolor: 'error.main' }}>
                    <MoneyOff />
                  </Avatar>
                  <Box>
                    <Typography variant='h6' fontWeight={700}>
                      Expense Breakdown
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Cost distribution analysis
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2.5}>
                  <Box>
                    <Box display='flex' justifyContent='space-between' mb={1}>
                      <Typography variant='body2' color='text.secondary'>
                        Operational Costs
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        ৳{operationalCosts.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={(operationalCosts / totalExpenses) * 100}
                      sx={{ height: 8, borderRadius: 1, bgcolor: 'error.50' }}
                      color='error'
                    />
                  </Box>

                  <Box>
                    <Box display='flex' justifyContent='space-between' mb={1}>
                      <Typography variant='body2' color='text.secondary'>
                        Administrative Costs
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        ৳{administrativeCosts.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={(administrativeCosts / totalExpenses) * 100}
                      sx={{ height: 8, borderRadius: 1, bgcolor: 'warning.50' }}
                      color='warning'
                    />
                  </Box>

                  <Box>
                    <Box display='flex' justifyContent='space-between' mb={1}>
                      <Typography variant='body2' color='text.secondary'>
                        Marketing Costs
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        ৳{marketingCosts.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={(marketingCosts / totalExpenses) * 100}
                      sx={{ height: 8, borderRadius: 1, bgcolor: 'secondary.50' }}
                      color='secondary'
                    />
                  </Box>

                  <Box>
                    <Box display='flex' justifyContent='space-between' mb={1}>
                      <Typography variant='body2' color='text.secondary'>
                        Total Losses
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        ৳{totalLoss.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={(totalLoss / totalExpenses) * 100}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>

                  <Divider />

                  <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ pt: 1 }}>
                    <Typography variant='h6' fontWeight={700}>
                      Total Expenses
                    </Typography>
                    <Typography variant='h6' fontWeight={700} color='error.main'>
                      ৳{totalExpenses.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Financial Statement */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'grey.200' }}>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2} mb={3}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Assessment />
                  </Avatar>
                  <Box>
                    <Typography variant='h6' fontWeight={700}>
                      Income Statement
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Detailed profit & loss calculation
                    </Typography>
                  </Box>
                </Box>

                <Paper variant='outlined' sx={{ p: 0 }}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'grey.200' }}>
                    <Typography variant='subtitle2' fontWeight={700} color='primary'>
                      REVENUE
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={8}>
                        <Typography variant='body2'>Total Sales Revenue</Typography>
                      </Grid>
                      <Grid item xs={4} textAlign='right'>
                        <Typography variant='body2' fontWeight={600}>
                          ৳{totalRevenue.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'grey.200' }}>
                    <Typography variant='subtitle2' fontWeight={700} color='warning.main'>
                      COST OF GOODS SOLD
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={8}>
                        <Typography variant='body2'>Direct Costs & Purchases</Typography>
                      </Grid>
                      <Grid item xs={4} textAlign='right'>
                        <Typography variant='body2' fontWeight={600}>
                          ৳{(totalRevenue - grossProfit).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  <Box sx={{ p: 2, bgcolor: 'success.50' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={8}>
                        <Typography variant='body1' fontWeight={700}>
                          Gross Profit
                        </Typography>
                      </Grid>
                      <Grid item xs={4} textAlign='right'>
                        <Typography variant='body1' fontWeight={700} color='success.main'>
                          ৳{grossProfit.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant='caption' color='text.secondary'>
                          Gross Margin: {grossProfitMargin}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'grey.200' }}>
                    <Typography variant='subtitle2' fontWeight={700} color='error.main'>
                      OPERATING EXPENSES
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <Grid container spacing={2}>
                        <Grid item xs={8}>
                          <Typography variant='body2'>• Operational Costs</Typography>
                        </Grid>
                        <Grid item xs={4} textAlign='right'>
                          <Typography variant='body2'>৳{operationalCosts.toLocaleString()}</Typography>
                        </Grid>
                      </Grid>
                      <Grid container spacing={2}>
                        <Grid item xs={8}>
                          <Typography variant='body2'>• Administrative Costs</Typography>
                        </Grid>
                        <Grid item xs={4} textAlign='right'>
                          <Typography variant='body2'>৳{administrativeCosts.toLocaleString()}</Typography>
                        </Grid>
                      </Grid>
                      <Grid container spacing={2}>
                        <Grid item xs={8}>
                          <Typography variant='body2'>• Marketing Costs</Typography>
                        </Grid>
                        <Grid item xs={4} textAlign='right'>
                          <Typography variant='body2'>৳{marketingCosts.toLocaleString()}</Typography>
                        </Grid>
                      </Grid>
                      <Grid container spacing={2}>
                        <Grid item xs={8}>
                          <Typography variant='body2'>• Other Expenses & Losses</Typography>
                        </Grid>
                        <Grid item xs={4} textAlign='right'>
                          <Typography variant='body2'>৳{(otherExpenses + totalLoss).toLocaleString()}</Typography>
                        </Grid>
                      </Grid>
                    </Stack>
                  </Box>

                  <Divider />

                  <Box sx={{ p: 2, bgcolor: isProfitable ? 'success.50' : 'error.50' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={8}>
                        <Typography variant='h6' fontWeight={700}>
                          Net Profit
                        </Typography>
                      </Grid>
                      <Grid item xs={4} textAlign='right'>
                        <Typography variant='h6' fontWeight={700} color={isProfitable ? 'success.main' : 'error.main'}>
                          ৳{netProfit.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant='caption' color='text.secondary'>
                          Net Profit Margin: {netProfitMargin}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats & Insights */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Performance Status */}
              <Card elevation={0} sx={{ border: 1, borderColor: 'grey.200' }}>
                <CardContent>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: isProfitable ? 'success.main' : 'error.main' }}>
                      {isProfitable ? <CheckCircle /> : <Warning />}
                    </Avatar>
                    <Box>
                      <Typography variant='subtitle2' fontWeight={700}>
                        Performance Status
                      </Typography>
                      <Chip
                        label={isProfitable ? 'PROFITABLE' : 'LOSS'}
                        color={profitStatus}
                        size='small'
                        sx={{ fontWeight: 700, mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  {isProfitable ? (
                    <Alert severity='success' icon={<CheckCircle />}>
                      <AlertTitle>Strong Performance</AlertTitle>
                      Your business is generating healthy profits with a {netProfitMargin}% net margin.
                    </Alert>
                  ) : (
                    <Alert severity='error' icon={<Warning />}>
                      <AlertTitle>Attention Required</AlertTitle>
                      Current operations are resulting in losses. Review expenses and revenue strategies.
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Business Metrics */}
              <Card elevation={0} sx={{ border: 1, borderColor: 'grey.200' }}>
                <CardContent>
                  <Box display='flex' alignItems='center' gap={2} mb={3}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <Insights />
                    </Avatar>
                    <Typography variant='subtitle2' fontWeight={700}>
                      Business Metrics
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Box display='flex' alignItems='center' gap={1}>
                        <ShoppingCart fontSize='small' color='action' />
                        <Typography variant='body2' color='text.secondary'>
                          Total Sales
                        </Typography>
                      </Box>
                      <Typography variant='body1' fontWeight={600}>
                        {totalSales}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Box display='flex' alignItems='center' gap={1}>
                        <LocalAtm fontSize='small' color='action' />
                        <Typography variant='body2' color='text.secondary'>
                          Total Purchases
                        </Typography>
                      </Box>
                      <Typography variant='body1' fontWeight={600}>
                        {totalPurchases}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Box display='flex' alignItems='center' gap={1}>
                        <Inventory fontSize='small' color='action' />
                        <Typography variant='body2' color='text.secondary'>
                          Inventory Value
                        </Typography>
                      </Box>
                      <Typography variant='body1' fontWeight={600}>
                        ৳{inventoryValue.toLocaleString()}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Box display='flex' alignItems='center' gap={1}>
                        <Assessment fontSize='small' color='action' />
                        <Typography variant='body2' color='text.secondary'>
                          ROI
                        </Typography>
                      </Box>
                      <Chip label={`${((netProfit / totalExpenses) * 100).toFixed(1)}%`} color='primary' size='small' />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Loss Alert (if applicable) */}
              {totalLoss > 0 && (
                <Card elevation={0} sx={{ border: 2, borderColor: 'error.main', bgcolor: 'error.50' }}>
                  <CardContent>
                    <Box display='flex' alignItems='center' gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <Warning />
                      </Avatar>
                      <Typography variant='subtitle2' fontWeight={700} color='error.main'>
                        Loss Alert
                      </Typography>
                    </Box>

                    <Typography variant='body2' color='text.secondary' mb={2}>
                      Total losses recorded: <strong>৳{totalLoss.toLocaleString()}</strong>
                    </Typography>

                    <Typography variant='caption' color='text.secondary'>
                      Review operational efficiency and implement cost control measures to minimize future losses.
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Footer Info */}
        <Card elevation={0} sx={{ border: 1, borderColor: 'grey.200', bgcolor: 'grey.50' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant='caption' color='text.secondary'>
                  Report Generated:{' '}
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
                <Typography variant='caption' color='text.secondary'>
                  Period: {dateRange.startDate ? new Date(dateRange.startDate).toLocaleDateString() : 'N/A'} -{' '}
                  {dateRange.endDate ? new Date(dateRange.endDate).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </Box>
  )
}
