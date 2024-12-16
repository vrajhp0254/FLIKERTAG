// app/reports/page.js
'use client';

import { useState, useEffect } from 'react';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marketplaces, setMarketplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    categoryId: '',
    marketplaceId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/category').then(res => res.json()),
      fetch('/api/marketplace').then(res => res.json())
    ])
      .then(([categoriesData, marketplacesData]) => {
        setCategories(categoriesData);
        setMarketplaces(marketplacesData);
        fetchReports();
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Error loading filters');
      });
  }, []);

  const fetchReports = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
      if (filters.marketplaceId) queryParams.append('marketplaceId', filters.marketplaceId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await fetch(`/api/stock/transaction?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      setReports(data);
    } catch (error) {
      setError('Error fetching reports');
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      categoryId: '',
      marketplaceId: '',
      startDate: '',
      endDate: ''
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transaction Reports</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Marketplace</label>
            <select
              name="marketplaceId"
              value={filters.marketplaceId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Marketplaces</option>
              {marketplaces.map(marketplace => (
                <option key={marketplace._id} value={marketplace._id}>
                  {marketplace.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {Object.values(filters).some(Boolean) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="min-w-[800px] md:w-full">
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Model Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Marketplace</th>
                <th className="px-4 py-3 text-right">Entry Stock</th>
                <th className="px-4 py-3 text-right">Available Stock</th>
                <th className="px-4 py-3 text-center">Transaction Type</th>
                <th className="px-4 py-3 text-center">Return Type</th>
                <th className="px-4 py-3 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {new Date(report.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{report.modelName}</td>
                  <td className="px-4 py-3">{report.categoryName}</td>
                  <td className="px-4 py-3">{report.marketplaceName}</td>
                  <td className="px-4 py-3 text-right">{report.initialQuantity}</td>
                  <td className="px-4 py-3 text-right">{report.availableQuantity}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.transactionType === 'sell' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {report.transactionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {report.returnType ? (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.returnType === 'customer' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {report.returnType}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">{report.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
  