// components/MarketplaceForm.js
'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function MarketplaceForm({ onMarketplaceAdded }) {
  const [marketplaces, setMarketplaces] = useState([]);
  const [formData, setFormData] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketplaces();
  }, []);

  const fetchMarketplaces = async () => {
    try {
      const response = await fetch('/api/marketplace');
      if (response.ok) {
        const data = await response.json();
        setMarketplaces(data);
      }
    } catch (error) {
      console.error('Error fetching marketplaces:', error);
      showMessage('Error fetching marketplaces', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showMessage('Marketplace name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const url = editingId 
        ? `/api/marketplace/${editingId}` 
        : '/api/marketplace';
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showMessage(
          `Marketplace ${editingId ? 'updated' : 'added'} successfully`, 
          'success'
        );
        setFormData({ name: '' });
        setEditingId(null);
        await fetchMarketplaces();
        if (onMarketplaceAdded) onMarketplaceAdded();
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

  const handleEdit = (marketplace) => {
    setFormData({ name: marketplace.name });
    setEditingId(marketplace._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this marketplace?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/marketplace/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('Marketplace deleted successfully', 'success');
        await fetchMarketplaces();
        if (onMarketplaceAdded) onMarketplaceAdded();
      } else {
        const error = await response.json();
        showMessage(error.message || 'Error deleting marketplace', 'error');
      }
    } catch (error) {
      showMessage('Error deleting marketplace', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '' });
    setEditingId(null);
  };

  if (loading && marketplaces.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marketplace Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="Enter marketplace name"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white rounded-lg ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              {loading ? 'Processing...' : editingId ? 'Update Marketplace' : 'Add Marketplace'}
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
        </div>
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marketplace Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {marketplaces.map((marketplace) => (
              <tr key={marketplace._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {marketplace.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(marketplace)}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(marketplace._id)}
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
  