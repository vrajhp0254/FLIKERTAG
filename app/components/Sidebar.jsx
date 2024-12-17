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
              className=" object-contain rounded-lg"
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
      <nav className="flex md:block overflow-x-auto md:overflow-x-visible">
        <ul className="flex md:flex-col space-x-4 md:space-x-0 md:space-y-2 p-2 sm:p-4 md:p-0">
          <li className="whitespace-nowrap">
            <Link href="/">
              <div className="flex items-center px-3 sm:px-4 py-2 hover:bg-gray-700 rounded-lg transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-sm sm:text-base">Inventory Setup</span>
              </div>
            </Link>
          </li>
          <li className="whitespace-nowrap">
            <Link href="/inventory">
              <div className="flex items-center px-3 sm:px-4 py-2 hover:bg-gray-700 rounded-lg transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span className="text-sm sm:text-base">Inventory</span>
              </div>
            </Link>
          </li>
          <li className="whitespace-nowrap">
            <Link href="/reports">
              <div className="flex items-center px-3 sm:px-4 py-2 hover:bg-gray-700 rounded-lg transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm sm:text-base">Reports</span>
              </div>
            </Link>
          </li>
          <li className="whitespace-nowrap">
            <Link href="/netreport">
              <div className="flex items-center px-3 sm:px-4 py-2 hover:bg-gray-700 rounded-lg transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm sm:text-base">Net Report</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
