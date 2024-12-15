'use client';

import { useState } from 'react';

export default function CategoryForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/category', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });

      console.log(response);

      if (response.ok) {
        setMessage('Category added successfully!');
        setName('');
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
      }
    } catch (error) {
      setMessage('Error adding category.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
      <h2 className="mb-4 text-lg font-bold">Category Form</h2>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Category Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter category name"
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
