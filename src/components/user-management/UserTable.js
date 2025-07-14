
import React, { useCallback, useMemo } from 'react';
import UserTableRow from './UserTableRow';


// Memoized Table Header for accessibility and clarity
const TableHeader = React.memo(function TableHeader({ allSelected, onSelectAll, usersLength }) {
  return (
    <thead className="bg-primary">
      <tr>
        <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
          <input
            type="checkbox"
            aria-label="Select all users"
            onChange={onSelectAll}
            checked={allSelected && usersLength > 0}
            className="rounded border-gray-light focus:ring-accent focus:outline-none"
          />
        </th>
        <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
        <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider hidden md:table-cell">Email</th>
        <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Role</th>
        <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider hidden sm:table-cell">Status</th>
        <th className="px-2 sm:px-3 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
  );
});

const UserTable = React.memo(function UserTable({ users, selectedUsers, setSelectedUsers, onEdit, onPermissions, onDelete, onRoleChange, onStatusChange }) {
  // Memoize select all handler
  const handleSelectAll = useCallback((e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  }, [setSelectedUsers, users]);

  // Memoize allSelected for performance
  const allSelected = useMemo(() => selectedUsers.length === users.length && users.length > 0, [selectedUsers, users]);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-light shadow-md bg-background-light">
      <table className="min-w-full divide-y divide-gray-light" role="table" aria-label="User list">
        <TableHeader allSelected={allSelected} onSelectAll={handleSelectAll} usersLength={users.length} />
        <tbody className="bg-background-light divide-y divide-gray-light">
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              onEdit={onEdit}
              onPermissions={onPermissions}
              onDelete={onDelete}
              onRoleChange={onRoleChange}
              onStatusChange={onStatusChange}
              compact={true}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export { UserTable };
export default UserTable;
