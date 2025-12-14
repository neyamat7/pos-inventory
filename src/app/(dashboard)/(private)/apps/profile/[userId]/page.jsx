import { getUserById } from '@/actions/authActions/login.actions'
import { auth } from '@/auth'
import Profile from '@/views/apps/profile'

const ProfilePage = async ({ params }) => {
  const userId = (await params).userId
  const session = await auth()

  // Check if user is authorized (admin or profile owner)
  const isAuthorized = session?.user?.role === 'admin' || session?.user?.id === userId

  // console.log('session in profile page', session)

  if (!isAuthorized) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] p-10 text-center'>
        <div className='mb-4 text-6xl'>🚫</div>
        <h1 className='text-2xl font-bold mb-2'>Access Denied</h1>
        <p className='text-gray-500'>You do not have permission to view this profile.</p>
      </div>
    )
  }

  const user = await getUserById(userId)

  return (
    <div>
      <Profile user={user} userId={userId} />
    </div>
  )
}

export default ProfilePage
