'use client'

import { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import DueListPrint from './DueListPrint'

const ListPrintHandler = ({ data, type, triggerPrint, onPrintComplete }) => {
  const componentRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${type}_list_print`,
    onBeforePrint: () => {
      return Promise.resolve()
    },
    onAfterPrint: () => {
      onPrintComplete?.()
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
      }
    `
  })

  useEffect(() => {
    if (triggerPrint && data && data.length > 0) {
      handlePrint()
    }
  }, [triggerPrint, data, handlePrint])

  return (
    <div style={{ display: 'none' }}>
      <div ref={componentRef}>
        <DueListPrint data={data} type={type} />
      </div>
    </div>
  )
}

export default ListPrintHandler
