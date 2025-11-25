const SaleInvoice = ({ saleData }) => {
  // Group lots by product and calculate product totals
  const productSummary =
    saleData?.items?.map(item => {
      const productTotal = item.selected_lots.reduce((sum, lot) => sum + (lot.total_price || 0), 0)
      const totalKg = item.selected_lots.reduce((sum, lot) => sum + (lot.kg || 0), 0)
      const totalBox = item.selected_lots.reduce((sum, lot) => sum + (lot.box_quantity || 0), 0)
      const totalDiscount = item.selected_lots.reduce((sum, lot) => sum + (lot.discount_amount || 0), 0)
      const totalCrate1 = item.selected_lots.reduce((sum, lot) => sum + (lot.crate_type1 || 0), 0)
      const totalCrate2 = item.selected_lots.reduce((sum, lot) => sum + (lot.crate_type2 || 0), 0)

      return {
        product_name: item.selected_lots[0]?.product_name || 'N/A',
        isBoxed: item.selected_lots[0]?.isBoxed || false,
        totalKg,
        totalBox,
        unit_price: item.selected_lots[0]?.unit_price || 0,
        totalDiscount,
        productTotal,
        totalCrate1,
        totalCrate2,
        lots: item.selected_lots
      }
    }) || []

  const paymentDetails = saleData?.payment_details || {}

  return (
    <div className='invoice-wrapper'>
      <style jsx>{`
        @media print {
          @page {
            size: 12cm 25cm;
            margin-top: 8cm;
            margin-bottom: 3cm;
            margin-left: 0.5cm;
            margin-right: 0.5cm;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice-wrapper {
            width: 11cm;
            max-height: 15cm;
            overflow: hidden;
          }

          .no-print {
            display: none !important;
          }
        }

        .invoice-wrapper {
          font-family: Arial, sans-serif;
          font-size: 9px;
          line-height: 1.2;
          color: #000;
          padding: 0;
          margin: 0;
        }

        .customer-section {
          margin-bottom: 8px;
          padding: 4px 0;
          border-bottom: 1px solid #ddd;
        }

        .customer-name {
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 2px;
          color: #2d5016;
        }

        .customer-address {
          font-size: 9px;
          color: #333;
        }

        .product-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px;
        }

        .product-table th {
          background-color: #f0f0f0;
          padding: 3px 4px;
          text-align: left;
          font-size: 8px;
          font-weight: 600;
          border-bottom: 1px solid #ccc;
        }

        .product-table td {
          padding: 3px 4px;
          font-size: 8px;
          border-bottom: 1px solid #eee;
        }

        .product-row {
          background-color: #fafafa;
        }

        .text-right {
          text-align: right;
        }

        .text-center {
          text-align: center;
        }

        .summary-section {
          margin-top: 8px;
          padding-top: 6px;
          border-top: 2px solid #2d5016;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
          font-size: 9px;
        }

        .summary-row.total {
          font-weight: bold;
          font-size: 11px;
          padding-top: 4px;
          margin-top: 4px;
          border-top: 1px solid #ccc;
          color: #2d5016;
        }

        .date-section {
          font-size: 8px;
          text-align: right;
          color: #666;
          margin-bottom: 6px;
        }
      `}</style>

      {/* Date */}
      <div className='date-section'>Date: {saleData?.sale_date || new Date().toISOString().split('T')[0]}</div>

      {/* Customer Info */}
      <div className='customer-section'>
        <div className='customer-name'>Name: {saleData?.customer_name || 'N/A'}</div>
        <div className='customer-address'>Address: {saleData?.customer_address || 'N/A'}</div>
      </div>

      {/* Products Table */}
      <table className='product-table'>
        <thead>
          <tr>
            <th style={{ width: '35%' }}>Product</th>
            <th style={{ width: '15%' }} className='text-center'>
              Quantity
            </th>
            <th style={{ width: '15%' }} className='text-center'>
              Unit Price
            </th>
            <th style={{ width: '12%' }} className='text-center'>
              Discount
            </th>
            <th style={{ width: '12%' }} className='text-center'>
              Crate
            </th>
            <th style={{ width: '18%' }} className='text-center'>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {productSummary.map((product, index) => (
            <tr key={index} className='product-row'>
              <td style={{ fontWeight: '600' }}>{product.product_name}</td>
              <td className='text-left'>{product.isBoxed ? `${product.totalBox} box` : `${product.totalKg} kg`}</td>
              <td className='text-left'>৳{product.unit_price.toFixed(0)}</td>
              <td className='text-left'>{product.totalDiscount > 0 ? `৳${product.totalDiscount.toFixed(0)}` : '-'}</td>
              <td className='text-left'>
                {product.totalCrate1 > 0 || product.totalCrate2 > 0
                  ? `${product.totalCrate1}/${product.totalCrate2}`
                  : '-'}
              </td>
              <td className='text-left' style={{ fontWeight: '600' }}>
                ৳{product.productTotal.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment Summary */}
      <div className='summary-section'>
        {paymentDetails.extra_crate_type1_price > 0 && (
          <div className='summary-row'>
            <span>Crate (Type 1):</span>
            <span>৳{paymentDetails.extra_crate_type1_price.toFixed(2)}</span>
          </div>
        )}

        {paymentDetails.extra_crate_type2_price > 0 && (
          <div className='summary-row'>
            <span>Crate (Type 2):</span>
            <span>৳{paymentDetails.extra_crate_type2_price.toFixed(2)}</span>
          </div>
        )}

        {paymentDetails.vat > 0 && (
          <div className='summary-row'>
            <span>VAT:</span>
            <span>৳{paymentDetails.vat.toFixed(2)}</span>
          </div>
        )}

        <div className='summary-row total'>
          <span>Payable Amount:</span>
          <span>৳{(paymentDetails.payable_amount || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default SaleInvoice
