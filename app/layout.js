// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from './components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Inventory Management System',
  description: 'A comprehensive inventory management system',
  icons: {
    icon: [
      {
        url: '/logo.png', // Your main favicon
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/logo.png', // Larger size for modern browsers
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    shortcut: '/logo.png', // Fallback favicon
    apple: '/logo.png', // Apple devices favicon
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          <div className="w-full md:ml-64 p-4 md:p-6">{children}</div>
        </div>
      </body>
    </html>
  );
}
