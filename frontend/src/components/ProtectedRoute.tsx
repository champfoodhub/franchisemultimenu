import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../stores/auth';

const ProtectedRoute = () => {
  const { token, isGuest } = useAuthStore();

  if (!token && !isGuest) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
