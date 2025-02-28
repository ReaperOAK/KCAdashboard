import React from 'react';
import { useNavigate } from 'react-router-dom';

const BatchList = ({ batches, onManageStudents }) => {
    const navigate = useNavigate();

    const getBadgeColor = (status) => {
        switch(status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
                <div key={batch.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-[#461fa3]">
                                {batch.name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs ${getBadgeColor(batch.status)}`}>
                                {batch.status}
                            </span>
                        </div>
                        <p className="text-gray-600 mb-4">{batch.description}</p>
                        <div className="space-y-2 text-sm text-gray-500">
                            <p><span className="font-semibold">Level:</span> {batch.level}</p>
                            <p><span className="font-semibold">Schedule:</span> {batch.schedule}</p>
                            <p><span className="font-semibold">Students:</span> {batch.student_count}/{batch.max_students}</p>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                        <button 
                            onClick={() => navigate(`/teacher/batches/${batch.id}`)}
                            className="text-[#461fa3] hover:text-[#7646eb]"
                        >
                            View Details
                        </button>
                        <button 
                            onClick={() => onManageStudents(batch)}
                            className="text-[#461fa3] hover:text-[#7646eb]"
                        >
                            Manage Students
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BatchList;
