import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const BranchDashboard = () => {
  return (
    <div>
      <h1>Branch Dashboard</h1>
      <nav>
        <Link to="menu">Menu</Link>
        <Link to="time-based-menu" className="ml-4">
          Time-Based Menu
        </Link>
        <Link to="stock-update" className="ml-4">
          Update Stock
        </Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default BranchDashboard;
