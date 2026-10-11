# 여운 프로젝트 현황 감사

작성일: 2026-10-12

기준 커밋: `07814a4` (`main`)

문서 작업 브랜치: `redesign/project-audit`

## 1. 감사 범위와 근거

이 문서는 저장소 안에서 직접 확인한 소스, 설정, 빌드 결과와 공개 GitHub Pages 화면을 근거로 작성했다. 다음 항목은 이번 감사에 포함했다.

- 프런트엔드 및 배포 기술 스택
- App Router 화면과 Route Handler
- GitHub Pages 정적 실행 경로
- 지도, 기억, 사진, 검색, 인증, 개인정보 처리 흐름
- 공통 UI primitive와 전역 스타일
- 테스트 및 로컬 실행 방법

이번 단계에서는 제품 소스코드를 변경하지 않았다. `docs/design/` 아래 문서만 추가한다.

## 2. 실행 구조 요약

현재 저장소는 동일한 React 화면을 두 가지 런타임에서 사용한다.

```text
                        shared React UI
          components/ + src/features/ + app/globals.css
                         /                     \
                        /                       \
        Worker / local server                 GitHub Pages
        Next 호환 App Router                  Vite static SPA
        Route Handler                         hash routing
        ChatGPT hosting auth                  local demo session
        Cloudflare D1 + R2                    IndexedDB
```

### Worker / 로컬 서버 모드

- `app/`의 App Router 화면과 Route Handler를 사용한다.
- `vinext`와 Vite를 통해 Next.js 호환 앱을 Cloudflare Worker 형태로 빌드한다.
- 인증은 hosting layer가 전달하는 ChatGPT 사용자 헤더를 사용한다.
- 구조화 데이터는 Cloudflare D1(SQLite), 사진은 R2를 사용한다.
- 로컬 개발에서는 Wrangler/Miniflare가 D1과 R2를 프로젝트 안의 `.wrangler/`에 유지한다.

### GitHub Pages 모드

- `github-pages/main.tsx`가 정적 SPA entry다.
- `next/link`, `next/image`, `next/navigation`은 `github-pages/shims/`의 얇은 호환 계층으로 치환된다.
- 경로는 `#/`, `#/login`, `#/my-map`, `#/dev` 형태의 hash route다.
- 로그인 상태는 `localStorage`, 기억과 사진은 IndexedDB에 저장된다.
- 다른 브라우저나 다른 사용자와 데이터가 동기화되지 않는다.
- GitHub Actions가 `dist-pages/`를 빌드해 Pages에 배포한다.

## 3. 프런트엔드 기술 스택

| 영역 | 현재 사용 기술 | 확인 위치 |
| --- | --- | --- |
| UI framework | React 19.2.6 | `package.json` |
| full stack framework | Next.js 16.3.4 App Router 호환 구조 | `app/`, `package.json` |
| Worker adapter/build | Vinext beta, Vite 8, Cloudflare Vite plugin | `vite.config.ts` |
| static Pages build | Vite + React plugin | `vite.pages.config.ts` |
| language | TypeScript 5.9, strict, bundler module resolution | `tsconfig.json` |
| map | MapLibre GL JS 6.8 | `components/memories/map.tsx` |
| calm base map | OpenFreeMap Positron vector style | `components/memories/map.tsx` |
| detail/fallback map | OpenStreetMap standard raster tile | map component 및 tile Route Handler |
| server storage | Cloudflare D1(SQLite), R2 | `src/server/`, `db/`, `vite.config.ts` |
| static storage | IndexedDB, localStorage | `src/features/memories/browser-store.ts`, `src/lib/runtime.ts` |
| schema/query | Drizzle ORM SQLite schema + parameterized D1 SQL | `db/schema.ts`, `src/server/memory-store.ts` |
| validation | Zod 4 | `src/features/**/schemas.ts` |
| styling | Tailwind CSS 4 token layer + 3,596줄 전역 CSS | `app/globals.css` |
| accessible primitives | Base UI 기반 Sheet, Dialog, Select, Radio, Switch | `components/ui/` |
| icon | Lucide React | 화면 컴포넌트 전반 |
| notification | Sonner | `memory-app.tsx`, `my-memory-map.tsx` |
| test runner | Node 내장 test runner | `tests/*.test.mjs` |
| CI/CD | GitHub Actions | `.github/workflows/` |

### 원래 기반 요구와 현재 코드의 차이

현재 저장소에는 PostgreSQL, PostGIS, Docker Compose가 없다. 현재 서버 구현은 D1(SQLite)이며 좌표를 `real` 열에 저장하고 bounding box 및 Haversine 계산을 직접 수행한다. 이 문서는 현재 코드의 동작을 기준으로 작성하며, PostgreSQL/PostGIS가 이미 동작한다고 가정하지 않는다.

## 4. 디렉터리 구조와 책임

```text
app/
  page.tsx                 공개 지도 화면의 server entry
  my-map/page.tsx          인증된 내 기억 지도 entry
  login/, signup/          hosting 인증 진입 화면
  dev/                     시연 보조 화면
  api/                     기억, 사진, 검색, 지도 tile Route Handler
components/
  memory-app.tsx           공개 지도 화면 orchestration
  my-memory-map.tsx        내 기억 지도 orchestration
  memories/                지도, 작성, 상세, 장소 그룹, 필터, Panorama
  map/                     장소 검색 UI
  onboarding/              10단계 첫 사용자 안내
  dev/                     개발자 화면과 숨은 진입점
  ui/                      59개 UI primitive 파일
src/
  features/                DTO, schema, API adapter, 필터, runtime별 client logic
  server/                  D1/R2 repository와 request boundary
  lib/runtime.ts           GitHub Pages runtime/auth 감지
db/                       Drizzle SQLite schema
drizzle/                  D1 migration과 울산 seed
github-pages/             정적 SPA entry와 Next 호환 shim
tests/                    onboarding, Panorama 단위 테스트
scripts/                  빌드, 로컬 D1, 실행 profile 보조 스크립트
.github/workflows/        CI와 GitHub Pages 배포
```

### 구조상 관찰 사항

- 화면 orchestration이 `memory-app.tsx` 734줄, `my-memory-map.tsx` 508줄에 집중돼 있다.
- `app/globals.css`는 3,596줄이며 화면별 규칙, token, responsive rule, animation이 한 파일에 함께 있다.
- `components/ui/`에는 59개 primitive가 있으나 제품 화면에서 직접 사용하는 것은 Sheet, Dialog, Select, RadioGroup, Switch가 중심이다.
- `src/features/memories/api.ts`가 runtime을 감지해 server API와 IndexedDB repository 중 하나를 선택한다. UI는 저장소 구현을 직접 알지 않는다.
- 공개 지도와 내 지도는 `MemoryMap`, `MemoryForm`, `MemoryDetail`, `PanoramaViewer`를 공유한다.

## 5. 화면 라우트

### App Router

| 경로 | 역할 | 인증/데이터 |
| --- | --- | --- |
| `/` | 공개 기억 지도, 검색, 필터, 장소 그룹, 기억 작성 진입 | 공개 조회, 작성은 로그인 필요 |
| `/login` | ChatGPT hosting 인증 진입 | 미인증용 |
| `/signup` | 현재 `/login`과 같은 화면을 재사용 | 별도 회원가입 구현 없음 |
| `/my-map` | 내 기억 지도, 필터, 작성·수정·삭제 | `requireChatGPTUser()`로 보호 |
| `/dev` | 튜토리얼 초기화, 화면 바로가기, 환경 상태 | 관리자 기능이 아닌 시연 보조 화면 |

`/`와 `/my-map`, `/dev`는 dynamic route로 선언돼 있다. 로그인과 회원가입 화면은 별도 데이터 fetch가 없다.

### GitHub Pages hash route

| hash path | 역할 | 차이점 |
| --- | --- | --- |
| `#/` | 공개 지도 | IndexedDB seed와 브라우저 데이터 사용 |
| `#/login`, `#/signup` | 로컬 시연 세션 시작 | 외부 계정이나 비밀번호 없음 |
| `#/my-map` | 브라우저 소유 기억 지도 | 로컬 시연 세션 필요 |
| `#/dev` | 개발 보조 화면 | DB 상태는 사용 가능으로 표시 |

### API Route Handler

| method/path | 역할 | 주요 경계 |
| --- | --- | --- |
| `GET /api/memories` | viewport 안 공개 기억 조회 | `visibility='public'`, bounds, 연도·감정, 최대 300 |
| `POST /api/memories` | 기억과 사진 생성 | 로그인, same-origin, Zod, R2 upload |
| `GET /api/memories/:id` | 읽을 수 있는 기억 상세 | public 또는 owner |
| `PATCH /api/memories/:id` | 소유 기억 수정 | 로그인, owner, same-origin |
| `DELETE /api/memories/:id` | 소유 기억과 사진 삭제 | 로그인, owner, same-origin |
| `GET /api/memories/nearby` | 반경 내 공개 기억 그룹 | 기본 100m, 최대 500m, 최대 30개 |
| `GET /api/users/me/memories` | 내 기억 목록 | 로그인, owner filter |
| `GET /api/media/:id` | 권한이 확인된 사진 응답 | public 또는 owner, storage key 비공개 |
| `GET /api/places/search` | Photon 기반 장소 검색 | 울산 좌표 bias, 최대 7개 |
| `GET /api/map-tiles/:z/:x/:y` | OSM raster proxy | 좌표 검증, upstream cache header 전달 |

## 6. 공통 UI와 스타일링 체계

### 시각 token

`app/globals.css`의 `:root`와 `@theme inline`에 다음 의미 token이 있다.

- surface: `--paper`, `--surface-muted`, `--surface-accent`
- text: `--ink`, `--muted`
- brand/action: `--green`, Tailwind `--color-primary`
- structure: `--line`, `--radius-lg`, `--shadow-floating`
- layout: `--app-header-height`

감정 색상은 CSS token이 아니라 `src/features/memories/model.ts`의 `emotions` 객체가 단일 근원이다. marker, badge, filter, card가 이 값을 인라인 style로 사용한다.

### 스타일 조합

- Tailwind 4와 `tw-animate-css`를 import한다.
- Base UI primitive 내부는 utility class를 사용한다.
- 제품 화면은 대부분 의미 class와 전역 CSS를 사용한다.
- `cn()`은 `clsx`와 `tailwind-merge`를 결합한다.
- breakpoint는 주로 760px이며 420px, 1100px, 낮은 모바일 높이 700px 조건도 있다.
- `prefers-reduced-motion` 대응 rule이 세 구간에 존재한다.

### 주요 공통 UI

| 컴포넌트 | 역할 | 공유 화면 |
| --- | --- | --- |
| `MemoryMap` | MapLibre, raster fallback, marker overlay, 위치 선택 | 공개 지도, 내 지도 |
| `MemoryForm` | 생성·수정, 사진, 공개 범위, 익명·근사 위치 | 공개 지도, 내 지도 |
| `MemoryDetail` | 상세 내용, gallery, 위치·Panorama, owner action | 공개 지도, 내 지도 |
| `PlaceMemorySheet` | 100m 장소 그룹, 감정 요약, timeline | 공개 지도 |
| `MemoryFilterSheet` | 공개 지도의 지도 표현·연도·감정 조정 | 공개 지도 |
| `PanoramaViewer` | NAVER Panorama lazy load와 오류 상태 | 공개 지도, 내 지도 |
| `PlaceSearch` | debounced 장소 검색과 선택 | 공개 지도 |
| `OnboardingTutorial` | 10단계 spotlight 안내와 focus trap | 공개 지도 |
| `Sheet` | bottom sheet overlay와 transition | form/detail/place/filter |
| `Dialog` | Panorama modal | 공개 지도, 내 지도 |

## 7. 핵심 기능과 데이터 흐름

### 공개 지도 조회

1. `MemoryMap`이 MapLibre `moveend`에서 bounds를 보고한다.
2. UI는 250ms 뒤 `fetchPublicMemories()`를 호출하고 이전 요청을 abort한다.
3. server runtime은 `/api/memories`, Pages runtime은 IndexedDB query를 사용한다.
4. 공개 데이터만 bounds·연도·감정으로 걸러진다.
5. 화면 좌표가 34px 안인 marker는 HTML overlay에서 하나의 group marker가 된다.

서버 clustering이나 공간 index 기반 grouping은 현재 없다. viewport query만 서버에서 수행하며 marker clustering은 화면 projection 기반 client grouping이다.

### 지도 표현

- 기본 `calm` 모드는 OpenFreeMap Positron vector style이다.
- `detail` 모드는 OSM standard raster compatibility layer를 보인다.
- WebGL/style 오류 또는 MapLibre load 전에는 raster layer가 fallback이다.
- marker, 선택 위치, 현재 위치는 두 지도 표현이 공유하는 단일 HTML overlay다.
- raster tile은 Worker에서는 `/api/map-tiles`, Pages에서는 OSM URL을 직접 사용한다.
- container size sync, ResizeObserver, 0/250ms layout timer는 내장 브라우저의 빈 지도 회피 코드다.

### 위치 선택과 작성

- 지도 click, context menu, 모바일 650ms long press가 위치 선택을 시작한다.
- 핵심 CTA는 먼저 현재 지도 중심에 pending marker를 만들고 사용자가 확정하도록 한다.
- 장소 검색 결과를 선택하면 지도 이동과 선택 장소 card가 나타난다.
- 미인증 사용자는 로그인 화면으로 이동한다.
- 제목·본문·날짜·감정·공개 범위·익명·위치 정밀도·사진을 입력한다.
- 이미지는 최대 5개, JPG/PNG/WEBP, 개별 5MB 이하이며 client에서 최대 1600px WEBP로 다시 그려 metadata를 제거한다.
- 서버는 MIME, 개수, 크기를 다시 검사한다.

현재 form UI가 직접 선택할 수 있는 공개 범위는 `private`와 `public`뿐이다. schema와 조회 filter는 `unlisted`를 지원하지만 UI 선택지는 없다.

### 장소별 기억과 상세

- marker 선택 시 기본 100m 반경의 공개 기억을 조회한다.
- 장소 이름, 총 개수, 감정 요약과 날짜순 timeline을 bottom sheet에 표시한다.
- timeline 기억을 열면 상세 sheet로 전환하며 `onBack`으로 장소 목록에 돌아간다.
- 상세 sheet는 별도 scroll container와 scroll progress bar를 갖는다.
- 사진 gallery, 긴 본문, 위치 이동, Panorama 진입이 같은 scroll 영역에 있다.

### 내 기억 지도

- owner의 public/private/unlisted 기억을 모두 조회한다.
- 연도, 감정, 공개 범위 filter를 URL과 동기화한다.
- owner는 정확한 좌표를 받는다.
- 생성, 수정, 삭제와 사진 추가·삭제를 지원한다.
- 수정에서는 위치와 `location_precision`을 바꾸지 않는다.

### 개인정보 경계

- public list와 nearby query는 항상 public만 포함한다.
- private/unlisted는 owner만 상세 및 media를 읽을 수 있다.
- 공개 DTO `Memory`에는 `userId`, 이메일, 프로필, raw coordinate field가 없다.
- approximate 위치는 별도의 public latitude/longitude로 응답한다.
- owner 조회에서만 exact latitude/longitude를 사용한다.
- Pages의 타인 approximate fixture에는 source exact coordinate 자체를 저장하지 않는다.
- Pages에서 사용자가 만든 private 데이터는 같은 브라우저의 IndexedDB 접근 권한 안에 있다. 이는 다중 사용자 서버 보안 모델이 아니다.

## 8. UI 리디자인 회귀 위험

| 위험도 | 영역 | 위험 원인 |
| --- | --- | --- |
| 매우 높음 | 지도 container와 overlay | 두 겹의 map surface, projection, ResizeObserver, fallback layer가 같은 크기와 stacking context를 전제로 한다. |
| 매우 높음 | marker click과 map click | marker 선택, 장소 열기, 위치 선택이 같은 map 위에서 경쟁한다. DOM 구조나 pointer-event 변경 시 작성 flow가 오작동할 수 있다. |
| 매우 높음 | bottom sheet scroll | 긴 본문·사진 scroll, close/back, focus lock이 Sheet primitive와 `.story-sheet-scroll` 구조에 의존한다. |
| 매우 높음 | dual runtime | Next navigation/image와 Pages shim이 같은 컴포넌트를 빌드한다. Next 전용 API를 새로 쓰면 Pages가 깨질 수 있다. |
| 높음 | privacy 표현과 form | 익명, 공개 범위, 근사 위치 control을 시각적으로 재배치하면서 제출 값이나 disabled 조건을 바꾸기 쉽다. |
| 높음 | URL filter state | server route는 query string, Pages는 hash 안 query string을 사용한다. 공통 navigation 변경 시 filter가 사라질 수 있다. |
| 높음 | 작성 후 local merge | 공개 지도는 server rows와 방금 만든 rows를 합친다. key나 state reset 변경 시 중복 또는 즉시 미표시가 발생할 수 있다. |
| 높음 | 사진 | client metadata 제거, preview object URL 정리, 기존/신규/삭제 media 세 집합을 유지한다. gallery만 보고 form state를 단순화하면 데이터 손실 위험이 있다. |
| 높음 | authentication | Worker header auth와 Pages local session이 다르다. 로그인 화면만 교체해도 redirect/return route가 달라질 수 있다. |
| 중간 | 튜토리얼 | spotlight가 `data-tour`와 CSS selector로 실제 요소 위치를 찾는다. class/data attribute 변경 시 단계가 중앙 fallback으로 바뀐다. |
| 중간 | current location | 권한 실패 시 울산 fallback과 toast가 보장돼야 한다. 버튼 위치 변경 자체보다 handler 보존이 중요하다. |
| 중간 | animation/accessibility | focus-visible, reduced motion, dialog role, keyboard focus trap이 여러 계층에 흩어져 있다. |

## 9. 확인된 테스트 및 실행 환경

2026-10-12에 `pnpm check`를 실행해 다음 결과를 확인했다.

- ESLint 성공
- TypeScript typecheck 성공
- Node test 10개 성공
- Worker/App Router build 성공
- GitHub Pages static build 성공
- bundle size warning 존재: Pages main JS 약 1.64MB, gzip 약 472KB

공개 GitHub Pages에서 지도 shell, 울산 marker, 공개 기억 목록, 첫 사용자 튜토리얼이 렌더링되는 것도 확인했다.

자동 테스트의 실제 범위는 다음뿐이다.

- onboarding 완료·초기화
- 숨은 개발자 진입 gesture
- NAVER SDK 미설정·실패·재시도·중복 load
- Panorama가 authorized DTO 좌표만 사용하는지 확인

다음은 자동 검증되지 않는다.

- MapLibre drag/zoom/click/long press
- marker grouping 및 장소별 기억 sheet
- 기억 생성·수정·삭제와 사진
- D1/R2 repository 권한
- IndexedDB persistence
- 모바일/데스크톱 responsive layout
- keyboard 전체 여정, screen reader, contrast
- screenshot/visual regression

## 10. 현재 환경에서 확인할 수 없는 정보

- 실제 NAVER Cloud 콘솔의 Web Service URL 등록 상태
- `NAVER_MAPS_CLIENT_ID` GitHub Actions variable의 현재 값과 유효성
- 운영 Worker의 D1/R2 데이터 규모, quota, 장애 상태
- 실제 사용자 기기와 브라우저 분포
- 사용성 조사, analytics, 전환율, 이탈 지점
- 사진이 많은 실제 운영 데이터에서의 저장 용량과 성능
- 외부 OpenFreeMap, OSM, Photon, NAVER의 향후 정책 및 가용성
- PostgreSQL/PostGIS 전환 계획의 확정 여부

이 항목들은 리디자인 요구로 추정하지 않으며, 구현 전에 별도 확인해야 한다.
