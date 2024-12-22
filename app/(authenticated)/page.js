'use client';

import { useState } from 'react';
import CategoryForm from '../components/CategoryForm';
import MarketplaceForm from '../components/MarketplaceForm';
import StockForm from '../components/StockForm';

export default function InventorySetup() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Inventory Setup
          </h1>
          <p className="text-gray-500 mt-1">Configure categories, marketplaces, and manage stock</p>
        </div>
        
      </div>

      <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-4">
        <button
          onClick={() => setActiveSection('category')}
          className={`px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            activeSection === 'category' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Category</span>
        </button>
        <button
          onClick={() => setActiveSection('marketplace')}
          className={`px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            activeSection === 'marketplace' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Marketplace</span>
        </button>
        <button
          onClick={() => setActiveSection('stock')}
          className={`px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            activeSection === 'stock' 
              ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>Stock</span>
        </button>
      </div>

      <div className="mt-6">
        {activeSection === 'category' && <CategoryForm />}
        {activeSection === 'marketplace' && <MarketplaceForm />}
        {activeSection === 'stock' && <StockForm />}
        {!activeSection && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="mt-4 text-gray-600">Select a section above to get started with your inventory setup.</p>
          </div>
        )}
      </div>
    </div>
  );
}
