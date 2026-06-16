'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  bottomText: string;
  bottomLinkText: string;
  bottomLinkHref: string;
  /** Allow wider max-width for signup (default 420px) */
  wide?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  bottomText,
  bottomLinkText,
  bottomLinkHref,
  wide = false,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-base)] overflow-hidden">
      {/* ─── Left Pane: Brand + Social Proof (desktop only) ─── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[var(--bg-surface)]">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              x: [0, 40, 0],
              y: [0, -25, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-[15%] -left-[10%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-[#A5E9DD]/35 to-[#6FBEB2]/10 blur-[100px] dark:opacity-25"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, 40, 0],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute top-[45%] -right-[15%] w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-[#FDF4AF]/25 to-[#34908B]/15 blur-[110px] dark:opacity-25"
          />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5 group w-max">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6FBEB2] to-[#34908B] flex items-center justify-center shadow-sm"
          >
            <Zap size={18} className="text-white" fill="white" />
          </motion.div>
          <span className="font-display font-bold text-xl text-[var(--text-primary)] tracking-tight">
            Job<span className="text-[#34908B]">Portal</span>
          </span>
        </Link>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mt-auto"
        >
          <blockquote className="space-y-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-xl font-display font-medium text-[var(--text-primary)] leading-relaxed">
              &ldquo;The skills-based matching completely transformed how we discover talent. It&rsquo;s the modern, effortless way to hire.&rdquo;
            </p>
            <footer className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A5E9DD] to-[#34908B] flex items-center justify-center text-white text-xs font-bold">
                SJ
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Sarah Jenkins</p>
                <p className="text-xs text-[var(--text-muted)]">VP of Engineering</p>
              </div>
            </footer>
          </blockquote>
        </motion.div>
      </div>

      {/* ─── Right Pane: Form ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10 lg:py-0 relative">
        {/* Mobile background glow */}
        <div
          className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[400px] opacity-30 pointer-events-none dark:opacity-20"
          style={{ background: 'radial-gradient(ellipse at top, rgba(165,233,221,0.5) 0%, transparent 70%)' }}
        />

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6FBEB2] to-[#34908B] flex items-center justify-center shadow-sm">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-xl text-[var(--text-primary)] tracking-tight">
              Job<span className="text-[#34908B]">Portal</span>
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'w-full relative z-10',
            wide ? 'max-w-[480px]' : 'max-w-[420px]'
          )}
        >
          {/* Header */}
          <div className="text-center lg:text-left mb-6">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5">{subtitle}</p>
          </div>

          {/* Card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] relative overflow-hidden">
            {children}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center lg:text-left text-sm text-[var(--text-muted)]">
            {bottomText}{' '}
            <Link
              href={bottomLinkHref}
              className="text-[var(--accent)] hover:text-[var(--accent-bright)] font-semibold transition-colors"
            >
              {bottomLinkText}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
