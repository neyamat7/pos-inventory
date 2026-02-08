// Updated handleSalesTotal for single customer, using cost_price & selling_price
export const handleSalesTotal = (setCartProducts, selectedCustomer) => {
  setCartProducts(prevCart =>
    prevCart.map(item => {
      const typeOnePrice = selectedCustomer?.crate_info?.type_1_price || 0
      const typeTwoPrice = selectedCustomer?.crate_info?.type_2_price || 0

      const typeOneQty = item.crate_type_one || 0
      const typeTwoQty = item.crate_type_two || 0

      const cratePrice = Number((typeOneQty * typeOnePrice + typeTwoQty * typeTwoPrice).toFixed(2))

      // console.log('cratePrice', cratePrice)

      // Get kg, cost price, and selling price
      // Get kg, cost price, and selling price
      const kg = Number(item.kg) || 0
      const costPrice = Number(item.cost_price) || 0
      const sellingPrice = Number(item.selling_price) || 0
      
      let discountKg = Number(item.discount_kg) || 0

      // For crated products, discount_kg is per crate
      if (item.isCrated) {
        const totalCrates = (Number(item.crate_type_one) || 0) + (Number(item.crate_type_two) || 0)

        discountKg = discountKg * totalCrates
      }

      // --- Calculate discounted amount ---
      // const discountedAmount = Number((discountKg * costPrice).toFixed(2))

      let discountedAmount = 0

      if (item.isBoxed) {
        // For boxed products
        discountedAmount = Number(item.discount_amount) || 0
      } else if (item.sell_by_piece) {
        // For piece-based products
        discountedAmount = Number(item.discount_amount) || 0
      } else {
        // For kg-based products
        discountedAmount = Number((discountKg * costPrice).toFixed(2))
      }

      // Calculate total based on selling price (excluding discounted kg)
      let productBase = 0

      if (item.isBoxed) {
        // For boxed products
        const boxQty = Number(item.box_quantity) || 0

        productBase = Math.max(0, boxQty * sellingPrice - discountedAmount)
      } else if (item.sell_by_piece) {
        // For piece-based products
        const pieceQty = Number(item.piece_quantity) || 0

        productBase = Math.max(0, pieceQty * sellingPrice - discountedAmount)
      } else {
        // For kg-based products
        productBase = Math.max(0, (kg - discountKg) * sellingPrice)
      }

      const isCommissioned = item.isCommissionable

      const commissionRate =
        isCommissioned && item.commission_rate != null ? (Number(item.commission_rate) || 0) / 100 : 0

      const commissionAmount = Number((productBase * commissionRate).toFixed(2))

      const lotCommissionRate = (item.lot_selected?.commission_rate || 0) / 100
      const lotCommissionAmount = Number((productBase * lotCommissionRate).toFixed(2))

      // Apply commission on productBase (selling total)
      const productAfterCommission = isCommissioned
        ? Number((productBase * (1 + commissionRate)).toFixed(2))
        : productBase

      // const subtotal = Number(productBase.toFixed(2))
      let subtotal = 0

      if (item.isBoxed) {
        const boxQty = Number(item.box_quantity) || 0

        subtotal = Number((boxQty * sellingPrice).toFixed(2))
      } else if (item.sell_by_piece) {
        const pieceQty = Number(item.piece_quantity) || 0

        subtotal = Number((pieceQty * sellingPrice).toFixed(2))
      } else {
        subtotal = Number((kg * sellingPrice).toFixed(2))
      }

      // Final total = productAfterCommission + cratePrice
      const total = Math.max(0, Number((productAfterCommission + cratePrice).toFixed(2)))
 

      let profit

      if (isCommissioned) {
        // For commissionable products
        profit = commissionAmount
      } else {
        // For non-commissionable products
        if (item.isBoxed) {
          // For boxed products
          const boxQty = Number(item.box_quantity) || 0

          profit = Math.max(0, boxQty * sellingPrice - discountedAmount - boxQty * costPrice)
        } else if (item.sell_by_piece) {
          // For piece-based products
          const pieceQty = Number(item.piece_quantity) || 0

          profit = Math.max(0, pieceQty * sellingPrice - discountedAmount - pieceQty * costPrice)
        } else {
          // For kg-based products
          profit = Math.max(0, (kg - discountKg) * sellingPrice - (kg - discountKg) * costPrice)
        }
      }

      return {
        ...item,
        // kg, // Don't overwrite kg as it might be a string input
        cratePrice,
        commission: commissionAmount,
        lot_commission: lotCommissionAmount,
        subtotal,
        total,
        profit,
        discount_amount: item.isBoxed || item.sell_by_piece ? item.discount_amount : discountedAmount,
        total_discount_kg: discountKg
      }
    })
  )
}
