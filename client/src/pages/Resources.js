import React, { useState } from 'react';

const resources = [
  { id: 1, category: 'Math', title: 'Algebra Notes', type: 'PDF', link: '#' },
  { id: 2, category: 'Science', title: 'Physics Lecture', type: 'Video', link: '#' },
  { id: 3, category: 'History', title: 'World War II', type: 'PowerPoint', link: '#' },
  // Add more resources as needed
];

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 bg-gray-100">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Resource Center</h2>
          <input
            type="text"
            placeholder="Search for resources..."
            className="w-full p-2 mb-4 border rounded"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map(resource => (
              <div key={resource.id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                <p className="mb-2">Category: {resource.category}</p>
                <p className="mb-2">Type: {resource.type}</p>
                <a href={resource.link} className="text-blue-500 hover:underline">Download</a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Resources;