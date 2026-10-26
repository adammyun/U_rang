# 거리뷰 지점 댓글과 반응 한 줄

## 변경

- 개별 상세에서 별도 댓글 버튼을 제거했다. 좋아요·북마크·거리뷰 버튼을 동일한 형태로 한 줄에, 조회수는 오른쪽 끝에 배치했다. 작은 화면의 버튼은 44px 조작 영역을 유지한다.
- 거리뷰 댓글은 처음부터 열리며 접어도 입력 중인 글을 보존한다. 짧은 클릭/탭으로 지점을 고르고, 드래그·핀치·SDK 확대/전환/경로 화살표는 기존 조작을 유지한다.
- 댓글 hover/focus → 지점 강조, 지점 hover/focus → 댓글 팝업. 모바일은 탭과 지점 보기 버튼을 사용한다. 시야 밖/다른 장면은 public SDK로 해당 장면·방향을 바라본다.
- 실제 3D 건물 좌표가 아니라 촬영 장면 ID와 방향을 저장한다. 다른 장면이나 카메라 뒤에는 표식을 그리지 않는다. 기존 일반 댓글과 접근 권한은 보존한다.
- 대략 위치 기억은 작성자의 거리뷰도 공개 격자에서 시작한다. 기존 원본 좌표를 자동으로 저장된 장면 ID에 드러내지 않는다. 사용자 현재 위치는 저장하지 않는다.

## 파일

- `components/memories/memory-activity.tsx`, `spatial-panels.tsx`: 반응 한 줄/상세 진입
- `components/memories/panorama-annotations.tsx`, `panorama-viewer.tsx`, `memory-comments.tsx`: 지점 선택/표식/양방향 강조/입력 보존
- `src/features/panorama/projection.ts`, `naver-maps.ts`, `target.ts`: 투영·public SDK·대략 위치 보호
- `src/features/memories/comments-*`, `browser-store.ts`, `src/server/comments.ts`, 댓글 Route Handler: 선택적 지점 DTO와 저장
- `db/schema.ts`, `drizzle/0003_comment_panorama_anchors.sql`: 기존 댓글과 분리된 1:1 optional 지점 테이블. 기존 기억/댓글 데이터는 재작성하지 않는다.

## 검증

Chromium/WebKit, 데스크톱 1440×900·모바일 390×844에서 댓글·마이페이지·장소 포스트잇 **44/44 통과**. 패널 재열기 후 작성 중인 글 유지 및 지점 상호작용을 추가한 **8/8 재검사 통과**. 화면 캡처에서 한 줄 반응, 지점 미리보기, 모바일 여백과 패널을 확인한다.

로컬 D1 migration과 API 검사는 지점 저장/조회/cascade, 익명 DTO, 잘못된 방향/식별자 위조/교차 출처 차단, private/unlisted 접근 차단, 본인 댓글 삭제 및 페이지 조회를 통과했다.

단위 투영 검사는 -179°/179° 경계, 틸트, 줌, 세로/가로 화면의 픽셀↔방향 왕복 및 화면 밖 숨김을 확인한다. SDK 테스트 대역으로 UI를 검증한 PNG는 실제 거리뷰 영상 캡처와 구분한다. 실제 계정 로그인 뒤의 서버 작성은 로컬 모의 인증과 구분해 보고한다.

근거와 동작 계약: `docs/operations/MEMORY-COMMENTS.md`.
