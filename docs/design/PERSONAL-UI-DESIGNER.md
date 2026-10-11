# Personal UI Designer — 여운 프로젝트 프로필

이 문서는 `personal-ui-designer` Skill의 범용 규칙에 더해 여운 프로젝트에서만 적용할 구체적인 기준을 정의한다. 다른 프로젝트의 디자인 규칙으로 사용하지 않는다.

## 목표와 기준 문서

기존 지도 기반 기억 기록 기능과 개인정보 경계를 유지하면서 UI/UX를 전면 개선한다. 작업 전 다음 문서를 함께 확인한다.

- `PROJECT-AUDIT.md`: 현재 기술, 라우트, UI 구조와 위험 영역
- `FUNCTIONAL-BASELINE.md`: 리디자인 후에도 보존할 동작
- `REDESIGN-ROADMAP.md`: 구현 순서와 완료 조건
- 저장소 루트 `AGENTS.md`: 작업 및 검증 규칙

## 프로젝트 고유 불변 조건

- Worker/App Router와 GitHub Pages 정적 SPA가 같은 React UI를 사용하므로 두 실행 환경을 함께 고려한다.
- 공개 지도에는 public 기억만 표시한다. private/unlisted 기억과 approximate 위치의 실제 좌표가 공개 응답이나 집계로 유출되지 않게 한다.
- `components/memories/map.tsx`의 MapLibre lifecycle, container size 보정, ResizeObserver, raster compatibility/fallback layer, attribution과 단일 marker overlay를 유지한다.
- 울산 fallback 중심, 브라우저 현재 위치 우선 정책, calm/detail 지도 모드의 marker 일치를 유지한다.
- 핵심 CTA는 위치 선택을 거쳐 기억 작성으로 이동한다. 지도 직접 선택, 장소 검색, 장소 그룹, 상세, 뒤로가기, 내 기억 CRUD 흐름을 보존한다.
- 긴 본문과 사진이 있는 detail/form/place sheet는 내부 스크롤이 가능하고 모든 action에 도달해야 한다.
- 튜토리얼의 `data-tour`, GitHub Pages hash route, App Router 경로와 filter query 동기화를 함께 확인한다.

## 디자인 시스템 적용 위치

- 기존 token과 제품 스타일의 중심은 `app/globals.css`다. 새 raw value를 반복하기 전에 semantic token을 정의한다.
- `components/ui`의 Base UI primitive와 `components/memories`의 공유 컴포넌트를 먼저 재사용한다.
- 감정 이름과 색의 단일 근원은 `src/features/memories/model.ts`다. 표시 계층에 별도 감정 palette를 복제하지 않는다.
- UI 리디자인 중 `src/features`, `src/server`, API DTO와 저장소 구현은 명시적인 기능 변경이 없는 한 그대로 둔다.

## 필수 화면 검증

기본 viewport:

- 모바일: `390×844`
- 데스크톱: `1440×900`

기본 명령:

```bash
pnpm test:ui
pnpm check
```

필요하면 실제 창으로 확인한다.

```bash
pnpm test:ui:headed
pnpm test:ui:report
```

Playwright 캡처는 `test-results/screenshots/`에서 직접 확인한다. 최소한 다음 상태를 작업 범위에 맞게 검증한다.

- 공개 지도 초기 화면과 울산 marker
- 지도 control, 검색, 조정, 현재 위치, 핵심 CTA의 겹침 여부
- calm/detail 전환 후 marker 위치
- 장소 그룹에서 상세로 이동하고 뒤로 돌아오는 흐름
- 긴 본문과 사진이 있는 sheet의 스크롤
- private/public 작성과 내 기억 수정·삭제
- 모바일 safe area와 데스크톱 지도·콘텐츠 배치

## 보고 방식

결과는 한국어로 보고한다. 변경 파일, 보존한 기능, 데스크톱·모바일 Playwright 결과, `pnpm check` 결과, 캡처 위치와 확인하지 못한 항목을 포함한다.
