// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports

const Submit = ({ activeStep, isLastStep, handleNext, handlePrev }) => {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col items-center gap-4'>
        <div className='flex flex-col items-center gap-1'>
          <Typography variant='h5'>Submit</Typography>
          <Typography variant='body2'>Submit to kickstart your project.</Typography>
        </div>
        <img alt='submit-img' src='/images/illustrations/characters/4.png' height={200} width={176} />
      </div>
      <div className='flex items-center justify-between'>
        <Button variant='tonal' color='secondary' disabled={activeStep === 0} onClick={handlePrev} startIcon=''>
          Previous
        </Button>
        <Button
          variant='contained'
          color={isLastStep ? 'success' : 'primary'}
          onClick={handleNext}
          endIcon={isLastStep ? <i className='tablerr-check' /> : <p>icon</p>}
        >
          {isLastStep ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  )
}

export default Submit
