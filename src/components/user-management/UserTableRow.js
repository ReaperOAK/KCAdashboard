
import React, { useCallback, memo } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';

// Memoized action buttons for desktop

const RowActions = memo(function RowActions({ user, onEdit, onPermissions, onDelete }) {
  return (
    <div className="hidden sm:flex gap-2 justify-end">
      <button
        type="button"
        onClick={onEdit}
        className="px-2 py-1 rounded text-accent hover:text-white hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-150"
        aria-label={`Edit ${user.full_name}`}
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onPermissions}
        className="px-2 py-1 rounded text-secondary hover:text-white hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all duration-150"
        aria-label={`Manage permissions for ${user.full_name}`}
      >
        Permissions
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="px-2 py-1 rounded text-white bg-highlight hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-highlight transition-all duration-150"
        aria-label={`Delete ${user.full_name}`}
      >
        Delete
      </button>
    </div>
  );
});

// Memoized mobile menu actions

const MobileMenuActions = memo(function MobileMenuActions({ user, onEdit, onPermissions, onDelete }) {
  return (
    <div className="sm:hidden">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="p-2 rounded-full hover:bg-gray-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label={`Open actions for ${user.full_name}`}>
          <EllipsisVerticalIcon className="h-5 w-5 text-gray-dark" />
        </Menu.Button>
        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Menu.Items className="absolute left-0 right-0 mx-auto mt-2 w-full max-w-xs sm:w-48 origin-top-right rounded-md bg-background-light shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={onEdit}
                  className={`block px-4 py-2 text-sm w-full text-left rounded ${active ? 'bg-accent text-white' : 'text-text-dark'}`}
                  aria-label={`Edit ${user.full_name}`}
                >
                  Edit Details
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={onPermissions}
                  className={`block px-4 py-2 text-sm w-full text-left rounded ${active ? 'bg-secondary text-white' : 'text-text-dark'}`}
                  aria-label={`Manage permissions for ${user.full_name}`}
                >
                  Manage Permissions
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={onDelete}
                  className={`block px-4 py-2 text-sm w-full text-left rounded ${active ? 'bg-highlight text-white' : 'text-highlight'}`}
                  aria-label={`Delete ${user.full_name}`}
                >
                  Delete
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
});

const UserTableRow = memo(function UserTableRow({ user, selectedUsers, setSelectedUsers, onEdit, onPermissions, onDelete, onRoleChange, onStatusChange }) {
  // Memoized handlers for row actions
  const handleCheckboxChange = useCallback((e) => {
    if (e.target.checked) {
      setSelectedUsers([...selectedUsers, user.id]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
    }
  }, [selectedUsers, setSelectedUsers, user.id]);

  const handleEdit = useCallback(() => onEdit(user), [onEdit, user]);
  const handlePermissions = useCallback(() => onPermissions(user), [onPermissions, user]);
  const handleDelete = useCallback(() => onDelete(user.id), [onDelete, user.id]);
  const handleRoleChange = useCallback((e) => onRoleChange(user.id, e.target.value), [onRoleChange, user.id]);
  const handleStatusChange = useCallback((e) => onStatusChange(user.id, e.target.value), [onStatusChange, user.id]);

  return (
    <tr className="hover:bg-gray-light focus-within:bg-gray-light align-top transition-colors duration-150">
      <td className="px-2 py-2 sm:px-3 sm:py-4 align-middle">
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={handleCheckboxChange}
          className="rounded border-gray-light focus:ring-accent focus:outline-none"
          aria-label={`Select ${user.full_name}`}
        />
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-4 align-middle">
        <div className="text-sm font-medium text-text-dark break-words max-w-[120px] sm:max-w-none">{user.full_name}</div>
        <div className="text-xs sm:text-sm text-gray-dark md:hidden break-words max-w-[120px] sm:max-w-none">{user.email}</div>
      </td>
      <td className="px-2 py-2 hidden md:table-cell sm:px-3 sm:py-4 align-middle">
        <div className="text-xs sm:text-sm text-gray-dark break-words max-w-[120px] sm:max-w-none">{user.email}</div>
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-4 align-middle">
        <select
          value={user.role}
          onChange={handleRoleChange}
          className="text-xs sm:text-sm text-text-dark rounded-md border-gray-light focus:ring-accent focus:outline-none w-full transition-all duration-150"
          aria-label={`Change role for ${user.full_name}`}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="px-2 py-2 hidden sm:table-cell sm:px-3 sm:py-4 align-middle">
        <select
          value={user.status}
          onChange={handleStatusChange}
          className="text-xs sm:text-sm rounded-md border-gray-light focus:ring-accent focus:outline-none w-full transition-all duration-150"
          aria-label={`Change status for ${user.full_name}`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-4 text-right text-xs sm:text-sm font-medium align-middle">
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-end sm:items-center justify-end">
          <RowActions user={user} onEdit={handleEdit} onPermissions={handlePermissions} onDelete={handleDelete} />
          <MobileMenuActions user={user} onEdit={handleEdit} onPermissions={handlePermissions} onDelete={handleDelete} />
        </div>
      </td>
    </tr>
  );
});

export { UserTableRow };
export default UserTableRow;
