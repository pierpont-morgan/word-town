(() => {
  'use strict';
  const units = window.WORD_TOWN_DATA;
  const words = units.flatMap(u => u.words);
  const byId = new Map(words.map(w => [w.id, w]));
  const KEY = 'word-town-progress-v1', POSITION = 'word-town-position-v1', DAY = 86400000;
  const $ = s => document.querySelector(s);
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons = {
    sound:'<path d="m10 5-5 4H2v6h3l5 4Z"/><path d="M14 8a6 6 0 0 1 0 8M17 5a10 10 0 0 1 0 14"/>',
    bulb:'<path d="M9 18h6m-6 3h6M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z"/><path d="M12 6a3 3 0 0 1 3 3"/>',
    book:'<path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15"/>',
    search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>',
    check:'<path d="m5 12 4 4L20 5"/><path d="M20 12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10"/>',
    pen:'<path d="m14 4 6 6M3 21l5-1L21 7a2 2 0 0 0 0-3l-1-1a2 2 0 0 0-3 0L4 16Z"/>',
    leaf:'<path d="M20 3C9 1 3 6 4 13c1 7 13 9 16-10ZM4 21 15 10"/>'
  };
  const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24">${icons[name] || icons.book}</svg>`;
  let progress = {}, storageOK = true;
  let view = 'learn', unitIndex = 0, wordIndex = 0, recall = false, revealed = false;
  let quizType = 'choice', quizScope = 'unit', quiz = null, bagFilter = 'all', query = '';
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      for (const [id, r] of Object.entries(raw)) {
        if (byId.has(id) && r && Number.isFinite(r.level) && Number.isFinite(r.due)) {
          progress[id] = {level: Math.min(3, Math.max(0, Math.floor(r.level))), due:r.due, lastPromotion:Number(r.lastPromotion)||0, seen:true};
        }
      }
    }
    const pos = JSON.parse(localStorage.getItem(POSITION) || '{}');
    if (Number.isInteger(pos.unit) && pos.unit >= 0 && pos.unit < units.length) unitIndex = pos.unit;
    if (Number.isInteger(pos.word) && pos.word >= 0 && pos.word < units[unitIndex].words.length) wordIndex = pos.word;
  } catch { progress = {}; }
  const unit = () => units[unitIndex];
  const current = () => unit().words[wordIndex];
  const atlas = u => `background-position:${((u.id - 1) % 5) * 25}% ${u.id > 5 ? 100 : 0}%`;
  const status = w => (progress[w.id]?.level || 0) >= 2 ? 'mastered' : (progress[w.id]?.level || 0) === 1 ? 'familiar' : '';
  const isDue = w => !!progress[w.id] && progress[w.id].due <= Date.now();
  const mastered = () => words.filter(w => status(w) === 'mastered').length;
  const familiar = () => words.filter(w => progress[w.id]?.level >= 1).length;
  const dueWords = () => words.filter(isDue);
  let toastTimer;
  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2800);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { storageOK = false; toast('Your browser cannot save progress. It will last for this visit only.'); }
    updateStats();
  }
  function savePosition() {
    try { localStorage.setItem(POSITION, JSON.stringify({unit:unitIndex, word:wordIndex})); } catch { /* Learning works without storage. */ }
  }
  function record(w, correct, selfReport = false) {
    const now = Date.now();
    let r = progress[w.id] || {level:0, due:now, lastPromotion:0};
    if (!correct) r = {...r, level:0, due:now};
    else if (selfReport) {
      if (r.level < 1) r = {...r, level:1, due:now + DAY, lastPromotion:now};
    } else {
      const canPromote = r.level === 0 || now - r.lastPromotion >= DAY;
      const level = Math.min(3, r.level + (canPromote ? 1 : 0));
      r = {level, lastPromotion:canPromote ? now : r.lastPromotion, due:now + [1,1,3,7][level] * DAY};
    }
    progress[w.id] = {...r, seen:true};
    save();
  }
  function updateStats() {
    const n = mastered();
    $('#mastered-count').textContent = n;
    $('#progress-ring').style.setProperty('--progress', `${n / words.length * 100}%`);
    $('.progress-summary').setAttribute('aria-label', `${n} words remembered. View progress`);
    renderSidebar();
  }
  function renderSidebar() {
    $('#unit-list').innerHTML = units.map((u,i) => {
      const n = u.words.filter(w => status(w) === 'mastered').length;
      return `<button class="unit-btn ${i === unitIndex ? 'active' : ''}" data-unit="${i}" ${i === unitIndex ? 'aria-current="true"' : ''}><span class="unit-thumb" style="${atlas(u)}" aria-hidden="true"></span><span><span class="name">${escape(u.title)}</span><span class="unit-caption">UNIT ${String(u.id).padStart(2,'0')} <span aria-hidden="true">·</span> ${n}/${u.words.length} remembered</span></span><span class="unit-arrow" aria-hidden="true">›</span></button>`;
    }).join('');
  }
  function setView(next, focus = false) {
    if (quiz && !quiz.finished && view === 'challenge' && next !== 'challenge') { quiz = null; toast('Round ended. Your answers have been saved.'); }
    view = next;
    document.querySelectorAll('.nav-link').forEach(b => {
      b.classList.toggle('active', b.dataset.view === view);
      if (b.dataset.view === view) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
    });
    render();
    if (focus) $('#main').focus({preventScroll:true});
  }
  function render() {
    if (view === 'learn') renderLearn();
    else if (view === 'challenge') quiz ? renderQuiz() : renderChallenge();
    else renderBag();
    updateStats();
  }
  function speech(text) {
    if (!('speechSynthesis' in window)) { toast('Speech is not available here. Try Chrome, Edge or Safari.'); return; }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/…/g,' '));
    const voices = speechSynthesis.getVoices();
    utterance.voice = voices.find(v => /^en-GB/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang)) || null;
    utterance.lang = utterance.voice?.lang || 'en-GB'; utterance.rate = .82;
    utterance.onerror = event => { if (!['interrupted','canceled'].includes(event.error)) toast('Audio is unavailable. Check the English voices on your device.'); };
    speechSynthesis.speak(utterance);
  }
  function moveWord(delta, markMessage = '') {
    const end = wordIndex + delta >= unit().words.length;
    wordIndex = (wordIndex + delta + unit().words.length) % unit().words.length;
    revealed = false; savePosition(); render();
    if (markMessage) toast(markMessage + (end ? ' You have explored this scene. Ready to play?' : ''));
  }
  function renderLearn() {
    const u = unit(), w = current(), hidden = recall && !revealed;
    const pins = u.pins.map(([name,x,y],idx) => {
      const p = u.words.find(item => item.word === name);
      if (!p) return '';
      return `<button class="pin ${w.id === p.id ? 'active' : ''}" style="left:${x}%;top:${y}%" data-word="${p.id}" aria-label="Explore ${escape(recall ? `Picture ${idx+1}` : p.word)}"><span aria-hidden="true">${idx + 1}</span>${w.id === p.id && !hidden ? `<span class="pin-label" aria-hidden="true">${escape(p.word)}</span>` : ''}</button>`;
    }).join('');
    $('#view').innerHTML = `
      <section aria-labelledby="scene-title"><div class="scene-heading"><div><div class="scene-kicker">SCENE ${String(u.id).padStart(2,'0')} / 10</div><h2 id="scene-title">${escape(u.title)}<span class="en-title">${escape(u.en)}</span></h2></div><div class="mode-toggle" aria-label="Learning style"><button class="${!recall?'selected':''}" data-action="explore" aria-pressed="${!recall}">Picture + word</button><button class="${recall?'selected':''}" data-action="recall" aria-pressed="${recall}">Picture only</button></div></div>
      <div class="learning-grid"><div class="scene-panel"><div class="scene-art" style="${atlas(u)}" role="group" aria-label="${escape(u.story)}"><span class="scene-label"><span aria-hidden="true">✦</span>Tap a dot. Find a word.</span>${pins}</div><div class="scene-caption">${icon('book')}<p>${escape(u.story)}</p></div></div>
      <article class="word-card" style="--scene-color:${u.color}" aria-label="Word picture"><div class="card-top"><span class="little-label">${hidden ? 'THINK & REMEMBER' : 'MY LITTLE WORD'}</span><span class="word-counter"><b>${String(wordIndex + 1).padStart(2,'0')}</b> / ${u.words.length}</span></div>${window.renderWordPicture(w)}
      ${hidden ? `<div class="reveal-box"><div class="hidden-word" aria-hidden="true">? ? ?</div><p>Look closely. Can you say it?</p><button class="primary" data-action="reveal">Reveal the word ${icon('bulb')}</button></div><p class="recall-hint">Picture it. Try saying it aloud.<br>Not sure? Take another look.</p>` : `
      <div class="word-title-row"><h3 class="word-title ${w.word.length>17?'long':''}">${escape(w.word)}</h3><button class="speak-button" data-speak="word" aria-label="Listen to ${escape(w.word)}">${icon('sound')}</button></div><div class="ipa">${escape(w.ipa)}</div>
      <div class="example-box"><p>${escape(w.example)} <button class="text-button" data-speak="example" aria-label="Listen to the sentence">${icon('sound')}</button></p></div><div class="memory-box">${icon('bulb')}<p>Look at the picture. Say the word. Act it out!</p></div>
      <div class="card-actions"><button class="secondary" data-action="forget">Not yet</button><button class="primary" data-action="remember">I know it <span aria-hidden="true">→</span></button></div>`}
      <div class="card-bottom"><span>${hidden?'Picture first. Remember next.':'Listen. Say it. Picture it.'}</span><div class="mini-nav"><button data-action="previous" aria-label="Previous word">‹</button><button data-action="next" aria-label="Next word">›</button></div></div></article></div>
      <div class="word-bank"><div class="section-header"><h3>Words in this scene<span>${u.words.length} words & phrases</span></h3><button class="text-button" data-action="start-unit">Ready to play? →</button></div><div class="word-chips">${u.words.map(item => `<button class="word-chip ${item.id === w.id ? 'selected' : ''}" data-word="${item.id}" aria-pressed="${item.id === w.id}"><span class="dot ${status(item)}" aria-hidden="true"></span>${escape(recall ? `${item.symbol} ${u.words.indexOf(item)+1}` : item.word)}${status(item)==='mastered'?'<small aria-label="remembered">✓</small>':''}</button>`).join('')}</div></div>
      <div class="tip-bar"><span>${icon('leaf')}<b>A little memory tip</b> &nbsp; ${hidden ? 'Close your eyes. Replay the picture.' : 'Step into the picture. Say the sentence.'}</span><button class="text-button" data-action="${recall?'explore':'recall'}">${recall?'Back to exploring':'Try picture only'} →</button></div>
      </section>`;
  }
  function statsHTML() { return `<div class="study-stats"><div class="stat-card"><strong>${familiar()}</strong><span>Familiar</span></div><div class="stat-card"><strong>${mastered()}</strong><span>Remembered</span></div><div class="stat-card"><strong>${dueWords().length}</strong><span>Ready to review</span></div></div>`; }
  function renderChallenge() {
    const u = unit(), due = dueWords().length;
    $('#view').innerHTML = `<section aria-labelledby="challenge-title"><div class="view-heading"><div class="eyebrow">A SMALL CHALLENGE, A BIG STEP</div><h2 id="challenge-title">Let your memory play.</h2><p>Look, remember, then try spelling. Up to 10 little challenges at a time.</p></div><div class="challenge-intro"><div class="challenge-cover" style="${atlas(u)}" role="img" aria-label="${escape(u.title)} picture scene"><div class="cover-note"><b>${escape(u.headline)}</b><p>UNIT ${u.id} · ${escape(u.en)} · ${u.words.length} words & phrases</p></div></div><div class="challenge-setup"><h3>Ready for a little adventure?</h3><p>Follow the pictures. Find the English words.</p><span class="field-label">How would you like to play?</span><div class="quiz-type"><button class="type-choice ${quizType==='choice'?'selected':''}" data-quiz-type="choice" aria-pressed="${quizType==='choice'}">${icon('check')}Picture match<small>Find its word</small></button><button class="type-choice ${quizType==='spell'?'selected':''}" data-quiz-type="spell" aria-pressed="${quizType==='spell'}">${icon('pen')}Picture spelling<small>Type what you see</small></button></div><label class="field-label" for="quiz-scope">Which words shall we explore?</label><select id="quiz-scope" class="select-field"><option value="unit" ${quizScope==='unit'?'selected':''}>This scene · ${escape(u.title)}</option><option value="due" ${quizScope==='due'?'selected':''}>Ready to review · ${due} words</option><option value="all" ${quizScope==='all'?'selected':''}>Around the town · 142 words</option></select><button class="primary wide" data-action="begin-quiz">Let’s play <span aria-hidden="true">→</span></button><p class="quiz-small">Missed a word? Meet it again. Come back tomorrow for another little step.</p></div></div>${statsHTML()}<p class="status-note">Remembered words need successful recall on different days. There is no rush.</p></section>`;
  }
  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
    return copy;
  }
  function startQuiz(retry = null) {
    const pool = retry || (quizScope==='due' ? dueWords() : quizScope==='all' ? words : unit().words);
    if (!pool.length) { toast('Nothing is due yet. Try this scene or explore the whole town.'); return; }
    const selection = shuffle(pool).sort((a,b) => Number(isDue(b))-Number(isDue(a))).slice(0,10);
    quiz = {type:quizType, index:0, answers:[], finished:false, questions:selection.map(w => ({word:w, options:shuffle([w,...shuffle(units[w.unit-1].words.filter(other => other.word !== w.word)).slice(0,3)])}))};
    setView('challenge');
  }
  function normalize(text) { return text.toLowerCase().normalize('NFKC').replace(/[’‘]/g,"'").replace(/…/g,'...').replace(/\s*\.{3}\s*/g,' ... ').trim().replace(/\s+/g,' '); }
  function sentenceClue(w) {
    const phrases = {'keep … tidy':'keep our classroom tidy','keep one’s word':'keep my word','give … back':'give the doll back'};
    const target = phrases[w.word] || w.word;
    const safe = target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re = new RegExp('\\b' + safe + '(?:s)?\\b','i');
    return re.test(w.example) ? w.example.replace(re,'_____') : `Try the word you learned in this scene. ${w.word.length} characters.`;
  }
  function answerQuiz(value) {
    if (!quiz || quiz.finished || quiz.answers.length > quiz.index) return;
    const question = quiz.questions[quiz.index], w = question.word;
    const correct = quiz.type === 'choice' ? value === w.id : normalize(value) === normalize(w.word);
    quiz.answers.push({id:w.id,correct,value});
    record(w,correct); renderQuiz();
    requestAnimationFrame(() => $('[data-action="quiz-next"]')?.focus({preventScroll:true}));
  }
  function renderQuiz() {
    if (quiz.finished) { renderResults(); return; }
    const q = quiz.questions[quiz.index], w = q.word, u = units[w.unit-1], a = quiz.answers[quiz.index];
    $('#view').innerHTML = `<section aria-labelledby="quiz-title"><div class="quiz-top"><span><b>${quiz.type==='choice'?'Picture match':'Picture spelling'}</b> <span class="muted">· ${quiz.index+1} / ${quiz.questions.length}</span></span><button class="secondary" data-action="exit-quiz">End round</button></div><div class="quiz-progress" role="progressbar" aria-label="Round progress" aria-valuemin="0" aria-valuemax="${quiz.questions.length}" aria-valuenow="${quiz.answers.length}"><span style="width:${quiz.answers.length/quiz.questions.length*100}%"></span></div><div class="quiz-grid"><div class="quiz-picture" style="${atlas(u)}" role="group" aria-label="${escape(u.title)} picture scene"><span class="scene-label">SCENE ${String(u.id).padStart(2,'0')} · ${escape(u.title)}</span><div class="quiz-prompt">${window.renderWordPicture(w)}<p>Look. Imagine. Remember.</p></div></div><div class="quiz-answer-panel"><h3 id="quiz-title">${quiz.type==='choice'?'Which word fits the picture?':'What do you see? Write it down.'}</h3><p>${quiz.type==='choice'?'Look at the picture story. Choose the word that fits.':'Picture it in your mind. Then try the spelling.'}</p>
    ${quiz.type==='choice' ? `<div class="options">${q.options.map((option,i) => `<button class="option ${a && option.id === w.id ? 'correct' : a && option.id === a.value ? 'wrong' : ''}" data-answer="${option.id}" ${a?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span>${escape(option.word)}${a && option.id === w.id ? '<span aria-label="The word">✓</span>' : ''}</button>`).join('')}</div>` : `<form id="spelling-form" class="spelling-form"><label class="sr-only" for="spelling-input">Your word</label><input id="spelling-input" class="spelling-input" type="text" aria-label="Your word" placeholder="Type the word or phrase…" autocomplete="off" autocapitalize="off" spellcheck="false" required ${a?'disabled':''} value="${a?escape(a.value):''}">${!a?'<button class="primary wide" type="submit">Check my answer →</button>':''}</form><p class="spelling-note">Use the phrase as learned. You may type ... for an ellipsis.</p>`}
    ${!a ? `<div class="quiz-clue">${q.hint ? `<p>${escape(sentenceClue(w))}</p>` : '<button class="text-button" data-action="sentence-hint">Need a sentence clue?</button>'}</div>` : ''}
    ${a ? `<div class="quiz-feedback ${!a.correct?'wrong':''}" role="status"><strong>${a.correct?'You found it!':'Let’s look at it once more.'}</strong><p>${a.correct?'A little memory made.':'The word:'} <b>${escape(w.word)}</b> <button class="text-button" data-speak-id="${w.id}" aria-label="Hear the word">${icon('sound')}</button></p><p class="memory-answer">${escape(w.example)}</p></div><button class="primary wide quiz-next" data-action="quiz-next">${quiz.index+1<quiz.questions.length?'Next picture':'See how you did'} →</button>` : ''}</div></div></section>`;
    $('#spelling-form')?.addEventListener('submit', e => { e.preventDefault(); const value=$('#spelling-input').value.trim(); if (value) answerQuiz(value); });
  }
  function renderResults() {
    const correct = quiz.answers.filter(a=>a.correct).length, missed = quiz.answers.filter(a=>!a.correct).length;
    $('#view').innerHTML = `<section class="results" aria-labelledby="results-title"><div class="result-icon" aria-hidden="true">${missed?'🌱':'🌻'}</div><div class="eyebrow">EVERY TRY HELPS YOU GROW</div><h2 id="results-title">${missed?'Your memories are growing.':'A lovely little adventure!'}</h2><p>${quiz.answers.length} picture challenges. Every try helps you grow.</p><div class="result-score">${correct}<span> / ${quiz.answers.length} correct</span></div><p>${missed?`${missed} words are ready for another look. Try them again.`:'Come back tomorrow and help these words stay.'}</p><div class="result-words">${quiz.answers.map(a=>`<span class="${a.correct?'':'wrong'}">${a.correct?'✓':'↻'} ${escape(byId.get(a.id).word)}</span>`).join('')}</div><div class="result-actions">${missed?'<button class="primary" data-action="retry">Try these again →</button>':'<button class="primary" data-action="new-quiz">Another little round →</button>'}<button class="secondary" data-view="learn">Back to exploring</button></div><p class="quiz-small">A correct answer makes a word familiar. Remember it on another day to help it stay.</p></section>`;
  }
  function filteredWords() {
    const search = query.trim().toLowerCase();
    return words.filter(w => (bagFilter==='all' || (bagFilter==='due' ? isDue(w) : bagFilter==='mastered' ? status(w)==='mastered' : !progress[w.id])) && (!search || w.word.toLowerCase().includes(search)));
  }
  function bagResultsHTML() {
    const list = filteredWords();
    return `<div class="bag-count">${list.length} words & phrases · Tap a card to revisit its scene</div><div class="bag-grid">${list.length?list.map(w=>`<button class="bag-card" data-word="${w.id}"><span class="bag-symbol" aria-hidden="true">${w.symbol}</span><span class="bag-copy"><b>${escape(w.word)}</b><small>UNIT ${w.unit} · ${escape(units[w.unit-1].title)}</small></span><span class="dot ${status(w)}" aria-label="${status(w)==='mastered'?'remembered':status(w)==='familiar'?'Familiar':'New'}"></span></button>`).join(''):`<div class="empty"><div class="empty-symbol" aria-hidden="true">🌿</div><p>${query?'No word found. Try another spelling.':bagFilter==='due'?'Nothing is due yet. Explore a scene and make some new friends.':bagFilter==='mastered'?'No remembered words yet. Explore, play, and return on another day.':'No words here yet.'}</p></div>`}</div>`;
  }
  function renderBag() {
    $('#view').innerHTML = `<section aria-labelledby="bag-title"><div class="view-heading"><div class="eyebrow">YOUR WORDS, YOUR LITTLE TREASURES</div><h2 id="bag-title">Your pocket full of words.</h2><p>Every memory grows at its own pace. Keep your favourites close.</p></div>${statsHTML()}<div class="bag-controls"><div class="search-wrap">${icon('search')}<input id="word-search" class="search-input" aria-label="Find a word" placeholder="Find a word…" value="${escape(query)}"></div><div class="bag-filters" aria-label="Filter words">${[['all','All words'],['new','New'],['due','Review'],['mastered','Remembered']].map(([key,label])=>`<button class="filter-btn ${bagFilter===key?'selected':''}" data-filter="${key}" aria-pressed="${bagFilter===key}">${label}</button>`).join('')}</div></div><div id="bag-results">${bagResultsHTML()}</div><p class="status-note">${storageOK?'Progress stays in this browser. Gold means familiar; green means remembered on different days.':'Your browser cannot save progress. It will last for this visit only.'}</p></section>`;
    $('#word-search').addEventListener('input', e => { query=e.target.value; $('#bag-results').innerHTML=bagResultsHTML(); });
  }
  document.addEventListener('change', e => { if(e.target.id === 'quiz-scope') quizScope=e.target.value; });
  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b || b.disabled) return;
    if (b.dataset.view) { setView(b.dataset.view); return; }
    if (b.dataset.unit !== undefined) {
      unitIndex=Number(b.dataset.unit); wordIndex=0; revealed=false; savePosition(); quiz=null; setView('learn'); return;
    }
    if (b.dataset.word) {
      const w=byId.get(b.dataset.word); if(!w)return;
      unitIndex=w.unit-1; wordIndex=unit().words.findIndex(x=>x.id===w.id); revealed=false; savePosition(); setView('learn'); return;
    }
    if (b.dataset.speak) { speech(current()[b.dataset.speak==='word'?'word':'example']); return; }
    if (b.dataset.speakId) { speech(byId.get(b.dataset.speakId).word); return; }
    if (b.dataset.quizType) { quizType=b.dataset.quizType; renderChallenge(); return; }
    if (b.dataset.answer) { answerQuiz(b.dataset.answer); return; }
    if (b.dataset.filter) { bagFilter=b.dataset.filter; renderBag(); return; }
    switch(b.dataset.action) {
      case 'about': $('#about-dialog').showModal(); break;
      case 'close-about': $('#about-dialog').close(); break;
      case 'explore': recall=false; revealed=false; renderLearn(); break;
      case 'recall': recall=true; revealed=false; renderLearn(); break;
      case 'reveal': revealed=true; renderLearn(); break;
      case 'previous': moveWord(-1); break;
      case 'next': moveWord(1); break;
      case 'remember': record(current(),true,true); moveWord(1,'A familiar word! Come back another day to remember it again.'); break;
      case 'forget': record(current(),false); moveWord(1,'Saved for another look. You will meet it again.'); break;
      case 'start-unit': quizScope='unit'; quiz=null; setView('challenge'); break;
      case 'begin-quiz': startQuiz(); break;
      case 'sentence-hint': quiz.questions[quiz.index].hint = true; renderQuiz(); break;
      case 'exit-quiz': quiz=null; renderChallenge(); toast('Round ended. Your answers have been saved.'); break;
      case 'quiz-next': if(quiz.index+1<quiz.questions.length) quiz.index++; else quiz.finished=true; renderQuiz(); break;
      case 'retry': { const missed=quiz.answers.filter(a=>!a.correct).map(a=>byId.get(a.id)); startQuiz(missed); break; }
      case 'new-quiz': quiz=null; renderChallenge(); break;
    }
  });
  $('.brand').addEventListener('click', e => {e.preventDefault();setView('learn');});
  $('#about-dialog').addEventListener('click', e => {if(e.target === $('#about-dialog')) {const r=e.target.getBoundingClientRect();if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom)e.target.close();}});
  render();
})();
