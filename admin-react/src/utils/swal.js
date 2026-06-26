import Swal from 'sweetalert2';

export const showSuccess = (title, text = '') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    timer: 2000,
    showConfirmButton: false,
  });
};

export const showError = (title, text = '') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#ef4444',
  });
};

export const showWarning = (title, text = '') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonColor: '#1e40af',
  });
};

export const showConfirm = (title, text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#9ca3af',
    confirmButtonText: 'ஆம் (Yes)',
    cancelButtonText: 'இல்லை (No)',
  });
};

export default Swal;
