# yeoun_2 복사 기준

- 생성일: 2026-10-18 (Asia/Seoul)
- 원본: https://github.com/adammyun/yeoun-memory-atlas
- 기준 커밋: `6b65439` (`redesign/ui-v2`)
- 원본의 아직 커밋되지 않은 최신 UI·기능·문서·테스트도 포함했습니다.
- `main`: 새 UI 작업 전 기준 상태
- `redesign/yeoun-2`: 앞으로 사용할 디자인 작업 브랜치
- `baseline-2026-10-18`: 복사 시점 보존 태그

원본 파일과 GitHub 저장소에는 변경을 적용하지 않았습니다. Git 이력과 소스·공개 seed는 보존했습니다. 환경변수, secret, 로컬 DB·업로드, node_modules, 빌드 산출물과 도구 세션은 복사하지 않았습니다. 새 로컬 DB는 DEMO-GUIDE.md의 초기 설정으로 준비합니다.

새 저장소 이름에 맞게 Pages 기본 경로와 Playwright 경로를 `/yeoun_2/`로 바꿨습니다. 자동 Pages 배포는 제거하고 수동 배포 워크플로만 남겼습니다. 새 UI나 제품 기능은 이번 복사 작업에서 변경하지 않았습니다.

Pages 모드의 IndexedDB 이름과 로그인·튜토리얼 저장 키를 `yeoun_2` 전용으로 분리했습니다. 같은 GitHub Pages 도메인에서 원본과 복사본을 열어도 브라우저 기록이 섞이지 않습니다. 원본 저장소의 저장 데이터는 읽거나 변경하지 않습니다.
