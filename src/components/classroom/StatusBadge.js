import React from 'react';
import { CheckCircle, Clock, Info } from 'lucide-react';


const STATUS_STYLES = {
  active: {
    badge: 'bg-green-600 text-white',
    icon: <CheckCircle className="inline w-4 h-4 mr-1 text-white" aria-hidden="true" />,
    label: 'Active',
  },
  upcoming: {
    badge: 'bg-accent text-white',
    icon: <Clock className="inline w-4 h-4 mr-1 text-white" aria-hidden="true" />,
    label: 'Upcoming',
  },
  default: {
    badge: 'bg-gray-light text-primary dark:bg-gray-dark dark:text-text-light',
    icon: <Info className="inline w-4 h-4 mr-1 text-primary dark:text-text-light" aria-hidden="true" />,
    label: 'Info',
  },
};

const StatusBadge = React.memo(({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.default;
  return (
    <span
      className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${style.badge} transition-all duration-200 shadow-sm`}
      aria-label={`Status: ${style.label}`}
    >
      {style.icon}
      {style.label}
    </span>
  );
});

export default StatusBadge;
