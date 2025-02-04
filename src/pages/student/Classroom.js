import React, { useState, useEffect } from 'react';

const Classroom = () => {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClassroomData();
  }, []);

  const fetchClassroomData = async () => {
    try {
      const batchResponse = await fetch('/api/student/batches');
      const teacherResponse = await fetch('/api/student/teachers');
      const materialResponse = await fetch('/api/student/materials');

      if (!batchResponse.ok || !teacherResponse.ok || !materialResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const batchData = await batchResponse.json();
      const teacherData = await teacherResponse.json();
      const materialData = await materialResponse.json();

      setBatches(batchData);
      setTeachers(teacherData);
      setMaterials(materialData);
    } catch (err) {
      setError('An error occurred while fetching data. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">Classroom</h1>
      {error && <p className="text-[#af0505] mb-4">{error}</p>}
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[#461fa3]">Enrolled Batches</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {batches.length > 0 ? (
            <ul>
              {batches.map(batch => (
                <li key={batch.id} className="mb-4">
                  <h3 className="text-xl font-bold text-[#200e4a]">{batch.name}</h3>
                  <p className="text-[#3b3a52]">{batch.schedule}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#3b3a52]">No batches enrolled.</p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[#461fa3]">Teachers</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {teachers.length > 0 ? (
            <ul>
              {teachers.map(teacher => (
                <li key={teacher.id} className="mb-4">
                  <h3 className="text-xl font-bold text-[#200e4a]">{teacher.name}</h3>
                  <p className="text-[#3b3a52]">{teacher.subject}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#3b3a52]">No teachers assigned.</p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[#461fa3]">Materials</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {materials.length > 0 ? (
            <ul>
              {materials.map(material => (
                <li key={material.id} className="mb-4">
                  <h3 className="text-xl font-bold text-[#200e4a]">{material.title}</h3>
                  <p className="text-[#3b3a52]">{material.description}</p>
                  <a href={material.link} className="text-[#7646eb] hover:text-[#461fa3]">Download</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#3b3a52]">No materials available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Classroom;