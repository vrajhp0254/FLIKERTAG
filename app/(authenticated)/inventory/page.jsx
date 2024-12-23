// app/inventory/page.js
'use client';

import { useState, useEffect } from 'react';
import StockCard from '../../components/StockCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Inventory() {
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    categoryId: '',
    search: ''
  });
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
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      categoryId: '',
      search: ''
    });
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesCategory = !filters.categoryId || 
      stock.categoryId && stock.categoryId.toString() === filters.categoryId;
    const matchesSearch = !filters.search || 
      stock.modelName.toLowerCase().includes(filters.search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const hasActiveFilters = filters.categoryId || filters.search;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-gray-500 mt-1">Manage and track your stock inventory</p>
        </div>
        <div className="hidden md:block">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {hasActiveFilters ? 'Filtered Items' : 'Total Items'}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredStocks.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Stock Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-4 max-w-[1600px] mx-auto">
        {filteredStocks.map(stock => (
          <StockCard
            key={stock._id}
            stock={stock}
            onUpdate={(stockId, newQuantity) => {
              setStocks(stocks.map(s => 
                s._id === stockId 
                  ? { ...s, availableQuantity: newQuantity }
                  : s
              ));
            }}
          />
        ))}
      </div>
    </div>
  );
}
  