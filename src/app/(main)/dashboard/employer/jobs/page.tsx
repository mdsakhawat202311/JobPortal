'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getEmployerJobs, updateJobStatus } from '@/lib/queries/jobs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { JobStatus } from '@/types/database.types';
import { Plus, MapPin, Users, Eye, EyeOff, Pencil } from 'lucide-react';
import { formatRelativeDate, getJobTypeBadge } from '@/lib/utils';

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ep } = await supabase.from('employer_profiles').select('company_id').eq('user_id', user.id).single();
      if (ep?.company_id) {
        const data = await getEmployerJobs(ep.company_id);
        setJobs(data || []);
      }
      setLoading(false);
    };
    init();
  }, []);

  const toggleStatus = async (id: string, current: JobStatus) => {
    const next: JobStatus = current === 'open' ? 'closed' : 'open';
    await updateJobStatus(id, next);
    setJobs(j => j.map(x => x.id === id ? { ...x, status: next } : x));
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Job Postings</h1>
            <p className="text-[var(--text-secondary)] mt-1">{jobs.length} total positions</p>
          </div>
          <Link href="/dashboard/employer/jobs/new">
            <Button icon={<Plus size={15} />}>Post New Job</Button>
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-subtle)] border border-[var(--border-accent)] flex items-center justify-center mx-auto mb-4">
              <Plus size={28} className="text-[var(--accent-bright)]" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">No jobs posted yet</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">Create your first job posting to start receiving applications.</p>
            <Link href="/dashboard/employer/jobs/new">
              <Button>Post Your First Job</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="glass-card p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-[var(--text-primary)]">{job.title}</h3>
                    <span className={`badge ${job.status === 'open' ? 'badge-success' : job.status === 'draft' ? 'badge-warning' : 'badge-neutral'}`}>
                      {job.status}
                    </span>
                    <span className="badge badge-primary">{getJobTypeBadge(job.job_type)}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-[var(--text-muted)]">
                    {job.location && <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>}
                    <span>Posted {formatRelativeDate(job.created_at)}</span>
                    <span className="flex items-center gap-1 text-violet-400"><Users size={10} />
                      {job.job_skills?.length || 0} skills required
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="ghost" size="sm" icon={<Eye size={14} />}>Preview</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={job.status === 'open' ? <EyeOff size={14} /> : <Eye size={14} />}
                    onClick={() => toggleStatus(job.id, job.status)}
                  >
                    {job.status === 'open' ? 'Unpublish' : 'Publish'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
