'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getOpenJobs } from '@/lib/queries/jobs';
import { batchComputeMatchScores } from '@/lib/queries/match';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import { Zap, TrendingUp, Users, Briefcase, Star } from 'lucide-react';

const STATS = [
  { icon: Briefcase, label: 'Open Positions', value: '12,400+' },
  { icon: Users, label: 'Companies Hiring', value: '2,800+' },
  { icon: TrendingUp, label: 'Placements Made', value: '48,000+' },
  { icon: Star, label: 'Avg. Match Score', value: '74%' },
];

export default function JobFeedPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [matchScores, setMatchScores] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filters, setFilters] = useState({ search: '', jobType: '', location: '' });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOpenJobs({
        search: filters.search || undefined,
        jobType: filters.jobType || undefined,
        location: filters.location || undefined,
        limit: 20,
      });
      setJobs(data || []);

      if (currentUser && data?.length) {
        const supabase = createClient();
        const { data: seekerProfile } = await supabase
          .from('seeker_profiles')
          .select('user_id')
          .eq('user_id', currentUser.id)
          .single();

        if (seekerProfile) {
          const scores = await batchComputeMatchScores(currentUser.id, data.map((j: any) => j.id));
          setMatchScores(scores);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentUser]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-16 pb-8 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        {/* Mesh gradient blobs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full opacity-30 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(165,233,221,0.5) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-64 rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(52,144,139,0.6) 0%, transparent 70%)' }} />

        <div className="container-app relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)', color: 'var(--accent-bright)' }}>
            <Zap size={13} fill="currentColor" />
            Skills-powered job matching
          </div>

          <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl text-[var(--text-primary)] mb-6 leading-[1.05] tracking-tight">
            Find Your Perfect<br />
            <span className="gradient-text">Next Role</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8 leading-relaxed">
            Discover jobs matched to your skills. See your compatibility score before you apply.
          </p>

          {/* Inline search */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8">
            <div className="relative flex-1">
              <input
                type="search"
                placeholder="Job title, keyword, or company..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="input w-full pl-5 py-3.5 text-base"
                aria-label="Search jobs"
              />
            </div>
            <button
              onClick={loadJobs}
              className="btn btn-primary px-8 py-3.5 text-base shrink-0"
            >
              Search Jobs
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass-card px-4 py-4 text-center">
                <div className="flex justify-center mb-2">
                  <Icon size={18} className="text-[var(--accent-bright)]" />
                </div>
                <p className="font-display font-bold text-xl text-[var(--text-primary)]">{value}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="pt-6 pb-12">
        <div className="container-app">
          <div className="grid grid-cols-1 lg:grid-cols-[20rem_1fr] gap-8">
            {/* Sidebar filters */}
            <aside>
              <JobFilters
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters({ search: '', jobType: '', location: '' })}
              />
            </aside>

            {/* Job cards grid */}
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-[var(--text-primary)]">
                  {loading ? 'Loading…' : `${jobs.length} open position${jobs.length !== 1 ? 's' : ''}`}
                </h2>
                {currentUser && !loading && jobs.length > 0 && (
                  <p className="text-xs text-[var(--text-muted)]">Match scores calculated for your skills</p>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
                </div>
              ) : jobs.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Briefcase size={40} className="mx-auto mb-4 text-[var(--text-muted)]" />
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">No jobs found</h3>
                  <p className="text-sm text-[var(--text-muted)]">Try adjusting your search filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      matchScore={matchScores[job.id]?.score}
                      matchedSkills={matchScores[job.id]?.matchedRequired}
                      missingSkills={matchScores[job.id]?.missingRequired}
                      isLoggedIn={!!currentUser}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
