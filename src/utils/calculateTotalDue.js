export const calculateTotalDue = cartProducts => {
  const total = cartProducts.reduce((acc, item) => acc + parseFloat(item.total || 0), 0)

  console.log('total', total);

  return parseFloat(total.toFixed(2))
}
