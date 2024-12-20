'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function AuthenticatedLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
