export const normalizeSaleForInvoice = (saleData, customerData = null) => {
  if (!saleData) return null
  // console.log('normalizeSaleForInvoice - raw items:', saleData.items)

  // ---------- CUSTOMER ----------
  const isCustomerPopulated = typeof saleData.customerId === 'object' && saleData.customerId !== null

  const customer_name =
    saleData.customer_name ||
    (isCustomerPopulated ? saleData.customerId?.basic_info?.name : '') ||
    customerData?.basic_info?.name ||
    'N/A'

  const customer_location =
    saleData.customer_location ||
    (isCustomerPopulated ? saleData.customerId?.contact_info?.location : '') ||
    customerData?.contact_info?.location ||
    ''

  // ---------- ITEMS ----------
  const normalizedItems =
    saleData.items?.map(item => {
      const isProductPopulated = typeof item.productId === 'object' && item.productId !== null

      const product_name =
        item.product_name ||
        item.product_name_bn ||
        (isProductPopulated ? item.productId?.productNameBn || item.productId?.productName : '') ||
        'N/A'

      const normalizedLots =
        item.selected_lots?.map(lot => {
          const isLotPopulated = typeof lot.lotId === 'object' && lot.lotId !== null

          return {
            lot_name: isLotPopulated ? lot.lotId?.lot_name : lot.lot_name || '',
            kg: Number(lot.kg) || 0,
            box_quantity: Number(lot.box_quantity) || 0,
            piece_quantity: Number(lot.piece_quantity) || 0,
            isBoxed: Boolean(lot.isBoxed || (isProductPopulated && item.productId?.isBoxed)),
            isPieced: Boolean(lot.isPieced || (isProductPopulated && item.productId?.sell_by_piece)),
            isCrated: Boolean(lot.isCrated || (isProductPopulated && item.productId?.isCrated)),
            isBagged: Boolean(lot.isBagged || (isProductPopulated && item.productId?.isBagged)),
            unit_price: Number(lot.unit_price) || 0,
            selling_price: Number(lot.selling_price) || 0,
            total_price: Number(lot.total_price) || 0,
            discount_Kg: Number(lot.discount_Kg || lot.discount_kg) || 0,
            discount_kg: Number(lot.discount_kg || lot.discount_Kg) || 0,
            discount_amount: Number(lot.discount_amount) || 0,
            crate_type1: Number(lot.crate_type1 || lot.crate_type_one) || 0,
            crate_type2: Number(lot.crate_type2 || lot.crate_type_two) || 0,
            lot_commission_rate: Number(lot.lot_commission_rate) || 0,
            lot_commission_amount: Number(lot.lot_commission_amount) || 0,
            customer_commission_rate: Number(lot.customer_commission_rate) || 0,
            customer_commission_amount: Number(lot.customer_commission_amount) || 0,
            lot_profit: Number(lot.lot_profit) || 0,
            kg_measurements: lot.kg_measurements || []
          }
        }) || []

      return {
        productId: item.productId,
        product_name,
        product_name_bn: isProductPopulated ? item.productId?.productNameBn : item.product_name_bn || '',
        selected_lots: normalizedLots
      }
    }) || []

  // ---------- PAYMENT ----------
  const payment_details = {
    total_crate_type1_price: Number(saleData.payment_details?.total_crate_type1_price) || 0,
    total_crate_type2_price: Number(saleData.payment_details?.total_crate_type2_price) || 0,
    payable_amount: Number(saleData.payment_details?.payable_amount) || 0,
    received_amount: Number(saleData.payment_details?.received_amount) || 0,
    received_amount_from_balance: Number(saleData.payment_details?.received_amount_from_balance) || 0,
    due_amount: Number(saleData.payment_details?.due_amount) || 0,
    previous_due: Number(saleData.payment_details?.previous_due) || 0,
    previous_balance: Number(saleData.payment_details?.previous_balance) || 0,
    payment_type: saleData.payment_details?.payment_type || 'cash',
    vat: Number(saleData.payment_details?.vat) || 0,
    note: saleData.payment_details?.note || ''
  }

  return {
    _id: saleData._id,
    sale_date: saleData.sale_date || new Date().toISOString(),
    customer_name,
    customer_location,
    total_custom_commission: Number(saleData.total_custom_commission) || 0,
    total_lots_commission: Number(saleData.total_lots_commission) || 0,
    total_profit: Number(saleData.total_profit) || 0,
    items: normalizedItems,
    payment_details,
    rawCustomerId: saleData.customerId, // Kept for account balance info if needed
    printTrigger: saleData.printTrigger || Date.now() // Added for InvoicePrintHandler
  }
}
