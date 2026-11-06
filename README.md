# oddz.click

심심하면 만드는 것들을 모아 둔 개인 사이트입니다. GitHub Pages로 배포합니다.

> 이 저장소의 파일은 모두 `https://oddz.click/<경로>`로 공개됩니다.
> 작업 메모, 개인 정보, 실제 화면 캡처처럼 공개하면 안 되는 파일은 이 저장소에 올리지 마세요.

## 구조

| 경로 | 내용 |
| --- | --- |
| `index.html` | 기본(반짝이) 테마 홈 |
| `themes/` | 다른 디자인의 홈(기계, 게임·물빛, 게임·노을, 비눗방울, 오즈) |
| `projects/` | 프로젝트별 소개·다운로드·사용법 |
| `journal/` | 개발일지 |
| `assets/oddz-projects-data.js` | 모든 테마가 함께 쓰는 프로젝트 목록 데이터 |
| `assets/` | 공용 CSS·JS·이미지 |
| `downloads/` | 배포 ZIP |
| `404.html`, `robots.txt`, `sitemap.xml` | 없는 주소 안내, 검색엔진 설정 |

## 수정할 때 확인할 것

- **프로젝트 추가·변경**: `assets/oddz-projects-data.js`만 고치면 6개 테마에 함께 반영됩니다. 새 페이지를 만들면 `sitemap.xml`에도 추가하세요.
- **보안 정책(CSP)**: 모든 HTML의 `<head>`에 `Content-Security-Policy` 메타 태그가 있습니다.
  - `<script>…</script>` 인라인 스크립트와 `onclick=` 같은 속성은 차단됩니다. 스크립트는 `assets/`에 `.js` 파일로 만들어 `<script src>`로 불러오세요.
  - 새 외부 사이트에서 폰트나 스크립트를 불러오려면 해당 메타 태그의 허용 목록에 주소를 추가해야 합니다.
- **다운로드 파일 교체**: 새 ZIP을 올리면 프로젝트 페이지의 SHA-256 값도 바꾸세요.
  ```powershell
  Get-FileHash downloads\파일이름.zip
  ```
  예전 버전 ZIP은 링크를 지울 때 파일도 함께 지우세요.
- **스크린샷**: 실제 LMS·개인 화면 대신 예시 데이터로 찍은 화면을 사용하세요.
