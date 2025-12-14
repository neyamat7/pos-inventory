import { auth } from '@/auth'

const AdminGuard = async ({ children }) => {
  const session = await auth()

  if (session?.user?.role !== 'admin') {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] p-10 text-center'>
        <div className='mb-4 text-6xl'>🚫</div>
        <h1 className='text-2xl font-bold mb-2'>Access Denied</h1>
        <p className='text-gray-500'>You do not have permission to view this page.</p>
      </div>
    )
  }

  return <>{children}</>
}

export default AdminGuard
