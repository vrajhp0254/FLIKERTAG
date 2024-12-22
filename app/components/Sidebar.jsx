'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { href: '/', icon: HomeIcon, label: 'Inventory Setup' },
    { href: '/inventory', icon: ClipboardDocumentListIcon, label: 'Inventory' },
    { href: '/reports', icon: ChartBarIcon, label: 'Reports' },
    { href: '/netreport', icon: DocumentChartBarIcon, label: 'Net Report' }
  ];

  return (
    <div className="w-full md:w-64 bg-gray-800 text-white md:fixed md:h-screen md:min-h-screen">
      {/* Mobile Menu Button */}
      <div className="md:hidden absolute right-4 top-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2 rounded-lg hover:bg-gray-700"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Header */}
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
        </div>
      </div>
      
      {/* Navigation */}
      <nav className={`mt-4 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <div className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200 group">
                  <item.icon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Bottom Section - Optional */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 hidden md:block">
          <div className="flex items-center px-4 py-2 text-gray-400 text-xs">
            <span>© 2024 Inventory System</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
