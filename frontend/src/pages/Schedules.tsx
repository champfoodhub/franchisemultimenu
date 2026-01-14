import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Schedule } from '../types';
import ScheduleForm from '../components/ScheduleForm';
import useAuthStore from '../stores/auth';

const Schedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | undefined>();
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuthStore();

  const fetchSchedules = useCallback(async () => {
    try {
      const response = await api.get('/hq/schedules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules', error);
    }
  }, [token]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedSchedule(undefined);
    fetchSchedules();
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/hq/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSchedules();
    } catch (error) {
      console.error('Failed to delete schedule', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Schedules Management</h2>
      <button
        onClick={() => {
          setShowForm(!showForm);
          setSelectedSchedule(undefined);
        }}
        className="bg-primary text-secondary py-2 px-4 rounded-lg mb-4"
      >
        {showForm && !selectedSchedule ? 'Cancel' : 'Add Schedule'}
      </button>
      {showForm && <ScheduleForm schedule={selectedSchedule} onSuccess={handleSuccess} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold">{schedule.name}</h3>
            <p className="text-gray-700">{schedule.type}</p>
            {schedule.start_time && (
              <p className="text-gray-700">
                {schedule.start_time} - {schedule.end_time}
              </p>
            )}
            {schedule.start_date && (
              <p className="text-gray-700">
                {schedule.start_date} - {schedule.end_date}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => handleEdit(schedule)}
                className="bg-blue-500 text-white py-1 px-3 rounded-lg"
              >
                Edit
              </button>
              <Link
                to={`/hq/schedules/${schedule.id}`}
                className="bg-green-500 text-white py-1 px-3 rounded-lg"
              >
                Manage Items
              </Link>
              <button
                onClick={() => handleDelete(schedule.id)}
                className="bg-red-500 text-white py-1 px-3 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedules;
