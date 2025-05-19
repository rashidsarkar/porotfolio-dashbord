"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Briefcase,
  Code2,
  FileText,
  LayoutDashboard,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'About', href: '/dashboard/about', icon: User },
  { name: 'Blogs', href: '/dashboard/blogs', icon: FileText },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
  { name: 'Skills', href: '/dashboard/skills', icon: Code2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-4 border-b">
          <h1 className="text-xl font-bold">Portfolio Dashboard</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 