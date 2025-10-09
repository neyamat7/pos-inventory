// import { signOutAction } from '@/app/actions'

import { signOutAction } from '@/actions/authActions'

const Signout = () => {
  return (
    <form action={signOutAction}>
      <button
        type='submit'
        className='bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300'
      >
        Signout
      </button>
    </form>
  )
}

export default Signout
