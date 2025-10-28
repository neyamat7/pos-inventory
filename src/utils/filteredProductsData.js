// export const  filteredProductsData = (productsData, searchTerm = '', selectedCategory = []) => {
//   return productsData.filter(product => {
//     const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())

//     const matchesCategory =
//       selectedCategory.length === 0 ||
//       selectedCategory.some(category => category.toLowerCase() === product.category.toLowerCase())

//     return matchesSearch && matchesCategory
//   })
// }

export const filteredProductsData = (productsData, searchTerm = '', selectedCategory = []) => {
  return (productsData || []).filter(product => {
    const name = product.productName?.toLowerCase() || ''
    const category = product.categoryId?.categoryName?.toLowerCase() || ''

    const matchesSearch = name.includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory.length === 0 || selectedCategory.some(categoryName => categoryName.toLowerCase() === category)

    return matchesSearch && matchesCategory
  })
}
