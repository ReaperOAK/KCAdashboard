import React, { useState, useEffect } from 'react';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/php/get-resources.php');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch resources');
        }
        setResources(data.resources);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

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
            {filteredResources.length === 0 ? (
              <p className="text-gray-500">No resources found</p>
            ) : (
              filteredResources.map(resource => (
                <div key={resource.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg">
                  <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                  <p className="mb-2">Category: {resource.category}</p>
                  <p className="mb-2">Type: {resource.type}</p>
                  <p className="text-sm text-gray-500">{resource.description}</p>
                  <a href={resource.link} className="text-blue-500 hover:underline">Download</a>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Resources;