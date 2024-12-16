// components/StockForm.js
'use client';

import { useState, useEffect } from 'react';

export default function StockForm() {
  const [formData, setFormData] = useState({
    modelName: '',
    categoryId: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/category');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('Categories data is not an array:', data);
          setCategories([]);
        }
      } else {
        console.error('Failed to fetch categories');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

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
          categoryId: '',
          quantity: '',
          date: new Date().toISOString().split('T')[0]
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
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto p-4 border rounded shadow">
      {message && (
        <div className={`p-3 mb-4 rounded ${
          message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

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
          {Array.isArray(categories) && categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Entry Quantity:</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          min="1"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <button type="submit" className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
        Add Stock
      </button>
    </form>
  );
}
  