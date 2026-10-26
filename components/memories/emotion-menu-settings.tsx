'use client';
import {useState} from 'react';
import {LoaderCircle} from 'lucide-react';
import {emotions,type Emotion} from '@/lib/types';
import {DEFAULT_EMOTION_MENU} from '@/src/features/memories/emotion-preferences';

export default function EmotionMenuSettings({saved,onSave,ready}:{ready:boolean;saved:Emotion[];onSave:(value:Emotion[])=>Promise<void>}){
 const [draft,setDraft]=useState(saved),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 async function save(){setBusy(true);setError('');setNotice('');try{await onSave(draft);setNotice('지도 감정 메뉴를 저장했어요.');}catch(reason){setError(reason instanceof Error?reason.message:'설정을 저장하지 못했어요.');}finally{setBusy(false);}}
 return <details className="emotion-menu-settings" onToggle={event=>{if(event.currentTarget.open){setDraft(saved);setNotice('');}}}>
  <summary aria-disabled={!ready} onClick={event=>{if(!ready)event.preventDefault();}}>{ready?'감정 메뉴 설정':'감정 메뉴 불러오는 중…'}</summary><p>지도에서 자주 사용할 감정을 골라 주세요. 기록의 감정과 탐색 조건은 바뀌지 않아요.</p>
  <fieldset disabled={busy}><legend className="sr-only">지도 감정 메뉴에 표시할 감정</legend><div className="emotion-menu-options">{DEFAULT_EMOTION_MENU.map(emotion=><label key={emotion}><input type="checkbox" checked={draft.includes(emotion)} onChange={event=>setDraft(current=>event.target.checked?[...current,emotion]:current.filter(value=>value!==emotion))}/><span aria-hidden="true" style={{color:emotions[emotion].color}}>●</span>{emotions[emotion].label}</label>)}</div></fieldset>
  <div className="emotion-menu-actions"><button type="button" disabled={busy} onClick={()=>setDraft([...DEFAULT_EMOTION_MENU])}>모두 선택</button><button type="button" disabled={busy||!draft.length} onClick={()=>void save()}>{busy&&<LoaderCircle className="spin" size={14}/>}감정 메뉴 저장</button></div>
  {!draft.length&&<p role="status">한 가지 이상 선택해 주세요.</p>}{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 </details>;
}
