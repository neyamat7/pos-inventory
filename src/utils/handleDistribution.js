const calculateExpenseValue = (amount, type, totalCrates, itemCrates) => {
  if (type === 'divided') {
    // Divide proportionally based on crate count
    if (totalCrates === 0) return 0

    return Number(((Number(amount) * itemCrates) / totalCrates).toFixed(2))
  }

  // For 'each' type, return the full amount (will be handled per supplier)
  return Number(Number(amount).toFixed(2))
}

export const handleDistributionExpense = (data = {}, cartProducts, setCartProducts, suppliersData = []) => {
  const isDataEmpty = !data || Object.keys(data).length === 0

  // Calculate total crates across all products
  const totalCrates = cartProducts.reduce((sum, item) => {
    const typeOne = item.crate_type_one || 0
    const typeTwo = item.crate_type_two || 0

    return sum + typeOne + typeTwo
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

  // Helper function to calculate expense for any type
  const getExpenseValue = (expenseKey, amountKey, typeKey, item, itemCrates, isFirstProductForSupplier) => {
    if (isDataEmpty) {
      return item[expenseKey] || 0
    }

    const amount = data[amountKey]
    const type = data[typeKey]

    if (type === 'divided') {
      return calculateExpenseValue(amount, 'divided', totalCrates, itemCrates)
    } else if (type === 'each' && isFirstProductForSupplier) {
      return calculateExpenseValue(amount, 'each', totalCrates, itemCrates)
    }

    return 0
  }

  setCartProducts(prevCart =>
    prevCart.map(item => {
      // Calculate item's crate count
      const itemCrates = (item.crate_type_one || 0) + (item.crate_type_two || 0)

      // Check if this is the first product for this supplier (for "each" type)
      const isFirstProductForSupplier = supplierGroups[item.supplier_id]?.[0] === item.product_id

      // Calculate all expenses using helper
      const transportationValue = getExpenseValue(
        'transportation',
        'transportationAmount',
        'transportationType',
        item,
        itemCrates,
        isFirstProductForSupplier
      )

      const moshjidValue = getExpenseValue(
        'moshjid',
        'moshjidAmount',
        'moshjidType',
        item,
        itemCrates,
        isFirstProductForSupplier
      )

      const vanVaraValue = getExpenseValue(
        'van_vara',
        'vanVaraAmount',
        'vanVaraType',
        item,
        itemCrates,
        isFirstProductForSupplier
      )

      const tradingPostValue = getExpenseValue(
        'trading_post',
        'tradingPostAmount',
        'tradingPostType',
        item,
        itemCrates,
        isFirstProductForSupplier
      )

      const labourValue = getExpenseValue(
        'labour',
        'labourAmount',
        'labourType',
        item,
        itemCrates,
        isFirstProductForSupplier
      )

      const expenses = transportationValue + moshjidValue + vanVaraValue + tradingPostValue + labourValue

      // --- get supplier info ---
      const supplier = suppliersData?.find(s => s._id === item.supplier_id)

      // --- calculate crate prices for both types ---
      const crateInfo = supplier?.crate_info || {}
      const typeOnePrice = crateInfo.crate1Price || 0
      const typeTwoPrice = crateInfo.crate2Price || 0

      const typeOneQty = item.crate_type_one || 0
      const typeTwoQty = item.crate_type_two || 0

      const cratePrice = Number((typeOneQty * typeOnePrice + typeTwoQty * typeTwoPrice).toFixed(2))

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
