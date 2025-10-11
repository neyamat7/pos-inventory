export const handleSalesTotal = (setCartProducts, customers) => {
  // update cartProducts with distributed expenses
  setCartProducts(prevCart =>
    prevCart.map(item => {
      // --- crate price from customer data ---
      const customer = customers?.find(s => s.sl === item.customer_id)

      // --- calculate crate prices for both types ---
      const customerCrate = customer?.crate || {}
      const typeOnePrice = customerCrate.type_one?.price || 0
      const typeTwoPrice = customerCrate.type_two?.price || 0

      const typeOneQty = item.crate?.type_one || 0
      const typeTwoQty = item.crate?.type_two || 0

      const cratePrice = Number((typeOneQty * typeOnePrice + typeTwoQty * typeTwoPrice).toFixed(2))

      // --- base product total before commission ---
      const productBase = Number(item.cost || 0) * (typeOneQty + typeTwoQty)

      const isCommissioned =
        (item.product_name || '').toLowerCase().includes('mango') ||
        (item.product_name || '').toLowerCase().includes('pineapple')

      const commissionRate =
        isCommissioned && item.commission_rate != null ? (Number(item.commission_rate) || 0) / 100 : 0

      const commissionAmount = Number((productBase * commissionRate).toFixed(2))

      // Apply commission (10%) to productBase ONLY, then add cratePrice without commission
      const productAfterCommission = isCommissioned
        ? Number((productBase * (1 + commissionRate)).toFixed(2))
        : productBase

      // console.log('base', productBase)
      // console.log('commission', commissionAmount)
      // console.log('commissionRate', commissionRate)

      // console.log('productAfterCommission', productAfterCommission)

      const total = Number(productAfterCommission.toFixed(2))

      return {
        ...item,
        commission: commissionAmount,
        cratePrice,
        total: total
      }
    })
  )
}
