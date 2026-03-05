import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { NavDrawing, Selection } from './DrawingSelector';

function MobileSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<{
    left: number;
    top?: number;
    bottom?: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    if (!buttonRef.current) return;

    function updateMenuPosition() {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const gap = 8;
      const minMenuHeight = 180;
      const spaceBelow = viewportH - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const openUpward = spaceBelow < minMenuHeight && spaceAbove > spaceBelow;

      const maxHeight = Math.max(120, Math.min(280, openUpward ? spaceAbove : spaceBelow));
      const style = openUpward
        ? {
            left: rect.left,
            bottom: viewportH - rect.top + gap,
            width: rect.width,
            maxHeight,
          }
        : {
            left: rect.left,
            top: rect.bottom + gap,
            width: rect.width,
            maxHeight,
          };

      setMenuStyle(style);
    }

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      const inRoot = rootRef.current?.contains(target);
      const inMenu = menuRef.current?.contains(target);
      if (!inRoot && !inMenu) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full border rounded-xl px-3 py-2 bg-white text-left flex items-center justify-between"
      >
        <span className="truncate">{selected?.label ?? '-'}</span>
        <span className="text-slate-500">▾</span>
      </button>

      {open &&
        menuStyle &&
        createPortal(
          <div
            className="fixed inset-0 z-[70]"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div
              ref={menuRef}
              className="fixed rounded-xl border bg-white shadow-lg overflow-auto"
              style={{
                left: menuStyle.left,
                width: menuStyle.width,
                maxHeight: menuStyle.maxHeight,
                top: menuStyle.top,
                bottom: menuStyle.bottom,
              }}
            >
              {options.map((o) => {
                const active = o.value === selected?.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm ${
                      active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function MobileDrawingSelector({
  drawings,
  value,
  onApply,
}: {
  drawings: NavDrawing[];
  value: Selection | null;
  onApply: (next: Selection) => void;
}) {
  const [draft, setDraft] = useState<Selection | null>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const drawing = drawings.find((d) => d.id === draft?.drawingId) ?? drawings[0];
  const discipline =
    drawing?.disciplines.find((d) => d.id === draft?.disciplineId) ?? drawing?.disciplines[0];

  const regions = discipline?.regions ?? [];
  const hasRegions = regions.length > 0;
  const region = hasRegions
    ? (regions.find((r) => r.key === draft?.regionKey) ?? regions[0])
    : undefined;
  const revisions = hasRegions ? (region?.revisions ?? []) : (discipline?.revisions ?? []);
  const revision = revisions.find((r) => r.version === draft?.revVersion) ?? revisions[0];

  const drawingOptions = useMemo(
    () =>
      drawings
        .filter((d) => d.id !== '00')
        .map((d) => ({
          value: d.id,
          label: d.name,
        })),
    [drawings],
  );

  const disciplineOptions = useMemo(
    () =>
      (drawing?.disciplines ?? []).map((d) => ({
        value: d.id,
        label: d.id,
      })),
    [drawing],
  );

  const regionOptions = useMemo(
    () =>
      regions.map((r) => ({
        value: r.key,
        label: r.key,
      })),
    [regions],
  );

  const revisionOptions = useMemo(
    () =>
      revisions.map((r) => ({
        value: r.version,
        label: `${r.version} (${r.date})`,
      })),
    [revisions],
  );

  return (
    <div className="space-y-3">
      <MobileSelect
        label="도면"
        value={drawing?.id}
        options={drawingOptions}
        onChange={(drawingId) => {
          const nextDrawing = drawings.find((d) => d.id === drawingId);
          if (!nextDrawing) return;
          const nextDisc = nextDrawing.disciplines[0];
          if (!nextDisc) return;
          const nextRegion = nextDisc.regions?.[0];
          const nextRev = (nextRegion?.revisions ?? nextDisc.revisions ?? [])[0];
          setDraft({
            drawingId: nextDrawing.id,
            disciplineId: nextDisc.id,
            regionKey: nextRegion?.key,
            revVersion: nextRev?.version,
          });
        }}
      />

      <MobileSelect
        label="공종"
        value={discipline?.id}
        options={disciplineOptions}
        onChange={(disciplineId) => {
          const nextDisc = drawing?.disciplines.find((d) => d.id === disciplineId);
          if (!drawing || !nextDisc) return;
          const nextRegion = nextDisc.regions?.[0];
          const nextRev = (nextRegion?.revisions ?? nextDisc.revisions ?? [])[0];
          setDraft({
            drawingId: drawing.id,
            disciplineId: nextDisc.id,
            regionKey: nextRegion?.key,
            revVersion: nextRev?.version,
          });
        }}
      />

      {hasRegions && (
        <MobileSelect
          label="구역(Region)"
          value={region?.key}
          options={regionOptions}
          onChange={(regionKey) => {
            if (!drawing || !discipline) return;
            const nextRegion = regions.find((r) => r.key === regionKey);
            if (!nextRegion) return;
            const nextRev = nextRegion.revisions[0];
            setDraft({
              drawingId: drawing.id,
              disciplineId: discipline.id,
              regionKey: nextRegion.key,
              revVersion: nextRev?.version,
            });
          }}
        />
      )}

      <MobileSelect
        label="리비전"
        value={revision?.version}
        options={revisionOptions}
        onChange={(revVersion) => {
          if (!drawing || !discipline) return;
          setDraft({
            drawingId: drawing.id,
            disciplineId: discipline.id,
            regionKey: region?.key,
            revVersion,
          });
        }}
      />

      <button
        type="button"
        className="w-full mt-1 rounded-xl bg-indigo-600 text-white px-4 py-3 font-medium disabled:opacity-40"
        disabled={!draft?.drawingId || !draft?.disciplineId || !draft?.revVersion}
        onClick={() => {
          if (!draft?.drawingId || !draft?.disciplineId || !draft?.revVersion) return;
          onApply(draft);
        }}
      >
        도면 보기
      </button>
    </div>
  );
}
