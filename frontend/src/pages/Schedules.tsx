import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { Schedule } from '../types';
import ScheduleForm from '../components/ScheduleForm';
import useAuthStore from '../stores/auth';
import { useToast } from '../context/ToastContext';
import ScheduleCard from '../components/ScheduleCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Schedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedSchedule(undefined);
    fetchSchedules();
    showToast('Schedule saved successfully', 'success');
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await api.delete(`/hq/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSchedules();
      showToast('Schedule deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete schedule', 'error');
      console.error('Failed to delete schedule', error);
    }
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
          <h2 className="text-2xl font-bold text-gray-800">Schedules Management</h2>
          <p className="text-gray-600">Manage time slots and seasonal schedules</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setSelectedSchedule(undefined);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
        >
          <span className="mr-2">{showForm && !selectedSchedule ? '✕' : '+'}</span>
          {showForm && !selectedSchedule ? 'Cancel' : 'Add Schedule'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <ScheduleForm schedule={selectedSchedule} onSuccess={handleSuccess} />
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg mb-2">No schedules found</p>
          <p className="text-gray-400 text-sm">Create your first schedule to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageItems={() => {
                // Navigation handled by Link in ScheduleCard
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedules;

