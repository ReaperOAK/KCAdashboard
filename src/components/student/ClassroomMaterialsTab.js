import React from 'react';

const ClassroomMaterialsTab = React.memo(({ materials, handleOpenMaterial }) => (
  <section>
    <h2 className="text-xl font-semibold text-primary mb-4">Study Materials</h2>
    {materials.length > 0 ? (
      <div className="space-y-4">
        {materials.map(material => (
          <div
            key={material.id}
            className="p-4 border border-gray-light rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium text-secondary">{material.title}</h3>
                <p className="text-sm text-gray-dark">{material.description}</p>
                <p className="text-xs text-gray-dark mt-2">
                  {material.category} • Uploaded by {material.uploaded_by}
                </p>
              </div>
              <button
                onClick={() => handleOpenMaterial(material)}
                className="px-3 py-1 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={`Open material: ${material.title}`}
              >
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p>No materials have been shared for this class yet.</p>
    )}
  </section>
));

export default ClassroomMaterialsTab;
