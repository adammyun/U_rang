# 기억 종이 테이프 복원 · 2026-10-23

사용자가 좋아했던 종이 상단의 반투명 테이프를 장소 포스트잇과 기억 상세 제목 위에 복원했다. 기존 `--atlas-tape` 토큰을 재사용하고 CSS 가상 요소로만 표시한다. 장식은 입력을 받지 않으며 글자·지도 좌표·감정 원형 그래픽·사진·스크롤·뒤로가기 동작을 바꾸지 않는다. API·인증·저장소 변경은 없다.

## 확인 결과

- 기존 `place-notes.spec.ts`, `navigation-map-photos.spec.ts`: Chromium/WebKit의 데스크톱 1440×900, 모바일 390×844에서 **24/24 통과**.
- `pnpm check`: lint·typecheck·단위 테스트 10개·Worker/Pages 빌드 통과. 기존 번들 크기 및 Vinext 라우트 분류 안내는 남아 있다.
- 장소의 전체 기억, 매번 달라지는 종이 배치, 빈 지도 닫기, 상세/뒤로가기/Escape, reduced-motion, 사진 다섯 장의 끝까지 스크롤, 공유 메뉴 및 지도 확대 범위를 확인했다.
- 사진이 있는 상세와 장소 포스트잇의 데스크톱·모바일 캡처를 직접 확인했다. 사진 없는 상세도 브라우저에서 확인했다. 테이프는 글을 가리지 않고 상단에 표시된다.
- 캡처: [데스크톱 포스트잇](tape-restoration/desktop-notes.png), [모바일 포스트잇](tape-restoration/mobile-notes.png), [데스크톱 상세](tape-restoration/desktop-detail.png), [모바일 상세](tape-restoration/mobile-detail.png).
- 실제 iPhone/Safari 기기에서는 검사하지 않았다. Safari 계열 확인은 Playwright WebKit으로 수행했다.
