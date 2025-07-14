
import React from 'react';

// OverviewCard: Pure, focused, beautiful, responsive
const OverviewCard = React.memo(function OverviewCard({ title, children, icon }) {
  return (
    <div className="bg-background-light dark:bg-background-dark p-5 rounded-xl shadow-md border border-gray-light flex flex-col gap-2 animate-fade-in min-h-[120px]">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-accent text-xl">{icon}</span>}
        <h3 className="font-medium text-primary text-lg">{title}</h3>
      </div>
      <div className="text-gray-dark text-base">{children}</div>
    </div>
  );
});

OverviewCard.displayName = 'OverviewCard';

const ClassroomOverviewTab = React.memo(function ClassroomOverviewTab({ classroom }) {
  return (
    <section className="w-full max-w-3xl mx-auto px-2 sm:px-4 md:px-6 lg:px-0 animate-fade-in">
      <h2 className="text-2xl text-text-dark font-semibold mb-6">Class Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OverviewCard title="Schedule" icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>}>
          {classroom.schedule}
        </OverviewCard>
        <OverviewCard title="About This Class" icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>}>
          <span className="text-gray-dark">{classroom.description}</span>
        </OverviewCard>
        <OverviewCard title="Instructor" icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0113 0" /></svg>}>
          <div className="flex items-center gap-3 mt-1">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg">
              {classroom.teacher_name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-text-dark">{classroom.teacher_name}</p>
              <p className="text-sm text-gray-dark">Chess Instructor</p>
            </div>
          </div>
        </OverviewCard>
        <OverviewCard title="Next Session" icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}>
          {classroom.next_session || <span className="text-gray-light">No upcoming sessions scheduled</span>}
        </OverviewCard>
      </div>
    </section>
  );
});

ClassroomOverviewTab.displayName = 'ClassroomOverviewTab';

export default ClassroomOverviewTab;
