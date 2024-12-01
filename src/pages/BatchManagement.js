import React, { useState } from 'react';

const initialBatches = [
  { id: 1, name: 'Math 101', schedule: 'Mon, Wed, Fri - 10:00 AM to 11:00 AM', teacher: 'Mr. John Doe' },
  { id: 2, name: 'Science 101', schedule: 'Tue, Thu - 1:00 PM to 2:30 PM', teacher: 'Ms. Jane Smith' },
  // Add more batches as needed
];

/**
 * BatchManagement component handles the display and management of batches.
 */
const BatchManagement = () => {
  const [batches, setBatches] = useState(initialBatches);
  const [newBatch, setNewBatch] = useState({ name: '', schedule: '', teacher: '' });

  /**
   * Adds a new batch to the list.
   */
  const handleAddBatch = () => {
    if (newBatch.name && newBatch.schedule && newBatch.teacher) {
      setBatches([...batches, { ...newBatch, id: batches.length + 1 }]);
      setNewBatch({ name: '', schedule: '', teacher: '' });
    } else {
      alert('Please fill in all fields');
    }
  };

  /**
   * Deletes a batch from the list.
   * @param {number} id - Batch ID
   */
  const handleDeleteBatch = (id) => {
    setBatches(batches.filter(batch => batch.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 bg-gray-100">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Batch List</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Batch Name</th>
                  <th className="py-2 px-4 border-b">Schedule</th>
                  <th className="py-2 px-4 border-b">Assigned Teacher</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(batch => (
                  <tr key={batch.id}>
                    <td className="py-2 px-4 border-b">{batch.name}</td>
                    <td className="py-2 px-4 border-b">{batch.schedule}</td>
                    <td className="py-2 px-4 border-b">{batch.teacher}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => handleDeleteBatch(batch.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Add New Batch</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <form onSubmit={(e) => { e.preventDefault(); handleAddBatch(); }}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Batch Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Batch Name"
                  value={newBatch.name}
                  onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="schedule">
                  Schedule
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="schedule"
                  type="text"
                  placeholder="Schedule"
                  value={newBatch.schedule}
                  onChange={(e) => setNewBatch({ ...newBatch, schedule: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teacher">
                  Assigned Teacher
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="teacher"
                  type="text"
                  placeholder="Assigned Teacher"
                  value={newBatch.teacher}
                  onChange={(e) => setNewBatch({ ...newBatch, teacher: e.target.value })}
                />
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Add Batch
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BatchManagement;