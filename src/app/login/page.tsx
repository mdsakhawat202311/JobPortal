'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';


const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center px-4 relative overflow-hidden bg-[var(--bg-base)]">
      {/* Premium subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] opacity-30 pointer-events-none dark:opacity-20"
        style={{ background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.3) 0%, rgba(79,70,229,0.1) 40%, transparent 80%)' }} />

      <div className="w-full max-w-[420px] mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_24px_rgba(124,58,237,0.4)] transition-transform group-hover:scale-105">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-2xl text-[var(--text-primary)] tracking-tight">
              Job<span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">Portal</span>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">Welcome back</h1>
          <p className="text-[var(--text-secondary)] mt-2">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-glass)] backdrop-blur-3xl border border-[var(--border)] shadow-[0_32px_64px_rgba(0,0,0,0.06)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.3)] rounded-3xl p-8 sm:p-10">
          <Suspense fallback={<div className="text-center text-[var(--text-muted)] py-8 animate-pulse">Loading secure connection...</div>}>
            <LoginContent />
          </Suspense>
        </div>
        
        {/* Footer Link */}
        <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[var(--accent)] hover:text-indigo-500 font-semibold transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoginContent() {
  const [serverError, setServerError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      setServerError(error.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <>
      {serverError && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-in fade-in zoom-in-95">
          <AlertCircle size={18} className="shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          icon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email')}
        />
        
        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            icon={<Lock size={18} />}
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end mt-2">
            <Link href="#" className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
          Sign In
        </Button>
      </form>
    </>
  );
}
