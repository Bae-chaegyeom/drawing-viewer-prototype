export function OverlayControls({
  availableDisciplines,
  baseDiscipline,
  onChangeBase,
  overlayEnabled,
  onToggleOverlay,
  opacityByDiscipline,
  onChangeOpacity,
  overlayAvailable,
}: {
  availableDisciplines: string[];
  baseDiscipline: string;
  onChangeBase: (v: string) => void;
  overlayEnabled: Record<string, boolean>;
  onToggleOverlay: (k: string) => void;
  opacityByDiscipline: Record<string, number>;
  onChangeOpacity: (k: string, v: number) => void;
  overlayAvailable: Record<string, boolean>;
}) {
  return (
    <div className="p-5 space-y-6">
      <div>
        <div className="font-semibold mb-2">기준 공종</div>
        <select
          className="w-full border rounded-xl px-3 py-2"
          value={baseDiscipline}
          onChange={(e) => onChangeBase(e.target.value)}
        >
          {availableDisciplines.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="font-semibold mb-2">공종 오버레이</div>
        <div className="space-y-4">
          {availableDisciplines.map((d) => {
            const isBase = d === baseDiscipline;
            const enabled = isBase ? true : (overlayEnabled[d] ?? false);
            const opacity = isBase ? 1 : (opacityByDiscipline[d] ?? 0.7);
            const available = isBase ? true : (overlayAvailable[d] ?? false);

            return (
              <div key={d} className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    disabled={isBase || !available}
                    onChange={() => onToggleOverlay(d)}
                  />
                  <span className="font-medium">{d}</span>
                  {isBase && <span className="text-xs text-indigo-600 ml-1">기준</span>}
                  {!isBase && !available && (
                    <span className="text-xs text-slate-400 ml-2">도면 없음</span>
                  )}
                  <span className="ml-auto text-sm text-slate-500">
                    {Math.round(opacity * 100)}%
                  </span>
                </label>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={opacity}
                  disabled={isBase || !enabled}
                  onChange={(e) => onChangeOpacity(d, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
