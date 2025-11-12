'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid2'

import { Box, Paper, Typography } from '@mui/material'

import ShowIncomeTable from './ShowIncomeTable'
import { getIncomePeriods } from '@/actions/incomeActions'

const ShowIncomePage = ({ incomeData = [], paginationData, loading = false, onPageChange, onPageSizeChange }) => {
  const [incomeStats, setIncomeStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0
  })

  useEffect(() => {
    const fetchIncomeStats = async () => {
      try {
        const result = await getIncomePeriods()

        console.log('periods data', result)

        if (result.success) {
          setIncomeStats(result.data)
        }
      } catch (error) {
        console.error('Error fetching income stats:', error)
      }
    }

    fetchIncomeStats()
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  color: 'white',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.2)'
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography
                    className='text-white text-lg'
                    variant='subtitle2'
                    sx={{ mb: 1, opacity: 0.9, fontWeight: 500 }}
                  >
                    Daily Income
                  </Typography>
                  <Typography className='text-white' variant='h5' fontWeight='bold' sx={{ mb: 1 }}>
                    ৳{incomeStats.daily?.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <i className='tabler-calendar' style={{ fontSize: '14px', opacity: 0.8 }} />
                    <Typography className='text-white' variant='caption' sx={{ opacity: 0.8 }}>
                      Today
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.08)'
                  }}
                />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)',
                  color: 'white',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(6, 182, 212, 0.15)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(6, 182, 212, 0.2)'
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography
                    className='text-white text-lg'
                    variant='subtitle2'
                    sx={{ mb: 1, opacity: 0.9, fontWeight: 500 }}
                  >
                    Weekly Income
                  </Typography>
                  <Typography className='text-white' variant='h5' fontWeight='bold' sx={{ mb: 1 }}>
                    ৳{incomeStats.weekly?.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <i className='tabler-calendar-week' style={{ fontSize: '14px', opacity: 0.8 }} />
                    <Typography className='text-white' variant='caption' sx={{ opacity: 0.8 }}>
                      This Week
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.08)'
                  }}
                />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                  color: 'white',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.2)'
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography
                    className='text-white text-lg'
                    variant='subtitle2'
                    sx={{ mb: 1, opacity: 0.9, fontWeight: 500 }}
                  >
                    Monthly Income
                  </Typography>
                  <Typography className='text-white' variant='h5' fontWeight='bold' sx={{ mb: 1 }}>
                    ৳{incomeStats.monthly?.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <i className='tabler-calendar-month' style={{ fontSize: '14px', opacity: 0.8 }} />
                    <Typography className='text-white' variant='caption' sx={{ opacity: 0.8 }}>
                      This Month
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.08)'
                  }}
                />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                  color: 'white',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.2)'
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography
                    className='text-white text-lg'
                    variant='subtitle2'
                    sx={{ mb: 1, opacity: 0.9, fontWeight: 500 }}
                  >
                    Yearly Income
                  </Typography>
                  <Typography className='text-white' variant='h5' fontWeight='bold' sx={{ mb: 1 }}>
                    ৳{incomeStats.yearly?.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <i className='tabler-calendar-year' style={{ fontSize: '14px', opacity: 0.8 }} />
                    <Typography className='text-white' variant='caption' sx={{ opacity: 0.8 }}>
                      This Year
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.08)'
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <ShowIncomeTable
          incomeData={incomeData}
          paginationData={paginationData}
          loading={loading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </Grid>
    </Grid>
  )
}

export default ShowIncomePage
