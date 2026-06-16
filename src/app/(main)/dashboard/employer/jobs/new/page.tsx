'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { createJob, updateJobStatus, addJobSkills, getAllSkills } from '@/lib/queries/jobs';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Plus, X, Check, Eye } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  title: z.string().min(3, 'Job title required'),
  description: z.string().min(50, 'Please write a more detailed description (min 50 chars)'),
  location: z.string().optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  job_type: z.enum(['full_time', 'part_time', 'contract', 'internship', 'remote']),
  status: z.enum(['open', 'draft']),
});
type FormData = z.infer<typeof schema>;

export default function NewJobPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState('');
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [selectedRequired, setSelectedRequired] = useState<string[]>([]);
  const [selectedOptional, setSelectedOptional] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { job_type: 'full_time', status: 'open' },
  });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ep } = await supabase.from('employer_profiles').select('company_id').eq('user_id', user.id).single();
      if (ep?.company_id) setCompanyId(ep.company_id);
      const skills = await getAllSkills();
      setAllSkills(skills || []);
    };
    init();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!companyId) { setError('No company found. Please complete your employer profile.'); return; }
    setError('');
    try {
      const job = await createJob({ ...data, company_id: companyId });
      const allSelected = [...selectedRequired, ...selectedOptional];
      if (allSelected.length > 0) {
        await addJobSkills(job.id, allSelected, selectedRequired);
      }
      router.push('/dashboard/employer/jobs');
    } catch (err: any) {
      setError(err.message || 'Failed to create job. Please try again.');
    }
  };

  const filteredSkills = allSkills.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedRequired.includes(s.id) &&
    !selectedOptional.includes(s.id)
  ).slice(0, 15);

  const getSkillName = (id: string) => allSkills.find(s => s.id === id)?.name || id;

  return (
    <div>
      <div className="max-w-3xl">
        <Link href="/dashboard/employer/jobs" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Jobs
        </Link>

        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Post a New Job</h1>
          <p className="text-[var(--text-secondary)] mt-1">Fill in the details to attract the best candidates.</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic info */}
          <div className="glass-card p-6 space-y-5">
            <h2 className="font-semibold text-[var(--text-primary)]">Job Details</h2>
            <Input label="Job Title" placeholder="e.g. Senior Full-Stack Engineer" required error={errors.title?.message} {...register('title')} />
            <Textarea label="Job Description" placeholder="Describe the role, responsibilities, and what you're looking for..." rows={8} required error={errors.description?.message} {...register('description')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Location" placeholder="New York, NY or Remote" {...register('location')} />
              <Select
                label="Job Type"
                options={[
                  { value: 'full_time', label: 'Full-time' },
                  { value: 'part_time', label: 'Part-time' },
                  { value: 'contract', label: 'Contract' },
                  { value: 'internship', label: 'Internship' },
                  { value: 'remote', label: 'Remote' },
                ]}
                {...register('job_type')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Salary Min ($)" type="number" placeholder="80000" {...register('salary_min', { valueAsNumber: true })} />
              <Input label="Salary Max ($)" type="number" placeholder="120000" {...register('salary_max', { valueAsNumber: true })} />
            </div>
          </div>

          {/* Skills */}
          <div className="glass-card p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Required Skills</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">These skills are used in match score calculation.</p>
            </div>

            {selectedRequired.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedRequired.map(id => (
                  <div key={id} className="flex items-center gap-1 badge badge-success pr-1.5">
                    {getSkillName(id)}
                    <button type="button" onClick={() => setSelectedRequired(s => s.filter(x => x !== id))}><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}

            {selectedOptional.length > 0 && (
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-2">Nice to have</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOptional.map(id => (
                    <div key={id} className="flex items-center gap-1 badge badge-neutral pr-1.5">
                      {getSkillName(id)}
                      <button type="button" onClick={() => setSelectedOptional(s => s.filter(x => x !== id))}><X size={10} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              type="text"
              placeholder="Search and add skills..."
              value={skillSearch}
              onChange={e => setSkillSearch(e.target.value)}
              className="input text-sm"
            />
            {skillSearch && filteredSkills.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredSkills.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                    <span className="text-sm text-[var(--text-primary)]">{s.name} <span className="text-[var(--text-muted)] text-xs">({s.category})</span></span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setSelectedRequired(r => [...r, s.id]); setSkillSearch(''); }} className="btn btn-sm btn-secondary text-xs px-2 py-1">Required</button>
                      <button type="button" onClick={() => { setSelectedOptional(o => [...o, s.id]); setSkillSearch(''); }} className="btn btn-sm btn-ghost text-xs px-2 py-1">Optional</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="glass-card p-6">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Visibility</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'open', label: 'Publish Now', desc: 'Visible to all job seekers' },
                { value: 'draft', label: 'Save as Draft', desc: 'Only visible to you' },
              ].map(({ value, label, desc }) => (
                <label key={value} className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] cursor-pointer hover:border-[var(--border-hover)] transition-all">
                  <input type="radio" value={value} className="mt-0.5 accent-violet-600" {...register('status')} />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/employer/jobs" className="flex-1">
              <Button variant="ghost" className="w-full">Cancel</Button>
            </Link>
            <Button type="submit" className="flex-1" loading={isSubmitting} icon={<Check size={16} />}>
              Post Job
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
