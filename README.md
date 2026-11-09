# oddz.click

심심하면 만드는 것들을 모아 둔 개인 사이트입니다. GitHub Pages로 배포합니다.

> 이 저장소의 파일은 모두 `https://oddz.click/<경로>`로 공개됩니다.
> 작업 메모, 개인 정보, 실제 화면 캡처처럼 공개하면 안 되는 파일은 이 저장소에 올리지 마세요.

## 구조

| 경로 | 내용 |
| --- | --- |
| `index.html` | 기본 테마(반딧불 채집 노트) 홈 |
| `themes/` | 다른 디자인의 홈(톱니바퀴 공장, 폭포 던전, 노을 모험가 길드, 비눗방울 극장, 오즈, 종이 공작, 올림포스 신전) |
| `projects/` | 프로젝트별 소개·다운로드·사용법 |
| `journal/` | 개발일지 |
| `assets/oddz-projects-data.js` | 모든 테마가 함께 쓰는 프로젝트 목록 데이터 |
| `assets/icons/` | 프로젝트 카드·상세 페이지 아이콘(`pj-번호.png`, 128px, Lucide 선 아이콘·직접 만든 앱 아이콘). 출처와 라이선스는 `assets/icons/LICENSE.txt` |
| `assets/` | 공용 CSS·JS·이미지 |
| `downloads/` | 배포 ZIP |
| `404.html`, `robots.txt`, `sitemap.xml`, `favicon.ico` | 없는 주소 안내, 검색엔진 설정, 아이콘이 없는 페이지의 기본 아이콘 |

## 수정할 때 확인할 것

- **프로젝트 추가·변경**: `assets/oddz-projects-data.js`만 고치면 8개 테마에 함께 반영됩니다. 아이콘은 `assets/icons/pj-번호.png`로 넣고 데이터의 `icon`에 경로를 적으세요. 새 페이지를 만들면 `sitemap.xml`에도 추가하세요.
- **홈 공통 레이아웃(`assets/oddz-home.css`, `assets/oddz-home-board.js`, `assets/home-motion.js`)**: 오즈·종이 공작을 뺀 여섯 홈이 함께 씁니다. 히어로 옆 "작업 현황판"(단계별 개수·최근 완성 3개·진행 중)은 프로젝트 데이터로 그려지고, `home-motion.js`는 커서 위치(`--mx`/`--my`), 스크롤 위치(`--scroll`), 카드 등장 효과를 넘깁니다. 테마별 글꼴·배경·카드·움직임은 각 홈 파일의 `<style id="home-skin">`에 있습니다. 오즈·종이 공작은 이 파일들을 쓰지 않습니다.
- **테마 이름과 파일**: 메뉴 이름은 반딧불 채집 노트(`index.html`, 코드 이름 sparkle), 톱니바퀴 공장(`machine`), 폭포 던전(`game-water`), 노을 모험가 길드(`game-sunset`), 비눗방울 극장(`bubbles`), 올림포스 신전(`olympus`)입니다. 이름을 바꿀 때는 모든 홈의 테마 메뉴와 `oz.html` 메뉴, 각 테마의 `<title>`을 함께 고치세요.
- **테마별 모습**: 반딧불 채집 노트(초승달·갈대·표본 꼬리표), 톱니바퀴 공장(톱니·컨베이어·LED 강판), 폭포 던전(픽셀 아이템 창·CLEAR 표시·픽셀 물결), 노을 모험가 길드(양피지 의뢰서·밀랍 봉인·스크롤하면 지는 해), 비눗방울 극장(벨벳 막·조명·무지갯빛 막 카드), 올림포스 신전(재스퍼웨어 신전 현황판·메안더 띠·로마 숫자 번호).
- **상세·개발일지 다듬기**: `assets/project-theme.js`가 오즈·종이 공작이 아닐 때만 `<html data-polish>`를 붙이고, `project-detail.css`·`journal/journal.css`의 `:root[data-polish]` 규칙이 그 테마들에만 적용됩니다. CSS를 고치면 HTML의 `?v=` 꼬리표도 올리세요.
- **글꼴**: 눈누에서 받은 글꼴은 `assets/fonts/`에 글꼴별 폴더로 있고, 출처·라이선스·쓰는 테마는 `assets/fonts/README.md`에 있습니다. 테마마다 제목·메뉴·본문·숫자에 어떤 글꼴을 쓰는지는 각 홈의 `<style id="typography">`, 상세·개발일지는 `assets/project-detail.css`의 "홈과 같은 글꼴 역할" 부분에서 정합니다.
- **새 테마 추가**: 테마 메뉴(모든 홈의 `.theme-picker`, 오즈는 `oz.html`의 메뉴), `assets/theme-restore.js`의 허용 목록, `assets/project-theme.js`의 `home`, `assets/oddz-projects-catalog.js`의 테마 감지에 함께 등록하세요.
- **종이 공작 테마(`themes/hum.html`)**: [Hallmark](https://github.com/nutlope/hallmark)의 Hum 테마로 만든 홈입니다. 공용 `oddz-projects-catalog.css`·`theme-switcher.css` 대신 `assets/hum.css` 하나만 쓰고, 히어로의 프로젝트 타일은 `assets/hum-garden.js`가 프로젝트 데이터로 다시 그립니다. 이 페이지의 CSP에는 Chillax 글꼴용 `api.fontshare.com`, `cdn.fontshare.com`이 추가되어 있습니다.
- **보안 정책(CSP)**: 모든 HTML의 `<head>`에 `Content-Security-Policy` 메타 태그가 있습니다.
  - `<script>…</script>` 인라인 스크립트와 `onclick=` 같은 속성은 차단됩니다. 스크립트는 `assets/`에 `.js` 파일로 만들어 `<script src>`로 불러오세요.
  - 새 외부 사이트에서 폰트나 스크립트를 불러오려면 해당 메타 태그의 허용 목록에 주소를 추가해야 합니다.
- **다운로드 파일 교체**: 새 ZIP을 올리면 프로젝트 페이지의 SHA-256 값도 바꾸세요.
  ```powershell
  Get-FileHash downloads\파일이름.zip
  ```
  예전 버전 ZIP은 링크를 지울 때 파일도 함께 지우세요.
- **스크린샷**: 실제 LMS·개인 화면 대신 예시 데이터로 찍은 화면을 사용하세요.
