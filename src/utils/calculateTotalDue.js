export const calculateTotalDue = cartProducts => {
  return cartProducts.reduce((acc, item) => acc + parseFloat(item.total || 0), 0)
}
