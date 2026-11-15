import { examples, makeStory, storyText } from './engine.js';

const $ = (id) => document.getElementById(id);
let story = null;
let variant = Math.floor(Math.random() * 3);
let busy = false;
let toastTimer;

function toast(message) {
  $('toast').textContent = message;
  $('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 2800);
}

function chooseExample(index) {
  if (busy) return;
  [$('cause').value, $('effect').value] = examples[index];
  $('form-error').hidden = true;
  $('cause').focus({ preventScroll: true });
  toast('두 사건을 골랐어요. 나비효과를 만들어보세요!');
}

document.querySelectorAll('[data-example]').forEach(button => {
  button.addEventListener('click', () => chooseExample(Number(button.dataset.example)));
});
$('random-example').addEventListener('click', () => {
  const remaining = examples.map((_, i) => i).filter(i => examples[i][0] !== $('cause').value);
  chooseExample(remaining[Math.floor(Math.random() * remaining.length)]);
});

function render(nextStory) {
  $('scenario-assumptions').textContent = nextStory.assumptions.join(' · ');
  $('mode').textContent = nextStory.genre.includes('판타지') ? '판타지 이야기' : '가상의 이야기';
  $('result-title').textContent = '그래서, 어쩔 수 없었어.';
  $('regenerate').hidden = false;
  $('regenerate').textContent = '다른 변명 ↻';
  const items = nextStory.steps.map(([title, body, because, otherwise], index) => {
    const item = document.createElement('li');
    item.style.setProperty('--step-index', index);
    const heading = document.createElement('strong');
    const paragraph = document.createElement('p');
    heading.textContent = title;
    paragraph.textContent = body;
    item.append(heading, paragraph);
    const mechanism = document.createElement('div');
    mechanism.className = 'mechanism';
    const label = document.createElement('b');
    label.textContent = '그래서';
    const explanation = document.createElement('span');
    explanation.textContent = because;
    mechanism.append(label, explanation);
    const alternative = document.createElement('details');
    alternative.className = 'counterfactual';
    const summary = document.createElement('summary');
    summary.textContent = '다른 선택이었다면?';
    const alternativeText = document.createElement('p');
    alternativeText.textContent = otherwise;
    alternative.append(summary, alternativeText);
    item.append(mechanism, alternative);
    return item;
  });
  $('chain').replaceChildren(...items);
  $('verdict').textContent = nextStory.verdict;
  $('result').hidden = false;
  $('result').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}

async function generate(event) {
  event?.preventDefault();
  if (busy) return;
  $('form-error').hidden = true;
  try {
    const nextStory = makeStory($('cause').value, $('effect').value, variant++);
    busy = true;
    $('generate').disabled = true;
    $('regenerate').disabled = true;
    const ripples = [...$('generate').querySelectorAll('.click-ripple')];
    $('generate').replaceChildren(document.createTextNode('작은 우연들을 연결하는 중…'), ...ripples);
    // A short transition for the local example engine; no network request is made.
    await new Promise(resolve => setTimeout(resolve, 450));
    story = nextStory;
    render(story);
  } catch (error) {
    $('form-error').textContent = error.message;
    $('form-error').hidden = false;
    $('form-error').scrollIntoView({ block: 'nearest' });
  } finally {
    busy = false;
    $('generate').disabled = false;
    $('regenerate').disabled = false;
    $('generate').replaceChildren(document.createTextNode('나비효과 만들기 '));
    const arrow = document.createElement('span');
    arrow.textContent = '↗';
    $('generate').append(arrow);
  }
}

$('excuse-form').addEventListener('submit', generate);
$('regenerate').addEventListener('click', () => {
  if (!story || busy) return;
  // Regenerate the displayed story, even when the draft inputs have since changed.
  const nextStory = makeStory(story.cause, story.effect, variant++);
  story = nextStory;
  render(story);
});
$('copy').addEventListener('click', async () => {
  if (!story) return;
  const text = storyText(story);
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    toast('이야기를 복사했어요. 위로가 필요한 사람에게 보내보세요.');
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('aria-label', '복사할 이야기');
    field.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:.01';
    document.body.append(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    toast(copied ? '이야기를 복사했어요.' : '복사를 완료하지 못했어요. 결과의 텍스트를 직접 선택해 주세요.');
  }
});
