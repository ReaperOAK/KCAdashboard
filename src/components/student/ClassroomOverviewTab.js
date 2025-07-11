import React from 'react';

const ClassroomOverviewTab = React.memo(({ classroom }) => (
  <section>
    <h2 className="text-xl font-semibold text-primary mb-4">Class Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-background-light p-4 rounded-lg">
        <h3 className="font-medium text-secondary mb-2">Schedule</h3>
        <p>{classroom.schedule}</p>
      </div>
      <div className="bg-background-light p-4 rounded-lg">
        <h3 className="font-medium text-secondary mb-2">About This Class</h3>
        <p className="text-gray-dark">{classroom.description}</p>
      </div>
      <div className="bg-background-light p-4 rounded-lg">
        <h3 className="font-medium text-secondary mb-2">Instructor</h3>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold mr-3">
            {classroom.teacher_name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{classroom.teacher_name}</p>
            <p className="text-sm text-gray-dark">Chess Instructor</p>
          </div>
        </div>
      </div>
      <div className="bg-background-light p-4 rounded-lg">
        <h3 className="font-medium text-secondary mb-2">Next Session</h3>
        <p>{classroom.next_session || 'No upcoming sessions scheduled'}</p>
      </div>
    </div>
  </section>
));

export default ClassroomOverviewTab;
