const SaleInvoice = ({ saleData, customerData, cartProducts }) => {
  // Calculate totals from cartProducts
  const subtotal = cartProducts.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  const totalDue = cartProducts.reduce((sum, item) => sum + (item.total || 0), 0)
  const totalCommission = cartProducts.reduce((sum, item) => sum + (item.commission || 0), 0)

  // Get payment details from saleData or calculate
  const paymentDetails = saleData?.payment_details || {
    extra_crate_type1_price: 0,
    extra_crate_type2_price: 0,
    vat: 0,
    payable_amount: totalDue
  }

  return (
    <div className='p-3 bg-white invoice-container' id='sale-invoice'>
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
            max-height: 5.85in; /* Half of A4 height (11.7in / 2) */
            overflow: hidden;
          }

          .no-print {
            display: none !important;
          }
        }

        /* Compact invoice styles */
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

      {/* Header Row - Everything inline */}
      <div className='header-row'>
        <div>
          <h1 className='text-lg font-bold text-gray-800 mb-0'>INVOICE</h1>
          <p className='text-xs text-gray-600 mb-0'>#{saleData?._id?.slice(-8) || 'N/A'}</p>
        </div>

        <div className='text-center'>
          <p className='text-xs font-semibold mb-0'>{saleData?.sale_date || new Date().toISOString().split('T')[0]}</p>
          <p className='text-xs text-gray-600 mb-0'>
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className='text-right'>
          <p className='text-xs mb-0'>
            <strong>Payment:</strong> {saleData?.payment_details?.payment_type || 'Cash'}
          </p>
          <p className='text-xs text-gray-600 mb-0'>Status: Completed</p>
        </div>
      </div>

      {/* Info Grid - Bill To, Contact, Balance inline */}
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

      {/* Compact Products Table */}
      <table className='product-table'>
        <thead>
          <tr>
            <th style={{ width: '35%' }}>Product Name</th>
            <th style={{ width: '15%' }}>Lot</th>
            <th style={{ width: '12%' }} className='text-center'>
              Quantity
            </th>
            <th style={{ width: '13%' }} className='text-right'>
              Unit Price
            </th>
            <th style={{ width: '12%' }} className='text-right'>
              Discount
            </th>
            <th style={{ width: '13%' }} className='text-right'>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {cartProducts.map((item, index) => (
            <tr key={item.cart_item_id || index}>
              <td className='font-medium'>{item.product_name}</td>
              <td className='text-gray-600'>{item.lot_selected?.lot_name || 'N/A'}</td>
              <td className='text-center'>
                {item.isBoxed ? (
                  <span className='bg-blue-100 text-blue-800 px-1 py-0.5 rounded' style={{ fontSize: '8px' }}>
                    {item.box_quantity} box
                  </span>
                ) : (
                  <span className='bg-green-100 text-green-800 px-1 py-0.5 rounded' style={{ fontSize: '8px' }}>
                    {item.kg} kg
                  </span>
                )}
              </td>
              <td className='text-right'>৳{(item.selling_price || 0).toFixed(2)}</td>
              <td className='text-right'>৳{(item.discount_amount || 0).toFixed(2)}</td>
              <td className='text-right font-semibold'>৳{(item.total || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Compact Payment Summary - Two columns */}
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
              <span>VAT ({((paymentDetails.vat / subtotal) * 100).toFixed(1)}%):</span>
              <span>৳{paymentDetails.vat.toFixed(2)}</span>
            </div>
          )}

          {totalCommission > 0 && (
            <div className='summary-row'>
              <span>Commission:</span>
              <span>৳{totalCommission.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className='summary-col'>
          <div className='summary-row total-row'>
            <span className='font-bold'>Total Payable:</span>
            <span className='font-bold text-blue-600' style={{ fontSize: '11px' }}>
              ৳{(paymentDetails.payable_amount || totalDue).toFixed(2)}
            </span>
          </div>

          {saleData?.payment_details && (
            <>
              <div className='summary-row'>
                <span>Paid Amount:</span>
                <span className='font-semibold text-green-600'>
                  ৳{(saleData.payment_details.received_amount || 0).toFixed(2)}
                </span>
              </div>
              <div className='summary-row'>
                <span>Due Amount:</span>
                <span className='font-semibold text-red-600'>
                  ৳{(saleData.payment_details.due_amount || 0).toFixed(2)}
                </span>
              </div>
              {saleData.payment_details.note && (
                <div className='summary-row'>
                  <span>Note:</span>
                  <span className='text-xs italic'>{saleData.payment_details.note}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Compact Footer */}
      <div className='footer-section'>
        <p className='mb-0 text-gray-600'>Thank you for your business!</p>
        <p className='mb-0 text-gray-500'>This is a computer generated invoice, no signature required.</p>
        <p className='mb-0 text-gray-400'>{new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}

export default SaleInvoice
