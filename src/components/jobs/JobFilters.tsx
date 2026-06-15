'use client';

import { JobType } from '@/types/database.types';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SlidersHorizontal, X } from 'lucide-react';

interface Filters {
  search: string;
  jobType: string;
  location: string;
}

interface JobFiltersProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
}

const JOB_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
];

const LOCATION_SUGGESTIONS = ['Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Singapore', 'Toronto'];

export function JobFilters({ filters, onChange, onReset }: JobFiltersProps) {
  const hasActiveFilters = filters.jobType || filters.location;

  return (
    <div className="glass-card p-6 space-y-6 sticky top-20 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <SlidersHorizontal size={15} />
          Filters
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div>
        <p className="input-label mb-2">Job Type</p>
        <Select
          options={JOB_TYPE_OPTIONS}
          value={filters.jobType}
          onChange={(e) => onChange({ ...filters, jobType: e.target.value })}
        />
      </div>

      <div>
        <p className="input-label mb-2">Location</p>
        <input
          type="text"
          placeholder="City or Remote"
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          className="input text-sm"
        />
        <div className="flex flex-wrap gap-1.5 mt-4">
          {LOCATION_SUGGESTIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => onChange({ ...filters, location: loc })}
              className={`badge transition-all cursor-pointer ${filters.location === loc ? 'badge-primary' : 'badge-neutral hover:badge-primary'}`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      <hr className="divider" />

      <div>
        <p className="input-label mb-3">Salary Range</p>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Min $" className="input text-sm" min={0} step={1000} />
          <input type="number" placeholder="Max $" className="input text-sm" min={0} step={1000} />
        </div>
      </div>
    </div>
  );
}
