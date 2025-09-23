'use client'

import { useEffect, useState } from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Button,
  TextField,
  Typography,
  MenuItem
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const ROLE_OPTIONS = ['Software Engineer', 'Admin', 'Author', 'Editor', 'Maintainer', 'Subscriber']

export default function EditUserModal({ open, user, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', role: '', contact: '', email: '', image: '' })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        role: user.role || '',
        contact: user.contact || '',
        email: user.email || '',
        image: user.image || ''
      })
    }
  }, [user])

  const handleChange = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = () => {
    if (user) onSave?.({ ...user, ...form })
  }

  if (!user) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm' PaperProps={{ className: 'rounded-2xl' }}>
      <DialogTitle>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>Edit user</Typography>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label='Name' fullWidth value={form.name} onChange={handleChange('name')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select label='Role' fullWidth value={form.role} onChange={handleChange('role')}>
              {ROLE_OPTIONS.map(role => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label='Contact' fullWidth value={form.contact} onChange={handleChange('contact')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Email' type='email' fullWidth value={form.email} onChange={handleChange('email')} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label='Avatar URL'
              fullWidth
              value={form.image}
              onChange={handleChange('image')}
              helperText='Paste an image URL for the avatar'
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleSave} variant='contained'>
          Save changes
        </Button>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
