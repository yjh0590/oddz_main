const thought = document.querySelector('#thought');
const count = document.querySelector('#count');
const release = document.querySelector('#release');
const card = document.querySelector('.writing-card');
const feedback = document.querySelector('#feedback');
const moods = [...document.querySelectorAll('[data-mood]')];
const sound = document.querySelector('#sound');
const soundToggle = document.querySelector('#sound-toggle');
const about = document.querySelector('#about-dialog');
const weatherButtons = [...document.querySelectorAll('[data-weather]')];
const forestTitle = document.querySelector('#forest-title');
const forestDescription = document.querySelector('#forest-description');
const forestTime = document.querySelector('#forest-time');
const writingPrompt = document.querySelector('#writing-prompt');
const leaves = document.querySelector('#released-leaves');
const player = document.querySelector('#practice-player');
const practiceButtons = [...document.querySelectorAll('[data-practice]')];
const durationButtons = [...document.querySelectorAll('[data-duration]')];
const paceButtons = [...document.querySelectorAll('[data-pace]')];
const reflectionButtons = [...document.querySelectorAll('[data-reflection]')];
const reflection = document.querySelector('#rest-reflection');
const startButton = document.querySelector('#session-start');
const nextButton = document.querySelector('#session-next');
const stopButton = document.querySelector('#session-stop');
const sessionNotice = document.querySelector('#session-notice');
const instruction = document.querySelector('#session-instruction');
const orb = document.querySelector('#practice-orb');
const focusButton = document.querySelector('#focus-mode');
const focusDialog = document.querySelector('#focus-dialog');
const guidanceDialog = document.querySelector('#guidance-dialog');
const libraryDialog = document.querySelector('#library-dialog');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const halo = document.querySelector('#breath-halo');
const torso = document.querySelector('#person-torso');
const leftArm = document.querySelector('#person-left-arm');
const rightArm = document.querySelector('#person-right-arm');
const belly = document.querySelector('#person-belly');
const bodyZones = [...document.querySelectorAll('[data-zone]')];
const weatherCopy = {
  dawn: ['MORNING MIST', '서두르지 않아도 괜찮은 아침', '안개가 걷히듯, 마음도 천천히 맑아질 거예요.'],
  rain: ['A RAINY AFTERNOON', '말 대신 비가 내려 주는 오후', '오늘의 무거운 마음은 빗소리에 잠시 맡겨요.'],
  night: ['UNDER THE STARS', '긴 하루를 가만히 덮어 주는 밤', '다 하지 못한 말도, 이 밤은 들어 줄 거예요.'],
};
const prompts = [
  '어떤 말이 마음에 오래 남아 있나요?',
  '오늘 꾹 참았던 말이 있다면요?',
  '아무도 서운해하지 않는다면, 하고 싶은 말은요?',
  '지금 나에게 가장 필요한 건 무엇인가요?',
  '오늘의 나에게 한마디 건넨다면요?',
];
const moodWeather = ['rain', 'rain', 'night', 'dawn', 'dawn'];
let promptIndex = 0;
let leafTimer;
let releasing = false;
let releaseTimer;
let audioContext;
let noiseSource;
let masterVolume;
let audioNodes = [];
let selectedSound = 'wind';
let lastPracticeTrigger;
let motionFrame;

const practices = {
  breathing: {
    title: '심호흡하기', category: '호흡에 기대는 시간', word: '준비', caption: 'BREATHE AT YOUR OWN PACE',
    intro: '4초 들이쉬고, 6초 내쉬어요. 여섯 번의 느린 호흡을 함께해요.',
    ready: '어깨는 편하게, 손은 배 위에 가볍게 두세요.',
    detail: '숨을 참거나 깊게 쉬려고 애쓰지 않아도 괜찮아요.',
    end: '잠시 숨을 골랐어요. 이제 편한 호흡으로 돌아와요.',
  },
  meditation: {
    title: '고요히 머물기', category: '생각을 바라보는 시간', word: '고요', caption: 'NOTHING TO ACHIEVE, JUST BE',
    intro: '지금의 마음을 알아차리고, 호흡에 머문 뒤, 몸과 주변으로 주의를 넓혀요.',
    ready: '눈을 편하게 두고, 몸을 기대어 보세요. 눈을 뜬 채로도 좋아요.',
    detail: '소리 없는 글 안내예요. 안내 문장이 천천히 바뀌어요.',
    end: '주변을 천천히 둘러보세요. 머물러 준 나에게 작은 인사를 건네요.',
    steps: [
      ['알아차리기', '지금 떠오르는 생각과 마음, 몸의 느낌을 가만히 알아차려요.', '바꾸거나 판단하지 않고, 지금 이렇구나 하고 살펴봐요. 눈은 편하게 뜨고 있어도 좋아요.', '알아차림'],
      ['호흡에 머물기', '가장 편하게 느껴지는 곳에서 자연스러운 호흡을 바라봐요.', '호흡은 조절하지 않아요. 생각을 따라갔다면 알아차리고 다시 돌아와요. 호흡 대신 손이 닿는 감각에 머물러도 괜찮아요.', '머물기'],
      ['주의를 넓히기', '몸 전체가 닿아 있는 곳과 주변 소리로 주의를 넓혀요.', '이 공간의 빛과 소리를 느끼며, 다음 일상으로 천천히 돌아갈 준비를 해요.', '넓히기'],
    ],
  },
  grounding: {
    title: '지금 여기 산책', category: '작은 감각을 만나는 시간', word: '여기', caption: 'A LITTLE CLOSER TO THE PRESENT',
    intro: '주변의 감각을 하나씩 찾아봐요. 시간에 쫓기지 않고 내 속도로요.',
    ready: '지금 있는 자리에서 가볍게 둘러보세요. 찾기 어려운 감각은 건너뛰어도 좋아요.',
    detail: '준비가 되면 시작해요. 다음 단계는 직접 넘길 수 있어요.',
    end: '지금 있는 자리에 다시 닿았어요. 기억에 남는 작은 감각 하나를 가져가요.',
    steps: [
      ['눈에 보이는 것 다섯', '주변에서 눈에 들어오는 것 다섯 가지를 천천히 찾아봐요.', '창가의 빛, 책의 모서리, 옷의 색. 이름만 속으로 불러 봐도 좋아요.', '보기'],
      ['닿아 있는 것 넷', '몸에 닿아 있는 감각 네 가지를 살펴봐요.', '발바닥의 바닥, 손끝의 옷감처럼 편하게 느껴지는 곳부터요.', '닿기'],
      ['들리는 소리 셋', '지금 들리는 소리 세 가지에 잠깐 귀 기울여요.', '먼 소리도 가까운 소리도 괜찮아요. 아무 소리가 없으면 고요에 머물러요.', '듣기'],
      ['떠오르는 향 둘', '느껴지는 향 두 가지를 찾아보거나, 좋아하는 향을 떠올려요.', '비 온 뒤의 흙, 따뜻한 차. 떠올리는 것만으로도 좋아요.', '향기'],
      ['남아 있는 맛 하나', '입안에 남은 맛 하나, 또는 좋아하는 맛을 떠올려요.', '아무것도 떠오르지 않으면 지금의 호흡을 한 번 느껴요.', '느끼기'],
    ],
  },
  body: {
    title: '몸에 쉼 건네기', category: '몸의 안부를 묻는 시간', word: '느슨', caption: 'A SOFTER PLACE TO LAND',
    intro: '온종일 함께한 몸을 살펴봐요. 움직이지 않고 느끼기만 해도 좋아요.',
    ready: '몸을 편하게 기대어 보세요. 불편한 부위는 건너뛰고 편한 곳에 머물러요.',
    detail: '정해진 자세나 횟수 없이, 준비될 때 다음으로 넘어가요.',
    end: '몸 전체가 닿아 있는 곳을 느껴 보세요. 오늘도 함께해 준 몸에 고마움을 건네요.',
    steps: [
      ['어깨의 안부', '어깨에 힘이 들어가 있는지 가만히 알아차려요.', '편하다면 어깨를 살짝 내려놓아요. 그대로 있어도 좋아요.', '어깨'],
      ['손의 안부', '손가락과 손바닥에 어떤 감각이 있는지 느껴 봐요.', '쥐고 있는 것이 있다면 편한 곳에 놓고, 손을 가볍게 쉬게 해요.', '손'],
      ['얼굴의 안부', '미간, 눈가, 턱 주변을 천천히 느껴 봐요.', '편하다면 이를 꼭 다물고 있던 힘을 살짝 덜어 봐요.', '얼굴'],
      ['발의 안부', '발과 바닥이 만나는 감각을 알아차려요.', '몸을 받쳐 주는 자리에 무게를 조금 맡겨 봐요.', '발'],
      ['온몸에 인사', '지금 몸 전체의 느낌에 잠시 머물러요.', '가벼워지지 않았어도 괜찮아요. 알아차린 것만으로 마쳐도 좋아요.', '온몸'],
    ],
  },
};
let selectedPractice = 'breathing';
let meditationDuration = 180;
let breathingDuration = 60;
let breathingPace = 'paced';
let sessionState = 'idle';
let elapsedMs = 0;
let startedAt = 0;
let sessionInterval;
let manualStep = 0;

const setText = (selector, text) => {
  const element = document.querySelector(selector);
  if (element.textContent !== text) element.textContent = text;
};
const timedPractice = () => ['breathing', 'meditation'].includes(selectedPractice);
const duration = () => selectedPractice === 'meditation' ? meditationDuration : breathingDuration;
const elapsed = () => elapsedMs + (sessionState === 'running' && timedPractice() ? performance.now() - startedAt : 0);
const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

function clearSessionClock() {
  window.clearInterval(sessionInterval);
  sessionInterval = undefined;
  window.cancelAnimationFrame(motionFrame);
  motionFrame = undefined;
}

// SVG geometry follows the same elapsed clock as the timer; pausing freezes both.
function drawPerson(expansion = 0) {
  const amount = motionPreference.matches ? 0 : expansion;
  const spread = amount * 7;
  halo.setAttribute('rx', String(35 + spread));
  halo.setAttribute('ry', String(49 + amount * 4));
  torso.setAttribute('d', `M148 100Q${132 - spread} 102 ${128 - spread} 121Q${122 - spread} 152 134 199M172 100Q${188 + spread} 102 ${192 + spread} 121Q${198 + spread} 152 186 199`);
  leftArm.setAttribute('d', `M${130 - spread} 115Q${108 - spread} 136 ${111 - spread} 159Q122 ${177 - amount * 3} ${155 - amount * 2} ${171 - amount * 3}`);
  rightArm.setAttribute('d', `M${190 + spread} 115Q${212 + spread} 136 ${209 + spread} 159Q198 ${177 - amount * 3} ${165 + amount * 2} ${177 - amount * 3}`);
  belly.setAttribute('d', `M${146 - amount * 3} 151Q160 ${157 + amount * 4} ${174 + amount * 3} 151`);
}

function drawBreath(ms) {
  const cycle = ms % 10000;
  const progress = cycle < 4000 ? cycle / 4000 : 1 - (cycle - 4000) / 6000;
  drawPerson((1 - Math.cos(Math.PI * progress)) / 2);
}

function animatePerson() {
  if (sessionState !== 'running' || selectedPractice !== 'breathing' || breathingPace !== 'paced' || motionPreference.matches) return;
  drawBreath(elapsed());
  motionFrame = window.requestAnimationFrame(animatePerson);
}
motionPreference.addEventListener('change', () => {
  window.cancelAnimationFrame(motionFrame);
  if (motionPreference.matches) drawPerson();
  else if (sessionState === 'running') animatePerson();
});

function finishSession(completed) {
  clearSessionClock();
  sessionState = 'finished';
  player.dataset.state = sessionState;
  orb.dataset.phase = 'idle';
  drawPerson();
  setText('#phase-time', '');
  bodyZones.forEach(zone => zone.classList.remove('is-active'));
  setText('#orb-word', '쉼');
  setText('#step-label', completed ? '잠시 머물렀어요' : '오늘은 여기까지');
  instruction.textContent = completed ? practices[selectedPractice].end : '언제 멈춰도 괜찮아요. 내게 편한 만큼 쉬었으면 충분해요.';
  setText('#session-detail', '다른 쉼을 골라도, 그대로 일상으로 돌아가도 좋아요.');
  reflection.hidden = false;
  if (completed) {
    document.querySelector('#session-progress').value = 100;
    document.querySelector('#session-track').setAttribute('aria-valuenow', '100');
    setText('#session-time', timedPractice() ? '0:00' : '마침');
  }
  renderControls();
}

function resetReflection() {
  reflection.hidden = true;
  reflectionButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
  setText('#reflection-response', '고르지 않아도 괜찮아요. 느낌이나 활동 내역을 기록하지 않아요.');
}
reflectionButtons.forEach(button => button.addEventListener('click', () => {
  reflectionButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  const responses = {
    lighter: '조금의 편안함이 느껴졌군요. 이대로 일상으로 돌아가도 좋아요.',
    same: '변화가 없어도 실패한 게 아니에요. 쉬는 방법은 그날의 나에 따라 달라질 수 있어요.',
    uncomfortable: '지금은 연습을 멈춰요. 평소 호흡으로 돌아와 눈을 뜨고 주변 사물을 살펴보세요. 불편함이 이어지면 전문가와 상의해요.',
  };
  setText('#reflection-response', responses[button.dataset.reflection]);
  if (button.dataset.reflection === 'uncomfortable') stopSound();
}));

function renderPracticeSettings() {
  const timed = timedPractice();
  const breathing = selectedPractice === 'breathing';
  document.querySelector('#duration-options').hidden = !timed;
  document.querySelector('#pace-options').hidden = !breathing;
  document.querySelector('#external-anchor').hidden = !timed;
  document.querySelector('.motion-settings').hidden = !timed;
  setText('#settings-summary', timed ? `${duration() / 60}분${breathing ? breathingPace === 'paced' ? ' · 4초 / 6초' : ' · 자연 호흡' : ''}` : '내 속도로');
  durationButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.duration) === duration())));
  paceButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pace === breathingPace)));
  if (breathing) {
    setText('#practice-intro', breathingPace === 'natural' ? '그림은 멈춰 있어요. 평소처럼 편안하게 호흡해요.' : `4초 들이쉬고, 6초 내쉬어요. ${duration() / 10}번의 느린 호흡을 안내해요.`);
    setText('#practice-adaptation', '처음엔 1분부터. 숫자가 부담스러우면 자연 호흡을 골라요.');
  } else if (selectedPractice === 'meditation') {
    setText('#practice-adaptation', `${duration() === 180 ? '기본 3분' : duration() === 60 ? '짧게 머무는 1분' : '여유롭게 머무는 5분'} · 알아차리기 → 호흡에 머물기 → 주의 넓히기. 각 단계는 ${duration() / 3}초예요.`);
  } else {
    setText('#practice-adaptation', '정해진 시간 없이, 편한 단계에 오래 머물러도 괜찮아요.');
  }
}

function renderEvidence() {
  const evidence = forestEvidence[selectedPractice];
  setText('#evidence-kind', evidence.kind);
  setText('#evidence-title', evidence.title);
  setText('#evidence-finding', evidence.finding);
  setText('#evidence-application', evidence.application);
  setText('#practice-comfort', evidence.comfort);
  const source = document.querySelector('#evidence-source');
  source.href = evidence.source;
  source.textContent = evidence.sourceLabel;
}

function renderControls() {
  const active = ['running', 'paused'].includes(sessionState);
  player.dataset.state = sessionState;
  startButton.textContent = sessionState === 'running' ? '잠시 멈추기' : sessionState === 'paused' ? '이어서 쉬기' : sessionState === 'finished' ? '한 번 더 쉬기' : timedPractice() ? `나를 위한 ${duration() / 60}분 시작` : '내 속도로 시작';
  nextButton.hidden = !active || timedPractice();
  nextButton.disabled = sessionState === 'paused';
  nextButton.textContent = manualStep === 4 ? '천천히 마무리' : selectedPractice === 'grounding' ? '다음 감각으로' : '다음 부위로';
  stopButton.hidden = !active;
  durationButtons.forEach(button => { button.disabled = active; });
  paceButtons.forEach(button => { button.disabled = active; });
}

function renderSession() {
  const practice = practices[selectedPractice];
  const isTimed = timedPractice();
  const ms = elapsed();
  if (sessionState === 'idle') drawPerson();
  bodyZones.forEach(zone => zone.classList.toggle('is-active', selectedPractice === 'body' && ['running', 'paused'].includes(sessionState) && Number(zone.dataset.zone) === manualStep));
  if (sessionState === 'running' && isTimed && ms >= duration() * 1000) {
    finishSession(true);
    return;
  }
  const progress = isTimed ? Math.min(100, ms / (duration() * 10)) : manualStep * 20;
  document.querySelector('#session-progress').value = progress;
  document.querySelector('#session-track').setAttribute('aria-valuenow', String(Math.floor(progress)));
  document.querySelector('#session-time').setAttribute('aria-label', isTimed ? '남은 시간' : '현재 단계');
  setText('#session-time', isTimed ? formatTime(Math.max(0, Math.ceil(duration() - ms / 1000))) : `${manualStep + 1} / 5`);
  if (sessionState === 'idle') {
    setText('#step-label', '시작하기 전에');
    instruction.textContent = practice.ready;
    setText('#session-detail', practice.detail);
    setText('#orb-word', practice.word);
    orb.dataset.phase = 'idle';
    setText('#phase-time', '');
  } else if (sessionState === 'running' || sessionState === 'paused') {
    if (selectedPractice === 'breathing') {
      if (breathingPace === 'natural') {
        setText('#step-label', '지금의 호흡으로');
        setText('#orb-word', sessionState === 'paused' ? '쉼' : '자연호흡');
        setText('#session-instruction', '숨의 길이를 바꾸지 않고, 지금 있는 그대로 느껴 봐요.');
        setText('#session-detail', '호흡보다 손이나 발이 닿는 감각이 편하다면 그곳에 머물러요.');
        orb.dataset.phase = 'idle';
        drawPerson();
        setText('#phase-time', '');
        renderControls();
        return;
      }
      const inhale = ms % 10000 < 4000;
      setText('#phase-time', sessionState === 'paused' ? '' : `${Math.max(1, Math.ceil(((inhale ? 4000 : 10000) - ms % 10000) / 1000))}초`);
      drawBreath(ms);
      const cycles = duration() / 10;
      setText('#step-label', `${Math.min(cycles, Math.floor(ms / 10000) + 1)} / ${cycles}번째 호흡`);
      const phase = sessionState === 'paused' ? 'paused' : inhale ? 'in' : 'out';
      if (orb.dataset.phase !== phase) orb.dataset.phase = phase;
      setText('#orb-word', sessionState === 'paused' ? '쉼' : inhale ? '들이쉬기' : '내쉬기');
      const message = inhale ? '편안하게 숨을 들이쉬어요.' : '천천히 숨을 내쉬어요.';
      if (instruction.textContent !== message) instruction.textContent = message;
      setText('#session-detail', '배가 부드럽게 움직이는 만큼만. 크게 쉬려고 애쓰지 않아요.');
    } else {
      const stepCount = practice.steps.length;
      const index = isTimed ? Math.min(stepCount - 1, Math.floor(ms / (duration() * 1000 / stepCount))) : manualStep;
      const [label, message, detail, word] = practice.steps[index];
      setText('#step-label', `${index + 1} / ${stepCount} · ${label}`);
      if (instruction.textContent !== message) instruction.textContent = message;
      setText('#session-detail', detail);
      setText('#orb-word', sessionState === 'paused' ? '쉼' : word);
      orb.dataset.phase = sessionState === 'paused' ? 'paused' : 'still';
      drawPerson();
      setText('#phase-time', '');
    }
  }
  renderControls();
}

function selectPractice(kind) {
  if (sessionState !== 'idle' && selectedPractice === kind) return;
  clearSessionClock();
  selectedPractice = kind;
  sessionState = 'idle';
  elapsedMs = 0;
  manualStep = 0;
  player.dataset.kind = kind;
  const practice = practices[kind];
  practiceButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.practice === kind)));
  setText('#practice-title', practice.title);
  setText('#practice-category', practice.category);
  setText('#practice-intro', practice.intro);
  setText('#visual-caption', practice.caption);
  const visualIntros = {
    breathing: '손을 배에 가볍게 얹고, 편하게 앉아요.',
    meditation: '눈은 편하게 두고, 몸을 가만히 기대어요.',
    grounding: '지금 있는 자리에서 주변을 천천히 둘러봐요.',
    body: '그림에서 표시한 곳을 가만히 느껴봐요.',
  };
  setText('#motion-intro', visualIntros[kind]);
  renderPracticeSettings();
  renderEvidence();
  resetReflection();
  sessionNotice.textContent = '';
  renderSession();
}
practiceButtons.forEach(button => button.addEventListener('click', () => {
  selectPractice(button.dataset.practice);
  lastPracticeTrigger = button;
  if (!focusDialog.open) focusDialog.showModal();
  syncModalScroll();
  startButton.focus({ preventScroll: true });
}));
durationButtons.forEach(button => button.addEventListener('click', () => {
  if (['running', 'paused'].includes(sessionState)) return;
  if (selectedPractice === 'meditation') meditationDuration = Number(button.dataset.duration);
  else if (selectedPractice === 'breathing') breathingDuration = Number(button.dataset.duration);
  else return;
  sessionState = 'idle';
  elapsedMs = 0;
  resetReflection();
  renderPracticeSettings();
  renderSession();
}));
paceButtons.forEach(button => button.addEventListener('click', () => {
  if (['running', 'paused'].includes(sessionState) || selectedPractice !== 'breathing') return;
  breathingPace = button.dataset.pace;
  sessionState = 'idle';
  elapsedMs = 0;
  resetReflection();
  renderPracticeSettings();
  renderSession();
}));
document.querySelector('#external-anchor').addEventListener('click', () => {
  selectPractice('grounding');
  sessionNotice.textContent = '호흡 대신 주변의 편안한 사물을 살펴봐요. 준비되면 내 속도로 시작해요.';
  startButton.focus({ preventScroll: true });
});

function pauseSession(notice = '잠시 멈췄어요. 준비되면 이어서 쉬어요.') {
  if (sessionState !== 'running') return;
  elapsedMs = elapsed();
  clearSessionClock();
  if (timedPractice() && elapsedMs >= duration() * 1000) { finishSession(true); return; }
  sessionState = 'paused';
  sessionNotice.textContent = notice;
  renderSession();
}
startButton.addEventListener('click', () => {
  if (sessionState === 'running') { pauseSession(); return; }
  if (sessionState !== 'paused') { elapsedMs = 0; manualStep = 0; }
  sessionState = 'running';
  resetReflection();
  startedAt = performance.now();
  sessionNotice.textContent = '';
  if (timedPractice()) sessionInterval = window.setInterval(renderSession, 200);
  renderSession();
  animatePerson();
});
nextButton.addEventListener('click', () => {
  if (sessionState !== 'running' || timedPractice()) return;
  if (manualStep === 4) { finishSession(true); return; }
  manualStep++;
  renderSession();
});
stopButton.addEventListener('click', () => {
  if (!['running', 'paused'].includes(sessionState)) return;
  elapsedMs = elapsed();
  finishSession(false);
});

function syncModalScroll() {
  document.body.classList.toggle('focused', Boolean(document.querySelector('dialog[open]')));
}
function leaveFocus() {
  if (focusDialog.open) focusDialog.close();
}
focusButton.addEventListener('click', leaveFocus);
focusDialog.addEventListener('close', () => {
  // A queued close event must not interrupt a dialog opened again in the meantime.
  if (focusDialog.open) return;
  pauseSession('잠시 멈췄어요. 다시 열면 이어서 쉴 수 있어요.');
  stopSound();
  syncModalScroll();
  if (lastPracticeTrigger) lastPracticeTrigger.focus({ preventScroll: true });
});
document.querySelector('#practice-help').addEventListener('click', () => {
  pauseSession('안내를 보는 동안 잠시 멈췄어요. 준비되면 이어서 쉬어요.');
  stopSound();
  guidanceDialog.showModal();
  syncModalScroll();
});
document.querySelector('#close-guidance').addEventListener('click', () => guidanceDialog.close());
guidanceDialog.addEventListener('close', syncModalScroll);
document.querySelector('#open-library').addEventListener('click', () => {
  libraryDialog.showModal();
  syncModalScroll();
});
document.querySelector('#close-library').addEventListener('click', () => libraryDialog.close());
libraryDialog.addEventListener('close', syncModalScroll);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  pauseSession('다른 화면을 보는 동안 잠시 멈췄어요. 준비되면 이어서 쉬어요.');
  stopSound();
});

function setWeather(weather) {
  document.body.dataset.weather = weather;
  weatherButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.weather === weather)));
  [forestTime.textContent, forestTitle.textContent, forestDescription.textContent] = weatherCopy[weather];
}
weatherButtons.forEach(button => button.addEventListener('click', () => setWeather(button.dataset.weather)));
document.querySelector('#next-prompt').addEventListener('click', () => {
  promptIndex = (promptIndex + 1) % prompts.length;
  writingPrompt.textContent = prompts[promptIndex];
  thought.placeholder = `${prompts[promptIndex]}\n\n떠오르는 만큼만, 편하게 적어 보세요.`;
  thought.focus({ preventScroll: true });
});

function releaseLeaves() {
  clearTimeout(leafTimer);
  leaves.replaceChildren();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let index = 0; index < 12; index++) {
    const leaf = document.createElement('span');
    leaf.className = `floating-leaf leaf-${index % 6}`;
    leaves.append(leaf);
  }
  leafTimer = window.setTimeout(() => leaves.replaceChildren(), 5500);
}

function updateCount() {
  count.textContent = `${Array.from(thought.value).length.toLocaleString('ko-KR')}자 만큼의 마음`;
  release.disabled = releasing || !thought.value.trim();
}

function clearThought() {
  thought.value = '';
  moods.forEach(button => button.setAttribute('aria-pressed', 'false'));
  updateCount();
}

// Never retain a draft, including when the browser restores a cached page.
clearThought();
thought.addEventListener('input', () => {
  feedback.textContent = '';
  updateCount();
});
moods.forEach((button, index) => button.addEventListener('click', () => {
  const selected = button.getAttribute('aria-pressed') === 'true';
  moods.forEach(item => item.setAttribute('aria-pressed', 'false'));
  button.setAttribute('aria-pressed', String(!selected));
  if (!selected) setWeather(moodWeather[index]);
}));

release.addEventListener('click', () => {
  if (releasing || !thought.value.trim()) return;
  releasing = true;
  thought.readOnly = true;
  clearThought();
  releaseLeaves();
  card.classList.add('releasing');
  releaseTimer = window.setTimeout(() => {
    releasing = false;
    thought.readOnly = false;
    card.classList.remove('releasing');
    feedback.textContent = '숲이 잘 들었어요. 그 마음은 바람에 흘려보냈어요.';
    updateCount();
    thought.focus({ preventScroll: true });
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
});

function stopSound() {
  audioNodes.forEach(node => {
    if (typeof node.stop === 'function') { try { node.stop(); } catch { /* Already stopped. */ } }
    node.disconnect();
  });
  audioNodes = [];
  noiseSource = undefined;
  masterVolume = undefined;
  if (audioContext) { void audioContext.close().catch(() => {}); audioContext = undefined; }
  sound.setAttribute('aria-pressed', 'false');
  sound.querySelector('span').textContent = '숲의 소리 켜기';
  soundToggle.setAttribute('aria-pressed', 'false');
  soundToggle.textContent = '소리 켜기';
  document.querySelector('#sound-state').textContent = '소리는 꺼져 있어요. 조용히 쉬어도 괜찮아요.';
}

const soundNames = { wind: '잎 사이 바람', rain: '잔잔한 빗소리', stream: '작은 시냇물' };
const soundButtons = [...document.querySelectorAll('[data-sound]')];
const volumeSlider = document.querySelector('#volume');

function buildSound(context) {
  const buffer = context.createBuffer(1, context.sampleRate * 8, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let previous = 0;
  for (let index = 0; index < samples.length; index++) {
    const white = Math.random() * 2 - 1;
    previous = (previous + white * 0.02) / 1.02;
    samples[index] = selectedSound === 'rain' ? white * 0.22 : previous * 3.5;
  }
  noiseSource = context.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;
  const filter = context.createBiquadFilter();
  filter.type = selectedSound === 'stream' ? 'bandpass' : 'lowpass';
  filter.frequency.value = selectedSound === 'rain' ? 2400 : selectedSound === 'stream' ? 950 : 650;
  filter.Q.value = selectedSound === 'stream' ? 0.7 : 0.3;
  masterVolume = context.createGain();
  masterVolume.gain.setValueAtTime(0, context.currentTime);
  masterVolume.gain.linearRampToValueAtTime(Number(volumeSlider.value) / 100 * 0.7, context.currentTime + 1.5);
  const movement = context.createOscillator();
  const depth = context.createGain();
  movement.frequency.value = selectedSound === 'stream' ? 0.6 : 0.12;
  depth.gain.value = selectedSound === 'stream' ? 400 : 100;
  movement.connect(depth).connect(filter.frequency);
  noiseSource.connect(filter).connect(masterVolume).connect(context.destination);
  audioNodes = [noiseSource, filter, masterVolume, movement, depth];
  movement.start();
  noiseSource.start();
}

async function startSound() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) { document.querySelector('#sound-state').textContent = '이 브라우저에서는 소리를 재생할 수 없어요. 조용히 쉬어 가도 좋아요.'; return; }
  let context;
  try {
    context = new Audio();
    audioContext = context;
    await context.resume();
    if (audioContext !== context) return;
    buildSound(context);
    sound.setAttribute('aria-pressed', 'true');
    sound.querySelector('span').textContent = '숲의 소리 끄기';
    soundToggle.setAttribute('aria-pressed', 'true');
    soundToggle.textContent = '소리 끄기';
    document.querySelector('#sound-state').textContent = `${soundNames[selectedSound]} 소리와 함께 쉬고 있어요.`;
  } catch {
    if (audioContext !== context) return;
    stopSound();
    document.querySelector('#sound-state').textContent = '소리를 켜지 못했어요. 잠시 후 다시 눌러 주세요.';
  }
}
function toggleSound() {
  if (audioContext) stopSound();
  else void startSound();
}
sound.addEventListener('click', toggleSound);
soundToggle.addEventListener('click', toggleSound);
soundButtons.forEach(button => button.addEventListener('click', () => {
  const nextSound = button.dataset.sound;
  if (selectedSound === nextSound) return;
  const playing = Boolean(audioContext);
  stopSound();
  selectedSound = nextSound;
  soundButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  if (playing) void startSound();
}));
volumeSlider.addEventListener('input', () => {
  if (masterVolume && audioContext) {
    masterVolume.gain.cancelScheduledValues(audioContext.currentTime);
    masterVolume.gain.setTargetAtTime(Number(volumeSlider.value) / 100 * 0.7, audioContext.currentTime, 0.1);
  }
});

document.querySelector('#about').addEventListener('click', () => about.showModal());
document.querySelector('#close-dialog').addEventListener('click', () => about.close());
document.querySelector('#back-to-forest').addEventListener('click', () => about.close());
about.addEventListener('click', event => { if (event.target === about) {
  const bounds = about.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) about.close();
} });

function resetPage() {
  clearTimeout(releaseTimer);
  clearTimeout(leafTimer);
  leaves.replaceChildren();
  leaveFocus();
  if (guidanceDialog.open) guidanceDialog.close();
  if (libraryDialog.open) libraryDialog.close();
  document.querySelector('.motion-settings').open = false;
  clearSessionClock();
  sessionState = 'idle';
  meditationDuration = 180;
  breathingDuration = 60;
  breathingPace = 'paced';
  durationButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.duration === '60')));
  selectPractice('breathing');
  selectedSound = 'wind';
  soundButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.sound === 'wind')));
  volumeSlider.value = '35';
  setWeather('dawn');
  releasing = false;
  thought.readOnly = false;
  clearThought();
  card.classList.remove('releasing');
  feedback.textContent = '';
  if (about.open) about.close();
  stopSound();
}
window.addEventListener('pagehide', resetPage);
window.addEventListener('pageshow', resetPage);
