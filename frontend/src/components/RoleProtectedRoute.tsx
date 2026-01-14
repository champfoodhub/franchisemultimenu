import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../stores/auth';
import { User } from '../types';

interface RoleProtectedRouteProps {
  roles: User['role'][];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ roles }) => {
  const { user } = useAuthStore();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
