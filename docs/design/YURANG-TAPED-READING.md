# 상세 읽기 종이와 사진 · 2026-10-23

## 변경

- 상세 제목과 본문을 같은 graphite 종이 면으로 합쳤다. 최대 폭 520px, 짧은 기록의 최소 세로 길이는 화면 높이의 68%(최대 620px)이며 내용이 길면 자연스럽게 늘어난다.
- 종이 backing만 -.6° 기울이고 제목·본문·버튼은 수평으로 유지한다. 상단 테이프는 이전 `--atlas-tape` 토큰을 그대로 사용한다.
- 첫 사진과 추가 사진 각각에 반투명 테이프를 붙였다. 추가 사진은 `figure`로 감싸 기존 회전·겹침을 사진과 테이프가 함께 따르게 했다.
- 사진과 글은 기존 상세 scroll owner 안에서 함께 이동한다. 모바일의 첫 사진 → 기록 → 나머지 사진 순서와 고정 뒤로가기·닫기·같은 장소 이전/다음 이동은 유지한다.
- 데이터·API·인증·미디어 저장·사진 장수/용량 제한·지도 구현은 변경하지 않았다. 테이프와 종이 backing은 클릭을 받지 않는 CSS 장식이다.

## 화면 확인

- [데스크톱 상세](taped-reading/desktop-photos.png), [모바일 상세](taped-reading/mobile-photos.png)
- [데스크톱 사진 끝까지 스크롤](taped-reading/desktop-photo-scroll.png), [모바일 사진 스크롤](taped-reading/mobile-photo-scroll.png)
- [사진 없는 데스크톱 기록](taped-reading/desktop-note.png), [사진 없는 모바일 기록](taped-reading/mobile-note.png)

실제 개인 기록이 아닌 테스트용 가상 기억으로 캡처했다. Chromium과 WebKit의 데스크톱·모바일을 사용하며 실제 iPhone 기기 검증은 하지 않았다.

## 테스트 결과

최종 레이아웃의 관련 Playwright 시나리오 18개 중 17개가 통과했다. 데스크톱 Chromium의 사진 5장 테스트 한 건은 상세 화면 진입 전 로컬 시연 로그인 화면에서 시간 초과로 중단됐다(컨텍스트 정리도 시간 초과). 원인을 단정하거나 제한 시간을 늘리지 않고 동일한 사진 테스트를 네 브라우저 프로젝트에서 재실행해 **4/4 통과**했다. 나머지 17개에서 긴 본문·사진 5장·포스트잇 열기·상세/뒤로가기·Escape·빈 지도 닫기·reduced-motion을 확인했다. 테스트 단언을 완화하지 않았다.

`pnpm check`의 lint·typecheck·단위 테스트 10개·Worker/Pages 빌드가 모두 통과했다. 기존 번들 크기·Vinext 라우트 분류 안내는 남아 있다.
