'use client';
import { Check, MapPin } from 'lucide-react';

export default function AtlasLocationPicker({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <section className="location-picker-card" aria-label="기억을 남길 장소 선택" aria-live="polite">
    <div className="location-picker-copy">
      <span className="location-picker-icon"><MapPin size={19} /></span>
      <span><strong>기억이 머문 장소를 골라주세요</strong><small>지도를 눌러 선택 마커를 옮겨보세요. 장소를 고르는 동안 기억 조각은 잠시 숨겨요.</small></span>
    </div>
    <div className="location-picker-actions">
      <button type="button" onClick={onCancel}>취소</button>
      <button type="button" className="confirm" onClick={onConfirm}><Check size={16} /> 이 위치 선택</button>
    </div>
  </section>;
}
