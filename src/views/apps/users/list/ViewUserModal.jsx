'use client'

import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Button,
  Typography
} from '@mui/material'

import Grid from '@mui/material/Grid2'

import CloseIcon from '@mui/icons-material/Close'

import { getImageUrl } from '@/utils/getImageUrl'

export default function ViewUserModal({ open, user, onClose, onEdit }) {
  if (!user) return null

  // Helper function to get proper image URL
  const userImageUrl = user.image ? getImageUrl(user.image) : ''

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='md'
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='h5' fontWeight='bold'>
            User Details
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* User Profile Section */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.08))',
                borderRadius: 3,
                p: 4,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Grid container spacing={3} alignItems='center'>
                <Grid size={{ xs: 12, sm: 'auto' }}>
                  <Avatar
                    src={userImageUrl}
                    alt={user.name}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 3,
                      border: '3px solid',
                      borderColor: 'primary.main'
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='h4' fontWeight='bold' gutterBottom>
                    {user.name}
                  </Typography>
                  <Chip
                    label={user.role || 'No Role'}
                    color={
                      user.role === 'admin'
                        ? 'error'
                        : user.role === 'manager'
                          ? 'warning'
                          : user.role === 'operator'
                            ? 'info'
                            : 'default'
                    }
                    sx={{
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Personal Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant='h6' fontWeight='bold' color='primary.main' gutterBottom>
              Personal Information
            </Typography>
            <Box
              sx={{
                p: 3,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='body2' color='text.secondary' fontWeight='medium'>
                      Full Name
                    </Typography>
                    <Typography variant='body1' fontWeight='500'>
                      {user.name || '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='body2' color='text.secondary' fontWeight='medium'>
                      User ID
                    </Typography>
                    <Typography variant='body1' fontWeight='500' fontFamily='monospace'>
                      {user._id || '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='body2' color='text.secondary' fontWeight='medium'>
                      Email Address
                    </Typography>
                    <Typography variant='body1' fontWeight='500'>
                      {user.email || '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='body2' color='text.secondary' fontWeight='medium'>
                      Phone Number
                    </Typography>
                    <Typography variant='body1' fontWeight='500'>
                      {user.phone || '—'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Role & Status Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant='h6' fontWeight='bold' color='primary.main' gutterBottom>
              Role & Status
            </Typography>
            <Box
              sx={{
                p: 3,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='body2' color='text.secondary' fontWeight='medium'>
                      User Role
                    </Typography>
                    <Chip
                      label={user.role || 'Not Assigned'}
                      color={
                        user.role === 'admin'
                          ? 'error'
                          : user.role === 'manager'
                            ? 'warning'
                            : user.role === 'operator'
                              ? 'info'
                              : 'default'
                      }
                      variant='filled'
                      sx={{
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                        width: 'fit-content'
                      }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='body2' color='text.secondary' fontWeight='medium'>
                      Account Status
                    </Typography>
                    <Chip
                      label='Active'
                      color='success'
                      variant='filled'
                      sx={{
                        fontWeight: 'bold',
                        width: 'fit-content'
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Image Preview Section */}
          {userImageUrl && (
            <Grid size={{ xs: 12 }}>
              <Typography variant='h6' fontWeight='bold' color='primary.main' gutterBottom>
                Profile Image
              </Typography>
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  textAlign: 'center'
                }}
              >
                <img
                  src={userImageUrl}
                  alt={`${user.name} profile`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  onError={e => {
                    e.target.style.display = 'none'
                  }}
                />
                <Typography variant='caption' color='text.secondary' sx={{ mt: 2, display: 'block' }}>
                  Profile image
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Button
          onClick={onEdit}
          variant='contained'
          size='large'
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            px: 4,
            py: 1,
            fontWeight: 'bold'
          }}
        >
          Edit User
        </Button>
        <Button
          onClick={onClose}
          variant='outlined'
          size='large'
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            fontWeight: 'bold',
            borderColor: 'grey.300'
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
