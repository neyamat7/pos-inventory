import Link from 'next/link'

import { IconButton } from '@mui/material'

import { signInAction } from '@/app/actions'

const Signin = () => {
  return (
    <form action={signInAction}>
      <IconButton type='submit' className='text-error' size='small'>
        <i className='tabler-brand-google-filled' />
      </IconButton>
    </form>
  )
}

export default Signin
