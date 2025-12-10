import { getUserById } from '@/actions/authActions'
import Profile from '@/views/apps/profile'

const ProfilePage = async ({ params }) => {
  const userId = await params.userId
  const user = await getUserById(userId)

  return (
    <div>
      <Profile user={user} userId={userId} />
    </div>
  )
}

export default ProfilePage
