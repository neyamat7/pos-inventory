'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

/**
 * Returns the appropriate MUI color for a given action string.
 * @param {string} action
 * @returns {string} MUI color name
 */
const getActionColor = action => {
  switch (action) {
    case 'Created':
      return 'success'
    case 'Updated':
      return 'warning'
    case 'Deleted':
      return 'error'
    case 'Returned':
      return 'info'
    case 'Payment Cleared':
    case 'Full Settlement':
    case 'Payment':
      return 'secondary'
    default:
      return 'primary'
  }
}

/**
 * LogMetaHeader — shared metadata section displayed at the top of every
 * ActivityLogDetailModal, regardless of model type.
 *
 * Props:
 *   log.action     {string}  — e.g. "Created", "Updated", "Deleted"
 *   log.by         {object}  — { name: string, ... }
 *   log.date       {string}  — ISO date string (falls back to createdAt)
 *   log.createdAt  {string}  — ISO date string (fallback)
 *   log.note       {string}  — optional description / note
 */
const LogMetaHeader = ({ log }) => {
  if (!log) return null

  const { action, by, date, createdAt, note } = log

  const rawDate = date || createdAt
  const dateObj = rawDate ? new Date(rawDate) : null
  const formattedDate = dateObj
    ? `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`
    : '—'

  return (
    <Box sx={{ mb: 3 }}>
      {/* Action + Date row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
        <Chip
          label={action || 'Unknown'}
          color={getActionColor(action)}
          variant='tonal'
          size='small'
        />
        <Typography variant='body2' color='text.secondary'>
          {formattedDate}
        </Typography>
      </Box>

      {/* Performed by */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: note ? 1.5 : 0 }}>
        <Typography variant='body2' color='text.secondary'>
          By:
        </Typography>
        <Typography variant='body2' className='font-medium' color='text.primary'>
          {by?.name || 'Unknown User'}
        </Typography>
      </Box>

      {/* Note / description */}
      {note && (
        <Box sx={{ mt: 0.5 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
            Note:
          </Typography>
          <Typography variant='body2' color='text.primary'>
            {note}
          </Typography>
        </Box>
      )}

      <Divider sx={{ mt: 2 }} />
    </Box>
  )
}

export default LogMetaHeader
