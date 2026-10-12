# 메인 화면 리디자인 검증 기록

작성일: 2026-10-12  
적용 Skill: `personal-ui-designer`

## 범위

공개 기억 지도의 메인 화면만 리디자인했다. 지도 엔진, 지도 크기 보정, raster compatibility layer, marker overlay, viewport query, 인증, 기억 작성, 장소 그룹과 상세 패널의 동작은 변경하지 않았다.

## 기존 화면에서 확인한 문제

- 헤더, 이야기 rail, 지도 control과 기억 카드가 서로 다른 radius·shadow·spacing 규칙을 사용했다.
- 데스크톱에서 이야기 rail과 지도 사이의 위계가 약하고, 카드 목록의 정보 구획이 흐렸다.
- 모바일에서 검색, 조정, 확대·축소, 안내 문구와 CTA가 좁은 지도 영역에서 경쟁했다.
- 핵심 CTA와 현재 위치 버튼은 강조되었지만 다른 control과 크기 체계가 맞지 않았다.
- 첫 개선 캡처에서 모바일 지도 안내 문구가 오른쪽 화면 밖으로 잘렸다.

## 개선 내용

- `DESIGN-DNA.md`에 Quiet Archive의 기록 감성과 Civic Atlas의 조작 규칙을 결합한 기준을 정의했다.
- 메인 화면 전용 semantic token과 scoped style을 추가했다.
- 데스크톱을 424px 이야기 rail과 유연한 지도 영역으로 정돈했다.
- 헤더 navigation과 지도 control을 일관된 44px 이상 조작 규격으로 맞췄다.
- 기억 카드를 18px paper surface, 분명한 metadata, footer divider와 focus/hover 상태로 정리했다.
- 핵심 CTA는 Persimmon action color와 54px 높이로 강조했다.
- 모바일 bottom sheet, 가로 card snap, 지도 안내, CTA 사이 간격을 재조정했다.
- 모바일 안내 문구는 화면 양쪽 16px 안에 고정해 잘림을 제거했다.
- reduced motion 환경에서는 새 transition을 제거한다.

## Playwright 확인

테스트 viewport:

- Desktop Chromium: 1440×900
- Mobile Chromium: 390×844, touch/mobile mode

확인한 흐름:

- 메인 제목, 지도, 핵심 CTA와 공개 기억 marker 표시
- 지도 조정 sheet 열기
- 상세 지도 mode 선택 및 선택 상태 확인
- 지도 조정 sheet 닫기
- marker 선택 후 장소 기억 panel 열기
- 장소 기억 panel 닫기

## 스크린샷

- `screenshots/before-desktop.png`
- `screenshots/before-mobile.png`
- `screenshots/after-desktop.png`
- `screenshots/after-mobile.png`
