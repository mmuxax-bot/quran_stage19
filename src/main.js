import './style.css';
import surahs from './data/surahs.js';

const state = {
  screen: 'home',
  quranMode: 'surahs',
  surah: 4,
  ayah: 163,
  hidden: false,
  readerDark: false,
  goal: Number(localStorage.getItem('qh_goal') || 20),
  progress: JSON.parse(localStorage.getItem('qh_progress') || '{}'),
  review: JSON.parse(localStorage.getItem('qh_review') || '{}'),
  navMode: 'page',
  page: Number(localStorage.getItem('qh_page') || 1),
  juz: Number(localStorage.getItem('qh_juz') || 1),
  hizb: Number(localStorage.getItem('qh_hizb') || 1),
  rub: Number(localStorage.getItem('qh_rub') || 1),
  qSearch: '',
  ayahSearch: '',
  jumpAyah: '',
  menuOpen: false,
  reciter: localStorage.getItem('qh_reciter') || 'Alafasy_128kbps',
  repeat: Number(localStorage.getItem('qh_repeat') || 1),
  speed: Number(localStorage.getItem('qh_speed') || 1),
  audioPlaying: false,
  audioTime: 0,
  audioDuration: 0,
  reviewSession: false,
  reviewKey: null,
  exam: { active:false, index:0, score:0, questions:[], selected:null, finished:false },
  examHistory: JSON.parse(localStorage.getItem('qh_exam_history') || '[]'),
  activity: JSON.parse(localStorage.getItem('qh_activity') || '{}'),
  statsMonth: new Date().toISOString().slice(0,7),
  showTranslation: localStorage.getItem('qh_show_translation') === '1',
  fontSize: Number(localStorage.getItem('qh_font_size') || 30),
  lineHeight: Number(localStorage.getItem('qh_line_height') || 1.9),
  translation: localStorage.getItem('qh_translation') || 'az',
  reminderEnabled: localStorage.getItem('qh_reminder_enabled') === '1',
  reminderTime: localStorage.getItem('qh_reminder_time') || '20:00',
  reminderReview: localStorage.getItem('qh_reminder_review') !== '0',
  voiceLang: localStorage.getItem('qh_voice_lang') || 'ar-SA',
  voiceListening: false,
  voiceText: '',
  voiceScore: null,
  voiceFeedback: '',
};

let quran = [];
let quranSourceReady = false;
let audio = null;

const $ = (s) => document.querySelector(s);
const save = () => {
  localStorage.setItem('qh_progress', JSON.stringify(state.progress));
  localStorage.setItem('qh_review', JSON.stringify(state.review));
  localStorage.setItem('qh_goal', String(state.goal));
  localStorage.setItem('qh_page', String(state.page));
  localStorage.setItem('qh_juz', String(state.juz));
  localStorage.setItem('qh_hizb', String(state.hizb));
  localStorage.setItem('qh_rub', String(state.rub));
  localStorage.setItem('qh_exam_history', JSON.stringify(state.examHistory));
  localStorage.setItem('qh_activity', JSON.stringify(state.activity));
  localStorage.setItem('qh_show_translation', state.showTranslation ? '1' : '0');
  localStorage.setItem('qh_font_size', String(state.fontSize));
  localStorage.setItem('qh_line_height', String(state.lineHeight));
  localStorage.setItem('qh_translation', state.translation);
  localStorage.setItem('qh_reminder_enabled', state.reminderEnabled ? '1' : '0');
  localStorage.setItem('qh_reminder_time', state.reminderTime);
  localStorage.setItem('qh_reminder_review', state.reminderReview ? '1' : '0');
};

function normalizeQuran(raw) {
  const list = Array.isArray(raw) ? raw : (raw.surahs || raw.data || []);
  return list.map((s, i) => ({
    number: Number(s.number || s.id || i + 1),
    name: s.name_arabic || s.name || s.arabic || surahs[i]?.ar || '',
    transliteration: s.name_transliteration || s.transliteration || s.en || surahs[i]?.en || '',
    verses: (s.ayahs || s.verses || []).map((v, j) => ({
      number: Number(v.number || v.number?.inSurah || v.verse || j + 1),
      text: v.text || v.arabic || v.content || v.text_uthmani || '',
      page: Number(v.page || 0),
      juz: Number(v.juz || 0),
      hizb: Number(v.hizb || 0),
      hizbQuarter: Number(v.hizb_quarter || v.hizbQuarter || 0),
      rub: Number(v.rub || 0),
      translations: v.translations || v.translation || v.translations_az || {},
    })),
  }));
}

async function loadQuran() {
  try {
    const res = await fetch('/data/quran.json', { cache: 'force-cache' });
    if (!res.ok) throw new Error('Quran data not found');
    const raw = await res.json();
    quran = normalizeQuran(raw);
    quranSourceReady = quran.length === 114 && quran.reduce((n, s) => n + s.verses.length, 0) === 6236;
  } catch {
    quran = [];
    quranSourceReady = false;
  }
}

function currentSurah() { return quran?.[state.surah - 1] || null; }
function currentVerse() { return currentSurah()?.verses?.find(v => v.number === state.ayah) || null; }
function quranReady() { return quranSourceReady; }
function surahMeta(n) { return surahs[n - 1]; }
function esc(s='') { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function selectSurah(n, openReader = true) {
  state.surah = Math.max(1, Math.min(114, Number(n)));
  state.ayah = 1;
  state.hidden = false;
  state.quranMode = openReader ? 'ayahs' : 'surahs';
  state.qSearch = '';
  state.ayahSearch = '';
  render();
}

function header() {
  const meta = surahMeta(state.surah);
  const s = currentSurah();
  return `<header class="topbar">
    <button class="icon-btn" id="menu" aria-label="Menyu">☰</button>
    <button class="surah-chip" id="surahPicker"><b>${esc(meta?.en || s?.transliteration || 'Quran')}</b><small>${state.quranMode === 'reader' ? `Ayə ${state.ayah} / ${meta?.ayahs || 0}` : '114 surə'}</small></button>
    <div class="top-actions"><button class="icon-btn" id="searchBtn">⌕</button><button class="icon-btn" id="settingsBtn">⚙</button></div>
  </header>`;
}

function translationText(v) {
  if (!state.showTranslation || !v) return '';
  const t = v.translations;
  if (typeof t === 'string') return t;
  if (t && typeof t === 'object') return t[state.translation] || t.az || t.azerbaijani || t.aze || '';
  return v.translation_az || v.azerbaijani || '';
}
function readerVerse(v, i) {
  const text = state.hidden ? '۞  ۞  ۞  ۞  ۞' : (v?.text || '');
  const tr = translationText(v);
  return `<div class="verse-wrap"><p class="quran-text ${v?.number === state.ayah ? 'active-ayah' : ''}" data-ayah="${v?.number || i + 1}">${esc(text)} <span class="ayah-mark">${v?.number || i + 1}</span></p>${tr ? `<p class="translation" dir="ltr">${esc(tr)}</p>` : (state.showTranslation ? `<p class="translation missing" dir="ltr">Azərbaycan dilində tərcümə məlumatı əlavə edilməyib.</p>` : '')}</div>`;
}

function quranReader() {
  const s = currentSurah();
  const meta = surahMeta(state.surah);
  const verses = s?.verses || [];
  const start = Math.max(0, (state.ayah || 1) - 1);
  const visible = verses.length ? verses.slice(start, start + 5) : [];
  return `<section class="reader ${state.readerDark ? 'reader-dark' : 'reader-light'}" style="--q-font:${state.fontSize}px;--q-line:${state.lineHeight};">
    <div class="reader-head"><button id="backToSurahs">← Surələr</button><div><b>${esc(meta?.ar || s?.name || '')}</b><small>${esc(meta?.en || s?.transliteration || '')} • ${meta?.ayahs || verses.length} ayə</small></div><button id="readerTheme">${state.readerDark ? '☀' : '☾'}</button></div>
    <div class="mushaf-page" dir="rtl">
      <div class="bismillah">${state.surah === 9 ? '' : 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}</div>
      ${visible.length ? visible.map((v,i)=>readerVerse(v,i)).join('') : `<div class="data-needed"><b>Quran məlumatı hazır deyil.</b><span>Bu ekran tam 6236 ayəlik paket hazır olduqda real ayələri göstərəcək.</span></div>`}
    </div>
    <div class="ayah-toolbar"><button id="prevAyah">‹</button><label>Ayə <input id="jumpAyah" inputmode="numeric" value="${state.ayah}" min="1" max="${meta?.ayahs || 1}"></label><button id="nextAyah">›</button></div>
    <div class="audio-player">
      <div class="audio-top"><b>Qiraət</b><span>${state.audioPlaying ? '▶ Dinlənilir' : 'Hazır'}</span></div>
      <input id="audioProgress" type="range" min="0" max="100" value="${state.audioDuration ? (state.audioTime/state.audioDuration*100) : 0}">
      <div class="audio-times"><span id="audioTime">${formatTime(state.audioTime)}</span><span>${formatTime(state.audioDuration)}</span></div>
      <div class="audio-buttons"><button id="audioPrev">↶</button><button class="play" id="audioBtn">${state.audioPlaying ? 'Ⅱ' : '▶'}</button><button id="audioNext">↷</button></div>
      <div class="audio-options"><label>Qari<select id="reciter"><option value="Alafasy_128kbps" ${state.reciter==='Alafasy_128kbps'?'selected':''}>Mishary Alafasy</option><option value="Abdul_Basit_Murattal_192kbps" ${state.reciter==='Abdul_Basit_Murattal_192kbps'?'selected':''}>Abdul Basit Murattal</option><option value="Husary_128kbps" ${state.reciter==='Husary_128kbps'?'selected':''}>Mahmoud Khalil Al-Husary</option></select></label><label>Təkrar<select id="repeat"><option value="1" ${state.repeat===1?'selected':''}>1 dəfə</option><option value="3" ${state.repeat===3?'selected':''}>3 dəfə</option><option value="5" ${state.repeat===5?'selected':''}>5 dəfə</option><option value="-1" ${state.repeat===-1?'selected':''}>Davamlı</option></select></label><label>Sürət<select id="speed"><option value="0.75" ${state.speed===0.75?'selected':''}>0.75×</option><option value="1" ${state.speed===1?'selected':''}>1×</option><option value="1.25" ${state.speed===1.25?'selected':''}>1.25×</option></select></label></div>
    </div>
    <div class="reader-controls"><button id="hideBtn"><span>${state.hidden ? '👁' : '◉'}</span>${state.hidden ? 'Göstər' : 'Gizlə'}</button><button id="translateBtn"><span>▣</span>Tərcümə</button><button id="saveBtn"><span>🔖</span>Yadda saxla</button></div>
  </section>`;
}

function surahList() {
  const query = state.qSearch.trim().toLowerCase();
  const filtered = surahs.filter(s => `${s.id} ${s.ar} ${s.en}`.toLowerCase().includes(query));
  return `<section class="surah-browser">
    <div class="browser-head"><div><small>QURAN</small><h1>Surələr</h1></div><span>${filtered.length} / 114</span></div>
    <input class="search" id="qsearch" placeholder="Surə nömrəsi və ya adı axtar..." value="${esc(state.qSearch)}">
    <div class="surah-list">${filtered.map(s=>`<button class="surah-row" data-surah="${s.id}"><span class="surah-num">${s.id}</span><span class="surah-name"><b>${esc(s.ar)}</b><small>${esc(s.en)}</small></span><span class="surah-count">${s.ayahs} ayə</span><span class="chev">›</span></button>`).join('')}</div>
  </section>`;
}

function ayahList() {
  const s = currentSurah();
  const meta = surahMeta(state.surah);
  if (!s) return `<div class="panel empty"><h2>${esc(meta?.ar || '')}</h2><p>Ayə məlumatı build mərhələsində əlavə olunacaq.</p></div>`;
  const query = state.ayahSearch.trim();
  const list = s.verses.filter(v => !query || String(v.number) === query || v.text.includes(query)).slice(0, 300);
  return `<section class="ayah-browser"><button class="back-link" id="backToSurahs">← Bütün surələr</button><div class="browser-head"><div><small>${esc(meta?.en || '')}</small><h1>${esc(meta?.ar || s.name)}</h1></div><span>${s.verses.length} ayə</span></div>
    <div class="ayah-search-row"><input class="search" id="ayahSearch" placeholder="Ayə nömrəsi və ya söz..." value="${esc(state.ayahSearch)}"><button id="openReader">Oxu</button></div>
    <div class="ayah-list">${list.map(v=>`<button class="ayah-row" data-ayah="${v.number}"><span class="ayah-no">${v.number}</span><span dir="rtl">${esc(v.text)}</span></button>`).join('')}</div></section>`;
}

function verseForLocation(kind, value) {
  if (!quranSourceReady) return null;
  for (const s of quran) {
    const v = s.verses.find(x => {
      if (kind === 'page') return x.page === value;
      if (kind === 'juz') return x.juz === value;
      if (kind === 'hizb') return x.hizb === value;
      if (kind === 'rub') return x.rub === value;
      return false;
    });
    if (v) return { surah: s.number, ayah: v.number };
  }
  return null;
}

function navigationPanel() {
  const labels = { page: 'Səhifə', juz: 'Cüz', hizb: 'Hizb', rub: 'Rub' };
  const max = { page: 604, juz: 30, hizb: 60, rub: 240 }[state.navMode];
  const current = { page: state.page, juz: state.juz, hizb: state.hizb, rub: state.rub }[state.navMode];
  const start = Math.max(1, Math.min(Math.max(1, max - 11), current - 5));
  const location = verseForLocation(state.navMode, current);
  return `<section class="nav-panel">
    <div class="nav-title"><div><small>NAVİQASİYA</small><h2>Mushaf bölmələri</h2></div><span>${quranSourceReady ? 'Real metadata' : 'Metadata gözlənilir'}</span></div>
    <div class="segmented">${Object.entries(labels).map(([k,t])=>`<button class="${state.navMode===k?'active':''}" data-navmode="${k}">${t}</button>`).join('')}</div>
    <div class="nav-current"><b>${labels[state.navMode]} ${current}</b>${location ? `<span>→ ${surahMeta(location.surah)?.ar || ''} • Ayə ${location.ayah}</span>` : `<span>Seçim etdikdə uyğun ayəyə keçid hazırlanır.</span>`}</div>
    <div class="nav-grid">${Array.from({length:12},(_,i)=>{const n=Math.min(max,start+i);return `<button data-navvalue="${n}"><b>${n}</b><small>${labels[state.navMode]}</small></button>`}).join('')}</div>
    <div class="nav-jump"><label>${labels[state.navMode]} nömrəsi<input id="navJump" inputmode="numeric" min="1" max="${max}" value="${current}"></label><button id="navJumpBtn">Keç</button></div>
  </section>`;
}

async function notificationBridge(){
  try {
    const mod = await import('@capacitor/local-notifications');
    return mod.LocalNotifications;
  } catch {
    return null;
  }
}

async function requestNotificationPermission(){
  const LN = await notificationBridge();
  if (LN) {
    const p = await LN.requestPermissions();
    return p.display === 'granted';
  }
  if ('Notification' in window) {
    const p = await Notification.requestPermission();
    return p === 'granted';
  }
  return false;
}

async function scheduleDailyReminder(){
  if (!state.reminderEnabled) return;
  const [hour, minute] = state.reminderTime.split(':').map(Number);
  const LN = await notificationBridge();
  if (LN) {
    try {
      await LN.cancel({notifications:[{id:9001},{id:9002}]});
      await LN.schedule({notifications:[
        {id:9001,title:'Quran Hifz',body:`Bugünkü hifz hədəfin: ${state.goal} ayə.`,schedule:{on:{hour,minute},repeats:true,allowWhileIdle:true}},
        ...(state.reminderReview ? [{id:9002,title:'Quran Hifz — Təkrar',body:'Bu gün gözləyən ayələrin varsa, təkrar vaxtıdır.',schedule:{on:{hour:Math.min(23,hour+1),minute},repeats:true,allowWhileIdle:true}}] : [])
      ]});
      return true;
    } catch {}
  }
  return false;
}

async function configureNotifications(){
  const granted = await requestNotificationPermission();
  if (!granted) { alert('Bildiriş icazəsi verilmədi. Telefonun tətbiq ayarlarından bildirişləri aktiv edə bilərsən.'); return; }
  state.reminderEnabled = true;
  save();
  await scheduleDailyReminder();
  render();
}

async function disableNotifications(){
  const LN = await notificationBridge();
  if (LN) { try { await LN.cancel({notifications:[{id:9001},{id:9002}]}); } catch {} }
  state.reminderEnabled = false;
  save();
  render();
}


function normalizeArabicText(text='') {
  return String(text)
    .replace(/[ًٌٍَُِّْـٰٱأإآ]/g, m => ({'َّ':'','ً':'','ُ':'','ٌ':'','ِ':'','ٍ':'','ْ':'','ـ':'','ٰ':'','ٱ':'ا','أ':'ا','إ':'ا','آ':'ا'}[m] ?? ''))
    .replace(/[إأٱآ]/g,'ا')
    .replace(/ى/g,'ي').replace(/ة/g,'ه')
    .replace(/[^\u0621-\u063A\u0641-\u064A\s]/g,' ')
    .replace(/\s+/g,' ').trim();
}
function levenshtein(a,b){
  const prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const cur=[i];
    for(let j=1;j<=b.length;j++) cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
    for(let j=0;j<=b.length;j++) prev[j]=cur[j];
  }
  return prev[b.length];
}
function compareRecitation(target, spoken){
  const a=normalizeArabicText(target), b=normalizeArabicText(spoken);
  if(!a || !b) return {score:0, matched:0, missing: a.split(' ').filter(Boolean), extra:b.split(' ').filter(Boolean)};
  const aw=a.split(' '), bw=b.split(' ');
  const distance=levenshtein(a,b);
  const score=Math.max(0,Math.min(100,Math.round((1-distance/Math.max(a.length,b.length))*100)));
  const missing=aw.filter((w,i)=>!bw.includes(w) || Math.abs(bw.indexOf(w)-i)>3).slice(0,8);
  const extra=bw.filter(w=>!aw.includes(w)).slice(0,8);
  return {score,matched:Math.max(0,aw.length-missing.length),missing,extra};
}
function voiceCheckPanel(){
  const v=currentVerse();
  const supported=!!(window.SpeechRecognition||window.webkitSpeechRecognition);
  return `<section class="panel voice-panel"><div class="eyebrow">SƏSLƏ HİFZ YOXLAMASI</div><h2>Ayə ${state.ayah} — öz əzbərini oxu</h2><p class="muted">Məqsəd: ayəni Qurandan baxmadan ərəb dilində oxu. Sistem eşitdiyi mətni ayənin yazısı ilə müqayisə edir.</p><div class="voice-target" dir="rtl">${state.hidden?'Ayə gizlidir — əzbərdən oxu.':esc(v?.text||'')}</div><div class="voice-actions"><button id="voiceStart" ${supported?'':'disabled'}>${state.voiceListening?'⏹ Dayandır':'🎙 Başla'}</button><button id="voiceReveal">${state.hidden?'👁 Ayəni göstər':'🙈 Ayəni gizlət'}</button><button id="voiceClear">Təmizlə</button></div><div class="voice-status">${supported?(state.voiceListening?'🔴 Dinləyir... danışmağa başla':'🎤 Hazırdır'):'Bu cihaz/brauzer Speech Recognition API-ni dəstəkləmir.'}</div><textarea id="voiceText" dir="rtl" placeholder="Səs tanındıqdan sonra burada görünəcək...">${esc(state.voiceText)}</textarea>${state.voiceScore!==null?`<div class="voice-result"><div class="voice-score"><b>${state.voiceScore}%</b><span>uyğunluq</span></div><div><b>${state.voiceFeedback}</b><small>${state.voiceMissing?.length?`Çatışan sözlər: ${esc(state.voiceMissing.join(' • '))}`:''}${state.voiceExtra?.length?` Artıq sözlər: ${esc(state.voiceExtra.join(' • '))}`:''}</small></div></div>`:''}<div class="info-box">Səs yoxlaması cihazın nitqdən-mətnə çevirmə imkanından istifadə edir. Diqqət: bu funksiya təcvid, məxaric və tam qiraət elmini yox, yalnız tanınan mətnin ayə ilə sözbəsöz yaxınlığını qiymətləndirir.</div></section>`;
}
function settingsScreen() {
  const today=state.activity[todayKey()]||{};
  const due=dueKeys().length;
  const remaining=Math.max(0,state.goal-(today.total||0));
  return `<section class="panel settings-panel">
    <div class="eyebrow">AYARLAR</div><h2>Quran görünüşü</h2>
    <div class="setting-row"><div><b>Gündüz / gecə rejimi</b><small>Quran yazısının rəng mövzusunu ayrıca dəyişir.</small></div><button id="themeSetting">${state.readerDark ? '☀ Gündüz' : '☾ Gecə'}</button></div>
    <div class="setting-row"><div><b>Tərcüməni göstər</b><small>Quran məlumatında tərcümə olduqda ayənin altında göstərilir.</small></div><button id="translationToggle">${state.showTranslation ? 'Açıq' : 'Bağlı'}</button></div>
    <div class="setting-row"><div><b>Tərcümə dili</b><small>Hazırda Azərbaycan dili seçilib.</small></div><select id="translationLang"><option value="az" ${state.translation==='az'?'selected':''}>Azərbaycan</option></select></div>
    <div class="setting-row range-row"><div><b>Ərəb mətninin ölçüsü</b><small>${state.fontSize}px</small></div><input id="fontSize" type="range" min="22" max="48" value="${state.fontSize}"></div>
    <div class="setting-row range-row"><div><b>Sətir aralığı</b><small>${state.lineHeight}</small></div><input id="lineHeight" type="range" min="1.4" max="2.5" step="0.1" value="${state.lineHeight}"></div>
    <div class="info-box">Quran yazı üslubu və gündüz/gecə mövzusu bir-birindən ayrıdır. Tərcümə yalnız məlumat paketində mövcud olduqda real mətn kimi göstərilir.</div>
    <div class="eyebrow settings-sub">GÜNDƏLİK HİFZ PLANI</div>
    <div class="plan-card"><div><b>${today.total||0} / ${state.goal} ayə</b><small>Bu gün • ${remaining} ayə qalıb</small></div><div class="plan-bar"><i style="width:${Math.min(100,Math.round((today.total||0)/state.goal*100))}%"></i></div><span>${due} ayə təkrara hazırdır</span></div>
    <div class="setting-row"><div><b>Gündəlik bildiriş</b><small>Hər gün hifz vaxtında xatırlatma.</small></div>${state.reminderEnabled?'<button id="disableReminder">Söndür</button>':'<button id="enableReminder">Aktiv et</button>'}</div>
    <div class="setting-row"><div><b>Bildiriş vaxtı</b><small>${state.reminderEnabled?'Aktivdir':'Əvvəlcə bildirişi aktiv et'}</small></div><input id="reminderTime" type="time" value="${state.reminderTime}"></div>
    <div class="setting-row"><div><b>Təkrar xatırlatması</b><small>Gözləyən ayələr üçün ayrıca xatırlatma.</small></div><button id="reviewReminder">${state.reminderReview?'Açıq':'Bağlı'}</button></div>
    <div class="info-box">Android-də real gündəlik bildiriş üçün tətbiq bildiriş icazəsi istəyəcək. Brauzer rejimində isə sistem dəstəyi varsa istifadə olunur.</div>
  </section>`;
}
function quranScreen() {
  if (state.quranMode === 'reader') return quranReader();
  if (state.quranMode === 'ayahs') return ayahList();
  return `${surahList()}${navigationPanel()}`;
}

function home() {
  const mastered = Object.values(state.progress).filter(x=>x?.mastered).length;
  const due = Object.values(state.review).filter(x => new Date(x.next || 0) <= new Date()).length;
  return `<section class="home-card"><small>Quran Hifz</small><h1>Əzbərini möhkəmləndir</h1><div class="goal-line"><b>${Math.min(state.goal, mastered)} / ${state.goal}</b><span>gündəlik hədəf</span></div><div class="progress"><i style="width:${Math.min(100, mastered/state.goal*100)}%"></i></div></section><div class="feature-grid"><button data-screen="quran">📖<b>Quran oxu</b><small>114 surə • ayələr</small></button><button data-screen="hifz">🧠<b>Hifz</b><small>Əzbərlə və təkrar et</small></button><button data-screen="review">🔁<b>Təkrar</b><small>${due} ayə gözləyir</small></button><button data-screen="stats">📊<b>Statistika</b><small>İrəliləyişini gör</small></button><button data-screen="exam">✎<b>Hifz testi</b><small>Əzbərini yoxla</small></button></div>`;
}

function hifz() {
  const s = currentSurah(); const v = currentVerse();
  const meta = surahMeta(state.surah);
  return `<section class="panel hifz-panel"><div class="eyebrow">HİFZ SESSİYASI</div><h2>${esc(meta?.ar || '')} • Ayə ${state.ayah}</h2><div class="hifz-verse" dir="rtl">${state.hidden ? '۞ ۞ ۞ ۞' : esc(v?.text || '')}</div><div class="actions"><button id="hideBtn">${state.hidden?'👁 Göstər':'◉ Ayəni gizlət'}</button><button id="audioBtn">🔊 Dinlə</button><button id="voiceBtn">🎙 Səslə yoxla</button><button id="goodBtn">✓ Əzbərlədim</button><button id="reviewCurrent">🔁 Təkrara əlavə et</button></div><div class="pager"><button id="prev">←</button><span>${state.ayah} / ${meta?.ayahs || s?.verses?.length || 0}</span><button id="next">→</button></div></section>`;
}

function reviewCard(key){
  const [s,a]=key.split(':').map(Number);
  const text=quran?.[s-1]?.verses?.find(x=>x.number===a)?.text||'';
  const item=state.review[key]||{};
  const level=Number(item.level||0);
  const interval=Number(item.interval||0);
  const due=item.next?new Date(item.next):new Date();
  const dueText=item.next?(due<=new Date()?'İndi':due.toLocaleDateString('az-AZ')):'Yeni ayə';
  return `<section class="panel review-card"><div class="eyebrow">AĞILLI TƏKRAR</div><div class="review-head"><div><h2>${esc(surahMeta(s)?.ar||'')} • Ayə ${a}</h2><small>Səviyyə ${level} • ${interval?interval+' gün interval':'yeni'} • Növbəti: ${dueText}</small></div><button id="reviewExit">×</button></div><div class="hifz-verse review-verse" dir="rtl">${state.hidden?'۞ ۞ ۞ ۞ ۞':esc(text)}</div><div class="review-actions"><button id="showReview">${state.hidden?'👁 Göstər':'◉ Gizlət'}</button></div><div class="rating-grid"><button data-rate="again"><b>Yenidən</b><small>Çox çətin • 10 dəq</small></button><button data-rate="hard"><b>Çətin</b><small>1 gün</small></button><button data-rate="good"><b>Yaxşı</b><small>Interval artır</small></button><button data-rate="easy"><b>Asan</b><small>Uzun interval</small></button></div><div class="review-footer"><button id="reviewPrev">← Əvvəlki</button><button id="reviewNext">Növbəti →</button></div></section>`;
}

function dueKeys(){
  const now=Date.now();
  return Object.entries(state.review).filter(([,x])=>!x.next||new Date(x.next).getTime()<=now).sort((a,b)=>new Date(a[1].next||0)-new Date(b[1].next||0)).map(([k])=>k);
}

function review(){
  const due=dueKeys();
  if(!due.length && !state.reviewKey) return `<section class="panel empty"><div class="empty-icon">✓</div><h2>Təkrar hazırdır</h2><p>Hazırda gözləyən ayə yoxdur.</p><button id="startNewReview">+ Yeni ayə əlavə et</button></section>`;
  if(!state.reviewKey) state.reviewKey=due[0]||`${state.surah}:${state.ayah}`;
  const [s,a]=state.reviewKey.split(':').map(Number); state.surah=s;state.ayah=a;state.hidden=true;
  return reviewCard(state.reviewKey);
}

function addCurrentToReview(){
  const key=`${state.surah}:${state.ayah}`;
  if(!state.review[key]) state.review[key]={level:0,interval:0,next:new Date().toISOString(),repetitions:0,lapses:0};
  state.reviewKey=key; state.screen='review'; state.hidden=true; save(); render();
}

function rateSmart(type){
  const key=state.reviewKey||`${state.surah}:${state.ayah}`;
  const old=state.review[key]||{level:0,interval:0,repetitions:0,lapses:0};
  let level=Number(old.level||0), interval=Number(old.interval||0), minutes=null;
  if(type==='again'){
    level=Math.max(0,level-1); interval=0; minutes=10; old.lapses=(old.lapses||0)+1;
  } else if(type==='hard'){
    level=Math.max(1,level); interval=interval?Math.max(1,Math.round(interval*1.2)):1;
  } else if(type==='good'){
    level=Math.min(8,level+1); interval=interval?Math.min(180,Math.max(1,Math.round(interval*2.2))):1;
  } else if(type==='easy'){
    level=Math.min(8,level+1); interval=interval?Math.min(365,Math.max(2,Math.round(interval*3.5))):4;
  }
  old.level=level; old.interval=interval; old.repetitions=(old.repetitions||0)+1;
  old.lastRating=type;
  old.next=new Date(Date.now()+(minutes?minutes*60000:interval*86400000)).toISOString();
  state.review[key]=old;
  state.progress[key]={...(state.progress[key]||{}),reviews:(state.progress[key]?.reviews||0)+1,mastered:(type==='good'||type==='easy')&&level>=2,lastReviewed:new Date().toISOString()};
  logActivity('reviews',1);
  save(); state.hidden=true;
  const next=dueKeys().find(k=>k!==key);
  state.reviewKey=next||null;
  if(next){const [s,a]=next.split(':').map(Number);state.surah=s;state.ayah=a;render();}else{state.screen='review';render();}
}

function makeExamQuestions(count=10){
  if(!quranSourceReady) return [];
  const all=[];
  quran.forEach(s=>s.verses.forEach(v=>all.push({surah:s.number,ayah:v.number,text:v.text})));
  const shuffled=[...all].sort(()=>Math.random()-.5);
  const picked=shuffled.slice(0,count);
  return picked.map((v,idx)=>{
    const source=quran[v.surah-1];
    const next=source?.verses?.find(x=>x.number===v.ayah+1);
    if(idx%3===0 && next){
      const decoys=all.filter(x=>!(x.surah===next.surah&&x.ayah===next.ayah)).sort(()=>Math.random()-.5).slice(0,3);
      const options=[next,...decoys].sort(()=>Math.random()-.5);
      return {type:'next',surah:v.surah,ayah:v.ayah,prompt:v.text,answer:`${next.surah}:${next.ayah}`,options:options.map(x=>({key:`${x.surah}:${x.ayah}`,text:x.text}))};
    }
    if(idx%3===1){
      const nums=new Set([v.ayah]);
      while(nums.size<4){ const n=1+Math.floor(Math.random()*(source.verses.length)); nums.add(n); }
      const options=[...nums].sort(()=>Math.random()-.5);
      return {type:'number',surah:v.surah,ayah:v.ayah,prompt:v.text,answer:String(v.ayah),options:options.map(n=>String(n))};
    }
    const candidates=[v.surah,...Array.from({length:3},()=>1+Math.floor(Math.random()*114))];
    const options=[...new Set(candidates)];
    while(options.length<4){const n=1+Math.floor(Math.random()*114);if(!options.includes(n))options.push(n);}
    options.sort(()=>Math.random()-.5);
    return {type:'surah',surah:v.surah,ayah:v.ayah,prompt:v.text,answer:String(v.surah),options:options.map(n=>({key:String(n),text:`${surahMeta(n)?.ar||''} — ${surahMeta(n)?.en||''}`}))};
  });
}

function exam(){
  if(!quranSourceReady) return `<section class="panel empty"><div class="empty-icon">✎</div><h2>Test üçün Quran məlumatı lazımdır</h2><p>6236 ayəlik məlumat paketi hazır olduqdan sonra testlər tam işləyəcək.</p></section>`;
  if(!state.exam.active && !state.exam.finished){
    const best=state.examHistory.length?Math.max(...state.examHistory.map(x=>x.percent||0)):0;
    return `<section class="panel exam-start"><div class="eyebrow">HİFZ TESTİ</div><h2>Əzbərini yoxla</h2><p>10 sual. Ayənin davamını, ayə nömrəsini və surəni yaddaşdan müəyyən et.</p><div class="exam-rules"><div><b>10</b><span>sual</span></div><div><b>100</b><span>maksimum bal</span></div><div><b>${best}%</b><span>ən yaxşı nəticə</span></div></div><button class="exam-start-btn" id="startExam">▶ Testə başla</button></section>`;
  }
  if(state.exam.finished){
    const percent=Math.round(state.exam.score/state.exam.questions.length*100);
    const grade=percent>=90?'Əla':percent>=75?'Çox yaxşı':percent>=60?'Yaxşı':'Daha çox təkrar et';
    return `<section class="panel exam-result"><div class="eyebrow">TEST NƏTİCƏSİ</div><div class="exam-score">${percent}%</div><h2>${grade}</h2><p>${state.exam.score} / ${state.exam.questions.length} düzgün cavab</p><div class="exam-result-actions"><button id="startExam">Yenidən test</button><button id="examHome">Əsas səhifə</button></div></section>`;
  }
  const q=state.exam.questions[state.exam.index];
  const progress=Math.round((state.exam.index/state.exam.questions.length)*100);
  const answered=state.exam.selected!==null;
  const optionHtml=q.type==='number'
    ? q.options.map(o=>`<button class="exam-option ${answered?(String(o)===q.answer?'correct':String(o)===state.exam.selected?'wrong':''):''}" data-answer="${esc(o)}">${esc(o)}</button>`).join('')
    : q.options.map(o=>`<button class="exam-option ${answered?(o.key===q.answer?'correct':o.key===state.exam.selected?'wrong':''):''}" data-answer="${esc(o.key)}">${esc(o.text)}</button>`).join('');
  const title=q.type==='next'?'Növbəti ayəni tap':q.type==='number'?'Ayə nömrəsini tap':'Surəni tap';
  return `<section class="panel exam-card"><div class="exam-top"><span>Sual ${state.exam.index+1} / ${state.exam.questions.length}</span><span>${state.exam.score} bal</span></div><div class="exam-progress"><i style="width:${progress}%"></i></div><div class="eyebrow">${title.toUpperCase()}</div><h2>${q.type==='next'?`${esc(surahMeta(q.surah)?.ar||'')} • Ayə ${q.ayah}`:'Yaddaşdan cavab ver'}</h2><div class="exam-prompt" dir="rtl">${esc(q.prompt)}</div><div class="exam-options">${optionHtml}</div>${answered?`<button class="exam-next" id="examNext">${state.exam.index===state.exam.questions.length-1?'Nəticəni göstər':'Növbəti sual →'}</button>`:''}</section>`;
}

function todayKey(){ return new Date().toISOString().slice(0,10); }
function logActivity(kind, amount=1){ const k=todayKey(); state.activity[k]={...(state.activity[k]||{}),[kind]:((state.activity[k]?.[kind])||0)+amount,total:((state.activity[k]?.total)||0)+amount}; save(); }
function activityStreak(){ let d=new Date(); let count=0; for(let i=0;i<366;i++){ const k=d.toISOString().slice(0,10); if((state.activity[k]?.total||0)>0){count++;d.setDate(d.getDate()-1);} else break; } return count; }
function monthDays(){ const [y,m]=state.statsMonth.split('-').map(Number); const first=new Date(y,m-1,1); const days=new Date(y,m,0).getDate(); let start=(first.getDay()+6)%7; const cells=[]; for(let i=0;i<start;i++)cells.push(''); for(let d=1;d<=days;d++)cells.push(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`); while(cells.length%7)cells.push(''); return cells; }
function stats(){
  const mastered=Object.values(state.progress).filter(x=>x?.mastered).length;
  const reviewed=Object.values(state.progress).reduce((a,b)=>a+(b?.reviews||0),0);
  const scheduled=Object.keys(state.review).length; const due=dueKeys().length;
  const good=Object.values(state.review).filter(x=>x?.lastRating==='good').length; const easy=Object.values(state.review).filter(x=>x?.lastRating==='easy').length;
  const today=state.activity[todayKey()]||{}; const streak=activityStreak(); const goalPct=Math.min(100,Math.round((today.total||0)/state.goal*100));
  const [yy,mm]=state.statsMonth.split('-').map(Number); const monthName=new Date(yy,mm-1,1).toLocaleDateString('az-AZ',{month:'long',year:'numeric'});
  const cells=monthDays().map(k=>k?`<div class="cal-day ${k===todayKey()?'today':''} ${(state.activity[k]?.total||0)>0?'active':''}"><small>${Number(k.slice(-2))}</small><b>${state.activity[k]?.total||0}</b></div>`:'<div></div>').join('');
  const examBest=state.examHistory.length?Math.max(...state.examHistory.map(x=>x.percent||0)):0; const examAvg=state.examHistory.length?Math.round(state.examHistory.reduce((a,x)=>a+x.percent,0)/state.examHistory.length):0;
  return `<section class="panel stats-page"><div class="eyebrow">STATİSTİKA</div><h2>Əzbər irəliləyişin</h2><div class="stats"><div><b>${mastered}</b><span>Əzbərlənmiş ayə</span></div><div><b>${reviewed}</b><span>Təkrar</span></div><div><b>${due}</b><span>Bu gün təkrar</span></div><div><b>${scheduled}</b><span>Planlanan ayə</span></div><div><b>${good+easy}</b><span>Yaxşı / asan</span></div><div><b>${Math.round(mastered/6236*100)}%</b><span>Ümumi hifz</span></div></div>
  <div class="today-goal"><div><span>BU GÜN</span><b>${today.total||0} / ${state.goal}</b></div><div class="goal-ring"><i style="width:${goalPct}%"></i></div><small>${goalPct}% tamamlandı • ${streak} günlük ardıcıl fəaliyyət</small></div>
  <div class="calendar"><div class="cal-head"><button id="monthPrev">‹</button><b>${esc(monthName)}</b><button id="monthNext">›</button></div><div class="cal-week">${['B','B.e','Ç.a','Ç','C.a','C','Ş'].map(x=>`<span>${x}</span>`).join('')}</div><div class="cal-grid">${cells}</div></div>
  <div class="exam-summary"><b>Hifz testləri</b><span>${state.examHistory.length} test • ən yaxşı ${examBest}% • orta ${examAvg}%</span></div>
  <label>Gündəlik hədəf<input id="goal" type="number" min="1" max="100" value="${state.goal}"></label></section>`;
}

function drawer() { if(!state.menuOpen) return ''; return `<div class="overlay" id="overlay"><aside class="drawer"><button class="close" id="closeMenu">×</button><h2>Quran Hifz</h2><p>Əzbər • Təkrar • Uğur</p><div class="drawer-list">${[['home','⌂','Əsas'],['quran','📖','Quran'],['hifz','🧠','Hifz'],['review','🔁','Təkrar'],['stats','📊','Statistika'],['settings','⚙','Ayarlar']].map(([k,i,t])=>`<button data-screen="${k}">${i}<span>${t}</span></button>`).join('')}</div></aside></div>`; }

function shell(body) {
  document.querySelector('#app').innerHTML=`<div class="app">${header()}<main>${body}</main>${drawer()}<nav>${[['home','⌂','Əsas'],['quran','▣','Quran'],['hifz','♧','Hifz'],['review','↻','Təkrar'],['stats','▥','Statistika']].map(([k,i,t])=>`<button class="${state.screen===k?'on':''}" data-screen="${k}"><span>${i}</span>${t}</button>`).join('')}</nav></div>`;
  bind();
}

function render(){
  let body=state.screen==='home'?home():state.screen==='quran'?quranScreen():state.screen==='hifz'?hifz():state.screen==='review'?review():state.screen==='exam'?exam():state.screen==='settings'?settingsScreen():state.screen==='voice'?voiceCheckPanel():stats();
  shell(body);
}

function setReview(success){
  const key=`${state.surah}:${state.ayah}`; const old=state.review[key]||{interval:1};
  const interval=success?Math.min(60,Math.max(1,old.interval*2)):1;
  state.review[key]={interval,next:new Date(Date.now()+interval*86400000).toISOString()};
  state.progress[key]={...(state.progress[key]||{}),reviews:(state.progress[key]?.reviews||0)+1,mastered:success}; save(); render();
}
function rateReview(easy){setReview(easy);}


function startVoiceRecognition(){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition){alert('Bu cihazda səs tanıma dəstəklənmir.');return;}
  if(state.voiceListening) return;
  const rec=new Recognition(); rec.lang=state.voiceLang; rec.interimResults=true; rec.continuous=false; rec.maxAlternatives=3;
  state.voiceListening=true; state.voiceText=''; state.voiceScore=null; render();
  rec.onresult=(event)=>{let text=''; for(let i=0;i<event.results.length;i++) text+=event.results[i][0].transcript+' '; state.voiceText=text.trim(); const el=$('#voiceText'); if(el)el.value=state.voiceText;};
  rec.onerror=(e)=>{state.voiceListening=false;state.voiceFeedback=e.error==='not-allowed'?'Mikrofon icazəsi verilmədi.':'Səs tanınarkən xəta baş verdi.';render();};
  rec.onend=()=>{state.voiceListening=false; const result=compareRecitation(currentVerse()?.text||'',state.voiceText); state.voiceScore=result.score; state.voiceMissing=result.missing; state.voiceExtra=result.extra; state.voiceFeedback=result.score>=90?'Əla! Ayə çox yüksək uyğunluqla oxundu.':result.score>=75?'Yaxşı nəticə. Bir neçə sözü yenidən məşq et.':result.score>=50?'Orta nəticə. Ayəni bir neçə dəfə təkrar et.':'Ayəni yenidən oxu və daha diqqətli təkrar et.'; if(result.score>=75) logActivity('voice',1); render();};
  rec.start();
}
function bind(){
  document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>{state.screen=b.dataset.screen;if(state.screen==='quran')state.quranMode='surahs';state.menuOpen=false;render()}));
  $('#menu')?.addEventListener('click',()=>{state.menuOpen=true;render()}); $('#closeMenu')?.addEventListener('click',()=>{state.menuOpen=false;render()}); $('#overlay')?.addEventListener('click',e=>{if(e.target.id==='overlay'){state.menuOpen=false;render()}});
  $('#surahPicker')?.addEventListener('click',()=>{state.screen='quran';state.quranMode='surahs';render()});
  $('#backToSurahs')?.addEventListener('click',()=>{state.quranMode='surahs';render()});
  $('#readerTheme')?.addEventListener('click',()=>{state.readerDark=!state.readerDark;render()});
  $('#settingsBtn')?.addEventListener('click',()=>{state.screen='settings';state.menuOpen=false;render()});
  $('#themeSetting')?.addEventListener('click',()=>{state.readerDark=!state.readerDark;render()});
  $('#translationToggle')?.addEventListener('click',()=>{state.showTranslation=!state.showTranslation;save();render()});
  $('#translationLang')?.addEventListener('change',e=>{state.translation=e.target.value;save();render()});
  $('#fontSize')?.addEventListener('input',e=>{state.fontSize=Number(e.target.value);save();document.querySelector('.reader')?.style.setProperty('--q-font',state.fontSize+'px');});
  $('#lineHeight')?.addEventListener('input',e=>{state.lineHeight=Number(e.target.value);save();document.querySelector('.reader')?.style.setProperty('--q-line',state.lineHeight);});
  $('#enableReminder')?.addEventListener('click',configureNotifications);
  $('#disableReminder')?.addEventListener('click',disableNotifications);
  $('#reminderTime')?.addEventListener('change',async e=>{state.reminderTime=e.target.value||'20:00';save();if(state.reminderEnabled) await scheduleDailyReminder();render();});
  $('#reviewReminder')?.addEventListener('click',async()=>{state.reminderReview=!state.reminderReview;save();if(state.reminderEnabled) await scheduleDailyReminder();render();});

  document.querySelectorAll('[data-surah]').forEach(b=>b.addEventListener('click',()=>selectSurah(b.dataset.surah,true)));
  document.querySelectorAll('[data-ayah]').forEach(b=>b.addEventListener('click',()=>{state.ayah=Number(b.dataset.ayah);state.quranMode='reader';state.hidden=false;render()}));
  $('#qsearch')?.addEventListener('input',e=>{state.qSearch=e.target.value; const pos=e.target.selectionStart; render(); const el=$('#qsearch'); el?.focus(); el?.setSelectionRange(pos,pos)});
  $('#ayahSearch')?.addEventListener('input',e=>{state.ayahSearch=e.target.value; const pos=e.target.selectionStart; render(); const el=$('#ayahSearch'); el?.focus(); el?.setSelectionRange(pos,pos)});
  $('#openReader')?.addEventListener('click',()=>{state.quranMode='reader';render()});
  $('#jumpAyah')?.addEventListener('change',e=>{const max=surahMeta(state.surah)?.ayahs||1;state.ayah=Math.max(1,Math.min(max,Number(e.target.value)||1));save();render()});
  $('#prevAyah')?.addEventListener('click',()=>{state.ayah=Math.max(1,state.ayah-1);save();render()});
  $('#nextAyah')?.addEventListener('click',()=>{const max=surahMeta(state.surah)?.ayahs||1;state.ayah=Math.min(max,state.ayah+1);save();render()});
  $('#hideBtn')?.addEventListener('click',()=>{state.hidden=!state.hidden;render()});
  $('#translateBtn')?.addEventListener('click',()=>alert('Tərcümə modulu növbəti mərhələdə əlavə ediləcək.'));
  $('#saveBtn')?.addEventListener('click',()=>{const key=`${state.surah}:${state.ayah}`;state.progress[key]={...(state.progress[key]||{}),saved:true};save();alert('Ayə yadda saxlanıldı.')});
  $('#voiceBtn')?.addEventListener('click',()=>{state.screen='voice';state.voiceText='';state.voiceScore=null;state.voiceFeedback='';state.voiceMissing=[];state.voiceExtra=[];state.hidden=true;render();});
  $('#voiceReveal')?.addEventListener('click',()=>{state.hidden=!state.hidden;render();});
  $('#voiceClear')?.addEventListener('click',()=>{state.voiceText='';state.voiceScore=null;state.voiceFeedback='';state.voiceMissing=[];state.voiceExtra=[];render();});
  $('#voiceText')?.addEventListener('input',e=>{state.voiceText=e.target.value;});
  $('#voiceStart')?.addEventListener('click',()=>startVoiceRecognition());
  $('#audioBtn')?.addEventListener('click',()=>playCurrentAudio());
  $('#audioPrev')?.addEventListener('click',()=>{const max=surahMeta(state.surah)?.ayahs||1;state.ayah=Math.max(1,state.ayah-1);playCurrentAudio()});
  $('#audioNext')?.addEventListener('click',()=>{const max=surahMeta(state.surah)?.ayahs||1;state.ayah=Math.min(max,state.ayah+1);playCurrentAudio()});
  $('#audioProgress')?.addEventListener('input',e=>{if(audio&&Number.isFinite(audio.duration)){audio.currentTime=audio.duration*(Number(e.target.value)/100);state.audioTime=audio.currentTime;}});
  $('#reciter')?.addEventListener('change',e=>{state.reciter=e.target.value;localStorage.setItem('qh_reciter',state.reciter);if(audio)playCurrentAudio();});
  $('#repeat')?.addEventListener('change',e=>{state.repeat=Number(e.target.value);localStorage.setItem('qh_repeat',String(state.repeat));});
  $('#speed')?.addEventListener('change',e=>{state.speed=Number(e.target.value);localStorage.setItem('qh_speed',String(state.speed));if(audio)audio.playbackRate=state.speed;});
  $('#searchBtn')?.addEventListener('click',()=>{state.screen='quran';state.quranMode='surahs';render();setTimeout(()=>$('#qsearch')?.focus(),50)});
  document.querySelectorAll('[data-navmode]').forEach(b=>b.addEventListener('click',()=>{state.navMode=b.dataset.navmode;render()}));
  const applyNav=(raw)=>{
    const max={page:604,juz:30,hizb:60,rub:240}[state.navMode];
    const n=Math.max(1,Math.min(max,Number(raw)||1));
    if(state.navMode==='page')state.page=n;
    if(state.navMode==='juz')state.juz=n;
    if(state.navMode==='hizb')state.hizb=n;
    if(state.navMode==='rub')state.rub=n;
    const loc=verseForLocation(state.navMode,n);
    if(loc){state.surah=loc.surah;state.ayah=loc.ayah;state.quranMode='reader';state.hidden=false;}
    save(); render();
  };
  document.querySelectorAll('[data-navvalue]').forEach(b=>b.addEventListener('click',()=>applyNav(b.dataset.navvalue)));
  $('#navJumpBtn')?.addEventListener('click',()=>applyNav($('#navJump')?.value));
  $('#navJump')?.addEventListener('keydown',e=>{if(e.key==='Enter')applyNav(e.target.value)});
  $('#prev')?.addEventListener('click',()=>{state.ayah=Math.max(1,state.ayah-1);state.hidden=false;render()}); $('#next')?.addEventListener('click',()=>{const max=surahMeta(state.surah)?.ayahs||1;state.ayah=Math.min(max,state.ayah+1);state.hidden=false;render()});
  $('#goodBtn')?.addEventListener('click',()=>{addCurrentToReview();rateSmart('good')});
  $('#reviewCurrent')?.addEventListener('click',()=>addCurrentToReview());
  document.querySelectorAll('[data-rate]').forEach(b=>b.addEventListener('click',()=>rateSmart(b.dataset.rate)));
  $('#showReview')?.addEventListener('click',()=>{state.hidden=!state.hidden;render()});
  $('#reviewExit')?.addEventListener('click',()=>{state.reviewKey=null;state.screen='home';render()});
  $('#startNewReview')?.addEventListener('click',()=>addCurrentToReview());
  $('#reviewPrev')?.addEventListener('click',()=>{const keys=Object.keys(state.review);const i=Math.max(0,keys.indexOf(state.reviewKey)-1);state.reviewKey=keys[i]||keys[0];if(state.reviewKey){const [s,a]=state.reviewKey.split(':').map(Number);state.surah=s;state.ayah=a;}render()});
  $('#reviewNext')?.addEventListener('click',()=>{const keys=Object.keys(state.review);const i=Math.min(keys.length-1,Math.max(0,keys.indexOf(state.reviewKey)+1));state.reviewKey=keys[i]||keys[0];if(state.reviewKey){const [s,a]=state.reviewKey.split(':').map(Number);state.surah=s;state.ayah=a;}render()});
  $('#startExam')?.addEventListener('click',()=>{
    state.exam={active:true,index:0,score:0,questions:makeExamQuestions(10),selected:null,finished:false};
    render();
  });
  document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>{
    if(state.exam.selected!==null) return;
    const q=state.exam.questions[state.exam.index];
    state.exam.selected=b.dataset.answer;
    if(String(b.dataset.answer)===String(q.answer)) state.exam.score++;
    logActivity('tests',1);
    render();
  }));
  $('#examNext')?.addEventListener('click',()=>{
    if(state.exam.index>=state.exam.questions.length-1){
      const percent=Math.round(state.exam.score/state.exam.questions.length*100);
      state.exam.finished=true; state.exam.active=false;
      state.examHistory.unshift({date:new Date().toISOString(),score:state.exam.score,total:state.exam.questions.length,percent});
      state.examHistory=state.examHistory.slice(0,20); save(); render(); return;
    }
    state.exam.index++; state.exam.selected=null; render();
  });
  $('#examHome')?.addEventListener('click',()=>{state.exam={active:false,index:0,score:0,questions:[],selected:null,finished:false};state.screen='home';render()});
  $('#goal')?.addEventListener('change',e=>{state.goal=Math.max(1,Math.min(100,Number(e.target.value)||20));save();render()});
  $('#monthPrev')?.addEventListener('click',()=>{const d=new Date(state.statsMonth+'-01');d.setMonth(d.getMonth()-1);state.statsMonth=d.toISOString().slice(0,7);render()});
  $('#monthNext')?.addEventListener('click',()=>{const d=new Date(state.statsMonth+'-01');d.setMonth(d.getMonth()+1);state.statsMonth=d.toISOString().slice(0,7);render()});
}

document.addEventListener('DOMContentLoaded',async()=>{await loadQuran();render()});
