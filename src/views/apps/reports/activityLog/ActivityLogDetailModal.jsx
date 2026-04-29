'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// Action Imports
import { getActivityLogDetails } from '@/actions/activityLogActions/activityLog.action'

// Detail Sub-component Imports
import BalanceDetail from './details/BalanceDetail'
import EntityDetail from './details/EntityDetail'
import ExpenseDetail from './details/ExpenseDetail'
import InventoryCrateDetail from './details/InventoryCrateDetail'
import LogMetaHeader from './details/LogMetaHeader'
import PaymentDetail from './details/PaymentDetail'
import PurchaseDetail from './details/PurchaseDetail'
import SaleDetail from './details/SaleDetail'

// Map model_name → detail sub-component
const DETAIL_COMPONENT_MAP = {
  Sale: SaleDetail,
  Purchase: PurchaseDetail,
  Balance: BalanceDetail,
  Payment: PaymentDetail,
  InventoryCrate: InventoryCrateDetail,
  Expense: ExpenseDetail,
  Customer: EntityDetail,
  Supplier: EntityDetail,
  Product: EntityDetail,
  Category: EntityDetail,
  Account: EntityDetail,
}

/**
 * ActivityLogDetailModal
 *
 * Props:
 *   open    {boolean}        — controls dialog visibility
 *   onClose {() => void}     — called when the dialog should close
 *   logId   {string | null}  — the ActivityLog _id to fetch
 */
const ActivityLogDetailModal = ({ open, onClose, logId }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || !logId) {
      if (!open) {
        setData(null)
        setError(null)
      }
      return
    }

    const fetchDetails = async () => {
      setLoading(true)
      setError(null)
      setData(null)

      const result = await getActivityLogDetails(logId)

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to load details. Please try again.')
      }

      setLoading(false)
    }

    fetchDetails()
  }, [open, logId])

  // Determine which detail component to render
  const DetailComponent = data?.model_name ? DETAIL_COMPONENT_MAP[data.model_name] : null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant='h6'>Activity Log Details</Typography>
        <IconButton onClick={onClose} size='small' aria-label='close'>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error state */}
        {!loading && error && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color='error'>Failed to load details. Please try again.</Typography>
          </Box>
        )}

        {/* Data loaded */}
        {!loading && !error && data && (
          <>
            <LogMetaHeader log={data} />

            {DetailComponent ? (
              <DetailComponent details={data.details} modelName={data.model_name} />
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography color='text.secondary'>
                  Detail view not available for this log type.
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ActivityLogDetailModal
