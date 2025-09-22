'use client'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'

// Component Imports

import DialogCloseButton from '../DialogCloseButton'

// Component Imports

const PricingDialog = ({ open, setOpen, data }) => {
  return (
    <Dialog
      fullWidth
      maxWidth='lg'
      open={open}
      onClose={() => setOpen(false)}
      scroll='body'
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
    </Dialog>
  )
}

export default PricingDialog
