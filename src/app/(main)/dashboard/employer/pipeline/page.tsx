'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCompanyApplications, updateApplicationStatus, scheduleInterview } from '@/lib/queries/applications';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApplicationStatus } from '@/types/database.types';
import { MatchScoreRing } from '@/components/match/MatchScoreRing';
import { computeMatchScore } from '@/lib/queries/match';
import { Calendar, User, ChevronRight, Plus, Star } from 'lucide-react';
import { formatRelativeDate, getStatusColor } from '@/lib/utils';

const COLUMNS: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: 'pending',     label: 'New',          color: 'text-amber-400 border-amber-400/20 bg-amber-400/5' },
  { id: 'reviewing',  label: 'Reviewing',     color: 'text-blue-400 border-blue-400/20 bg-blue-400/5' },
  { id: 'interviewing', label: 'Interviewing', color: 'text-violet-400 border-violet-400/20 bg-violet-400/5' },
  { id: 'offered',    label: 'Offered',        color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' },
  { id: 'rejected',   label: 'Rejected',       color: 'text-red-400 border-red-400/20 bg-red-400/5' },
];

export default function PipelinePage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState('');
  const [dragging, setDragging] = useState<string | null>(null);
  const [scheduleModal, setScheduleModal] = useState<{ open: boolean; app?: any }>({ open: false });
  const [schedulingFor, setSchedulingFor] = useState('');
  const [schedData, setSchedData] = useState({ scheduled_at: '', interview_type: 'technical', notes: '' });
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ep } = await supabase.from('employer_profiles').select('company_id, user_id').eq('user_id', user.id).single();
      if (!ep?.company_id) return;
      setCompanyId(ep.company_id);
      const apps = await getCompanyApplications(ep.company_id);
      setApplications(apps || []);

      // compute match scores for all applicants
      const scores: Record<string, number> = {};
      for (const app of (apps || [])) {
        try {
          const result = await computeMatchScore(app.seeker_id, app.job_id);
          scores[app.id] = result.score;
        } catch (_) {}
      }
      setMatchScores(scores);
      setLoading(false);
    };
    init();
  }, []);

  const moveCard = async (appId: string, newStatus: ApplicationStatus) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    await updateApplicationStatus(appId, newStatus);
  };

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDragging(appId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, colId: ApplicationStatus) => {
    e.preventDefault();
    if (dragging) moveCard(dragging, colId);
    setDragging(null);
  };

  const openScheduleModal = (app: any) => {
    setSchedulingFor(app.id);
    setScheduleModal({ open: true, app });
  };

  const handleSchedule = async () => {
    if (!scheduleModal.app || !schedData.scheduled_at) return;
    const { data: { user } } = await supabase.auth.getUser();
    await scheduleInterview({
      application_id: scheduleModal.app.id,
      interviewer_id: user!.id,
      scheduled_at: new Date(schedData.scheduled_at).toISOString(),
      interview_type: schedData.interview_type as any,
      notes: schedData.notes,
    });
    await moveCard(scheduleModal.app.id, 'interviewing');
    setScheduleModal({ open: false });
    setSchedData({ scheduled_at: '', interview_type: 'technical', notes: '' });
  };

  if (loading) {
    return (
      <div>
        <div className="container-app">
          <Skeleton className="h-8 w-48 mb-6 rounded" />
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(c => <Skeleton key={c.id} className="w-72 h-96 shrink-0 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container-app">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Hiring Pipeline</h1>
          <p className="text-[var(--text-secondary)] mt-1">Drag and drop cards to update candidate status.</p>
        </div>

        {/* Kanban board */}
        <div className="flex gap-4 overflow-x-auto pb-6" style={{ minHeight: '70vh' }}>
          {COLUMNS.map(col => {
            const colApps = applications.filter(a => a.status === col.id);
            return (
              <div
                key={col.id}
                className="shrink-0 w-72 flex flex-col gap-3"
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={e => handleDrop(e, col.id)}
              >
                {/* Column header */}
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${col.color}`}>
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.1)] font-bold">{colApps.length}</span>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3 min-h-[120px]">
                  {colApps.map(app => (
                    <div
                      key={app.id}
                      className="kanban-card"
                      draggable
                      onDragStart={e => handleDragStart(e, app.id)}
                    >
                      {/* Applicant info */}
                      <div className="flex items-start gap-2.5 mb-3">
                        <Avatar
                          src={app.seeker_profile?.avatar_url}
                          firstName={app.seeker_profile?.first_name || '?'}
                          lastName={app.seeker_profile?.last_name || ''}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                            {app.seeker_profile?.first_name} {app.seeker_profile?.last_name}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] truncate">{app.job?.title}</p>
                        </div>
                        {matchScores[app.id] !== undefined && (
                          <MatchScoreRing score={matchScores[app.id]} size={36} strokeWidth={3} />
                        )}
                      </div>

                      <p className="text-xs text-[var(--text-muted)] mb-3">
                        Applied {formatRelativeDate(app.applied_at)}
                      </p>

                      {/* Move actions */}
                      <div className="flex gap-1.5 flex-wrap">
                        {col.id !== 'interviewing' && col.id !== 'offered' && col.id !== 'rejected' && (
                          <button
                            onClick={() => openScheduleModal(app)}
                            className="btn btn-secondary btn-sm text-xs flex-1"
                          >
                            <Calendar size={11} /> Schedule
                          </button>
                        )}
                        {col.id !== 'offered' && col.id !== 'rejected' && (
                          <button
                            onClick={() => moveCard(app.id, col.id === 'pending' ? 'reviewing' : col.id === 'reviewing' ? 'interviewing' : 'offered')}
                            className="btn btn-ghost btn-sm text-xs flex-1"
                          >
                            Advance <ChevronRight size={11} />
                          </button>
                        )}
                        {col.id !== 'rejected' && (
                          <button onClick={() => moveCard(app.id, 'rejected')} className="text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors px-1">✕</button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Drop zone indicator */}
                  {colApps.length === 0 && (
                    <div className="border-2 border-dashed border-[var(--border)] rounded-xl h-24 flex items-center justify-center text-xs text-[var(--text-disabled)]">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <Modal open={scheduleModal.open} onClose={() => setScheduleModal({ open: false })} title="Schedule Interview" size="sm">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[var(--accent-subtle)] border border-[var(--border-accent)] text-sm text-[var(--accent-bright)]">
            <p className="font-medium">{scheduleModal.app?.seeker_profile?.first_name} {scheduleModal.app?.seeker_profile?.last_name}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">for {scheduleModal.app?.job?.title}</p>
          </div>
          <Input
            label="Date & Time"
            type="datetime-local"
            value={schedData.scheduled_at}
            onChange={e => setSchedData(d => ({ ...d, scheduled_at: e.target.value }))}
            required
          />
          <Select
            label="Interview Type"
            value={schedData.interview_type}
            onChange={e => setSchedData(d => ({ ...d, interview_type: e.target.value }))}
            options={[
              { value: 'technical', label: 'Technical' },
              { value: 'cultural', label: 'Culture Fit' },
              { value: 'hr', label: 'HR Screen' },
              { value: 'final', label: 'Final Round' },
            ]}
          />
          <Textarea
            label="Notes (optional)"
            placeholder="Instructions for the candidate..."
            value={schedData.notes}
            onChange={e => setSchedData(d => ({ ...d, notes: e.target.value }))}
            rows={3}
          />
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setScheduleModal({ open: false })}>Cancel</Button>
            <Button className="flex-1" onClick={handleSchedule} icon={<Calendar size={15} />}>Schedule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
