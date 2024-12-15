'use client';

import { useState } from 'react';

export default function StockCard({ stock, onUpdate }) {
  const [transactionData, setTransactionData] = useState({
    quantity: 1,
    transactionType: 'customer' // or 'courier'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTransaction = async (type) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/stock/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockId: stock._id,
          type,
          quantity: parseInt(transactionData.quantity),
          transactionType: transactionData.transactionType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      onUpdate();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">{stock.modelName}</h3>
      <div className="space-y-2">
        <p className="text-sm">
          <span className="font-medium">Category:</span> {stock.category}
        </p>
        <p className="text-sm">
          <span className="font-medium">Marketplace:</span> {stock.marketplace}
        </p>
        <p className="text-sm">
          <span className="font-medium">Initial Stock:</span> {stock.initialQuantity}
        </p>
        <p className="text-sm">
          <span className="font-medium">Available Stock:</span> {stock.availableQuantity}
        </p>
        
        <div className="border-t pt-4 mt-4">
          <div className="flex space-x-2 mb-2">
            <input
              type="number"
              min="1"
              max={stock.availableQuantity}
              value={transactionData.quantity}
              onChange={(e) => setTransactionData(prev => ({
                ...prev,
                quantity: e.target.value
              }))}
              className="w-20 p-1 border rounded"
            />
            <select
              value={transactionData.transactionType}
              onChange={(e) => setTransactionData(prev => ({
                ...prev,
                transactionType: e.target.value
              }))}
              className="p-1 border rounded"
            >
              <option value="customer">Customer</option>
              <option value="courier">Courier</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleTransaction('sell')}
              disabled={loading || stock.availableQuantity === 0}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Sell
            </button>
            <button
              onClick={() => handleTransaction('return')}
              disabled={loading}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Return
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  );
} 