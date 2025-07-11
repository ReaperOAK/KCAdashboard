import React from 'react';
import { CheckCircle, Clock, Info } from 'lucide-react';

const StatusBadge = React.memo(({ status }) => {
  let badgeClass = 'bg-gray-light text-gray-dark';
  let icon = <Info className="inline w-4 h-4 mr-1" />;
  if (status === 'active') {
    badgeClass = 'bg-green-100 text-green-800';
    icon = <CheckCircle className="inline w-4 h-4 mr-1 text-green-600" />;
  } else if (status === 'upcoming') {
    badgeClass = 'bg-blue-100 text-blue-800';
    icon = <Clock className="inline w-4 h-4 mr-1 text-blue-600" />;
  }
  return (
    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badgeClass}`}>{icon}{status}</span>
  );
});

export default StatusBadge;
