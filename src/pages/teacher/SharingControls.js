
import React from 'react';
import Select from 'react-select';

const SharingControls = React.memo(function SharingControls({
  quiz,
  setQuiz,
  batches,
  classrooms,
  students,
  studentSearch,
  setStudentSearch,
  studentLoading
}) {
  const handlePublicToggle = (e) => {
    setQuiz(prev => ({ ...prev, is_public: e.target.checked }));
  };
  const handleBatchSelect = (selected) => {
    setQuiz(prev => ({ ...prev, batch_ids: selected ? selected.map(opt => opt.value) : [] }));
  };
  const handleClassroomSelect = (selected) => {
    setQuiz(prev => ({ ...prev, classroom_ids: selected ? selected.map(opt => opt.value) : [] }));
  };
  const handleStudentSelect = (selected) => {
    setQuiz(prev => ({ ...prev, student_ids: selected ? selected.map(opt => opt.value) : [] }));
  };
  // Defensive: ensure arrays for sharing fields
  const batch_ids = Array.isArray(quiz.batch_ids) ? quiz.batch_ids : [];
  const classroom_ids = Array.isArray(quiz.classroom_ids) ? quiz.classroom_ids : [];
  const student_ids = Array.isArray(quiz.student_ids) ? quiz.student_ids : [];

  return (
    <div className="bg-background-light border border-gray-light rounded-xl shadow-md mb-6 sm:mb-8 transition-all duration-200">
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-primary">Quiz Sharing & Access</h2>
        <div className="mb-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="is_public"
            checked={quiz.is_public}
            onChange={handlePublicToggle}
            className="w-5 h-5 accent-secondary focus:ring-2 focus:ring-accent transition-all duration-200"
            aria-checked={quiz.is_public}
            aria-label="Make this quiz public"
          />
          <label htmlFor="is_public" className="text-sm font-medium text-text-dark select-none cursor-pointer">
            Make this quiz public (accessible to all students)
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-text-dark">Share with Batches</label>
          <Select
            isMulti
            options={batches.map(b => ({ value: b.id, label: b.name }))}
            value={batches.filter(b => batch_ids.includes(b.id)).map(b => ({ value: b.id, label: b.name }))}
            onChange={handleBatchSelect}
            placeholder="Select batches..."
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({ ...base, borderColor: '#c2c1d3', minHeight: 40 }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? '#461fa3' : state.isFocused ? '#7646eb' : '#fff',
                color: state.isSelected || state.isFocused ? '#fff' : '#200e4a',
                transition: 'all 0.2s',
              }),
            }}
            aria-label="Share with Batches"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-text-dark">Share with Classrooms</label>
          <Select
            isMulti
            options={classrooms.map(c => ({ value: c.id, label: c.name }))}
            value={classrooms.filter(c => classroom_ids.includes(c.id)).map(c => ({ value: c.id, label: c.name }))}
            onChange={handleClassroomSelect}
            placeholder="Select classrooms..."
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({ ...base, borderColor: '#c2c1d3', minHeight: 40 }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? '#461fa3' : state.isFocused ? '#7646eb' : '#fff',
                color: state.isSelected || state.isFocused ? '#fff' : '#200e4a',
                transition: 'all 0.2s',
              }),
            }}
            aria-label="Share with Classrooms"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-text-dark">Share with Students</label>
          <Select
            isMulti
            isLoading={studentLoading}
            options={students.map(s => ({ value: s.id, label: `${s.full_name} (${s.email})` }))}
            value={students.filter(s => student_ids.includes(s.id)).map(s => ({ value: s.id, label: `${s.full_name} (${s.email})` }))}
            onChange={handleStudentSelect}
            onInputChange={setStudentSearch}
            placeholder="Search and select students..."
            noOptionsMessage={() => studentSearch.length < 2 ? 'Type to search...' : 'No students found'}
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({ ...base, borderColor: '#c2c1d3', minHeight: 40 }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? '#461fa3' : state.isFocused ? '#7646eb' : '#fff',
                color: state.isSelected || state.isFocused ? '#fff' : '#200e4a',
                transition: 'all 0.2s',
              }),
            }}
            aria-label="Share with Students"
          />
        </div>
      </div>
    </div>
  );
});

export default SharingControls;
