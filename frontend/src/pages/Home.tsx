import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/auth';

const Home = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <h1>Home Page</h1>
      {user?.role === 'HQ' && <Link to="/hq">HQ Dashboard</Link>}
      {user?.role === 'BRANCH' && <Link to="/branch">Branch Dashboard</Link>}
    </div>
  );
};

export default Home;
