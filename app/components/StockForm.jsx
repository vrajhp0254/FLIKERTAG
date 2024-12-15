// components/StockForm.js
'use client';

import { useState, useEffect } from 'react';

export default function StockForm() {
  const [formData, setFormData] = useState({
    modelName: '',
    quantity: '',
    categoryId: '',
    marketplaceId: ''
  });
  const [categories, setCategories] = useState([]);
  const [marketplaces, setMarketplaces] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/category').then(res => res.json()),
      fetch('/api/marketplace').then(res => res.json())
    ])
      .then(([categoriesData, marketplacesData]) => {
        setCategories(categoriesData);
        setMarketplaces(marketplacesData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setMessage('Error loading form data');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Stock added successfully!');
        setFormData({
          modelName: '',
          quantity: '',
          categoryId: '',
          marketplaceId: ''
        });
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Error adding stock.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
      <h2 className="mb-4 text-lg font-bold">Stock Form</h2>
      
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Model Name:</label>
        <input
          type="text"
          name="modelName"
          value={formData.modelName}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter model name"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Category:</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Marketplace:</label>
        <select
          name="marketplaceId"
          value={formData.marketplaceId}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        >
          <option value="">Select a marketplace</option>
          {marketplaces.map(marketplace => (
            <option key={marketplace._id} value={marketplace._id}>
              {marketplace.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Quantity:</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter quantity"
          min="0"
          required
        />
      </div>

      <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">
        Submit
      </button>
      {message && <p className="mt-4">{message}</p>}
    </form>
  );
}
  