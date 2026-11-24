/* oddz — 프로젝트 공통 데이터 (PJ 번호는 최초 기록 순서, 같은 날은 만든 순서)
 * 이 파일만 수정하면 모든 테마(홈 14개)의 카드와 필터가 함께 업데이트됩니다.
 * 주의: 사실확인이 필요한 기록 날짜는 dateBasis 참고.
 * 소개 페이지가 없는 카드는 url에 개발일지(/journal/…)를 연결합니다.
 */
window.ODDZ_PROJECTS = Object.freeze([
  {
    "id": "pj-01",
    "no": "PJ 01",
    "icon": "/assets/icons/pj-01.png",
    "stage": "someday",
    "type": "Web",
    "name": "PDF 변환·정리 웹사이트",
    "desc": "PDF 분석에 쓸 기본 프롬프트를 관리자 화면에서 정하는 웹사이트 실험.",
    "feat": "관리자 화면의 기본 프롬프트 설정과 로그인 연결",
    "current": "로그인 연결에서 멈춘 실험",
    "next": "로그인이 막힌 원인부터 다시 확인",
    "tags": [
      "PDF",
      "웹",
      "실험"
    ],
    "url": "/journal/pdf-experiment.html",
    "link": "개발일지",
    "date": "2025.09.04",
    "dateBasis": "개발일지"
  },
  {
    "id": "pj-02",
    "no": "PJ 02",
    "icon": "/assets/icons/pj-02.png",
    "stage": "next",
    "type": "Web Game",
    "name": "연쇄 가위바위보",
    "desc": "참가자들의 승패 결과가 연속적으로 이어지는 게임.",
    "feat": "참가자·승패·라운드에 따른 결과 연결",
    "current": "아이디어 구상 단계",
    "next": "가장 단순한 한 판 규칙부터 프로토타입 만들기",
    "tags": [
      "가위바위보",
      "캐주얼"
    ],
    "url": "/journal/rock-paper-scissors.html",
    "link": "개발일지",
    "date": "2025.10.02",
    "dateBasis": "아이디어 메모"
  },
  {
    "id": "pj-03",
    "no": "PJ 03",
    "icon": "/assets/icons/pj-03.png",
    "stage": "someday",
    "type": "Idea",
    "name": "키보드 답장 도우미",
    "desc": "답장을 쓸 때 AI가 문장을 제안해 주는 키보드 아이디어.",
    "feat": "입력 중인 답장에 맞춘 AI 문장 제안",
    "current": "아이디어 메모 단계",
    "next": "어떤 상황의 답장을 도울지 범위 정하기",
    "tags": [
      "키보드",
      "AI",
      "아이디어"
    ],
    "url": "/journal/keyboard.html",
    "link": "개발일지",
    "date": "2025.12.09",
    "dateBasis": "개발일지"
  },
  {
    "id": "pj-04",
    "no": "PJ 04",
    "icon": "/assets/icons/pj-04.png",
    "stage": "done",
    "type": "Web",
    "name": "수강신청 연습사이트",
    "desc": "수강신청 과정을 미리 체험할 수 있도록 만든 연습 페이지.",
    "feat": "수강신청 흐름을 미리 익히는 웹 연습 환경",
    "current": "연습 사이트 공개 중",
    "next": "필요할 때 사용성·화면 구성을 개선",
    "tags": [
      "웹",
      "학습"
    ],
    "url": "/projects/enrollment.html?theme=sparkle",
    "link": "프로젝트 보기",
    "date": "2026.05.04",
    "dateBasis": "개발일지"
  },
  {
    "id": "pj-05",
    "no": "PJ 05",
    "icon": "/assets/icons/pj-05.png",
    "stage": "done",
    "type": "Desktop",
    "name": "나의 일기장",
    "desc": "인터넷 없이 사용할 수 있는 Electron 기반 개인 일기장.",
    "feat": "오프라인 기록과 데스크톱 실행 파일",
    "current": "Windows 설치 파일 v1.0.0 배포",
    "next": "설치·사용 안내와 데이터 백업 경험 다듬기",
    "tags": [
      "Electron",
      "일상"
    ],
    "url": "/projects/diary.html?theme=sparkle",
    "link": "프로젝트 보기",
    "date": "2026.05.04",
    "dateBasis": "개발일지"
  },
  {
    "id": "pj-06",
    "no": "PJ 06",
    "icon": "/assets/icons/pj-06.png",
    "stage": "next",
    "type": "Web · 3D",
    "name": "물병 던지기",
    "desc": "손 동작을 사용해 물병을 잡고 던지는 3D 게임.",
    "feat": "물병 잡기·던지기·물리 움직임 시뮬레이션",
    "current": "카메라 트래킹 프로토타입 제작, 튜닝·버그 수정 남음",
    "next": "마우스/터치 조작으로 먼저 기본 물리 구현",
    "tags": [
      "3D",
      "물리"
    ],
    "url": "/journal/bottle.html",
    "link": "개발일지",
    "date": "2026.05.04",
    "dateBasis": "3D 실험 기록"
  },
  {
    "id": "pj-07",
    "no": "PJ 07",
    "icon": "/assets/icons/pj-07.png",
    "stage": "someday",
    "type": "Web · 3D",
    "name": "카메라 트래킹 3D 큐브",
    "desc": "여러 회전축을 가진 큐브를 카메라 입력으로 돌려 보는 인터랙션 실험.",
    "feat": "카메라로 큐브의 회전·방향 제어, 좌표계·감도 설정",
    "current": "실험 단계, 움직임이 예민해 안정화가 필요",
    "next": "감도와 인식 조건을 다듬어 안정적인 버전 만들기",
    "tags": [
      "3D",
      "카메라",
      "실험"
    ],
    "url": "/journal/cube.html",
    "link": "개발일지",
    "date": "2026.05.04",
    "dateBasis": "개발일지"
  },
  {
    "id": "pj-08",
    "no": "PJ 08",
    "icon": "/assets/icons/pj-08.png",
    "stage": "done",
    "type": "Chrome Extension",
    "name": "오늘의 강의 · LMS 재생 도우미",
    "desc": "선택한 온라인 강의를 순서대로 이어서 재생하는 크롬 확장프로그램.",
    "feat": "강의 선택·자동 이동·연속 재생과 학교별 버전",
    "current": "인천대 v0.2.7 · 가톨릭대 v0.6.9 · K-MOOC v0.1.0 배포 중",
    "next": "학교별 동작 안정성·호환성 지속 개선",
    "tags": [
      "확장프로그램",
      "학습"
    ],
    "url": "/projects/todays-lecture.html?theme=sparkle",
    "link": "다운로드·사용법",
    "date": "2026.07",
    "dateBasis": "월만 확인"
  },
  {
    "id": "pj-09",
    "no": "PJ 09",
    "icon": "/assets/icons/pj-09.png",
    "stage": "doing",
    "type": "Web Game",
    "name": "랜덤게임 모음집",
    "desc": "짧게 즐길 수 있는 여러 게임을 한곳에 모으는 웹 프로젝트.",
    "feat": "가벼운 미니게임을 목록에서 선택해 즐기는 구성",
    "current": "콤이 셋 성격·실수 잡기·취기 게이지·단톡방 채팅 추가, 게임 규칙 검수 중",
    "next": "게임 간 이동과 개별 게임 완성도 개선",
    "tags": [
      "미니게임",
      "웹"
    ],
    "url": "/projects/random-game.html",
    "link": "게임 하기",
    "date": "2026.07.30",
    "dateBasis": "개발일지"
  },
  {
    "id": "pj-10",
    "no": "PJ 10",
    "icon": "/assets/icons/pj-10.png",
    "stage": "done",
    "type": "Web",
    "name": "oddz.click",
    "desc": "만든 것들을 모아 두는 이 사이트. 이름을 정하고 도메인을 사서 GitHub Pages에 연결했다.",
    "feat": "홈 테마 14개, 프로젝트 카드·현황판, 상세 페이지와 개발일지",
    "current": "oddz.click 운영 중, 프로젝트가 생길 때마다 갱신",
    "next": "사이트 구조와 디자인 대규모 업데이트",
    "tags": [
      "웹",
      "포트폴리오",
      "GitHub Pages"
    ],
    "url": "/journal/oddz.html",
    "link": "개발일지",
    "date": "2026.07.31",
    "dateBasis": "도메인 구입·개발일지"
  },
  {
    "id": "pj-11",
    "no": "PJ 11",
    "icon": "/assets/icons/pj-11.png",
    "stage": "doing",
    "type": "Web App",
    "name": "내리는 문 · 지하철 하차 방향",
    "desc": "사용자가 어느 방향을 바라보더라도 다음 역의 하차 문 방향을 안내하는 웹앱.",
    "feat": "지하철 운행 정보와 휴대폰 방향 센서를 조합한 안내",
    "current": "서울 1~9호선 자동 추적 버전 공개, 문 방향 현장 기록 수집 중",
    "next": "방향 회전의 부드러움·센서 보정·실제 환경 테스트",
    "tags": [
      "지하철",
      "센서",
      "위치"
    ],
    "url": "/projects/subway.html",
    "link": "앱 열기",
    "date": "2026.08.12",
    "dateBasis": "개발일지"
  },
  {
    "id": "pj-12",
    "no": "PJ 12",
    "icon": "/assets/icons/pj-12.png",
    "stage": "done",
    "type": "Automation",
    "name": "자료 정리 매크로",
    "desc": "반복적인 보고서 자료 정리 작업을 줄이기 위한 자동화 도구.",
    "feat": "문서 정리 반복 작업 자동화와 실행 프로그램 제작",
    "current": "v17을 최종 버전으로 배포",
    "next": "처음 쓰는 사람을 위한 간단한 사용 설명 정리",
    "tags": [
      "자동화",
      "업무 효율"
    ],
    "url": "/projects/document-macro.html?theme=sparkle",
    "link": "프로젝트 보기",
    "date": "2026.09.22",
    "dateBasis": "개발일지"
  },
  {
    "id": "pj-13",
    "no": "PJ 13",
    "icon": "/assets/icons/pj-13.png",
    "stage": "someday",
    "type": "Desktop Widget",
    "name": "커피 카운터 위젯",
    "desc": "오늘 마신 커피를 빠르게 기록하는 바탕화면 위젯.",
    "feat": "한 번 누르는 카운터와 날짜별 기록",
    "current": "아이디어 구상 단계",
    "next": "간단한 데스크톱 위젯으로 시작",
    "tags": [
      "위젯",
      "라이프"
    ],
    "date": "2026.09.23 이전",
    "dateBasis": "첫 확인 기록"
  },
  {
    "id": "pj-14",
    "no": "PJ 14",
    "icon": "/assets/icons/pj-14.png",
    "stage": "next",
    "type": "Data · AI",
    "name": "단단 · AI 어휘 사전",
    "desc": "단어를 더 쉽고 깊이 이해하도록 돕는 AI 기반 어휘 탐색 서비스.",
    "feat": "어휘 뜻·표현과 관련 정보를 찾아보는 사전 인터페이스",
    "current": "아이디어 구상 단계",
    "next": "검색·뜻·예시 중심의 최소 기능 정리",
    "tags": [
      "어휘",
      "AI"
    ],
    "date": "2026.09.23 이전",
    "dateBasis": "첫 확인 기록"
  },
  {
    "id": "pj-15",
    "no": "PJ 15",
    "icon": "/assets/icons/pj-15.png",
    "stage": "done",
    "type": "Web Guide",
    "name": "강의 영상 대본화 가이드",
    "desc": "강의 영상의 음성을 MP3로 준비하고 대본화 작업으로 이어가는 과정을 안내하는 도구.",
    "feat": "MP3 변환·내려받기와 작업 안내",
    "current": "웹 가이드 공개, Windows 설치 파일 v1.0.0 배포",
    "next": "사용법을 더 직관적으로 표현하고 접속·브라우저 동작 점검",
    "tags": [
      "학습",
      "MP3"
    ],
    "url": "/projects/transcript-guide.html?theme=bubbles",
    "link": "사용 가이드",
    "date": "2026.09.23",
    "dateBasis": "최초 제작 대화"
  },
  {
    "id": "pj-16",
    "no": "PJ 16",
    "icon": "/assets/icons/pj-16.png",
    "stage": "someday",
    "type": "Search Platform",
    "name": "광고 레퍼런스 검색기",
    "desc": "업종·분위기·촬영·편집·타깃·목적에 따라 광고를 탐색하는 검색 서비스.",
    "feat": "수동 선별 광고 500개 태깅·검색·컬렉션",
    "current": "서비스 방향과 데이터 축적 전략 구상 단계",
    "next": "분류 기준 설계와 소규모 샘플 광고 아카이브 구축",
    "tags": [
      "검색",
      "광고",
      "장기 프로젝트"
    ],
    "date": "2026.09.27",
    "dateBasis": "기획 대화"
  },
  {
    "id": "pj-17",
    "no": "PJ 17",
    "icon": "/assets/icons/pj-17.png",
    "stage": "someday",
    "type": "Roblox Game",
    "name": "랜덤 월드 · Random World",
    "desc": "로블록스에서 무작위 사건과 미니게임을 즐기는 멀티플레이 게임.",
    "feat": "이동 속도·점프·크기 변화 이벤트와 로비",
    "current": "게임 콘셉트와 확장 방향 구상 단계",
    "next": "랜덤 이벤트 3종으로 첫 로블록스 테스트",
    "tags": [
      "Roblox",
      "멀티플레이"
    ],
    "date": "2026.10.02",
    "dateBasis": "기획 대화"
  },
  {
    "id": "pj-18",
    "no": "PJ 18",
    "icon": "/assets/icons/pj-18.png",
    "stage": "done",
    "type": "Web Game",
    "name": "IF 세계 · 만약에 로또에 당첨된다면?",
    "desc": "한국의 경제·사회·역사적 사건 속에서 선택하며 삶을 시뮬레이션하는 웹 게임.",
    "feat": "시대별 사건·소득·주거·투자·인생 선택과 결과",
    "current": "공개된 버전이 있으며 초보자·전문가 모드 등 개선 논의 진행",
    "next": "초보자 모드와 능력치·사건 분기 고도화",
    "tags": [
      "경제",
      "시뮬레이션",
      "공개본 있음"
    ],
    "url": "/projects/if-world.html?theme=sparkle",
    "link": "프로젝트 보기",
    "date": "2026.10.12",
    "dateBasis": "개발 대화"
  },
  {
    "id": "pj-19",
    "no": "PJ 19",
    "icon": "/assets/icons/pj-19.png",
    "stage": "doing",
    "type": "Web Game",
    "name": "반려 페이지 키우기",
    "desc": "아무것도 없는 화면에 말을 건네며 점 → 선 → 면 → 2D 생명 → 3D 입체로 키우는 웹 게임.",
    "feat": "말 먹이기, 성장 단계, 인연·꿈·집·직업 인생 시뮬레이션, 말한 것이 되는 변신과 겹쳐 입기",
    "current": "v0.17.0 공개 · 변신한 모습이 움직이고 말하고, 모자·안경을 걸침",
    "next": "성장 이벤트와 변신 단어 다듬기",
    "tags": [
      "성장",
      "인터랙션",
      "프로토타입"
    ],
    "date": "2026.10.14",
    "dateBasis": "개발 대화",
    "url": "/projects/companion.html",
    "link": "페이지 키우기"
  },
  {
    "id": "pj-20",
    "no": "PJ 20",
    "icon": "/assets/icons/pj-20.png",
    "stage": "someday",
    "type": "Life Simulation",
    "name": "일기장 키우기",
    "desc": "일기를 쓸수록 캐릭터가 달라지고 이야기가 쌓이는 기록형 성장 서비스.",
    "feat": "기록 입력·감정 반응·외형 진화·그림일기",
    "current": "게임과 감정 기록 방식을 함께 구상 중",
    "next": "PJ 19와 공통 성장 엔진 재사용 가능성 검토",
    "tags": [
      "일기",
      "성장",
      "스토리"
    ],
    "date": "2026.10.14",
    "dateBasis": "기획 대화"
  },
  {
    "id": "pj-21",
    "no": "PJ 21",
    "icon": "/assets/icons/pj-21.png",
    "stage": "someday",
    "type": "Routine Utility",
    "name": "나만의 괄사·마사지 타이머",
    "desc": "마사지 동작과 시간을 나만의 루틴으로 묶고 따라 하는 타이머.",
    "feat": "동작·시간 편집, 타이머, 음성 안내",
    "current": "유튜브 영상 분석 기능까지 포함해 기획 구상 중",
    "next": "AI 영상 분석에 앞서 수동 루틴 타이머 구현",
    "tags": [
      "타이머",
      "루틴"
    ],
    "date": "2026.10.23",
    "dateBasis": "아이디어 제안"
  },
  {
    "id": "pj-22",
    "no": "PJ 22",
    "icon": "/assets/icons/pj-22.png",
    "stage": "next",
    "type": "2D Game",
    "name": "글자 전투",
    "desc": "입력하거나 그린 글자가 살아 움직여 서로 싸우는 게임.",
    "feat": "글자의 크기·획수·형태를 능력치로 바꾸는 전투",
    "current": "아이디어 구상 단계",
    "next": "키보드로 입력한 글자 두 개의 1:1 대결부터 구현",
    "tags": [
      "타이핑",
      "물리",
      "게임"
    ],
    "date": "2026.10.23",
    "dateBasis": "아이디어 제안"
  },
  {
    "id": "pj-23",
    "no": "PJ 23",
    "icon": "/assets/icons/pj-23.png",
    "stage": "done",
    "type": "Windows App",
    "name": "명령어 도구함 · CmdToolbox",
    "desc": "cmd에 직접 입력하던 Windows 명령어를 버튼 하나로 실행하는 프로그램.",
    "feat": "종료 예약, 전원, IP·네트워크 확인, 와이파이 비밀번호, 포트 정리, 디스크 정리 등 13가지 기능",
    "current": "Windows 실행 파일 v1.0.0 배포",
    "tags": [
      "Windows",
      "생산성",
      "cmd"
    ],
    "url": "/projects/cmd-toolbox.html?theme=sparkle",
    "link": "다운로드·사용법",
    "date": "2026.11.08",
    "dateBasis": "GitHub Release v1.0.0"
  },
  {
    "id": "pj-24",
    "no": "PJ 24",
    "icon": "/assets/icons/pj-24.png",
    "stage": "someday",
    "type": "Practice Game",
    "name": "콘서트 티켓팅 연습장",
    "desc": "공연장 좌석 선택을 실제 티켓팅처럼 반복 연습하는 웹 시뮬레이터.",
    "feat": "좌석 선택 속도 측정과 인기 구역 연습",
    "current": "시뮬레이션 방식과 확장 기능 구상 단계",
    "next": "가상의 좌석표로 속도 측정 프로토타입 구현",
    "tags": [
      "티켓팅",
      "연습",
      "시뮬레이션"
    ],
    "date": "2026.10.23",
    "dateBasis": "아이디어 제안"
  },
  {
    "id": "pj-25",
    "no": "PJ 25",
    "icon": "/assets/icons/pj-25.png",
    "stage": "done",
    "type": "Windows App",
    "name": "쓱-싹 · 파일 정리 도우미",
    "desc": "복사본과 비슷한 폴더를 비교하고, 직접 선택한 항목을 휴지통으로 옮기는 Windows 파일 정리 도우미.",
    "feat": "파일·폴더 비교, 남길 기준 선택, 정크·용량 확인, Chrome 다운로드 정리, 파일 구조화",
    "current": "v0.7.18 · 성능 개선과 Python 포함 포터블 ZIP 배포, 자동 테스트 57개 통과",
    "next": "Windows 실제 사용 흐름·화면 검증과 코드 서명 검토",
    "tags": [
      "쓱싹",
      "파일 정리",
      "다운로드",
      "Windows",
      "Chrome"
    ],
    "url": "/projects/sseuk-ssak.html",
    "link": "다운로드·사용법",
    "date": "2026.11.11",
    "dateBasis": "성능 개선·포터블 ZIP 및 개발일지 업데이트"
  },
  {
    "id": "pj-26",
    "no": "PJ 26",
    "icon": "/assets/icons/pj-26.png",
    "stage": "done",
    "type": "Web",
    "name": "Motion Shelf · 웹 모션 모음",
    "desc": "복사해서 바로 쓰는 웹 모션·UI 요소 모음. 요소마다 AI에게 줄 프롬프트와 코드가 함께 있다.",
    "feat": "모션·UI 요소 400여 종, 요소별 프롬프트·코드 복사, 프롬프트 쓰는 법, 모션 용어 사전, 레퍼런스 사이트",
    "current": "motion.oddz.click 배포",
    "next": "요소 추가와 카테고리 정리",
    "tags": [
      "모션",
      "UI",
      "프롬프트",
      "웹"
    ],
    "url": "/projects/motion-shelf.html",
    "link": "사이트 열기",
    "date": "2026.11.10",
    "dateBasis": "저장소 커밋 기록"
  },
  {
    "id": "pj-27",
    "no": "PJ 27",
    "icon": "/assets/icons/pj-27.png",
    "stage": "doing",
    "type": "Web",
    "name": "어쩔 수 없었어 · 나비효과",
    "desc": "아무 상관 없어 보이는 두 사건을 구체적이고 웃긴 나비효과 이야기로 연결하는 사이트.",
    "feat": "두 사건 입력, 상세한 연결 과정, 다른 변명·복사, 흑백 나비 모션",
    "current": "상식적인 일상 경로로 개편, 이야기 테스트 8개 및 브라우저 동작 확인",
    "next": "자유형 AI 생성 연결과 이야기 다양성 개선",
    "tags": [
      "나비효과",
      "유머",
      "웹"
    ],
    "url": "/projects/butterfly-effect.html",
    "link": "사이트·개발일지",
    "date": "2026.11.15",
    "dateBasis": "기획·구현 및 첫 공개 기록"
  },
  {
    "id": "pj-28",
    "no": "PJ 28",
    "icon": "/assets/icons/pj-28.png",
    "stage": "doing",
    "type": "Web · AI",
    "name": "와글 · AI 커뮤니티",
    "desc": "같은 의견에 쏟아지는 일곱 가지 분위기의 가상 커뮤니티 반응을 구경하는 사이트.",
    "feat": "분위기 다중 선택, 의견·AI 일상 모드, 순차 댓글, 공감·정렬, 내 이야기 기록",
    "current": "공개 데모 배포 · 실제 AI는 서버 API 키 설정 후 사용 가능",
    "next": "실제 AI 서버 배포와 커뮤니티별 반응 다양성 개선",
    "tags": [
      "AI",
      "커뮤니티",
      "시뮬레이션"
    ],
    "url": "/projects/wagle.html",
    "link": "데모 체험하기",
    "date": "2026.11.16",
    "dateBasis": "첫 구현·테스트 및 oddz 공개 데모 연결"
  },
  {
    "id": "pj-29",
    "no": "PJ 29",
    "icon": "/assets/icons/pj-29.png",
    "stage": "doing",
    "type": "Web · AI",
    "name": "AGORA · 철학자들의 광장",
    "desc": "질문이나 생각을 던지면 동서양 철학자 6명이 각자의 사상으로 한 줄씩 답하는 개인용 광장.",
    "feat": "철학자 40명 중 질문별 6명 선정, 사상 꼬리표, 가짜 명언 금지, 최근 질문 기록",
    "current": "첫 버전 공개 · 브라우저에서 Claude API 직접 호출, 비밀번호로 잠근 키",
    "next": "답변 톤 다듬기와 철학자 명단 보강",
    "tags": [
      "AI",
      "철학",
      "웹"
    ],
    "url": "/projects/agora.html",
    "link": "사이트·개발일지",
    "date": "2026.11.21",
    "dateBasis": "개발일지 첫 공개"
  },
  {
    "id": "pj-30",
    "no": "PJ 30",
    "icon": "/assets/icons/pj-30.png",
    "stage": "doing",
    "type": "Web",
    "name": "바람숲",
    "desc": "숨 고르기, 짧은 명상, 감각 산책과 몸 쉬기로 잠시 나를 돌보는 웹 쉼터. 쓴 글과 활동은 저장하지 않는다.",
    "feat": "호흡·명상·감각 산책·몸 쉬기 안내, 기분별 숲 풍경, 합성한 바람·비·시냇물 소리, 바람에 흘려보내는 글쓰기",
    "current": "활동을 그림과 함께 안내하는 별도 창으로 개편, 활동별 근거 자료 연결",
    "next": "활동 흐름과 소리 다듬기",
    "tags": [
      "쉼",
      "명상",
      "웹"
    ],
    "url": "/projects/baramsup.html",
    "link": "숲 열기",
    "date": "2026.11.23",
    "dateBasis": "저장소 첫 커밋"
  },
  {
    "id": "pj-31",
    "no": "PJ 31",
    "icon": "/assets/icons/pj-31.png",
    "stage": "doing",
    "type": "Web App",
    "name": "이맘때 · 계절 캘린더",
    "desc": "지금 챙길 일과 작년 이맘때의 기록을 함께 보는 계절 캘린더. 중앙의 돌 캐릭터가 계절마다 옷과 풍경을 바꾼다.",
    "feat": "할 일·반복 일정, 일기·사진·가계부 기록, 작년 이맘때 회상 카드, 그날의 날씨와 그 무렵의 세상",
    "current": "v0.8.0 · 기억을 넘겨 보는 회상 화면과 그날의 사건·동네 변화",
    "next": "실제 기기에서 써 보며 기록 연결 다듬기",
    "tags": [
      "캘린더",
      "기록",
      "회상"
    ],
    "url": "/journal/imamttae.html",
    "link": "개발일지",
    "date": "2026.11.23",
    "dateBasis": "저장소 첫 커밋"
  },
  {
    "id": "pj-32",
    "no": "PJ 32",
    "icon": "/assets/icons/pj-32.png",
    "stage": "doing",
    "type": "Web App",
    "name": "콕콕 예약알림",
    "desc": "전시·공연·체험 예약 페이지를 대신 지켜보다가 예약이 열리면 휴대폰으로 알려 주는 웹 알림 앱.",
    "feat": "조건별 예약 오픈 감지, 안드로이드·아이폰 웹푸시, 초대 코드로 가족과 함께 쓰기",
    "current": "첫 버전 완성 · start.bat 실행과 리눅스 서버 설치 스크립트",
    "next": "실제 예약 사이트에서 오래 돌려 보며 감지 조건 다듬기",
    "tags": [
      "알림",
      "예약",
      "웹푸시"
    ],
    "url": "/journal/kokkok.html",
    "link": "개발일지",
    "date": "2026.11.24",
    "dateBasis": "저장소 첫 커밋"
  }
]);
