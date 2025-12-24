// MUI Imports
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import classnames from 'classnames'

// Component Import
import CustomAvatar from '@core/components/mui/Avatar'

const CardStatsVertical = props => {
  // Props
  const { stats, title, subtitle, avatarIcon, avatarColor, avatarSize, avatarSkin, chipText, chipColor, chipVariant } =
    props

  return (
    <Card>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <div className='flex flex-col gap-2'>
          <CustomAvatar variant='rounded' skin={avatarSkin} size={avatarSize} color={avatarColor}>
            <i className={classnames(avatarIcon, 'text-[28px]')} />
          </CustomAvatar>
          <div className='flex flex-col gap-0.5'>
            <Typography variant='h5'>{title}</Typography>
            <Typography variant='body2' color='text.disabled'>{subtitle}</Typography>
            <Typography variant='h6' color='text.primary' sx={{ mt: 0.5 }}>{stats}</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CardStatsVertical
