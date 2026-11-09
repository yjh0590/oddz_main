# 글꼴 (assets/fonts)

눈누(noonnu.cc)에서 고른 글꼴을 사이트 안에 직접 두고 씁니다. 이 저장소는 공개라서 파일을 누구나 내려받을 수 있으므로,
눈누 라이선스 요약표에서 **웹사이트·임베딩 사용 가능**이고 **폰트 파일 수정·복제·배포 가능**(유료 판매만 금지)인 글꼴만 골랐습니다.
라이선스 요약은 2026-11-10에 눈누 글꼴 페이지에서 확인했습니다. 정확한 조건은 원 저작권자의 라이선스를 따릅니다.

| 폴더 | 글꼴 | 쓰는 테마 | 출처 | 라이선스 |
| --- | --- | --- | --- | --- |
| `nanum-pen-script/` | 나눔손글씨 펜 | 반딧불 채집 노트 (손글씨 메모) | [눈누 #44](https://noonnu.cc/font_page/44), Google Fonts | SIL OFL 1.1 (`OFL.txt`) |
| `paperlogy/` | 페이퍼로지 Bold·Black | 톱니바퀴 공장 (제목) | [눈누 #1456](https://noonnu.cc/font_page/1456) | 수정·복제·배포 가능, 판매 금지 |
| `galmuri/` | 갈무리11 | 폭포 던전 (제목·라벨) | [눈누 #801](https://noonnu.cc/font_page/801), npm `galmuri@2.40.3` | SIL OFL 1.1 (`LICENSE.txt`) |
| `nanum-brush-script/` | 나눔손글씨 붓 | 노을 모험가 길드 (의뢰서 제목) | [눈누 #43](https://noonnu.cc/font_page/43), Google Fonts | SIL OFL 1.1 (`OFL.txt`) |
| `cafe24-ssurround/` | 카페24 써라운드 | 비눗방울 극장 (제목) | [눈누 #669](https://noonnu.cc/font_page/669) | 수정·복제·배포 가능, 판매 금지 |
| `hakgyoansim-dunggeunmiso/` | 학교안심 둥근미소 R·B | 비눗방울 극장 (메뉴·버튼·본문) | [눈누 #1479](https://noonnu.cc/font_page/1479) | 수정·복제·배포 가능, 판매 금지 |
| `gowun-dodum/` | 고운돋움 | 물방울 수면 (한글 제목·본문) | [눈누 #734](https://noonnu.cc/font_page/734), Google Fonts | SIL OFL 1.1 (`OFL.txt`) |
| `maru-buri/` | 마루 부리 | 올림포스 신전 (한글 제목) | [눈누 #487](https://noonnu.cc/font_page/487), 네이버 한글한글 아름답게 | 수정·복제·배포 가능, 판매 금지 |

- 폴더마다 `font.css`가 있어 HTML에서 `<link rel="stylesheet" href=".../assets/fonts/<폴더>/font.css">`로 불러옵니다.
- 나눔손글씨 펜·붓은 Google Fonts가 나눈 글자 묶음별 조각(`*-000.woff2` …)이라, 브라우저가 화면에 나온 글자의 조각만 받습니다.
- 파일은 받은 그대로 두었습니다(글자 줄이기·변환 없음).
- 글꼴을 추가할 때도 눈누 라이선스 요약표의 "OFL" 줄이 "폰트 파일 수정·복제·배포 가능"인지 먼저 확인하세요. "모두 금지"인 글꼴은 파일을 이 저장소에 넣지 말고 눈누의 웹폰트 코드(CDN)로만 쓰세요.
- 먹물 화선지·사막 모래언덕·바람 부는 깃발은 위 폴더의 글꼴(나눔손글씨 붓, 마루 부리, 고운돋움)을 함께 쓰고, 김 서린 창·사막 모래언덕·자석 실험대·바람 부는 깃발의 제목 글꼴(고운바탕, 가석, Orbit, IBM Plex, Gaegu)은 Google Fonts(SIL OFL)에서 바로 불러옵니다.
