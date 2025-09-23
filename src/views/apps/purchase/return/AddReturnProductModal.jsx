'use client'

import { useState, useEffect } from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Button, MenuItem } from '@mui/material'

// Dummy supplier array
const SUPPLIERS = [
  { id: 1, name: 'FreshFarms Ltd' },
  { id: 2, name: 'GrainHub Supplies' },
  { id: 3, name: 'Mediterranean Traders' },
  { id: 4, name: 'HealthyHarvest' },
  { id: 5, name: 'NutriWorld' }
]

export default function AddReturnProductModal({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    productName: '',
    sku: '',
    quantityPurchased: '',
    quantityReturned: '',
    unitPrice: '',
    returnAmount: '',
    reason: '',
    customReason: '',
    returnDate: '',
    supplier: ''
  })

  // preload for edit
  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData, customReason: '' })
    } else {
      setForm({
        productName: '',
        sku: '',
        quantityPurchased: '',
        quantityReturned: '',
        unitPrice: '',
        returnAmount: '',
        reason: '',
        customReason: '',
        returnDate: '',
        supplier: ''
      })
    }
  }, [initialData])

  const handleChange = k => e => {
    const val = e.target.value

    setForm(prev => {
      const updated = { ...prev, [k]: val }

      if (k === 'quantityReturned' || k === 'unitPrice') {
        const qty = Number(updated.quantityReturned) || 0
        const price = Number(updated.unitPrice) || 0

        updated.returnAmount = qty * price
      }

      return updated
    })
  }

  const handleSave = () => {
    const payload = { ...form }

    if (form.reason === 'Other') {
      payload.reason = form.customReason || 'Other'
    }

    delete payload.customReason
    onSave(payload)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>{initialData ? 'Edit Return Product' : 'Add Return Product'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Product Name */}
          <Grid item xs={12}>
            <TextField label='Product Name' fullWidth value={form.productName} onChange={handleChange('productName')} />
          </Grid>

          {/* SKU */}
          <Grid item xs={12} md={6}>
            <TextField label='SKU' fullWidth value={form.sku} onChange={handleChange('sku')} />
          </Grid>

          {/* Qty Purchased */}
          <Grid item xs={6} md={3}>
            <TextField
              label='Qty Purchased'
              type='number'
              fullWidth
              value={form.quantityPurchased}
              onChange={handleChange('quantityPurchased')}
            />
          </Grid>

          {/* Qty Returned */}
          <Grid item xs={6} md={3}>
            <TextField
              label='Qty Returned'
              type='number'
              fullWidth
              value={form.quantityReturned}
              onChange={handleChange('quantityReturned')}
            />
          </Grid>

          {/* Unit Price */}
          <Grid item xs={6} md={4}>
            <TextField
              label='Unit Price'
              type='number'
              fullWidth
              value={form.unitPrice}
              onChange={handleChange('unitPrice')}
            />
          </Grid>

          {/* Return Amount */}
          <Grid item xs={6} md={4}>
            <TextField
              label='Return Amount'
              type='number'
              fullWidth
              value={form.returnAmount}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          {/* Supplier dropdown */}
          <Grid item xs={12} md={4}>
            <TextField select label='Supplier' fullWidth value={form.supplier} onChange={handleChange('supplier')}>
              {SUPPLIERS.map(sup => (
                <MenuItem key={sup.id} value={sup.name}>
                  {sup.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Reason */}
          <Grid item xs={12}>
            <TextField select label='Reason' fullWidth value={form.reason} onChange={handleChange('reason')}>
              <MenuItem value='Damaged'>Damaged</MenuItem>
              <MenuItem value='Expired'>Expired</MenuItem>
              <MenuItem value='Wrong Item'>Wrong Item</MenuItem>
              <MenuItem value='Other'>Other</MenuItem>
            </TextField>
          </Grid>

          {/* Custom reason input if "Other" */}
          {form.reason === 'Other' && (
            <Grid item xs={12}>
              <TextField
                label='Other Reason'
                fullWidth
                value={form.customReason}
                onChange={handleChange('customReason')}
              />
            </Grid>
          )}

          {/* Return Date */}
          <Grid item xs={12}>
            <TextField
              label='Return Date'
              type='date'
              fullWidth
              value={form.returnDate}
              onChange={handleChange('returnDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleSave} variant='contained'>
          {initialData ? 'Update' : 'Save'}
        </Button>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
