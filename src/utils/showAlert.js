import Swal from 'sweetalert2'

export const showAlert = (message, icon = 'success') => {
  Swal.fire({
    text: message,
    icon, // "success", "error", "warning", "info", "question"
    confirmButtonColor: '#3085d6',
    showConfirmButton: false,
    timer: 1500
  })
}
