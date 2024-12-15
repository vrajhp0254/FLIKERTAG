// app/inventory/page.js
'use client';

import { useState, useEffect } from 'react';
import StockCard from '../components/StockCard';

export default function Inventory() {
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marketplaces, setMarketplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoryId: '',
    marketplaceId: '',
    search: ''
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/category').then(res => res.json()),
      fetch('/api/marketplace').then(res => res.json())
    ])
      .then(([categoriesData, marketplacesData]) => {
        setCategories(categoriesData);
        setMarketplaces(marketplacesData);
        fetchStocks();
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const fetchStocks = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
      if (filters.marketplaceId) queryParams.append('marketplaceId', filters.marketplaceId);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/stock?${queryParams}`);
      const data = await response.json();
      setStocks(data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
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
      search: ''
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  const hasActiveFilters = filters.categoryId || filters.marketplaceId || filters.search;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by model name..."
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.length > 0 ? (
          stocks.map(stock => (
            <StockCard 
              key={stock._id} 
              stock={stock} 
              onUpdate={fetchStocks}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No stocks found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
  