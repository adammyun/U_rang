# 여운 기능 기준선

작성일: 2026-10-12

기준 커밋: `07814a4`

## 1. 목적

이 문서는 UX/UI 리디자인 중 반드시 보존할 현재 동작을 acceptance baseline으로 정의한다. 시각 표현은 바꿀 수 있지만 이 문서의 상태 전이, 데이터 경계, 개인정보 규칙은 의도적인 제품 결정 없이는 바꾸지 않는다.

표기:

- **P0**: 누락되면 핵심 제품이나 개인정보 경계가 깨짐
- **P1**: 주요 사용자 여정 또는 과제 시연이 깨짐
- **P2**: 보조 경험 또는 편의 기능

## 2. 런타임 기준선

| 항목 | Worker/App Router | GitHub Pages |
| --- | --- | --- |
| 공개 지도 | 지원 | 지원 |
| 로그인 | ChatGPT hosting auth | 브라우저 로컬 시연 세션 |
| 기억 저장 | D1 | IndexedDB |
| 사진 저장 | R2 | IndexedDB data URL |
| 내부 경로 | pathname | hash path |
| 장소 검색 | Photon proxy | 울산 고정 장소 목록 |
| 상세 raster tile | server proxy | OSM 직접 URL |
| 사용자 간 공유 | 서버 데이터 범위에서 가능 | 불가능 |

리디자인은 양쪽 빌드에서 같은 화면 컴포넌트가 동작해야 한다.

## 3. 공개 지도 여정

### P0: 초기 지도

- 첫 중심은 울산 `129.3114, 35.5384`, zoom `11.4`다.
- 기본 지도 표현은 `calm`이다.
- MapLibre가 정상 load되지 않아도 raster fallback이 실제 크기로 보인다.
- OSM, OpenMapTiles, OpenFreeMap attribution이 지도 위에서 읽을 수 있어야 한다.
- 지도 container는 전체 화면을 채우고 320px 폭부터 동작해야 한다.

### P0: viewport 데이터

- map `moveend` 뒤 현재 bounds에 필요한 공개 기억만 조회한다.
- query bounds는 화면 경계보다 30% 확장된다.
- 요청 전환 시 이전 요청을 abort한다.
- private와 unlisted는 목록, marker, count에 나타나지 않는다.
- 실패 시 오류 상태와 재시도 control을 제공한다.

### P1: marker

- 단일 기억은 감정 색을 가진 trace marker로 표시한다.
- 화면상 34px 이내 marker는 count marker로 합쳐진다.
- marker 선택은 map click의 기억 작성과 구분돼야 한다.
- calm/detail 전환 후에도 동일한 marker 위치와 선택 상태를 유지한다.
- 선택 장소의 관련 marker는 highlight된다.

### P1: 지도 control

- 확대, 축소
- 현재 위치 이동
- 장소 검색
- 지도 조정 sheet
- 핵심 CTA인 기억 남기기

### P1: 현재 위치

- 브라우저 geolocation 성공 시 현재 위치 marker와 `내 주변` 상태를 표시한다.
- 권한 거부, timeout, 미지원 시 울산 중심으로 돌아가고 안내 toast를 표시한다.
- 위치 권한을 앱이 임의로 우회하거나 강제하지 않는다.

## 4. 탐색과 필터

### 장소 검색

- 입력은 2자 이상일 때 300ms debounce 후 검색한다.
- 결과는 장소명, 설명, 좌표를 가진다.
- 선택하면 지도는 zoom `14.2`로 이동한다.
- 선택 장소 card에서 그 위치에 기억 작성을 시작할 수 있다.
- 검색 실패와 결과 없음은 구분해 표시한다.

Worker에서는 Photon과 OSM attribution을 표시한다. Pages에서는 현재 울산 고정 목록을 검색하지만 같은 결과 UI를 쓴다.

### 공개 지도 filter

- 지도 표현: 간결 / 상세
- 연도: 전체 또는 한 해
- 감정: 복수 선택
- active filter 개수와 초기화
- 적용 시 기존 장소/상세 선택을 닫고 기억을 다시 조회
- URL에 `year`, `emotion`을 반영

### 내 지도 filter

- 공개 범위: 전체 / public / private / unlisted
- 연도
- 감정 복수 선택
- active filter count와 초기화
- 날짜가 없는 기억은 별도 archive group

## 5. 기억 작성 여정

### 진입 방식

1. 지도 위치를 직접 click 또는 길게 누른다. **2026-10-22 사용자 변경으로 이 자동 작성 진입은 제거: CTA 위치 선택 중에만 핀 이동에 사용.**
2. 장소 검색 결과를 선택한 뒤 작성한다.
3. 핵심 CTA를 누르고 pending marker를 이동·확정한다.
4. 내 지도에서도 CTA → 핀 이동·확정 → 작성 순서로 추가한다(2026-10-22 변경).

미인증 상태에서 작성하면 로그인 화면으로 이동한다.

### 위치 선택

- CTA 진입은 form을 즉시 열지 않고 먼저 위치 선택 상태를 제공한다.
- pending marker 상태에서 map click이나 marker click은 위치를 옮긴다.
- 확정하면 `MemoryForm`이 열린다.
- 취소하면 pending state가 해제된다.
- 검색 결과에서 작성하면 장소 이름이 미리 입력된다.

### form 필드와 검증

| 필드 | 기준 |
| --- | --- |
| 장소 이름 | 최대 160자, 빈 값은 기본 이름으로 변환 |
| 제목 | 필수, 1~100자 |
| 내용 | 필수, 1~10,000자 |
| 날짜 | 선택, ISO date |
| 감정 | 8개 enum 중 하나 |
| 공개 범위 | 현재 UI는 private/public |
| 익명 | public일 때만 의미 있음 |
| 위치 정밀도 | create에서 exact/approximate |
| 사진 | 최대 5개, JPG/PNG/WEBP, 각 5MB 이하 |

- field error와 전체 error가 구분돼야 한다.
- 저장 중에는 중복 제출과 닫기를 방지한다.
- 작성 내용은 API 오류만으로 초기화하지 않는다.
- 새 사진은 metadata를 제거하고 최대 1600px WEBP로 변환한다.
- preview URL은 form unmount 시 해제한다.

### 저장 후

- 새 기억 상세가 열린다.
- public 기억은 공개 지도 marker와 목록에 즉시 반영된다.
- private 기억은 공개 지도에 나타나지 않는다.
- 성공 toast가 공개 범위에 따라 달라진다.

## 6. 장소별 기억과 상세

### 장소 그룹

- 선택 좌표의 기본 100m 안에 있는 public 기억만 조회한다.
- 최대 30개를 timeline에 표시한다.
- 장소 이름, 총 개수, 더 있음 여부, 감정별 개수를 제공한다.
- 개별 기억은 제목, 본문 preview, 날짜, 감정, 익명 여부, 거리, 첫 사진을 표시한다.
- loading, error, empty 상태를 제공한다.

### 기억 상세

- 감정, 장소, 제목, 날짜, 본문을 표시한다.
- 사진은 1장과 여러 장 layout을 구분한다.
- 긴 본문과 여러 사진은 sheet 안에서 scroll된다.
- scroll progress가 표시된다.
- 장소 그룹에서 들어온 상세에는 `뒤로` control이 있어 목록으로 돌아간다.
- 닫기는 전체 상세 flow를 닫는다.
- 지도에서 이 장소 보기와 Panorama 진입이 있다.
- owner 상세에는 수정과 삭제가 있다.

### Panorama

- 사용자가 요청할 때만 NAVER SDK를 load한다.
- Client ID 없음, script 실패, 해당 위치 panorama 없음 상태를 각각 처리한다.
- retry와 닫기를 제공한다.
- DTO에 이미 허용된 lat/lng만 SDK에 전달한다.
- Panorama를 닫아도 MapLibre 지도 상태가 유지돼야 한다.

## 7. 내 기억 관리

- `/my-map`은 Worker에서는 인증이 필요하고 Pages에서는 local session이 필요하다.
- owner가 작성한 모든 공개 범위를 볼 수 있다.
- owner에게는 정확한 좌표를 표시한다.
- 기억을 선택하면 marker로 이동하고 상세를 연다.
- 수정에서는 제목, 내용, 날짜, 감정, 공개 범위, 익명, 사진을 바꾼다.
- 현재 수정 flow는 위치와 위치 정밀도를 유지한다.
- 삭제 전 브라우저 확인을 거친다.
- 삭제 후 목록과 marker에서 즉시 제거한다.

## 8. 개인정보 및 권한 기준선

### P0 불변 조건

1. public map query는 `visibility='public'`만 반환한다.
2. private/unlisted는 owner가 아니면 상세, media, count 어디에도 나타나지 않는다.
3. 생성·수정·삭제 owner는 client가 보낸 user ID가 아니라 인증 context로 결정한다.
4. public DTO에는 user ID, 이메일, 프로필, raw coordinate field가 없다.
5. approximate public 기억은 public coordinate만 응답한다.
6. owner의 내 기억 query에서만 exact coordinate를 쓴다.
7. R2 storage key는 media API URL 뒤에 숨는다.
8. mutation은 same-origin 검사와 server validation을 거친다.
9. anonymous 여부를 UI 장식만으로 처리하지 않는다.

### Pages 제한

- private는 동일 browser profile 안의 local session 경계다.
- 사용자가 브라우저 저장소를 지우면 기억과 사진이 사라진다.
- 방문자 간 공개 기억 공유는 없다.
- 타인 approximate fixture에는 exact coordinate를 bundle/IndexedDB에 넣지 않는다.

## 9. 온보딩과 개발 보조 화면

### 첫 사용자 tutorial

- 총 10단계다.
- localStorage 완료 상태를 사용한다.
- query `tutorial=1`은 완료 상태와 무관하게 강제 실행한다.
- 실제 대상 element를 spotlight하며 대상이 없으면 중앙 panel로 fallback한다.
- Escape, 좌우 방향키, Tab focus loop를 지원한다.
- map 안내 단계에서는 지도 interaction을 허용한다.
- `prefers-reduced-motion`에서는 motion을 줄인다.

### 개발 보조 화면

- brand 주변 숨은 hotspot을 2초 안에 5회 누르면 `/dev`로 이동한다.
- 튜토리얼 완료 상태를 확인·초기화한다.
- 주요 화면 바로가기와 환경 설정 여부를 보여 준다.
- 관리자 권한이나 데이터 관리 기능이 아니다.

## 10. 접근성과 상호작용 기준선

- header와 주요 navigation에 accessible label이 있다.
- 공개/내 기억 목록으로 가는 skip link가 있다.
- Sheet/Dialog는 title과 description을 제공한다.
- close/back/icon button에는 accessible name이 있다.
- marker는 기억 제목 또는 장소와 개수를 aria-label로 제공한다.
- form field는 error와 `aria-invalid`, `aria-describedby`로 연결된다.
- keyboard focus-visible style을 유지한다.
- touch target과 mobile bottom sheet grip을 유지한다.
- reduced motion 사용자는 불필요한 animation을 받지 않는다.

현재 자동 접근성 검사는 없으므로 이는 코드에서 확인한 의도이며 전체 준수 인증이 아니다.

## 11. 현재 검증 명령과 결과

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build:pages

# 전체
pnpm check
```

2026-10-12 기준 `pnpm check` 결과:

- lint: pass
- typecheck: pass
- tests: 10 pass, 0 fail
- Worker/App Router build: pass
- GitHub Pages build: pass
- build warning: 정적 main bundle이 500KB 기준을 초과

## 12. 리디자인 전 추가해야 할 회귀 검사

현재 테스트만으로 리디자인 안전성을 보장할 수 없다. 구현 착수 전에 최소한 다음 smoke test를 고정한다.

| 우선순위 | 시나리오 | viewport |
| --- | --- | --- |
| P0 | 공개 지도 load, 울산 marker, private 미노출 | 390×844, 1440×900 |
| P0 | CTA → 위치 선택 → private/public 기억 생성 | 390×844 |
| P0 | 긴 본문 + 사진 상세 scroll, 뒤로, 닫기 | 390×844 |
| P0 | owner 수정·삭제, 정확 좌표 | 390×844, 1440×900 |
| P0 | Worker와 Pages 양쪽 build/runtime | 두 runtime |
| P1 | marker group → 장소 timeline → 상세 → 뒤로 | 두 viewport |
| P1 | calm/detail 전환 후 marker 일치 | 두 viewport |
| P1 | 검색 → 장소 선택 → 작성 | 두 runtime |
| P1 | geolocation 성공·실패 fallback | browser mock |
| P1 | filter URL 유지와 새로고침 | 두 runtime |
| P1 | keyboard-only Sheet/Dialog/form | desktop |
| P2 | tutorial 10단계 target alignment | 두 viewport |

## 13. 현재 확인하지 못한 기준

다음 값은 코드만으로 성공 기준을 정할 수 없다.

- 목표 사용자군의 최소 기기 폭과 지원 브라우저 목록
- WCAG 목표 등급
- 성능 예산과 목표 Core Web Vitals
- 실제 사진 수·크기·기억 수의 운영 상한
- 시각 디자인 선호안과 브랜드 자산
- analytics event 이름과 리디자인 성과 지표

로드맵 시작 시 제품 결정으로 확정해야 한다.

## 2026-10-22 장소 미리보기 사용자 변경

한 기억 미리보기 → `이곳의 이야기 N편` → 장소 목록 모달의 두 단계를 `PlaceNoteBoard`로 통합한다. 장소 응답의 각 기억을 바로 카드로 펼치며 X 대신 빈 지도 클릭·탭/Escape로 닫는다. 카드 선택 → 상세, 상세 뒤로가기/다른 기억 읽기 → 보드, 상세 닫기 → 지도, 지도에서 보기·거리뷰·감정 요약은 유지한다. 종이 backing의 미세 회전과 위치만 열 때마다 달라지며 텍스트 회전은 없다. 장소별 공개 조회의 반경·개수 제한·anonymous/approximate 정책은 변경하지 않는다.


2026-10-25 사용자 요청으로 기억 댓글을 추가한다. 선택한 기억에 연결된 접이식 거리뷰 패널을 우선하고, 거리뷰 실패 시 같은 개별 상세로 돌아가 댓글을 연다. 장소 포스트잇/지도 조각에는 반응이나 댓글 영역을 넣지 않는다. 로그인·익명 작성자 DTO·private/unlisted 소유자 경계를 지킨다. 상세/거리뷰 sibling key는 각각 독립 namespace를 사용한다. 구현 계약은 `docs/operations/MEMORY-COMMENTS.md`에 기록한다.


## 2026-10-26 추가 계약

2026-10-27 인증 보완: 호스팅 계정 로그인과 별도로 브라우저별 게스트 세션을 허용한다. 모든 쓰기·비공개 읽기는 검증된 서버 사용자 ID를 사용하고 실제 계정과 게스트 기록을 합치지 않는다. Pages는 기존 로컬 시연 세션을 보존한다. 상세 계약은 [게스트 로그인](../operations/GUEST-LOGIN.md)에 기록한다.

- 지도 조각은 화면 크기 기준으로 묶으며 묶음 클릭·확대·기존 장소 보드 흐름을 유지한다. 기본/다크/자세히는 단일 마커 데이터를 공유한다.
- 기본 감정 메뉴는 8개. 마이페이지의 표시 항목 설정은 기록과 조회 조건을 바꾸지 않는다. 현재 필터는 계속 노출한다. 내 기록 감정 수정은 기존 owner-only 수정 경계를 사용한다.
- 계정 설정 API는 인증 사용자 자신의 값만 반환한다. Pages 설정은 서버와 동기화되지 않는다.
- 23개 예약 공개 예시에만 2개씩 익명 댓글을 추가한다. private·unlisted 및 일반 사용자 기록에 임의 댓글을 만들지 않는다.
- 실제 지점 댓글은 저장된 장면 ID와 시선 방향을 유지한다. 예시 댓글의 지점은 첫 실제 거리뷰 장면에만 연결한 설명용 위치이며 실제 촬영 대상의 사실 정보가 아니다.
- 검증 상세: [기억 밀도 보완](memory-density/README.md).
