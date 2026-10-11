# 여운 UX/UI 리디자인 로드맵

작성일: 2026-10-12

현재 문서 브랜치: `redesign/project-audit`

## 1. 목표

현재 기능과 개인정보 경계를 유지하면서 모바일 우선 정보 구조, 지도 탐색, 작성·열람 경험을 새 시각 체계로 교체한다. 리디자인은 화면 모양을 한 번에 덮어쓰는 작업이 아니라, 기능 기준선을 먼저 자동화하고 작은 vertical slice 단위로 교체하는 방식으로 진행한다.

## 2. 브랜치 전략

### 보존 원칙

- 기존 결과물은 `main`의 `07814a4`에 남아 있다.
- 이번 감사 문서는 `redesign/project-audit`에서 작성한다.
- 리디자인 구현은 감사 문서가 검토된 뒤 `redesign/ui-v2` 같은 별도 branch에서 시작한다.
- 구현 branch는 `main`의 안정 커밋 또는 승인된 audit branch에서 생성한다.
- `main`에는 완성 전 리디자인을 직접 push하지 않는다.
- 기능 slice마다 작은 commit을 만들고 CI가 통과하는 상태를 유지한다.

권장 흐름:

```text
main (기존 안정 결과)
  └─ redesign/project-audit (현재 문서)
       └─ redesign/ui-v2 (승인 후 구현)
            ├─ baseline test commits
            ├─ token/shell commits
            ├─ map/discovery commits
            └─ sheets/form/detail commits
```

## 3. 리디자인 원칙

1. `src/features`, `src/server`, API contract를 시각 변경과 함께 고치지 않는다.
2. privacy control은 축약하거나 숨기지 않고 사용자가 결과를 이해하게 한다.
3. `MemoryMap`의 size sync, raster fallback, shared marker overlay를 유지한다.
4. 긴 기억과 사진은 작은 화면에서 항상 scroll 가능해야 한다.
5. Worker와 GitHub Pages를 같은 변경 단위에서 검증한다.
6. class name을 바꿀 때 tutorial selector와 test selector를 함께 갱신한다.
7. animation은 상태 변화의 방향을 설명하는 데만 쓰고 reduced-motion 대안을 둔다.
8. 모바일에서 핵심 CTA, 검색, 현재 위치, 지도 조정을 엄지 도달 영역 안에 둔다.
9. desktop은 모바일 UI를 단순 확대하지 않고 map과 content의 동시 탐색을 지원한다.

## 4. 단계별 계획

### Phase 0 — 기능 기준선 자동화

목적: UI를 바꾸기 전에 현재 행동을 실행 가능한 contract로 고정한다.

작업:

- Playwright 또는 동등한 browser E2E 환경 추가
- mobile `390×844`, desktop `1440×900` project 정의
- Worker/local runtime과 static Pages preview를 별도 webServer로 실행
- 공개 지도, 작성, 장소 그룹, 상세 scroll, 내 기억 CRUD smoke test
- privacy repository/API test 추가
- IndexedDB persistence test 추가
- 핵심 화면 screenshot baseline 생성
- `data-testid`는 접근성 role로 안정적으로 찾기 어려운 지점에만 제한적으로 추가

완료 조건:

- `FUNCTIONAL-BASELINE.md`의 P0 흐름이 자동 실행된다.
- main의 현재 UI screenshot과 동작 결과가 저장된다.
- 이후 phase의 PR이 baseline 실패 원인을 설명하지 않으면 merge되지 않는다.

### Phase 1 — 디자인 token과 CSS 경계

목적: 시각 언어를 바꾸되 화면 행동은 그대로 둔다.

작업:

- color, typography, spacing, radius, elevation, motion token 명세
- 감정 색상의 contrast와 지도 위 가독성 검증
- 3,596줄 `globals.css`를 foundation, shell, map, sheet, form, motion 단위로 분리하는 계획 수립
- 기존 class를 한 번에 삭제하지 않고 compatibility layer를 둔다.
- 사용되지 않는 59개 UI primitive는 별도 정리 후보로 표시하되 리디자인과 동시에 대량 삭제하지 않는다.

완료 조건:

- token 교체만으로 주요 색·간격·type scale을 조정할 수 있다.
- 현재 layout screenshot의 구조적 diff가 없다.
- reduced motion과 focus style이 유지된다.

### Phase 2 — 앱 shell과 navigation

목적: 전체 정보 구조와 화면 hierarchy를 정리한다.

작업:

- header, brand, 공개 지도/내 기억 navigation 재설계
- 로그인·로그아웃 상태 표현 정리
- mobile safe area와 desktop 최대 폭 규칙 확정
- public map과 my map의 공통 shell 추출 검토
- dev hotspot과 tutorial target을 새 DOM 구조에 재연결
- GitHub Pages hash link와 App Router link 모두 확인

완료 조건:

- `/`, `/login`, `/my-map`, `/dev` 이동이 두 runtime에서 동작한다.
- filter query와 hash route가 유지된다.
- keyboard focus order와 skip link가 유효하다.

### Phase 3 — 지도 탐색과 control

목적: 지도 중심 경험을 간결하고 예측 가능하게 만든다.

작업:

- 검색, 지도 조정, zoom, 현재 위치, CTA의 위치와 우선순위 재설계
- marker/cluster 상태: default, hover, selected, grouped, loading 정의
- calm/detail 전환을 조정 sheet 안에 유지
- 선택 장소 card와 pending location confirmation 재설계
- 지도 아래 기억 목록의 mobile sheet / desktop panel layout 재설계

보존해야 할 구현:

- MapLibre instance lifecycle
- ResizeObserver와 raster container size sync
- raster fallback과 attribution
- 단일 shared marker overlay
- bounds report와 abort/debounce
- click/long press/context menu handler

완료 조건:

- 지도 이동 중 marker가 사라지거나 이중화되지 않는다.
- calm/detail에서 marker 위치가 동일하다.
- CTA는 form 전에 위치 선택을 거친다.
- filter·marker·zoom control이 겹치지 않는다.

### Phase 4 — 장소 발견과 기억 상세

목적: “같은 장소, 서로 다른 기억”을 리디자인의 중심으로 만든다.

작업:

- 장소 그룹 header, 감정 요약, timeline card 재설계
- 장소 목록 → 기억 상세 전환과 뒤로 동작의 시각적 방향성 강화
- 사진 gallery, 본문, meta, 위치 action hierarchy 재설계
- mobile sheet 높이·scroll·sticky action 검토
- desktop side panel 또는 centered detail pattern 결정
- scroll progress가 필요한지 사용자 관점에서 재검토하되 긴 content scroll은 유지

완료 조건:

- 긴 본문과 5장 사진에서도 모든 action에 도달한다.
- 뒤로는 장소 목록, 닫기는 지도라는 차이가 분명하다.
- scroll 중 배경 지도가 의도치 않게 움직이지 않는다.
- 공개/익명/owner 상태가 오해 없이 표현된다.

### Phase 5 — 기억 작성과 privacy

목적: 필드가 많아도 감정적 흐름을 유지하고 개인정보 결정을 명확하게 한다.

작업:

- form을 위치 → 이야기 → 사진 → 공개 설정의 단계 또는 section으로 재구성
- field validation, 글자 수, pending image 상태를 일관된 pattern으로 통합
- private/public, anonymous, exact/approximate 결과를 plain language로 설명
- 저장 중, 실패, 재시도, 성공 feedback 재설계
- photo add/remove와 existing/new media 구분 유지
- 위치 수정은 현재 지원하지 않는다는 점을 edit UI에 명확히 표시

완료 조건:

- Zod input shape와 API payload가 변하지 않는다.
- private 기억이 공개 지도에 나타나지 않는다.
- approximate 기억의 exact coordinate가 public response에 없다.
- 업로드 제한과 metadata 제거가 유지된다.

### Phase 6 — onboarding, auth, dev 화면

목적: 새 UI를 처음 보는 사용자가 핵심 흐름을 이해하도록 보조 경험을 맞춘다.

작업:

- tutorial 10단계의 필요성을 새 IA에 맞춰 재평가
- 유지하는 step의 selector를 안정적인 `data-tour`로 연결
- login 화면을 Worker/Pages 설명 차이는 유지하며 같은 브랜드 체계로 통합
- dev 화면의 상태와 바로가기를 새 route/navigation에 맞춤
- keyboard, focus trap, Escape, reduced motion 검증

완료 조건:

- 대상 element가 없는 tutorial step이 없다.
- Pages와 Worker의 로그인 설명이 실제 동작과 일치한다.
- 숨은 dev 진입과 지도 복귀가 동작한다.

### Phase 7 — 통합 검증과 출시

작업:

- `pnpm check`
- Worker local DB migration/seed 및 CRUD smoke
- GitHub Pages preview 및 IndexedDB persistence smoke
- mobile/desktop visual regression 승인
- keyboard-only 및 screen reader 핵심 여정 점검
- 실제 iOS Safari, Android Chrome, desktop Chrome/Safari 확인
- OSM/OpenFreeMap/Photon/NAVER attribution과 정책 확인
- bundle 크기 비교와 lazy loading 후보 정리

완료 조건:

- P0/P1 baseline 전부 통과
- 두 runtime build와 실제 route 통과
- 알려진 제한이 README와 발표 문서에 반영
- main merge 전 rollback 가능한 안정 tag 또는 commit 기록

## 5. 권장 구현 단위

한 PR에 전체 화면을 교체하지 않는다. 다음 vertical slice가 작고 검토 가능하다.

1. baseline E2E와 screenshot만 추가
2. token과 typography만 교체
3. app shell과 navigation만 교체
4. map control과 CTA만 교체
5. public discovery panel과 memory card 교체
6. place sheet와 detail sheet 교체
7. form과 privacy section 교체
8. my map 교체
9. tutorial/auth/dev 정리
10. polish, performance, accessibility

각 slice는 기능 변경 없이 시작하며 기능 변경이 필요하면 별도 이슈와 커밋으로 분리한다.

## 6. 회귀 방지 규칙

- `src/features/memories/model.ts`의 public `Memory` shape에 user field를 추가하지 않는다.
- `src/server/memory-store.ts`의 public/owner coordinate 선택 로직을 UI PR에서 수정하지 않는다.
- `components/memories/map.tsx`의 size/fallback 주석이 있는 코드는 동등한 검증 없이 제거하지 않는다.
- `MemoryForm`의 image sanitization과 URL cleanup을 presentation component 밖으로 임의 이동하지 않는다.
- Sheet의 scroll container를 없앨 때 긴 content E2E가 먼저 있어야 한다.
- class/data attribute 변경 전 tutorial selector 검색을 수행한다.
- Next 전용 import 추가 시 Pages alias/shim 필요 여부를 함께 검토한다.
- route link는 App Router pathname과 Pages hash routing에서 모두 확인한다.
- 새 animation에는 reduced-motion rule을 함께 추가한다.

## 7. 디자인 작업 전에 결정할 질문

현재 코드에서 답을 확인할 수 없어 제품 또는 디자인 결정이 필요하다.

1. 지원할 최소 viewport와 브라우저 버전은 무엇인가?
2. WCAG AA를 명시적 목표로 둘 것인가?
3. desktop에서 지도와 content를 항상 병렬로 보여 줄 것인가?
4. `unlisted`를 다시 사용자 선택지로 노출할 것인가?
5. edit에서 위치와 정밀도 변경을 허용할 것인가?
6. tutorial 10단계를 유지할지 축소할지?
7. GitHub Pages를 시연 전용으로 유지할지 공유형 backend를 다시 연결할지?
8. PostgreSQL/PostGIS 복귀가 리디자인과 같은 일정에 포함되는가?
9. 성능 예산과 사진 중심 화면의 허용 bundle 크기는 얼마인가?
10. 리디자인 성공을 판단할 사용자 행동 지표는 무엇인가?

이 질문은 리디자인 구현을 막는 모든 질문이 아니다. Phase 0과 token 정리는 먼저 진행할 수 있으나, 관련 화면에 도달하기 전에는 결정해야 한다.

## 8. 이번 단계의 완료 조건

- [x] 별도 branch 생성: `redesign/project-audit`
- [x] 현재 기술·구조·라우트 감사
- [x] 기능 및 개인정보 기준선 작성
- [x] 리디자인 단계와 회귀 방지 규칙 작성
- [x] 현재 `pnpm check` 성공 확인
- [ ] 문서 검토 및 리디자인 방향 승인
- [ ] 구현 branch 생성
- [ ] Phase 0 baseline automation 착수
