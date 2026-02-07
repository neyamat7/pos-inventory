export const convertToBanglaNumber = (input) => {
  if (input === null || input === undefined) return '০'
  
  const englishToBanglaMap = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯'
  }

  return String(input).replace(/[0-9]/g, match => englishToBanglaMap[match])
}
