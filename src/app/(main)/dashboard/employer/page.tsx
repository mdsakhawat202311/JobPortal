'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getEmployerJobs } from '@/lib/queries/jobs';
import { getCompanyApplications } from '@/lib/queries/applications';
import { CompanyLogo } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Briefcase, Users, TrendingUp, Eye, Plus, PenLine,
  BarChart2, ChevronRight, Building2, Calendar
} from 'lucide-react';

export default function EmployerDashboardPage() {
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ep } = await supabase
        .from('employer_profiles')
        .select('*, company:companies(*)')
        .eq('user_id', user.id)
        .single();
      setCompany(ep?.company);
      if (ep?.company_id) {
        const [jobsData, appsData] = await Promise.all([
          getEmployerJobs(ep.company_id),
          getCompanyApplications(ep.company_id),
        ]);
        setJobs(jobsData || []);
        setApplications(appsData || []);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      </div>
    );
  }

  const openJobs = jobs.filter(j => j.status === 'open');
  const totalApps = applications.length;
  const newApps = applications.filter(a => a.status === 'pending').length;
  const interviewing = applications.filter(a => a.status === 'interviewing').length;

  const stats = [
    { icon: Briefcase, label: 'Open Jobs', value: openJobs.length, color: 'text-violet-400', href: '/dashboard/employer/jobs' },
    { icon: Users, label: 'Total Applications', value: totalApps, color: 'text-blue-400', href: '/dashboard/employer/pipeline' },
    { icon: TrendingUp, label: 'New This Week', value: newApps, color: 'text-amber-400', href: '/dashboard/employer/pipeline' },
    { icon: Calendar, label: 'Interviewing', value: interviewing, color: 'text-emerald-400', href: '/dashboard/employer/pipeline' },
  ];

  return (
    <div>
      <div className="max-w-5xl space-y-6">
        {/* Company header */}
        <div className="glass-card p-6 flex items-center gap-5">
          <CompanyLogo src={company?.logo_url} name={company?.name || '?'} size={64} />
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">{company?.name || 'Your Company'}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{company?.industry || 'Add company industry'}</p>
            {company?.website_url && (
              <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent-bright)] hover:underline mt-1 inline-block">
                {company.website_url}
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/employer/jobs/new">
              <Button size="sm" icon={<Plus size={14} />}>Post Job</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, label, value, color, href }) => (
            <Link key={label} href={href}>
              <div className="glass-card p-4 text-center hover:border-[var(--border-hover)] cursor-pointer transition-all">
                <Icon size={20} className={`mx-auto mb-2 ${color}`} />
                <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{value}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent jobs */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-[var(--text-primary)]">Recent Job Postings</h3>
              <Link href="/dashboard/employer/jobs" className="text-xs text-[var(--accent-bright)] hover:underline">View all</Link>
            </div>
            {jobs.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase size={28} className="mx-auto mb-2 text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-muted)]">No jobs posted yet.</p>
                <Link href="/dashboard/employer/jobs/new" className="mt-3 inline-block">
                  <Button size="sm" icon={<Plus size={13} />}>Post First Job</Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {jobs.slice(0, 5).map(job => (
                  <li key={job.id} className="flex items-center justify-between px-5 py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{job.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{job.location || 'Remote'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${job.status === 'open' ? 'badge-success' : job.status === 'draft' ? 'badge-warning' : 'badge-neutral'}`}>
                        {job.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent applications */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-[var(--text-primary)]">Recent Applications</h3>
              <Link href="/dashboard/employer/pipeline" className="text-xs text-[var(--accent-bright)] hover:underline">Kanban view</Link>
            </div>
            {applications.length === 0 ? (
              <div className="p-8 text-center">
                <Users size={28} className="mx-auto mb-2 text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-muted)]">No applications received yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {applications.slice(0, 5).map(app => (
                  <li key={app.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {app.seeker_profile?.first_name} {app.seeker_profile?.last_name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{app.job?.title}</p>
                    </div>
                    <span className={`badge badge-${app.status === 'pending' ? 'warning' : app.status === 'reviewing' ? 'info' : app.status === 'offered' ? 'success' : 'neutral'}`}>
                      {app.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
