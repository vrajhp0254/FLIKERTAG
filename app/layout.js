// app/layout.js
import './globals.css';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'Inventory Management',
  description: 'Manage your inventory efficiently',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          <div className="w-full md:ml-64 p-4 md:p-6">{children}</div>
        </div>
      </body>
    </html>
  );
}
