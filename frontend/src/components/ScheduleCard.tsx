import React from 'react';
import { Link } from 'react-router-dom';
import { Schedule } from '../types';

interface ScheduleCardProps {
  schedule: Schedule;
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (id: string) => void;
  onManageItems?: (id: string) => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ 
  schedule, 
  onEdit, 
  onDelete,
  onManageItems 
}) => {
  const getTypeColor = (type: string) => {
    return type === 'TIME_SLOT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
  };

  const getTypeIcon = (type: string) => {
    return type === 'TIME_SLOT' ? '⏰' : '📅';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{schedule.name}</h3>
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(schedule.type)}`}>
              <span className="mr-1">{getTypeIcon(schedule.type)}</span>
              {schedule.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {schedule.start_time && schedule.end_time && (
            <div className="flex items-center">
              <span className="mr-2">🕐</span>
              <span>{schedule.start_time} - {schedule.end_time}</span>
            </div>
          )}
          {schedule.start_date && schedule.end_date && (
            <div className="flex items-center">
              <span className="mr-2">📆</span>
              <span>{schedule.start_date} to {schedule.end_date}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(schedule)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition-colors"
            >
              Edit
            </button>
          )}
          {onManageItems && (
            <Link
              to={`/hq/schedules/${schedule.id}`}
              className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm transition-colors inline-flex items-center"
            >
              Manage Items
            </Link>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(schedule.id)}
              className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;

