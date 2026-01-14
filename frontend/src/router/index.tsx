import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Home from '../pages/Home';
import ProtectedRoute from '../components/ProtectedRoute';
import HQDashboard from '../pages/HQDashboard';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import Products from '../pages/Products';
import Schedules from '../pages/Schedules';
import ScheduleItems from '../pages/ScheduleItems';
import StockReports from '../pages/StockReports';
import BranchDashboard from '../pages/BranchDashboard';
import Menu from '../pages/Menu';
import TimeBasedMenu from '../pages/TimeBasedMenu';
import StockUpdate from '../pages/StockUpdate';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <Layout />,
            children: [
              {
                path: '',
                element: <Home />,
              },
              {
                element: <RoleProtectedRoute roles={['HQ']} />,
                children: [
                  {
                    path: 'hq',
                    element: <HQDashboard />,
                    children: [
                      {
                        path: 'products',
                        element: <Products />,
                      },
                      {
                        path: 'schedules',
                        element: <Schedules />,
                      },
                      {
                        path: 'schedules/:id',
                        element: <ScheduleItems />,
                      },
                      {
                        path: 'stock-reports',
                        element: <StockReports />,
                      },
                    ],
                  },
                ],
              },
              {
                element: <RoleProtectedRoute roles={['BRANCH']} />,
                children: [
                  {
                    path: 'branch',
                    element: <BranchDashboard />,
                    children: [
                      {
                        path: 'menu',
                        element: <Menu />,
                      },
                      {
                        path: 'time-based-menu',
                        element: <TimeBasedMenu />,
                      },
                      {
                        path: 'stock-update',
                        element: <StockUpdate />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
