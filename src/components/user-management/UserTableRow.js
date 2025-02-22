import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';

const UserTableRow = ({ user, selectedUsers, setSelectedUsers, onEdit, onPermissions, onDelete, onRoleChange, onStatusChange }) => {
  return (
    <tr>
      <td className="px-3 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedUsers([...selectedUsers, user.id]);
            } else {
              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
            }
          }}
          className="rounded border-gray-300"
        />
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
        <div className="text-sm text-gray-500 md:hidden">{user.email}</div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap hidden md:table-cell">
        <div className="text-sm text-gray-500">{user.email}</div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <select
          value={user.role}
          onChange={(e) => onRoleChange(user.id, e.target.value)}
          className="text-sm text-gray-900 rounded-md border-gray-300 focus:ring-[#461fa3] w-full sm:w-auto"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
        <select
          value={user.status}
          onChange={(e) => onStatusChange(user.id, e.target.value)}
          className="text-sm rounded-md border-gray-300 focus:ring-[#461fa3] w-full sm:w-auto"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="hidden sm:flex space-x-2 justify-end">
          <button onClick={() => onEdit(user)} className="text-[#461fa3] hover:text-[#7646eb]">
            Edit
          </button>
          <button onClick={() => onPermissions(user)} className="text-[#461fa3] hover:text-[#7646eb]">
            Permissions
          </button>
          <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
        
        {/* Mobile menu */}
        <div className="sm:hidden">
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="p-2">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </Menu.Button>
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onEdit(user)}
                      className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm w-full text-left`}
                    >
                      Edit Details
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onPermissions(user)}
                      className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm w-full text-left`}
                    >
                      Manage Permissions
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(user.id)}
                      className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm w-full text-left text-red-600`}
                    >
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;
