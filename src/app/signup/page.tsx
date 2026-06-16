'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AnimatedForm, FadeUp, StepTransition } from '@/components/ui/AnimatedContainer';
import { motion } from 'framer-motion';
import {
  Mail, Lock, User, Building2, Briefcase,
  AlertCircle, CheckCircle2, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Schemas ─── */
const step1Schema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['seeker', 'employer']),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const seekerStep2Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const employerStep2Schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().optional(),
  titleAtCompany: z.string().optional(),
  description: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;

/* ─── Roles Config ─── */
const ROLES = [
  { value: 'seeker' as const, label: 'Job Seeker', desc: 'Looking for work', icon: User },
  { value: 'employer' as const, label: 'Employer', desc: 'Hiring talent', icon: Building2 },
];

/* ─── Page ─── */
export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Step 1 form
  const {
    register: r1,
    handleSubmit: hs1,
    watch: w1,
    formState: { errors: e1 },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { role: 'seeker' },
  });
  const selectedRole = w1('role');

  // Step 2 — Seeker
  const {
    register: r2s,
    handleSubmit: hs2s,
    formState: { errors: e2s, isSubmitting: isSubmittingSeeker },
  } = useForm<z.infer<typeof seekerStep2Schema>>({
    resolver: zodResolver(seekerStep2Schema),
  });

  // Step 2 — Employer
  const {
    register: r2e,
    handleSubmit: hs2e,
    formState: { errors: e2e, isSubmitting: isSubmittingEmployer },
  } = useForm<z.infer<typeof employerStep2Schema>>({
    resolver: zodResolver(employerStep2Schema),
  });

  const onStep1 = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  const onSeekerSubmit = async (data: z.infer<typeof seekerStep2Schema>) => {
    if (!step1Data) return;
    setServerError('');
    try {
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          data: { role: 'seeker' },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (signUpError) { setServerError(signUpError.message); return; }
      if (authData.user) {
        const { setupSeekerProfile } = await import('@/app/actions/auth');
        await setupSeekerProfile(authData.user.id, data.firstName, data.lastName);
      }
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    }
  };

  const onEmployerSubmit = async (data: z.infer<typeof employerStep2Schema>) => {
    if (!step1Data) return;
    setServerError('');
    try {
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          data: { role: 'employer' },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (signUpError) { setServerError(signUpError.message); return; }
      if (authData.user) {
        const { setupEmployerProfile } = await import('@/app/actions/auth');
        await setupEmployerProfile(authData.user.id, data.companyName, data.industry, data.description, data.titleAtCompany);
      }
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    }
  };

  /* ─── Success State ─── */
  if (success) {
    return (
      <AuthLayout
        title="You're all set!"
        subtitle="Check your email to verify your account."
        bottomText="Didn't get the email?"
        bottomLinkText="Sign in instead"
        bottomLinkHref="/login"
      >
        <div className="flex flex-col items-center py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, damping: 14, stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5"
          >
            <CheckCircle2 size={32} className="text-emerald-500" />
          </motion.div>
          <p className="text-sm text-[var(--text-secondary)] text-center max-w-[260px]">
            We sent a confirmation link to your email. Click it to activate your account, then sign in.
          </p>
          <Link href="/login" className="mt-6">
            <Button size="md">Go to Sign In</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  /* ─── Main Form ─── */
  const isSubmitting = selectedRole === 'seeker' ? isSubmittingSeeker : isSubmittingEmployer;

  return (
    <AuthLayout
      title="Create your account"
      subtitle={`Step ${step} of 2`}
      bottomText="Already have an account?"
      bottomLinkText="Sign in"
      bottomLinkHref="/login"
      wide
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--bg-elevated)] rounded-t-2xl overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#A5E9DD] to-[#34908B]"
          initial={false}
          animate={{ width: step === 1 ? '50%' : '100%' }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        />
      </div>

      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 mb-4 rounded-xl bg-red-500/8 border border-red-500/15 text-red-600 dark:text-red-400 text-sm"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Step transition */}
      <div className="mt-2">
        <StepTransition stepKey={step} direction={1}>
          {step === 1 ? (
            /* ─── Step 1: Credentials + Role ─── */
            <AnimatedForm onSubmit={hs1(onStep1)} className="space-y-4" noValidate>
              <FadeUp>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  icon={<Mail size={16} />}
                  error={e1.email?.message}
                  {...r1('email')}
                />
              </FadeUp>

              <FadeUp>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                    icon={<Lock size={16} />}
                    error={e1.password?.message}
                    {...r1('password')}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    icon={<Lock size={16} />}
                    error={e1.confirmPassword?.message}
                    {...r1('confirmPassword')}
                  />
                </div>
              </FadeUp>

              <FadeUp>
                <fieldset>
                  <legend className="text-[13px] font-medium text-[var(--text-secondary)] mb-2">
                    I want to...
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map(({ value, label, desc, icon: Icon }) => (
                      <label
                        key={value}
                        className={cn(
                          'relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center select-none',
                          selectedRole === value
                            ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-[0_0_0_1px_var(--accent)]'
                            : 'border-[var(--border)] hover:border-[var(--border-hover)] bg-transparent'
                        )}
                      >
                        <input type="radio" value={value} className="sr-only" {...r1('role')} />
                        <div
                          className={cn(
                            'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                            selectedRole === value
                              ? 'bg-[var(--accent)] text-white'
                              : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                          )}
                        >
                          <Icon size={18} />
                        </div>
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            selectedRole === value ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                          )}
                        >
                          {label}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">{desc}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </FadeUp>

              <FadeUp>
                <Button type="submit" className="w-full" size="lg">
                  Continue
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </FadeUp>
            </AnimatedForm>
          ) : (
            /* ─── Step 2: Profile Details ─── */
            <AnimatedForm
              onSubmit={selectedRole === 'seeker' ? hs2s(onSeekerSubmit) : hs2e(onEmployerSubmit)}
              className="space-y-4"
              noValidate
            >
              {selectedRole === 'seeker' ? (
                <FadeUp>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="First Name"
                      placeholder="Jane"
                      icon={<User size={16} />}
                      error={e2s.firstName?.message}
                      {...r2s('firstName')}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      icon={<User size={16} />}
                      error={e2s.lastName?.message}
                      {...r2s('lastName')}
                    />
                  </div>
                </FadeUp>
              ) : (
                <>
                  <FadeUp>
                    <Input
                      label="Company Name"
                      placeholder="Acme Inc."
                      icon={<Building2 size={16} />}
                      error={e2e.companyName?.message}
                      {...r2e('companyName')}
                    />
                  </FadeUp>
                  <FadeUp>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Your Title"
                        placeholder="CTO"
                        icon={<Briefcase size={16} />}
                        error={e2e.titleAtCompany?.message}
                        {...r2e('titleAtCompany')}
                      />
                      <Input
                        label="Industry"
                        placeholder="Technology"
                        {...r2e('industry')}
                      />
                    </div>
                  </FadeUp>
                  <FadeUp>
                    <Textarea
                      label="Company Description"
                      placeholder="Tell us about your company..."
                      rows={3}
                      {...r2e('description')}
                    />
                  </FadeUp>
                </>
              )}

              <FadeUp>
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="px-3.5"
                    aria-label="Go back to step 1"
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <Button type="submit" className="flex-1" size="lg" loading={isSubmitting}>
                    Create Account
                  </Button>
                </div>
              </FadeUp>
            </AnimatedForm>
          )}
        </StepTransition>
      </div>
    </AuthLayout>
  );
}
