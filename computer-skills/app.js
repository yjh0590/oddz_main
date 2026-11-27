const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---------- 상태 ----------
let mode = 'excel', steps = [], cur = 0, timer = null;
let grid = {}, sel = 'A1';
let problem = null; // 지금 푸는 문제 (data.js instantiate 결과: 숫자가 정해진 문제)
let viz = null; // Excel 시각화 중: { target, formula, rows?: [[셀…], …], kind?: 'cf' | 'filter' }

const button = (text, onclick) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = text;
  b.onclick = onclick;
  return b;
};
function setError(msg) {
  $('#error').textContent = msg || '';
  $('#error').hidden = !msg;
}

// ---------- 시트 ----------
function buildGrid() {
  let cols = 10, rows = 12;
  for (const ref of Object.keys(grid)) {
    const [, c, r] = /^([A-Z]+)(\d+)$/.exec(ref) || [];
    if (!c) continue;
    cols = Math.max(cols, Engine.cellsOf(`A1:${c}1`)[0].length);
    rows = Math.max(rows, +r);
  }
  const t = $('#grid');
  t.replaceChildren();
  const head = t.insertRow();
  head.append(document.createElement('th'));
  for (let c = 0; c < cols; c++) head.append(Object.assign(document.createElement('th'), { textContent: Engine.colName(c) }));
  for (let r = 1; r <= rows; r++) {
    const tr = t.insertRow();
    tr.append(Object.assign(document.createElement('th'), { textContent: r }));
    for (let c = 0; c < cols; c++) {
      const ref = Engine.colName(c) + r;
      const input = Object.assign(document.createElement('input'), { className: 'mono', spellcheck: false });
      input.dataset.ref = ref;
      input.setAttribute('aria-label', ref);
      input.onfocus = () => select(ref);
      input.oninput = () => { grid[ref] = input.value; $('#fx').value = input.value; };
      input.onblur = paintGrid;
      input.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); runExcel(); } };
      tr.insertCell().append(input);
    }
  }
  paintGrid();
}

function select(ref) {
  sel = ref;
  $('#cellName').textContent = ref;
  $('#fx').value = grid[ref] ?? '';
  const input = $(`#grid input[data-ref="${ref}"]`);
  if (input && document.activeElement === input) input.value = grid[ref] ?? '';
}

// 값 표시 + 시각화 색칠
function paintGrid() {
  const cell = Engine.makeSheet(grid);
  const step = viz && steps[cur];
  // 지금까지 진행한 단계에서 읽은 칸: 처음 읽은 단계 색으로 옅게, 현재 단계 칸은 진하게
  const color = {}, active = new Set(), cf = new Set();
  if (viz) {
    steps.slice(0, cur + 1).forEach((st, j) =>
      st.active.forEach((range) => Engine.cellsOf(range).flat().forEach((r) => {
        color[r] = color[r] || st.color;
        if (j === cur && !st.focus) active.add(r);
      })));
    (step.focus || []).forEach((r) => active.add(r));
    if (step.final && viz.rows) viz.rows.flat().forEach((r) => cf.add(r));
  }
  document.querySelectorAll('#grid input').forEach((input) => {
    const ref = input.dataset.ref, raw = grid[ref] ?? '', td = input.parentElement;
    const isTarget = viz && ref === viz.target;
    if (document.activeElement !== input) {
      input.value = isTarget && !step.final ? '?' : raw.startsWith('=') ? Engine.fmt(cell(ref)) : raw;
    }
    td.className = [raw.startsWith('=') && 'formula', color[ref] && 'ref', active.has(ref) && 'active',
      isTarget && 'target', isTarget && step.final && 'filled', cf.has(ref) && viz.kind].filter(Boolean).join(' ');
    td.style.setProperty('--c', isTarget || active.has(ref) ? step.color : color[ref] || '');
    if (isTarget) scrollGridTo(td);
  });
}

// 결과 셀이 보이도록 시트 영역만 가로로 스크롤 (페이지는 움직이지 않음)
function scrollGridTo(td) {
  const wrap = $('.gridWrap');
  const left = td.offsetLeft, right = left + td.offsetWidth;
  if (left < wrap.scrollLeft) wrap.scrollLeft = left - 40;
  else if (right > wrap.scrollLeft + wrap.clientWidth) wrap.scrollLeft = right - wrap.clientWidth + 40;
}

function runExcel() {
  practice = null;
  stop();
  const raw = (grid[sel] ?? '').trim();
  if (!raw.startsWith('=')) {
    viz = null;
    steps = [];
    $('#viz').hidden = true;
    paintGrid();
    return setError(`${sel} 셀에 = 로 시작하는 수식을 입력하세요`);
  }
  try {
    steps = Engine.excel(raw, grid).steps;
    viz = { target: sel, formula: raw };
    // 조건부 서식·고급 필터 문제: 범위의 각 행에 수식을 옮겨 계산해 TRUE인 행을 모음
    if (problem && problem.apply && sel === problem.target) {
      viz.kind = problem.apply.kind;
      viz.rows = Engine.cellsOf(problem.apply.range).filter((_, dr) => Engine.excel(Engine.shift(raw, dr), grid).result === 'TRUE');
    }
    setError();
  } catch (e) {
    steps = [];
    viz = null;
    setError(`${sel}: ${e.message}`);
  }
  startViz();
}

// ---------- 함수·개념 설명 ----------
function renderConcepts(s) {
  const keys = [...new Set(steps.map((x) => x.op).filter(Boolean))];
  if (/\$/.test(viz.formula)) keys.push('$');
  if (steps.some((x) => /^\{/.test(x.result))) keys.push('ARRAY');
  if (viz.kind) keys.push(viz.kind);
  $('#concepts').innerHTML = `<h3>이 수식에 쓰인 함수·개념</h3>` + keys.map((k) => {
    const [syntax, desc, ex] = CONCEPTS[k] || [k, '', ''];
    const now = k === s.op || (s.final && k === viz.kind) || (k === 'ARRAY' && /^\{/.test(s.result || ''));
    return `<div class="concept${now ? ' now' : ''}"${now ? ` style="--c:${s.color}"` : ''}><code>${esc(syntax)}</code><span>${esc(desc)}${ex ? ` <em>예: ${esc(ex)}</em>` : ''}</span></div>`;
  }).join('');
}

// ---------- 연습 문제 ----------
function fillDown(target, formula, n) {
  for (let dr = 0; dr < n; dr++) grid[Engine.shift(target, dr)] = Engine.shift(formula, dr);
}

// p: data.js의 문제 틀(템플릿) 또는 이미 숫자가 정해진 문제(grid 있음). seed 0 = 원래 숫자.
function loadProblem(p, { solve = false, seed = 0 } = {}) {
  setExcelView('formula');
  practice = null;
  problem = p.grid ? p : instantiate(p, seed);
  p = problem;
  grid = { ...p.grid };
  buildGrid();
  showType(p.type);
  $('#pq').textContent = p.q;
  $('#shuffle').hidden = !p.template;
  $('#pcard').hidden = false;
  $('#feedback').textContent = '';
  $('#feedback').className = '';
  select(p.target);
  if (solve) return solution();
  viz = null;
  steps = [];
  stop();
  $('#viz').hidden = true;
  setError();
  paintGrid();
  $('#feedback').textContent = `${p.target} 셀에 수식을 입력하고 [정답 확인]을 누르세요. 모르면 [풀이 보기]로 계산 순서를 볼 수 있습니다.`;
}

function solution() {
  $('#feedback').textContent = '';
  fillDown(problem.target, problem.answer, problem.fill || 1);
  buildGrid();
  select(problem.target);
  runExcel();
}

function check() {
  const p = problem;
  const mine = (grid[p.target] ?? '').trim();
  const fb = (text, ok) => { $('#feedback').textContent = text; $('#feedback').className = ok ? 'ok' : 'no'; };
  if (!mine.startsWith('=')) return fb(`${p.target} 셀에 = 로 시작하는 수식을 입력하세요.`, false);
  const base = p.grid;
  for (let dr = 0; dr < (p.fill || 1); dr++) {
    const want = Engine.excel(Engine.shift(p.answer, dr), base).result;
    let got;
    try { got = Engine.excel(Engine.shift(mine, dr), base).result; } catch (e) { return fb(`수식 오류: ${e.message}`, false); }
    if (got !== want) return fb(`틀렸습니다. ${Engine.shift(p.target, dr)}: 내 결과 ${got || '(빈 값)'} / 정답 ${want || '(빈 값)'}`, false);
  }
  fillDown(p.target, mine, p.fill || 1);
  buildGrid();
  select(p.target);
  runExcel();
  fb(`정답입니다! ${p.fill > 1 ? `${p.fill}개 행 모두 맞았습니다. ` : ''}모범 답안: ${p.answer}`, true);
}

function showType(type) {
  document.querySelectorAll('#types button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.type === type));
  const info = TYPES.find((t) => t.name === type);
  $('#typeInfo').textContent = info ? `${info.level} · ${info.desc}` : '';
  const list = PROBLEMS.filter((p) => p.type === type);
  $('#plist').replaceChildren(...list.map((p, i) => {
    const b = button('', () => loadProblem(p));
    b.innerHTML = `<span class="num">${i + 1}</span><span>${esc(p.title)}</span>`;
    b.title = p.title;
    b.setAttribute('aria-pressed', p === problem.template);
    return b;
  }));
}
const randomSeed = () => 1 + Math.floor(Math.random() * 1e9);

// ---------- 연습 공통 (Access 전체 · Excel 서식·분석·기타작업) ----------
const PLACEHOLDER = { query: 'SELECT … FROM … WHERE …', expr: '=식  (예: IIf([점수]>=60,"이수","재수강"))', filter: '"필드=\'" & 컨트롤 & "\'"', rule: '>=0 And <=100', mask: '000-0000-0000;0;_', format: '#,##0;[빨강](#,##0);"-"' };

// 유효성 검사 규칙: 입력값마다 규칙을 계산해 통과/거부
function ruleRun(rule, tests) {
  const res = Engine.checkRule(rule, tests);
  return {
    result: res.map((r) => r.ok),
    steps: [{ label: '규칙 해석', note: esc('필드 이름이 빠진 자리를 [값]으로 채워 읽습니다. 입력값마다 이 식을 계산합니다.'), html: `<div class="expr">${esc(rule)} → ${esc(Engine.ruleExpr(rule))}</div>` },
      ...res.map((r) => ({ label: `입력 ${r.input === '' ? '(빈 값)' : r.input}`,
        note: esc(`"${r.input}" 입력 → ${r.ok ? '규칙에 맞아 저장됩니다' : '규칙에 어긋나 입력이 거부됩니다'}`),
        html: `<div class="expr">${r.shown}<span class="verdict ${r.ok ? 'ok' : 'no'}">${r.ok ? '✓ 통과' : '✗ 거부'}</span></div>` }))],
  };
}
// 입력 마스크: 마스크 글자와 입력 글자를 한 칸씩 맞춰 봄
const MASK_DESC = { 0: '숫자 필수', 9: '숫자 선택', '#': '숫자·공백·+- 선택', L: '글자 필수', '?': '글자 선택', A: '글자·숫자 필수', a: '글자·숫자 선택', '&': '아무 문자 필수', C: '아무 문자 선택', '>': '이후 대문자', '<': '이후 소문자' };
function maskRun(mask, tests) {
  const res = tests.map((t) => Engine.applyMask(mask, t));
  const pat = mask.split(';')[0];
  const legend = [...new Set(pat.replace(/"[^"]*"|\\./g, ''))].filter((c) => MASK_DESC[c]).map((c) => `<b>${esc(c)}</b> ${MASK_DESC[c]}`).join(' · ');
  return {
    result: res.map((m) => [m.ok, m.out]),
    steps: [{ label: '마스크 읽기', note: esc(`마스크 "${mask}"의 각 글자는 한 자리의 규칙입니다. 입력은 왼쪽부터 차례로 채워집니다.`), html: `<div class="expr">${esc(mask)}</div><p class="hint">${legend}</p>` },
      ...res.map((m, i) => ({ label: `입력 ${tests[i] || '(빈 값)'}`,
        note: esc(`"${tests[i]}" → ${m.ok ? `"${m.out}"로 저장됩니다` : `입력 거부: ${(m.trace.find((x) => !x.ok) || {}).why}`}`),
        html: `<table class="mask"><tr><th>마스크</th>${m.trace.map((x) => `<td class="lit">${esc(x.m)}</td>`).join('')}</tr><tr><th>입력</th>${m.trace.map((x) =>
          `<td class="${!x.ok ? 'no' : MASK_DESC[x.m] ? 'ok' : 'lit'}" title="${esc(x.why)}">${esc(x.ch) || '·'}</td>`).join('')}</tr></table>
          <p class="hint">결과: <b>${esc(m.out)}</b><span class="verdict ${m.ok ? 'ok' : 'no'}">${m.ok ? '✓ 저장' : '✗ 거부'}</span></p>` }))],
  };
}
// 셀 서식: 값마다 어느 구역(양수;음수;0;텍스트)이 쓰이는지
const SECTION_NAME = ['양수(또는 조건 1)', '음수(또는 조건 2)', '0', '텍스트'];
function formatRun(code, tests) {
  const secs = code.split(';');
  const res = tests.map((v) => Engine.numFormatEx(v, code));
  const shownVal = (v) => (typeof v === 'number' && v > 30000 && v < 60000 ? `${v} (날짜 ${Engine.numFormat(v, "yyyy-mm-dd")})` : String(v));
  return {
    result: res.map((r) => [r.text, r.color || '']),
    steps: [{ label: '형식 읽기', note: esc(`구역 ${secs.length}개: ${secs.map((s, i) => `${SECTION_NAME[i]} → ${s}`).join(' / ')}`),
      html: `<div class="expr">${secs.map((s, i) => `<span class="sec">${esc(s)}</span>${i < secs.length - 1 ? '<b>;</b>' : ''}`).join('')}</div>` },
      ...res.map((r, i) => ({ label: `값 ${tests[i]}`,
        note: esc(`값 ${shownVal(tests[i])} → ${r.section >= 0 ? `${r.section + 1}번째 구역 "${secs[r.section] ?? secs[0]}"` : '텍스트 그대로'} → "${r.text}"${r.color ? ' (색 적용)' : ''}`),
        html: `<div class="expr">${secs.map((s, j) => `<span class="sec${j === r.section ? ' on' : ''}">${esc(s)}</span>${j < secs.length - 1 ? '<b>;</b>' : ''}`).join('')}</div>
          <p class="fmt-out">${esc(String(tests[i]))} → <b style="${r.color ? `color:${r.color}` : ''}">${esc(r.text)}</b></p>` }))],
  };
}
// 설정 문제: 작업 순서 → (계산 결과) → 설정 값
function quizRun(p, picks) {
  const steps = p.steps.map((t, i) => ({ label: t, note: esc(t),
    html: `<ol class="proc">${p.steps.map((x, j) => `<li class="${j < i ? 'done' : j === i ? 'now' : ''}">${esc(x)}</li>`).join('')}</ol>` }));
  if (p.compute && picks.every(Boolean)) steps.push(...p.compute(p, picks).map((s) => ({ ...s, label: `결과: ${s.label}` })));
  steps.push({ label: '설정 값', note: esc('고른 설정 값'),
    html: `<table class="dbt"><tr><th>항목</th><th>값</th></tr>${p.fields.map((f, i) => `<tr class="${picks[i] === f.answer ? 'ok' : 'no'}"><td>${esc(f.label)}</td><td>${esc(picks[i] || '(선택 안 함)')}</td></tr>`).join('')}</table>` });
  return { steps, result: picks };
}
// 문제 종류별 실행 → { steps, result }
function practiceRun(p, src) {
  if (p.kind === 'query') {
    const r = Engine.accessQuery(src, freshDB(), p.params);
    return { steps: r.steps, result: { kind: r.kind, cols: r.cols.length, rows: r.rows } };
  }
  if (p.kind === 'expr') {
    const r = Engine.accessExpr(src, freshDB(), p.table);
    return { steps: r.steps.map((s) => ({ ...s, isExpr: true })), result: r.result };
  }
  if (p.kind === 'filter') {
    const r = Engine.accessFilter(src, p.controls, freshDB(), p.table);
    return { steps: r.steps.map((s) => ({ ...s, isExpr: true })), result: r.result };
  }
  if (p.kind === 'rule') return ruleRun(src, p.tests);
  if (p.kind === 'mask') return maskRun(src, p.tests);
  if (p.kind === 'format') return formatRun(src, p.tests);
  return quizRun(p, src);
}
const sameResult = (p, a, b) => {
  if (p.kind !== 'query') return JSON.stringify(a) === JSON.stringify(b);
  const ordered = a.kind !== 'select' || /ORDER\s+BY/i.test(p.answer);
  const norm = (r) => (ordered ? r.rows : [...r.rows].sort()).map((x) => JSON.stringify(x)).join('\n');
  return a.kind === b.kind && a.cols === b.cols && norm(a) === norm(b);
};

let practice = null; // 지금 단계 재생 중인 연습 (null = Excel 수식 문제)

// id 접두어로 화면 요소를 찾는 연습 묶음 하나 (a = Access, t = Excel 작업 유형)
function makePractice({ id, typesBox, types, problems }) {
  const P = { id, prob: null, srcShown: '', last: null };
  const el = (name) => document.getElementById(id + name);
  const picks = () => [...el('Quiz').querySelectorAll('select')].map((s) => s.value);
  const feedback = (text, cls = '') => { el('Feedback').textContent = text; el('Feedback').className = `feedback ${cls}`; };
  const showRun = (run, src) => {
    stop();
    viz = null;
    practice = P;
    P.srcShown = src;
    P.last = run.steps;
    steps = run.steps;
    setError();
    startViz();
  };
  const exec = (src, label) => {
    try {
      showRun(practiceRun(P.prob, src), typeof src === 'string' ? src : '');
      if (label) feedback(label);
    } catch (e) {
      feedback(`실행 오류: ${e.message}`, 'no');
    }
  };
  P.load = (p, { solve = false } = {}) => {
    P.prob = p;
    if (P.onLoad) P.onLoad(p);
    $(typesBox).querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.type === p.type));
    const info = types.find((t) => t.name === p.type);
    el('TypeInfo').textContent = `${info.area} · ${info.desc}`;
    const list = problems.filter((x) => x.type === p.type);
    el('Plist').replaceChildren(...list.map((x, i) => {
      const b = button('', () => P.load(x));
      b.innerHTML = `<span class="num">${i + 1}</span><span>${esc(x.title)}</span>`;
      b.title = x.title;
      b.setAttribute('aria-pressed', x === p);
      return b;
    }));
    el('Q').textContent = p.q;
    el('Params').textContent = p.params ? `실행할 때 매개변수 입력 창에 넣을 값: ${p.params.join(', ')}`
      : p.controls ? `폼 컨트롤 값: ${Object.entries(p.controls).map(([k, v]) => `${k} = ${v}`).join(', ')}  (식 결과가 조건 문자열이 됩니다)`
      : p.tests ? `시험 입력값: ${p.tests.map((t) => (t === '' ? '(빈 값)' : t)).join(' / ')}`
      : p.kind === 'expr' ? `대상: [${p.table}] 테이블` : '';
    const quiz = p.kind === 'quiz';
    el('Src').hidden = quiz;
    el('Quiz').hidden = !quiz;
    el('Run').hidden = quiz;
    el('Src').value = '';
    el('Src').placeholder = PLACEHOLDER[p.kind] || '';
    el('Src').rows = p.kind === 'query' ? 3 : 2;
    if (quiz) {
      el('Quiz').replaceChildren(...p.fields.map((f) => {
        const l = document.createElement('label');
        l.textContent = f.label;
        const s = document.createElement('select');
        s.append(new Option('선택하세요', ''), ...f.options.map((o) => new Option(o, o)));
        l.append(s);
        return l;
      }));
    }
    feedback('');
    if (solve) return P.solve();
    stop();
    steps = [];
    P.last = null;
    practice = P;
    $('#viz').hidden = true;
    feedback(quiz ? '설정을 고른 뒤 [정답 확인]을 누르세요. 모르면 [풀이 보기]로 작업 순서와 결과를 볼 수 있습니다.'
      : '답을 입력하고 [정답 확인]을 누르세요. [내 답 실행]으로 실행 순서를 먼저 볼 수도 있습니다.');
  };
  P.solve = () => {
    const p = P.prob;
    if (p.kind === 'quiz') {
      el('Quiz').querySelectorAll('select').forEach((s, i) => (s.value = p.fields[i].answer));
      exec(picks(), '정답 설정과 작업 순서입니다.');
    } else {
      el('Src').value = p.answer;
      exec(p.answer, `모범 답안: ${p.answer}`);
    }
  };
  P.check = () => {
    const p = P.prob;
    const mine = p.kind === 'quiz' ? picks() : el('Src').value.trim();
    if (p.kind !== 'quiz' && !mine) return feedback('답을 먼저 입력하세요.', 'no');
    let got;
    try { got = practiceRun(p, mine); } catch (e) { return feedback(`실행 오류: ${e.message}`, 'no'); }
    const want = practiceRun(p, p.kind === 'quiz' ? p.fields.map((f) => f.answer) : p.answer);
    showRun(got, typeof mine === 'string' ? mine : '');
    if (sameResult(p, got.result, want.result)) return feedback(`정답입니다! ${p.kind === 'quiz' ? '' : `모범 답안: ${p.answer}`}`, 'ok');
    if (p.kind === 'quiz') {
      const wrong = p.fields.filter((f, i) => mine[i] !== f.answer).map((f) => f.label);
      return feedback(`틀렸습니다. 다시 볼 항목: ${wrong.join(', ')}. 단계를 넘기면 고른 설정대로 계산된 결과가 보입니다.`, 'no');
    }
    if (p.kind === 'query') {
      const g = got.result, w = want.result;
      return feedback(`결과가 다릅니다. 정답은 ${w.rows.length}행 ${w.cols}열, 내 답은 ${g.rows.length}행 ${g.cols}열${g.rows.length === w.rows.length && g.cols === w.cols ? ' (값이나 순서가 다름)' : ''}. 단계를 넘기며 어디서 달라지는지 확인하세요.`, 'no');
    }
    const diff = want.result.findIndex((v, i) => JSON.stringify(v) !== JSON.stringify(got.result[i]));
    const show = (v) => (Array.isArray(v) ? (typeof v[0] === 'boolean' ? `${v[0] ? '저장' : '거부'} ${v[1] ?? ''}` : `"${v[0]}"${v[1] ? ' (색)' : ''}`) : String(v));
    const which = p.tests ? `입력 "${p.tests[diff]}"` : `${diff + 1}번째 레코드`;
    feedback(`틀렸습니다. ${which}: 내 결과 ${show(got.result[diff])} / 정답 ${show(want.result[diff])}`, 'no');
  };
  P.restore = () => {
    if (P.last) { practice = P; steps = P.last; viz = null; startViz(); } else $('#viz').hidden = true;
  };
  el('Check').onclick = P.check;
  el('Solve').onclick = P.solve;
  el('Run').onclick = () => { const src = el('Src').value.trim(); if (src) exec(src, '내 답의 실행 순서입니다. 채점은 [정답 확인]으로 합니다.'); };
  el('Similar').onclick = () => {
    const same = problems.filter((p) => p.type === P.prob.type);
    P.load(same[(same.indexOf(P.prob) + 1) % same.length]);
  };
  el('Src').onkeydown = (e) => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); P.check(); } };
  return P;
}

// 영역별 유형 버튼: items = [{ name, area, go }]
function renderAreas(box, areas, items) {
  $(box).replaceChildren(...areas.map((area) => {
    const wrap = document.createElement('div');
    wrap.className = 'area';
    const h = document.createElement('h3');
    h.textContent = area;
    const g = document.createElement('div');
    g.className = 'grid seg';
    g.append(...items.filter((t) => t.area === area).map((t) => {
      const b = button(t.name, t.go);
      b.dataset.type = t.name;
      return b;
    }));
    wrap.append(h, g);
    return wrap;
  }));
}

// 개념 설명: Access는 답에 쓰인 절·함수, Excel 작업 유형은 유형 설명과 형식 기호
function renderPracticeConcepts(P, s) {
  const items = [];
  if (P.id === 't') {
    const t = EXCEL_TASK_TYPES.find((x) => x.name === P.prob.type);
    items.push([t.name, t.desc, '', true]);
    if (P.prob.kind === 'format') {
      items.push([...EXCEL_TASK_CONCEPTS.FORMAT, false]);
      if (/y|d|aaa|mmmm/i.test(P.srcShown.replace(/"[^"]*"/g, ''))) items.push([...EXCEL_TASK_CONCEPTS.DATEFMT, false]);
    }
  } else {
    const src = P.srcShown || '';
    const keys = [];
    const add = (k) => !keys.includes(k) && ACCESS_CONCEPTS[k] && keys.push(k);
    ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'TRANSFORM', 'UPDATE', 'DELETE', 'INSERT', 'INTO']
      .forEach((k) => new RegExp(`\\b${k.replace(' ', '\\s+')}\\b`, 'i').test(src) && add(k));
    if (/\bLIKE\b/i.test(src)) add('LIKE');
    if (/\bBETWEEN\b/i.test(src)) add('BETWEEN');
    if (/\bIN\s*\(/i.test(src)) add('IN');
    if (/\bIS\s+(NOT\s+)?NULL\b/i.test(src)) add('ISNULL');
    for (const k of Object.keys(ACCESS_CONCEPTS)) if (/^[A-Z]+$/.test(k) && k !== 'ISNULL' && new RegExp(`\\b${k}\\s*\\(`, 'i').test(src)) add(k);
    if (/\bISNULL\s*\(/i.test(src)) add('ISNULLF');
    if (src.includes('&')) add('&');
    if (src.includes('\\')) add('\\');
    if (/\bMOD\b/i.test(src)) add('MOD');
    if (P.prob.params) add('PARAM');
    if (P.prob.kind === 'filter' || P.prob.type === '도메인 함수') add('QUOTE');
    if (P.prob.kind === 'rule') add('RULE');
    if (P.prob.kind === 'mask') add('MASK');
    const label = String(s.label || '').toUpperCase();
    const nowKey = { SET: 'UPDATE', 'DELETE FROM': 'DELETE', 삭제: 'DELETE', 'INSERT INTO': 'INSERT', '매개변수': 'PARAM', 'GROUP BY + PIVOT': 'TRANSFORM' }[label] || label;
    keys.forEach((k) => items.push([...ACCESS_CONCEPTS[k], k === nowKey || k === String(s.op || '').toUpperCase()]));
  }
  $('#concepts').hidden = !items.length;
  $('#concepts').innerHTML = `<h3>${P.id === 't' ? '이 유형의 핵심' : '이 답에 쓰인 문법·함수'}</h3>` + items.map(([syntax, desc, ex, now]) =>
    `<div class="concept${now ? ' now' : ''}" style="--c:var(--accent)"><code>${esc(syntax)}</code><span>${esc(desc)}${ex ? ` <em>예: ${esc(ex)}</em>` : ''}</span></div>`).join('');
}

// ---------- 재생 공통 ----------
function startViz() {
  $('#viz').hidden = !steps.length;
  $('#blocks').replaceChildren(
    ...steps.map((s, i) => {
      const li = document.createElement('li');
      const b = button(s.label, () => { stop(); show(i); });
      b.title = s.label;
      if (s.color) b.style.setProperty('--c', s.color);
      li.append(b);
      return li;
    }),
  );
  if (steps.length) show(0);
  else if (!practice) paintGrid();
}

function show(i) {
  cur = Math.max(0, Math.min(i, steps.length - 1));
  const s = steps[cur];
  document.querySelectorAll('#blocks button').forEach((b, j) => (b.className = j < cur ? 'done' : j === cur ? 'now' : ''));
  const rowList = viz && viz.rows ? `${viz.rows.length}개 행(${viz.rows.map((r) => r[0].replace(/\D/g, '')).join(', ') || '없음'}행)` : '';
  const cfNote = s.final && viz && viz.rows
    ? viz.kind === 'filter'
      ? ` · 고급 필터: 행마다 조건식을 옮겨 계산해 TRUE인 ${rowList}만 추출`
      : ` · 조건부 서식: 행마다 수식을 옮겨 계산해 TRUE인 ${rowList}에 서식 적용`
    : '';
  $('#note').innerHTML = s.note + esc(cfNote); // s.note는 engine이 escape한 HTML
  $('#view').innerHTML = !practice || s.isExpr ? `<div class="expr">${s.html}</div>${s.table || ''}` : s.html;
  $('#view').style.setProperty('--c', s.color || '');
  $('#pos').textContent = `${cur + 1} / ${steps.length}단계`;
  $('#first').disabled = $('#prev').disabled = cur === 0;
  $('#next').disabled = cur === steps.length - 1;
  $('#concepts').hidden = false;
  if (!practice) { paintGrid(); renderConcepts(s); }
  else renderPracticeConcepts(practice, s);
}

// Excel 화면: 수식 문제(시트) / 작업 문제(설정 카드)
let excelView = 'formula';
function setExcelView(v) {
  excelView = v;
  $('#excelPane').dataset.view = v;
}

function stop() {
  clearInterval(timer);
  timer = null;
  $('#play').textContent = '▶ 재생';
}

function setMode(m) {
  mode = m;
  document.body.dataset.mode = m; // 엑셀=초록, 액세스=자주 테마
  stop();
  document.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mode === m));
  $('#excelPane').hidden = m !== 'excel';
  $('#accessPane').hidden = m !== 'access';
  setError();
  if (m === 'excel') {
    if (excelView === 'task') TP.restore();
    else if (String(grid[sel] ?? '').startsWith('=')) runExcel();
    else { practice = null; $('#viz').hidden = true; }
  } else if (!AP.prob) AP.load(ACCESS_PROBLEMS[0], { solve: true });
  else AP.restore();
}

// ---------- 연결 ----------
$('#notFormula').textContent = '셀 서식·페이지 레이아웃·분석작업(부분합, 피벗, 목표값 찾기 등)·차트·매크로·VBA는 위 유형 목록의 기본·분석·기타작업에 있습니다.';
$('#check').onclick = check;
$('#solve').onclick = solution;
$('#shuffle').onclick = () => loadProblem(problem.template, { seed: randomSeed() });
// 유사문제: 같은 유형의 다음 문제를 새 숫자로
$('#similar').onclick = () => {
  const same = PROBLEMS.filter((p) => p.type === problem.type);
  const next = same[(same.indexOf(problem.template) + 1) % same.length] || PROBLEMS[0];
  loadProblem(next, { seed: randomSeed() });
};
// 연습 묶음: Access 전체, Excel 서식·분석·기타작업
const AP = makePractice({ id: 'a', typesBox: '#aTypes', types: ACCESS_TYPES, problems: ACCESS_PROBLEMS });
const TP = makePractice({ id: 't', typesBox: '#types', types: EXCEL_TASK_TYPES, problems: EXCEL_TASK_PROBLEMS });
TP.onLoad = () => setExcelView('task');
renderAreas('#aTypes', ACCESS_AREAS, ACCESS_TYPES.map((t) => ({ name: t.name, area: t.area, go: () => AP.load(ACCESS_PROBLEMS.find((p) => p.type === t.name)) })));
const taskItem = (t) => ({ name: t.name, area: t.area, go: () => TP.load(EXCEL_TASK_PROBLEMS.find((p) => p.type === t.name)) });
const formulaArea = (n) => (['조건부 서식', '고급 필터 조건식'].includes(n) ? '기본작업' : '계산작업');
renderAreas('#types', ['기본작업', '계산작업', '분석작업', '기타작업'], [
  ...EXCEL_TASK_TYPES.filter((t) => t.name === '셀 서식').map(taskItem),
  ...TYPES.map((t) => ({ name: t.name, area: formulaArea(t.name), go: () => loadProblem(PROBLEMS.find((p) => p.type === t.name)) })),
  ...EXCEL_TASK_TYPES.filter((t) => t.name !== '셀 서식').map(taskItem),
]);
$('#aDbTabs').replaceChildren(...Object.keys(ACCESS_DB).map((t, i) => {
  const b = button(t, () => {
    document.querySelectorAll('#aDbTabs button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    $('#aDbView').innerHTML = Engine.accessQuery(`SELECT * FROM ${t}`, freshDB()).steps[0].html;
  });
  if (!i) setTimeout(() => b.click());
  return b;
}));
$('#fx').oninput = () => {
  grid[sel] = $('#fx').value;
  paintGrid();
};
$('#fx').onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); runExcel(); } };
$('#runX').onclick = runExcel;
$('#play').onclick = () => {
  if (timer) return stop();
  if (cur === steps.length - 1) show(0); // 끝에서 누르면 다시 재생
  $('#play').textContent = '⏸ 일시정지';
  timer = setInterval(() => (cur < steps.length - 1 ? show(cur + 1) : stop()), 1400);
};
$('#first').onclick = () => { stop(); show(0); };
$('#prev').onclick = () => { stop(); show(cur - 1); };
$('#next').onclick = () => { stop(); show(cur + 1); };
document.querySelectorAll('.tabs button').forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));

loadProblem(PROBLEMS[0], { solve: true }); // 첫 화면: 조건부 서식 문제 풀이
