'use client'

import { useRef, useEffect } from 'react'

import { useReactToPrint } from 'react-to-print'

import LotSaleInvoice from './LotSaleInvoice'

const LotInvoicePrintHandler = ({ lotSaleData, onPrintComplete, onPrintError, triggerPrint }) => {
  const componentRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Lot_Invoice_${lotSaleData?.lot_name || 'Summary'}_${new Date().toISOString().split('T')[0]}`,

    // Before print callback
    onBeforePrint: () => {
      console.log('Preparing lot invoice for printing...')

      return Promise.resolve()
    },

    // After print callback (success or cancel)
    onAfterPrint: () => {
      console.log('Lot invoice print completed or cancelled')
      onPrintComplete?.()
    },

    // Error callback
    onPrintError: (errorLocation, error) => {
      console.error('Lot invoice print error:', errorLocation, error)
      onPrintError?.(error)
    },

    // Page styling for print - CRITICAL for proper alignment
    pageStyle: `
      @page {
        size: 12cm 25cm;           /* Exact paper size */
        margin-top: 8cm;           /* Top margin for pre-printed header */
        margin-bottom: 3cm;        /* Bottom margin for pre-printed footer */
        margin-left: 0.5cm;        /* Side margins */
        margin-right: 0.5cm;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .no-print {
          display: none !important;
        }
      }
    `
  })

  useEffect(() => {
    if (triggerPrint && lotSaleData && componentRef.current) {
      console.log('Triggering lot invoice print with data:', lotSaleData)

      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        handlePrint()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [triggerPrint, lotSaleData?.printTrigger])

  // Don't render anything if no data
  if (!lotSaleData) {
    return null
  }

  return (
    <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
      <div ref={componentRef}>
        <LotSaleInvoice lotSaleData={lotSaleData} />
      </div>
    </div>
  )
}

export default LotInvoicePrintHandler
