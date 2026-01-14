import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { MenuItem, Schedule } from '../types';
import useAuthStore from '../stores/auth';
import { useToast } from '../context/ToastContext';
import MenuCard from '../components/MenuCard';
import LoadingSpinner from '../components/LoadingSpinner';

const TimeBasedMenu = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const { token } = useAuthStore();
  const { showToast } = useToast();

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/hq/schedules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(response.data);
    } catch (error) {
      showToast('Failed to fetch schedules', 'error');
      console.error('Failed to fetch schedules', error);
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  const fetchMenuItems = useCallback(async (scheduleId: string) => {
    if (!scheduleId) {
      setMenuItems([]);
      return;
    }

    try {
      setMenuLoading(true);
      // Use the time-based menu endpoint with schedule_id query param
      const response = await api.get(`/branch/menu/time-based?schedule_id=${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle the response format from the backend
      if (response.data && response.data.schedules && Array.isArray(response.data.schedules)) {
        // Extract items from all active schedules
        const allItems: MenuItem[] = [];
        response.data.schedules.forEach((schedule: any) => {
          if (schedule.items && Array.isArray(schedule.items)) {
            schedule.items.forEach((item: any) => {
              if (item.menu_items) {
                allItems.push({
                  id: item.id,
                  product_id: item.menu_item_id,
                  branch_id: '',
                  price: item.menu_items.price || 0,
                  is_active: item.menu_items.is_active || false,
                  active: item.menu_items.is_active || false,
                  product_name: item.menu_items.name,
                  category: item.menu_items.category,
                });
              }
            });
          }
        });
        setMenuItems(allItems);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      showToast('Failed to fetch menu items', 'error');
      console.error('Failed to fetch menu items', error);
    } finally {
      setMenuLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleScheduleChange = (scheduleId: string) => {
    setSelectedSchedule(scheduleId);
    fetchMenuItems(scheduleId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Time-Based Menu</h2>
          <p className="text-gray-600">View menu items based on selected schedule</p>
        </div>
        <button
          onClick={fetchSchedules}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Schedule Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Select Schedule
        </label>
        <select
          value={selectedSchedule}
          onChange={(e) => handleScheduleChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="">Choose a schedule...</option>
          {schedules.map((schedule) => (
            <option key={schedule.id} value={schedule.id}>
              {schedule.name} ({schedule.type.replace('_', ' ')})
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items */}
      {menuLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : selectedSchedule ? (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Items for: {schedules.find((s) => s.id === selectedSchedule)?.name}
            </h3>
          </div>
          {menuItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-lg mb-2">No items found for this schedule</p>
              <p className="text-gray-400 text-sm">
                Add items to this schedule in HQ Admin panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <MenuCard
                  key={item.id}
                  name={item.product_name || `Product ${item.product_id}`}
                  price={item.price}
                  category={item.category}
                  stock={item.stock}
                  discount={item.discount}
                  isActive={item.is_active}
                  isOutOfStock={(item.stock || 0) === 0}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">Select a schedule to view menu items</p>
        </div>
      )}
    </div>
  );
};

export default TimeBasedMenu;

