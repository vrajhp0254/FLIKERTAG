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
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '', type: '' });
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
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative w-80">
      {/* Notification with close button */}
      {notification.show && (
        <div className={`
          fixed inset-x-0 top-0 z-50 p-4 
          ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
          text-white shadow-lg
        `}>
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <svg className="w-6 h-6 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button
              onClick={hideNotification}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header Section - Updated styling */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-center">
        <h3 className="text-xl font-bold text-white mb-2 truncate">{stock.modelName}</h3>
        <span className="inline-block bg-blue-400 text-white text-sm px-3 py-1 rounded-full">
          {stock.category}
        </span>
      </div>

      {/* Stock Information - Updated layout */}
      <div className="p-4 bg-gray-50">
        <div className="flex justify-between gap-2">
          <div className="flex-1 text-center p-3 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-xs">Initial</p>
            <p className="text-xl font-bold text-gray-700">{stock.initialQuantity}</p>
          </div>
          <div className="flex-1 text-center p-3 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-xs">Available</p>
            <p className="text-xl font-bold text-gray-700">{stock.availableQuantity}</p>
          </div>
        </div>
      </div>

      {/* Transaction Form - Condensed layout */}
      <div className="p-4">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Quantity Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max={stock.availableQuantity}
                value={transactionData.quantity}
                onChange={(e) => setTransactionData(prev => ({
                  ...prev,
                  quantity: e.target.value
                }))}
                className="w-full p-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={transactionData.date}
                onChange={(e) => setTransactionData(prev => ({
                  ...prev,
                  date: e.target.value
                }))}
                className="w-full p-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Marketplace Select */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Marketplace</label>
            <select
              value={transactionData.marketplaceId}
              onChange={(e) => setTransactionData(prev => ({
                ...prev,
                marketplaceId: e.target.value
              }))}
              className="w-full p-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Marketplace</option>
              {marketplaces.map(marketplace => (
                <option key={marketplace._id} value={marketplace._id}>
                  {marketplace.name}
                </option>
              ))}
            </select>
          </div>

          {/* Return Type Select */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Return Type</label>
            <select
              value={transactionData.transactionType}
              onChange={(e) => setTransactionData(prev => ({
                ...prev,
                transactionType: e.target.value
              }))}
              className="w-full p-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="customer">Customer</option>
              <option value="courier">Courier</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => handleTransaction('sell')}
              disabled={loading || !transactionData.marketplaceId || stock.availableQuantity === 0}
              className="flex-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {loading ? 'Processing...' : 'Sell'}
            </button>
            <button
              onClick={() => handleTransaction('return')}
              disabled={loading || !transactionData.marketplaceId}
              className="flex-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {loading ? 'Processing...' : 'Return'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 