
'use client';

import { useState } from 'react';
import CategoryForm from './components/CategoryForm';
import MarketplaceForm from './components/MarketplaceForm';
import StockForm from './components/StockForm';

export default function InventorySetup() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div>
      <h1 className="text-2xl font-bold">Inventory Setup Page</h1>
      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => setActiveSection('category')}
          className={`px-4 py-2 rounded ${
            activeSection === 'category' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Category
        </button>
        <button
          onClick={() => setActiveSection('marketplace')}
          className={`px-4 py-2 rounded ${
            activeSection === 'marketplace' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Marketplace
        </button>
        <button
          onClick={() => setActiveSection('stock')}
          className={`px-4 py-2 rounded ${
            activeSection === 'stock' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Stock
        </button>
      </div>

      <div className="mt-6">
        {activeSection === 'category' && <CategoryForm />}
        {activeSection === 'marketplace' && <MarketplaceForm />}
        {activeSection === 'stock' && <StockForm />}
        {!activeSection && <p className="mt-4">Select a section to view the form.</p>}
      </div>
    </div>
  );
}
