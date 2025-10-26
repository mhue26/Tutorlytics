import React from 'react';

interface StatusIndicatorProps {
  isActive: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isActive }) => {
  const status = isActive ? 'Active' : 'Archived';
  const color = isActive ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div className="flex items-center">
      <span className={`h-2.5 w-2.5 rounded-full ${color} mr-2`}></span>
      <span>{status}</span>
    </div>
  );
};

export default StatusIndicator;
