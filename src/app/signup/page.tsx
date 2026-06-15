'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { createCompany } from '@/lib/queries/profiles';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Zap, Mail, Lock, User, Building2, Briefcase, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';



const step1Schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['seeker', 'employer']),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const seekerStep2Schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
});

const employerStep2Schema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  industry: z.string().optional(),
  titleAtCompany: z.string().optional(),
  description: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register: r1, handleSubmit: hs1, watch: w1, formState: { errors: e1, isSubmitting: s1 } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { role: 'seeker' },
  });

  const selectedRole = w1('role');

  const { register: r2s, handleSubmit: hs2s, formState: { errors: e2s, isSubmitting: isSubmittingSeeker } } = useForm<z.infer<typeof seekerStep2Schema>>({
    resolver: zodResolver(seekerStep2Schema),
  });

  const { register: r2e, handleSubmit: hs2e, formState: { errors: e2e, isSubmitting: isSubmittingEmployer } } = useForm<z.infer<typeof employerStep2Schema>>({
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
      setServerError(err.message || 'An error occurred during profile setup.');
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
      setServerError(err.message || 'An error occurred during profile setup.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-base)]">
        <div className="text-center max-w-md animate-in zoom-in duration-500">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-4 tracking-tight">Account Created!</h1>
          <p className="text-[var(--text-secondary)] mb-8 text-lg">
            Check your email to confirm your account, then sign in to get started.
          </p>
          <Link href="/login">
            <Button size="lg" className="w-full">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-[var(--bg-base)]">
      {/* Premium subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] opacity-30 pointer-events-none dark:opacity-20"
        style={{ background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.3) 0%, rgba(79,70,229,0.1) 40%, transparent 80%)' }} />

      <div className="w-full max-w-[460px] mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_24px_rgba(124,58,237,0.4)] transition-transform group-hover:scale-105">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-2xl text-[var(--text-primary)] tracking-tight">
              Job<span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">Portal</span>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">Create your account</h1>
          <p className="text-[var(--text-secondary)] mt-2 font-medium">Step {step} of 2</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-glass)] backdrop-blur-3xl border border-[var(--border)] shadow-[0_32px_64px_rgba(0,0,0,0.06)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.3)] rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          
          {/* Progress Bar inside Card Top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--bg-elevated)]">
            <div 
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-700 ease-out" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          {serverError && (
            <div className="mb-6 mt-2 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-in fade-in zoom-in-95">
              <AlertCircle size={18} className="shrink-0" /> {serverError}
            </div>
          )}

          <div className="relative">
            {/* ── STEP 1 ── */}
            <div className={cn("transition-all duration-500", step === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full absolute inset-0 pointer-events-none")}>
              <form onSubmit={hs1(onStep1)} className="space-y-5" noValidate>
                <Input label="Email Address" type="email" autoComplete="email" icon={<Mail size={18} />} error={e1.email?.message} {...r1('email')} />
                <Input label="Password" type="password" autoComplete="new-password" icon={<Lock size={18} />} error={e1.password?.message} {...r1('password')} />
                <Input label="Confirm Password" type="password" autoComplete="new-password" icon={<Lock size={18} />} error={e1.confirmPassword?.message} {...r1('confirmPassword')} />

                {/* Role picker */}
                <div className="pt-2">
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-3 px-1">I am a...</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'seeker', label: 'Job Seeker', icon: User, desc: 'Looking for work' },
                      { value: 'employer', label: 'Employer', icon: Building2, desc: 'Hiring talent' },
                    ].map(({ value, label, icon: Icon, desc }) => (
                      <label
                        key={value}
                        className={cn(
                          'relative flex flex-col items-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all text-center group',
                          selectedRole === value
                            ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-[0_0_24px_rgba(124,58,237,0.1)]'
                            : 'border-[var(--border)] hover:border-[var(--border-hover)] bg-[rgba(255,255,255,0.02)]'
                        )}
                      >
                        <input type="radio" value={value} className="sr-only" {...r1('role')} />
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-all', selectedRole === value ? 'bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30 scale-110' : 'bg-[var(--bg-elevated)] group-hover:bg-[var(--bg-card-hover)]')}>
                          <Icon size={20} className={selectedRole === value ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'} />
                        </div>
                        <div className="mt-1">
                          <span className={cn('block text-sm font-bold', selectedRole === value ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>{label}</span>
                          <span className="block text-xs text-[var(--text-muted)] mt-0.5">{desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4" size="lg" loading={s1} iconRight={<ChevronRight size={18} />}>
                  Continue to Step 2
                </Button>
              </form>
            </div>

            {/* ── STEP 2 — SEEKER ── */}
            <div className={cn("transition-all duration-500", step === 2 && selectedRole === 'seeker' ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full absolute inset-0 pointer-events-none")}>
              <form onSubmit={hs2s(onSeekerSubmit)} className="space-y-5" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" icon={<User size={18} />} error={e2s.firstName?.message} {...r2s('firstName')} />
                  <Input label="Last Name" icon={<User size={18} />} error={e2s.lastName?.message} {...r2s('lastName')} />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" className="flex-1" icon={<ChevronLeft size={18} />} onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" className="flex-[2]" loading={isSubmittingSeeker} iconRight={<CheckCircle2 size={18} />}>Create Account</Button>
                </div>
              </form>
            </div>

            {/* ── STEP 2 — EMPLOYER ── */}
            <div className={cn("transition-all duration-500", step === 2 && selectedRole === 'employer' ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full absolute inset-0 pointer-events-none")}>
              <form onSubmit={hs2e(onEmployerSubmit)} className="space-y-5" noValidate>
                <Input label="Company Name" icon={<Building2 size={18} />} error={e2e.companyName?.message} {...r2e('companyName')} />
                <Input label="Your Title" icon={<Briefcase size={18} />} error={e2e.titleAtCompany?.message} {...r2e('titleAtCompany')} />
                <Input label="Industry" error={e2e.industry?.message} {...r2e('industry')} />
                <Textarea label="Company Description" placeholder="What does your company do?" rows={3} {...r2e('description')} />
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" className="flex-1" icon={<ChevronLeft size={18} />} onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" className="flex-[2]" loading={isSubmittingEmployer} iconRight={<CheckCircle2 size={18} />}>Create Account</Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--accent)] hover:text-indigo-500 font-semibold transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
