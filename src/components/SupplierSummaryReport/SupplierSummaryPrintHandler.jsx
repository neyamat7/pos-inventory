'use client'

import { useEffect, useRef } from 'react'

import { useReactToPrint } from 'react-to-print'

import SupplierSummaryReport from './SupplierSummaryReport'

const SupplierSummaryPrintHandler = ({
  summary,
  supplierName,
  dateRange,
  onPrintComplete,
  onPrintError,
  triggerPrint
}) => {
  const componentRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Supplier_Summary_${supplierName || 'Summary'}_${new Date().toISOString().split('T')[0]}`,

    onBeforePrint: () => {
      // console.log('Preparing lot invoice for printing...')

      return Promise.resolve()
    },

    onAfterPrint: () => {
      // console.log('Lot invoice print completed or cancelled')
      onPrintComplete?.()
    },

    onPrintError: (errorLocation, error) => {
      console.error('Lot invoice print error:', errorLocation, error)
      onPrintError?.(error)
    },

    pageStyle: `
      @page {
        size: 12cm 25cm;
        margin-top: 2.56in; 
        margin-bottom: 3cm;
        margin-left: 0.5cm;
        margin-right: 0.5cm;
      }
      .invoice-content {
        width: 11cm;
        margin: 0 auto;
        padding: 0 0.3cm;
      }
      @media screen and (max-width: 768px) {
        .invoice-content {
          width: 100% !important;
          padding: 0 0.1cm !important;
        }
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
    if (triggerPrint && summary && componentRef.current) {
      // console.log('Triggering summary print with data:', summary)

      const timer = setTimeout(() => {
        handlePrint()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [triggerPrint, summary, handlePrint])

  if (!summary) {
    return null
  }

  return (
    <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
      <div ref={componentRef}>
        <SupplierSummaryReport summary={summary} supplierName={supplierName} dateRange={dateRange} />
      </div>
    </div>
  )
}

export default SupplierSummaryPrintHandler
