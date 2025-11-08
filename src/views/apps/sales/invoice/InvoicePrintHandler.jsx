'use client'

import { useRef, useEffect } from 'react'

import { useReactToPrint } from 'react-to-print'

import SaleInvoice from './SaleInvoice'

const InvoicePrintHandler = ({ saleData, customerData, cartProducts, onPrintComplete, onPrintError, triggerPrint }) => {
  const componentRef = useRef(null)

  // Print configuration
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Changed from content to contentRef
    documentTitle: `Invoice_${saleData?._id || 'Sale'}_${new Date().toISOString().split('T')[0]}`,
    onBeforePrint: () => {
      console.log('Preparing document for printing...')

      return Promise.resolve()
    },
    onAfterPrint: () => {
      console.log('Print completed or cancelled')
      onPrintComplete?.()
    },
    onPrintError: (errorLocation, error) => {
      console.error('Print error:', errorLocation, error)
      onPrintError?.(error)
    },
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0.5in;
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

  // Auto-trigger print when triggerPrint becomes true
  useEffect(() => {
    if (triggerPrint && saleData && cartProducts.length > 0 && componentRef.current) {
      console.log('Triggering print with data:', { saleData, cartProducts: cartProducts.length })

      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        handlePrint()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [triggerPrint, saleData?.printTrigger]) // Use printTrigger as dependency

  // Don't render if no data
  if (!saleData || cartProducts.length === 0) {
    return null
  }

  return (
    <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
      {/* Hidden but rendered for printing */}
      <div ref={componentRef}>
        <SaleInvoice saleData={saleData} customerData={customerData} cartProducts={cartProducts} />
      </div>
    </div>
  )
}

export default InvoicePrintHandler
