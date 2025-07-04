import React, { useEffect, useState } from 'react';
import ApiService from '../../utils/api';

const FaqList = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const response = await ApiService.get('/support/faqs/get-all.php');
        setFaqs(response.faqs || []);
      } catch (err) {
        setError('Failed to load FAQs');
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  if (loading) return <div>Loading FAQs...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!faqs.length) return <div>No FAQs available.</div>;

  return (
    <div className="space-y-6">
      {faqs.map(faq => (
        <div key={faq.id} className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-primary mb-2">{faq.question}</h3>
          <p className="text-gray-700">{faq.answer}</p>
          {faq.category && <span className="text-xs text-gray-500">Category: {faq.category}</span>}
        </div>
      ))}
    </div>
  );
};

export default FaqList;
