// Updated handleSalesTotal for single customer, using cost_price & selling_price
export const handleSalesTotal = (setCartProducts, selectedCustomer) => {
  setCartProducts(prevCart =>
    prevCart.map(item => {
      // --- crate price from selected customer data ---
      // const customerCrate = selectedCustomer?.crate || {}
      const typeOnePrice = selectedCustomer?.crate_type_one_price || 0
      const typeTwoPrice = selectedCustomer?.crate_type_two_price || 0

      const typeOneQty = item.crate_type_one || 0
      const typeTwoQty = item.crate_type_two || 0

      const cratePrice = Number((typeOneQty * typeOnePrice + typeTwoQty * typeTwoPrice).toFixed(2))

      // Get kg, cost price, and selling price
      const kg = Number(item.kg) || 0
      const costPrice = Number(item.cost_price) || 0
      const sellingPrice = Number(item.selling_price) || 0
      const discountKg = Number(item.discount_kg) || 0

      // --- Calculate discounted amount ---
      const discountedAmount = Number((discountKg * costPrice).toFixed(2))

      // Calculate total based on selling price (excluding discounted kg)
      const productBase = (kg - discountKg) * sellingPrice

      // Calculate profit per item (never below zero)
      // const profit = Math.max(0, (kg - discountKg) * sellingPrice - (kg - discountKg) * costPrice)

      // --- commission calculation ---
      // const isCommissioned =
      //   (item.product_name || '').toLowerCase().includes('mango') ||
      //   (item.product_name || '').toLowerCase().includes('pineapple')
      const isCommissioned = item.isCommissionable

      const commissionRate =
        isCommissioned && item.commission_rate != null ? (Number(item.commission_rate) || 0) / 100 : 0

      const commissionAmount = Number((productBase * commissionRate).toFixed(2))

      // Apply commission on productBase (selling total)
      const productAfterCommission = isCommissioned
        ? Number((productBase * (1 + commissionRate)).toFixed(2))
        : productBase

      const subtotal = Number((productBase + cratePrice).toFixed(2))

      // Final total = productAfterCommission + cratePrice
      const total = Number((productAfterCommission + cratePrice).toFixed(2))

      let profit

      if (isCommissioned) {
        // For commissionable products: profit = commission amount
        profit = commissionAmount
      } else {
        // For non-commissionable products
        profit = Math.max(0, (kg - discountKg) * sellingPrice - (kg - discountKg) * costPrice)
      }

      return {
        ...item,
        kg,
        cratePrice,
        commission: commissionAmount,
        subtotal,
        total,
        profit,
        discount_amount: discountedAmount
      }
    })
  )
}
