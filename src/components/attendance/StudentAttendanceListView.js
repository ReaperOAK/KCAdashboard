import React from 'react';
import StudentAttendanceSkeleton from './StudentAttendanceSkeleton';
import SearchAndBatchFilter from './SearchAndBatchFilter';
import StudentAttendanceTable from './StudentAttendanceTable';

// Presentational component: UI only, no business logic
const StudentAttendanceListView = React.memo(function StudentAttendanceListView({
  students,
  loading,
  error,
  searchTerm,
  onSearch,
  selectedBatch,
  onBatchChange,
  batches,
}) {
  return (
    <section className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-8 bg-background-light dark:bg-background-dark rounded-2xl shadow-xl transition-all duration-300 border border-gray-light">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3 sm:gap-6">
        <h2 className="text-3xl font-semibold text-text-dark dark:text-text-light tracking-tight drop-shadow-sm mb-2 md:mb-0">
          Student Attendance Records
        </h2>
        <SearchAndBatchFilter
          searchTerm={searchTerm}
          onSearch={onSearch}
          selectedBatch={selectedBatch}
          onBatchChange={onBatchChange}
          batches={batches}
        />
      </header>
      {loading ? (
        <StudentAttendanceSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12">
          <span className="bg-error text-white px-4 py-2 rounded font-semibold mb-2 border border-error/80 shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            {error}
          </span>
          <button
            className="mt-2 px-4 py-2 bg-accent text-white rounded hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all font-medium"
            onClick={() => window.location.reload()}
            aria-label="Retry fetch"
          >
            Retry
          </button>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <span className="bg-gray-light text-primary px-4 py-2 rounded font-medium border border-gray-dark/30 shadow-sm">
            No students found for the selected batch or search.
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-light shadow-md bg-white dark:bg-background-dark">
          <StudentAttendanceTable students={students} />
        </div>
      )}
    </section>
  );
});

export default StudentAttendanceListView;
