'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  upsertSeekerProfile, addExperience, updateExperience, deleteExperience,
  addEducation, updateEducation, deleteEducation,
  addSeekerSkill, removeSeekerSkill, uploadAvatar, uploadResume
} from '@/lib/queries/profiles';
import { getAllSkills } from '@/lib/queries/jobs';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { User, Briefcase, GraduationCap, Code, Upload, Plus,
  Pencil, Trash2, Check, MapPin, Code2, FileText,
  X, Search
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const expSchema = z.object({
  company_name: z.string().min(1, 'Required'),
  job_title: z.string().min(1, 'Required'),
  start_date: z.string().min(1, 'Required'),
  end_date: z.string().optional(),
  is_current_role: z.boolean().optional(),
  description: z.string().optional(),
});

const eduSchema = z.object({
  institution_name: z.string().min(1, 'Required'),
  degree: z.string().min(1, 'Required'),
  field_of_study: z.string().optional(),
  start_date: z.string().min(1, 'Required'),
  end_date: z.string().optional(),
});

type Section = 'profile' | 'experience' | 'education' | 'skills';

export default function ProfileBuilderPage() {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [seekerSkills, setSeekerSkills] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  const [expModal, setExpModal] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [eduModal, setEduModal] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [skillSearch, setSkillSearch] = useState('');
  const [uploading, setUploading] = useState<'avatar' | 'resume' | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const [{ data: sp }, { data: exps }, { data: edus }, skills, allSkillsData] = await Promise.all([
        supabase.from('seeker_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('seeker_experience').select('*').eq('seeker_id', user.id).order('start_date', { ascending: false }),
        supabase.from('seeker_education').select('*').eq('seeker_id', user.id).order('start_date', { ascending: false }),
        supabase.from('seeker_skills').select('*, skill:skills(*)').eq('seeker_id', user.id),
        getAllSkills(),
      ]);

      setProfile(sp);
      setExperiences(exps || []);
      setEducations(edus || []);
      setSeekerSkills(skills.data || []);
      setAllSkills(allSkillsData || []);
      if (sp) reset({ ...sp, github_url: sp.github_url || '' });
      setLoading(false);
    };
    init();
  }, [reset]);

  const onProfileSave = async (data: z.infer<typeof profileSchema>) => {
    setSaving(true);
    try {
      await upsertSeekerProfile({ user_id: currentUserId, ...data });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleAvatarUpload = async (file: File) => {
    setUploading('avatar');
    try {
      const url = await uploadAvatar(currentUserId, file);
      await upsertSeekerProfile({ user_id: currentUserId, avatar_url: url });
      setProfile((p: any) => ({ ...p, avatar_url: url }));
    } catch (err) { console.error(err); }
    setUploading(null);
  };

  const handleResumeUpload = async (file: File) => {
    setUploading('resume');
    try {
      const url = await uploadResume(currentUserId, file);
      if (url) {
        await upsertSeekerProfile({ user_id: currentUserId, resume_url: url });
        setProfile((p: any) => ({ ...p, resume_url: url }));
      }
    } catch (err) { console.error(err); }
    setUploading(null);
  };

  const expForm = useForm<z.infer<typeof expSchema>>({ resolver: zodResolver(expSchema) });
  const onExpSave = async (data: z.infer<typeof expSchema>) => {
    try {
      if (expModal.editing) {
        const updated = await updateExperience(expModal.editing.id, data);
        setExperiences(e => e.map(x => x.id === updated.id ? updated : x));
      } else {
        const created = await addExperience({ ...data, seeker_id: currentUserId, description: data.description ?? null, end_date: data.end_date ?? null, is_current_role: data.is_current_role ?? false });
        setExperiences(e => [created, ...e]);
      }
      setExpModal({ open: false });
      expForm.reset();
    } catch (err) { console.error(err); }
  };

  const deleteExp = async (id: string) => {
    await deleteExperience(id);
    setExperiences(e => e.filter(x => x.id !== id));
  };

  const eduForm = useForm<z.infer<typeof eduSchema>>({ resolver: zodResolver(eduSchema) });
  const onEduSave = async (data: z.infer<typeof eduSchema>) => {
    try {
      if (eduModal.editing) {
        const updated = await updateEducation(eduModal.editing.id, data);
        setEducations(e => e.map(x => x.id === updated.id ? updated : x));
      } else {
        const created = await addEducation({ ...data, seeker_id: currentUserId, field_of_study: data.field_of_study ?? null, end_date: data.end_date ?? null });
        setEducations(e => [created, ...e]);
      }
      setEduModal({ open: false });
      eduForm.reset();
    } catch (err) { console.error(err); }
  };

  const deleteEdu = async (id: string) => {
    await deleteEducation(id);
    setEducations(e => e.filter(x => x.id !== id));
  };

  const addSkill = async (skillId: string) => {
    if (seekerSkills.some(s => s.skill_id === skillId)) return;
    const added = await addSeekerSkill({ seeker_id: currentUserId, skill_id: skillId, proficiency: 'intermediate', years_of_experience: null });
    setSeekerSkills(s => [...s, added]);
  };

  const removeSkill = async (skillId: string) => {
    await removeSeekerSkill(currentUserId, skillId);
    setSeekerSkills(s => s.filter(x => x.skill_id !== skillId));
  };

  const filteredSkills = allSkills.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !seekerSkills.some(ss => ss.skill_id === s.id)
  ).slice(0, 20);

  const SECTIONS = [
    { id: 'profile' as Section, label: 'Basic Info', icon: User },
    { id: 'experience' as Section, label: 'Experience', icon: Briefcase },
    { id: 'education' as Section, label: 'Education', icon: GraduationCap },
    { id: 'skills' as Section, label: 'Skills', icon: Code },
  ];

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">Profile Builder</h1>
          <p className="text-[var(--text-secondary)] mt-1">Build your professional profile to attract employers.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-52 shrink-0">
            <nav className="glass-card p-3 space-y-1">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                    activeSection === id
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent-bright)] border border-[var(--border-accent)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                  )}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1">
            {activeSection === 'profile' && (
              <div className="glass-card p-6 space-y-6">
                <h2 className="font-semibold text-[var(--text-primary)]">Basic Information</h2>

                <div className="flex items-center gap-4">
                  <Avatar src={profile?.avatar_url} firstName={profile?.first_name || '?'} lastName={profile?.last_name || ''} size="xl" ring />
                  <div>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
                    <Button variant="ghost" size="sm" icon={<Upload size={14} />} loading={uploading === 'avatar'} onClick={() => avatarInputRef.current?.click()}>
                      Upload Photo
                    </Button>
                    <p className="text-xs text-[var(--text-muted)] mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onProfileSave)} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="First name" error={errors.first_name?.message} {...register('first_name')} />
                    <Input label="Last name" error={errors.last_name?.message} {...register('last_name')} />
                  </div>
                  <Input label="Professional headline" placeholder="e.g. Senior React Developer at Stripe" {...register('headline')} />
                  <Textarea label="Bio" placeholder="Tell employers about yourself..." rows={4} {...register('bio')} />
                  <Input label="Location" placeholder="San Francisco, CA" icon={<MapPin size={14} />} {...register('location')} />
                  <Input label="GitHub URL" placeholder="https://github.com/username" icon={<Code2 size={14} />} error={errors.github_url?.message} {...register('github_url')} />

                  <div>
                    <p className="input-label mb-2">Resume / CV</p>
                    <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => e.target.files?.[0] && handleResumeUpload(e.target.files[0])} />
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="sm" icon={<FileText size={14} />} loading={uploading === 'resume'} onClick={() => resumeInputRef.current?.click()} type="button">
                        {profile?.resume_url ? 'Replace Resume' : 'Upload Resume'}
                      </Button>
                      {profile?.resume_url && (
                        <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent-bright)] hover:underline">
                          View current
                        </a>
                      )}
                    </div>
                  </div>

                  <Button type="submit" loading={saving} icon={saved ? <Check size={15} /> : undefined}>
                    {saved ? 'Saved!' : 'Save Profile'}
                  </Button>
                </form>
              </div>
            )}

            {/* ── EXPERIENCE ── */}
            {activeSection === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-[var(--text-primary)]">Work Experience</h2>
                  <Button size="sm" icon={<Plus size={14} />} onClick={() => { expForm.reset(); setExpModal({ open: true }); }}>Add</Button>
                </div>
                {experiences.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <Briefcase size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
                    <p className="text-sm text-[var(--text-muted)]">No experience added yet.</p>
                  </div>
                ) : (
                  experiences.map(exp => (
                    <div key={exp.id} className="glass-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{exp.job_title}</p>
                          <p className="text-sm text-[var(--accent-bright)]">{exp.company_name}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {formatDate(exp.start_date)} — {exp.is_current_role ? 'Present' : exp.end_date ? formatDate(exp.end_date) : ''}
                          </p>
                          {exp.description && <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{exp.description}</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => { expForm.reset(exp); setExpModal({ open: true, editing: exp }); }} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-all"><Pencil size={14} /></button>
                          <button onClick={() => deleteExp(exp.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-[rgba(239,68,68,0.08)] transition-all"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── EDUCATION ── */}
            {activeSection === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-[var(--text-primary)]">Education</h2>
                  <Button size="sm" icon={<Plus size={14} />} onClick={() => { eduForm.reset(); setEduModal({ open: true }); }}>Add</Button>
                </div>
                {educations.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <GraduationCap size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
                    <p className="text-sm text-[var(--text-muted)]">No education added yet.</p>
                  </div>
                ) : (
                  educations.map(edu => (
                    <div key={edu.id} className="glass-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</p>
                          <p className="text-sm text-[var(--accent-bright)]">{edu.institution_name}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {formatDate(edu.start_date)} — {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => { eduForm.reset(edu); setEduModal({ open: true, editing: edu }); }} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-all"><Pencil size={14} /></button>
                          <button onClick={() => deleteEdu(edu.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-[rgba(239,68,68,0.08)] transition-all"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── SKILLS ── */}
            {activeSection === 'skills' && (
              <div className="space-y-5">
                <h2 className="font-semibold text-[var(--text-primary)]">Skills</h2>

                {/* Current skills */}
                {seekerSkills.length > 0 && (
                  <div className="glass-card p-5">
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">Your skills ({seekerSkills.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {seekerSkills.map(ss => (
                        <div key={ss.skill_id} className="flex items-center gap-1 badge badge-primary pr-1.5">
                          <span>{ss.skill?.name}</span>
                          <button onClick={() => removeSkill(ss.skill_id)} className="ml-0.5 hover:text-red-400 transition-colors"><X size={11} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search and add */}
                <div className="glass-card p-5">
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">Add skills</p>
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={skillSearch}
                      onChange={e => setSkillSearch(e.target.value)}
                      className="input pl-9 text-sm"
                    />
                  </div>
                  {filteredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {filteredSkills.map(s => (
                        <button key={s.id} onClick={() => addSkill(s.id)} className="badge badge-neutral hover:badge-primary cursor-pointer transition-all">
                          <Plus size={10} /> {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Experience Modal */}
      <Modal open={expModal.open} onClose={() => setExpModal({ open: false })} title={expModal.editing ? 'Edit Experience' : 'Add Experience'} size="md">
        <form onSubmit={expForm.handleSubmit(onExpSave)} className="space-y-4">
          <Input label="Company" placeholder="Acme Corp" error={expForm.formState.errors.company_name?.message} {...expForm.register('company_name')} />
          <Input label="Job title" placeholder="Software Engineer" error={expForm.formState.errors.job_title?.message} {...expForm.register('job_title')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date" type="month" error={expForm.formState.errors.start_date?.message} {...expForm.register('start_date')} />
            <Input label="End date" type="month" hint="Leave blank if current" {...expForm.register('end_date')} />
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input type="checkbox" className="accent-violet-600" {...expForm.register('is_current_role')} />
            Currently working here
          </label>
          <Textarea label="Description" placeholder="Describe your role..." rows={3} {...expForm.register('description')} />
          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setExpModal({ open: false })}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={expForm.formState.isSubmitting}>Save</Button>
          </div>
        </form>
      </Modal>

      {/* Education Modal */}
      <Modal open={eduModal.open} onClose={() => setEduModal({ open: false })} title={eduModal.editing ? 'Edit Education' : 'Add Education'} size="md">
        <form onSubmit={eduForm.handleSubmit(onEduSave)} className="space-y-4">
          <Input label="Institution" placeholder="MIT" error={eduForm.formState.errors.institution_name?.message} {...eduForm.register('institution_name')} />
          <Input label="Degree" placeholder="Bachelor of Science" error={eduForm.formState.errors.degree?.message} {...eduForm.register('degree')} />
          <Input label="Field of study" placeholder="Computer Science" {...eduForm.register('field_of_study')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date" type="month" error={eduForm.formState.errors.start_date?.message} {...eduForm.register('start_date')} />
            <Input label="End date" type="month" {...eduForm.register('end_date')} />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setEduModal({ open: false })}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={eduForm.formState.isSubmitting}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
