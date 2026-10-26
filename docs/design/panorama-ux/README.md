# 거리뷰 댓글 조작과 팝업 보완

2026-10-26

## 변경

- 표식의 화면상 순서 숫자를 제거하고 44px 말풍선 아이콘만 표시한다. 기존 댓글 연결 ID와 접근성 구분은 유지한다.
- NAVER canvas의 pointer·wheel·keyboard 입력을 capture/passive로 관찰한다. 이벤트를 취소하거나 SDK 동작을 막지 않는다. 입력이 시작되는 즉시 표식·선택 지점·팝업을 숨긴다. 댓글 목록 스크롤은 이 처리에 포함하지 않는다.
- 손가락·마우스가 눌려 있는 동안은 SDK가 중간 시점 이벤트를 주지 않아도 계속 숨긴다. 마지막 입력·시점 변경 후 240ms가 지나면 최종 `getPov()`/`getPanoId()`를 다시 샘플링하고 React 반영 뒤 표시한다. 조작 중 좌표를 매끄럽게 추적한다고 주장하는 대신 사용자 요청의 숨김 대안을 선택했다. 이벤트·timer·RAF는 닫기와 재시도 때 정리한다.
- 이전 팝업은 z-index 2인 표식 영역 안에 있어 z-index 3인 댓글 패널에 가려졌다. 팝업을 별도 상위 레이어로 분리하고 실제 패널·안내·버튼·native 컨트롤의 사각형을 읽어 가까운 빈 공간에 배치한다. 화면 가장자리 안쪽에 두고 원래 표식도 피한다. 극단적으로 빈 공간이 없을 때는 겹침이 가장 작은 위치를 선택하되 팝업 자체는 위에 표시해 읽을 수 있게 한다.
- 모바일은 260px 미리보기와 두 줄 요약을 사용한다. 전체 댓글은 기존 목록에서 읽는다. 데스크톱 300px·네 줄 요약, 기존 graphite/coral 테마, reduced-motion을 유지한다.

## 보존 범위

댓글 작성·삭제·페이지 나눔·익명 DTO·로그인 경계·실제 지점의 panoId/pan/tilt 저장·예시 댓글 정책은 변경하지 않는다. NAVER loader/공개 SDK API와 attribution을 유지한다. MapLibre 지도와 데이터/API/DB schema는 이번에 수정하지 않는다.

공식 참조: [NAVER Panorama의 getPov 및 이벤트](https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Panorama.html). 문서는 시점 이벤트의 존재를 설명하지만 모든 기기에서 조작 중 매 프레임 통지를 보장한다고 해석하지 않았다.

## 검증 범위

`pnpm check`로 lint·typecheck·단위 24개·Worker/Pages 빌드를 검사한다. 단위 검사는 sidebar·mobile bottom panel·화면 가장자리를 피하는 배치를 포함한다.

Playwright는 Chromium/WebKit의 desktop 1440×900 및 mobile 390×844에서 번호 없는 표식, 팝업/패널 비겹침, 조작 중 숨김, 누른 채 320ms 유지, SDK 이벤트 없이 변경된 최종 시야 복원, touch cancel, 연속 wheel과 댓글 목록 스크롤의 분리를 검사한다. 기존 댓글 작성·삭제·fallback·긴 목록·데이터 migration·감정 메뉴·개인 감정 수정도 함께 재검사한다. SDK test double 검사는 실제 NAVER 촬영 화면의 검증과 구분한다.

## 주요 파일

- `src/features/panorama/motion.ts`: 입력 즉시 숨김과 안정화 후 복원.
- `src/features/panorama/annotation-layout.ts`: 팝업 빈 공간 선택.
- `components/memories/panorama-comment-peek.tsx`: 실제 크기 측정과 상위 팝업.
- `panorama-viewer.tsx`, `panorama-annotations.tsx`, `app/atlas-collage.css`: 연결과 표현.
- `tests/annotation-layout.test.mjs`, `tests/e2e/panorama-ux.spec.ts`: 회귀 방지.

캡처와 실제 게시 후 결과는 같은 폴더에 보존한다.

실행 결과: `pnpm check` 전체 통과(단위 24개), `pnpm test:ui tests/e2e/panorama-ux.spec.ts tests/e2e/comments.spec.ts tests/e2e/density-emotions.spec.ts --workers=1` 44/44 통과(2.7분). 팝업 위치 검사를 기존의 특정 y값 비교에서 안내/버튼/댓글 패널과 실제로 겹치지 않는지 검사하는 방식으로 강화했다. 중간 시점 이벤트가 없는 채로 누르고 있는 상태도 별도로 검증했다. 자동 캡처의 회색 배경은 SDK test double이다.

## 배포 및 실제 NAVER 확인

- Sites 버전 10, 소스 `a6a127975b54b27da9b5f132bf23bcdd590f09c3`, 공개 배포 성공.
- Pages 소스 `b558f2873876f9890fa80fd2ba041a115b7434f3`, [Actions 40338212004](https://github.com/adammyun/yeoun_2/actions/runs/40338212004) 성공. 후속 검증 문서·캡처 커밋은 앱 코드 변경이 아니다.
- 실제 실서비스의 성남동 기억에서 NAVER 촬영 화면과 댓글 2개를 열었다. 숫자 제거, 오른쪽 댓글의 팝업이 패널 왼쪽 빈 공간으로 옮겨져 읽히는 것을 확인했다. 휠·드래그 후 복원도 확인했다.
- `live-before.png`: 이전 숫자 표식. `live-after.png`: 새 말풍선과 피해서 배치한 팝업. `live-moving.png`: 실제 드래그 직후 표식/팝업 숨김(목록은 유지). `live-restored.png`: 안정된 뒤 재표시. `live-wheel-settled.png`: 휠 이후 화면. 이 다섯 파일은 실제 NAVER 브라우저 캡처다.
- 모바일 검사는 Chromium/WebKit viewport 및 터치 입력 기준이며 실물 iPhone/Android 기기에서 별도 검증하지 않았다. 이번 변경은 UI에 한정했고 운영 계정의 신규 댓글 등록 검사를 반복하지 않았다.
