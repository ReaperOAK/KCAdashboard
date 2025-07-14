// Utility to format schedule JSON string or object to a readable string
export function formatSchedule(schedule) {
  if (!schedule) return 'N/A';
  let schedObj = schedule;
  if (typeof schedule === 'string') {
    try {
      schedObj = JSON.parse(schedule);
    } catch {
      return schedule;
    }
  }
  if (!schedObj.days || !schedObj.time || !schedObj.duration) return 'N/A';
  const days = Array.isArray(schedObj.days) ? schedObj.days.join(', ') : schedObj.days;
  return `${days}, ${schedObj.time} for ${schedObj.duration} min`;
}
