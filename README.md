# 유랑 — 기억이 머무는 지도

**실서비스:** [유랑 — 서버에 기억 남기기](https://yurang-memory-live.finn7132.chatgpt.site/)

**GitHub Pages 시연판:** [유랑 시연판 열기](https://adammyun.github.io/yeoun_2/)

실서비스는 공개 기억을 누구나 읽고, 로그인 후 작성한 기억과 사진을 서버 DB·사진 저장소에 보관합니다. Pages 시연판의 기존 브라우저 기록은 실서비스로 자동 업로드되지 않습니다. [운영·거리뷰 설정 안내](docs/operations/LIVE-SERVICE.md)

**저장소:** [adammyun/yeoun_2](https://github.com/adammyun/yeoun_2)

기존 여운 프로젝트의 최신 로컬 작업을 보존한 독립 복사본입니다. 새로운 UI 작업은 `redesign/yeoun-2` 브랜치에서 진행합니다. 원본 저장소와 공개 사이트는 별도로 유지됩니다. 현재 리디자인은 `redesign/yeoun-2` 브랜치에서 관리합니다. 기준 `main`과 보존 태그는 그대로 유지합니다.

현재 리디자인 브랜치의 로컬 시연 방법은 [DEMO-GUIDE.md](DEMO-GUIDE.md)를 참고하세요. 배포 브랜치에 반영되기 전에는 위 공개 주소가 이전 화면일 수 있습니다.

장소에 얽힌 개인의 기억을 지도에 기록하고, 같은 장소를 다른 사람들이 어떻게 기억하는지 발견하는 모바일 우선 웹 애플리케이션입니다.

기본 지역과 모든 시연 데이터는 울산광역시를 기준으로 합니다. 위치 권한을 허용하면 현재 위치로 이동하고, 권한이 없거나 조회에 실패하면 울산으로 돌아옵니다.

## 유랑 UI 보완

브랜드를 유랑으로 변경하고 로컬 Noto Sans KR 고딕 제목, 울산의 주요 도로·강·해안선 라인 지도, 열린 사진·글 상세를 적용했습니다. 조정·기억·작성·인증 표면은 graphite로 통일하고, 지도에 실제 OSM 구/군 경계와 확대 단계별 지명을 표시합니다. 간결 지도에서도 도로로 둘러싸인 도시 블록과 건물 윤곽을 보여 주며 확대 시 작은 건물까지 표시합니다. 조정에서 모두의 기억과 내 기억으로 전환합니다. 내 기억은 기존 인증 경계를 사용하며 public query에 private/unlisted를 섞지 않습니다. 울산 도심 추출 범위 밖 또는 라인 데이터 실패 시 기존 OSM 상세 지도가 표시됩니다.

[지도 데이터 출처·라이선스](public/maps/README.md) · [최초 유랑 변경 기록](docs/design/YURANG-REFINEMENT.md) · [Graphite 보완과 검증](docs/design/YURANG-GRAPHITE-REFINEMENT.md) · [건물·블록 지도 보완](docs/design/YURANG-BUILDING-MAP.md) · [팝업·모달 콜라주 통일](docs/design/YURANG-COLLAGE-REFINEMENT.md) · [소개 문구·지도 노출 보완](docs/design/YURANG-INTRO-REFINEMENT.md) · [타이틀 반응 영역 확장](docs/design/YURANG-INTRO-REACH.md) · [접이식 감정 태그·새 아이콘](docs/design/YURANG-EMOTION-DOCK.md)

## 프로젝트 배경

일반 지도는 장소의 기능과 경로를 설명합니다. 유랑은 한 장소에 겹쳐진 서로 다른 사람의 경험을 보여 줍니다. 같은 공원이 누군가에게는 가족과 보낸 날이고, 다른 사람에게는 혼자 생각을 정리한 곳일 수 있다는 점에서 출발했습니다.

## 숨은 장소 이야기

지도를 가까이 확대하면 울산 5곳의 희미한 흔적이 나타납니다. 이야기를 읽으면 로그인한 사용자의 **내 기억 → 숨은 이야기**에 모입니다. [사용 방법·출처·저장 구조·검증](docs/operations/PLACE-STORIES.md)

## 핵심 기능

- 현재 지도 화면 안의 공개 기억만 조회하고 marker와 cluster로 표시
- 지도 클릭·길게 누르기 또는 울산 장소 검색으로 위치 선택
- 기억 생성, 상세 보기, 수정, 삭제
- 공개·링크 공유·비공개 범위와 익명 공개
- 정확한 위치와 대략적인 위치 선택
- 같은 장소 반경의 여러 기억을 시간순으로 보고 감정 분포 확인
- 공개 지도의 연도·감정 필터와 마이페이지의 공개 범위·연도·감정 필터
- 지도를 유지하며 여는 마이페이지, 내 기록·북마크·좋아요 지도 표시 선택
- 개별 기억 상세에서만 보이는 반응과 조회수, 감정·장소가 닮은 공개 기억 추천
- JPG·PNG·WEBP 사진을 기억당 최대 5장 첨부
- NAVER Maps Web SDK가 설정된 경우 선택한 장소의 거리뷰·항공뷰 표시
- 선택한 기억에 익명 댓글 작성·읽기·본인 삭제: 거리뷰 지점 선택·표식과 댓글의 상호 강조·접이식 패널, 거리뷰 실패 시 개별 상세보기로 연결

북마크·좋아요·조회수와 개인 기록 기반 추천은 마이페이지에 포함합니다. 팔로우·알림·메시지와 인기 순위는 구현하지 않습니다. 댓글은 [기억 댓글 안내](docs/operations/MEMORY-COMMENTS.md)를 참고하세요.

## 기술 스택

- Next.js App Router 호환 UI(Vinext), React 19, TypeScript
- MapLibre GL JS
- OpenStreetMap standard raster tiles
- Cloudflare D1(SQLite)와 R2 object storage
- Drizzle ORM, Zod
- Tailwind CSS 4
- Cloudflare Workers/Wrangler

저장소에는 두 실행 모드가 있습니다.

- **GitHub Pages:** Vite로 같은 React UI를 정적 빌드합니다. 계정 정보는 수집하지 않으며 로그인 상태는 로컬 시연 세션, 기억과 사진은 브라우저 IndexedDB에 저장합니다. 공개 seed와 사용자가 만든 기억은 해당 브라우저 안에서만 유지됩니다.
- **Worker:** Route Handler와 Cloudflare D1/R2를 사용하는 기존 서버 배포 모드입니다. 데이터 접근은 `Route Handler → service/repository module → D1/R2` 경계를 따릅니다.

GitHub Pages는 서버를 실행할 수 없으므로 Pages 버전은 여러 방문자 사이의 데이터를 동기화하지 않습니다. 외부 DB나 API 키 없이 과제의 지도 탐색, 공개 seed, 기억 CRUD, 사진, 필터, 내 기억 지도를 직접 시연하는 용도입니다.

## 지도 구성

- **Main map:** MapLibre GL JS
- **Base map:** 조정의 `기본 / 다크 / 자세히`에서 선택합니다. 기본은 부드러운 회청색, 다크는 차콜 톤의 같은 울산 SVG 도로·건물 지도입니다. 자세히와 범위 밖·데이터 실패 fallback에는 `https://tile.openstreetmap.org/{z}/{x}/{y}.png` raster tiles를 사용합니다. 세 모드는 같은 카메라와 기억 마커를 공유합니다. Worker 모드의 raster 요청은 `/api/map-tiles`를 경유합니다.
- **Place search:** Photon(OpenStreetMap 데이터), 서버 Route Handler 경유
- **Panorama:** NAVER Maps Panorama, 사용자가 거리뷰를 열 때만 lazy load

`components/memories/map.tsx`의 container size 동기화와 raster compatibility layer는 일부 내장 브라우저에서 WebGL 초기화가 끝나지 않아도 빈 지도가 되지 않도록 유지하는 런타임 호환성 코드입니다.

## Privacy

- 공개 지도와 장소 조회는 서버에서 항상 `visibility = 'public'`을 강제합니다.
- private와 unlisted 기억 및 그 사진은 작성자만 읽을 수 있습니다.
- 생성·수정·삭제의 작성자는 클라이언트 입력이 아니라 인증된 session 사용자로 결정합니다.
- 익명 공개 응답에는 `user_id`, 이메일, 프로필 정보가 포함되지 않습니다.
- 대략적 위치는 원좌표와 공개 좌표를 별도로 저장하며, 공개 DTO에는 반올림된 공개 좌표만 전달합니다.
- media 응답은 DB의 공개 범위와 소유권을 다시 확인하고 내부 `storage_key`를 노출하지 않습니다.
- 업로드는 파일 수, 크기, 허용 MIME 유형을 서버에서 검사합니다.

## 요구 사항

- Node.js 22.13 이상
- pnpm 11.19
- 인터넷 연결: 최초 dependency 설치, 지도 tile, 장소 검색, NAVER Panorama에 필요

Cloudflare 계정이나 외부 API key 없이 로컬 D1/R2와 NAVER 미설정 상태로 핵심 기능을 실행할 수 있습니다.

## Local Setup

```bash
git clone <repository-url>
cd <repository-directory>
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm db:setup
pnpm dev
```

브라우저에서 `http://localhost:5173`을 엽니다. `db:setup`은 Worker production build, 로컬 D1 migration, idempotent 울산 seed를 순서대로 실행합니다. 로컬 D1/R2 상태는 Git에서 제외된 `.wrangler/` 아래에 보관됩니다.

로컬 로그인은 외부 계정을 만들지 않습니다. `/login`의 로그인 버튼이 로컬 전용 가상 사용자 `seedy@sites.test` session을 설정합니다. 이 값은 개발 middleware 안의 fixture이며 운영 credential이나 자동 로그인 계정이 아닙니다.

### Database 초기화

```bash
# build가 이미 있는 경우 개별 실행
pnpm db:migrate
pnpm db:seed

# 로컬 데이터까지 완전히 다시 만들려면 .wrangler를 제거한 뒤 재실행
rm -rf .wrangler
pnpm db:setup
```

`rm -rf .wrangler`는 로컬 개발 데이터 전체를 지우므로 필요한 경우에만 실행합니다. migration과 seed는 여러 번 실행해도 같은 fixture가 중복되지 않습니다.

## Environment Variables

`.env.example`과 실제 런타임이 사용하는 공개 환경변수는 다음 하나입니다.

| 변수 | 필수 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID` | 아니요 | NAVER Maps Web SDK의 브라우저 공개용 Client ID |
| `VITE_NAVER_MAPS_CLIENT_ID` | 아니요 | GitHub Pages 정적 빌드에서 사용하는 같은 종류의 공개 Client ID |

NAVER Client Secret, API secret, DB credential을 `NEXT_PUBLIC_*`에 넣지 마세요. Client ID가 비어 있어도 메인 지도와 기억 기능은 정상 실행되고 거리뷰만 설정 안내 상태가 됩니다.

## Database

### `memories`

기억의 작성자, 본문, 장소명, 날짜, 감정, 공개 범위, 익명 여부, 위치 정밀도, 원좌표와 공개 좌표, 생성·수정 시각을 저장합니다. 공개 viewport 조회용 `(visibility, public_longitude, public_latitude)` index와 사용자 날짜 조회용 index가 있습니다.

### `memory_media`

기억별 R2 object key, media type, MIME, 크기, 순서와 생성 시각을 저장합니다. 브라우저에는 media ID와 권한을 검사하는 `/api/media/:id` URL만 전달합니다.

`drizzle/0000_charming_sunfire.sql`이 schema를 만들고 `drizzle/seed.sql`이 울산 시연 데이터를 입력합니다.

## 울산 Demo Data

seed에는 실제 개인과 무관한 가상 이야기만 들어 있습니다. 공개 예시는 23개이며 5개에는 사진이 있습니다. 추가 예시와 미디어 목록은 `src/features/memories/demo-catalog.ts`를 Pages/서버가 공유하고, D1은 첫 공개 조회에서 중복 없이 추가합니다. Pages v2 업그레이드는 기존 기록을 보존하면서 예시·예시 사진만 추가합니다.

- 태화강 국가정원·산책로: 50~100m 안에 날짜, 감정, 익명 여부가 다른 공개 기억 5개
- 울산대공원, 대왕암공원, 일산해수욕장, 성남동, 울산대학교 주변의 공개 기억
- 날짜 미상 기억과 대략적 위치 기억
- 여러 가상 작성자의 공개 기억
- 로컬 가상 사용자가 소유한 주택가 골목의 private 기억

## Demo Scenario

5분 발표에서는 다음 순서가 안정적입니다. 최신 화면의 자세한 조작 순서는 [DEMO-GUIDE.md](DEMO-GUIDE.md)에 있습니다.

1. 앱을 열어 울산 fallback, OSM 지도, 공개 marker를 확인합니다.
2. 태화강 국가정원 marker를 선택해 장소 미리보기를 열고, `이 장소의 다른 기억 보기`에서 여러 날짜·감정의 기억을 보여 줍니다.
3. `울산대공원`을 검색해 지도가 이동하는 것을 보여 줍니다.
4. 연도 또는 감정 필터를 적용한 뒤 초기화합니다.
5. 로컬 로그인 후 지도에서 위치를 선택하고 private 기억을 작성합니다.
6. 내 기억 지도에서 공개 범위·연도·감정 필터, 상세, 수정 흐름을 보여 줍니다.
7. public 지도에서 방금 만든 private 기억이 나타나지 않는 것을 확인합니다.
8. NAVER Client ID가 설정된 시연 환경에서만 거리뷰와 항공뷰를 열고 닫은 뒤 MapLibre 지도가 유지되는 것을 보여 줍니다.

발표 직전에는 인터넷이 필요한 OSM tile, Photon 검색, NAVER Panorama를 먼저 확인하세요. DB, 로그인, 기억 CRUD, 필터와 내 기억 조회는 로컬 Worker와 D1/R2에서 동작합니다.

## 품질 검증

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build

# 위 네 단계를 순서대로 실행
pnpm check
```

`.github/workflows/ci.yml`도 Node 22.13과 pnpm lockfile을 사용해 push와 pull request마다 같은 네 단계를 실행합니다. 현재 자동화 테스트는 NAVER SDK의 미설정·실패·재시도·중복 로드와 Panorama 좌표 DTO 경계를 검증하며 실제 외부 API key를 요구하지 않습니다.

### 브라우저 UI 검증

```bash
# 최초 1회: 테스트용 브라우저 설치
pnpm exec playwright install chromium webkit
pnpm test:ui --workers=1
```

테스트가 Pages 빌드와 `http://127.0.0.1:4173/yeoun_2/` 미리보기를 실행합니다. Chromium은 기존 기능 전체를, WebKit은 지도 선 두께·위치 핀·작성 화면의 호환성을 각각 데스크톱/모바일에서 검사합니다. 캡처는 `test-results/screenshots/`, HTML 결과는 `pnpm test:ui:report`에서 확인합니다. WebKit 모바일 검증은 실제 iPhone 테스트를 대체하지 않습니다.

[Safari 지도·작성 화면 수정 및 검증 기록](docs/design/YURANG-SAFARI-FORM-FIX.md)

[작성 CTA·조각 숨김·내 기억·감정 접힘·사진 경고 보완](docs/design/YURANG-USABILITY-REFINEMENT.md): 내 기억은 전체 지도로 시작하고 하단 기억 목록에서 필터와 기록을 펼칩니다. 상단 지도로 돌아가기 버튼으로 공개 지도에 복귀합니다. WebKit 검사에는 이 사용성 흐름도 포함됩니다.

### GitHub Pages 배포

GitHub Actions의 **Deploy GitHub Pages → Run workflow**에서 `redesign/yeoun-2` 브랜치를 선택해 수동 실행합니다. `.github/workflows/pages.yml`은 한 작업에서 정적 앱 빌드 → Pages artifact 업로드 → 공개 게시를 순서대로 수행합니다. 기존 `github-pages` 환경의 브랜치 제한과 권한을 유지하며 `main`은 보존합니다.

```bash
pnpm build:pages
```

정적 산출물은 `dist-pages/`에 생성됩니다. Pages의 기억 데이터와 사진은 IndexedDB에 저장되므로 브라우저 데이터 삭제 시 함께 초기화됩니다. NAVER 거리뷰를 사용할 경우 저장소 Actions variable `NAVER_MAPS_CLIENT_ID`와 NAVER Cloud의 Web Service URL에 `https://adammyun.github.io`를 등록해야 합니다.

## Project Structure

```text
app/api/                  인증된 Route Handler와 public API
components/               지도, 기억, 장소, Panorama UI
github-pages/             GitHub Pages entry와 Next 호환 shim
src/features/             DTO, Zod schema, client API와 feature logic
src/server/               D1/R2 repository 및 권한·업로드 경계
db/                       Drizzle D1 schema
drizzle/                  versioned migration과 idempotent seed
tests/                    외부 key 없이 실행되는 자동화 테스트
.github/workflows/        GitHub Actions 품질 검증
```

## Known Limitations

- 현재 공개 프리뷰 어댑터는 Cloudflare D1/R2와 Sign in with ChatGPT 런타임에 맞춰져 있습니다.
- 지도 tile과 장소 검색은 인터넷 연결 및 각 공개 provider의 가용성에 의존합니다.
- OSM standard tile을 대량 내려받거나 prefetch하지 않으며 과제 시연 수준의 요청만 전제로 합니다.
- NAVER Panorama는 별도 Web SDK Client ID, 등록된 Web Service URL, 해당 위치의 거리뷰 제공 여부에 의존합니다.
- NAVER Client ID가 없는 기본 clone에서는 거리뷰 설정 안내만 확인할 수 있습니다.
- 이메일·비밀번호 자체 인증, OAuth provider 선택, 이메일 인증, password reset은 이 배포 타깃에 없습니다.
- production cloud infrastructure 구성과 공개 GitHub 저장소 생성은 애플리케이션 코드 범위 밖입니다.
- 브라우저와 내장 preview에 따라 정밀 geolocation 지원 여부가 다릅니다.

## Attribution

지도 데이터와 standard raster tile: [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)

장소 검색: [Photon](https://photon.komoot.io/) · © OpenStreetMap contributors

OpenStreetMap tile은 화면에 필요한 범위만 요청하며 offline download, bulk prefetch, tile scraping을 구현하지 않습니다.

## yeoun_2 리디자인

Memory Atlas — Spatial Paper: 어두운 전체 지도, 사진/글 스탬프, 맥락 미리보기, 감정 색조와 비대칭 읽기 장면을 사용합니다. 실제 기억 API·검색·사진 작성·내 기억 CRUD를 재사용합니다. [구현 및 검증 기록](docs/design/MEMORY-ATLAS-IMPLEMENTATION.md)을 참고하세요.

## 숨겨진 개발 도구

지도 상태 문구(울산광역시 · 공개된 기억)를 2초 안에 빠르게 5번 클릭하거나 탭하면 `/dev`가 열립니다. 튜토리얼과 환경 상태를 확인하는 보조 화면이며 관리자 권한이나 DB 관리 기능을 제공하지 않습니다.

## 마이페이지와 기억 반응

실서비스 로그인 화면에서 **게스트로 시작**을 누르면 ChatGPT 계정 없이 시연할 수 있습니다. 세션은 같은 브라우저에서 7일간 유지되며 로그아웃·만료·쿠키 삭제 후 게스트 기록의 관리 권한은 복구할 수 없습니다. 기존 계정 로그인은 그대로 사용할 수 있습니다. Pages의 게스트는 브라우저 안에만 저장하는 시연판입니다. [게스트 로그인·검증 안내](docs/operations/GUEST-LOGIN.md)를 참고하세요.

하단 내 기억은 현재 지도를 유지한 패널입니다. 기본 표시는 내 기억이며 북마크/좋아요 체크박스를 함께 선택할 수 있습니다. 패널을 닫아도 지도 선택은 유지되고 하단 지도를 누르면 공개 탐색으로 돌아갑니다. `/my-map` 직접 주소도 같은 개인 공간을 엽니다. 자세한 데이터 정책과 검증은 [개인 공간 안내](docs/operations/PERSONAL-SPACE.md)를 참고하세요.

## 기억 묶음과 감정 메뉴

가까운 지도 기억은 화면상 종이 크기를 기준으로 묶고 확대하면 분리합니다. 감정 메뉴는 8가지를 제공하며 마이페이지에서 자주 사용할 항목을 저장하고 내 기록의 감정도 수정할 수 있습니다. Sites의 설정은 계정별 DB, Pages 시연판은 해당 브라우저에 저장됩니다. 추가 migration은 `0004_emotion_menu_preferences.sql`이며 기존 `pnpm db:migrate`에 포함됩니다. 공개 예시 기억 23개에는 익명 댓글이 2개씩 준비되어 있고 처음 읽을 때 중복 없이 추가됩니다.

[변경 범위·거리뷰 예시 위치의 한계·검증 기록](docs/design/memory-density/README.md)을 참고하세요. 로컬 계정 설정 검사는 개발 서버 실행 후 `node scripts/verify-emotion-preferences.mjs http://localhost:5197`로 실행합니다. 이 검사는 localhost만 허용하며 검사 후 원래 설정을 복원합니다.
