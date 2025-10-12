// ✅ Updated handleSalesTotal for single customer, using cost_price & selling_price
export const handleSalesTotal = (setCartProducts, selectedCustomer) => {
  setCartProducts(prevCart =>
    prevCart.map(item => {
      // --- crate price from selected customer data ---
      const customerCrate = selectedCustomer?.crate || {}
      const typeOnePrice = customerCrate.type_one?.price || 0
      const typeTwoPrice = customerCrate.type_two?.price || 0

      const typeOneQty = item.crate?.type_one || 0
      const typeTwoQty = item.crate?.type_two || 0

      const cratePrice = Number((typeOneQty * typeOnePrice + typeTwoQty * typeTwoPrice).toFixed(2))

      // Get kg, cost price, and selling price
      const kg = Number(item.kg) || 0
      const costPrice = Number(item.cost_price) || 0
      const sellingPrice = Number(item.selling_price) || 0

      // Calculate total based on selling price
      const productBase = kg * sellingPrice

      // Calculate profit per item (never below zero)
      const profit = Math.max(0, (sellingPrice - costPrice) * kg)

      // --- commission calculation ---
      const isCommissioned =
        (item.product_name || '').toLowerCase().includes('mango') ||
        (item.product_name || '').toLowerCase().includes('pineapple')

      const commissionRate =
        isCommissioned && item.commission_rate != null ? (Number(item.commission_rate) || 0) / 100 : 0

      const commissionAmount = Number((productBase * commissionRate).toFixed(2))

      // Apply commission on productBase (selling total)
      const productAfterCommission = isCommissioned
        ? Number((productBase * (1 + commissionRate)).toFixed(2))
        : productBase

      // Final total = productAfterCommission + cratePrice
      const total = Number((productBase + cratePrice).toFixed(2))

      return {
        ...item,
        kg,
        cratePrice,
        total,
        profit
      }
    })
  )
}
