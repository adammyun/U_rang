'use client';

import { Layers3, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { emotions, type Emotion } from '@/lib/types';
import { RECENT_MEMORY_YEARS } from '@/src/features/memories/filters';
import type { MemoryFilters } from '@/src/features/memories/schemas';
import MemoryScopeSwitch from './memory-scope-switch';

export default function MemoryFilterSheet({
  filters,
  onChange,
  mapMode,
  onMapModeChange,
  scope = 'all',
}: {
  filters: MemoryFilters;
  onChange: (filters: MemoryFilters) => void;
  mapMode: 'calm' | 'detail';
  onMapModeChange: (mode: 'calm' | 'detail') => void;
  scope?: 'all' | 'mine';
}) {
  const [open, setOpen] = useState(false);
  const activeCount = Number(Boolean(filters.year)) + filters.emotions.length;

  function toggleEmotion(emotion: Emotion) {
    onChange({
      ...filters,
      emotions: filters.emotions.includes(emotion)
        ? filters.emotions.filter((item) => item !== emotion)
        : [...filters.emotions, emotion],
    });
  }

  return (
    <>
      <button
        type="button"
        className={`map-filter-button ${activeCount ? 'active' : ''}`}
        data-tour="filter"
        onClick={() => setOpen(true)}
        aria-label={`지도 조정 열기${activeCount ? `, 기억 필터 ${activeCount}개 적용 중` : ''}`}
      >
        <SlidersHorizontal size={17} /> 조정
        {activeCount > 0 && <span>{activeCount}</span>}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="story-sheet filter-sheet atlas-adjust-sheet"
        >
          <span className="sheet-grip" />
          <div className="sheet-heading">
            <div>

              <SheetTitle className="modal-heading">
                지도와 기억
              </SheetTitle>
            </div>
            <SheetClose className="close-button" aria-label="지도 조정 닫기">
              <X size={20} />
            </SheetClose>
          </div>
          <div className="atlas-adjust-scroll" aria-label="지도 조정 내용">
          <SheetDescription>
            걷고 싶은 풍경과 만나고 싶은 기억을 골라보세요.
          </SheetDescription>

          <MemoryScopeSwitch scope={scope} filters={filters} />

          <fieldset className="map-appearance-field">
            <legend><Layers3 size={16} /> 지도 표현</legend>
            <div className="map-appearance-options">
              <button
                type="button"
                className={mapMode === 'calm' ? 'selected' : ''}
                aria-pressed={mapMode === 'calm'}
                onClick={() => onMapModeChange('calm')}
              >
                <strong>간결</strong>
                <span>울산을 선으로 그리다</span>
              </button>
              <button
                type="button"
                className={mapMode === 'detail' ? 'selected' : ''}
                aria-pressed={mapMode === 'detail'}
                onClick={() => onMapModeChange('detail')}
              >
                <strong>상세</strong>
                <span>골목과 주변 시설까지 자세히</span>
              </button>
            </div>
          </fieldset>

          <div className="filter-fields">
            <label>
              기억의 연도
              <select
                value={filters.year ?? 'all'}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    year:
                      event.target.value === 'all'
                        ? undefined
                        : Number(event.target.value),
                  })
                }
              >
                <option value="all">전체 기간</option>
                {RECENT_MEMORY_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
            </label>

            <fieldset>
              <legend>그날의 감정 · 여러 개 선택 가능</legend>
              <div className="filter-emotions">
                {Object.entries(emotions).map(([key, item]) => {
                  const emotion = key as Emotion;
                  const selected = filters.emotions.includes(emotion);
                  return (
                    <button
                      key={emotion}
                      type="button"
                      className={selected ? 'selected' : ''}
                      aria-pressed={selected}
                      onClick={() => toggleEmotion(emotion)}
                    >
                      <span
                        className="emotion-dot"
                        style={{ background: item.color }}
                      />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          </div>
          <div className="filter-sheet-actions">
            <button
              type="button"
              className="secondary"
              disabled={!activeCount}
              onClick={() => onChange({ emotions: [] })}
            >
              <RotateCcw size={16} /> 초기화
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => setOpen(false)}
            >
              지도에 적용
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
