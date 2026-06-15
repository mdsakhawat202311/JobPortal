'use client';

import Link from 'next/link';
import { Job } from '@/types/database.types';
import { CompanyLogo } from '@/components/ui/Avatar';
import { Badge, SkillBadge } from '@/components/ui/Badge';
import { MatchScoreRing } from '@/components/match/MatchScoreRing';
import { MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react';
import { formatSalary, formatRelativeDate, getJobTypeBadge, cn } from '@/lib/utils';

interface JobCardProps {
  job: Job & { company?: any; job_skills?: any[] };
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  isLoggedIn?: boolean;
}

export function JobCard({ job, matchScore, matchedSkills = [], missingSkills = [], isLoggedIn }: JobCardProps) {
  const requiredSkills = job.job_skills?.filter((s: any) => s.is_required).slice(0, 4) || [];
  const hasMatch = matchScore !== undefined;

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col h-full group">
      {/* Header */}
      <div className="flex items-start gap-4">
        <CompanyLogo
          src={job.company?.logo_url}
          name={job.company?.name || 'Company'}
          size={52}
        />

        <div className="flex-1 min-w-0">
          <Link
            href={`/jobs/${job.id}`}
            className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-bright)] transition-colors line-clamp-1 leading-snug block mb-2"
          >
            {job.title}
          </Link>
          <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
            {job.company?.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[var(--text-muted)]">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={11} /> {formatRelativeDate(job.created_at)}
            </span>
          </div>
        </div>

        {/* Match score ring */}
        {isLoggedIn && hasMatch && (
          <div className="shrink-0 ml-4">
            <MatchScoreRing score={matchScore!} size={58} strokeWidth={4} />
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Badge variant="primary">{getJobTypeBadge(job.job_type)}</Badge>
        {job.salary_min || job.salary_max ? (
          <Badge variant="neutral">
            <DollarSign size={10} />
            {formatSalary(job.salary_min, job.salary_max)}
          </Badge>
        ) : null}
        {job.company?.industry && (
          <Badge variant="neutral">{job.company.industry}</Badge>
        )}
      </div>

      {/* Skills preview */}
      {requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {requiredSkills.map((js: any) => {
            const name = js.skill?.name || '';
            const isMatched = matchedSkills.includes(name);
            const isMissing = missingSkills.includes(name);
            return (
              <SkillBadge
                key={js.skill_id}
                name={name}
                matched={isMatched}
                missing={isMissing && isLoggedIn}
              />
            );
          })}
          {(job.job_skills?.filter((s: any) => s.is_required).length || 0) > 4 && (
            <span className="badge badge-neutral">
              +{(job.job_skills?.filter((s: any) => s.is_required).length || 0) - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--border)] mt-auto">
        {isLoggedIn && hasMatch ? (
          <span className={cn('text-xs font-medium', matchScore! >= 80 ? 'match-excellent' : matchScore! >= 60 ? 'match-good' : matchScore! >= 40 ? 'match-fair' : 'match-low')}>
            {matchScore}% skills match
          </span>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">{job.company?.industry || 'General'}</span>
        )}
        <Link
          href={`/jobs/${job.id}`}
          className="btn btn-secondary btn-sm"
        >
          View Job <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}
