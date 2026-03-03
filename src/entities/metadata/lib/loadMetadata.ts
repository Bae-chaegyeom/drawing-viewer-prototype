import { metadataSchema, type MetadataParsed } from './metadataSchema';

export async function loadMetadata(): Promise<MetadataParsed> {
  const res = await fetch('/data/metadata.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`metadata.json load failed: ${res.status}`);
  const json = await res.json();

  const parsed = metadataSchema.parse(json);

  for (const key of Object.keys(parsed.drawings)) {
    const d = parsed.drawings[key];
    (d as any).disciplines ??= {};
  }

  return parsed;
}
