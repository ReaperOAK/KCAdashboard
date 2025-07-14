
import React, { useCallback, memo, useRef, useEffect, useState } from 'react';
import UserActivity from '../../../pages/admin/UserActivity';
import ModalHeader from './ModalHeader';
import TabNav from './TabNav';
import UserDetailsForm from './UserDetailsForm';

function EditUserModal({ user, onSubmit, onClose, error, activeTab, setActiveTab }) {
  const modalRef = useRef(null);
  const [localUser, setLocalUser] = useState(user);

  // Reset localUser when user changes (modal opened for new user)
  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  // Focus trap for accessibility
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    if (modalRef.current) {
      modalRef.current.focus();
    }
    return () => {
      if (previouslyFocused) previouslyFocused.focus();
    };
  }, []);

  // Close on backdrop click or Escape
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleTabChange = {
    details: useCallback(() => setActiveTab('details'), [setActiveTab]),
    activity: useCallback(() => setActiveTab('activity'), [setActiveTab]),
  };

  // Only call parent onSubmit with localUser
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(localUser);
  }, [onSubmit, localUser]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 "
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Edit user modal"
    >
      <div
        ref={modalRef}
        className="bg-background-light dark:bg-background-dark rounded-2xl shadow-2xl p-3 sm:p-6 w-full max-w-lg max-h-[92vh] overflow-y-auto focus:outline-none border border-gray-light focus:ring-2 focus:ring-accent transition-all duration-300 "
        tabIndex={-1}
        role="document"
        aria-label="User details and activity modal content"
      >
        <ModalHeader onClose={onClose} title="User Management" />
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} tabs={[
          { key: 'details', label: 'User Details' },
          { key: 'activity', label: 'Activity Logs' }
        ]} />
        <div className="mt-2">
          {activeTab === 'details' ? (
            <UserDetailsForm user={localUser} setUser={setLocalUser} onSubmit={handleSubmit} onClose={onClose} error={error} />
          ) : (
            <UserActivity userId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(EditUserModal);
