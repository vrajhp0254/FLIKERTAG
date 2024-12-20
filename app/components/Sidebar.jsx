'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Sidebar() {
  return (
    <div className="w-full md:w-64 bg-gray-800 text-white md:fixed md:h-screen md:min-h-screen">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="p-3 sm:p-4 flex items-center justify-between md:justify-start space-x-2 sm:space-x-3">
          <div className="flex items-center flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Inventory App Logo"
              width={100}
              height={100}
              className="object-contain rounded-lg"
              priority
            />
          </div>
          <div className="flex flex-col flex-grow md:flex-grow-0">
            <span className="font-bold text-sm sm:text-lg truncate">Inventory</span>
            <span className="text-[10px] sm:text-xs text-gray-400 truncate">Management System</span>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <nav className="mt-4">
        <ul className="space-y-2">
          <li>
            <Link href="/">
              <div className="flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg transition-colors">
                <span>Inventory Setup</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/inventory">
              <div className="flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg transition-colors">
                <span>Inventory</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/reports">
              <div className="flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg transition-colors">
                <span>Reports</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/netreport">
              <div className="flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg transition-colors">
                <span>Net Report</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
