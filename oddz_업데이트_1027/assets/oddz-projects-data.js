/* oddz — 프로젝트 공통 데이터 (PJ 번호는 최초 기록 순서)
 * 이 파일만 수정하면 여섯 테마의 카드와 필터가 함께 업데이트됩니다.
 * 주의: 사실확인이 필요한 기록 날짜는 dateBasis 참고.
 */
window.ODDZ_PROJECTS = Object.freeze([
  {
    "id": "pj-01",
    "no": "PJ 01",
    "stage": "next",
    "type": "Web Game",
    "name": "연쇄 가위바위보",
    "desc": "참가자들의 승패 결과가 연속적으로 이어지는 게임.",
    "feat": "참가자·승패·라운드에 따른 결과 연결",
    "current": "기존 홈페이지의 다음 작업 아이디어",
    "next": "가장 단순한 한 판 규칙부터 프로토타입 만들기",
    "tags": [
      "가위바위보",
      "캐주얼"
    ],
    "date": "2025.10.02",
    "dateBasis": "아이디어 메모",
    "oldNumber": "PJ 17"
  },
  {
    "id": "pj-02",
    "no": "PJ 02",
    "stage": "done",
    "type": "Web",
    "name": "수강신청 연습사이트",
    "desc": "수강신청 과정을 미리 체험할 수 있도록 만든 연습 페이지.",
    "feat": "수강신청 흐름을 미리 익히는 웹 연습 환경",
    "current": "기존 홈페이지에 완성 프로젝트로 등록",
    "next": "필요할 때 사용성·화면 구성을 개선",
    "tags": [
      "웹",
      "학습"
    ],
    "url": "/projects/enrollment.html?theme=sparkle",
    "link": "프로젝트 보기",
    "date": "2026.05.04",
    "dateBasis": "개발일지",
    "oldNumber": "PJ 11"
  },
  {
    "id": "pj-03",
    "no": "PJ 03",
    "stage": "done",
    "type": "Desktop",
    "name": "나의 일기장",
    "desc": "인터넷 없이 사용할 수 있는 Electron 기반 개인 일기장.",
    "feat": "오프라인 기록과 데스크톱 실행 파일",
    "current": "데스크톱 앱과 실행 파일 제작 이력 확인",
    "next": "설치·사용 안내와 데이터 백업 경험 다듬기",
    "tags": [
      "Electron",
      "일상"
    ],
    "url": "/projects/diary.html?theme=sparkle",
    "link": "프로젝트 보기",
    "date": "2026.05.04",
    "dateBasis": "개발일지",
    "oldNumber": "PJ 12"
  },
  {
    "id": "pj-04",
    "no": "PJ 04",
    "stage": "next",
    "type": "Web · 3D",
    "name": "물병 던지기",
    "desc": "손 동작을 사용해 물병을 잡고 던지는 3D 게임.",
    "feat": "물병 잡기·던지기·물리 움직임 시뮬레이션",
    "current": "기존 홈페이지의 다음 작업 아이디어",
    "next": "마우스/터치 조작으로 먼저 기본 물리 구현",
    "tags": [
      "3D",
      "물리"
    ],
    "date": "2026.05.04",
    "dateBasis": "3D 실험 기록",
    "oldNumber": "PJ 18"
  },
  {
    "id": "pj-05",
    "no": "PJ 05",
    "stage": "done",
    "type": "Chrome Extension",
    "name": "오늘의 강의 · LMS 재생 도우미",
    "desc": "선택한 온라인 강의를 순서대로 이어서 재생하는 크롬 확장프로그램.",
    "feat": "강의 선택·자동 이동·연속 재생과 학교별 버전",
    "current": "프로그램 제작 및 배포 페이지 운영 이력 확인",
    "next": "학교별 동작 안정성·호환성 지속 개선",
    "tags": [
      "확장프로그램",
      "학습"
    ],
    "url": "/projects/todays-lecture.html?theme=sparkle",
    "link": "다운로드·사용법",
    "date": "2026.07",
    "dateBasis": "월만 확인",
    "oldNumber": "PJ 14"
  },
  {
    "id": "pj-06",
    "no": "PJ 06",
    "stage": "doing",
    "type": "Web Game",
    "name": "랜덤게임 모음집",
    "desc": "짧게 즐길 수 있는 여러 게임을 한곳에 모으는 웹 프로젝트.",
    "feat": "가벼운 미니게임을 목록에서 선택해 즐기는 구성",
    "current": "기존 홈페이지에서 진행 중으로 관리",
    "next": "게임 간 이동과 개별 게임 완성도 개선",
    "tags": [
      "미니게임",
      "웹"
    ],
    "date": "2026.07.30",
    "dateBasis": "개발일지",
    "oldNumber": "PJ 16"
  },
  {
    "id": "pj-07",
    "no": "PJ 07",
    "stage": "doing",
    "type": "Web App",
    "name": "내리는 문 · 지하철 하차 방향",
    "desc": "사용자가 어느 방향을 바라보더라도 다음 역의 하차 문 방향을 안내하는 웹앱.",
    "feat": "지하철 운행 정보와 휴대폰 방향 센서를 조합한 안내",
    "current": "Cloudflare Worker 연결과 나침반 표시 개선 작업 이력 확인",
    "next": "방향 회전의 부드러움·센서 보정·실제 환경 테스트",
    "tags": [
      "지하철",
      "센서",
      "위치"
    ],
    "date": "2026.08.12",
    "dateBasis": "개발일지",
    "oldNumber": "PJ 05"
  },
  {
    "id": "pj-08",
    "no": "PJ 08",
    "stage": "done",
    "type": "Automation",
    "name": "자료 정리 매크로",
    "desc": "반복적인 보고서 자료 정리 작업을 줄이기 위한 자동화 도구.",
    "feat": "문서 정리 반복 작업 자동화와 실행 프로그램 제작",
    "current": "최종 버전으로 정리한 제작 이력 확인",
    "next": "처음 쓰는 사람을 위한 간단한 사용 설명 정리",
    "tags": [
      "자동화",
      "업무 효율"
    ],
    "url": "/projects/document-macro.html?theme=sparkle",
    "link": "프로젝트 보기",
    "date": "2026.09.22",
    "dateBasis": "개발일지",
    "oldNumber": "PJ 13"
  },
  {
    "id": "pj-09",
    "no": "PJ 09",
    "stage": "someday",
    "type": "Desktop Widget",
    "name": "커피 카운터 위젯",
    "desc": "오늘 마신 커피를 빠르게 기록하는 바탕화면 위젯.",
    "feat": "한 번 누르는 카운터와 날짜별 기록",
    "current": "기존 홈페이지에 구상으로 등록",
    "next": "간단한 데스크톱 위젯으로 시작",
    "tags": [
      "위젯",
      "라이프"
    ],
    "date": "2026.09.23 이전",
    "dateBasis": "첫 확인 기록",
    "oldNumber": "PJ 20"
  },
  {
    "id": "pj-10",
    "no": "PJ 10",
    "stage": "next",
    "type": "Data · AI",
    "name": "단단 · AI 어휘 사전",
    "desc": "단어를 더 쉽고 깊이 이해하도록 돕는 AI 기반 어휘 탐색 서비스.",
    "feat": "어휘 뜻·표현과 관련 정보를 찾아보는 사전 인터페이스",
    "current": "기존 홈페이지의 다음 작업 아이디어",
    "next": "검색·뜻·예시 중심의 최소 기능 정리",
    "tags": [
      "어휘",
      "AI"
    ],
    "date": "2026.09.23 이전",
    "dateBasis": "첫 확인 기록",
    "oldNumber": "PJ 19"
  },
  {
    "id": "pj-11",
    "no": "PJ 11",
    "stage": "done",
    "type": "Web Guide",
    "name": "강의 영상 대본화 가이드",
    "desc": "강의 영상의 음성을 MP3로 준비하고 대본화 작업으로 이어가는 과정을 안내하는 도구.",
    "feat": "MP3 변환·내려받기와 작업 안내",
    "current": "안내 페이지 구축 및 다운로드 UX 개선 이력 확인",
    "next": "사용법을 더 직관적으로 표현하고 접속·브라우저 동작 점검",
    "tags": [
      "학습",
      "MP3"
    ],
    "url": "/projects/transcript-guide.html?theme=bubbles",
    "link": "사용 가이드",
    "date": "2026.09.23",
    "dateBasis": "최초 제작 대화",
    "oldNumber": "PJ 15"
  },
  {
    "id": "pj-12",
    "no": "PJ 12",
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
    "dateBasis": "기획 대화",
    "oldNumber": "PJ 01"
  },
  {
    "id": "pj-13",
    "no": "PJ 13",
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
    "dateBasis": "기획 대화",
    "oldNumber": "PJ 02"
  },
  {
    "id": "pj-14",
    "no": "PJ 14",
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
    "dateBasis": "개발 대화",
    "oldNumber": "PJ 04"
  },
  {
    "id": "pj-15",
    "no": "PJ 15",
    "stage": "doing",
    "type": "Web Game",
    "name": "페이지 키우기",
    "desc": "글과 상호작용에 반응해 점·선·면, 1D·2D·3D로 성장하는 캐릭터 게임.",
    "feat": "입력에 따른 변화, 감정·나이·직업·능력치 성장 구조",
    "current": "웹 프로토타입 개발 이력 있음. 반복 입력과 3D 전환은 재점검 필요",
    "next": "성장 단계 오류 수정 및 스토리·직업 이벤트 확장",
    "tags": [
      "성장",
      "인터랙션",
      "프로토타입"
    ],
    "date": "2026.10.14",
    "dateBasis": "개발 대화",
    "oldNumber": "PJ 03"
  },
  {
    "id": "pj-16",
    "no": "PJ 16",
    "stage": "someday",
    "type": "Life Simulation",
    "name": "일기장 키우기",
    "desc": "일기를 쓸수록 캐릭터가 달라지고 이야기가 쌓이는 기록형 성장 서비스.",
    "feat": "기록 입력·감정 반응·외형 진화·그림일기",
    "current": "게임과 감정 기록 방식을 함께 구상 중",
    "next": "PJ 15과 공통 성장 엔진 재사용 가능성 검토",
    "tags": [
      "일기",
      "성장",
      "스토리"
    ],
    "date": "2026.10.14",
    "dateBasis": "기획 대화",
    "oldNumber": "PJ 06"
  },
  {
    "id": "pj-17",
    "no": "PJ 17",
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
    "dateBasis": "아이디어 제안",
    "oldNumber": "PJ 07"
  },
  {
    "id": "pj-18",
    "no": "PJ 18",
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
    "dateBasis": "아이디어 제안",
    "oldNumber": "PJ 08"
  },
  {
    "id": "pj-19",
    "no": "PJ 19",
    "stage": "next",
    "type": "Desktop Utility",
    "name": "PC 명령어 도구",
    "desc": "Windows 명령어를 몰라도 일상적인 컴퓨터 동작을 버튼으로 실행하는 프로그램.",
    "feat": "예약 종료·재시작·화면 잠금 등 편의 명령",
    "current": "아이디어 구상 단계",
    "next": "안전한 명령부터 구현하고 위험 작업은 확인 절차 마련",
    "tags": [
      "Windows",
      "생산성"
    ],
    "date": "2026.10.23",
    "dateBasis": "아이디어 제안",
    "oldNumber": "PJ 09"
  },
  {
    "id": "pj-20",
    "no": "PJ 20",
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
    "dateBasis": "아이디어 제안",
    "oldNumber": "PJ 10"
  }
]);
