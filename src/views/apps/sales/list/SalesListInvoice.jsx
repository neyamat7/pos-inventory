const SalesListInvoice = ({ saleData }) => {
  // Extract customer data
  const customerData = saleData?.customerId || {}
  const paymentDetails = saleData?.payment_details || {}

  // Calculate totals from items and selected_lots
  const calculateTotals = () => {
    if (!saleData?.items) return { subtotal: 0, totalDiscount: 0, totalCommission: 0 }

    let subtotal = 0
    let totalDiscount = 0
    let totalCommission = 0

    saleData.items.forEach(item => {
      if (item.selected_lots) {
        item.selected_lots.forEach(lot => {
          subtotal += lot.total_price || 0
          totalDiscount += lot.discount_amount || 0
          totalCommission += (lot.customer_commission_amount || 0) + (lot.lot_commission_amount || 0)
        })
      }
    })

    return { subtotal, totalDiscount, totalCommission }
  }

  const { subtotal, totalDiscount, totalCommission } = calculateTotals()

  return (
    <div className='p-3 bg-white invoice-container' id='sales-list-invoice'>
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 0.3in;
            size: A4 portrait;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice-container {
            padding: 0.3in;
            max-width: 100%;
            max-height: 5.85in;
            overflow: hidden;
          }

          .no-print {
            display: none !important;
          }
        }

        .invoice-container {
          font-family: 'Arial', sans-serif;
          line-height: 1.1;
          color: #333;
          font-size: 11px;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 0.3rem;
          margin-bottom: 0.3rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.5rem;
          margin-bottom: 0.4rem;
          font-size: 10px;
        }

        .info-box {
          background: #f8fafc;
          padding: 0.3rem 0.4rem;
          border-left: 2px solid #4f46e5;
        }

        .product-table {
          border-collapse: collapse;
          width: 100%;
          font-size: 9px;
          margin: 0.3rem 0;
        }

        .product-table th {
          background-color: #4f46e5;
          color: white;
          font-weight: 600;
          padding: 0.2rem 0.3rem;
          text-align: left;
        }

        .product-table td {
          padding: 0.2rem 0.3rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .product-table tr:nth-child(even) {
          background-color: #f9fafb;
        }

        .product-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.3rem 0.4rem;
          border-radius: 4px;
          margin: 0.3rem 0 0.2rem 0;
          font-size: 10px;
          font-weight: 600;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          background: #f0f9ff;
          padding: 0.4rem;
          border: 1px solid #bae6fd;
          border-radius: 4px;
          font-size: 10px;
          margin-top: 0.3rem;
        }

        .summary-col {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-row {
          border-top: 1px solid #4f46e5;
          padding-top: 0.2rem;
          margin-top: 0.2rem;
          font-weight: bold;
        }

        .footer-section {
          margin-top: 0.3rem;
          padding-top: 0.3rem;
          border-top: 1px dashed #d1d5db;
          font-size: 8px;
          text-align: center;
        }
      `}</style>

      {/* Header Row */}
      <div className='header-row'>
        <div>
          <h1 className='text-lg font-bold text-gray-800 mb-0'>INVOICE</h1>
          <p className='text-xs text-gray-600 mb-0'>#{saleData?._id?.slice(-8) || 'N/A'}</p>
        </div>

        <div className='text-center'>
          <p className='text-xs font-semibold mb-0'>{saleData?.sale_date || new Date().toISOString().split('T')[0]}</p>
          <p className='text-xs text-gray-600 mb-0'>
            {new Date(saleData?.createdAt || Date.now()).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className='text-right'>
          <p className='text-xs mb-0'>
            <strong>Payment:</strong> {paymentDetails?.payment_type || 'Cash'}
          </p>
          <p className='text-xs text-gray-600 mb-0'>Status: Completed</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className='info-grid'>
        <div className='info-box'>
          <p className='text-xs font-semibold mb-1'>Bill To:</p>
          <p className='text-xs font-bold mb-0'>{customerData?.basic_info?.name || 'N/A'}</p>
          <p className='text-xs mb-0'>📞 {customerData?.contact_info?.phone || 'N/A'}</p>
        </div>

        <div className='info-box'>
          <p className='text-xs font-semibold mb-1'>Contact:</p>
          <p className='text-xs mb-0'>📧 {customerData?.contact_info?.email || 'N/A'}</p>
          <p className='text-xs mb-0'>📍 {customerData?.contact_info?.location || 'N/A'}</p>
        </div>

        <div className='info-box'>
          <p className='text-xs font-semibold mb-1'>Account:</p>
          <p className='text-xs mb-0'>
            <strong>Balance:</strong> ৳{(customerData?.account_info?.balance || 0).toFixed(2)}
          </p>
          <p className='text-xs mb-0'>
            <strong>Due:</strong> ৳{(customerData?.account_info?.due || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Products and Lots */}
      <div>
        {saleData?.items && saleData.items.length > 0 ? (
          saleData.items.map((item, itemIndex) => (
            <div key={itemIndex} style={{ marginBottom: '0.4rem' }}>
              {/* Product Header */}
              <div className='product-header'>
                {item.productId?.productName || 'Unknown Product'} - {item.productId?.categoryId?.categoryName || 'N/A'}
              </div>

              {/* Lots Table */}
              {item.selected_lots && item.selected_lots.length > 0 && (
                <table className='product-table'>
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>Lot Name</th>
                      <th style={{ width: '10%' }} className='text-center'>
                        Qty
                      </th>

                      <th style={{ width: '10%' }} className='text-right'>
                        Discount
                      </th>
                      <th style={{ width: '12%' }} className='text-right'>
                        Selling Price
                      </th>
                      <th style={{ width: '12%' }} className='text-center'>
                        Crates
                      </th>
                      <th style={{ width: '12%' }} className='text-right'>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.selected_lots.map((lot, lotIndex) => (
                      <tr key={lotIndex}>
                        <td className='font-medium'>{lot.lotId?.lot_name || 'N/A'}</td>
                        <td className='text-center'>
                          {lot.isBoxed ? (
                            <span className='bg-blue-100 text-blue-800 px-1 py-0.5 rounded' style={{ fontSize: '8px' }}>
                              {lot.box_quantity} box
                            </span>
                          ) : (
                            <span
                              className='bg-green-100 text-green-800 px-1 py-0.5 rounded'
                              style={{ fontSize: '8px' }}
                            >
                              {lot.kg} kg
                            </span>
                          )}
                        </td>

                        <td className='text-right'>৳{(lot.discount_amount || 0).toFixed(2)}</td>
                        <td className='text-right font-semibold'>৳{(lot.selling_price || 0).toFixed(2)}</td>
                        <td className='text-center'>
                          {lot.crate_type1 || 0} / {lot.crate_type2 || 0}
                        </td>
                        <td className='text-right'>৳{(lot.total_price || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        ) : (
          <p className='text-xs text-center text-gray-500'>No products found</p>
        )}
      </div>

      {/* Payment Summary */}
      <div className='summary-grid'>
        {/* Left Column */}
        <div className='summary-col'>
          <div className='summary-row'>
            <span>Subtotal:</span>
            <span className='font-medium'>৳{subtotal.toFixed(2)}</span>
          </div>

          {paymentDetails.extra_crate_type1_price > 0 && (
            <div className='summary-row'>
              <span>Extra Crate Type 1:</span>
              <span>৳{paymentDetails.extra_crate_type1_price.toFixed(2)}</span>
            </div>
          )}

          {paymentDetails.extra_crate_type2_price > 0 && (
            <div className='summary-row'>
              <span>Extra Crate Type 2:</span>
              <span>৳{paymentDetails.extra_crate_type2_price.toFixed(2)}</span>
            </div>
          )}

          {paymentDetails.vat > 0 && (
            <div className='summary-row'>
              <span>VAT:</span>
              <span>৳{paymentDetails.vat.toFixed(2)}</span>
            </div>
          )}

          {totalCommission > 0 && (
            <div className='summary-row'>
              <span>Total Commission:</span>
              <span>৳{totalCommission.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className='summary-col'>
          <div className='summary-row total-row'>
            <span className='font-bold'>Total Payable:</span>
            <span className='font-bold text-blue-600' style={{ fontSize: '11px' }}>
              ৳{(paymentDetails.payable_amount || 0).toFixed(2)}
            </span>
          </div>

          <div className='summary-row'>
            <span>Paid Amount:</span>
            <span className='font-semibold text-green-600'>৳{(paymentDetails.received_amount || 0).toFixed(2)}</span>
          </div>

          <div className='summary-row'>
            <span>Due Amount:</span>
            <span className='font-semibold text-red-600'>৳{(paymentDetails.due_amount || 0).toFixed(2)}</span>
          </div>

          {saleData?.total_profit && (
            <div className='summary-row'>
              <span>Total Profit:</span>
              <span className='font-semibold text-green-600'>৳{(saleData.total_profit || 0).toFixed(2)}</span>
            </div>
          )}

          {paymentDetails.note && (
            <div className='summary-row'>
              <span>Note:</span>
              <span className='text-xs italic' style={{ maxWidth: '150px', wordBreak: 'break-word' }}>
                {paymentDetails.note}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className='footer-section'>
        <p className='mb-0 text-gray-600'>Thank you for your business!</p>
        <p className='mb-0 text-gray-500'>This is a computer generated invoice, no signature required.</p>
        <p className='mb-0 text-gray-400'>{new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}

export default SalesListInvoice
