'use client'

import { useEffect, useState } from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Button,
  TextField,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  Box
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import CloseIcon from '@mui/icons-material/Close'

import { showSuccess } from '@/utils/toastUtils'

const ROLE_OPTIONS = ['admin', 'manager', 'operator', 'staff']

export default function EditUserModal({ open, user, onClose, setFilteredData, setData }) {
  const [form, setForm] = useState({
    name: '',
    role: '',
    phone: '',
    email: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        role: user.role || '',
        phone: user.phone || '',
        email: user.email || ''
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
          role: form.role
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
          role: form.role
        }

        setData(prev => prev.map(u => (u._id === user._id ? updatedUser : u)))
        setFilteredData(prev => prev.map(u => (u._id === user._id ? updatedUser : u)))

        onClose()
        showSuccess('User updated successfully!')
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
