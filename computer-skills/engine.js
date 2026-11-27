// 수식/쿼리를 단계별로 계산하는 엔진. 브라우저(window.Engine)와 node(require) 양쪽에서 씁니다.
(function (root) {
  // 참조 범위·계산 블록에 돌아가며 쓰는 색 (Excel 수식 편집 색과 비슷하게)
  const PALETTE = ['#2f6fde', '#1f9d55', '#8e44ad', '#d9480f', '#c2185b', '#00838f', '#b7791f', '#5c6bc0'];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // ---------- 셀 주소 ----------
  const colIdx = (letters) => [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
  const colName = (i) => (i < 26 ? '' : colName(Math.floor(i / 26) - 1)) + String.fromCharCode(65 + (i % 26));
  const splitRef = (ref) => {
    const [, c, r] = /^([A-Z]+)(\d+)$/.exec(ref);
    return { c: colIdx(c), r: +r - 1 };
  };
  // 'B2:D3' → [['B2','C2','D2'],['B3','C3','D3']]
  function cellsOf(text) {
    const [a, b = a] = text.split(':').map(splitRef);
    const out = [];
    for (let r = Math.min(a.r, b.r); r <= Math.max(a.r, b.r); r++) {
      const row = [];
      for (let c = Math.min(a.c, b.c); c <= Math.max(a.c, b.c); c++) row.push(colName(c) + (r + 1));
      out.push(row);
    }
    return out;
  }

  // ---------- 토큰/파서 ----------
  // 숫자 | "문자" | '문자' | [필드] 또는 [표].[필드] | #날짜# | 셀 참조 | 이름 | 연산자
  const TOKEN =
    /\s*(?:(\d+(?:\.\d+)?)|"((?:[^"]|"")*)"|'([^']*)'|\[([^\]]+)\](?:[.!]\[([^\]]+)\])?|#(\d{4}-\d{1,2}-\d{1,2})#|(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?)(?![\w가-힣.(])|([A-Za-z_가-힣][\w가-힣.]*)|(<>|<=|>=|[-+*/^&=<>(),\\;]))/y;

  function tokenize(src) {
    const out = [];
    TOKEN.lastIndex = 0;
    while (src.slice(TOKEN.lastIndex).trim()) {
      const at = TOKEN.lastIndex;
      const m = TOKEN.exec(src);
      if (!m) throw new Error(`알 수 없는 문자: ${src.slice(at).trim()[0]}`);
      const s = at + m[0].length - m[0].trimStart().length;
      const e = TOKEN.lastIndex;
      if (m[1]) out.push({ k: 'num', v: +m[1], s, e });
      else if (m[2] !== undefined) out.push({ k: 'str', v: m[2].replace(/""/g, '"'), s, e });
      else if (m[3] !== undefined) out.push({ k: 'str', v: m[3], s, e });
      else if (m[4]) out.push({ k: 'field', v: m[5] ? `${m[4]}.${m[5]}` : m[4], s, e });
      else if (m[6]) out.push({ k: 'date', v: toDate(m[6]), s, e });
      else if (m[7]) out.push({ k: 'ref', v: m[7], s, e });
      else if (m[8]) out.push({ k: 'id', v: m[8], s, e });
      else out.push({ k: 'op', v: m[9], s, e });
    }
    return out;
  }

  // 우선순위: 비교 < & < +- < */ < ^ < 단항 -  (Excel은 -2^2 = 4)
  const LEVELS = [['=', '<>', '<', '>', '<=', '>='], ['&'], ['+', '-'], ['*', '/', '\\'], ['^']];

  function parse(src, mode) {
    const t = tokenize(src);
    let p = 0;
    const isOp = (v) => t[p] && t[p].k === 'op' && t[p].v === v;
    const isKw = (v) => t[p] && t[p].k === 'id' && t[p].v.toUpperCase() === v;
    const expect = (v) => {
      if (!isOp(v)) throw new Error(`'${v}'가 필요합니다`);
      return t[p++];
    };
    const node = (o, s, e) => Object.assign(o, { s, e });

    // Access 조건식: OR < AND < NOT < 비교(Like, Between, In, Is Null 포함) < 나머지
    function bool(n) {
      if (n === 2) {
        if (!isKw('NOT')) return postfix(level(0));
        const s = t[p++].s;
        const x = bool(2);
        return node({ t: 'not', x }, s, x.e);
      }
      const op = ['OR', 'AND'][n];
      let l = bool(n + 1);
      while (isKw(op)) {
        p++;
        const r = bool(n + 1);
        l = node({ t: 'bin', op, l, r }, l.s, r.e);
      }
      return l;
    }
    // x Like "김*" / x [Not] Between a And b / x [Not] In (…) / x Is [Not] Null
    function postfix(x) {
      for (;;) {
        const save = p;
        let neg = false;
        if (isKw('NOT')) { neg = true; p++; }
        if (isKw('LIKE')) {
          p++;
          const r = level(0);
          x = node({ t: 'bin', op: neg ? 'NOT LIKE' : 'LIKE', l: x, r }, x.s, r.e);
        } else if (isKw('BETWEEN')) {
          p++;
          const lo = level(0);
          if (!isKw('AND')) throw new Error('Between 뒤에는 "값 And 값"이 필요합니다');
          p++;
          const hi = level(0);
          x = node({ t: 'between', x, lo, hi, neg }, x.s, hi.e);
        } else if (isKw('IN')) {
          p++;
          expect('(');
          const list = [expr()];
          while (isOp(',')) { p++; list.push(expr()); }
          x = node({ t: 'in', x, list, neg }, x.s, expect(')').e);
        } else if (!neg && isKw('IS')) {
          p++;
          let not = false;
          if (isKw('NOT')) { not = true; p++; }
          if (!isKw('NULL')) throw new Error('Is 뒤에는 Null 또는 Not Null이 필요합니다');
          x = node({ t: 'isnull', x, neg: not }, x.s, t[p++].e);
        } else {
          p = save;
          return x;
        }
      }
    }
    const isLevelOp = (n) =>
      (t[p] && t[p].k === 'op' && LEVELS[n].includes(t[p].v)) || (mode === 'access' && n === 3 && isKw('MOD'));
    function level(n) {
      if (n === LEVELS.length) return unary();
      let l = level(n + 1);
      while (isLevelOp(n)) {
        const op = t[p++].v.toUpperCase();
        const r = level(n + 1);
        l = node({ t: 'bin', op, l, r }, l.s, r.e);
      }
      return l;
    }
    function unary() {
      if (!isOp('-')) return primary();
      const s = t[p++].s;
      const x = unary();
      return node({ t: 'neg', x }, s, x.e);
    }
    const expr = () => (mode === 'access' ? bool(0) : level(0));

    function primary() {
      const k = t[p++];
      if (!k) throw new Error('식이 중간에 끝났습니다');
      if (k.k === 'num' || k.k === 'str') return node({ t: 'lit', v: k.v }, k.s, k.e);
      if (k.k === 'op' && k.v === '(') {
        const x = expr();
        return node({ t: 'paren', x }, k.s, expect(')').e);
      }
      if (mode === 'access' && k.k !== 'op') {
        if (k.k === 'date') return node({ t: 'lit', v: new DateVal(k.v) }, k.s, k.e);
        const up = k.v.toUpperCase();
        if (k.k === 'id' && (up === 'TRUE' || up === 'FALSE')) return node({ t: 'lit', v: up === 'TRUE' }, k.s, k.e);
        if (k.k === 'id' && up === 'NULL') return node({ t: 'lit', v: null }, k.s, k.e);
        if (k.k === 'id' && isOp('(')) {
          if (!(up in ACCESS_FUNCS) && !(up in AGG)) throw new Error(`지원하지 않는 함수: ${k.v}`);
          p++;
          const args = [];
          if (isOp('*')) { args.push(node({ t: 'lit', v: '*' }, t[p].s, t[p].e)); p++; } // Count(*)
          else if (!isOp(')')) {
            args.push(expr());
            while (isOp(',')) { p++; args.push(expr()); }
          }
          return node({ t: 'call', name: up, args }, k.s, expect(')').e);
        }
        return node({ t: 'field', name: k.v }, k.s, k.e);
      }
      if (k.k === 'ref') {
        const text = k.v.replace(/\$/g, '').toUpperCase();
        return node({ t: text.includes(':') ? 'range' : 'ref', text, raw: k.v }, k.s, k.e);
      }
      if (k.k === 'id') {
        const name = k.v.toUpperCase();
        if (name === 'TRUE' || name === 'FALSE') return node({ t: 'lit', v: name === 'TRUE' }, k.s, k.e);
        if (!isOp('(')) throw new Error(`알 수 없는 이름: ${k.v}`);
        if (!(name in FUNCS) && name !== 'IF' && name !== 'IFERROR') throw new Error(`지원하지 않는 함수: ${k.v}`);
        p++;
        const args = [];
        if (!isOp(')')) {
          args.push(expr());
          while (isOp(',')) {
            p++;
            args.push(expr());
          }
        }
        const c = expect(')');
        if (name === 'IF' && (args.length < 2 || args.length > 3)) throw new Error('IF는 인수가 2~3개입니다');
        if (name === 'IFERROR' && args.length !== 2) throw new Error('IFERROR는 인수가 2개입니다');
        return node({ t: 'call', name, args }, k.s, c.e);
      }
      throw new Error(`예상하지 못한 '${k.v}'`);
    }

    const ast = expr();
    if (p < t.length) throw new Error(`예상하지 못한 '${t[p].v}'`);
    return ast;
  }

  const kids = (n) =>
    ({ bin: [n.l, n.r], neg: [n.x], not: [n.x], paren: [n.x], call: n.args, between: [n.x, n.lo, n.hi], in: [n.x, ...(n.list || [])], isnull: [n.x] })[n.t] || [];
  const unparen = (n) => (n.t === 'paren' ? unparen(n.x) : n);

  // ---------- 값과 연산 ----------
  class XErr {
    constructor(code) { this.err = code; }
  }
  const err = (code) => new XErr(code);
  const isErr = (v) => v instanceof XErr;
  // Access 날짜 값 (#2024-01-01#). 계산할 때는 일련번호, 보일 때는 날짜.
  class DateVal {
    constructor(s) { this.s = s; }
  }
  const iso = (s) => new Date(EPOCH + Math.floor(s) * DAY).toISOString().slice(0, 10);
  const fmt = (v) =>
    v == null ? '' : isErr(v) ? v.err : v instanceof DateVal ? iso(v.s) : Array.isArray(v) ? v.flat().map(fmt).join(', ')
      : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : typeof v === 'number' ? String(+v.toPrecision(15)) : v;
  const lit = (v) =>
    typeof v === 'string' ? `"${v}"` : v == null ? '(빈 셀)' : v instanceof DateVal ? `#${iso(v.s)}#`
      : Array.isArray(v) ? `{${v.map((row) => row.map(lit).join(',')).join(';')}}` : fmt(v);
  // 배열 연산: 같은 위치끼리 계산 (한 행/한 열/단일 값은 늘려서 맞춤, 크기가 안 맞으면 #N/A)
  // 배열 x의 (i, j) 값. 단일 값·한 행·한 열은 늘려서 맞춤
  const at = (x, i, j) => {
    if (!Array.isArray(x)) return x;
    const r = x.length === 1 ? 0 : i, c = x[0].length === 1 ? 0 : j;
    return r < x.length && c < x[0].length ? x[r][c] : err('#N/A');
  };
  function zip(a, b, f) {
    const A = Array.isArray(a), B = Array.isArray(b);
    const rows = Math.max(A ? a.length : 1, B ? b.length : 1);
    const cols = Math.max(A ? a[0].length : 1, B ? b[0].length : 1);
    return Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => f(at(a, i, j), at(b, i, j))));
  }
  const fixNum = (v) => (typeof v === 'number' ? (isNaN(v) ? err('#VALUE!') : isFinite(v) ? v : err('#NUM!')) : v === undefined ? null : v);
  const toNum = (v) =>
    v == null ? 0 : typeof v === 'number' ? v : v instanceof DateVal ? v.s : typeof v === 'boolean' ? +v
      : typeof v === 'string' && v.trim() !== '' && isFinite(v) ? +v : NaN;
  const toBool = (v) =>
    isErr(v) ? v : v == null ? false : typeof v === 'boolean' ? v : typeof v === 'number' ? v !== 0 : err('#VALUE!');

  // 숫자 < 텍스트 < 논리값, 텍스트는 대소문자 구분 없음, 빈 셀은 0 또는 "" (Excel 규칙)
  function cmp(a, b) {
    if (a instanceof DateVal) a = a.s;
    if (b instanceof DateVal) b = b.s;
    if (a == null) a = typeof b === 'string' ? '' : 0;
    if (b == null) b = typeof a === 'string' ? '' : 0;
    const rank = (v) => ({ number: 0, string: 1, boolean: 2 })[typeof v];
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    if (typeof a === 'string') [a, b] = [a.toLowerCase(), b.toLowerCase()];
    return a < b ? -1 : a > b ? 1 : 0;
  }
  const CMP = { '=': (c) => c === 0, '<>': (c) => c !== 0, '<': (c) => c < 0, '>': (c) => c > 0, '<=': (c) => c <= 0, '>=': (c) => c >= 0 };

  function binop(op, a, b) {
    if (isErr(a)) return a;
    if (isErr(b)) return b;
    if (Array.isArray(a) || Array.isArray(b)) return zip(a, b, (x, y) => binop(op, x, y));
    if (op === '&') return fmt(a) + fmt(b);
    if (op === 'LIKE' || op === 'NOT LIKE') return a == null ? null : likeRe(fmt(b)).test(fmt(a)) === (op === 'LIKE');
    if (op in CMP) return CMP[op](cmp(a, b));
    if (op === 'AND' || op === 'OR') {
      const x = toBool(a), y = toBool(b);
      if (isErr(x)) return x;
      if (isErr(y)) return y;
      return op === 'AND' ? x && y : x || y;
    }
    const x = toNum(a), y = toNum(b);
    if (isNaN(x) || isNaN(y)) return err('#VALUE!');
    if ((op === '/' || op === '\\' || op === 'MOD') && y === 0) return err('#DIV/0!');
    const v = { '+': x + y, '-': x - y, '*': x * y, '/': x / y, '^': x ** y, '\\': Math.trunc(x / y), MOD: x % y }[op];
    // 날짜 + 일수, 날짜 - 일수 = 날짜 (Access). 날짜 - 날짜 = 일수.
    const da = a instanceof DateVal, dB = b instanceof DateVal;
    return (op === '+' && da !== dB) || (op === '-' && da && !dB) ? new DateVal(v) : v;
  }
  // Access Like 패턴: * 아무 글자들, ? 한 글자, # 숫자 한 개, [a-c] [!a] 글자 집합
  function likeRe(p) {
    let re = '';
    for (let i = 0; i < p.length; i++) {
      const c = p[i];
      if (c === '*') re += '.*';
      else if (c === '?') re += '.';
      else if (c === '#') re += '\\d';
      else if (c === '[') {
        const j = p.indexOf(']', i);
        re += `[${p.slice(i + 1, j).replace(/^!/, '^')}]`;
        i = j;
      } else re += c.replace(/[.+^${}()|\\]/g, '\\$&');
    }
    return new RegExp(`^${re}$`, 'i');
  }

  // ---------- Excel 함수 ----------
  // 인수는 계산된 값, 범위는 2차원 배열. 범위 안의 텍스트·빈 셀은 숫자 함수에서 무시.
  const flat = (args) => args.flatMap((a) => (Array.isArray(a) ? a.flat() : [a]));
  const nums = (args) => args.flatMap((a) => (Array.isArray(a) ? a.flat().filter((v) => typeof v === 'number') : [toNum(a)]));
  const sum = (xs) => xs.reduce((s, x) => s + x, 0);
  const roundBy = (f) => ([x, d = 0]) => {
    const m = 10 ** toNum(d);
    x = toNum(x);
    return (Math.sign(x) * f(+(Math.abs(x) * m).toPrecision(15))) / m;
  };
  // COUNTIF 조건: 80, ">=80", "<>경영", "김*"
  function crit(c) {
    if (typeof c !== 'string') return (v) => cmp(v, c) === 0;
    const [, op = '=', rest] = /^(<=|>=|<>|<|>|=)?(.*)$/s.exec(c);
    const target = rest.trim() !== '' && isFinite(rest) ? +rest : DATE_RE.test(rest.trim()) ? toDate(rest) : rest;
    if (typeof target === 'string' && /[*?]/.test(target) && (op === '=' || op === '<>')) {
      const re = new RegExp(`^${target.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`, 'i');
      return (v) => re.test(fmt(v)) === (op === '=');
    }
    return (v) => (v != null && typeof v !== typeof target ? op === '<>' : CMP[op](cmp(v, target)));
  }
  const pick = (r, c, s = r) => {
    const keep = crit(c), vals = s.flat();
    return r.flat().map((v, i) => (keep(v) ? vals[i] : null)).filter((v) => typeof v === 'number');
  };
  function lookup(v, list, exact) {
    let k = -1;
    list.forEach((x, i) => {
      if (k >= 0 && exact) return;
      if (exact ? cmp(x, v) === 0 && typeof x === typeof v : typeof x === typeof v && cmp(x, v) <= 0) k = i;
    });
    return k;
  }
  const isRange = (t) => Array.isArray(t);
  // 데이터베이스 함수: (데이터베이스 범위, 필드, 조건 범위) → { col: 필드 열, idx: 조건에 맞는 행 번호(머리글 제외), rows }
  // 조건 범위: 첫 행은 필드명, 같은 행 조건은 AND, 다른 행끼리는 OR. 연산자 없는 텍스트는 "~로 시작".
  function dbMatch([db, field, cr]) {
    if (!isRange(db) || !isRange(cr) || db.length < 2 || cr.length < 2) return err('#VALUE!');
    const head = db[0].map((h) => fmt(h).toLowerCase());
    const colOf = (name) => head.indexOf(fmt(name).toLowerCase());
    const col = typeof field === 'number' ? field - 1 : colOf(field);
    if (col < 0 || col >= head.length) return err('#VALUE!');
    const rules = cr.slice(1).map((row) =>
      row.map((c, j) => [colOf(cr[0][j]), typeof c === 'string' && !/^[<>=]/.test(c) ? crit(`${c}*`) : crit(c)])
        .filter((_, j) => row[j] != null && row[j] !== ''));
    const rows = db.slice(1);
    const idx = rows.map((_, i) => i).filter((i) => rules.some((rule) => rule.every(([k, ok]) => k >= 0 && ok(rows[i][k]))));
    return { col, idx, rows };
  }
  const dbf = (f) => (a) => {
    const m = dbMatch(a);
    return isErr(m) ? m : f(m.idx.map((i) => m.rows[i][m.col]));
  };
  const onlyNums = (v) => v.filter((x) => typeof x === 'number');
  // 날짜 = Excel 일련번호 (1899-12-30부터 일수). "2023-03-02", "2023.03.02" 문자열도 날짜로 읽음.
  const DATE_RE = /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})\.?$/;
  const EPOCH = Date.UTC(1899, 11, 30), DAY = 864e5;
  const serial = (y, m, d) => (Date.UTC(y, m - 1, d) - EPOCH) / DAY;
  const toDate = (v) => {
    const m = typeof v === 'string' && DATE_RE.exec(v.trim());
    return m ? serial(+m[1], +m[2], +m[3]) : toNum(v);
  };
  const datePart = (get) => ([d]) => (isNaN(toDate(d)) ? NaN : get(new Date(EPOCH + Math.floor(toDate(d)) * DAY)));
  // COUNTIFS/SUMIFS/AVERAGEIFS: (범위1, 조건1, 범위2, 조건2, …) 모두 만족하는 위치
  const ifsIndex = (pairs) => {
    const conds = [];
    for (let i = 0; i < pairs.length; i += 2) {
      if (!isRange(pairs[i])) return err('#VALUE!');
      conds.push([pairs[i].flat(), crit(pairs[i + 1])]);
    }
    return conds[0][0].map((_, k) => k).filter((k) => conds.every(([vals, ok]) => ok(vals[k])));
  };
  const ifsVals = ([s, ...pairs]) => {
    const idx = ifsIndex(pairs);
    return isErr(idx) || !isRange(s) ? err('#VALUE!') : idx.map((k) => s.flat()[k]).filter((v) => typeof v === 'number');
  };
  const nth = (desc) => ([r, k]) => {
    const n = nums([r]).sort((a, b) => (desc ? b - a : a - b));
    return n[toNum(k) - 1] ?? err('#NUM!');
  };
  // 날짜 → [년, 월, 일]
  const ymd = (d) => {
    const x = new Date(EPOCH + Math.floor(toDate(d)) * DAY);
    return [x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate()];
  };
  const DATEDIF = ([s, e, unit]) => {
    if (isNaN(toDate(s)) || isNaN(toDate(e))) return err('#VALUE!');
    if (toDate(s) > toDate(e)) return err('#NUM!');
    const [y1, m1, d1] = ymd(s), [y2, m2, d2] = ymd(e);
    const months = (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0);
    const u = fmt(unit).toUpperCase();
    return u === 'Y' ? Math.floor(months / 12) : u === 'M' ? months : u === 'D' ? Math.floor(toDate(e)) - Math.floor(toDate(s)) : err('#NUM!');
  };
  const EDATE = ([d, k]) => {
    if (isNaN(toDate(d))) return err('#VALUE!');
    const [y, m, dd] = ymd(d);
    const last = new Date(Date.UTC(y, m - 1 + toNum(k) + 1, 0)).getUTCDate();
    return serial(y, m + toNum(k), Math.min(dd, last));
  };
  const EOMONTH = ([d, k]) => {
    if (isNaN(toDate(d))) return err('#VALUE!');
    const [y, m] = ymd(d);
    return serial(y, m + toNum(k) + 1, 0);
  };
  const stat = (f) => (a) => {
    const n = nums(a);
    return f(n);
  };
  const variance = (n) => {
    if (n.length < 2) return err('#DIV/0!');
    const mean = sum(n) / n.length;
    return sum(n.map((x) => (x - mean) ** 2)) / (n.length - 1);
  };
  const MODE = stat((n) => {
    const count = new Map();
    n.forEach((x) => count.set(x, (count.get(x) || 0) + 1));
    let best = null, most = 1;
    for (const x of n) if (count.get(x) > most) { best = x; most = count.get(x); }
    return best === null ? err('#N/A') : best;
  });
  const STDEV = stat((n) => (isErr(variance(n)) ? variance(n) : Math.sqrt(variance(n))));
  const VAR = stat(variance);
  const find = (ci) => ([f, s, st = 1]) => {
    const hay = ci ? fmt(s).toLowerCase() : fmt(s), needle = ci ? fmt(f).toLowerCase() : fmt(f);
    const k = hay.indexOf(needle, toNum(st) - 1);
    return k < 0 ? err('#VALUE!') : k + 1;
  };
  // 재무 함수 (Excel과 같은 부호 규칙: 내는 돈은 음수)
  const growth = (r, n) => (1 + r) ** n;
  const PMT = ([r, n, pv, fv = 0, type = 0]) => {
    [r, n, pv, fv, type] = [r, n, pv, fv, type].map(toNum);
    return r === 0 ? -(pv + fv) / n : (-r * (pv * growth(r, n) + fv)) / ((1 + r * type) * (growth(r, n) - 1));
  };
  const FV = ([r, n, pmt, pv = 0, type = 0]) => {
    [r, n, pmt, pv, type] = [r, n, pmt, pv, type].map(toNum);
    return r === 0 ? -(pv + pmt * n) : -(pv * growth(r, n) + (pmt * (1 + r * type) * (growth(r, n) - 1)) / r);
  };
  const PV = ([r, n, pmt, fv = 0, type = 0]) => {
    [r, n, pmt, fv, type] = [r, n, pmt, fv, type].map(toNum);
    return r === 0 ? -(fv + pmt * n) : -(fv + (pmt * (1 + r * type) * (growth(r, n) - 1)) / r) / growth(r, n);
  };
  const FUNCS = {
    SUM: (a) => sum(nums(a)),
    AVERAGE: (a) => (nums(a).length ? sum(nums(a)) / nums(a).length : err('#DIV/0!')),
    MAX: (a) => (nums(a).length ? Math.max(...nums(a)) : 0),
    MIN: (a) => (nums(a).length ? Math.min(...nums(a)) : 0),
    COUNT: (a) => flat(a).filter((v) => typeof v === 'number').length,
    COUNTA: (a) => flat(a).filter((v) => v != null && v !== '').length,
    COUNTBLANK: (a) => flat(a).filter((v) => v == null || v === '').length,
    COUNTIF: ([r, c]) => (isRange(r) ? r.flat().filter(crit(c)).length : err('#VALUE!')),
    SUMIF: ([r, c, s]) => (isRange(r) ? sum(pick(r, c, s)) : err('#VALUE!')),
    AVERAGEIF: ([r, c, s]) => (isRange(r) ? (pick(r, c, s).length ? sum(pick(r, c, s)) / pick(r, c, s).length : err('#DIV/0!')) : err('#VALUE!')),
    ROUND: roundBy(Math.round),
    ROUNDUP: roundBy(Math.ceil),
    ROUNDDOWN: roundBy(Math.trunc),
    INT: ([x]) => Math.floor(toNum(x)),
    ABS: ([x]) => Math.abs(toNum(x)),
    MOD: ([a, b]) => (toNum(b) === 0 ? err('#DIV/0!') : toNum(a) - toNum(b) * Math.floor(toNum(a) / toNum(b))),
    AND: (a) => flat(a).map(toBool).find(isErr) ?? flat(a).every((v) => toBool(v) === true),
    OR: (a) => flat(a).map(toBool).find(isErr) ?? flat(a).some((v) => toBool(v) === true),
    NOT: ([x]) => (isErr(toBool(x)) ? toBool(x) : !toBool(x)),
    LEFT: ([s, n = 1]) => fmt(s).slice(0, toNum(n)),
    RIGHT: ([s, n = 1]) => fmt(s).slice(Math.max(0, fmt(s).length - toNum(n))),
    MID: ([s, st, n]) => fmt(s).substr(toNum(st) - 1, toNum(n)),
    LEN: ([s]) => fmt(s).length,
    UPPER: ([s]) => fmt(s).toUpperCase(),
    LOWER: ([s]) => fmt(s).toLowerCase(),
    TRIM: ([s]) => fmt(s).trim().replace(/ +/g, ' '),
    CHOOSE: ([i, ...xs]) => xs[toNum(i) - 1] ?? err('#VALUE!'),
    DSUM: dbf((v) => sum(onlyNums(v))),
    DAVERAGE: dbf((v) => (onlyNums(v).length ? sum(onlyNums(v)) / onlyNums(v).length : err('#DIV/0!'))),
    DCOUNT: dbf((v) => onlyNums(v).length),
    DCOUNTA: dbf((v) => v.filter((x) => x != null && x !== '').length),
    DMAX: dbf((v) => (onlyNums(v).length ? Math.max(...onlyNums(v)) : 0)),
    DMIN: dbf((v) => (onlyNums(v).length ? Math.min(...onlyNums(v)) : 0)),
    DGET: dbf((v) => (v.length === 1 ? v[0] : err(v.length ? '#NUM!' : '#VALUE!'))),
    VALUE: ([s]) => toDate(s),
    YEAR: datePart((d) => d.getUTCFullYear()),
    MONTH: datePart((d) => d.getUTCMonth() + 1),
    DAY: datePart((d) => d.getUTCDate()),
    DATE: ([y, m, d]) => serial(toNum(y), toNum(m), toNum(d)),
    // 반환 유형 1(기본): 일=1…토=7, 2: 월=1…일=7, 3: 월=0…일=6
    WEEKDAY: ([d, t = 1]) => {
      const w = datePart((x) => x.getUTCDay())([d]);
      return isNaN(w) ? w : toNum(t) === 2 ? ((w + 6) % 7) + 1 : toNum(t) === 3 ? (w + 6) % 7 : w + 1;
    },
    COUNTIFS: (a) => (isErr(ifsIndex(a)) ? ifsIndex(a) : ifsIndex(a).length),
    SUMIFS: (a) => (isErr(ifsVals(a)) ? ifsVals(a) : sum(ifsVals(a))),
    AVERAGEIFS: (a) => (isErr(ifsVals(a)) ? ifsVals(a) : ifsVals(a).length ? sum(ifsVals(a)) / ifsVals(a).length : err('#DIV/0!')),
    LARGE: nth(true),
    SMALL: nth(false),
    PMT, FV, PV,
    DATEDIF, EDATE, EOMONTH,
    DAYS: ([e, s]) => Math.floor(toDate(e)) - Math.floor(toDate(s)),
    MEDIAN: stat((n) => {
      if (!n.length) return err('#NUM!');
      const s = [...n].sort((a, b) => a - b), h = s.length >> 1;
      return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2;
    }),
    MODE, 'MODE.SNGL': MODE, STDEV, 'STDEV.S': STDEV, VAR, 'VAR.S': VAR,
    SUMPRODUCT: (a) => {
      if (!a.every(isRange)) return err('#VALUE!');
      const lists = a.map((r) => r.flat());
      if (lists.some((l) => l.length !== lists[0].length)) return err('#VALUE!');
      return sum(lists[0].map((_, k) => lists.reduce((p, l) => p * (typeof l[k] === 'number' ? l[k] : 0), 1)));
    },
    PRODUCT: (a) => nums(a).reduce((p, x) => p * x, 1),
    POWER: ([a, b]) => toNum(a) ** toNum(b),
    SQRT: ([x]) => (toNum(x) < 0 ? err('#NUM!') : Math.sqrt(toNum(x))),
    TRUNC: roundBy(Math.trunc),
    REPT: ([s, n]) => fmt(s).repeat(Math.max(0, Math.floor(toNum(n)))),
    FIND: find(false),
    SEARCH: find(true),
    SUBSTITUTE: ([s, from, to, nth]) => {
      s = fmt(s); from = fmt(from); to = fmt(to);
      if (!from) return s;
      if (nth === undefined) return s.split(from).join(to);
      let k = -1;
      for (let i = 0; i < toNum(nth); i++) if ((k = s.indexOf(from, k + 1)) < 0) return s;
      return s.slice(0, k) + to + s.slice(k + from.length);
    },
    REPLACE: ([s, st, n, to]) => fmt(s).slice(0, toNum(st) - 1) + fmt(to) + fmt(s).slice(toNum(st) - 1 + toNum(n)),
    PROPER: ([s]) => fmt(s).toLowerCase().replace(/(^|[^a-z])([a-z])/g, (m, a, b) => a + b.toUpperCase()),
    CONCATENATE: (a) => a.map(fmt).join(''),
    ISERROR: ([x]) => isErr(x),
    ISNUMBER: ([x]) => typeof x === 'number',
    ISTEXT: ([x]) => typeof x === 'string',
    ISBLANK: ([x]) => x == null,
    RANK: ([x, r, o = 0]) => {
      const n = isRange(r) ? r.flat().filter((v) => typeof v === 'number') : [];
      return n.includes(toNum(x)) ? 1 + n.filter((v) => (toNum(o) ? v < x : v > x)).length : err('#N/A');
    },
    VLOOKUP: ([v, t, c, approx = true]) => {
      if (!isRange(t)) return err('#VALUE!');
      if (toNum(c) < 1 || toNum(c) > t[0].length) return err('#REF!');
      const k = lookup(v, t.map((row) => row[0]), toBool(approx) !== true);
      return k < 0 ? err('#N/A') : t[k][toNum(c) - 1];
    },
    HLOOKUP: ([v, t, r, approx = true]) => {
      if (!isRange(t)) return err('#VALUE!');
      if (toNum(r) < 1 || toNum(r) > t.length) return err('#REF!');
      const k = lookup(v, t[0], toBool(approx) !== true);
      return k < 0 ? err('#N/A') : t[toNum(r) - 1][k];
    },
    // 한 행짜리 범위에 번호 하나만 주면 그 번호는 열 번호 (INDEX($M$3:$P$3, 2))
    INDEX: ([t, r, c]) => {
      if (!isRange(t)) return err('#VALUE!');
      if (c === undefined && t.length === 1) return t[0][toNum(r) - 1] ?? err('#REF!');
      return (t[toNum(r) - 1] || [])[toNum(c ?? 1) - 1] ?? err('#REF!');
    },
    MATCH: ([v, t, type = 1]) => {
      if (!isRange(t)) return err('#VALUE!');
      const list = t.flat();
      const k = toNum(type) === 0 ? lookup(v, list, true)
        : toNum(type) > 0 ? lookup(v, list, false)
        : list.reduce((best, x, i) => (typeof x === typeof v && cmp(x, v) >= 0 ? i : best), -1);
      return k < 0 ? err('#N/A') : k + 1;
    },
  };
  FUNCS['RANK.EQ'] = FUNCS.RANK;
  // 오류 인수를 받아도 되는 함수 (ISERROR(1/0) → TRUE)
  const TAKES_ERRORS = new Set(['ISERROR', 'ISNUMBER', 'ISTEXT', 'ISBLANK']);
  // 칸 하나에 쓰는 함수: 배열(범위)을 넣으면 칸마다 계산 (배열 수식의 MONTH(A3:A10) 등)
  const PER_CELL = new Set(['LEFT', 'RIGHT', 'MID', 'LEN', 'UPPER', 'LOWER', 'TRIM', 'PROPER', 'VALUE', 'REPT', 'FIND', 'SEARCH',
    'SUBSTITUTE', 'REPLACE', 'YEAR', 'MONTH', 'DAY', 'WEEKDAY', 'INT', 'ABS', 'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'TRUNC', 'MOD',
    'SQRT', 'POWER', 'ISERROR', 'ISNUMBER', 'ISTEXT', 'ISBLANK']);
  function callFunc(name, vals) {
    const one = (args) => fixNum((TAKES_ERRORS.has(name) ? undefined : args.find(isErr)) ?? FUNCS[name](args));
    if (!PER_CELL.has(name) || !vals.some(Array.isArray)) return one(vals);
    const A = vals.find(Array.isArray);
    return A.map((row, i) => row.map((_, j) => one(vals.map((v) => at(v, i, j)))));
  }

  // 계산한 노드에 order(계산 순번)와 value를 적고, 순서대로 노드 목록을 돌려줍니다.
  function evaluate(ast, ctx) {
    const done = [];
    (function ev(n) {
      let v, note;
      switch (n.t) {
        case 'lit':
          n.order = -1;
          return (n.value = n.v);
        case 'field':
          n.order = -1;
          return (n.value = fieldValue(ctx, n.name));
        case 'between': {
          const x = ev(n.x), lo = ev(n.lo), hi = ev(n.hi);
          v = x == null ? null : (cmp(x, lo) >= 0 && cmp(x, hi) <= 0) !== n.neg;
          break;
        }
        case 'in': {
          const x = ev(n.x), list = n.list.map(ev);
          v = x == null ? null : list.some((y) => cmp(x, y) === 0) !== n.neg;
          break;
        }
        case 'isnull':
          v = (ev(n.x) == null) !== n.neg;
          break;
        case 'ref':
          n.order = -1;
          return (n.value = ctx.cell(n.text));
        case 'range': {
          const cells = cellsOf(n.text);
          if (cells.length * cells[0].length > 2000) throw new Error(`범위가 너무 큽니다: ${n.raw}`);
          n.order = -1;
          return (n.value = cells.map((row) => row.map(ctx.cell)));
        }
        case 'paren':
          n.value = ev(n.x);
          n.order = n.x.order; // 괄호는 안쪽 계산이 끝난 다음 단계에서 벗겨집니다
          return n.value;
        case 'neg': {
          const neg = (x) => (isErr(x) ? x : isNaN(toNum(x)) ? err('#VALUE!') : -toNum(x));
          const x = ev(n.x);
          v = Array.isArray(x) ? x.map((row) => row.map(neg)) : neg(x);
          break;
        }
        case 'not': {
          const not = (x) => (isErr(toBool(x)) ? toBool(x) : !toBool(x));
          const x = ev(n.x);
          v = Array.isArray(x) ? x.map((row) => row.map(not)) : not(x);
          break;
        }
        case 'bin':
          v = binop(n.op, ev(n.l), ev(n.r));
          break;
        case 'call': {
          if (ctx.mode === 'access') {
            ({ v, note } = accessCall(n, ctx, ev));
            v = fixNum(v);
            break;
          }
          const cond = n.name === 'IF' ? ev(n.args[0]) : null;
          if (n.name === 'IF' && Array.isArray(cond)) {
            // 배열 IF: 칸마다 조건을 보고 값을 고름 (양쪽 인수 모두 계산)
            const t = ev(n.args[1]);
            const f = n.args[2] ? ev(n.args[2]) : false;
            v = zip(zip(cond, t, (c, x) => [c, x]), f, ([c, x], y) => (isErr(toBool(c)) ? toBool(c) : toBool(c) ? x : y));
            note = '배열 조건: 칸마다 TRUE면 두 번째 인수, FALSE면 세 번째 인수(없으면 FALSE)';
          } else if (n.name === 'IF') {
            const c = toBool(cond);
            if (isErr(c)) v = c;
            else {
              v = c ? ev(n.args[1]) : n.args[2] ? ev(n.args[2]) : false;
              note = c ? '조건이 TRUE → 두 번째 인수를 사용' : '조건이 FALSE → 세 번째 인수를 사용';
            }
          } else if (n.name === 'IFERROR') {
            const a = ev(n.args[0]);
            v = isErr(a) ? ev(n.args[1]) : a;
            note = isErr(a) ? '오류 → 두 번째 인수를 사용' : '오류 아님 → 첫 번째 값을 그대로';
          } else {
            const vals = n.args.map(ev);
            v = callFunc(n.name, vals);
            // 데이터베이스 함수: 조건에 맞는 행과 조건 범위를 강조할 칸으로 기록
            const [dbArg, , crArg] = n.args.map(unparen);
            if (/^D(SUM|AVERAGE|COUNTA?|MAX|MIN|GET)$/.test(n.name) && dbArg && dbArg.t === 'range' && crArg && crArg.t === 'range') {
              const m = dbMatch(vals);
              if (!isErr(m)) {
                const body = cellsOf(dbArg.text).slice(1);
                n.focus = [...m.idx.flatMap((i) => body[i]), ...cellsOf(crArg.text).flat()];
                note = `조건에 맞는 행: ${m.idx.map((i) => body[i][0].replace(/\D/g, '')).join(', ') || '없음'}${m.idx.length ? '행' : ''}`;
              }
            }
          }
          if (typeof v === 'number') v = isNaN(v) ? err('#VALUE!') : isFinite(v) ? v : err('#NUM!');
          break;
        }
      }
      if (v === undefined) v = null;
      Object.assign(n, { order: done.length, value: v, note });
      done.push(n);
      return v;
    })(ast);
    return done;
  }

  // 단계 k 시점의 식: 이미 계산된 부분은 값으로, 지금 계산하는 부분은 <mark>로. 셀 참조는 색 글자로.
  function render(n, k, hl, colors) {
    if (n.t === 'ref' || n.t === 'range') return colors && colors[n.text] ? `<b class="ref" style="--c:${colors[n.text]}">${esc(n.raw)}</b>` : esc(n.raw);
    if (n.order < k) return esc(lit(n.value));
    const r = (c) => render(c, k, hl, colors);
    let s;
    switch (n.t) {
      case 'lit': s = n.v === '*' ? '*' : esc(lit(n.v)); break;
      case 'field': s = esc(`[${n.name}]`); break;
      case 'between': s = `${r(n.x)}${n.neg ? ' Not' : ''} Between ${r(n.lo)} And ${r(n.hi)}`; break;
      case 'in': s = `${r(n.x)}${n.neg ? ' Not' : ''} In (${n.list.map(r).join(', ')})`; break;
      case 'isnull': s = `${r(n.x)} Is ${n.neg ? 'Not ' : ''}Null`; break;
      case 'paren': return `(${r(n.x)})`;
      case 'neg': s = `-${r(n.x)}`; break;
      case 'not': s = `NOT ${r(n.x)}`; break;
      case 'bin': s = `${r(n.l)} ${esc(n.op)} ${r(n.r)}`; break;
      case 'call': s = `${n.name}(${n.args.map(r).join(', ')})`; break;
    }
    return hl && n.order === k ? `<mark>${s}</mark>` : s;
  }

  // ---------- 시트 ----------
  // grid: { A1: '80', E2: '=SUM(B2:D2)', ... } → 셀 값을 돌려주는 함수 (수식 셀은 재귀 계산)
  function makeSheet(grid) {
    const memo = {}, busy = new Set();
    const cell = (ref) => {
      if (ref in memo) return memo[ref];
      const raw = String(grid[ref] ?? '').trim();
      if (!raw.startsWith('=')) {
        const up = raw.toUpperCase();
        return (memo[ref] = raw === '' ? null : isFinite(raw) ? +raw : up === 'TRUE' || up === 'FALSE' ? up === 'TRUE'
          : DATE_RE.test(raw) ? toDate(raw) : raw);
      }
      if (busy.has(ref)) return err('#순환참조');
      busy.add(ref);
      let v;
      try {
        const ast = parse(raw.slice(1), 'excel');
        evaluate(ast, { cell });
        v = ast.value;
      } catch {
        v = err('#NAME?');
      }
      busy.delete(ref);
      return (memo[ref] = v);
    };
    return cell;
  }

  // ---------- Excel ----------
  function excel(src, grid = {}) {
    const body = src.trim().replace(/^=/, '');
    const ast = parse(body, 'excel');
    const nodes = evaluate(ast, { cell: makeSheet(grid) });

    // 단계마다 색 하나. 셀 참조는 그 셀을 처음 읽는 단계의 색을 따름.
    const colors = {};
    const reads = (n) => kids(n).map(unparen).filter((c) => c.t === 'ref' || c.t === 'range').map((c) => c.text);
    nodes.forEach((n, k) => {
      n.color = PALETTE[k % PALETTE.length];
      reads(n).forEach((r) => (colors[r] = colors[r] || n.color));
    });

    const text = (n) => body.slice(n.s, n.e);
    const steps = nodes.map((n, k) => ({
      label: text(n),
      html: `=${render(ast, k, true, colors)}`,
      note: esc(`${text(n)} → ${fmt(n.value)}${n.note ? ` (${n.note})` : ''}`),
      result: lit(n.value),
      color: n.color,
      op: n.t === 'call' ? n.name : n.t === 'neg' ? 'neg' : n.t === 'not' ? 'NOT' : n.op,
      active: reads(n),
      focus: n.focus, // 있으면 이 칸들만 진하게 (데이터베이스 함수의 맞는 행 + 조건 범위)
    }));
    const last = nodes[nodes.length - 1];
    steps.push({
      label: '결과',
      html: `=${esc(lit(ast.value))}`,
      note: esc(`최종 결과: ${fmt(ast.value)}`),
      final: true,
      result: fmt(ast.value),
      color: last ? last.color : PALETTE[0],
      active: [],
    });
    return { steps, result: fmt(ast.value) };
  }

  // ---------- 표시 형식 (Excel 셀 서식 · TEXT · Access Format 공용) ----------
  // 지원: 0 # , . % "문자" \문자 @ ; 구역(양수;음수;0;텍스트) [색] [조건] yyyy yy mm m dd d aaa aaaa ddd dddd > <
  const COLORS = { 빨강: '#e03131', 파랑: '#1c7ed6', 검정: '#000', 녹색: '#2f9e44', 노랑: '#f08c00', 자홍: '#c2255c', 청록: '#0c8599', 흰색: '#fff',
    red: '#e03131', blue: '#1c7ed6', black: '#000', green: '#2f9e44', yellow: '#f08c00', magenta: '#c2255c', cyan: '#0c8599', white: '#fff' };
  const NAMED = { 통화: '#,##0원', currency: '#,##0원', 백분율: '0.00%', percent: '0.00%', 표준: '#,##0.00', standard: '#,##0.00', 고정: '0.00', fixed: '0.00',
    'short date': 'yyyy-mm-dd', 'long date': 'yyyy년 m월 d일 aaaa', 'yes/no': '"Yes";"Yes";"No"' };
  function splitSections(code) {
    const out = [''];
    for (let i = 0; i < code.length; i++) {
      const c = code[i];
      if (c === '"') { const j = code.indexOf('"', i + 1); out[out.length - 1] += code.slice(i, j + 1); i = j; }
      else if (c === '\\') { out[out.length - 1] += code.slice(i, i + 2); i++; }
      else if (c === ';') out.push('');
      else out[out.length - 1] += c;
    }
    return out;
  }
  const WEEK_KO = ['일', '월', '화', '수', '목', '금', '토'];
  const WEEK_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function formatDate(s, sec) {
    const x = new Date(EPOCH + Math.floor(s) * DAY);
    const Y = x.getUTCFullYear(), M = x.getUTCMonth() + 1, D = x.getUTCDate(), W = x.getUTCDay();
    const two = (n) => String(n).padStart(2, '0');
    return sec.replace(/"([^"]*)"|\\(.)|yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d|aaaa|aaa/gi, (t, q, e) => {
      if (q !== undefined) return q;
      if (e !== undefined) return e;
      switch (t.toLowerCase()) {
        case 'yyyy': return Y;
        case 'yy': return two(Y % 100);
        case 'mmmm': return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][M - 1];
        case 'mmm': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][M - 1];
        case 'mm': return two(M);
        case 'm': return M;
        case 'dddd': return WEEK_EN[W];
        case 'ddd': return WEEK_EN[W].slice(0, 3);
        case 'dd': return two(D);
        case 'd': return D;
        case 'aaaa': return `${WEEK_KO[W]}요일`;
        case 'aaa': return WEEK_KO[W];
      }
      return t;
    });
  }
  function formatNumber(n, sec, signed) {
    let lits = '', pat = '', after = '', seen = false;
    // 리터럴(앞/뒤)과 숫자 패턴(0 # , .)을 나눔
    for (let i = 0; i < sec.length; i++) {
      const c = sec[i];
      let litc = null;
      if (c === '"') { const j = sec.indexOf('"', i + 1); litc = sec.slice(i + 1, j); i = j; }
      else if (c === '\\') { litc = sec[i + 1] || ''; i++; }
      else if (c === '_' || c === '*') { i++; litc = c === '_' ? ' ' : ''; }
      else if ('0#?'.includes(c) || ((c === ',' || c === '.') && /[0#?]/.test(sec.slice(i + 1)) && seen) || (c === '.' && /[0#?]/.test(sec.slice(i + 1)))) {
        if (after) { pat += after.replace(/./g, ''); after = ''; }
        pat += c; seen = true; continue;
      } else if (c === ',' && seen) { pat += c; continue; } // 끝 쉼표 = 천 단위 나눔
      else litc = c;
      if (seen) after += litc; else lits += litc;
    }
    if (/%/.test(lits + after)) n *= 100 ** ((lits + after).match(/%/g).length);
    const trail = (pat.match(/,+$/) || [''])[0].length;
    pat = pat.replace(/,+$/, '');
    n /= 1000 ** trail;
    const [ip, dp = ''] = pat.split('.');
    const decimals = (dp.match(/[0#?]/g) || []).length, minDec = (dp.match(/0/g) || []).length;
    const minInt = (ip.match(/0/g) || []).length;
    const a = Math.abs(n);
    let [i, d = ''] = (Math.round(+(a * 10 ** decimals).toPrecision(15)) / 10 ** decimals).toFixed(decimals).split('.');
    if (i === '0' && minInt === 0) i = '';
    i = i.padStart(minInt, '0');
    if (ip.includes(',')) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    while (d.length > minDec && d.endsWith('0')) d = d.slice(0, -1);
    const num = (pat ? i + (d ? `.${d}` : '') : '') || (pat ? '0' : '');
    return (signed && n < 0 && Math.round(a * 10 ** decimals) !== 0 ? '-' : '') + lits + num + after;
  }
  // → { text, color, section }  (section: 몇 번째 구역을 썼는지, 시각화용)
  function numFormatEx(v, code) {
    code = NAMED[String(code).toLowerCase()] || String(code);
    if (v instanceof DateVal) v = v.s;
    if (code === '' || code.toLowerCase() === 'general' || code === '일반') return { text: fmt(v), section: 0 };
    let secs = splitSections(code);
    const pickColor = (sec) => {
      let color = null;
      sec = sec.replace(/\[([^\]]+)\]/g, (m, name) => (COLORS[name.toLowerCase()] ? ((color = COLORS[name.toLowerCase()]), '') : m));
      return [sec, color];
    };
    const isText = typeof v === 'string' && !(v.trim() !== '' && isFinite(v));
    if (isText || typeof v === 'boolean' || v == null) {
      const k = secs.length >= 4 ? 3 : secs.findIndex((s) => s.includes('@'));
      const [sec, color] = pickColor(k >= 0 ? secs[k] : '@');
      const s = fmt(v);
      let text = sec.replace(/"([^"]*)"|\\(.)|@/g, (m, q, e) => (q !== undefined ? q : e !== undefined ? e : s));
      if (sec.trim() === '>') text = s.toUpperCase();
      else if (sec.trim() === '<') text = s.toLowerCase();
      return { text, color, section: k };
    }
    const n = toNum(v);
    // [>=1000] 같은 조건 구역
    const conds = secs.map((s) => /\[(<=|>=|<>|<|>|=)(-?[\d.]+)\]/.exec(s));
    let k;
    if (conds.some(Boolean)) {
      k = conds.findIndex((c) => c && CMP[c[1]](cmp(n, +c[2])));
      if (k < 0) k = conds.findIndex((c) => !c);
      if (k < 0) k = secs.length - 1;
      secs = secs.map((s) => s.replace(/\[(<=|>=|<>|<|>|=)(-?[\d.]+)\]/, ''));
    } else k = n > 0 || secs.length === 1 ? 0 : n < 0 ? (secs.length >= 2 ? 1 : 0) : secs.length >= 3 ? 2 : 0;
    const [sec, color] = pickColor(secs[k]);
    const isDate = /y|d|aaa/i.test(sec.replace(/"[^"]*"/g, '')) || /^m+$/i.test(sec.trim());
    const text = isDate ? formatDate(n, sec) : formatNumber(k === 1 && !conds.some(Boolean) ? Math.abs(n) : n, sec, k === 0 && n < 0);
    return { text, color, section: k };
  }
  const numFormat = (v, code) => numFormatEx(v, code).text;
  FUNCS.TEXT = ([v, f]) => numFormat(v, fmt(f));

  // ---------- Access 함수 ----------
  const TODAY = serial(2024, 12, 31); // 연습용 기준일: Date() = 2024-12-31
  const bankRound = (x, d = 0) => {
    const m = 10 ** d, y = +(toNum(x) * m).toPrecision(15), r = Math.round(y);
    return (Math.abs(y % 1) === 0.5 ? 2 * Math.round(y / 2) : r) / m;
  };
  const ymdOf = (v) => {
    const x = new Date(EPOCH + Math.floor(toNum(v)) * DAY);
    return [x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate()];
  };
  const unit = (iv) => fmt(iv).toLowerCase();
  const AGG = {
    SUM: (v) => (v.some((x) => x != null) ? sum(v.filter((x) => x != null).map(toNum)) : null),
    AVG: (v) => (v.some((x) => x != null) ? sum(v.filter((x) => x != null).map(toNum)) / v.filter((x) => x != null).length : null),
    COUNT: (v) => v.filter((x) => x != null).length,
    MAX: (v) => v.filter((x) => x != null).reduce((a, b) => (a == null || cmp(b, a) > 0 ? b : a), null),
    MIN: (v) => v.filter((x) => x != null).reduce((a, b) => (a == null || cmp(b, a) < 0 ? b : a), null),
    FIRST: (v) => (v.length ? v[0] : null),
    LAST: (v) => (v.length ? v[v.length - 1] : null),
  };
  const ACCESS_FUNCS = {
    IIF: ([c, a, b]) => (toBool(c) === true ? a : b),
    NZ: ([v, d = 0]) => (v == null ? d : v),
    ISNULL: ([v]) => v == null,
    FORMAT: ([v, f = '']) => (v == null ? '' : numFormat(v, fmt(f))),
    LEFT: (a) => FUNCS.LEFT(a), RIGHT: (a) => FUNCS.RIGHT(a), LEN: (a) => FUNCS.LEN(a), TRIM: (a) => FUNCS.TRIM(a),
    MID: ([s, st, n]) => (n === undefined ? fmt(s).slice(toNum(st) - 1) : fmt(s).substr(toNum(st) - 1, toNum(n))),
    INSTR: (a) => {
      const [st, s, f] = a.length >= 3 ? a : [1, ...a];
      return fmt(s).toLowerCase().indexOf(fmt(f).toLowerCase(), toNum(st) - 1) + 1;
    },
    UCASE: ([s]) => fmt(s).toUpperCase(), LCASE: ([s]) => fmt(s).toLowerCase(),
    REPLACE: ([s, f, r]) => fmt(s).split(fmt(f)).join(fmt(r)),
    VAL: ([s]) => parseFloat(fmt(s)) || 0,
    CSTR: ([v]) => fmt(v), CINT: ([v]) => bankRound(v), CLNG: ([v]) => bankRound(v),
    INT: ([x]) => Math.floor(toNum(x)), ABS: ([x]) => Math.abs(toNum(x)),
    ROUND: ([x, d = 0]) => bankRound(x, toNum(d)),
    YEAR: (a) => FUNCS.YEAR(a), MONTH: (a) => FUNCS.MONTH(a), DAY: (a) => FUNCS.DAY(a), WEEKDAY: (a) => FUNCS.WEEKDAY(a),
    DATE: () => new DateVal(TODAY), NOW: () => new DateVal(TODAY),
    DATESERIAL: ([y, m, d]) => new DateVal(serial(toNum(y), toNum(m), toNum(d))),
    DATEADD: ([iv, k, d]) => {
      const u = unit(iv), n = toNum(k);
      const months = u === 'yyyy' ? 12 * n : u === 'q' ? 3 * n : u === 'm' ? n : null;
      if (months !== null) return new DateVal(EDATE([d, months]));
      return new DateVal(toNum(d) + (u === 'ww' ? 7 * n : n));
    },
    DATEDIFF: ([iv, a, b]) => {
      const u = unit(iv), [y1, m1] = ymdOf(a), [y2, m2] = ymdOf(b);
      if (u === 'yyyy') return y2 - y1;
      if (u === 'q') return (y2 - y1) * 4 + Math.floor((m2 - 1) / 3) - Math.floor((m1 - 1) / 3);
      if (u === 'm') return (y2 - y1) * 12 + m2 - m1;
      if (u === 'ww') return Math.floor((toNum(b) - toNum(a)) / 7);
      return Math.floor(toNum(b)) - Math.floor(toNum(a));
    },
    SWITCH: (a) => {
      for (let i = 0; i + 1 < a.length; i += 2) if (toBool(a[i]) === true) return a[i + 1];
      return null;
    },
    CHOOSE: ([i, ...xs]) => xs[toNum(i) - 1] ?? null,
    // 도메인 함수: DLookup("필드 식", "테이블", "조건 문자열")
    DLOOKUP: (a, ctx) => domain(a, ctx, (v) => (v.length ? v[0] : null)),
    DSUM: (a, ctx) => domain(a, ctx, AGG.SUM),
    DAVG: (a, ctx) => domain(a, ctx, AGG.AVG),
    DCOUNT: (a, ctx) => domain(a, ctx, AGG.COUNT),
    DMAX: (a, ctx) => domain(a, ctx, AGG.MAX),
    DMIN: (a, ctx) => domain(a, ctx, AGG.MIN),
  };
  function domain([expr, dom, crit], ctx, agg) {
    const rows = tableRows(ctx.db, fmt(dom));
    const ex = parse(fmt(expr), 'access');
    const where = crit == null || fmt(crit) === '' ? null : parse(fmt(crit), 'access');
    const vals = [];
    for (const row of rows) {
      const c = { mode: 'access', row, db: ctx.db };
      if (where) { evaluate(where, c); if (toBool(where.value) !== true) continue; }
      evaluate(ex, c);
      vals.push(ex.value);
    }
    return agg(vals);
  }
  // 필드 값 찾기: [필드], [표].[필드], Me.컨트롤. 없으면 매개변수로 보고 값을 순서대로 받음.
  function fieldValue(ctx, name) {
    const row = ctx.row || {};
    const key = name.replace(/^me[.!]/i, '');
    if (key in row) return row[key];
    const k2 = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
    if (k2 !== undefined) return row[k2];
    const P = ctx.params;
    if (P) {
      if (!(name in P.map)) {
        if (!P.values.length) throw new Error(`없는 필드 또는 매개변수: [${name}]`);
        // 입력창에 친 값: 날짜·숫자 모양이면 그 형식으로 (Access와 같음)
        const raw = P.values.shift();
        P.map[name] = typeof raw === 'string' && raw.trim() !== '' && isFinite(raw) ? +raw : toCell(raw);
      }
      return P.map[name];
    }
    throw new Error(`없는 필드: [${name}]`);
  }
  const clearOrder = (n) => { n.order = undefined; kids(n).forEach(clearOrder); };
  function accessCall(n, ctx, ev) {
    if (n.name in AGG) {
      const group = ctx.group || (ctx.row ? [ctx.row] : []);
      const arg = n.args[0];
      const vals = arg && arg.t === 'lit' && arg.v === '*' ? group.map(() => 1)
        : group.map((row) => (evaluate(arg, { ...ctx, row, group: null }), arg.value));
      clearOrder(arg);
      return { v: AGG[n.name](vals), note: `${group.length}개 레코드를 모아 계산` };
    }
    const vals = n.args.map(ev);
    if (vals.some(isErr) && n.name !== 'NZ') return { v: vals.find(isErr) };
    const v = ACCESS_FUNCS[n.name](vals, ctx);
    const note = n.name === 'IIF' ? (toBool(vals[0]) === true ? '조건이 참 → 두 번째 인수' : '조건이 거짓 → 세 번째 인수')
      : /^D(LOOKUP|SUM|AVG|COUNT|MAX|MIN)$/.test(n.name) ? `"${fmt(vals[1])}"에서 조건 "${fmt(vals[2])}"에 맞는 레코드를 찾음` : undefined;
    return { v, note };
  }
  const hasAgg = (n) => (n.t === 'call' && n.name in AGG) || kids(n).some(hasAgg);

  // ---------- Access 테이블 ----------
  // db: { 테이블: { cols, rows: [[…]] } } → 레코드 객체 배열 (날짜 문자열은 날짜 값으로, 빈 문자열은 Null로)
  function tableRows(db, name) {
    const key = Object.keys(db).find((k) => k.toLowerCase() === name.replace(/^\[|\]$/g, '').toLowerCase());
    if (!key) throw new Error(`없는 테이블: ${name}`);
    const t = db[key];
    return t.rows.map((r) => Object.fromEntries(t.cols.map((c, i) => [c, toCell(r[i])])));
  }
  const toCell = (v) => (v === '' || v == null ? null : typeof v === 'string' && DATE_RE.test(v) ? new DateVal(toDate(v)) : v);
  const cellText = (v) => (v == null ? '' : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : fmt(v));

  // 표 그리기: cols = [{ key, name }], opt.cls(i) 행 클래스, opt.cell(i, key) 칸 클래스, opt.extra = { name, values }
  function grid(cols, rows, opt = {}) {
    const head = cols.map((c) => `<th>${esc(c.name)}</th>`).join('') + (opt.extra ? `<th class="extra">${esc(opt.extra.name)}</th>` : '');
    const body = rows.map((r, i) =>
      `<tr class="${opt.cls ? opt.cls(i) : ''}">${cols.map((c) => `<td class="${opt.cell ? opt.cell(i, c.key) : ''}">${opt.text ? opt.text(i, c.key, r) : esc(cellText(r[c.key]))}</td>`).join('')}${
        opt.extra ? `<td class="extra">${opt.extra.values[i]}</td>` : ''}</tr>`).join('');
    return `<table class="dbt"><tr>${head}</tr>${body}</table>`;
  }

  // ---------- SQL 절 나누기 ----------
  const CLAUSES = new Set(['SELECT', 'FROM', 'WHERE', 'HAVING', 'INTO', 'UPDATE', 'SET', 'DELETE', 'VALUES', 'TRANSFORM', 'PIVOT']);
  function splitClauses(sql) {
    const t = tokenize(sql.replace(/;\s*$/, ''));
    const marks = [];
    let depth = 0;
    for (let i = 0; i < t.length; i++) {
      const k = t[i];
      if (k.k === 'op' && k.v === '(') depth++;
      if (k.k === 'op' && k.v === ')') depth--;
      if (depth || k.k !== 'id') continue;
      const up = k.v.toUpperCase(), two = `${up} ${t[i + 1] && t[i + 1].k === 'id' ? t[i + 1].v.toUpperCase() : ''}`;
      if (two === 'GROUP BY' || two === 'ORDER BY' || two === 'INSERT INTO') { marks.push({ kw: two, at: i, from: i + 2 }); i++; }
      else if (CLAUSES.has(up)) marks.push({ kw: up, at: i, from: i + 1 });
    }
    const src = sql.replace(/;\s*$/, '');
    const out = {};
    marks.forEach((m, j) => {
      const start = t[m.from] ? t[m.from].s : src.length;
      const end = marks[j + 1] ? t[marks[j + 1].at].s : src.length;
      out[m.kw] = src.slice(start, end).trim();
    });
    return out;
  }
  // 최상위 쉼표로 나누기
  function splitTop(s) {
    const t = tokenize(s), parts = [];
    let depth = 0, start = 0;
    for (const k of t) {
      if (k.k === 'op' && k.v === '(') depth++;
      if (k.k === 'op' && k.v === ')') depth--;
      if (!depth && k.k === 'op' && k.v === ',') { parts.push(s.slice(start, k.s).trim()); start = k.e; }
    }
    parts.push(s.slice(start).trim());
    return parts.filter(Boolean);
  }
  // "식 AS 별칭" → { expr, alias }
  function selectItem(s) {
    const m = /^(.*\S)\s+AS\s+(\[[^\]]+\]|[\w가-힣]+)$/is.exec(s);
    return m ? { expr: m[1], alias: m[2].replace(/^\[|\]$/g, '') } : { expr: s, alias: null };
  }

  // ---------- FROM / JOIN ----------
  function fromRows(src, db, ctx, steps) {
    const t = tokenize(src).filter((k) => !(k.k === 'op' && (k.v === '(' || k.v === ')')));
    let i = 0;
    const name = () => {
      const k = t[i++];
      if (!k) throw new Error('FROM 뒤에 테이블 이름이 필요합니다');
      let nm = k.v, alias = k.v;
      if (t[i] && t[i].k === 'id' && t[i].v.toUpperCase() === 'AS') { i++; alias = t[i++].v; }
      else if (t[i] && (t[i].k === 'id' || t[i].k === 'field') && !/^(INNER|LEFT|RIGHT|JOIN|ON)$/i.test(t[i].v)) alias = t[i++].v;
      return { nm, alias };
    };
    const tables = [];
    const load = ({ nm, alias }) => {
      const rows = tableRows(db, nm);
      const key = Object.keys(db).find((k) => k.toLowerCase() === nm.toLowerCase());
      tables.push({ alias, cols: db[key].cols });
      return rows.map((r) => qualify(r, alias));
    };
    const qualify = (r, alias) => Object.fromEntries(Object.entries(r).flatMap(([c, v]) => [[`${alias}.${c}`, v], [c, v]]));
    let rows = load(name());
    let note = `${tables[0].alias} 테이블의 레코드 ${rows.length}개`;
    while (i < t.length) {
      let kind = 'INNER';
      const up = () => (t[i] ? t[i].v.toUpperCase() : '');
      if (/^(INNER|LEFT|RIGHT)$/.test(up())) { kind = up(); i++; }
      if (up() === 'OUTER') i++;
      if (up() !== 'JOIN') throw new Error(`FROM 절을 이해하지 못했습니다: ${t[i].v}`);
      i++;
      const right = load(name());
      if (up() !== 'ON') throw new Error('JOIN 뒤에는 ON 조건이 필요합니다');
      i++;
      const a = i;
      while (i < t.length && !/^(INNER|LEFT|RIGHT|JOIN)$/i.test(t[i].v)) i++;
      const onSrc = src.slice(t[a].s, t[i - 1].e);
      const on = parse(onSrc, 'access');
      const rightCols = tables[tables.length - 1];
      const nullRight = Object.fromEntries(rightCols.cols.flatMap((c) => [[`${rightCols.alias}.${c}`, null], [c, null]]));
      const merge = (l, r) => ({ ...r, ...l, ...Object.fromEntries(Object.entries(r).filter(([k]) => k.includes('.'))) });
      const out = [];
      const matched = new Set();
      for (const l of rows) {
        let any = false;
        right.forEach((r, j) => {
          const row = merge(l, r);
          evaluate(on, { ...ctx, row });
          if (toBool(on.value) === true) { out.push(row); any = true; matched.add(j); }
        });
        if (!any && kind === 'LEFT') out.push(merge(l, nullRight));
      }
      if (kind === 'RIGHT') {
        const nullLeft = Object.fromEntries(Object.keys(rows[0] || {}).map((k) => [k, null]));
        right.forEach((r, j) => { if (!matched.has(j)) out.push(merge(nullLeft, r)); });
      }
      note += ` → ${kind} JOIN ${rightCols.alias} ON ${onSrc}: ${out.length}개`;
      rows = out;
    }
    // 화면에 보일 열: 이름이 겹치면 "표.필드"
    const count = {};
    tables.forEach((tb) => tb.cols.forEach((c) => (count[c] = (count[c] || 0) + 1)));
    const cols = tables.flatMap((tb) => tb.cols.map((c) => ({ key: `${tb.alias}.${c}`, name: count[c] > 1 ? `${tb.alias}.${c}` : c })));
    steps.push({ label: 'FROM', note: esc(note), html: grid(cols, rows) });
    return { rows, cols, tables };
  }

  // ---------- 쿼리 실행 ----------
  // params: 매개변수 값 목록 (쿼리에 나오는 순서대로). 결과: { steps, kind, cols, rows(표시 문자열 2차원), table? }
  function accessQuery(sql, db, params = []) {
    const c = splitClauses(sql);
    const P = { values: [...params], map: {} };
    const ctx = { mode: 'access', db, params: P };
    const steps = [];
    const val = (ast, row, group) => (evaluate(ast, { ...ctx, row, group }), ast.value);
    const sub = (ast) => render(ast, 0, false); // 필드를 값으로 바꾼 식
    const whereStep = (rows, cols, src) => {
      const ast = parse(src, 'access');
      const ok = [], shown = [];
      rows.forEach((row) => {
        const v = val(ast, row);
        ok.push(toBool(v) === true);
        shown.push(`${esc(sub(ast))} → <b>${esc(cellText(v))}</b>`);
      });
      steps.push({ label: 'WHERE', note: esc(`조건 ${src}에 맞는 레코드 ${ok.filter(Boolean).length}개만 남깁니다`),
        html: grid(cols, rows, { cls: (i) => (ok[i] ? 'ok' : 'no'), extra: { name: '조건 계산', values: shown } }) });
      return rows.filter((_, i) => ok[i]);
    };
    let out;
    if (c.UPDATE !== undefined) out = runUpdate(c, db, ctx, steps, whereStep, val);
    else if (c.DELETE !== undefined) out = runDelete(c, db, ctx, steps, whereStep);
    else if (c['INSERT INTO'] !== undefined) out = runInsert(c, db, ctx, steps, whereStep, val);
    else if (c.TRANSFORM !== undefined) out = runCrosstab(c, db, ctx, steps, whereStep, val);
    else if (c.SELECT !== undefined) out = runSelect(c, db, ctx, steps, whereStep, val);
    else throw new Error('SELECT, UPDATE, DELETE, INSERT INTO, TRANSFORM 중 하나로 시작해야 합니다');
    const asked = Object.entries(P.map);
    if (asked.length) {
      steps.unshift({ label: '매개변수', note: esc(`실행하면 매개변수 입력 창이 뜹니다: ${asked.map(([k, v]) => `[${k}] → ${cellText(v)}`).join(', ')}`),
        html: `<div class="param">${asked.map(([k, v]) => `<div class="dlg"><div class="dlg-t">매개 변수 값 입력</div><div>${esc(k)}</div><div class="dlg-in">${esc(cellText(v))}</div></div>`).join('')}</div>` });
    }
    return { steps, ...out };
  }

  function runSelect(c, db, ctx, steps, whereStep, val) {
    const { rows: all, cols } = fromRows(c.FROM, db, ctx, steps);
    let rows = c.WHERE ? whereStep(all, cols, c.WHERE) : all;
    let sel = c.SELECT, top = null, distinct = false;
    const m = /^(DISTINCT\s+)?(TOP\s+(\d+)\s+)?/i.exec(sel);
    if (m[1]) distinct = true;
    if (m[3]) top = +m[3];
    sel = sel.slice(m[0].length);
    // 선택 항목: * 또는 표.* 는 열로 펼침
    const items = splitTop(sel).flatMap((s) => {
      if (s === '*') return cols.map((col) => ({ expr: `[${col.key.split('.')[0]}].[${col.key.split('.').slice(1).join('.')}]`, alias: col.name }));
      const star = /^\[?([^\].]+)\]?\.\*$/.exec(s);
      if (star) return cols.filter((col) => col.key.startsWith(`${star[1]}.`)).map((col) => ({ expr: `[${star[1]}].[${col.key.slice(star[1].length + 1)}]`, alias: col.name }));
      return [selectItem(s)];
    });
    let n = 0;
    items.forEach((it) => {
      it.ast = parse(it.expr, 'access');
      it.name = it.alias || (it.ast.t === 'field' ? it.ast.name.split('.').pop() : `식${++n}`);
    });
    const grouped = c['GROUP BY'] !== undefined || items.some((it) => hasAgg(it.ast));
    let units; // 결과 한 줄의 계산 단위: { row, group }
    if (grouped) {
      const keys = c['GROUP BY'] ? splitTop(c['GROUP BY']).map((s) => parse(s, 'access')) : [];
      const groups = new Map();
      rows.forEach((row) => {
        const k = JSON.stringify(keys.map((a) => cellText(val(a, row))));
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(row);
      });
      units = [...groups.values()].map((g) => ({ row: g[0], group: g }));
      if (!keys.length && !units.length) units = [{ row: {}, group: [] }];
      const gi = new Map();
      units.forEach((u, i) => u.group.forEach((r) => gi.set(r, i)));
      const ordered = units.flatMap((u) => u.group);
      steps.push({ label: 'GROUP BY', note: esc(keys.length ? `${c['GROUP BY']} 값이 같은 레코드끼리 묶어 그룹 ${units.length}개를 만듭니다` : '전체 레코드를 하나의 그룹으로 묶어 집계합니다'),
        html: grid(cols, ordered, { cls: (i) => `g${gi.get(ordered[i]) % 6}` }) });
      if (c.HAVING) {
        const h = parse(c.HAVING, 'access');
        const ok = units.map((u) => toBool(val(h, u.row, u.group)) === true);
        const show = units.map((u) => (val(h, u.row, u.group), `${esc(cellText(val(parse(c['GROUP BY'] ? splitTop(c['GROUP BY'])[0] : '1', 'access'), u.row)))}: ${esc(c.HAVING)} → <b>${esc(cellText(h.value))}</b>`));
        steps.push({ label: 'HAVING', note: esc(`그룹 조건 ${c.HAVING}에 맞는 그룹 ${ok.filter(Boolean).length}개만 남깁니다`),
          html: `<ul class="hv">${show.map((s, i) => `<li class="${ok[i] ? 'ok' : 'no'}">${s}</li>`).join('')}</ul>` });
        units = units.filter((_, i) => ok[i]);
      }
    } else units = rows.map((row) => ({ row, group: null }));
    // SELECT: 결과 열 계산
    let outRows = units.map((u) => ({ u, vals: items.map((it) => val(it.ast, u.row, u.group)) }));
    const outCols = items.map((it, i) => ({ key: i, name: it.name }));
    const computed = items.filter((it) => it.ast.t !== 'field');
    const sample = units[0];
    const why = computed.slice(0, 3).map((it) => (val(it.ast, sample && sample.row, sample && sample.group), `${it.name} = ${it.expr}`)).join(' / ');
    steps.push({ label: 'SELECT', note: esc(`보여줄 필드 ${items.length}개를 고릅니다${why ? ` (계산: ${why})` : ''}`),
      html: grid(outCols, outRows.map((r) => r.vals), { cell: (i, k) => (items[k].ast.t !== 'field' ? 'calc' : '') }) });
    if (distinct) {
      const seen = new Set();
      outRows = outRows.filter((r) => { const k = JSON.stringify(r.vals.map(cellText)); return seen.has(k) ? false : seen.add(k); });
      steps.push({ label: 'DISTINCT', note: esc(`중복 레코드를 없애 ${outRows.length}개`), html: grid(outCols, outRows.map((r) => r.vals)) });
    }
    if (c['ORDER BY']) {
      const keys = splitTop(c['ORDER BY']).map((s) => {
        const mm = /^(.*?)(\s+(ASC|DESC))?$/is.exec(s);
        const byName = items.findIndex((it) => it.name.toLowerCase() === mm[1].trim().replace(/^\[|\]$/g, '').toLowerCase());
        return { ast: parse(mm[1], 'access'), byName, desc: /desc/i.test(mm[3] || '') };
      });
      const keyVal = (r, k) => (k.byName >= 0 ? r.vals[k.byName] : val(k.ast, r.u.row, r.u.group));
      outRows = [...outRows].sort((a, b) => {
        for (const k of keys) { const d = cmp(keyVal(a, k), keyVal(b, k)); if (d) return k.desc ? -d : d; }
        return 0;
      });
      steps.push({ label: 'ORDER BY', note: esc(`${c['ORDER BY']} 순서로 정렬합니다`), html: grid(outCols, outRows.map((r) => r.vals)) });
    }
    if (top !== null) {
      outRows = outRows.slice(0, top);
      steps.push({ label: `TOP ${top}`, note: esc(`위에서 ${top}개만 남깁니다`), html: grid(outCols, outRows.map((r) => r.vals)) });
    }
    const result = { kind: 'select', cols: outCols.map((o) => o.name), rows: outRows.map((r) => r.vals.map(cellText)) };
    if (c.INTO) {
      const name = c.INTO.replace(/^\[|\]$/g, '');
      db[name] = { cols: result.cols, rows: outRows.map((r) => r.vals.map((v) => (v instanceof DateVal ? fmt(v) : v))) };
      steps.push({ label: 'INTO', note: esc(`결과로 새 테이블 [${name}]을 만듭니다 (테이블 만들기 쿼리)`), html: grid(outCols, outRows.map((r) => r.vals), { cls: () => 'new' }) });
      result.kind = 'make';
    }
    return result;
  }

  function tableOf(db, name) {
    const key = Object.keys(db).find((k) => k.toLowerCase() === name.replace(/^\[|\]$/g, '').toLowerCase());
    if (!key) throw new Error(`없는 테이블: ${name}`);
    return key;
  }
  const colsOf = (db, key) => db[key].cols.map((c) => ({ key: c, name: c }));
  const finalTable = (db, key) => ({ kind: 'action', table: key, cols: db[key].cols, rows: tableRows(db, key).map((r) => db[key].cols.map((c) => cellText(r[c]))) });

  function runUpdate(c, db, ctx, steps, whereStep, val) {
    const key = tableOf(db, c.UPDATE);
    const rows = tableRows(db, key), cols = colsOf(db, key);
    steps.push({ label: 'UPDATE', note: esc(`[${key}] 테이블의 레코드 ${rows.length}개`), html: grid(cols, rows) });
    const keep = c.WHERE ? new Set(whereStep(rows, cols, c.WHERE)) : new Set(rows);
    const sets = splitTop(c.SET).map((s) => {
      const i = s.indexOf('=');
      return { field: s.slice(0, i).trim().replace(/^\[|\]$/g, '').split('.').pop(), ast: parse(s.slice(i + 1), 'access') };
    });
    const changed = new Map();
    const after = rows.map((r) => {
      if (!keep.has(r)) return r;
      const nr = { ...r };
      for (const st of sets) nr[st.field] = val(st.ast, r);
      changed.set(nr, r);
      return nr;
    });
    steps.push({ label: 'SET', note: esc(`조건에 맞는 ${changed.size}개 레코드의 ${sets.map((s) => s.field).join(', ')} 값을 바꿉니다`),
      html: grid(cols, after, { cell: (i, k) => (changed.has(after[i]) && sets.some((s) => s.field === k) ? 'chg' : ''),
        text: (i, k, r) => (changed.has(r) && sets.some((s) => s.field === k) ? `<s>${esc(cellText(changed.get(r)[k]))}</s> → ${esc(cellText(r[k]))}` : esc(cellText(r[k]))) }) });
    db[key] = { ...db[key], rows: after.map((r) => db[key].cols.map((col) => (r[col] instanceof DateVal ? fmt(r[col]) : r[col]))) };
    return finalTable(db, key);
  }

  function runDelete(c, db, ctx, steps, whereStep) {
    const key = tableOf(db, c.FROM);
    const rows = tableRows(db, key), cols = colsOf(db, key);
    steps.push({ label: 'DELETE FROM', note: esc(`[${key}] 테이블의 레코드 ${rows.length}개`), html: grid(cols, rows) });
    const del = new Set(c.WHERE ? whereStep(rows, cols, c.WHERE) : rows);
    steps.push({ label: '삭제', note: esc(`조건에 맞는 ${del.size}개 레코드를 삭제합니다`), html: grid(cols, rows, { cls: (i) => (del.has(rows[i]) ? 'del' : '') }) });
    db[key] = { ...db[key], rows: db[key].rows.filter((_, i) => !del.has(rows[i])) };
    return finalTable(db, key);
  }

  function runInsert(c, db, ctx, steps, whereStep, val) {
    const m = /^(\[[^\]]+\]|[\w가-힣]+)\s*(?:\((.*)\))?\s*$/s.exec(c['INSERT INTO']);
    if (!m) throw new Error('INSERT INTO 테이블 (필드, …) 형식이어야 합니다');
    const key = tableOf(db, m[1]);
    const fields = m[2] ? splitTop(m[2]).map((f) => f.replace(/^\[|\]$/g, '')) : db[key].cols;
    let newRows;
    if (c.VALUES !== undefined) {
      const vals = splitTop(c.VALUES.replace(/^\(|\)$/g, '')).map((s) => val(parse(s, 'access'), {}));
      newRows = [vals];
    } else {
      const sub = runSelect({ ...c, 'INSERT INTO': undefined }, db, ctx, steps, whereStep, val);
      newRows = sub.rows.map((r) => r.map((v) => (v === '' ? null : isFinite(v) && v.trim() !== '' ? +v : v)));
    }
    const added = newRows.map((vals) => db[key].cols.map((col) => { const i = fields.indexOf(col); return i < 0 ? null : vals[i] instanceof DateVal ? fmt(vals[i]) : vals[i]; }));
    const before = db[key].rows.length;
    db[key] = { ...db[key], rows: [...db[key].rows, ...added] };
    steps.push({ label: 'INSERT INTO', note: esc(`[${key}] 테이블 끝에 레코드 ${added.length}개를 추가합니다 (${fields.join(', ')})`),
      html: grid(colsOf(db, key), tableRows(db, key), { cls: (i) => (i >= before ? 'new' : '') }) });
    return finalTable(db, key);
  }

  function runCrosstab(c, db, ctx, steps, whereStep, val) {
    const { rows: all, cols } = fromRows(c.FROM, db, ctx, steps);
    const rows = c.WHERE ? whereStep(all, cols, c.WHERE) : all;
    const rowKeys = splitTop(c['GROUP BY']).map((s) => ({ src: s, ast: parse(s, 'access') }));
    const pv = parse(c.PIVOT.replace(/\s+IN\s*\(.*\)\s*$/is, ''), 'access');
    const agg = parse(c.TRANSFORM, 'access');
    const colVals = [...new Set(rows.map((r) => cellText(val(pv, r))))].sort((a, b) => cmp(isFinite(a) && a !== '' ? +a : a, isFinite(b) && b !== '' ? +b : b));
    const groups = new Map();
    rows.forEach((r) => {
      const k = JSON.stringify(rowKeys.map((rk) => cellText(val(rk.ast, r))));
      if (!groups.has(k)) groups.set(k, { row: r, cells: {} });
      const cv = cellText(val(pv, r));
      (groups.get(k).cells[cv] = groups.get(k).cells[cv] || []).push(r);
    });
    steps.push({ label: 'GROUP BY + PIVOT', note: esc(`행 머리글 ${c['GROUP BY']} × 열 머리글 ${c.PIVOT} 로 칸을 나눕니다 (행 ${groups.size}개 × 열 ${colVals.length}개)`),
      html: grid(cols, rows, { cls: (i) => `g${[...groups.keys()].indexOf(JSON.stringify(rowKeys.map((rk) => cellText(val(rk.ast, rows[i]))))) % 6}` }) });
    const outCols = [...rowKeys.map((rk, i) => ({ key: `r${i}`, name: rk.src.replace(/^\[|\]$/g, '').split('.').pop() })), ...colVals.map((v) => ({ key: `c:${v}`, name: v }))];
    const out = [...groups.values()].sort((a, b) => cmp(cellText(val(rowKeys[0].ast, a.row)), cellText(val(rowKeys[0].ast, b.row)))).map((g) => {
      const o = {};
      rowKeys.forEach((rk, i) => (o[`r${i}`] = val(rk.ast, g.row)));
      colVals.forEach((v) => (o[`c:${v}`] = g.cells[v] ? val(agg, g.cells[v][0], g.cells[v]) : null));
      return o;
    });
    steps.push({ label: 'TRANSFORM', note: esc(`각 칸에 ${c.TRANSFORM} 값을 계산해 넣습니다`), html: grid(outCols, out, { cell: (i, k) => (String(k).startsWith('c:') ? 'calc' : '') }) });
    return { kind: 'select', cols: outCols.map((o) => o.name), rows: out.map((o) => outCols.map((oc) => cellText(o[oc.key]))) };
  }

  // ---------- Access 식 (계산 필드 · 컨트롤 원본) ----------
  // 첫 레코드(또는 전체 그룹)에서 식이 계산되는 순서를 단계로 보여주고, 모든 레코드 결과를 표로.
  function accessExpr(src, db, table, opt = {}) {
    const body = src.trim().replace(/^=/, '');
    const ast = parse(body, 'access');
    const rows = tableRows(db, table);
    const ctx = { mode: 'access', db, params: opt.params ? { values: [...opt.params], map: {} } : undefined };
    const agg = hasAgg(ast);
    const focus = agg ? { row: rows[0], group: rows } : { row: rows[opt.record || 0], group: null };
    const nodes = evaluate(ast, { ...ctx, ...focus });
    const text = (n) => body.slice(n.s, n.e);
    const steps = nodes.map((n, k) => ({
      label: text(n), html: `=${render(ast, k, true)}`, color: PALETTE[k % PALETTE.length],
      note: esc(`${text(n)} → ${cellText(n.value)}${n.note ? ` (${n.note})` : ''}`), op: n.t === 'call' ? n.name : n.op || n.t,
    }));
    const results = agg ? [ast.value] : rows.map((row) => (evaluate(ast, { ...ctx, row }), ast.value));
    const cols = (db[tableOf(db, table)].cols).map((c) => ({ key: c, name: c }));
    const html = agg ? `<p class="agg">레코드 ${rows.length}개 전체로 계산 → <b>${esc(cellText(ast.value))}</b></p>${grid(cols, rows)}`
      : grid(cols, rows, { cls: (i) => (i === (opt.record || 0) ? 'cur' : ''), extra: { name: opt.name || '결과', values: results.map((v) => `<b>${esc(cellText(v))}</b>`) } });
    steps.push({ label: '결과', final: true, html: `=${esc(lit(ast.value))}`, table: html, note: esc(`${agg ? '전체' : '첫 레코드'} 결과: ${cellText(ast.value)}`), color: PALETTE[nodes.length % PALETTE.length] });
    if (!nodes.length) steps[0].label = body;
    return { steps, result: results.map(cellText) };
  }

  // ---------- 유효성 검사 규칙 ----------
  // ">=0 And <=100" 처럼 왼쪽 값이 빠진 규칙에 [값]을 채워 넣음
  function ruleExpr(rule) {
    const t = tokenize(rule);
    let out = '', prevStart = true;
    for (const k of t) {
      const up = k.k === 'id' ? k.v.toUpperCase() : '';
      const isOpStart = (k.k === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(k.v)) || ['LIKE', 'BETWEEN', 'IN', 'IS'].includes(up);
      if (prevStart && isOpStart) out += '[값] ';
      out += rule.slice(k.s, k.e) + ' ';
      prevStart = (k.k === 'id' && ['AND', 'OR', 'NOT'].includes(up)) || (k.k === 'op' && k.v === '(' && !/IN\s*$/i.test(out.slice(0, -2)));
    }
    return out.trim();
  }
  function checkRule(rule, inputs) {
    const full = ruleExpr(rule);
    const ast = parse(full, 'access');
    return inputs.map((input) => {
      const v = input === '' ? null : toCell(isFinite(input) && String(input).trim() !== '' ? +input : input);
      evaluate(ast, { mode: 'access', row: { 값: v } });
      return { input, ok: ast.value === null ? true : toBool(ast.value) === true, shown: render(ast, 0, false), value: ast.value };
    });
  }

  // ---------- 입력 마스크 ----------
  // 0 숫자(필수) 9 숫자(선택) # 숫자·공백·+- L 글자(필수) ? 글자(선택) A 글자·숫자(필수) a 글자·숫자(선택) & 아무 문자(필수) C 아무 문자(선택)
  // > 이후 대문자, < 이후 소문자, \x 또는 "…" 그대로 표시, ;0 / ;1 은 저장 여부, 마지막 ;_ 는 자리 표시자
  const MASK = {
    0: [/\d/, true], 9: [/\d/, false], '#': [/[\d +-]/, false], L: [/[A-Za-z가-힣]/, true], '?': [/[A-Za-z가-힣]/, false],
    A: [/[A-Za-z가-힣\d]/, true], a: [/[A-Za-z가-힣\d]/, false], '&': [/./, true], C: [/./, false],
  };
  function applyMask(mask, input) {
    const [pat] = splitSections(mask);
    const trace = [];
    let i = 0, out = '', ok = true, kase = null;
    for (let j = 0; j < pat.length; j++) {
      const m = pat[j];
      if (m === '>' || m === '<') { kase = m; continue; }
      if (m === '\\' || m === '"') {
        const lit = m === '\\' ? pat[++j] : pat.slice(j + 1, pat.indexOf('"', j + 1));
        if (m === '"') j = pat.indexOf('"', j + 1);
        out += lit;
        if (input.slice(i, i + lit.length) === lit) i += lit.length; // 사용자가 구분 기호를 직접 쳐도 됨
        trace.push({ m: lit, ch: lit, ok: true, why: '그대로 표시' });
        continue;
      }
      if (!MASK[m]) { // - / ( ) 공백 같은 구분 기호
        out += m;
        if (input[i] === m) i++;
        trace.push({ m, ch: m, ok: true, why: '구분 기호' });
        continue;
      }
      const [re, req] = MASK[m];
      const ch = input[i];
      if (ch !== undefined && re.test(ch)) {
        const c2 = kase === '>' ? ch.toUpperCase() : kase === '<' ? ch.toLowerCase() : ch;
        out += c2; i++;
        trace.push({ m, ch: c2, ok: true, why: req ? '필수 자리 입력됨' : '선택 자리 입력됨' });
      } else if (req) {
        ok = false;
        trace.push({ m, ch: ch ?? '', ok: false, why: ch === undefined ? '필수 자리가 비었음' : `"${ch}"는 이 자리에 올 수 없음` });
        if (ch !== undefined) i++;
      } else trace.push({ m, ch: '', ok: true, why: '선택 자리 (비워도 됨)' });
    }
    if (i < input.length) { ok = false; trace.push({ m: '', ch: input.slice(i), ok: false, why: '마스크보다 입력이 김' }); }
    return { ok, out, trace };
  }

  // 이벤트 프로시저: 조건 문자열 식(예: "학과코드='" & cmb학과 & "'")을 컨트롤 값으로 계산한 뒤 그 조건으로 레코드 찾기
  function accessFilter(strExpr, controls, db, table) {
    const ast = parse(strExpr, 'access');
    const nodes = evaluate(ast, { mode: 'access', row: controls, db });
    const steps = nodes.map((n, k) => ({ label: strExpr.slice(n.s, n.e), html: render(ast, k, true), color: PALETTE[k % PALETTE.length],
      note: esc(`${strExpr.slice(n.s, n.e)} → ${cellText(n.value)}`), op: n.t === 'call' ? n.name : n.op || n.t }));
    const cond = fmt(ast.value);
    const q = accessQuery(`SELECT * FROM ${table} WHERE ${cond}`, db);
    const where = q.steps.find((s) => s.label === 'WHERE');
    steps.push({ label: '조건 적용', final: true, html: esc(`"${cond}"`), table: where ? where.html : q.steps[q.steps.length - 1].html,
      note: esc(`만들어진 조건 문자열 "${cond}"로 [${table}]을 걸러 ${q.rows.length}개 레코드를 보여줍니다`), color: PALETTE[nodes.length % PALETTE.length] });
    return { steps, cond, result: q.rows };
  }

  // 수식을 dr행 아래로 복사한 것처럼 바꿈: 행 앞에 $가 없는 참조만 행 번호가 바뀜 (문자열 안은 그대로)
  const shift = (f, dr) =>
    f.split(/("(?:[^"]|"")*")/)
      .map((part, i) => (i % 2 ? part : part.replace(/(\$?[A-Za-z]{1,3})(\$?)(\d+)(?![\w(])/g, (m, c, d, r) => c + d + (d ? r : +r + dr))))
      .join('');

  const api = { excel, accessQuery, accessExpr, accessFilter, checkRule, ruleExpr, applyMask, numFormatEx, numFormat, tableRows, makeSheet, cellsOf, colName, fmt, shift };
  if (typeof module === 'object') module.exports = api;
  else root.Engine = api;
})(this);
