'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  Users, 
  PlusSquare,
  Search,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const seekerLinks = [
  { href: '/dashboard/seeker', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/seeker/profile', label: 'My Profile', icon: User },
  { href: '/', label: 'Browse Jobs', icon: Search },
];

const employerLinks = [
  { href: '/dashboard/employer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/employer/jobs', label: 'Job Postings', icon: Briefcase },
  { href: '/dashboard/employer/jobs/new', label: 'Post a Job', icon: PlusSquare },
  { href: '/dashboard/employer/pipeline', label: 'Candidates', icon: Users },
  { href: '/', label: 'Browse Jobs', icon: Search },
];

export function SidebarNav({ role }: { role: string }) {
  const pathname = usePathname();
  const links = role === 'employer' ? employerLinks : seekerLinks;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-[var(--accent)] text-white rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-[rgba(8,12,24,0.6)] backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 w-64 z-40 transition-transform duration-300 shrink-0",
        "md:top-[var(--navbar-height)] h-[100dvh] md:h-[calc(100vh-var(--navbar-height))]",
        "glass-card rounded-none border-t-0 border-b-0 border-l-0 md:border-r border-[var(--border)]",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full py-8 px-4 overflow-y-auto">
          <div className="md:hidden mb-8 px-4">
             <span className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Job<span className="gradient-text">Portal</span>
            </span>
          </div>
          
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                    isActive 
                      ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-glow)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                  )}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
