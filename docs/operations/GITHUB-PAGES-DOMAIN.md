# U_rang GitHub Pages 주소

2026-10-30

- 저장소: https://github.com/adammyun/U_rang
- 공개 앱: https://adammyun.github.io/U_rang/
- 앱 브랜치: `redesign/yeoun-2` (기존 브랜치 이름과 `main`·태그·커밋 이력 유지)
- 배포: GitHub Actions `Deploy GitHub Pages` 수동 실행
- Vite base / Playwright baseURL: `/U_rang/`

기존 `adammyun/yeoun_2` 저장소 자체의 이름을 `U_rang`으로 바꿨다. 별도 빈 저장소를 만들거나 이력을 다시 작성하지 않았다. 로컬 작업 폴더 이름은 그대로이며 origin만 새 Git URL로 바꿨다. 저장소 About의 웹사이트 링크도 새 Pages 주소를 가리킨다.

[GitHub 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)에 따른 프로젝트 Pages 형식은 `https://<owner>.github.io/<repositoryname>/`이다. 브랜치 생성 자체가 주소를 발행하는 것은 아니며 Pages 배포가 필요하다. [이름 변경 안내](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)에 따라 프로젝트 사이트 URL은 저장소 리다이렉트 대상에 포함되지 않는다. 공유할 때는 새 주소를 사용한다.

## 보존한 것

기존 앱 UI, MapLibre/울산 지도, 인증·API·서버 DB와 NAVER 설정은 변경하지 않았다. Pages는 기존 정적 실행 방식이며, ‘공유·저장 실서비스’는 https://yurang-memory-live.finn7132.chatgpt.site/ 에 연결된다. 서버 DB를 GitHub Pages 안으로 옮긴 작업은 아니다.

브라우저 저장소 이름 `yeoun_2`와 인증·튜토리얼 storage key는 의도적으로 유지한다. 이전/새 Pages의 origin이 같은 `https://adammyun.github.io`이므로 동일 브라우저의 기존 IndexedDB/localStorage를 계속 사용한다. 데이터 삭제·초기화·복사는 수행하지 않았다. 브라우저 프로필이나 기기가 다르면 저장 데이터는 공유되지 않는다.

현재 실행 안내 README/DEMO-GUIDE/LIVE-SERVICE의 주소를 갱신했다. 과거 날짜의 배포·QA 문서에 있는 옛 URL과 커밋 기록은 당시 증거로 보존한다.

## 검증

`pnpm check`, 새 경로의 Playwright, 실제 공개 주소의 지도·정적 자산·화면 전환과 Pages Actions 배포를 확인한다. 최종 결과는 배포 후 추가한다.

- 최종 `pnpm check`: lint, typecheck, 단위 테스트 27건, Worker/Pages build 모두 성공.
- `/U_rang/`에서 Chromium/WebKit × 데스크톱/모바일 총 12건 통과: 기존 브라우저 기록·사진·반응·댓글 보존, 세 목록·추천·상세·지도 연결과 카메라 복귀 확인.
- 생성된 HTML의 JS/CSS 경로가 `/U_rang/assets/...`로 출력되는 것을 확인했다. 기존 저장소 변수 `NAVER_MAPS_CLIENT_ID`와 public 공개 범위도 유지된다.
- 물리적 모바일 기기는 확인하지 않았다. 기존 큰 JS 번들 경고는 남아 있다.

## 공개 배포 확인

[Actions #40986822384](https://github.com/adammyun/U_rang/actions/runs/40986822384) 성공. 배포 소스는 `3bd6a1f9e5cec250d10a01d806511b6f409c08d5`이다. GitHub Pages API의 `html_url`은 `https://adammyun.github.io/U_rang/`, HTTPS 강제는 활성 상태다.

실제 공개 주소를 새 브라우저 탭에서 열어 지도·기억 마커·OSM attribution이 표시되고, 태화강 국가정원 검색과 지도 이동이 동작함을 확인했다. [접속 확인 화면](urang-domain-live.png). 기존 브라우저 인증/저장 키를 유지했으며 사용자 기록에 쓰기·삭제 작업을 하지 않았다.
