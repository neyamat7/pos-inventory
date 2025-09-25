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
    <Card className='min-h-[220px]'>
      <CardContent className='flex flex-col gap-y-3 h-full'>
        <CustomAvatar variant='rounded' skin={avatarSkin} size={avatarSize} color={avatarColor}>
          <i className={classnames(avatarIcon, 'text-[28px]')} />
        </CustomAvatar>
        <div className='flex flex-col gap-y-1'>
          <Typography variant='h5'>{title}</Typography>
          <Typography color='text.disabled'>{subtitle}</Typography>
          <Typography color='text.primary'>{stats}</Typography>
        </div>
        <div className='flex-1'></div>
        {/* <Chip label={chipText} color={chipColor} variant={chipVariant} size='small' /> */}
      </CardContent>
    </Card>
  )
}

export default CardStatsVertical
