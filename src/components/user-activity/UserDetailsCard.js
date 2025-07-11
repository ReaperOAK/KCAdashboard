import React from 'react';

/**
 * UserDetailsCard - Card for user details.
 * @param {Object} props
 * @param {Object} props.user
 */
const UserDetailsCard = React.memo(function UserDetailsCard({ user }) {
  if (!user) return null;
  return (
    <section className="bg-background-light dark:bg-background-dark px-2 sm:px-4 py-3 sm:py-4 rounded-lg shadow-md mb-4 border border-gray-light transition-all duration-200" aria-label="User details">
      <h2 className="text-lg sm:text-xl font-semibold text-primary">{user.full_name}</h2>
      <p className="text-gray-dark">{user.email}</p>
    </section>
  );
});

export default UserDetailsCard;
