'use client'

import { useRef, useEffect } from 'react'

import { useReactToPrint } from 'react-to-print'

import CrateTransactionInvoice from './CrateTransactionInvoice'

const CrateTransactionPrintHandler = ({ transactionData, onPrintComplete, onPrintError, triggerPrint }) => {
  const componentRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Crate_Transaction_${transactionData?.date || 'Transaction'}_${
      transactionData?.customerId?.basic_info?.name || 
      transactionData?.supplierId?.basic_info?.name || 
      'Party'
    }`,
    onBeforePrint: () => {
      console.log('Preparing crate transaction invoice for printing...')

      return Promise.resolve()
    },
    onAfterPrint: () => {
      console.log('Print completed')
      onPrintComplete?.()
    },
    onPrintError: (errorLocation, error) => {
      console.error('Print error:', errorLocation, error)
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
    if (triggerPrint && transactionData && componentRef.current) {
      console.log('Triggering print with transaction data:', transactionData)

      const timer = setTimeout(() => {
        handlePrint()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [triggerPrint, transactionData?.printTrigger])

  if (!transactionData) {
    return null
  }

  return (
    <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
      <div ref={componentRef}>
        <CrateTransactionInvoice transactionData={transactionData} />
      </div>
    </div>
  )
}

export default CrateTransactionPrintHandler
