 

const calculateExpenseValue = (amount, type, totalUnits, itemUnits) => {
  if (type === 'divided') {
    // Divide proportionally based on unit count (crates or boxes)
    if (totalUnits === 0) return 0

    return Number(((Number(amount) * itemUnits) / totalUnits).toFixed(2))
  }

  // For 'each' type, return the full amount (will be handled per supplier)
  return Number(Number(amount).toFixed(2))
}

export const handleDistributionExpense = (data = {}, cartProducts, setCartProducts, suppliersData = []) => {
  const isDataEmpty = !data || Object.keys(data).length === 0

 

  const totalUnits = cartProducts.reduce((sum, item) => {
    if (item.isBoxed) {
      return sum + (item.box_quantity || 0)
    } else if (item.sell_by_piece) {
      return sum + (item.piece_quantity || 0)
    } else {
      const typeOne = item.crate_type_one || 0
      const typeTwo = item.crate_type_two || 0

      return sum + typeOne + typeTwo
    }
  }, 0)

  // Group products by supplier to handle "each" type expenses
  const supplierGroups = {}

  cartProducts.forEach(item => {
    const supplierId = item.supplier_id

    if (!supplierGroups[supplierId]) {
      supplierGroups[supplierId] = []
    }

    supplierGroups[supplierId].push(item.product_id)
  })

 
  const getExpenseValue = (expenseKey, amountKey, typeKey, item, itemUnits, isFirstProductForSupplier) => {
    if (isDataEmpty) {
      return item[expenseKey] || 0
    }

    const amount = data[amountKey]
    const type = data[typeKey]

    if (type === 'divided') {
      return calculateExpenseValue(amount, 'divided', totalUnits, itemUnits)
    } else if (type === 'each' && isFirstProductForSupplier) {
      return calculateExpenseValue(amount, 'each', totalUnits, itemUnits)
    }

    return 0
  }

  setCartProducts(prevCart =>
    prevCart.map(item => {
      // Calculate item's unit count based on type
      let itemUnits = 0

      if (item.isBoxed) {
        itemUnits = item.box_quantity || 0
      } else if (item.sell_by_piece) {
        itemUnits = item.piece_quantity || 0
      } else {
        itemUnits = (item.crate_type_one || 0) + (item.crate_type_two || 0)
      }

      // Check if this is the first product for this supplier (for "each" type)
      const isFirstProductForSupplier = supplierGroups[item.supplier_id]?.[0] === item.product_id

      // Calculate all expenses using helper
      const transportationValue = getExpenseValue(
        'transportation',
        'transportationAmount',
        'transportationType',
        item,
        itemUnits,
        isFirstProductForSupplier
      )

      const moshjidValue = getExpenseValue(
        'moshjid',
        'moshjidAmount',
        'moshjidType',
        item,
        itemUnits,
        isFirstProductForSupplier
      )

      const vanVaraValue = getExpenseValue(
        'van_vara',
        'vanVaraAmount',
        'vanVaraType',
        item,
        itemUnits,
        isFirstProductForSupplier
      )

      const tradingPostValue = getExpenseValue(
        'trading_post',
        'tradingPostAmount',
        'tradingPostType',
        item,
        itemUnits,
        isFirstProductForSupplier
      )

      const labourValue = getExpenseValue(
        'labour',
        'labourAmount',
        'labourType',
        item,
        itemUnits,
        isFirstProductForSupplier
      )

      const expenses = transportationValue + moshjidValue + vanVaraValue + tradingPostValue + labourValue

      // --- get supplier info ---
      const supplier = suppliersData?.find(s => s._id === item.supplier_id)

     
      let cratePrice = 0

      if (!item.isBoxed && !item.sell_by_piece) {
        const crateInfo = supplier?.crate_info || {}
        const typeOnePrice = crateInfo.crate1Price || 0
        const typeTwoPrice = crateInfo.crate2Price || 0

        const typeOneQty = item.crate_type_one || 0
        const typeTwoQty = item.crate_type_two || 0

        cratePrice = Number((typeOneQty * typeOnePrice + typeTwoQty * typeTwoPrice).toFixed(2))
      }

      return {
        ...item,
        transportation: transportationValue,
        moshjid: moshjidValue,
        van_vara: vanVaraValue,
        trading_post: tradingPostValue,
        labour: labourValue,
        expenses: Number(expenses.toFixed(2)),
        cratePrice
      }
    })
  )
}
