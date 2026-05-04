'use client'

import { useEffect, useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material'
import Grid from '@mui/material/Grid2'

import { showSuccess } from '@/utils/toastUtils'

const ROLE_OPTIONS = ['admin', 'manager', 'operator', 'staff']

export default function EditUserModal({ open, user, onClose, setFilteredData, setData, onRefresh }) {
  const [form, setForm] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    salary: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        role: user.role || '',
        phone: user.phone || '',
        email: user.email || '',
        salary: user.salary || '',
        password: ''
      })
    }

    setError('')
  }, [user, open])

  const handleChange = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    if (!user?._id) {
      setError('Invalid user data')

      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: user._id,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          salary: form.salary,
          ...(form.password.trim() ? { password: form.password.trim() } : {})
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Update local state
        const updatedUser = {
          ...user,
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          salary: form.salary,
          remaining_salary: form.salary // Update remaining_salary to match salary
        }

        setData(prev => prev.map(u => (u._id === user._id ? updatedUser : u)))
        setFilteredData(prev => prev.map(u => (u._id === user._id ? updatedUser : u)))

        onClose()
        showSuccess('User updated successfully!')
        
        if (onRefresh) {
          onRefresh()
        }
      } else {
        setError(result.message || 'Failed to update user')
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Update user error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm' PaperProps={{ className: 'rounded-2xl' }}>
      <DialogTitle>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>Edit User</Typography>
          <IconButton onClick={onClose} size='small' disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid size={12}>
            <TextField
              label='Name'
              fullWidth
              value={form.name}
              onChange={handleChange('name')}
              disabled={loading}
              required
              autoComplete='off'
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              label='Role'
              fullWidth
              value={form.role}
              onChange={handleChange('role')}
              disabled={loading}
              required
            >
              {ROLE_OPTIONS.map(role => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label='Phone'
              fullWidth
              value={form.phone}
              onChange={handleChange('phone')}
              disabled={loading}
              required
              autoComplete='off'
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label='Email'
              type='email'
              fullWidth
              value={form.email}
              onChange={handleChange('email')}
              disabled={loading}
              required
              autoComplete='off'
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label='Salary'
              type='number'
              fullWidth
              value={form.salary}
              onChange={handleChange('salary')}
              disabled={loading}
              required
              autoComplete='off'
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label='New Password'
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={form.password}
              onChange={handleChange('password')}
              disabled={loading}
              placeholder='Leave blank to keep current password'
              autoComplete='new-password'
              InputProps={{
                endAdornment: (
                  <IconButton
                    size='small'
                    onClick={() => setShowPassword(prev => !prev)}
                    edge='end'
                    aria-label='toggle password visibility'
                  >
                    <i className={showPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                  </IconButton>
                )
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </Button>
        <Button onClick={onClose} variant='outlined' disabled={loading} sx={{ minWidth: 100 }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
