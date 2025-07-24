/**
 * Date utilities for handling IST timezone properly
 */

/**
 * Get current date in IST in YYYY-MM-DD format
 * @returns {string} Current date in IST
 */
export const getCurrentDateIST = () => {
  const now = new Date();
  // Convert to IST
  const istDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  return istDate.toISOString().split('T')[0];
};

/**
 * Get current datetime in IST
 * @returns {Date} Current datetime in IST
 */
export const getCurrentDateTimeIST = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
};

/**
 * Check if a given date is in the past (IST)
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {string} timeString - Time string in HH:MM format (optional)
 * @returns {boolean} True if the date/time is in the past
 */
export const isDateTimeInPast = (dateString, timeString = null) => {
  const currentIST = getCurrentDateTimeIST();
  
  if (timeString) {
    // Check both date and time
    const inputDateTime = new Date(`${dateString}T${timeString}:00`);
    return inputDateTime <= currentIST;
  } else {
    // Check only date (compare as start of day)
    const inputDate = new Date(`${dateString}T00:00:00`);
    const currentDate = new Date(currentIST.toISOString().split('T')[0] + 'T00:00:00');
    return inputDate < currentDate;
  }
};

/**
 * Format a date string for display in IST
 * @param {string} dateTimeString - DateTime string from database
 * @returns {string} Formatted date string
 */
export const formatDateTimeIST = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
