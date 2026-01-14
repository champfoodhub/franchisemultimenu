import React, { useState } from 'react';
import api from '../services/api';
import useAuthStore from '../stores/auth';
import { Schedule } from '../types';

interface ScheduleFormProps {
  schedule?: Schedule;
  onSuccess: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ schedule, onSuccess }) => {
  const [name, setName] = useState(schedule?.name || '');
  const [type, setType] = useState<'TIME_SLOT' | 'SEASONAL'>(schedule?.type || 'TIME_SLOT');
  const [startTime, setStartTime] = useState(schedule?.start_time || '');
  const [endTime, setEndTime] = useState(schedule?.end_time || '');
  const [startDate, setStartDate] = useState(schedule?.start_date || '');
  const [endDate, setEndDate] = useState(schedule?.end_date || '');
  const [dayOfWeek, setDayOfWeek] = useState<number[]>(schedule?.day_of_week || []);
  const { token } = useAuthStore();

  const days = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const toggleDay = (day: number) => {
    setDayOfWeek((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const scheduleData = {
      name,
      type,
      start_time: type === 'TIME_SLOT' ? startTime : undefined,
      end_time: type === 'TIME_SLOT' ? endTime : undefined,
      start_date: type === 'SEASONAL' ? startDate : undefined,
      end_date: type === 'SEASONAL' ? endDate : undefined,
      day_of_week: type === 'TIME_SLOT' ? dayOfWeek : undefined,
    };
    try {
      if (schedule) {
        await api.put(`/hq/schedules/${schedule.id}`, scheduleData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/hq/schedules', scheduleData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save schedule', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-4">
      <h2 className="text-2xl font-bold mb-4">{schedule ? 'Edit Schedule' : 'Add Schedule'}</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Breakfast Menu, Summer Special"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Type</label>
        <select
          className="w-full px-3 py-2 border rounded-lg"
          value={type}
          onChange={(e) => setType(e.target.value as 'TIME_SLOT' | 'SEASONAL')}
        >
          <option value="TIME_SLOT">Time Slot</option>
          <option value="SEASONAL">Seasonal</option>
        </select>
      </div>
      {type === 'TIME_SLOT' && (
        <>
          <div className="mb-4">
            <label className="block text-gray-700">Start Time</label>
            <input
              type="time"
              className="w-full px-3 py-2 border rounded-lg"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">End Time</label>
            <input
              type="time"
              className="w-full px-3 py-2 border rounded-lg"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Days of Week</label>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    dayOfWeek.includes(day.value)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {type === 'SEASONAL' && (
        <>
          <div className="mb-4">
            <label className="block text-gray-700">Start Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">End Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </>
      )}
      <button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
      >
        {schedule ? 'Save Changes' : 'Create Schedule'}
      </button>
    </form>
  );
};

export default ScheduleForm;
