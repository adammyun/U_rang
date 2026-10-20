'use client';

import { MAP_APPEARANCES, type MapMode } from '@/src/features/map/appearance';

export default function MapAppearanceOptions({ mode, onChange }: {
  mode: MapMode;
  onChange: (mode: MapMode) => void;
}) {
  return <div className="map-appearance-options">
    {MAP_APPEARANCES.map(item => <button
      key={item.mode}
      type="button"
      className={mode === item.mode ? 'selected' : ''}
      aria-pressed={mode === item.mode}
      onClick={() => onChange(item.mode)}
    >
      <strong>{item.label}</strong>
      <span>{item.description}</span>
    </button>)}
  </div>;
}
