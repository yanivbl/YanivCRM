import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';

export function DashboardLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="w-full flex-1 px-4 py-6 sm:px-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
