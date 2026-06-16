'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, UserRole } from '@/types/database.types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Briefcase, Bell, ChevronDown, LogOut,
  User as UserIcon, LayoutDashboard, X, Zap, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [seekerProfile, setSeekerProfile] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      if (authUser) {
        const { data: u } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setDbUser(u);
        if (u?.role === 'seeker') {
          const { data: sp } = await supabase
            .from('seeker_profiles')
            .select('first_name, last_name, avatar_url')
            .eq('user_id', authUser.id)
            .single();
          setSeekerProfile(sp);
        }
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) { setDbUser(null); setSeekerProfile(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [pathname]);

  // Close mobile menu on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenuOpen(false); setDropdownOpen(false); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const dashboardPath = dbUser?.role === 'employer'
    ? '/dashboard/employer'
    : '/dashboard/seeker';

  const navLinks = [
    { href: '/', label: 'Jobs', icon: Briefcase },
    { href: '/companies', label: 'Companies', icon: Search },
  ];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 left-0 right-0 z-50 transition-all duration-300',
          'bg-[var(--bg-surface)]/95 backdrop-blur-xl',
          'border-b',
          scrolled
            ? 'border-[var(--border)] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)]'
            : 'border-transparent'
        )}
      >
        <div className="container-app">
          <div className="flex items-center h-16 gap-6 md:gap-8">
            {/* ─── Left: Hamburger + Logo ─── */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Hamburger */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] active:bg-[var(--border)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
              >
                <div className="w-[18px] h-[14px] flex flex-col justify-between">
                  <motion.span
                    animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="block w-full h-[2px] bg-current rounded-full origin-center"
                  />
                  <motion.span
                    animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                    className="block w-full h-[2px] bg-current rounded-full"
                  />
                  <motion.span
                    animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="block w-full h-[2px] bg-current rounded-full origin-center"
                  />
                </div>
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 group select-none">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6FBEB2] to-[#34908B] flex items-center justify-center shadow-sm transition-shadow group-hover:shadow-md">
                  <Zap size={15} className="text-white" fill="white" />
                </div>
                <span className="font-display font-bold text-[17px] text-[var(--text-primary)] tracking-tight hidden sm:inline">
                  Job<span className="text-[#34908B]">Portal</span>
                </span>
              </Link>
            </div>

            {/* ─── Center: Desktop Nav Links ─── */}
            <nav className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                    pathname === link.href
                      ? 'text-white bg-[var(--accent)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ─── Spacer ─── */}
            <div className="flex-1" />

            {/* ─── Right: Actions ─── */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <ThemeToggle />

              {user ? (
                <>
                  {/* Dashboard shortcut - desktop only */}
                  <Link
                    href={dashboardPath}
                    className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all duration-200"
                  >
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Link>

                  {/* User dropdown */}
                  <div className="relative">
                    <button
                      id="user-menu-button"
                      onClick={() => setDropdownOpen((v) => !v)}
                      className="flex items-center gap-2 p-1 pr-2.5 rounded-full hover:bg-[var(--bg-card-hover)] transition-all duration-200"
                      aria-expanded={dropdownOpen}
                      aria-haspopup="menu"
                    >
                      <Avatar
                        src={seekerProfile?.avatar_url}
                        firstName={seekerProfile?.first_name || user.email?.[0]}
                        lastName={seekerProfile?.last_name || ''}
                        size="sm"
                      />
                      <ChevronDown
                        size={14}
                        className={cn('text-[var(--text-muted)] transition-transform duration-200', dropdownOpen && 'rotate-180')}
                      />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                            className="absolute right-0 top-full mt-2 w-56 z-20 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-[0_10px_38px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_38px_rgba(0,0,0,0.4)] overflow-hidden"
                            role="menu"
                          >
                            <div className="px-4 py-3.5 border-b border-[var(--border)]">
                              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                {seekerProfile
                                  ? `${seekerProfile.first_name} ${seekerProfile.last_name}`
                                  : user.email}
                              </p>
                              <p className="text-xs text-[var(--text-muted)] capitalize mt-0.5">
                                {dbUser?.role}
                              </p>
                            </div>
                            <div className="p-1.5">
                              <Link
                                href={dashboardPath}
                                role="menuitem"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors duration-150"
                              >
                                <LayoutDashboard size={16} className="text-[var(--accent)]" /> Dashboard
                              </Link>
                              {dbUser?.role === 'seeker' && (
                                <Link
                                  href="/dashboard/seeker/profile"
                                  role="menuitem"
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors duration-150"
                                >
                                  <UserIcon size={16} className="text-blue-500" /> My Profile
                                </Link>
                              )}
                            </div>
                            <div className="p-1.5 border-t border-[var(--border)]">
                              <button
                                role="menuitem"
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors duration-150"
                              >
                                <LogOut size={16} /> Sign Out
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Slide-Down Mobile Menu ─── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-[var(--bg-surface)] border-r border-[var(--border)] shadow-[4px_0_24px_rgba(0,0,0,0.1)] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border)]">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6FBEB2] to-[#34908B] flex items-center justify-center">
                    <Zap size={15} className="text-white" fill="white" />
                  </div>
                  <span className="font-display font-bold text-[17px] text-[var(--text-primary)] tracking-tight">
                    Job<span className="text-[#34908B]">Portal</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Nav */}
              <nav className="flex-1 overflow-y-auto py-6 px-4">
                <div className="space-y-3">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-4 px-4 py-4 rounded-xl text-[17px] font-semibold transition-colors duration-150',
                          pathname === link.href
                            ? 'text-white bg-[var(--accent)] shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                        )}
                      >
                        <Icon size={18} />
                        {link.label}
                      </Link>
                    );
                  })}

                  {user && (
                    <Link
                      href={dashboardPath}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-4 rounded-xl text-[17px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors duration-150"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                  )}

                  {user && dbUser?.role === 'seeker' && (
                    <Link
                      href="/dashboard/seeker/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-4 rounded-xl text-[17px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors duration-150"
                    >
                      <UserIcon size={18} />
                      My Profile
                    </Link>
                  )}
                </div>
              </nav>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-[var(--border)]">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar
                        src={seekerProfile?.avatar_url}
                        firstName={seekerProfile?.first_name || user.email?.[0]}
                        lastName={seekerProfile?.last_name || ''}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {seekerProfile
                            ? `${seekerProfile.first_name} ${seekerProfile.last_name}`
                            : user.email}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] capitalize">{dbUser?.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setMenuOpen(false); handleSignOut(); }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors duration-150"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={() => setMenuOpen(false)}>
                      <Button variant="secondary" size="sm" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMenuOpen(false)}>
                      <Button size="sm" className="w-full">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
