// components/StockForm.js
'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Helper functions moved outside component
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

const parseDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day).toISOString();
};

export default function StockForm() {
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    modelName: '',
    categoryId: '',
    quantity: '',
    date: formatDate(new Date())
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchStocks();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/category');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showMessage('Error fetching categories', 'error');
    }
  };

  const fetchStocks = async () => {
    try {
      const response = await fetch('/api/stock');
      if (response.ok) {
        const data = await response.json();
        setStocks(data);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      showMessage('Error fetching stocks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
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
    if (!formData.modelName || !formData.categoryId || !formData.quantity) {
      showMessage('All fields are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const url = editingId 
        ? `/api/stock/${editingId}` 
        : '/api/stock';
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: parseDate(formData.date)
        }),
      });

      if (response.ok) {
        showMessage(
          `Stock ${editingId ? 'updated' : 'added'} successfully`, 
          'success'
        );
        setFormData({
          modelName: '',
          categoryId: '',
          quantity: '',
          date: formatDate(new Date())
        });
        setEditingId(null);
        await fetchStocks();
      } else {
        const error = await response.json();
        showMessage(error.message || 'Error processing request', 'error');
      }
    } catch (error) {
      showMessage('Error processing request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stock) => {
    setFormData({
      modelName: stock.modelName,
      categoryId: stock.categoryId,
      quantity: stock.initialQuantity.toString(),
      date: formatDate(new Date(stock.date))
    });
    setEditingId(stock._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stock/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('Stock deleted successfully', 'success');
        await fetchStocks();
      } else {
        const error = await response.json();
        showMessage(error.message || 'Error deleting stock', 'error');
      }
    } catch (error) {
      showMessage('Error deleting stock', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      modelName: '',
      categoryId: '',
      quantity: '',
      date: formatDate(new Date())
    });
    setEditingId(null);
  };

  if (loading && stocks.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Name
            </label>
            <input
              type="text"
              name="modelName"
              value={formData.modelName}
              onChange={handleChange}
              placeholder="Enter model name"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              min="1"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-lg ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {loading ? 'Processing...' : editingId ? 'Update Stock' : 'Add Stock'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Initial Qty
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available Qty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.map((stock) => (
              <tr key={stock._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stock.modelName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stock.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {stock.initialQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {stock.availableQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(stock.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(stock)}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(stock._id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
  