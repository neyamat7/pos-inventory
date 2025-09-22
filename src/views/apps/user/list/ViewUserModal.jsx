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
  Grid,
  IconButton,
  Stack,
  Button,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export default function ViewUserModal({ open, user, onClose, onEdit }) {
  if (!user) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm' PaperProps={{ className: 'rounded-2xl' }}>
      <DialogTitle>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>User details</Typography>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(16,185,129,0.10))',
              borderRadius: 3,
              p: 3
            }}
          >
            <Stack direction='row' spacing={2} alignItems='center'>
              <Avatar src={user.image} alt={user.name} sx={{ width: 72, height: 72, borderRadius: 3 }} />
              <Box>
                <Typography variant='h6'>{user.name}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {user.role || '—'}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant='overline' color='text.secondary'>
                Contact
              </Typography>
              <Typography variant='body1'>{user.contact || '—'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='overline' color='text.secondary'>
                Email
              </Typography>
              <Typography variant='body1'>{user.email || '—'}</Typography>
            </Grid>
          </Grid>

          <Divider />

          <Stack direction='row' spacing={1} flexWrap='wrap'>
            <Chip label={user.role || 'No role'} variant='outlined' />
            <Chip label={`ID: ${user.id}`} variant='outlined' />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onEdit} variant='contained'>
          Edit
        </Button>
        <Button onClick={onClose} variant='outlined'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
