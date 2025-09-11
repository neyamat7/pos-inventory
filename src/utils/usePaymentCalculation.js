import { useEffect } from 'react'

export const usePaymentCalculation = (receiveAmount, totalDueAmount, setPaymentValue) => {
  useEffect(() => {
    const receive = parseFloat(receiveAmount) || 0
    const total = parseFloat(totalDueAmount) || 0

    if (receive < total) {
      setPaymentValue('dueAmount', total - receive)
      setPaymentValue('changeAmount', 0)
    } else {
      setPaymentValue('dueAmount', 0)
      setPaymentValue('changeAmount', receive - total)
    }
  }, [receiveAmount, totalDueAmount, setPaymentValue])
}
