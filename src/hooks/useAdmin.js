import { useSession } from 'next-auth/react'

export const useAdmin = () => {
  const session = useSession()
  const isAdmin = session?.data?.user?.role === 'admin'
  const isLoading = session.status === 'loading'

  return { isAdmin, isLoading }
}
