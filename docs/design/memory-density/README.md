# 기억 밀도·감정 메뉴·거리뷰 댓글 보완

2026-10-26 · `redesign/yeoun-2`

## 동작

지도 종이의 화면상 영역(120×140px, trace 40×40px) 안에 가까운 기억을 하나의 겹친 종이와 개수로 묶는다. 위치가 다른 묶음은 확대해 나누고 같은 장소는 기존 장소 포스트잇 보드로 읽는다. 단일 MapLibre, container size/ResizeObserver, raster compatibility, 울산 범위, OSM attribution과 기본/다크/자세히 전환을 보존한다.

공간 해시에서 기억마다 주변 9개 대표만 검사한다. 데이터나 zoom이 바뀔 때만 묶음을 다시 계산하고 pan은 화면 좌표 이동과 viewport culling만 한다. 모든 점 쌍을 매번 비교하던 경로를 제거했다. 20,000개 밀집 입력을 하나로 묶고 모든 항목 보존을 단위 검사했다. 기존 viewport API 상한 200개는 유지하며 서버 clustering이나 실제 기기 FPS 측정까지 구현·검증한 것은 아니다.

감정 메뉴는 그리움·평온·사랑·행복·슬픔·설렘·외로움·의미 있는 순간 8개다. 마이페이지의 감정 메뉴 설정은 표시 항목만 바꾼다. 최소 한 가지를 선택해야 저장되며 현재 적용한 감정 필터는 메뉴 설정과 무관하게 계속 표시된다. 감정 펼침·접힘·지도 조작 시 접힘은 유지한다. 내 기록의 ‘감정·기록 수정’은 기존 폼을 열고 저장·취소 후 같은 지도와 마이페이지로 돌아간다.

실서비스 설정은 `user_preferences(user_id, emotion_menu, updated_at)`에 계정별로 저장한다. `GET/PUT /api/users/me/preferences`는 서버 인증에서 계정 ID를 얻고 PUT은 same-origin과 strict Zod 검증을 거친다. 클라이언트가 지정한 다른 계정은 사용하지 않는다. 응답에는 emotionMenu만 있으며 private/no-store다. Pages는 기존 브라우저 시연 세션의 localStorage를 사용하며 서버와 동기화하지 않는다. migration `0004`는 additive/idempotent이며 기존 데이터를 보존한다.

## 예시 댓글과 거리뷰

예약된 울산 공개 예시 23개에 각 2개, 총 46개 가상 익명 댓글을 준비했다. 스레드를 처음 읽을 때 해당 2개만 중복 없이 추가한다. 기억 ID뿐 아니라 기존 예시 작성자·public 상태도 확인한다. private/unlisted·새 사용자 기록에는 자동 댓글을 넣지 않고 이미 있는 댓글도 덮어쓰지 않는다. 작성자 식별자는 공개 DTO에 없다.

예시의 위치는 실제 SDK가 반환한 첫 장면에서 설명용 시선 방향으로 정한다. 가짜 촬영 장면 ID를 만들거나 실제 사람의 기록으로 주장하지 않는다. 이 예시 지점은 viewer 수명 동안 고정되며 회전·줌을 따라 움직이고 다른 촬영 장면에서는 사라진다. 다시 열면 그때의 첫 장면에 연결한다. 실제 사용자가 쓴 지점 댓글은 기존에 저장한 panoId/pan/tilt를 그대로 우선 사용한다. 3D 물체 추적·장면 간 동일 물체 식별은 제공하지 않는다.

표식과 클릭한 팝업은 같은 projection으로 움직인다. hover는 임시 표시, 클릭·탭은 팝업을 고정해 둘러보는 동안 유지한다. 화면 밖·다른 장면의 지점은 숨긴다. 새 지점 선택, native 도로 이동·줌 조작, 로그인/소유자 삭제, 댓글 fallback은 유지한다. 댓글 목록은 memo와 공통 날짜 formatter를 사용하고 표식은 translate3d로 이동한다. 댓글 팝업이 상단 조작·안내를 가리는 문제를 캡처에서 찾아 위치를 보완했다.

## 검증

- `pnpm check`: lint, typecheck, 단위 21개, Worker·Pages 빌드.
- Playwright Chromium/WebKit × desktop 1440×900/mobile 390×844: 댓글·밀도·개인 공간·장소 보드·기존 사용성 관련 72개 통과. 감정 메뉴 설정 추가 후 설정·개인 공간 포함 28개 재검사.
- 감정 설정은 빈 선택 저장 불가, 저장/새로고침, 선택한 2개만 표시, 내 기록 감정 수정 후 지도 유지까지 검사한다. 장식 점이 감정의 접근성 이름에 섞이는 문제를 수정했다.
- `pnpm db:migrate`: 0000–0004 실행 성공. `node scripts/verify-emotion-preferences.mjs`: 인증, 검증, same-origin, 계정 격리, 저장과 DTO/no-store 통과. 검사 후 원래 설정 복원.
- `node scripts/verify-comments-service.mjs`: 예시 2개 중복 방지, 로그인·소유자 경계, private/unlisted 차단, anchor 저장·삭제 cascade·pagination 통과. 임시 CRUD 자료 정리.
- 자동 거리뷰 UI 검사는 SDK test double로 시선 이동·줌·popup과 native 조작 경계를 확인한다. 이것만으로 실제 NAVER 촬영 화면 동작을 주장하지 않는다. 실제 배포 검증은 아래 별도 기록한다.
- 실제 production 계정으로 로그인 완료 후 설정 변경·댓글 작성은 이번 자동 테스트에 포함하지 않았다. 로컬 인증과 Pages 브라우저 시연 세션으로 변경 경로를 검증했다.

## 주요 파일

- `src/features/map/marker-groups.ts`, `components/memories/map.tsx`, `memory-stamp.tsx`: grouping과 단일 overlay.
- `emotion-preferences.ts`, `emotion-preferences-api.ts`, `src/server/emotion-preferences.ts`, `app/api/users/me/preferences/route.ts`, `emotion-menu-settings.tsx`: 계정 감정 메뉴.
- `personal-space.tsx`, `components/memory-app.tsx`: 소유자 수정·복귀.
- `demo-comments.ts`, `src/server/comments.ts`, `browser-store.ts`: public 예시 스레드.
- `demo-comment-anchor.ts`, `panorama-annotations.tsx`, `memory-comments.tsx`, `panorama-viewer.tsx`: viewer projection과 렌더링.
- `tests/e2e/density-emotions.spec.ts`, 기존 comments/personal/place/usability tests, 단위 tests, API verification scripts.

캡처는 이 폴더에 보존한다. 실제 거리뷰가 없는 회색 자동 테스트 화면은 SDK test double이며 서비스의 지도 실패 캡처가 아니다.

## 공개 게시 확인

Sites 버전 9(소스 `f8414d4b2a28c9a1a6ff6c5c09495c9903768d88`)가 공개 실서비스에 배포되었다. GitHub Pages는 `032c31beeeb177ef110901728d75148567222a87`를 [Actions 40299627493](https://github.com/adammyun/yeoun_2/actions/runs/40299627493)에서 성공적으로 게시했다. 후속 문서·캡처 커밋은 앱 소스를 바꾸지 않는다.

실제 브라우저에서 실서비스 공개 지도 23개 예시의 묶음, 8개 감정 메뉴, 성남동 기억 상세와 NAVER 촬영 화면을 확인했다. 익명 예시 댓글 2개가 표시되며 표식 1을 클릭한 뒤 풍경을 드래그하자 표식과 팝업이 함께 이동했다. native 확대 버튼으로 확대해도 위치가 갱신되고 팝업이 유지되었다. `live-panorama-before.png`, `live-panorama-after.png`, `live-panorama-zoom.png`는 test double이 아닌 실제 NAVER 화면이다. `live-map.png`는 실제 서비스 지도다.

GitHub Pages도 새 버전으로 다시 열어 묶음과 마이페이지의 감정 메뉴 설정 8개·내 기록 수정 버튼을 확인했다. 브라우저에 있던 사용자 기록과 설정은 변경하지 않았다. 실제 계정의 production 설정 변경·댓글 등록은 여전히 미검증이며 로컬 인증과 Pages 자동 테스트로 확인한 범위와 구분한다.
