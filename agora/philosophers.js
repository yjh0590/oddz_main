// 광장에 올 수 있는 철학자 명단. ideas는 AI가 실제 사상에 근거하도록 주는 단서다.
export const PHILOSOPHERS = [
  // 고대 서양
  { id: 'heraclitus', name: '헤라클레이토스', era: '고대', region: '서양', ideas: '만물유전, 로고스, 대립물의 통일' },
  { id: 'socrates', name: '소크라테스', era: '고대', region: '서양', ideas: '산파술, 무지의 지, 캐묻지 않는 삶은 살 가치가 없다' },
  { id: 'plato', name: '플라톤', era: '고대', region: '서양', ideas: '이데아론, 동굴의 비유, 철인정치' },
  { id: 'aristotle', name: '아리스토텔레스', era: '고대', region: '서양', ideas: '중용, 4원인설, 목적론, 에우다이모니아' },
  { id: 'diogenes', name: '디오게네스', era: '고대', region: '서양', ideas: '견유주의, 자연에 따른 삶, 관습 조롱' },
  { id: 'epicurus', name: '에피쿠로스', era: '고대', region: '서양', ideas: '아타락시아, 쾌락주의(고통의 부재), 죽음은 우리와 무관' },
  { id: 'epictetus', name: '에픽테토스', era: '고대', region: '서양', ideas: '스토아 철학, 통제할 수 있는 것과 없는 것의 구분' },
  // 고대 동양
  { id: 'buddha', name: '싯다르타', era: '고대', region: '동양', ideas: '사성제, 무아, 연기, 중도' },
  { id: 'confucius', name: '공자', era: '고대', region: '동양', ideas: '인(仁), 예(禮), 정명, 군자' },
  { id: 'laozi', name: '노자', era: '고대', region: '동양', ideas: '무위자연, 도, 상선약수, 유약겸하' },
  { id: 'zhuangzi', name: '장자', era: '고대', region: '동양', ideas: '소요유, 제물론, 호접몽, 무용지용' },
  { id: 'mencius', name: '맹자', era: '고대', region: '동양', ideas: '성선설, 사단, 호연지기, 왕도정치' },
  { id: 'xunzi', name: '순자', era: '고대', region: '동양', ideas: '성악설, 예를 통한 교화, 화성기위' },
  { id: 'mozi', name: '묵자', era: '고대', region: '동양', ideas: '겸애, 비공, 절용, 실리' },
  { id: 'hanfeizi', name: '한비자', era: '고대', region: '동양', ideas: '법가, 법·술·세, 모순 이야기' },
  // 중세
  { id: 'augustine', name: '아우구스티누스', era: '중세', region: '서양', ideas: '은총, 신국론, 시간론, 악은 선의 결핍' },
  { id: 'aquinas', name: '토마스 아퀴나스', era: '중세', region: '서양', ideas: '신 존재 증명 다섯 길, 자연법, 신앙과 이성의 조화' },
  { id: 'wonhyo', name: '원효', era: '중세', region: '동양', ideas: '일심, 화쟁, 일체유심조, 무애' },
  { id: 'zhuxi', name: '주희', era: '중세', region: '동양', ideas: '성리학, 이기론, 격물치지, 거경궁리' },
  // 근세
  { id: 'descartes', name: '데카르트', era: '근세', region: '서양', ideas: '방법적 회의, 코기토, 심신이원론' },
  { id: 'spinoza', name: '스피노자', era: '근세', region: '서양', ideas: '신즉자연, 영원의 상 아래에서, 코나투스' },
  { id: 'hume', name: '흄', era: '근세', region: '서양', ideas: '인과의 습관설, 이성은 정념의 노예, 존재-당위 구분' },
  { id: 'kant', name: '칸트', era: '근세', region: '서양', ideas: '정언명령, 사람을 수단이 아닌 목적으로, 물자체' },
  { id: 'wangyangming', name: '왕양명', era: '근세', region: '동양', ideas: '심즉리, 지행합일, 치양지' },
  { id: 'yihwang', name: '이황', era: '근세', region: '동양', ideas: '이기호발설, 경(敬), 사단칠정론' },
  { id: 'jeongyakyong', name: '정약용', era: '근세', region: '동양', ideas: '실학, 성기호설, 목민심서의 애민' },
  // 근현대
  { id: 'bentham', name: '벤담', era: '근현대', region: '서양', ideas: '공리주의, 최대 다수의 최대 행복, 쾌락 계산법' },
  { id: 'mill', name: '밀', era: '근현대', region: '서양', ideas: '질적 공리주의, 위해 원칙, 배부른 돼지보다 배고픈 소크라테스' },
  { id: 'hegel', name: '헤겔', era: '근현대', region: '서양', ideas: '변증법, 절대정신, 주인과 노예의 변증법' },
  { id: 'schopenhauer', name: '쇼펜하우어', era: '근현대', region: '서양', ideas: '의지와 표상, 삶은 고통과 권태 사이의 진자' },
  { id: 'kierkegaard', name: '키르케고르', era: '근현대', region: '서양', ideas: '실존의 세 단계, 불안, 신앙의 도약' },
  { id: 'marx', name: '마르크스', era: '근현대', region: '서양', ideas: '유물론, 소외, 계급투쟁, 철학자들은 세계를 해석만 했다' },
  { id: 'nietzsche', name: '니체', era: '근현대', region: '서양', ideas: '위버멘쉬, 영원회귀, 힘에의 의지, 신은 죽었다' },
  { id: 'wittgenstein', name: '비트겐슈타인', era: '근현대', region: '서양', ideas: '언어게임, 말할 수 없는 것에 대해서는 침묵, 가족유사성' },
  { id: 'sartre', name: '사르트르', era: '근현대', region: '서양', ideas: '실존은 본질에 앞선다, 자유의 형벌, 자기기만' },
  { id: 'beauvoir', name: '보부아르', era: '근현대', region: '서양', ideas: '여자는 태어나는 것이 아니라 만들어진다, 타자, 모호성의 윤리' },
  { id: 'camus', name: '카뮈', era: '근현대', region: '서양', ideas: '부조리, 시시포스 신화, 반항' },
  { id: 'arendt', name: '한나 아렌트', era: '근현대', region: '서양', ideas: '악의 평범성, 활동적 삶, 사유하지 않음' },
  { id: 'nishida', name: '니시다 기타로', era: '근현대', region: '동양', ideas: '순수경험, 장소의 논리, 절대무' },
  { id: 'hamseokheon', name: '함석헌', era: '근현대', region: '동양', ideas: '씨알 사상, 뜻으로 본 역사, 비폭력 저항' },
];

export const BY_ID = new Map(PHILOSOPHERS.map((p) => [p.id, p]));
