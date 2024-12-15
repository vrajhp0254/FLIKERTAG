// components/MarketplaceForm.js
'use client';

import { useState } from 'react';

export default function MarketplaceForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Marketplace added successfully!');
        setName('');
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Error adding marketplace.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
      <h2 className="mb-4 text-lg font-bold">Marketplace Form</h2>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Marketplace Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter marketplace name"
          required
        />
      </div>
      <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">
        Submit
      </button>
      {message && <p className="mt-4">{message}</p>}
    </form>
  );
}
  