'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AnimatedForm, FadeUp } from '@/components/ui/AnimatedContainer';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      bottomText="Don't have an account?"
      bottomLinkText="Create an account"
      bottomLinkHref="/signup"
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}

function LoginForm() {
  const [serverError, setServerError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
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
      {/* Server Error */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-red-500/8 border border-red-500/15 text-red-600 dark:text-red-400 text-sm"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <AnimatedForm onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FadeUp>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            icon={<Mail size={16} />}
            error={errors.email?.message}
            {...register('email')}
          />
        </FadeUp>

        <FadeUp>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            icon={<Lock size={16} />}
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end mt-1.5">
            <Link
              href="#"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </FadeUp>

        <FadeUp>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isSubmitting}
          >
            Sign In
          </Button>
        </FadeUp>
      </AnimatedForm>
    </>
  );
}
