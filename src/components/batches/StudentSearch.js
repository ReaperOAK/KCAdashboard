
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UsersApi } from '../../api/users';

// Loading spinner (accessible, theme color)
const Spinner = React.memo(function Spinner() {
  return (
    <span className="inline-block animate-spin h-4 w-4 border-2 border-secondary rounded-full border-t-transparent align-middle" aria-label="Loading" />
  );
});

// Student list item (memoized, accessible)
const StudentListItem = React.memo(function StudentListItem({ student, isSelected, onSelect }) {
  const handleClick = useCallback(() => onSelect(student), [onSelect, student]);
  return (
    <li
      className={
        `p-3 flex justify-between items-center cursor-pointer transition-colors ` +
        (isSelected ? 'bg-accent/10' : 'hover:bg-gray-light')
      }
      tabIndex={0}
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div>
        <p className="font-medium text-primary">{student.full_name}</p>
        <p className="text-sm text-gray-dark">{student.email}</p>
      </div>
      {isSelected && <span className="text-accent font-semibold ml-2">Selected</span>}
    </li>
  );
});

// Main search component
export const StudentSearch = React.memo(function StudentSearch({ onSelectStudent, maxStudents, currentCount }) {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const isBatchFull = useMemo(() => currentCount >= maxStudents, [currentCount, maxStudents]);

  // Debounced search
  const searchStudents = useCallback(async (query) => {
    if (query.length < 2) return;
    setLoading(true);
    setError('');
    try {
      // Use UsersApi modular method for student search
      const response = await UsersApi.searchStudents(query);
      if (response.success) {
        setStudents(response.students || []);
      } else {
        setError(response.message || 'Failed to search students');
      }
    } catch (err) {
      setError('Error searching students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (search.length >= 2) {
      const timer = setTimeout(() => searchStudents(search), 300);
      return () => clearTimeout(timer);
    } else {
      setStudents([]);
    }
  }, [search, searchStudents]);

  const handleInputChange = useCallback(e => {
    setSearch(e.target.value);
    if (e.target.value.length < 2) {
      setSelectedStudent(null);
      onSelectStudent(null);
    }
  }, [onSelectStudent]);

  const handleSelect = useCallback(student => {
    setSelectedStudent(student);
    onSelectStudent(student);
  }, [onSelectStudent]);

  // Render

  // Always call hooks at the top level
  useEffect(() => {
    if (isBatchFull) {
      setSelectedStudent(null);
      onSelectStudent(null);
    }
  }, [isBatchFull, onSelectStudent]);

  if (isBatchFull) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md" role="alert">
        This batch is full ({currentCount}/{maxStudents} students).
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for students by name or email"
          value={search}
          onChange={handleInputChange}
          className="w-full px-3 sm:px-4 py-2 border border-gray-light rounded-md focus:border-secondary focus:ring-secondary text-xs sm:text-sm"
          aria-label="Search for students by name or email"
        />
        {loading && (
          <div className="absolute right-2 sm:right-3 top-2 sm:top-3"><Spinner /></div>
        )}
      </div>
      {error && <div className="text-red-600 text-xs sm:text-sm" role="alert">{error}</div>}
      {search.length < 2 && (
        <div className="text-gray-dark text-xs sm:text-sm">Type at least 2 characters to search</div>
      )}
      <div className="max-h-60 overflow-y-auto border border-gray-light rounded-md mt-1" role="listbox" aria-label="Student search results">
        {students.length === 0 && search.length >= 2 && !loading ? (
          <div className="p-2 sm:p-3 text-gray-dark text-center text-xs sm:text-sm">No students found</div>
        ) : (
          <ul className="divide-y divide-gray-light">
            {students.map(student => (
              <StudentListItem
                key={student.id}
                student={student}
                isSelected={selectedStudent?.id === student.id}
                onSelect={handleSelect}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

export default StudentSearch;
