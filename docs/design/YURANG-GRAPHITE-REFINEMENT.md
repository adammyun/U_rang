# 유랑 Graphite UI 보완

2026-10-19 · 저장소 `adammyun/yeoun_2` · 브랜치 `redesign/yeoun-2`

## 변경

- 우하단 확대·축소·현재 위치 버튼을 동일한 44×44px grid cell로 통일하고 18px SVG를 중앙 정렬했습니다. 기존 이벤트와 현재 위치 정책은 유지합니다.
- 조정, 기억 목록, 내 기억, 상세, 작성 폼, 인증, 튜토리얼, 거리뷰 placeholder와 개발 보조 화면을 graphite semantic token에 연결했습니다. 밝은 종이색과 녹색의 기존 표면을 제거하고 선택과 핵심 행동은 산호색으로 구분합니다.
- 제목·본문·날짜를 로컬 Noto Sans KR 400/600으로 통일했습니다. 기존 명조 font asset은 제거했습니다. 사진 없는 감정 표지는 수평으로 정리하고 긴 감정 이름의 단어가 고립되지 않도록 했습니다. 사진 콜라주의 비대칭 배치는 유지합니다.
- 간결 지도에 실제 OSM 울산 5개 구/군 영역·경계, 도시 외곽선과 확대 단계별 동·도로명을 추가했습니다. 지명은 마커와 겹치지 않게 배치하며 기억의 실제 앵커는 이동하지 않습니다.

## 파일과 기능 경계

공통 표현: `app/memory-atlas.css`, `app/globals.css`, `app/main-screen-v2.css`, `app/spatial-live.css`.
지도 표현: `components/memories/ulsan-line-map.tsx`, `components/memories/map.tsx`, `components/memory-app.tsx`, `public/maps/ulsan-lines.geojson`.
자산·문서: `public/fonts/`, `public/maps/README.md`, `README.md`, `DESIGN-DNA.md`, `PERSONAL-UI-DESIGNER.md`.
검증: `tests/e2e/atlas.spec.ts`.

API DTO, DB schema, 저장소, 공개·비공개·익명·approximate 정책, 도메인 감정 enum과 package dependency는 변경하지 않았습니다. MapLibre lifecycle, container 크기 보정, ResizeObserver, raster compatibility/fallback, 단일 marker overlay, OSM attribution도 유지합니다. 원본 저장소·main 브랜치에는 적용하지 않습니다.

## 검증 결과

- `pnpm check`: lint, typecheck, 단위 테스트 **10/10**, Worker build, Pages build 모두 성공.
- `pnpm test:ui`: Chromium 데스크톱 1440×900 / 모바일 390×844 **32/32 성공**. 낮은 1280×720 / 390×667 화면도 기존 시나리오에서 검사합니다.
- 작성·수정·삭제·공개/비공개 경계, 사진 5장과 긴 본문 스크롤, 검색·장소 그룹·상세·뒤로가기, 튜토리얼 10단계, 현재 위치 mock, 키보드와 reduced-motion, 두 지도 모드의 앵커 일치와 데이터 실패 fallback을 확인했습니다.
- 새 검증은 컨트롤 중심 오차 1px 이내, dark surface와 명암비, 고딕 적용·긴 감정 한 줄, 실제 구군 geometry와 확대 시 지명을 검사합니다.
- 첫 전체 실행의 긴 감정 시나리오 2개는 기울어진 text-only hero의 bounding box 때문에 실패했습니다. assertion을 완화하지 않고 해당 표지의 회전을 제거했으며 같은 시나리오 재검증 및 최종 전체 32개가 통과했습니다.
- 실제 캡처에서 모바일 메인·작성 폼·사진 상세, 데스크톱 감정 상세·조정·확대 지명을 직접 확인했습니다.
- 기존 Vite chunk-size 경고와 vinext 정적 라우트 분류 안내는 남아 있으나 build 실패는 아닙니다. 개발 HMR 중 root 재생성 경고가 관찰되어 production build/preview에서 검증했으며 이 작업에서 개발 서버 구조를 변경하지 않았습니다.

## 한계

행정 데이터는 OSM 공동 편집 자료를 단순화한 표현이며 정부 공인·측량용 경계가 아닙니다. 원본 timestamp·취득일·ODbL은 [지도 출처](../../public/maps/README.md)에 기록했습니다. 기존 도로 bbox 밖에서는 raster fallback을 유지합니다. 브라우저가 외부 행정 API를 호출하거나 타일을 사전·일괄 다운로드하지 않습니다.

실기기 iOS/Android, WebKit/Firefox, 저사양 FPS와 실제 NAVER panorama 조회는 이번 검증 범위 밖입니다. Pages의 브라우저 로컬 저장·데모 인증 방식도 변경하지 않았습니다.

## 실제 브라우저 캡처

- [데스크톱 메인](graphite/yurang-main-desktop-chromium.png)
- [모바일 메인](graphite/yurang-main-mobile-chromium.png)
- [데스크톱 조정](graphite/yurang-adjust-desktop-chromium.png)
- [모바일 조정](graphite/yurang-adjust-mobile-chromium.png)
- [긴 감정 상세](graphite/graphite-meaningful-desktop-chromium.png)
- [모바일 작성](graphite/graphite-form-mobile-chromium.png)
- [확대 지명](graphite/graphite-neighborhood-desktop-chromium.png)
- [모바일 사진 상세](graphite/atlas-photo-detail-mobile-chromium.png)
