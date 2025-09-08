import Image from 'next/image'

import { auth } from '@/auth'
import Signin from '@/components/Signin/Signin'
import Signout from '@/components/Signout/Signout'

const HomePage = async () => {
  const session = await auth()

  console.log('session', session)

  return (
    <div>
      {session?.user ? (
        <div>
          <p>Logged in as {session?.user?.name}</p>
          <Image src={session?.user?.image} alt={session?.user?.name} width={100} height={100} />
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  )
}

export default HomePage
