# 타이틀 원형 창 — 반응 영역과 진입 보완

2026-10-20 · `yeoun_2` · `redesign/yeoun-2`

## 원인과 변경

기존에는 커서가 제목·본문의 보이지 않는 사각형 안에 들어와야 82px 원형 마스크가 한 번에 적용됐습니다. 따라서 사각형 가장자리에서 원이 완성된 상태로 갑자기 나타났습니다.

제목·본문 사방으로 **160px** 넓은 영역에서 커서를 추적하도록 바꿨습니다. 원의 중심이 글자 영역 밖에 있어도 같은 좌표로 마스크를 계산해 바깥에서 원이 연속적으로 들어옵니다. 반응 영역의 끝은 원의 반경보다 충분히 멀어 그 경계에서 토글해도 글자에 영향이 없습니다.

원 반경은 **82px**를 유지하고 경계의 그라데이션을 **30px**로 넓혔습니다. 등록 CSS 속성 `--intro-peek-strength`를 **220ms** 전환해 첫 진입·키보드 사용·창 밖 이탈도 부드럽게 연결합니다. 쉬는 상태에도 완전 불투명한 마스크를 유지하며 강도만 0으로 되돌립니다. reduced-motion에서는 전환을 끕니다.

새 overlay나 지도 복제는 만들지 않았습니다. 소개는 계속 pointer-events:none이며 지도 클릭·드래그·마커를 차단하지 않습니다. 모바일의 지도 터치 이동 때 잠시 숨겼다 복귀하는 기존 동작과 문구 선택도 유지했습니다.

## 수정 파일

- `components/memories/atlas-intro.tsx`: 넓어진 영역에서도 상대 커서 위치를 추적.
- `app/atlas-collage.css`: 반응 거리·시간 토큰, 강도 보간, 부드러운 원형 경계, 불투명 휴지 상태.
- `tests/e2e/atlas.spec.ts`: 원래 사각형 밖에서 시작해 안으로 진입·이탈, 강도 복귀, reduced-motion·키보드, 지도 드래그 검증.
- `docs/design/DESIGN-DNA.md`, README, 이 보고서와 실제 캡처.

API·인증·저장소·개인정보 경계·지도 데이터·`map.tsx`·container 크기 보정·ResizeObserver·raster fallback·단일 marker overlay·현재 위치 정책은 변경하지 않았습니다. 원본과 main은 보존합니다. 새 패키지는 없습니다.

## 검증

- 관련 Playwright 테스트: 데스크톱/모바일 **2개 통과**.
- 최종 `pnpm check`: lint·typecheck·단위 테스트 **10개**·Worker/Pages build 통과.
- 최종 `pnpm test:ui --workers=1`: Chromium 데스크톱 1440×900 / 모바일 390×844, **42개 통과**.
- 제목 사각형 오른쪽 24px 밖에서도 마스크가 활성화되고 좌표가 밖을 가리키는지, 가장자리를 건너도 활성 상태를 유지하는지 확인했습니다. 먼 영역 이탈·Escape 시 강도 0 복귀, reduced-motion의 전환 제거와 지도 카메라 이동을 검사했습니다.
- 데스크톱 접근 중/제목 위, 모바일 지도 이동 중 캡처를 직접 열어 확인했습니다. 기존 태그 접힘·사진·장문·CRUD·비공개 미노출·검색·장소 그룹·튜토리얼·지도 fallback 검증도 유지합니다.

기존 bundle 크기 경고와 vinext 라우트 분류 안내는 build 실패가 아닙니다. 실기기 iOS/Android·WebKit/Firefox·저사양 FPS는 확인하지 않았습니다. 모바일은 Chromium 터치 에뮬레이션입니다.

## 화면

- [데스크톱 — 원래 제목 영역 밖에서 접근](intro-reach/intro-approach-desktop-chromium.png)
- [데스크톱 — 제목 위의 원형 창](intro-reach/intro-peek-desktop-chromium.png)
- [모바일 — 지도 이동 중](intro-reach/intro-gesture-mobile-chromium.png)
