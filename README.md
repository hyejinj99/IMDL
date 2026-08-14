# Lab Knowledge Hub MVP

연구실 약 30명 규모를 가정한 **게시판 + 지식 Wiki 통합 프로토타입**입니다.

## 구현된 기능

- 디시/포럼형 글 목록
- 최신순 / 추천순 / 댓글순
- 분기별 필터 (Q1~Q4)
- 카테고리별 게시판
- 검색
- 새 글 작성
- Wiki 문서 페이지
- Wiki 문서 `👍 도움됐어요`
- 분기별/전체 인기 문서 랭킹용 기반
- 브라우저 localStorage를 이용한 테스트 데이터 보존
- 반응형 UI

## 바로 실행

`index.html`을 브라우저로 열면 됩니다.

## GitHub Pages 배포

1. GitHub repository → **Settings → Pages**
2. **Deploy from a branch**
3. Branch: `main`, Folder: `/ (root)` 선택
4. Save

몇 분 후 GitHub Pages URL에서 접속할 수 있습니다.

## 중요

현재 버전은 **UI/UX 검증용 MVP**입니다. 실제 30명 연구실 운영용으로 전환할 때는 아래를 추가해야 합니다.

- 로그인/회원 권한
- 서버 DB(PostgreSQL 등)
- 파일 업로드 스토리지
- 문서 수정 이력
- 관리자 권한
- 백업
- HTTPS / 비공개 접근 제어

그 다음 단계에서는 이 UI를 NodeBB / Wiki.js와 연결하거나, 하나의 커스텀 앱으로 확장할 수 있습니다.
