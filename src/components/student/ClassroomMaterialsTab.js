
import React from 'react';

// MaterialCard: Pure, focused, beautiful, responsive
const MaterialCard = React.memo(function MaterialCard({ material, handleOpenMaterial }) {
  return (
    <div className="p-4 border border-gray-light rounded-xl shadow-md bg-background-light dark:bg-background-dark hover:shadow-lg transition-all duration-200 ">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-secondary text-lg truncate" title={material.title}>{material.title}</h3>
          <p className="text-sm text-gray-dark mt-1 line-clamp-3">{material.description}</p>
          <p className="text-xs text-gray-dark mt-2">
            <span className="font-medium text-accent">{material.category}</span> • Uploaded by <span className="font-medium text-primary">{material.uploaded_by}</span>
          </p>
        </div>
        <button
          onClick={() => handleOpenMaterial(material)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent font-semibold transition-all duration-200 min-w-[90px]"
          aria-label={`Open material: ${material.title}`}
        >
          Open
        </button>
      </div>
    </div>
  );
});

MaterialCard.displayName = 'MaterialCard';

const ClassroomMaterialsTab = React.memo(function ClassroomMaterialsTab({ materials, handleOpenMaterial }) {
  return (
    <section className="w-full max-w-3xl mx-auto px-2 sm:px-4 md:px-6 lg:px-0 ">
      <h2 className="text-2xl text-text-dark font-semibold mb-6">Study Materials</h2>
      {materials.length > 0 ? (
        <div className="flex flex-col gap-6">
          {materials.map(material => (
            <MaterialCard key={material.id} material={material} handleOpenMaterial={handleOpenMaterial} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[180px] bg-background-light rounded-xl shadow-inner border border-gray-light ">
          <svg className="h-12 w-12 text-gray-light mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 013 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>
          <p className="text-gray-dark text-lg">No materials have been shared for this class yet.</p>
        </div>
      )}
    </section>
  );
});

ClassroomMaterialsTab.displayName = 'ClassroomMaterialsTab';

export default ClassroomMaterialsTab;
