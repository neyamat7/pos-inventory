// ============================================================================
// LotSaleInvoice.jsx - Invoice component for printing lot sale summary
// ============================================================================
// This component is designed for 12cm x 25cm pre-printed paper
// Top margin: 8cm (for header), Bottom margin: 3cm (for footer)
// Content area: 15cm height in the middle
// ============================================================================

const LotSaleInvoice = ({ lotSaleData }) => {
  // Calculate totals from sales array
  const totals = lotSaleData?.sales?.reduce(
    (acc, sale) => ({
      totalKg: acc.totalKg + (sale.kg || 0),
      totalDiscount: acc.totalDiscount + (sale.discount_Kg || 0),
      totalAmount: acc.totalAmount + (sale.total_price || 0),
      totalCrates: acc.totalCrates + (sale.total_crate || 0)
    }),
    { totalKg: 0, totalDiscount: 0, totalAmount: 0, totalCrates: 0 }
  ) || { totalKg: 0, totalDiscount: 0, totalAmount: 0, totalCrates: 0 }

  const expenses = lotSaleData?.lot_expenses || {}
  const totalExpenses = expenses.total_expenses || 0

  const payableAmount = totals.totalAmount - totalExpenses

  return (
    <div className='lot-invoice-wrapper'>
      <style jsx>{`
        /* ============================================ */
        /* PRINT CONFIGURATION - CRITICAL              */
        /* ============================================ */
        @media print {
          @page {
            size: 12cm 25cm;
            margin-top: 8cm; /* Space for pre-printed header */
            margin-bottom: 3cm; /* Space for pre-printed footer */
            margin-left: 0.5cm;
            margin-right: 0.5cm;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .lot-invoice-wrapper {
            width: 11cm;
            max-height: 15cm; /* Middle content area */
            overflow: hidden;
          }

          .no-print {
            display: none !important;
          }
        }

        /* ============================================ */
        /* GENERAL STYLES                              */
        /* ============================================ */
        .lot-invoice-wrapper {
          font-family: Arial, sans-serif;
          font-size: 9px;
          line-height: 1.2;
          color: #000;
          padding: 0;
          margin: 0;
        }

        /* ============================================ */
        /* HEADER SECTION                              */
        /* ============================================ */
        .invoice-header {
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 2px solid #2d5016;
        }

        .lot-title {
          font-size: 12px;
          font-weight: bold;
          color: #2d5016;
          margin-bottom: 3px;
        }

        .supplier-name {
          font-size: 10px;
          color: #333;
          margin-bottom: 2px;
        }

        /* ============================================ */
        /* SALES TABLE                                 */
        /* ============================================ */
        .sales-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px;
        }

        .sales-table th {
          background-color: #f0f0f0;
          padding: 3px 4px;
          text-align: left;
          font-size: 8px;
          font-weight: 600;
          border-bottom: 1px solid #ccc;
        }

        .sales-table td {
          padding: 3px 4px;
          font-size: 8px;
          border-bottom: 1px solid #eee;
        }

        .sales-table tr:nth-child(even) {
          background-color: #fafafa;
        }

        .text-right {
          text-align: right;
        }

        .text-center {
          text-align: center;
        }

        /* ============================================ */
        /* EXPENSES SECTION                            */
        /* ============================================ */
        .expenses-section {
          margin-top: 6px;
          padding: 4px;
          background-color: #f8f8f8;
          border: 1px solid #ddd;
          border-radius: 3px;
        }

        .expense-title {
          font-size: 9px;
          font-weight: bold;
          margin-bottom: 3px;
          color: #2d5016;
        }

        .expense-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px;
          font-size: 8px;
        }

        .expense-row {
          display: flex;
          justify-content: space-between;
        }

        /* ============================================ */
        /* SUMMARY SECTION                             */
        /* ============================================ */
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

        .sales-count {
          font-size: 8px;
          color: #666;
          text-align: right;
          margin-bottom: 4px;
        }
      `}</style>

      <div className='invoice-header'>
        <div className='lot-title'>Lot: {lotSaleData?.lot_name || 'N/A'}</div>
        <div className='supplier-name'>Supplier: {lotSaleData?.supplier_name || 'N/A'}</div>
      </div>

      {/* Transaction count */}
      <div className='sales-count'>Total Transactions: {lotSaleData?.sales?.length || 0}</div>

      <table className='sales-table'>
        <thead>
          <tr>
            <th style={{ width: '8%' }} className='text-center'>
              #
            </th>
            <th style={{ width: '18%' }} className='text-center'>
              Kg
            </th>
            <th style={{ width: '18%' }} className='text-center'>
              Discount
            </th>
            <th style={{ width: '18%' }} className='text-center'>
              Unit Price
            </th>
            <th style={{ width: '15%' }} className='text-center'>
              Crate
            </th>
            <th style={{ width: '23%' }} className='text-center'>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {lotSaleData?.sales?.map((sale, index) => (
            <tr key={index}>
              <td className='text-left'>{index + 1}</td>
              <td className='text-left'>{sale.kg || 0} kg</td>
              <td className='text-left'>{sale.discount_Kg > 0 ? `${sale.discount_Kg} kg` : '-'}</td>
              <td className='text-left'>৳{sale.unit_price?.toFixed(0) || 0}</td>
              <td className='text-left'>{sale.total_crate || 0}</td>
              <td className='text-left' style={{ fontWeight: '600' }}>
                ৳{sale.total_price?.toFixed(2) || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalExpenses > 0 && (
        <div className='expenses-section'>
          <div className='expense-title'>Expenses Breakdown</div>
          <div className='expense-grid'>
            {expenses.labour > 0 && (
              <div className='expense-row'>
                <span>Labour:</span>
                <span>৳{expenses.labour}</span>
              </div>
            )}
            {expenses.transportation > 0 && (
              <div className='expense-row'>
                <span>Transportation:</span>
                <span>৳{expenses.transportation}</span>
              </div>
            )}
            {expenses.van_vara > 0 && (
              <div className='expense-row'>
                <span>Van Vara:</span>
                <span>৳{expenses.van_vara}</span>
              </div>
            )}
            {expenses.moshjid > 0 && (
              <div className='expense-row'>
                <span>Moshjid:</span>
                <span>৳{expenses.moshjid}</span>
              </div>
            )}
            {expenses.trading_post > 0 && (
              <div className='expense-row'>
                <span>Trading Post:</span>
                <span>৳{expenses.trading_post}</span>
              </div>
            )}
            {expenses.other_expenses > 0 && (
              <div className='expense-row'>
                <span>Other:</span>
                <span>৳{expenses.other_expenses}</span>
              </div>
            )}
            {expenses.extra_discount > 0 && (
              <div className='expense-row'>
                <span>Extra Discount:</span>
                <span>৳{expenses.extra_discount}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className='summary-section'>
        <div className='summary-row'>
          <span>Total Kg Sold:</span>
          <span>{totals.totalKg} kg</span>
        </div>

        {totals.totalDiscount > 0 && (
          <div className='summary-row'>
            <span>Total Discount:</span>
            <span>{totals.totalDiscount} kg</span>
          </div>
        )}

        <div className='summary-row'>
          <span>Total Crates Used:</span>
          <span>{totals.totalCrates}</span>
        </div>

        <div className='summary-row'>
          <span>Total Sales Amount:</span>
          <span>৳{totals.totalAmount.toFixed(2)}</span>
        </div>

        {totalExpenses > 0 && (
          <div className='summary-row'>
            <span>Total Expenses:</span>
            <span className='text-red-600'>৳{totalExpenses.toFixed(2)}</span>
          </div>
        )}

        <div className='summary-row total'>
          <span>Payable Amount:</span>
          <span>৳{payableAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default LotSaleInvoice
