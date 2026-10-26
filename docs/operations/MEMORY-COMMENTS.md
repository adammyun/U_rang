# 기억에 남기는 말

## 사용 흐름

개별 상세의 `좋아요 · 북마크 · 거리뷰`를 한 줄로 표시하고 조회수는 오른쪽 끝에 둔다. 별도 댓글 버튼은 없다. `거리뷰`를 열면 댓글 패널을 바로 읽고 접을 수 있다.

패널이 열린 동안 거리뷰 배경의 짧은 클릭/탭은 해당 장면의 지점을 선택한다. 드래그·핀치는 거리뷰 조작을 유지하며, 확대/축소·AroundControl·SDK 경로 화살표를 클릭 대상으로 처리하지 않는다. 선택한 지점 표식과 작성창 안내를 확인하고 댓글을 저장한다. 일반 댓글도 계속 남길 수 있다.

댓글 카드 hover/keyboard focus는 지점을 강조한다. 지점이 시야 밖이면 해당 방향을 바라보고, 다른 촬영 장면이면 그 장면으로 이동한다. 표식 hover/focus는 댓글 미리보기를 열고 클릭/탭하면 목록의 댓글을 강조한다. 모바일 `지점 보기`는 패널을 접고 장면과 댓글 팝업을 보여 준다. 댓글 패널을 접어도 작성 중인 글은 유지한다.

지점은 픽셀이 아닌 `{panoId, pan, tilt}`로 저장한다. public SDK의 `getPanoId()`, `getPov()`, `setPov()`, `setPanoIdWithPov()`와 변화 이벤트를 사용하며, 자체 rectilinear 투영으로 회전·줌·화면 비율에 맞춰 표식을 그린다. NAVER 3.10.5의 공개 배포 스크립트에서 fov가 긴 화면 변 기준임을 확인했다. 실행 코드에서 SDK 비공개 객체를 호출하지 않는다. SDK 경로 화살표 DOM은 클릭 제외 대상으로만 확인한다.

이것은 촬영 장면 안의 시선 방향 고정이다. 3D 깊이/실제 건물 좌표를 복원하거나 다른 사진 속 같은 건물을 자동 연결하지 않는다. 다른 장면·카메라 뒤·시야 밖의 지점은 잘못된 화면 위치에 표시하지 않는다. 불러온 댓글 페이지 안의 표식만 표시하며 `댓글 더 보기`로 추가한다. 기존 일반 댓글은 수정하거나 가짜 지점을 붙이지 않는다.

NAVER 설정·인증·네트워크 또는 주변 촬영 자료 때문에 거리뷰를 제공할 수 없으면 `기억 상세에서 댓글 보기`로 동일한 기억을 연다. 상세 안의 같은 댓글 컴포넌트를 사용한다. 장소의 여러 포스트잇 미리보기와 지도 마커에는 댓글·반응 수를 추가하지 않는다.

댓글은 앱의 HTML 패널로 SDK가 관리하는 canvas 밖, 같은 거리뷰 stage 위에 겹친다. NAVER 영상·로고·저작권이나 SDK 내부 DOM을 편집하지 않는다. 상단 SDK 조작부와 하단 저작권 영역을 비워 두고 모바일에서는 패널을 아래에 둔다. 패널을 접으면 전체 파노라마를 조작할 수 있다. [공식 Panorama 문서](https://navermaps.github.io/maps.js.ncp/docs/tutorial-Panorama.html)

## 권한과 개인정보

- 공개 기억의 댓글은 누구나 읽는다. 비공개·미등록 기억은 작성자만 댓글을 조회·작성한다.
- 댓글 작성과 삭제에는 로그인이 필요하다. 서버 인증 정보로 작성자를 결정하며 클라이언트의 사용자 식별자는 받지 않는다.
- 댓글 작성자는 항상 `익명의 여행자`로 표시한다. 본인에게만 `나`와 삭제 버튼이 보인다. 응답 필드는 `id`, `content`, `createdAt`, `owned`, `anchor`뿐이다. anchor는 null 또는 촬영 장면 ID·방향이며 사용자 식별자·원본 좌표를 포함하지 않는다.
- 기억이 비공개로 바뀌면 기존 댓글 작성자도 그 기억의 소유자가 아니면 읽거나 삭제할 수 없다.
- 서버는 조회·쓰기 SQL에 기억 접근 조건을 다시 적용한다. 다른 사람의 댓글 삭제는 404, 로그인 없는 쓰기는 401이다.
- 1–1000자, 공백 정리, plain text 표시, Zod 검증, same-origin 쓰기 제한. HTML로 삽입하지 않는다.
- 댓글 지점에는 실제 위경도·깊이·사용자 현재 위치를 저장하지 않는다. 대략 위치 기억의 거리뷰는 소유자도 공개 격자 좌표에서 시작해 원래 좌표가 자동으로 장면 ID에 인코딩되지 않도록 한다. 사용자가 직접 이동하고 선택한 촬영 장면은 댓글 콘텐츠의 일부다.

## 저장소와 배포

실서비스: D1의 `memory_comments(id, memory_id, user_id, content, created_at)`. memory FK는 cascade, 한 기억의 시간순 페이지 조회를 위한 `(memory_id, created_at, id)` index 한 개. `memory_comment_anchors(comment_id, pano_id, pan, tilt)`는 optional 1:1 extension으로, 댓글과 기억 삭제를 cascade한다. `drizzle/0002_memory_comments.sql`과 `0003_comment_panorama_anchors.sql`은 추가형 migration이며 `pnpm db:migrate`에 포함한다. 기존 실서비스 DB는 동일한 idempotent 초기화로 안전하게 테이블을 준비한다. 계정·기억·사진 테이블의 데이터는 재작성하지 않는다.

Pages 시연판: IndexedDB v5의 `comments` store와 `memoryId` index. 기존 일반 댓글은 anchor=null로 읽고 새 지점 댓글만 anchor 필드를 추가한다. 별도의 DB 초기화나 version 변경은 필요 없다. 기존 기억과 사진·반응을 유지하며 업그레이드한다. 시연판 댓글은 해당 브라우저에만 저장되며 실서비스에 자동 전송하지 않는다. 두 환경에서 기억을 삭제하면 연결된 댓글도 정리된다.

`GET /api/memories/:id/comments?cursor=…`: 최대 30개와 다음 cursor. 전체 수나 작성자 식별자를 반환하지 않는다. `POST`는 content와 선택적 anchor만 받고, `DELETE /api/memories/:id/comments/:commentId`는 본인 댓글만 지운다. 조회 캐시는 private/no-store이다.

## 확인 명령

```sh
pnpm db:migrate
pnpm dev --port 5197
# 별도 터미널: 임시 로컬 데이터만 생성하고 finally에서 정리
node scripts/verify-comments-service.mjs http://localhost:5197
pnpm check
pnpm test:ui tests/e2e/comments.spec.ts tests/e2e/place-notes.spec.ts tests/e2e/personal-space.spec.ts --workers=1
```

Playwright 댓글 패널 검사는 SDK 테스트 대역을 사용하므로 실제 NAVER 촬영 영상 검증과 구분한다. 거리뷰 실패→상세 전환은 대역 없이 검사한다. 로컬 서버 인증 검사는 로컬 전용 모의 로그인이다. 실서비스 계정 로그인 후 작성 검증은 별도로 구분해 보고한다.

답글·수정·알림은 이번 범위에 포함하지 않는다.

## SDK 근거와 검증 범위

[Panorama API](https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Panorama.html)의 public POV·장면 이동 메서드를 사용한다. [PanoramaProjection](https://navermaps.github.io/maps.js.ncp/docs/naver.maps.PanoramaProjection.html)은 위경도→POV만 제공하므로 클릭 지점의 위경도를 임의로 생성하지 않는다. 투영 계산은 179° 경계, 고개 각도, 줌, 가로·세로 화면의 왕복과 숨김 조건을 단위 테스트한다. 브라우저의 SDK 테스트 대역 검증과 실제 NAVER 영상에서의 확인을 구분한다.
