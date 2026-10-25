# 기억에 남기는 말

## 사용 흐름

개별 기억을 읽은 뒤 `댓글`을 누르면 그 기억의 거리뷰와 댓글 패널이 열린다. 일반 `거리뷰` 진입에서는 패널을 접어 두고 `댓글` 버튼으로 열고 닫는다. 주변을 이동해도 댓글 대상은 선택했던 기억이다. 파노라마 위치나 방향이 다른 기억에 댓글을 연결하지 않는다.

NAVER 설정·인증·네트워크 또는 주변 촬영 자료 때문에 거리뷰를 제공할 수 없으면 `기억 상세에서 댓글 보기`로 동일한 기억을 연다. 상세 안의 같은 댓글 컴포넌트를 사용한다. 장소의 여러 포스트잇 미리보기와 지도 마커에는 댓글·반응 수를 추가하지 않는다.

댓글은 앱의 HTML 패널로 SDK가 관리하는 canvas 밖, 같은 거리뷰 stage 위에 겹친다. NAVER 영상·로고·저작권이나 SDK 내부 DOM을 편집하지 않는다. 상단 SDK 조작부와 하단 저작권 영역을 비워 두고 모바일에서는 패널을 아래에 둔다. 패널을 접으면 전체 파노라마를 조작할 수 있다. [공식 Panorama 문서](https://navermaps.github.io/maps.js.ncp/docs/tutorial-Panorama.html)

## 권한과 개인정보

- 공개 기억의 댓글은 누구나 읽는다. 비공개·미등록 기억은 작성자만 댓글을 조회·작성한다.
- 댓글 작성과 삭제에는 로그인이 필요하다. 서버 인증 정보로 작성자를 결정하며 클라이언트의 사용자 식별자는 받지 않는다.
- 댓글 작성자는 항상 `익명의 여행자`로 표시한다. 본인에게만 `나`와 삭제 버튼이 보인다. 응답 필드는 `id`, `content`, `createdAt`, `owned`뿐이다.
- 기억이 비공개로 바뀌면 기존 댓글 작성자도 그 기억의 소유자가 아니면 읽거나 삭제할 수 없다.
- 서버는 조회·쓰기 SQL에 기억 접근 조건을 다시 적용한다. 다른 사람의 댓글 삭제는 404, 로그인 없는 쓰기는 401이다.
- 1–1000자, 공백 정리, plain text 표시, Zod 검증, same-origin 쓰기 제한. HTML로 삽입하지 않는다.
- 댓글은 위치를 저장하거나 반환하지 않는다. 거리뷰는 기존의 권한이 적용된 기억 좌표만 사용한다.

## 저장소와 배포

실서비스: D1의 `memory_comments(id, memory_id, user_id, content, created_at)`. memory FK는 cascade, 한 기억의 시간순 페이지 조회를 위한 `(memory_id, created_at, id)` index 한 개. `drizzle/0002_memory_comments.sql`은 추가형 migration이며 `pnpm db:migrate`에 포함한다. 기존 실서비스 DB는 동일한 idempotent 초기화로 안전하게 테이블을 준비한다. 계정·기억·사진 테이블의 데이터는 재작성하지 않는다.

Pages 시연판: IndexedDB v5의 `comments` store와 `memoryId` index. 기존 기억과 사진·반응을 유지하며 업그레이드한다. 시연판 댓글은 해당 브라우저에만 저장되며 실서비스에 자동 전송하지 않는다. 두 환경에서 기억을 삭제하면 연결된 댓글도 정리된다.

`GET /api/memories/:id/comments?cursor=…`: 최대 30개와 다음 cursor. 전체 수나 작성자 식별자를 반환하지 않는다. `POST`는 content만 받고, `DELETE /api/memories/:id/comments/:commentId`는 본인 댓글만 지운다. 조회 캐시는 private/no-store이다.

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
