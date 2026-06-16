import type { Metadata } from 'next';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Dashboard — JobPortal',
  description: 'Manage your job applications, profile, and job postings.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
