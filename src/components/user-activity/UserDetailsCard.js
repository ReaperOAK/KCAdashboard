
import React from 'react';

/**
 * UserDetailsCard - Beautiful, accessible, responsive card for user details.
 * @param {Object} props
 * @param {Object} props.user
 */
const UserDetailsCard = React.memo(function UserDetailsCard({ user }) {
  if (!user) return null;
  return (
    <section
      className="bg-background-light dark:bg-background-dark px-4 py-4 sm:px-6 sm:py-5 rounded-xl shadow-md mb-6 border border-gray-light flex items-center gap-4 transition-all duration-200 "
      aria-label="User details"
    >
      {/* Avatar or icon */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white text-xl font-bold shadow-sm">
        {user.full_name ? user.full_name[0].toUpperCase() : <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary truncate" title={user.full_name}>{user.full_name}</h2>
        <p className="text-gray-dark text-sm truncate" title={user.email}>{user.email}</p>
      </div>
    </section>
  );
});

export default UserDetailsCard;
