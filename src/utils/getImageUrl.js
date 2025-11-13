export const getImageUrl = imagePath => {
  if (!imagePath) return ''

  const filename = imagePath.split('\\').pop().split('/').pop()
  const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${filename}`

  return imageUrl
}
