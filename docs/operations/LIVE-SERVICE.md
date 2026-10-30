# 유랑 실서비스와 GitHub 연결

기준일: 2026-10-24

## 주소와 저장 방식

- 실서비스: https://yurang-memory-live.finn7132.chatgpt.site/
- GitHub Pages 시연판: https://adammyun.github.io/U_rang/
- 코드: https://github.com/adammyun/U_rang/tree/redesign/yeoun-2

GitHub 저장소의 About 웹사이트, README 첫 링크와 Pages의 “공유·저장 실서비스” 버튼에서 실서비스로 이동한다. Pages는 기존 IndexedDB 시연판을 유지한다. 두 환경의 데이터는 자동으로 합치지 않으며 브라우저의 기존 개인 기록을 서버에 업로드하지 않는다.

실서비스는 기존 Worker 서버 코드를 사용한다. 구조화 데이터는 Cloudflare D1(SQLite), 새로 업로드하는 사진은 R2, 로그인은 Sites의 ChatGPT 인증이다. PostgreSQL/PostGIS로 변경한 버전은 아니다. 공개 기억은 로그인 없이 열람하고, 작성·내 기억·수정·삭제는 서버가 확인한 로그인 사용자에게만 허용한다. 원본 여운 사이트는 수정하거나 재사용하지 않았다.

실서비스 소스는 별도 `work/yeoun_2-live` 체크아웃에 보관하며 `.openai/hosting.json`의 고유 ID를 유지한다. GitHub 개발 저장소에는 다른 사이트의 ID를 넣지 않는다. GitHub에 push하는 것만으로 Sites가 자동 재배포되지는 않는다. Sites 변경은 해당 사이트의 source helper와 버전 배포 도구로 반영한다. Pages는 기존 수동 GitHub Actions workflow로 배포한다. 소스·빌드 검증 후 게시하며 기본 브랜치와 원본 프로젝트는 보존한다.

## 예시와 사진

공개 가상 기억 23개, 사진이 있는 기억 5개(사진 연결 총 6개), 기존 로컬 전용 비공개 예시 1개를 제공한다. 태화강 주변의 기존 5개 장소 그룹을 보존하고 해안·대학·주택가 등의 예시를 추가했다. 모든 이야기와 날짜는 창작이며 실제 사진 촬영자의 경험을 사용하지 않는다.

`src/features/memories/demo-catalog.ts`의 추가 예시와 미디어를 양쪽 환경에서 공유한다. 서버가 `ensureSeedData()`에서 D1에 중복 없이 저장하며, 예시 사진은 정적 공개 자산을 참조한다. 실제 사용자 업로드는 정적 폴더에 복사하지 않고 R2에 저장해 `/api/media/:id`에서 접근 권한을 확인한다. 공개 후 비공개로 전환할 때 이전 캐시로 노출되지 않도록 사용자 사진 응답에는 `private, no-store`를 적용했다.

사진 저작자·라이선스·출처는 [public/demo/README.md](../../public/demo/README.md)와 각 사진 기억 상세에 표시한다.

## 거리뷰

기존 사용자 제공 공개 Client ID를 GitHub Actions의 `NAVER_MAPS_CLIENT_ID`와 Sites의 `NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID`에 설정했다. Client Secret은 사용하거나 만들지 않는다. MapLibre와 세 가지 지도 모드는 유지하며, NAVER SDK의 panorama만 버튼을 누를 때 로드한다.

NAVER Cloud Maps Application의 Web 서비스 URL에는 사용하는 origin을 등록해야 한다.

- `https://adammyun.github.io`
- `https://yurang-memory-live.finn7132.chatgpt.site`

SDK 문서: [클라이언트 ID와 인증 실패](https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html), [파노라마](https://navermaps.github.io/maps.js.ncp/docs/tutorial-Panorama.html). 실제 제공 여부는 위치·네트워크·NAVER 계정 설정에 따라 다르다. 설정값이 있다는 것과 해당 위치의 거리뷰가 제공된다는 것은 구분한다. 인증 거절, 키 미설정, 네트워크 오류, 거리뷰 제공 없음은 각각 안내한다. NAVER 계정 설정은 자동 변경하지 않았다.

## 개발자 보조 화면

공개 지도 하단의 “울산광역시 · 공개된 기억”을 2초 안에 5번 클릭·탭한다. 단일 클릭은 아무 일도 하지 않는다. 기존 타이밍 판정을 재사용하며 `/dev`에서 튜토리얼 초기화·다시 시작·지도 복귀·환경 상태를 확인한다. 지도 상태 점과 보조 화면은 graphite/coral 테마를 공유한다. 숨은 진입점은 관리자 권한이나 보안 경계가 아니다.

## 검증

`pnpm check`와 `pnpm test:ui --workers=1`을 사용한다. 서버 API 검증은 로컬 서버에서 `node scripts/verify-local-service.mjs http://localhost:5185`로 실행한다. 이 검증기는 localhost만 허용하며 검사에 만든 가상 기록을 마지막에 삭제한다. 운영 DB에 임의 테스트 기록을 만들거나 사용자 데이터를 삭제하지 않는다.


## 배포 현장에서 확인한 결과

- 실서비스 Sites 버전 3 게시 성공. 공개 API는 로그인 없이 HTTP 200, 공개 기억 23개·사진 기억 5개·사진 연결 6개를 반환했다. 실제 사진 응답도 HTTP 200이다. 익명 응답에 user_id/userId가 없고, 비공개 예시 조회는 404, 비로그인 작성은 401이다.
- 실제 브라우저에서 공개 기억·사진 상세·장소 검색과 개발 도구 진입을 확인했다. 배포된 Vinext Link 전환에서 `TypeError: e is not a function`이 재현되어 공통 AppLink/이동 함수를 사용한다. 서버는 일반 문서 이동, Pages는 기존 hash 이동을 유지한다. 라이브러리·API·인증 정책은 바꾸지 않았다. 수정 배포 후 개발 도구 및 로그인 화면에서 지도로 복귀하는 것을 확인했다.
- NAVER SDK뿐 아니라 성남동 가상 기억의 보호된 근사 좌표에서 실제 거리뷰 영상이 표시되는 것도 확인했다. 대왕암의 확인 좌표에서는 제공 영상이 없었다. 근사 좌표의 거리뷰는 원본 기억 위치와 다를 수 있다. 실제 사진은 [거리뷰 캡처](../design/demo-release/live-streetview.png)에서 확인할 수 있다.
- `pnpm check` 통과: lint, typecheck, 단위 테스트 11개, Worker 및 Pages 빌드. 번들 크기와 Vinext의 일부 동적 경로 분류 경고는 남아 있지만 빌드는 성공했다.
- 로컬 서버 API 검증 통과: 사진 저장, 작성·수정·삭제, 공개→비공개 전환 후 사진 차단, unlisted 지도 제외, 익명 정보·근사 좌표 보호. 검사 기록은 로컬에서만 생성·정리했다.
- 운영 환경의 실제 계정 로그인 완료 후 작성·수정·삭제까지 이어지는 검사는 수행하지 못했다. 인증 화면 진입은 확인했다. 운영 요청에 가짜 인증 헤더를 주입하거나 개인 브라우저 기록을 업로드하지 않았다.

### 브라우저 검사 이력

초기 전체 102개 실행에서 94개가 통과했고, 늘어난 예시 때문에 overview cluster 밀도와 카메라 이동 시점에 의존하던 검사 8개가 실패했다. 실제 검색으로 장소를 먼저 고르고 카메라가 멈춘 뒤 측정하도록 검사 준비를 수정했다. 라벨 검사는 기억 라벨 충돌과 분리된 연도 조건에서 확인한다. 기존 검증 기준은 유지했다. 영향받은 검사 재실행 14개 중 12개 통과 후, 마지막 카메라 측정 대기를 보완해 지도 호환성 4개가 모두 통과했다.

확장된 주요 흐름 32개는 한 차례 모두 통과했다. 이후 실제 서버 이동 오류 수정 뒤 재검사 중, 별도의 빌드가 동일한 Pages 출력 디렉터리를 덮어써 환경변수 링크 검사 3개가 실패했다(29/32). 제품 코드를 바꾸지 않고 빌드와 브라우저 검사를 순서대로 실행해 최종 결과를 확인한다. 전체 102개가 한 번에 모두 통과했다고 보고하지 않는다.


**최종 재검사: 32/32 통과(2분 18초)** — 새 일반 링크/Pages hash 이동 코드가 적용된 상태에서 Chromium·WebKit의 데스크톱/모바일, 사진 상세·뒤로가기·감소된 모션·보존 migration·개발 도구·실서비스 링크를 확인했다. 소스 검사 `pnpm check`도 최종 이동 코드에서 통과했다.

```bash
VITE_LIVE_SERVICE_URL=https://yurang-memory-live.finn7132.chatgpt.site pnpm test:ui tests/e2e/demo-release.spec.ts tests/e2e/live-flow.spec.ts tests/e2e/place-notes.spec.ts --workers=1
```

동일한 `dist-pages`를 쓰는 빌드/브라우저 검사는 동시에 실행하지 않는다. [실서비스 메인](../design/demo-release/live-main.png), [Pages 데스크톱](../design/demo-release/demo-service-link-desktop-chromium.png), [Pages 모바일](../design/demo-release/demo-service-link-mobile-chromium.png), [사진 상세](../design/demo-release/photos-desktop.png), [개발 도구](../design/demo-release/developer-mobile.png)에 화면 증거를 보관했다.


## GitHub 공개 게시 최종 확인

2026-10-25 확인: `redesign/yeoun-2`의 `be1b4ddb2f3f83fbd377d9df0a2f0b8ac5075772` 소스로 [GitHub Pages 배포](https://github.com/adammyun/U_rang/actions/runs/40087359906)가 성공했다. 저장소 About 웹사이트 링크는 실서비스를 가리킨다. 실제 브라우저에서 Pages의 “공유·저장 실서비스 ↗” 링크를 클릭해 실서비스 메인으로 이동하는 것을 확인했다. 원본 `main`은 보존하므로 최신 README와 소스는 `redesign/yeoun-2` 브랜치에서 확인한다. Actions의 Node 20 action 실행 환경 폐기 예정 안내는 남아 있으나 이번 배포는 성공했다.
