/* oddz 프로젝트 카탈로그 공통 렌더러 — 6개 테마, 1개 데이터 파일 */
(()=>{
  'use strict';
  const source=window.ODDZ_PROJECTS;
  const work=document.querySelector('#work');
  if(!work||!Array.isArray(source)||source.length===0){
    console.warn('[oddz] 데이터 또는 #work 섹션이 없어 기존 표시를 유지합니다.');return;
  }
  const path=window.location.pathname;
  const selectedTheme=document.querySelector('.theme-picker [aria-current="page"]')?.dataset.themePath||'';
  const oz=!!work.querySelector('.catalog-group')&&!!document.querySelector('.postcard');
  let theme=oz?'oz':path.includes('/machine.html')||selectedTheme.endsWith('/machine.html')?'machine':path.includes('/game-water.html')||selectedTheme.endsWith('/game-water.html')?'game-water':path.includes('/game-sunset.html')||selectedTheme.endsWith('/game-sunset.html')?'game-sunset':path.includes('/bubbles.html')||selectedTheme.endsWith('/bubbles.html')?'bubbles':'sparkle';
  document.documentElement.setAttribute('data-oddz-theme',theme);
  const isSubpath=theme!=='sparkle';
  const stageDefs=[
    {key:'done',title:'완성',english:'COMPLETED',note:'만들어 공개했거나 실행할 수 있는 형태로 완성한 프로젝트'},
    {key:'doing',title:'진행 중',english:'IN PROGRESS',note:'프로토타입을 제작하거나 기능을 개선하는 프로젝트'},
    {key:'next',title:'끝나면 할 것',english:'UP NEXT',note:'다음에 착수할 후보 프로젝트'},
    {key:'someday',title:'언젠가 할 것',english:'SOMEDAY',note:'장기적으로 보관해 두고 발전시킬 아이디어'}
  ];
  const accent={sparkle:'#8fe3d0',machine:'#F5B921','game-water':'#8FE8F2','game-sunset':'#F0C97A',bubbles:'#F5A9C9',oz:'#63a995'}[theme];
  const sceneSamples=[...work.querySelectorAll('.entry[data-mood]')].map(n=>({mood:n.dataset.mood,html:n.querySelector('.entry-scene')?.innerHTML||''}));
  const mk=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined&&content!==null)n.textContent=String(content);return n};
  const urlFor=(str)=>{
    // Public project paths only; no external redirect or dynamic script URLs.
    if(typeof str!=='string'||!str.startsWith('/projects/'))return null;
    const pathOnly=str.split('?')[0];
    if(!/^\/projects\/[a-z0-9-]+\.html$/i.test(pathOnly))return null;
    const url=new URL((isSubpath?'../':'.')+pathOnly,document.baseURI);
    url.searchParams.set('theme',theme==='oz'?'oz':theme);
    return url.href;
  };
  function badge(item){
    const digits=item.no.replace('PJ ','');
    if(theme==='oz')return mk('div','number',item.no);
    if(theme==='sparkle')return mk('div','entry-no',item.no);
    if(theme==='machine')return mk('div','part-tag',item.no);
    if(theme==='bubbles')return mk('div','bubble-tag',item.no);
    if(theme==='game-water'){
      const e=mk('div','gem-tag');
      e.innerHTML='<svg viewBox="0 0 60 60" aria-hidden="true"><polygon points="30,4 50,24 30,56 10,24" fill="#8FE8F2"/></svg>';
      const label=mk('span','oddz-gem-number',digits);e.append(label);return e;
    }
    const e=mk('div','rune-tag');e.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="#D8A94A" stroke-width="6"/></svg>';
    e.append(mk('span','',digits));return e;
  }
  function makeItem(item,index){
    const card=mk('article','entry oddz-project-card'+(item.stage==='next'||item.stage==='someday'?' pending':''));
    card.id=item.id;card.dataset.stage=item.stage;
    card.dataset.search=[item.no,item.name,item.desc,item.type,...(item.tags||[])].join(' ').toLocaleLowerCase('ko-KR');
    if(oz){
      const sample=sceneSamples[index%Math.max(1,sceneSamples.length)];
      card.dataset.mood=sample?.mood||'journey';
    }
    card.append(badge(item));
    const main=mk('div',oz?'entry-main':'oddz-project-main');
    const meta=mk('div','entry-meta');
    meta.append(mk('span','entry-cat',item.type));
    if(theme==='sparkle')meta.append(mk('span','dot-sep'));
    meta.append(mk('span','entry-status',stageDefs.find(s=>s.key===item.stage).title));
    const title=mk('h3','',item.name);
    const when=mk('p','oddz-project-date',item.date||'기록 날짜 미확인');
    if(item.dateBasis)when.title='날짜 기준: '+item.dateBasis;
    const description=mk('p','oddz-project-desc',item.desc);
    main.append(meta,title,when,description);
    const lower=mk('div','oddz-project-lower');
    if(item.url){const href=urlFor(item.url);if(href){const link=mk('a',oz?'entry-link':'project-action',item.link||'프로젝트 보기');link.href=href;link.setAttribute('aria-label',item.name+' 페이지 열기');link.append(mk('span','oddz-outbound','↗'));lower.append(link)}}
    const details=mk('details','oddz-project-details');
    const summary=mk('summary','', '계획과 진행 내용');
    const dl=mk('dl','oddz-project-facts');
    for(const [label,value] of [['주요 기능',item.feat],['현재 단계',item.current],['다음 단계',item.next]]){
      if(!value)continue;
      const row=mk('div','oddz-project-fact');row.append(mk('dt','',label),mk('dd','',value));dl.append(row);
    }
    details.append(summary,dl);lower.append(details);main.append(lower);
    card.append(main);
    if(oz){
      const scene=mk('div','entry-scene');
      const sample=sceneSamples[index%Math.max(1,sceneSamples.length)];
      if(sample?.html)scene.innerHTML=sample.html;
      else scene.innerHTML='<div class="motif" aria-hidden="true"><svg viewBox="0 0 80 80"><path d="M12 60Q40 15 68 60" fill="none" stroke="currentColor" stroke-width="3"/></svg></div>';
      card.append(scene);
    }
    return card;
  }
  const container=mk('div','catalog oddz-catalog');
  container.setAttribute('aria-label','프로젝트 목록');
  const controls=mk('div','oddz-catalog-controls');
  const picker=mk('div','oddz-status-tabs');picker.setAttribute('role','group');picker.setAttribute('aria-label','프로젝트 진행 단계 필터');
  [['all','전체'],...stageDefs.map(s=>[s.key,s.title])].forEach(([k,name])=>{
    const b=mk('button','oddz-filter',name);b.type='button';b.dataset.filter=k;b.setAttribute('aria-pressed',k==='all'?'true':'false');picker.append(b);
  });
  const find=mk('label','oddz-search');
  const findText=mk('span','oddz-search-label','프로젝트 검색');
  const input=mk('input','');input.type='search';input.placeholder='프로젝트 이름이나 PJ 번호 검색';input.autocomplete='off';input.setAttribute('aria-label','프로젝트 검색');
  const counter=mk('span','oddz-visible-count','20개 프로젝트');
  find.append(findText,input);controls.append(picker,find,counter);container.append(controls);
  const groups=mk('div','oddz-project-groups');const rendered=[];
  stageDefs.forEach(st=>{
    const group=mk('section','oddz-project-stage');group.dataset.stage=st.key;
    const head=mk('div','oddz-stage-head');
    const title=mk('h3','',st.title);
    const sub=mk('span','oddz-stage-en',st.english);
    const count=mk('span','oddz-stage-count','');
    head.append(title,sub,count);group.append(head);
    group.append(mk('p','oddz-stage-intro',st.note));
    const list=mk('div','oddz-stage-list');
    source.filter(x=>x.stage===st.key).sort((a,b)=>parseInt(a.no.slice(3))-parseInt(b.no.slice(3))).forEach((x,i)=>{
      const index=source.findIndex(y=>y.id===x.id);
      const c=makeItem(x,index);list.append(c);rendered.push(c);
    });
    count.textContent=list.children.length+'개';group.append(list);groups.append(group);
  });
  container.append(groups);
  const noMatches=mk('p','oddz-no-matches','검색 결과가 없어. 다른 키워드나 PJ 번호를 입력해 줘.');noMatches.hidden=true;container.append(noMatches);
  const oldCatalog=work.querySelector(':scope > .catalog');
  if(oldCatalog)oldCatalog.replaceWith(container);
  else{
    [...work.querySelectorAll(':scope > .catalog-group')].forEach(n=>n.remove());
    work.append(container);
  }
  // Existing art direction, hero and theme selector are untouched.
  let filter='all';
  const tabs=[...container.querySelectorAll('.oddz-filter')];
  function update(){
    const q=input.value.trim().toLocaleLowerCase('ko-KR').replace(/\s+/g,' ');
    let n=0;
    rendered.forEach(card=>{
      const searchBlob=card.dataset.search;
      const show=(filter==='all'||card.dataset.stage===filter)&&(!q||searchBlob.includes(q));
      card.hidden=!show;if(show)n++;
    });
    [...groups.children].forEach(group=>{
      const count=group.querySelectorAll('.oddz-project-card:not([hidden])').length;
      group.hidden=count===0;group.querySelector('.oddz-stage-count').textContent=count+'개';
    });
    tabs.forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.filter===filter)));
    counter.textContent=n+' / '+source.length+'개';noMatches.hidden=n!==0;
  }
  picker.addEventListener('click',e=>{const tab=e.target.closest('button[data-filter]');if(!tab)return;filter=tab.dataset.filter;update()});
  input.addEventListener('input',update);update();
  work.dataset.catalogVersion='shared-v1';
})();
