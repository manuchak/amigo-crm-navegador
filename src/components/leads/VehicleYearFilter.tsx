
import React, { useState, useEffect } from 'react';
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

  // Default mode: 'range' to match the screenshot, user requirement
  const [multiSelect, setMultiSelect] = useState(false);

  // Draft state for popover 
  const [draftYears, setDraftYears] = useState<number[]>(selectedYears);
  const [draftFrom, setDraftFrom] = useState<number>(fromYear ?? maxYear);
  const [draftTo, setDraftTo] = useState<number>(toYear ?? minYear);

  // Sync with props when popover reopens or props change
  useEffect(() => {
    if (open) {
      setDraftYears(selectedYears || []);
      setDraftFrom(fromYear ?? maxYear);
      setDraftTo(toYear ?? minYear);
    }
  }, [open, selectedYears, fromYear, toYear, maxYear, minYear]);

  // Label for display summary
  let label = "Todos";
  if (multiSelect && draftYears && draftYears.length > 0) {
    label = draftYears.sort((a, b) => b - a).join(', ');
  } else if (!multiSelect && draftFrom && draftTo) {
    label = `De ${draftFrom} a ${draftTo}`;
  }

  // Tab styling helpers
  function tabClass(isActive: boolean) {
    return `
      flex-1 px-3 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer
      ${isActive 
        ? 'bg-primary text-white border-primary shadow' 
        : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}
    `.replace(/\s+/g, ' ');
  }

  // UI fixes: wider popover, higher z-index, bg-white for dropdowns, proper gap from status select.
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full flex justify-between items-center font-normal"
          type="button"
        >
          <span className="truncate">{label}</span>
          {open ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-80 z-[1002] bg-white shadow-xl" side="bottom" align="center" sideOffset={10}>
        {/* Tab Switch */}
        <div className="flex gap-2 mb-3 w-full">
          <button
            className={tabClass(true === multiSelect)}
            style={{ outline: 'none', boxShadow: multiSelect ? '0 0 0 2px var(--tw-ring-color)' : 'none' }}
            onClick={() => setMultiSelect(true)}
            type="button"
            tabIndex={0}
            aria-label="Seleccionar múltiples años"
          >
            Múltiples
          </button>
          <button
            className={tabClass(false === multiSelect)}
            style={{ outline: 'none', boxShadow: !multiSelect ? '0 0 0 2px var(--tw-ring-color)' : 'none' }}
            onClick={() => setMultiSelect(false)}
            type="button"
            tabIndex={0}
            aria-label="Seleccionar un rango de años"
          >
            Rango
          </button>
        </div>
        {/* MULTISELECT */}
        {multiSelect ? (
          <div className="flex flex-wrap gap-2 mb-3 min-h-[38px]" key="multiselect">
            {years.map(y => (
              <label key={y} className={`cursor-pointer px-2 py-1 rounded border text-xs transition-colors
                ${draftYears.includes(y) ? 'bg-primary text-white border-primary' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}
              `}>
                <input
                  type="checkbox"
                  checked={draftYears.includes(y)}
                  onChange={() => {
                    setDraftYears(prev =>
                      prev.includes(y)
                        ? prev.filter(val => val !== y)
                        : [...prev, y]
                    );
                  }}
                  className="mr-1 accent-primary"
                  style={{ verticalAlign: 'middle' }}
                  tabIndex={-1}
                  aria-label={`Seleccionar año ${y}`}
                />
                {y}
              </label>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3 w-full" key="range">
            <span className="text-xs font-medium">De</span>
            <div className="relative w-24">
              <select
                className="rounded border px-2 py-1 text-xs w-full bg-white z-20 focus:z-30 appearance-none cursor-pointer"
                style={{ minWidth: 60 }}
                value={draftFrom}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  setDraftFrom(val);
                  // Sync to guarantee from <= to
                  if (val > (draftTo ?? minYear)) setDraftTo(val);
                }}
                aria-label="Año desde"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {/* chevron */}
              <ChevronDown className="absolute top-1/2 right-2 w-4 h-4 text-muted-foreground pointer-events-none -translate-y-1/2" />
            </div>
            <span className="text-xs font-medium">a</span>
            <div className="relative w-24">
              <select
                className="rounded border px-2 py-1 text-xs w-full bg-white z-20 focus:z-30 appearance-none cursor-pointer"
                style={{ minWidth: 60 }}
                value={draftTo}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  setDraftTo(val);
                  if (val < (draftFrom ?? maxYear)) setDraftFrom(val);
                }}
                aria-label="Año hasta"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 right-2 w-4 h-4 text-muted-foreground pointer-events-none -translate-y-1/2" />
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-1">
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
