import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed">
      <div className="p-4 text-lg font-bold">Inventory App</div>
      <nav className="mt-6">
        <ul className="space-y-2">
          <li>
            <Link href="/">
              <div className="block px-4 py-2 hover:bg-gray-700">Inventory Setup</div>
            </Link>
          </li>
          <li>
            <Link href="/inventory">
              <div className="block px-4 py-2 hover:bg-gray-700">Inventory</div>
            </Link>
          </li>
          <li>
            <Link href="/reports">
              <div className="block px-4 py-2 hover:bg-gray-700">Reports</div>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
