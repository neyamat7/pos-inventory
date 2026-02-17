 

const calculateExpenseValue = (amount, type, totalUnits, itemUnits) => {
  if (type === 'divided') {
    // Divide proportionally based on unit count (crates or boxes)
    if (totalUnits === 0) return 0

    return Number(((amount * itemUnits) / totalUnits).toFixed(2))
  }

  // For 'each' type, return the full amount
  return Number(amount.toFixed(2))
}

export const handleDistributionExpense = (data = {}, cartProducts, setCartProducts, suppliersData = [], customExpenses = []) => {
  const isDataEmpty = (!data || Object.keys(data).length === 0) && customExpenses.length === 0

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

  // Helper to get fixed expense value
  const getExpenseValue = (expenseKey, amountKey, typeKey, item, itemUnits) => {
    if (!data || Object.keys(data).length === 0) {
      return item[expenseKey] || 0
    }

    const amount = Number(data[amountKey] || 0)
    const type = data[typeKey]

    if (type === 'divided') {
      const val = calculateExpenseValue(amount, 'divided', totalUnits, itemUnits)

      return val
    } else if (type === 'each') {
      return calculateExpenseValue(amount, 'each', totalUnits, itemUnits)
    }

    return 0
  }
  
  // Helper to calculate custom expenses array for an item
  const getCustomExpensesForItem = (itemUnits) => {
      if (customExpenses.length === 0) return []
      
      return customExpenses.map(exp => {
          const amount = Number(exp.amount || 0)
          let val = 0
          
          if (exp.type === 'divided') {
               val = calculateExpenseValue(amount, 'divided', totalUnits, itemUnits)
          } else {
               val = calculateExpenseValue(amount, 'each', totalUnits, itemUnits)
          }
          
          return {
              name: exp.name,
              amount: val
          }
      })
  }

  setCartProducts(prevCart => {
    let hasChanges = false

    const newCart = prevCart.map(item => {
      // Calculate item's unit count based on type
      let itemUnits = 0

      if (item.isBoxed) {
        itemUnits = item.box_quantity || 0
      } else if (item.sell_by_piece) {
        itemUnits = item.piece_quantity || 0
      } else {
        itemUnits = (item.crate_type_one || 0) + (item.crate_type_two || 0)
      }

      // Calculate all expenses using helper
      const transportationValue = getExpenseValue(
        'transportation',
        'transportationAmount',
        'transportationType',
        item,
        itemUnits
      )

      const moshjidValue = getExpenseValue('moshjid', 'moshjidAmount', 'moshjidType', item, itemUnits)

      const vanVaraValue = getExpenseValue('van_vara', 'vanVaraAmount', 'vanVaraType', item, itemUnits)

      const tradingPostValue = getExpenseValue(
        'trading_post',
        'tradingPostAmount',
        'tradingPostType',
        item,
        itemUnits
      )

      const labourValue = getExpenseValue('labour', 'labourAmount', 'labourType', item, itemUnits)
      
      // Calculate Custom Expenses
      const itemCustomExpenses = getCustomExpensesForItem(itemUnits)
      const totalCustomExpenseValue = itemCustomExpenses.reduce((sum, exp) => sum + exp.amount, 0)

      const expenses = transportationValue + moshjidValue + vanVaraValue + tradingPostValue + labourValue + totalCustomExpenseValue

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
      
      const newExpenses = Number(expenses.toFixed(2))
    
      
      // Helper to compare arrays
      const areCustomExpensesEqual = (arr1, arr2) => {
          if (!arr1 && !arr2) return true;
          if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
          return arr1.every((val, index) => val.name === arr2[index].name && val.amount === arr2[index].amount);
      }

      // Check if any value actually changed
      if (
        item.transportation !== transportationValue ||
        item.moshjid !== moshjidValue ||
        item.van_vara !== vanVaraValue ||
        item.trading_post !== tradingPostValue ||
        item.labour !== labourValue ||
        item.expenses !== newExpenses ||
        item.cratePrice !== cratePrice ||
        !areCustomExpensesEqual(item.custom_expenses, itemCustomExpenses)
      ) {
        hasChanges = true
        return {
          ...item,
          transportation: transportationValue,
          moshjid: moshjidValue,
          van_vara: vanVaraValue,
          trading_post: tradingPostValue,
          labour: labourValue,
          expenses: newExpenses,
          cratePrice,
          // Store the detailed array
          custom_expenses: itemCustomExpenses,
          other_expenses: item.other_expenses || 0 
        }
      }

      return item
    })

    return hasChanges ? newCart : prevCart
  })
}
