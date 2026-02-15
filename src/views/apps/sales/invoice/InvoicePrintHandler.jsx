'use client'

import { useEffect, useRef } from 'react'

import { useReactToPrint } from 'react-to-print'

import SaleInvoice from './SaleInvoice'

const InvoicePrintHandler = ({ saleData, customerData, onPrintComplete, onPrintError, triggerPrint }) => {
  const componentRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice_${saleData?.sale_date || 'Sale'}_${saleData?.customer_name || 'Customer'}`,
    onBeforePrint: () => { 
      return Promise.resolve()
    },
    onAfterPrint: () => { 
      onPrintComplete?.()
    },
    onPrintError: (errorLocation, error) => {
      console.error('Print error:', errorLocation, error)
      onPrintError?.(error)
    },
    pageStyle: `
      @page {
        size: 12cm 25cm;
        // margin-top: 8cm;
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
    if (triggerPrint && saleData && componentRef.current) { 

      const timer = setTimeout(() => {
        handlePrint()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [triggerPrint, saleData?.printTrigger])

  if (!saleData) {
    return null
  }

  return (
    <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
      <div ref={componentRef}>
        <SaleInvoice saleData={saleData} customerData={customerData} />
      </div>
    </div>
  )
}

export default InvoicePrintHandler
