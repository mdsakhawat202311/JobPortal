'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getJobById } from '@/lib/queries/jobs';
import { computeMatchScore } from '@/lib/queries/match';
import { hasApplied } from '@/lib/queries/applications';
import { CompanyLogo } from '@/components/ui/Avatar';
import { Badge, SkillBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MatchScoreRing } from '@/components/match/MatchScoreRing';
import { ApplyModal } from '@/components/jobs/ApplyModal';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  MapPin, Clock, DollarSign, Globe, Briefcase,
  CheckCircle, XCircle, ExternalLink
} from 'lucide-react';
import {
  formatSalary, formatRelativeDate, getJobTypeBadge,
  getMatchScoreLabel, getMatchScoreColor
} from '@/lib/utils';
import Link from 'next/link';

interface JobDetailsPaneProps {
  jobId: string;
}

export function JobDetailsPane({ jobId }: JobDetailsPaneProps) {
  const [job, setJob] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [applied, setApplied] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!isMounted) return;
      setCurrentUser(user);

      try {
        const jobData = await getJobById(jobId);
        if (!isMounted) return;
        setJob(jobData);

        if (user) {
          const { data: u } = await supabase.from('users').select('role').eq('id', user.id).single();
          if (!isMounted) return;
          setDbUser(u);

          const { data: sp } = await supabase.from('seeker_profiles').select('user_id').eq('user_id', user.id).single();
          if (sp && isMounted) {
            const [matchData, appliedData] = await Promise.all([
              computeMatchScore(user.id, jobId),
              hasApplied(jobId, user.id),
            ]);
            if (!isMounted) return;
            setMatch(matchData);
            setApplied(appliedData);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    init();

    return () => { isMounted = false; };
  }, [jobId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex gap-4">
          <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-10 text-center">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Job not found</h3>
        <p className="text-[var(--text-muted)]">This job may have been closed or removed.</p>
      </div>
    );
  }

  const requiredSkills = job.job_skills?.filter((s: any) => s.is_required) || [];
  const optionalSkills = job.job_skills?.filter((s: any) => !s.is_required) || [];
  const isSeeker = dbUser?.role === 'seeker' || !currentUser;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[var(--bg-card)] custom-scrollbar">
      {/* Sticky Header with Apply Action */}
      <div className="sticky top-0 z-10 bg-[var(--bg-card)] border-b border-[var(--border)] p-5 md:p-6 shadow-sm">
        <h1 className="text-xl md:text-2xl font-display font-bold text-[var(--text-primary)] leading-tight mb-2">
          {job.title}
        </h1>
        <div className="flex items-center justify-between gap-4">
          <Link href={`/company/${job.company_id}`} className="text-[var(--accent-bright)] hover:underline font-medium block">
            {job.company?.name}
          </Link>
          <div className="shrink-0">
             {!currentUser ? (
                <Link href={`/login?redirectTo=/jobs/${jobId}`}>
                  <Button size="sm">Sign In to Apply</Button>
                </Link>
              ) : applied ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                  <CheckCircle size={16} /> Applied
                </div>
              ) : isSeeker ? (
                <Button size="sm" onClick={() => setApplyOpen(true)}>
                  Apply Now
                </Button>
              ) : null}
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-8">
        {/* Key Info */}
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-[var(--text-muted)]">
          {job.location && <span className="flex items-center gap-1.5"><MapPin size={15} />{job.location}</span>}
          <span className="flex items-center gap-1.5"><Briefcase size={15} />{getJobTypeBadge(job.job_type)}</span>
          <span className="flex items-center gap-1.5"><Clock size={15} />{formatRelativeDate(job.created_at)}</span>
          {(job.salary_min || job.salary_max) && (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <DollarSign size={15} />{formatSalary(job.salary_min, job.salary_max)}
            </span>
          )}
        </div>

        {/* Match Score (if logged in) */}
        {currentUser && match && (
          <div className="flex items-center gap-5 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]">
            <MatchScoreRing score={match.score} size={64} strokeWidth={5} />
            <div>
              <p className={`font-bold ${getMatchScoreColor(match.score)} text-lg`}>
                {getMatchScoreLabel(match.score)}
              </p>
              <div className="flex items-center gap-4 mt-1 text-xs">
                {match.matchedRequired.length > 0 && (
                  <span className="text-[var(--text-secondary)]">
                    <strong className="text-emerald-400">{match.matchedRequired.length}</strong> matched
                  </span>
                )}
                {match.missingRequired.length > 0 && (
                  <span className="text-[var(--text-secondary)]">
                    <strong className="text-red-400">{match.missingRequired.length}</strong> missing
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Job Description</h2>
          <div
            className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-4 whitespace-pre-wrap"
            style={{ wordBreak: 'break-word' }}
          >
            {job.description}
          </div>
        </div>

        {/* Skills */}
        {(requiredSkills.length > 0 || optionalSkills.length > 0) && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Skills & Requirements</h2>
            {requiredSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map((js: any) => {
                    const name = js.skill?.name || '';
                    const isMatched = match?.matchedRequired?.includes(name);
                    const isMissing = match?.missingRequired?.includes(name);
                    return (
                      <div key={js.skill_id} className="flex items-center gap-1.5">
                        {isMatched && <CheckCircle size={12} className="text-emerald-400" />}
                        {isMissing && currentUser && <XCircle size={12} className="text-red-400" />}
                        <SkillBadge name={name} matched={isMatched} missing={isMissing && !!currentUser} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {optionalSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Nice to Have</p>
                <div className="flex flex-wrap gap-2">
                  {optionalSkills.map((js: any) => (
                    <SkillBadge key={js.skill_id} name={js.skill?.name || ''} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Company Info Footer */}
        <div className="pt-6 border-t border-[var(--border)] flex flex-col items-center text-center">
           <CompanyLogo src={job.company?.logo_url} name={job.company?.name || ''} size={64} />
           <h3 className="font-semibold text-[var(--text-primary)] mt-3 mb-1">{job.company?.name}</h3>
           {job.company?.industry && <Badge variant="neutral" className="mb-3">{job.company.industry}</Badge>}
           {job.company?.website_url && (
            <a
              href={job.company.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-bright)] transition-colors"
            >
              <Globe size={13} /> Visit website <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        job={job}
        seekerId={currentUser?.id || ''}
        onApplied={() => { setApplied(true); setApplyOpen(false); }}
      />
    </div>
  );
}
