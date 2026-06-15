'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, UserRole } from '@/types/database.types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Briefcase, Bell, ChevronDown, LogOut,
  User as UserIcon, LayoutDashboard, Menu, X, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const dashboardPath = dbUser?.role === 'employer'
    ? '/dashboard/employer'
    : '/dashboard/seeker';

  const navLinks = [
    { href: '/', label: 'Jobs' },
    { href: '/companies', label: 'Companies' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-30 transition-all duration-300',
        scrolled
          ? 'bg-[var(--bg-glass)] backdrop-blur-xl border-b border-[var(--border)] shadow-[0_4px_24px_rgba(0,0,0,0.1)]'
          : 'bg-transparent'
      )}
    >
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Left Side (Logo & Nav) */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6FBEB2] to-[#34908B] flex items-center justify-center shadow-[0_0_16px_rgba(52,144,139,0.5)] transition-shadow group-hover:shadow-[0_0_24px_rgba(52,144,139,0.7)]">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-lg text-[var(--text-primary)]">
                Job<span className="gradient-text">Portal</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    pathname === link.href
                      ? 'text-[var(--text-primary)] bg-[var(--bg-card-hover)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                {/* Dashboard shortcut */}
                <Link
                  href={dashboardPath}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    id="user-menu-button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--bg-card-hover)] transition-all"
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
                      className={cn('text-[var(--text-muted)] transition-transform', dropdownOpen && 'rotate-180')}
                    />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div
                        className="absolute right-0 top-full mt-3 w-56 z-20 rounded-2xl bg-[var(--bg-glass)] backdrop-blur-2xl border border-[var(--border)] shadow-[0_16px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] overflow-hidden"
                        role="menu"
                      >
                        <div className="px-4 py-3.5 border-b border-[var(--border)] bg-[var(--bg-surface)]/50">
                          <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                            {seekerProfile
                              ? `${seekerProfile.first_name} ${seekerProfile.last_name}`
                              : user.email}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] capitalize mt-0.5 font-medium tracking-wide">
                            {dbUser?.role}
                          </p>
                        </div>
                        <div className="p-2 space-y-1">
                          <Link
                            href={dashboardPath}
                            role="menuitem"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
                          >
                            <LayoutDashboard size={16} className="text-[var(--accent)]" /> Dashboard
                          </Link>
                          {dbUser?.role === 'seeker' && (
                            <Link
                              href="/dashboard/seeker/profile"
                              role="menuitem"
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
                            >
                              <UserIcon size={16} className="text-blue-500" /> My Profile
                            </Link>
                          )}
                        </div>
                        <div className="p-2 border-t border-[var(--border)] bg-[var(--bg-surface)]/30">
                          <button
                            role="menuitem"
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
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

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-all"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <Link href={dashboardPath} className="block px-4 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]">
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-500/10"
              >
                Sign Out
              </button>
            </>
          )}
          {!user && (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button size="sm" className="w-full">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
