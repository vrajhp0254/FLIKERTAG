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
        <div className="flex">
          <Sidebar />
          <div className="ml-64 flex-1 p-6">{children}</div>
        </div>
      </body>
    </html>
  );
}
