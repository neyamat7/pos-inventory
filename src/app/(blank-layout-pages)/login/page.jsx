// Component Imports
import Login from '@views/Login'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { auth } from '@/auth'

export const metadata = {
  title: 'Login',
  description: 'Login to your account'
}

const LoginPage = async () => {
  const session = await auth()

  console.log('in login page', session)

  if (session) {
    redirect('/dashboard')
  }

  // Vars
  const mode = await getServerMode()

  return <Login mode={mode} />
}

export default LoginPage
