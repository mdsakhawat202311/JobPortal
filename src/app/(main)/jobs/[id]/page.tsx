'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { ArrowLeft } from 'lucide-react';
import { JobDetailsPane } from '@/components/jobs/JobDetailsPane';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <div className="py-10 bg-[var(--bg-base)] min-h-screen">
      <div className="container-app max-w-4xl">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Jobs
        </button>

        <div className="glass-card overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm bg-[var(--bg-card)]">
          <JobDetailsPane jobId={id} />
        </div>
      </div>
    </div>
  );
}
