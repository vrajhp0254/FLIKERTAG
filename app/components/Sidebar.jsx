import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-full md:w-64 bg-gray-800 text-white md:fixed md:h-screen md:min-h-screen">
      <div className="p-4 text-lg font-bold">Inventory App</div>
      <nav className="flex md:block overflow-x-auto md:overflow-x-visible">
        <ul className="flex md:flex-col space-x-4 md:space-x-0 md:space-y-2 p-4 md:p-0">
          <li className="whitespace-nowrap">
            <Link href="/">
              <div className="block px-4 py-2 hover:bg-gray-700">Inventory Setup</div>
            </Link>
          </li>
          <li className="whitespace-nowrap">
            <Link href="/inventory">
              <div className="block px-4 py-2 hover:bg-gray-700">Inventory</div>
            </Link>
          </li>
          <li className="whitespace-nowrap">
            <Link href="/reports">
              <div className="block px-4 py-2 hover:bg-gray-700">Reports</div>
            </Link>
          </li>
          <li className="whitespace-nowrap">
            <Link href="/netreport">
              <div className="block px-4 py-2 hover:bg-gray-700">Net Report</div>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
