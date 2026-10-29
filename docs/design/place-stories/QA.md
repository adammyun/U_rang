# 숨은 장소 이야기 — 검증 기록

2026-10-29 · `redesign/yeoun-2`

## 결과

- Pages UI: `place-stories.spec.ts` 8건 + 기존 `personal-space.spec.ts` 12건 = **20/20 통과**.
- 서버 UI: 새 이야기 4건 + 기존 게스트 작성·사진·설정·삭제·로그아웃 4건 = **8/8 통과**.
- Chromium/WebKit × 1440×900 데스크톱 / 390×844 모바일 viewport.
- 단위 검사 **27/27**: 새 카탈로그·확대 게이트 2건 포함.
- 로컬 `pnpm db:migrate`: 0006 테이블 생성 성공.
- 로컬 API: 미인증 401, 사용자 간 격리, 허용하지 않은 ID/추가 필드 400, 최초 시각 중복 보존, DTO 사용자 정보 제외, private/no-store, 다른 출처 쓰기 거부, 로그아웃 후 접근 차단 통과.
- 기존 게스트 API 회귀: 비공개 사진 격리, 익명 작성자·대략적 좌표 보호, 댓글·북마크·개인 설정·로그아웃 검사 통과.
- 기존 MapLibre 인스턴스/lifecycle, ResizeObserver/container 보정, raster compatibility, OSM attribution, 울산 범위/확대 제한, 브라우저 현재 위치 정책은 수정하지 않았다.

## 화면 확인과 수정

- 처음 촬영에서 보관 카드가 긴 마이페이지의 화면 아래에 묻혔다. ‘발견한 이야기’ 선택 시 내부를 스크롤해 카드가 보이게 수정하고 viewport 안에 있는지 assertion을 추가했다.
- 테스트용 강제 페이지 이동이 끝나지 않은 지도 요청을 중단해 WebKit 1건에서 오류로 기록됐다. 실제 지도 로딩을 기다린 뒤 이동하도록 수정하고 오류 assertion을 그대로 유지해 서버 8건을 재실행, 모두 통과했다.
- 실패 보고서가 생성된 후 lint가 Playwright 서버 보고서의 번들 JS를 검사하는 문제를 발견했다. 기존 보고서 제외 규칙에 `playwright-report-server/**`, `test-results-server/**`만 추가했다. 앱 소스 검사 규칙은 완화하지 않았다.
- 모바일 읽기: 제목/닫기/하단 동작이 잘리지 않고 본문·출처를 내부 스크롤로 읽는다.
- 지도 흔적은 기본 확대 수준에서 없으며 장소 검색 후 확대하면 표시된다. 기록 작성/위치 선택 시 숨겨진다.
- 로그인 전 읽기 → 로그인 → 같은 이야기 복귀 → 보관, 중복 읽기·새로고침 후 보관 유지, 브라우저 가로 넘침 없음 확인.

## 주요 변경 파일

- `src/features/stories/`: 공개 카탈로그, DTO 검증, 서버/Pages 저장 API.
- `src/server/story-discoveries.ts`, `app/api/users/me/discoveries/route.ts`: 사용자별 서버 보관.
- `db/schema.ts`, `drizzle/0006_tearful_shockwave.sql`, migration metadata, `package.json`: 테이블과 로컬 migration 연결.
- `components/stories/`: 흔적 glyph, 읽기 dialog, 보관함, collection hook.
- `components/memories/map.tsx`: 기존 overlay에 현재 화면의 흔적 표시.
- `components/memories/personal-space.tsx`: 발견한 이야기 탭.
- `components/memory-app.tsx`, `app/page.tsx`, `github-pages/main.tsx`: 상태와 로그인 복귀 연결.
- `app/atlas-collage.css`: 기존 토큰을 사용하는 흔적·읽기·보관함 스타일.
- Playwright/단위/API 검사, `eslint.config.mjs`, README와 기능/디자인 문서.

## 캡처

[데스크톱 지도 흔적](desktop-trace.png) · [데스크톱 읽기](desktop-story.png) · [모바일 읽기](mobile-story.png) · [모바일 보관함](mobile-collection.png)

## 범위와 제한

현재는 검증한 5곳을 선별 제공한다. 기억 수에 따른 자동 생성/집계, 사용자 제보, 실제 방문 인증은 구현하지 않았다. 비공개 기억을 인기 산정에 사용하지 않는다. 이야기의 사실은 출처 기준이며 현재 현장 상황을 보장하는 안내가 아니다. 물리적 iOS/Android 기기, 공장 현장, GPS 방문 여부는 검사하지 않았다. 기존 대형 JS 번들 경고는 남아 있으나 새 패키지는 설치하지 않았다.

기능·콘텐츠 출처·API 계약은 [운영 안내](../../operations/PLACE-STORIES.md)를 참고한다.
