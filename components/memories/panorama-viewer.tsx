'use client';

import { AtlasHeadingLabel } from '@/components/ui/atlas-heading-label';

import { useCallback, useEffect, useRef, useState } from 'react';
import PanoramaAnnotations from './panorama-annotations';
import { normalizePan, type PanoramaFrame } from '@/src/features/panorama/projection';
import { trackPanoramaMotion } from '@/src/features/panorama/motion';
import type { PanoramaAnchor } from '@/src/features/memories/comments-model';
import { MessageCircle, LoaderCircle, RotateCcw, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Point } from '@/lib/types';
import {
  loadNaverMapsPanorama,
  NaverPanoramaLoadError,
  type NaverEventListener,
  type NaverMapsApi,
  type NaverPanoramaInstance,
} from '@/src/features/panorama/naver-maps';

type ViewerState = 'loading' | 'ready' | 'unavailable' | 'missing-config' | 'auth-error' | 'error';

export default function PanoramaViewer({
  clientId,
  placeName,
  point,
  onClose, memoryId, memoryTitle, authenticated = false, onFallbackComments,
}: {
  memoryId: string;
  memoryTitle: string;
  authenticated?: boolean;
  onFallbackComments: () => void;
  clientId: string;
  placeName: string;
  point: Point;
  onClose: () => void;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [state, setState] = useState<ViewerState>('loading');
  const [attempt, setAttempt] = useState(0);
  const api=useRef<NaverPanoramaInstance|null>(null);
  const [frame,setFrame]=useState<PanoramaFrame|null>(null);
  const lookAt=useCallback((anchor:PanoramaAnchor)=>{
    const panorama=api.current;if(!panorama)return;
    const pov={pan:anchor.pan,tilt:anchor.tilt,fov:panorama.getPov()?.fov??90};
    if(panorama.getPanoId()===anchor.panoId)panorama.setPov(pov);
    else panorama.setPanoIdWithPov(anchor.panoId,pov);
  },[]);

  useEffect(() => {
    if (!container) return;

    let cancelled = false;
    let maps: NaverMapsApi | null = null;
    let panorama: NaverPanoramaInstance | null = null;
    let observer: ResizeObserver | null = null;
    let statusTimer: number | null = null;
    let viewFrame:number|null=null;
    const refreshFrame=()=>{
      if(cancelled || viewFrame!==null)return;
      viewFrame=requestAnimationFrame(()=>{
        viewFrame=null;if(cancelled || !panorama)return;
        const pov=panorama.getPov(),panoId=panorama.getPanoId(),rect=container.getBoundingClientRect();
        if(pov && panoId && rect.width>0 && rect.height>0)setFrame({panoId,pov:{...pov,pan:normalizePan(pov.pan)},width:rect.width,height:rect.height});
      });
    };
    const listeners: NaverEventListener[] = [];
    const motion=trackPanoramaMotion(container,refreshFrame);

    const initialize = async () => {
      try {
        maps = await loadNaverMapsPanorama(clientId);
        if (cancelled) return;

        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        if (cancelled) return;
        const rect = container.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) {
          throw new Error('Panorama container has no size');
        }

        panorama = new maps.Panorama(container, {
          position: new maps.LatLng(point.lat, point.lng),
          size: new maps.Size(Math.round(rect.width), Math.round(rect.height)),
          aroundControl: true,
          aroundControlOptions: { position: maps.Position.TOP_RIGHT },
          zoomControl: true,
        });

        api.current=panorama;
        listeners.push(maps.Event.addListener(panorama,'init',refreshFrame));
        for(const event of ['pano_changed','pov_changed'])listeners.push(maps.Event.addListener(panorama,event,()=>{motion.changed();refreshFrame();}));
        listeners.push(
          maps.Event.addListener(panorama, 'pano_status', (...args) => {
            if (cancelled) return;
            const status = String(args[0] ?? '');
            if (status !== 'OK' && status !== 'ERROR') return;
            if (statusTimer !== null) {
              window.clearTimeout(statusTimer);
              statusTimer = null;
            }
            setState(status === 'OK' ? 'ready' : 'unavailable');
            if(status==='OK')refreshFrame();else setFrame(null);
          }),
        );

        observer = new ResizeObserver(() => {
          if (!maps || !panorama || cancelled) return;
          const next = container.getBoundingClientRect();
          if (next.width > 0 && next.height > 0) {
            panorama.setSize(
              new maps.Size(Math.round(next.width), Math.round(next.height)),
            );
            refreshFrame();
          }
        });
        observer.observe(container);

        statusTimer = window.setTimeout(() => {
          if (cancelled) return;
          setState(panorama?.getPanoId() ? 'ready' : 'unavailable');
          refreshFrame();
        }, 12_000);
      } catch (reason) {
        if (cancelled) return;
        setState(
          reason instanceof NaverPanoramaLoadError &&
            reason.code === 'missing-client-id'
            ? 'missing-config'
            : reason instanceof NaverPanoramaLoadError && reason.code === 'authentication-failed'
              ? 'auth-error' : 'error',
        );
        if (process.env.NODE_ENV !== 'production') {
          console.error('NAVER Panorama initialization failed', reason);
        }
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      api.current=null;
      motion.dispose();
      if(viewFrame!==null)cancelAnimationFrame(viewFrame);
      if (statusTimer !== null) window.clearTimeout(statusTimer);
      observer?.disconnect();
      if (maps && panorama) {
        listeners.forEach((listener) => maps?.Event.removeListener(listener));
        maps.Event.clearInstanceListeners(panorama);
        panorama.setVisible(false);
      }
      container.replaceChildren();
    };
  }, [attempt, clientId, container, point.lat, point.lng]);

  const retry = () => {
    setState('loading');
    setAttempt((value) => value + 1);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="panorama-dialog atlas-paper-panel"
        style={{ translate: 'none' }}
        showCloseButton={false}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="panorama-header">
          <div>

            <DialogTitle><AtlasHeadingLabel>{placeName}</AtlasHeadingLabel></DialogTitle>
            <DialogDescription>
              거리뷰 · NAVER의 AroundControl에서 거리뷰와 항공뷰를 전환할 수
              있습니다.
            </DialogDescription>
          </div>
          <DialogClose className="close-button" aria-label="거리뷰 닫기">
            <X size={20} />
          </DialogClose>
        </DialogHeader>

        <div className="panorama-stage">
          <div ref={setContainer} className="panorama-canvas" />
          {state === 'loading' && (
            <div className="panorama-state" role="status">
              <LoaderCircle className="spin" size={26} />
              <strong>거리뷰를 불러오는 중…</strong>
              <span>현재 장소 주변의 360° 파노라마를 찾고 있어요.</span>
            </div>
          )}
          {state === 'missing-config' && (
            <div className="panorama-state panorama-state-error" role="alert">
              <strong>거리뷰 설정이 아직 연결되지 않았어요.</strong>
              <span>NAVER Maps Application 설정 후 이용할 수 있습니다.</span>
            </div>
          )}
          {state === 'unavailable' && (
            <div className="panorama-state panorama-state-error" role="status">
              <strong>주변에서 확인할 수 있는 거리뷰가 없습니다.</strong>
              <span>지도에서 다른 기억 장소를 선택해 보세요.</span>
              <button type="button" onClick={retry}>
                <RotateCcw size={15} /> 다시 확인
              </button>
            </div>
          )}
          {state === 'auth-error' && (
            <div className="panorama-state panorama-state-error" role="alert">
              <strong>NAVER에서 이 사이트의 거리뷰 인증을 승인하지 않았어요.</strong>
              <span>NAVER Maps Application의 Client ID, Web 서비스 URL과 Maps 사용 설정을 확인해 주세요.</span>
              <button type="button" onClick={retry}><RotateCcw size={15} /> 다시 시도</button>
            </div>
          )}
          {state === 'error' && (
            <div className="panorama-state panorama-state-error" role="alert">
              <strong>거리뷰를 불러오지 못했습니다.</strong>
              <span>네트워크와 NAVER 애플리케이션 설정을 확인해 주세요.</span>
              <button type="button" onClick={retry}>
                <RotateCcw size={15} /> 다시 시도
              </button>
            </div>
          )}
          {state==='ready'&&container&&frame&&<PanoramaAnnotations container={container} frame={frame} memoryId={memoryId} memoryTitle={memoryTitle} authenticated={authenticated} onLookAt={lookAt}/>}
        </div>
        {state!=='ready'&&state!=='loading'&&<div className="panorama-comments-fallback"><p>거리뷰 없이도 이 기억의 이야기를 나눌 수 있어요.</p><button type="button" onClick={onFallbackComments}><MessageCircle size={16}/> 기억 상세에서 댓글 보기</button></div>}
      </DialogContent>
    </Dialog>
  );
}
