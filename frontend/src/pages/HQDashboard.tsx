import { Outlet, useLocation } from 'react-router-dom';

const HQDashboard = () => {
  const location = useLocation();
  
  const navItems = [
    { path: 'products', label: 'Products', icon: '📦' },
    { path: 'schedules', label: 'Schedules', icon: '📅' },
    { path: 'stock-reports', label: 'Stock Reports', icon: '📊' },
  ];

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h1 className="text-2xl font-bold text-gray-800">HQ Dashboard</h1>
        <p className="text-gray-600">Manage your franchise operations</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <nav className="flex overflow-x-auto">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={`/hq/${item.path}`}
              className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(item.path)
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default HQDashboard;

