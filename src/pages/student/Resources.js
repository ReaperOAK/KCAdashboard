import React, { useState, useEffect } from 'react';
import { FaDownload, FaSearch } from 'react-icons/fa';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const categories = ['All', 'Openings', 'Middlegame', 'Endgame', 'Tactics', 'Strategy'];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('/php/get-resources.php');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch resources');
      setResources(data.resources);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource =>
    (selectedCategory === 'all' || resource.category.toLowerCase() === selectedCategory.toLowerCase()) &&
    (resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     resource.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">Resource Center</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow relative">
            <FaSearch className="absolute left-3 top-3 text-[#3b3a52]" />
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.toLowerCase()} value={category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#461fa3] mx-auto"></div>
            <p className="mt-4 text-[#3b3a52]">Loading resources...</p>
          </div>
        ) : error ? (
          <div className="text-[#af0505] text-center py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <div key={resource.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <h3 className="text-xl font-semibold mb-2 text-[#200e4a]">{resource.title}</h3>
                <div className="mb-4">
                  <span className="inline-block bg-[#f3f1f9] text-[#461fa3] px-2 py-1 rounded text-sm mr-2">
                    {resource.category}
                  </span>
                  <span className="inline-block bg-[#f3f1f9] text-[#461fa3] px-2 py-1 rounded text-sm">
                    {resource.type}
                  </span>
                </div>
                <p className="text-[#3b3a52] mb-4">{resource.description}</p>
                <a
                  href={resource.link}
                  className="inline-flex items-center text-[#461fa3] hover:text-[#7646eb]"
                >
                  <FaDownload className="mr-2" />
                  Download Resource
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;