import Swal from 'sweetalert2'

export const showAlert = (message, icon = 'success') => {
  Swal.fire({
    text: message,
    icon, // "success", "error", "warning", "info", "question"
    confirmButtonText: 'OK',
    confirmButtonColor: '#3085d6'
  })
}
