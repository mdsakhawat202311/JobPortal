'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getSeekerApplications } from '@/lib/queries/applications';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ApplicationTracker } from '@/components/seeker/ApplicationTracker';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Briefcase, FileText, User, TrendingUp, Calendar,
  ChevronRight, Star, Clock
} from 'lucide-react';
import Link from 'next/link';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
export default function SeekerDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        const [{ data: sp }, appsData] = await Promise.all([
          supabase.from('seeker_profiles')
            .select('*, seeker_skills(*, skill:skills(*)), seeker_experience(*), seeker_education(*)')
            .eq('user_id', user.id)
            .single(),
          getSeekerApplications(user.id),
        ]);
        setProfile(sp);
        setApplications(appsData || []);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="container-app py-10 max-w-5xl space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const profileCompletion = (() => {
    if (!profile) return 0;
    const checks = [
      !!profile.first_name, !!profile.last_name, !!profile.headline,
      !!profile.bio, !!profile.location, !!profile.resume_url,
      (profile.seeker_skills?.length || 0) > 0,
      (profile.seeker_experience?.length || 0) > 0,
      (profile.seeker_education?.length || 0) > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  })();

  const stats = [
    { icon: FileText, label: 'Applications', value: applications.length, color: 'text-violet-400' },
    { icon: TrendingUp, label: 'Interviews', value: applications.filter(a => a.status === 'interviewing').length, color: 'text-blue-400' },
    { icon: Star, label: 'Offers', value: applications.filter(a => a.status === 'offered').length, color: 'text-emerald-400' },
    { icon: Clock, label: 'Pending', value: applications.filter(a => a.status === 'pending').length, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6">
        {/* Profile banner */}
        <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar
            src={profile?.avatar_url}
            firstName={profile?.first_name || '?'}
            lastName={profile?.last_name || ''}
            size="lg"
            ring
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              {profile ? `${profile.first_name} ${profile.last_name}` : 'Complete Your Profile'}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{profile?.headline || 'Add a headline to your profile'}</p>
            {/* Profile completion */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1.5">
                <span>Profile strength</span>
                <span className="font-semibold text-[var(--text-primary)]">{profileCompletion}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
          </div>
          <Link href="/dashboard/seeker/profile">
            <Button variant="secondary" icon={<User size={15} />}>Edit Profile</Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass-card p-4 text-center">
              <Icon size={20} className={`mx-auto mb-2 ${color}`} />
              <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications tracker */}
          <div className="lg:col-span-2">
            <ApplicationTracker applications={applications} />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick actions */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/" className="flex items-center justify-between p-3 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all group">
                  <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                    <Briefcase size={15} className="text-violet-400" /> Browse Jobs
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-muted)]" />
                </Link>
                <Link href="/dashboard/seeker/profile" className="flex items-center justify-between p-3 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all group">
                  <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                    <User size={15} className="text-blue-400" /> Update Profile
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-muted)]" />
                </Link>
              </div>
            </div>

            {/* Skills */}
            {profile?.seeker_skills?.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Your Top Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.seeker_skills.slice(0, 10).map((ss: any) => (
                    <span key={ss.skill_id} className="badge badge-primary text-xs">
                      {ss.skill?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
