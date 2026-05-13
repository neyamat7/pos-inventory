// Updated handleSalesTotal for single customer, using cost_price & selling_price
export const handleSalesTotal = (setCartProducts, selectedCustomer, globalCratePrices = { type1: 0, type2: 0 }) => {
  setCartProducts(prevCart =>
    prevCart.map(item => {
      // Use customer price if available and not zero, otherwise fallback to global price
      const typeOnePrice = selectedCustomer?.crate_info?.type_1_price || globalCratePrices.type1 || 0
      const typeTwoPrice = selectedCustomer?.crate_info?.type_2_price || globalCratePrices.type2 || 0

      const typeOneQty = item.crate_type_one || 0
      const typeTwoQty = item.crate_type_two || 0

      // Free crate: no charge — crate price is 0
      const cratePrice = item.free_crate
        ? 0
        : Number((typeOneQty * typeOnePrice + typeTwoQty * typeTwoPrice).toFixed(2))

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

      // For bagged products, discount_kg is per bag
      if (item.isBagged) {
        const totalBags = Number(item.bag_quantity) || 0

        discountKg = discountKg * totalBags
      }

      // --- Calculate discounted amount ---
      // const discountedAmount = Number((discountKg * costPrice).toFixed(2))

      let discountedAmount = 0

      if (item.isBoxed || item.sell_by_piece || item.isBagged) {
        // For boxed, piece, and bagged products - use flat money discount
        discountedAmount = Number(item.discount_amount) || 0
        discountKg = 0 // Ensure no weight discount is applied
      } else {
        // For crated and regular kg-based products - use weight reduction
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
      } else if (item.isBagged) {
        // For bagged products (Price is per KG, discount is flat amount)
        productBase = Math.max(0, kg * sellingPrice - discountedAmount)
      } else {
        // For crated and regular kg-based products (Discount is weight-based)
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

      // subtotal = amount after discount (before crate price and commission)
      const subtotal = Number(productBase.toFixed(2))

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
        } else if (item.isBagged) {
          // For bagged products
          profit = Math.max(0, kg * sellingPrice - discountedAmount - kg * costPrice)
        } else {
          // For crated and regular kg-based products
          profit = Math.max(0, (kg - discountKg) * (sellingPrice - costPrice))
        }
      }

      return {
        ...item,
        // kg, // Don't overwrite kg as it might be a string input
        cratePrice,
        crate_type_one_price: typeOnePrice,
        crate_type_two_price: typeTwoPrice,
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
