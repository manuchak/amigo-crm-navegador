
import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface VehicleYearFilterProps {
  minYear: number;
  maxYear: number;
  fromYear?: number;
  toYear?: number;
  selectedYears?: number[];
  onChange: (years: number[], fromYear?: number, toYear?: number) => void;
}

export const VehicleYearFilter: React.FC<VehicleYearFilterProps> = ({
  minYear,
  maxYear,
  fromYear,
  toYear,
  selectedYears = [],
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const years = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  const [multiSelect, setMultiSelect] = useState(false);
  const [draftYears, setDraftYears] = useState<number[]>(selectedYears);
  const [draftFrom, setDraftFrom] = useState<number | undefined>(fromYear ?? maxYear);
  const [draftTo, setDraftTo] = useState<number | undefined>(toYear ?? minYear);

  // For display summary
  let label = "Todos";
  if (multiSelect && draftYears.length > 0) {
    label = draftYears.sort((a, b) => b - a).join(', ');
  } else if (!multiSelect && draftFrom && draftTo) {
    label = `De ${draftFrom} a ${draftTo}`;
  }

  // UI fixes: wider popover, higher z-index, bg-white for dropdowns, proper gap from status select
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full flex justify-between items-center font-normal">
          <span className="truncate">{label}</span>
          {open ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-80 z-[99] bg-white" side="bottom" align="center" sideOffset={10}>
        <div className="flex gap-2 mb-2">
          <button
            className={`px-3 py-1 rounded text-xs font-semibold border transition-colors
                ${multiSelect ? 'bg-primary text-white border-primary' : 'bg-slate-100 text-slate-700 border-slate-300'}
              `}
            onClick={() => setMultiSelect(true)}
            type="button"
          >
            Múltiples
          </button>
          <button
            className={`px-3 py-1 rounded text-xs font-semibold border transition-colors
                ${!multiSelect ? 'bg-primary text-white border-primary' : 'bg-slate-100 text-slate-700 border-slate-300'}
              `}
            onClick={() => setMultiSelect(false)}
            type="button"
          >
            Rango
          </button>
        </div>
        {/* Multi-select mode */}
        {multiSelect ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {years.map(y => (
              <label key={y} className={`cursor-pointer px-2 py-1 rounded border text-xs
                ${draftYears.includes(y) ? 'bg-primary text-white border-primary' : 'bg-slate-100 text-slate-700 border-slate-200'}
              `}>
                <input
                  type="checkbox"
                  checked={draftYears.includes(y)}
                  onChange={() => {
                    setDraftYears(prev =>
                      prev.includes(y) ? prev.filter(val => val !== y) : [...prev, y]
                    );
                  }}
                  className="mr-1 accent-primary"
                  style={{ verticalAlign: 'middle' }}
                />
                {y}
              </label>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium">De</span>
            <select
              className="rounded border px-2 py-1 text-xs w-24 bg-white"
              value={draftFrom}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                setDraftFrom(val);
                if (draftTo !== undefined && val > (draftTo ?? minYear)) setDraftTo(val);
              }}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className="text-xs font-medium">a</span>
            <select
              className="rounded border px-2 py-1 text-xs w-24 bg-white"
              value={draftTo}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                setDraftTo(val);
                if (draftFrom !== undefined && val < (draftFrom ?? maxYear)) setDraftFrom(val);
              }}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-0"
            onClick={() => {
              setDraftYears([]);
              setDraftFrom(maxYear);
              setDraftTo(minYear);
              onChange([], maxYear, minYear);
              setOpen(false);
            }}
            type="button"
          >
            Limpiar
          </Button>
          <Button
            size="sm"
            className="w-full mt-0"
            onClick={() => {
              if (multiSelect) {
                onChange(draftYears, undefined, undefined);
              } else {
                // ensure from <= to for consistency
                const f = Math.min(draftFrom ?? maxYear, draftTo ?? minYear);
                const t = Math.max(draftFrom ?? maxYear, draftTo ?? minYear);
                onChange(
                  years.filter(y => y >= f && y <= t),
                  f, t
                );
              }
              setOpen(false);
            }}
            type="button"
          >
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VehicleYearFilter;
