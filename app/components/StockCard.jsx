'use client';

import { useState, useEffect } from 'react';

export default function StockCard({ stock, onUpdate }) {
  const [marketplaces, setMarketplaces] = useState([]);
  const [transactionData, setTransactionData] = useState({
    quantity: 1,
    transactionType: 'customer',
    marketplaceId: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

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
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleTransaction = async (type) => {
    if (!transactionData.marketplaceId) {
      showNotification('Please select a marketplace', 'error');
      return;
    }

    if (!transactionData.date) {
      showNotification('Please select a date', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stock/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockId: stock._id,
          quantity: parseInt(transactionData.quantity),
          transactionType: type,
          returnType: type === 'return' ? transactionData.transactionType : null,
          marketplaceId: transactionData.marketplaceId,
          date: transactionData.date
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate(stock._id, data.newQuantity);
        setTransactionData({
          quantity: 1,
          transactionType: 'customer',
          marketplaceId: '',
          date: new Date().toISOString().split('T')[0]
        });
        showNotification(
          `Successfully ${type === 'sell' ? 'sold' : 'returned'} ${transactionData.quantity} items`,
          'success'
        );
      } else {
        const error = await response.json();
        showNotification(error.message || 'Error processing transaction', 'error');
      }
    } catch (error) {
      showNotification('Error processing transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 md:p-4 rounded-lg shadow relative">
      {notification.show && (
        <div className={`absolute top-2 right-2 left-2 p-2 rounded text-white text-sm ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      <h3 className="text-base md:text-lg font-semibold mb-2">{stock.modelName}</h3>
      <div className="space-y-1 md:space-y-2 text-sm md:text-base">
        <p className="text-sm">
          <span className="font-medium">Category:</span> {stock.category}
        </p>
        <p className="text-sm">
          <span className="font-medium">Entry Stock:</span> {stock.initialQuantity}
        </p>
        <p className="text-sm">
          <span className="font-medium">Available Stock:</span> {stock.availableQuantity}
        </p>
        
        <div className="border-t pt-4 mt-4">
          <div className="flex flex-col space-y-2">
            <input
              type="number"
              min="1"
              max={stock.availableQuantity}
              value={transactionData.quantity}
              onChange={(e) => setTransactionData(prev => ({
                ...prev,
                quantity: e.target.value
              }))}
              className="w-full p-1 border rounded"
              placeholder="Quantity"
            />
            
            <select
              value={transactionData.marketplaceId}
              onChange={(e) => setTransactionData(prev => ({
                ...prev,
                marketplaceId: e.target.value
              }))}
              className="w-full p-1 border rounded"
              required
            >
              <option value="">Select Marketplace</option>
              {marketplaces.map(marketplace => (
                <option key={marketplace._id} value={marketplace._id}>
                  {marketplace.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={transactionData.date}
              onChange={(e) => setTransactionData(prev => ({
                ...prev,
                date: e.target.value
              }))}
              className="w-full p-1 border rounded"
              required
            />

            <select
              value={transactionData.transactionType}
              onChange={(e) => setTransactionData(prev => ({
                ...prev,
                transactionType: e.target.value
              }))}
              className="w-full p-1 border rounded"
            >
              <option value="customer">Customer</option>
              <option value="courier">Courier</option>
            </select>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleTransaction('sell')}
                disabled={loading || !transactionData.marketplaceId || stock.availableQuantity === 0}
                className="flex-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Sell
              </button>
              <button
                onClick={() => handleTransaction('return')}
                disabled={loading || !transactionData.marketplaceId}
                className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Return
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 