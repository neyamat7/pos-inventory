'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { updateSupplier } from '@/actions/supplierAction'

// import { updateSupplier } from '@/actions/supplierActions'

const EditSupplierInfo = ({ open, handleClose, supplierData, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      // Basic Info
      name: '',
      sl: '',

      // Contact Info
      email: '',
      phone: '',
      location: '',

      // Account Info
      accountNumber: '',
      balance: '',
      due: '',

      // Crate Info

      crate1Price: '',
      remainingCrate1: '',

      crate2Price: '',
      remainingCrate2: ''
    }
  })

  // Prefill values when dialog opens
  useEffect(() => {
    if (supplierData) {
      reset({
        // Basic Info
        name: supplierData.basic_info?.name || '',
        sl: supplierData.basic_info?.sl || '',

        // Contact Info
        email: supplierData.contact_info?.email || '',
        phone: supplierData.contact_info?.phone || '',
        location: supplierData.contact_info?.location || '',

        // Account Info
        accountNumber: supplierData.account_info?.accountNumber || '',
        balance: supplierData.account_info?.balance || '',
        due: supplierData.account_info?.due || '',

        // Crate Info

        crate1Price: supplierData.crate_info?.crate1Price || '',
        remainingCrate1: supplierData.crate_info?.remainingCrate1 || '',

        crate2Price: supplierData.crate_info?.crate2Price || '',
        remainingCrate2: supplierData.crate_info?.remainingCrate2 || ''
      })
    }
  }, [supplierData, reset])

  const onSubmit = async data => {
    setLoading(true)
    setError('')

    try {
      const supplierPayload = {
        // Basic Information
        basic_info: {
          sl: data.sl.toString(),
          name: data.name.trim(),

          role: 'supplier'
        },

        // Contact Information
        contact_info: {
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          location: data.location?.trim() || ''
        },

        // Account & Balance Information
        account_info: {
          accountNumber: data.accountNumber?.trim() || '',
          balance: Number(data.balance || 0),
          due: Number(data.due || 0)
        },

        // Crate Information
        crate_info: {
          crate1Price: Number(data.crate1Price || 0),
          remainingCrate1: Number(data.remainingCrate1 || 0),

          crate2Price: Number(data.crate2Price || 0),
          remainingCrate2: Number(data.remainingCrate2 || 0)
        }
      }

      // Call the update supplier action
      const result = await updateSupplier(supplierData._id, supplierPayload)

      if (result.success) {
        onSave(result.data)
        handleClose()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to update supplier. Please try again.')
      console.error('Update error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='lg'
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }}
        />
        <DialogTitle sx={{ color: 'white', position: 'relative', pb: 2 }}>
          <Box component='div' sx={{ typography: 'h4', fontWeight: 'semibold' }}>
            Edit Supplier
          </Box>
          <Typography variant='body2' sx={{ opacity: 0.9, mt: 1 }}>
            Update supplier details and account information
          </Typography>
        </DialogTitle>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 0 }}>
          {error && (
            <Alert
              severity='error'
              sx={{
                mx: 4,
                mt: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'error.light'
              }}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={4} sx={{ p: 4 }}>
            {/* Left Column - Basic & Contact Info */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant='h6'
                    sx={{
                      mb: 3,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 20,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2
                      }}
                    />
                    Basic Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='sl'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            label='SL Number'
                            placeholder='S001'
                            error={!!errors.sl}
                            helperText={errors.sl && 'Required'}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='name'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            label='Supplier Name'
                            placeholder='Ahmed Suppliers'
                            error={!!errors.name}
                            helperText={errors.name && 'Required'}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>

                  <Typography
                    variant='h6'
                    sx={{
                      mt: 4,
                      mb: 3,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 20,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2
                      }}
                    />
                    Contact Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name='email'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            type='email'
                            label='Email'
                            placeholder='supplier.update@example.com'
                            error={!!errors.email}
                            helperText={errors.email && 'Required'}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='phone'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            label='Phone'
                            placeholder='+8801798765432'
                            error={!!errors.phone}
                            helperText={errors.phone && 'Required'}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='location'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            label='Location'
                            placeholder='Chittagong, Bangladesh'
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Account & Crate Info */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant='h6'
                    sx={{
                      mb: 3,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 20,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2
                      }}
                    />
                    Account Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name='accountNumber'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            label='Account Number'
                            placeholder='ACC789012'
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='balance'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            type='number'
                            label='Balance'
                            placeholder='7500'
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='due'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            type='number'
                            label='Due Amount'
                            placeholder='2000'
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>

                  <Typography
                    variant='h6'
                    sx={{
                      mt: 4,
                      mb: 3,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 20,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2
                      }}
                    />
                    Crate Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        name='crate1Price'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            type='number'
                            label='Crate 1 Price'
                            placeholder='55'
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        name='remainingCrate1'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            type='number'
                            label='Remaining Crate 1'
                            placeholder='10'
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        name='crate2Price'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            type='number'
                            label='Crate 2 Price'
                            placeholder='80'
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        name='remainingCrate2'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            type='number'
                            label='Remaining Crate 2'
                            placeholder='5'
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 4, pt: 0, gap: 2 }}>
          <Button
            onClick={handleClose}
            color='secondary'
            variant='outlined'
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1
            }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            {loading ? 'Updating...' : 'Update Supplier'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditSupplierInfo
