import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Success message
export const showSuccess = message => {
  toast.success(message, {
    position: 'top-center',
    autoClose: 1200,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  })
}

// Error / Danger message
export const showError = message => {
  toast.error(message, {
    position: 'top-center',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  })
}

// Warning message
export const showWarning = message => {
  toast.warning(message, {
    position: 'top-center',
    autoClose: 1100,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  })
}

// Info message
export const showInfo = message => {
  toast.info(message, {
    position: 'top-center',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  })
}
