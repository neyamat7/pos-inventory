import Image from 'next/image'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import Signin from '@/components/Signin/Signin'
import Signout from '@/components/Signout/Signout'

const HomePage = async () => {
  const session = await auth()

  console.log(session)

  if (!session) {
    redirect('/login')
  }

  return (
    <div>
      {session?.user ? (
        <div>
          <p>Logged in as {session?.user?.email}</p>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  )
}

export default HomePage
