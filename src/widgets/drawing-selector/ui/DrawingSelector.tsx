type NavRevision = { version: string; date: string; changesCount: number };
type NavRegion = { key: string; revisions: NavRevision[] };
type NavDiscipline = { id: string; regions?: NavRegion[]; revisions?: NavRevision[] };
type NavDrawing = { id: string; name: string; disciplines: NavDiscipline[] };

type Selection = {
  drawingId: string;
  disciplineId: string;
  regionKey?: string;
  revVersion?: string;
};

export function DrawingSelector({
  drawings,
  value,
  onChange,
}: {
  drawings: NavDrawing[];
  value: Selection | null;
  onChange: (next: Selection) => void;
}) {
  const drawing = drawings.find((d) => d.id === value?.drawingId) ?? drawings[0];
  const discipline =
    drawing?.disciplines.find((d) => d.id === value?.disciplineId) ?? drawing?.disciplines[0];

  const regions = discipline?.regions ?? [];
  const hasRegions = regions.length > 0;

  const region = hasRegions
    ? (regions.find((r) => r.key === value?.regionKey) ?? regions[0])
    : undefined;

  const revisions = hasRegions ? (region?.revisions ?? []) : (discipline?.revisions ?? []);
  const revision = revisions.find((r) => r.version === value?.revVersion) ?? revisions[0];

  return (
    <div className="space-y-3">
      {/* 도면 */}
      <div>
        <div className="text-xs text-slate-500 mb-1">도면</div>
        <select
          className="w-full border rounded-xl px-3 py-2"
          value={drawing?.id}
          onChange={(e) => {
            const nextDrawing = drawings.find((d) => d.id === e.target.value)!;
            const nextDisc = nextDrawing.disciplines[0];
            const nextRegion = nextDisc.regions?.[0];
            const nextRev = (nextRegion?.revisions ?? nextDisc.revisions ?? [])[0];

            onChange({
              drawingId: nextDrawing.id,
              disciplineId: nextDisc.id,
              regionKey: nextRegion?.key,
              revVersion: nextRev?.version,
            });
          }}
        >
          {drawings
            .filter((d) => d.id !== '00')
            .map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
        </select>
      </div>

      {/* 공종 */}
      <div>
        <div className="text-xs text-slate-500 mb-1">공종</div>
        <select
          className="w-full border rounded-xl px-3 py-2"
          value={discipline?.id}
          onChange={(e) => {
            const nextDisc = drawing.disciplines.find((d) => d.id === e.target.value)!;
            const nextRegion = nextDisc.regions?.[0];
            const nextRev = (nextRegion?.revisions ?? nextDisc.revisions ?? [])[0];

            onChange({
              drawingId: drawing.id,
              disciplineId: nextDisc.id,
              regionKey: nextRegion?.key,
              revVersion: nextRev?.version,
            });
          }}
        >
          {drawing?.disciplines.map((d) => (
            <option key={d.id} value={d.id}>
              {d.id}
            </option>
          ))}
        </select>
      </div>

      {/* Region (있을 때만) */}
      {hasRegions && (
        <div>
          <div className="text-xs text-slate-500 mb-1">구역(Region)</div>
          <select
            className="w-full border rounded-xl px-3 py-2"
            value={region?.key}
            onChange={(e) => {
              const nextRegion = regions.find((r) => r.key === e.target.value)!;
              const nextRev = nextRegion.revisions[0];
              onChange({
                drawingId: drawing.id,
                disciplineId: discipline.id,
                regionKey: nextRegion.key,
                revVersion: nextRev?.version,
              });
            }}
          >
            {regions.map((r) => (
              <option key={r.key} value={r.key}>
                {r.key}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Revision */}
      <div>
        <div className="text-xs text-slate-500 mb-1">리비전</div>
        <select
          className="w-full border rounded-xl px-3 py-2"
          value={revision?.version}
          onChange={(e) => {
            onChange({
              drawingId: drawing.id,
              disciplineId: discipline.id,
              regionKey: region?.key,
              revVersion: e.target.value,
            });
          }}
        >
          {revisions.map((r) => (
            <option key={r.version} value={r.version}>
              {r.version} ({r.date})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
