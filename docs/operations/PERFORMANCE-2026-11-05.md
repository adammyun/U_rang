# UX/UI를 유지한 성능 최적화

측정: 2026-11-05 · 게시 작업: 2026-11-06 · 기준 소스: `1d9bb77`

## 변경 범위

화면 구성·CSS·색상·글꼴·사진 품질·마커 수·지도 디테일·애니메이션·조작 방식은 유지한다. 지도 스타일 선택, 울산 범위, MapLibre 인스턴스, container size 보정, ResizeObserver, raster 호환 레이어와 attribution도 유지한다. 지연 로딩이나 새로운 로딩 UI를 도입하지 않았다.

1. 초기 건물 데이터의 사용하지 않는 `id`·`bounds`만 제거했다. 27,534개 도형의 좌표·순서·종류·용도·도로 구분과 건물 6,597개가 유지되는지 원본 SHA-256으로 검사한다. 전체 bbox·셀 manifest·원본 시각·저작권·ODbL은 보존한다. 상세 셀의 ID·좌표는 그대로다.
2. 좌표마다 다시 구하던 고정 원점을 한 번 계산해 재사용한다. 연산식과 소수점 8자리 출력은 동일하다.
3. 상세 셀 캐시는 원시 좌표 배열 대신 동일한 SVG 도형 문자열을 보관한다. 동일 셀을 다시 볼 때 좌표를 다시 투영하지 않는다. 중복 ID 처리와 출력 순서는 유지한다. 기존 180ms 대기·화면 내 셀만 선택·4개 동시 요청·캐시 정리 기준도 유지한다.
4. 마이페이지 추천에서 매 비교마다 내 기록 전체를 검색하던 부분을 장소·감정 집합 조회로 바꿨다. 점수·동점 순서·추천 수·추천 문구·공개/소유자 필터는 같다.

## 측정 결과

| 항목 | 이전 | 이후 | 변화 |
|---|---:|---:|---:|
| 초기 건물 JSON 원본 | 7,337,789 bytes | 5,365,473 bytes | 26.9% 감소 |
| 같은 파일의 로컬 gzip | 1,416,028 bytes | 1,051,978 bytes | 25.7% 감소 |
| 상세 지도 반복 계산의 좌표 투영 | 228,130회 | 57,005회 | 75.0% 감소 |
| 해당 계산 시간 중앙값 | 8.07ms | 4.03ms | 약 50% 감소 |
| Pages 메인 JavaScript | 1,735,906 bytes | 1,736,120 bytes | 캐시 처리 코드 214 bytes 증가 |

gzip 수치는 같은 설정으로 계산한 파일 크기이며 실제 CDN 압축 전송량이 아니다. 계산 벤치마크는 로컬 Node에서 인접 6개 셀로 만든 3개 화면을 5회 반복한 결과다. 실제 앱에서 동일하게 사용하는 도형 함수를 실행하고 원본 결과와 문자열까지 같음을 검사했다. 이 수치를 전체 사이트 로딩 시간이 50% 감소했다는 의미로 해석하지 않는다.

브라우저 로딩 시간도 기록했지만 단일 실행·로컬 서버·캐시/실행 환경 편차가 있어 실제 기기 속도 개선율로 사용하지 않았다. 메인 JS는 지도 엔진과 기존 기능을 그대로 포함하므로 전체 번들 크기 경고는 남아 있다.

[측정 원본](performance-2026-11-05/benchmark.json)

## 화면과 기능 검증

- `pnpm check`: lint·typecheck·단위 테스트 29개·Worker/Pages build 통과.
- Chromium/WebKit × 데스크톱 1440×900/모바일 390×844에서 기존 E2E 36건 통과. 지도 확대/축소/드래그·세 지도 모드·작성·사진 5장·공개 설정·상세 스크롤·마이페이지·북마크/좋아요·추천·발견 목록·이전 데이터 보존을 확인했다.
- 별도 브라우저 프로필에서 기본·다크·상세 건물·기억 상세·마이페이지의 20개 상태를 전후 비교했다. 전체 SVG path·viewBox·지명 위치/스타일 해시가 20개 모두 같았다. 빌드 CSS 파일도 동일하다.
- 스크린샷 PNG는 16개 상태가 바이트 단위로 같았다. Chromium 기본/다크 4장의 작은 상태 글자 픽셀 편차는 변경 전 소스로 반복 실행했을 때도 재현됐다. 문구 HTML·좌표·글꼴·색상·간격·opacity가 같았고, 분리한 문구 캡처도 같았다. 브라우저 렌더링 편차를 제품 UI 변경으로 수정하지 않았다.
- 화면 비교에는 고정 날짜·고정 난수·reduced motion을 사용했다. 별도의 기존 E2E는 일반 인터랙션/모션 조건에서 실행했다. 사용자의 실제 브라우저 데이터는 읽거나 초기화하지 않았다.

[20개 상태 비교](performance-2026-11-05/comparison.json) · [문구 DOM/스타일](performance-2026-11-05/caption.json) · [원본 반복 실행 편차](performance-2026-11-05/unchanged-comparison.json) · [문구 편차 대조](performance-2026-11-05/caption-variance.json)

| 화면 | 이전 | 이후 |
|---|---|---|
| 데스크톱 WebKit | [캡처](performance-2026-11-05/before-desktop-webkit.png) | [캡처](performance-2026-11-05/after-desktop-webkit.png) |
| 모바일 WebKit | [캡처](performance-2026-11-05/before-mobile-webkit.png) | [캡처](performance-2026-11-05/after-mobile-webkit.png) |

실제 모바일 기기·느린 이동통신·많은 사용자 업로드가 저장된 브라우저의 성능은 별도 검증하지 않았다. 저장소 schema·사진 데이터·계정·보관 키·API 계약을 바꾸지 않았다.

## 변경 파일

- `components/memories/ulsan-line-map.tsx`: 고정 원점 재사용
- `components/memories/ulsan-urban-layers.tsx`, `src/features/map/urban-geometry.ts`: 도형 문자열 캐시와 기존 중복 처리
- `public/maps/ulsan-urban/overview.json`, `scripts/maps/build-ulsan-urban.py`: 표시 데이터 보존 및 미사용 필드 제거
- `src/features/memories/browser-store.ts`: 동일 추천 계산의 집합 조회
- `tests/urban-geometry.test.mjs`: 원본 표시 데이터 해시와 경계 중복 도형 검사
- `scripts/benchmark-geometry.mjs`, `scripts/measure-runtime.mjs`: 재현 가능한 로컬 측정
- README·지도 데이터 설명·프로젝트 프로필·이 보고서: 범위와 검증 기록

의존성 추가·클라우드 설정 변경·운영 데이터 migration은 없다.

## 측정 재현

변경 전 소스의 Pages 빌드를 별도 디렉터리에 보관하고, 변경 후 빌드를 실행한다. 두 preview는 같은 `/U_rang/` 경로와 서로 다른 로컬 포트를 사용한다.

```bash
pnpm check
node --experimental-strip-types scripts/benchmark-geometry.mjs /path/to/before-dist /path/to/benchmark.json
node scripts/measure-runtime.mjs http://127.0.0.1:4180/U_rang/ /path/to/before-results
node scripts/measure-runtime.mjs http://127.0.0.1:4181/U_rang/ /path/to/after-results
```

화면 측정은 로컬 주소와 분리된 임시 브라우저 프로필만 사용한다. 스크린샷과 결과 JSON은 전달한 출력 디렉터리에 생성된다.

## 공개 배포 확인 · 2026-11-06

- 배포 소스: `c9ac0bc5cff84fc0c2c6231d4d52affb391197da`, `redesign/yeoun-2`
- [GitHub Pages 배포 성공](https://github.com/adammyun/U_rang/actions/runs/42144802192)
- 실제 https://adammyun.github.io/U_rang/ 에서 `overview-v2` 요청과 원본 크기 5,365,473 bytes 확인. 해당 요청의 관측 압축 크기는 1,070,626 bytes였다.
- 공개 파일의 도형 해시가 변경 전 기준과 같고 27,534개 도형이 유지됨을 확인했다.
- 실제 공개 브라우저에서 개요 건물 6,597개, 기억 마커·예시 사진, 성남동 확대 후 상세 건물 표시, JS 오류 0개 확인.
- 새 임시 브라우저 프로필로 검사해 실제 사용자의 로그인/기록/사진을 변경하지 않았다.

[공개 검증 결과](performance-2026-11-05/live-verification.json) · [공개 화면 캡처](performance-2026-11-05/live-main.png)

기존 번들 크기 및 GitHub Actions의 Node 20 action deprecation 경고는 남아 있다. 배포는 성공했으며 관련 없는 배포 설정·서버 인프라는 변경하지 않았다.
