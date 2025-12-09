import { useSelector, useDispatch } from 'react-redux';
import { hideToast } from '../../store/toastSlice';
import Toast from './Toast';

const ToastContainer = () => {
  const dispatch = useDispatch();
  const { message, type, isVisible } = useSelector((state) => state.toast);

  if (!isVisible || !message) return null;

  return (
    <Toast
      message={message}
      type={type}
      onClose={() => dispatch(hideToast())}
    />
  );
};

export default ToastContainer;