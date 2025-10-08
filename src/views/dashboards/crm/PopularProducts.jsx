// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Vars
const data = [
  {
    title: 'Fresh Mango',
    subtitle: '2500',
    amount: '$2.99 / kg',
    imgSrc: 'https://i.postimg.cc/2yhsJDLj/Mangoes.jpg'
  },
  {
    title: 'Red Apples',
    subtitle: '1800',
    amount: '$3.49 / kg',
    imgSrc: 'https://i.postimg.cc/DfsDFWyh/images.jpg'
  },
  {
    title: 'Organic Carrots',
    subtitle: '3200',
    amount: '$1.89 / kg',
    imgSrc: 'https://i.postimg.cc/cLd3d3ZF/pexels-jibarofoto-2238309.jpg'
  },
  {
    title: 'Green Broccoli',
    subtitle: '1450',
    amount: '$2.40 / kg',
    imgSrc: 'https://i.postimg.cc/QdDzsfH4/pexels-quang-nguyen-vinh-222549-2135677.jpg'
  },

  {
    title: 'Organic Carrots',
    subtitle: '3200',
    amount: '$1.89 / kg',
    imgSrc: 'https://i.postimg.cc/X7phQrt9/pexels-psco-1071882.jpg'
  },
  {
    title: 'Green Broccoli',
    subtitle: '1450',
    amount: '$2.40 / kg',
    imgSrc: 'https://i.postimg.cc/CL0CK5V4/pexels-rauf-allahverdiyev-561368-1367242.jpg'
  }
]

const PopularProducts = () => {
  return (
    <Card className='max-h-[530px] min-h-[530px]'>
      <CardHeader
        title='Popular Products'
        subheader='Total 10.4k Visitors'
        action={<OptionMenu options={['Price - low to high', 'Price - high to low', 'Best seller']} />}
      />
      <CardContent className='flex flex-col gap-[1.638rem] overflow-y-auto'>
        {data.map((item, index) => (
          <div key={index} className='flex items-center gap-4'>
            <img src={item.imgSrc} alt={item.title} width={46} />
            <div className='flex flex-wrap justify-between items-center gap-x-4 gap-y-1 is-full'>
              <div className='flex flex-col'>
                <Typography className='font-medium' color='text.primary'>
                  {item.title}
                </Typography>
                <Typography variant='body2'>{`Item: #FXZ-${item.subtitle}`}</Typography>
              </div>
              <Typography>{item.amount}</Typography>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default PopularProducts
