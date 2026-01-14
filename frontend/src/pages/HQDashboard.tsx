import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const HQDashboard = () => {
  return (
    <div>
      <h1>HQ Dashboard</h1>
      <nav>
        <Link to="products">Products</Link>
        <Link to="schedules" className="ml-4">
          Schedules
        </Link>
        <Link to="stock-reports" className="ml-4">
          Stock Reports
        </Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default HQDashboard;
