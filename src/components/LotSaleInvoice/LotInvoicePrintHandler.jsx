'use client'

import { useRef, useEffect } from 'react'

import { useReactToPrint } from 'react-to-print'

import LotSaleInvoice from './LotSaleInvoice'

const LotInvoicePrintHandler = ({ lotSaleData, onPrintComplete, onPrintError, triggerPrint }) => {
  const componentRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Lot_Invoice_${lotSaleData?.lot_name || 'Summary'}_${new Date().toISOString().split('T')[0]}`,

    onBeforePrint: () => {
      console.log('Preparing lot invoice for printing...')

      return Promise.resolve()
    },

    onAfterPrint: () => {
      console.log('Lot invoice print completed or cancelled')
      onPrintComplete?.()
    },

    onPrintError: (errorLocation, error) => {
      console.error('Lot invoice print error:', errorLocation, error)
      onPrintError?.(error)
    },

    pageStyle: `
      @page {
        size: 12cm 25cm;
        margin-top: 8cm;
        margin-bottom: 3cm;
        margin-left: 0.5cm;
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

      const timer = setTimeout(() => {
        handlePrint()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [triggerPrint, lotSaleData, handlePrint])

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
