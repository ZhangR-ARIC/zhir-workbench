/* ============================================================
   ZHIR工作台 - 核心应用逻辑
   ============================================================ */

(function() {
'use strict';

/* ===== 状态管理 ===== */
const KEY = 'zhir-workbench-v1';

let S = null;

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      S = JSON.parse(raw);
    } else {
      S = newState();
    }
  } catch(e) {
    S = newState();
  }
  // 数据结构兼容升级
  migrateState();
  // 确保默认每日任务存在
  ensureDefaultTasks();
  return S;
}

// 升级老数据，缺字段补字段
function migrateState() {
  S.knowledge = S.knowledge || {};
  S.knowledge.koreanLearned = S.knowledge.koreanLearned || {};
  S.knowledge.englishLearned = S.knowledge.englishLearned || {};
  S.knowledge.readingLearned = S.knowledge.readingLearned || {};
  S.knowledge.slangLearned = S.knowledge.slangLearned || {};
  S.knowledge.financeLearned = S.knowledge.financeLearned || {};
  S.knowledge.eqLearned = S.knowledge.eqLearned || {};
  S.knowledge.officeLearned = S.knowledge.officeLearned || {};
  S.brain = S.brain || {};
  S.brain.subTab = S.brain.subTab || 'countdown';
  S.brain.countdowns = S.brain.countdowns || [];
  S.brain.periodDays = S.brain.periodDays || [];
  S.brain.meals = S.brain.meals || {};
  S.brain.finances = S.brain.finances || {};
}

function newState() {
  return {
    currentPage: 'overview',
    dailyPlan: {},
    knowledge: {
      englishLearned: {},
      koreanLearned: {},  // { date: [krId, ...] }
      readingLearned: {},
      slangLearned: {},
      financeLearned: {},
      eqLearned: {},
      officeLearned: {}
    },
    brain: {
      subTab: 'countdown',
      countdowns: [],
      periodDays: [],
      meals: {},
      finances: {},
      calMonth: null
    }
  };
}

function saveState() {
  localStorage.setItem(KEY, JSON.stringify(S));
}

/* ===== 工具函数 ===== */
const U = {
  todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth()+1).padStart(2,'0') + '-' +
      String(d.getDate()).padStart(2,'0');
  },

  dateStr(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth()+1).padStart(2,'0') + '-' +
      String(d.getDate()).padStart(2,'0');
  },

  parseDate(s) {
    const [y,m,d] = s.split('-').map(Number);
    return new Date(y, m-1, d);
  },

  addDays(s, n) {
    const d = U.parseDate(s);
    d.setDate(d.getDate() + n);
    return U.dateStr(d);
  },

  daysUntil(s) {
    const target = U.parseDate(s);
    const today = new Date();
    today.setHours(0,0,0,0);
    target.setHours(0,0,0,0);
    return Math.round((target - today) / 86400000);
  },

  fmtDate(s) {
    const d = U.parseDate(s);
    const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const weeks = ['日','一','二','三','四','五','六'];
    return months[d.getMonth()] + d.getDate() + '日 周' + weeks[d.getDay()];
  },

  fmtDateFull(s) {
    const d = U.parseDate(s);
    return d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日';
  },

  weekdayStr(s) {
    const d = U.parseDate(s);
    return '周' + '日一二三四五六'[d.getDay()];
  },

  // 中国时间（Asia/Shanghai）日期字符串
  chinaTodayStr() {
    const chinaNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    return chinaNow.getFullYear() + '-' +
      String(chinaNow.getMonth() + 1).padStart(2, '0') + '-' +
      String(chinaNow.getDate()).padStart(2, '0');
  },

  // 计算目标日期与中国时间今天相差的天数
  chinaDiffDays(s) {
    const target = U.parseDate(s);
    const today = U.parseDate(U.chinaTodayStr());
    target.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    return Math.round((target - today) / 86400000);
  },

  gid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2,5);
  },

  esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },

  toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  },

  // 模拟天气（基于中国时间月份 + 时段）
  getWeather() {
    const chinaNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    const month = chinaNow.getMonth() + 1;
    const hour = chinaNow.getHours();
    const dayOf = chinaNow.getDate();

    // 季节判断
    const spring = [3,4,5], summer = [6,7,8], autumn = [9,10,11], winter = [12,1,2];
    const weathers = {
      spring: [{ icon:'🌸', desc:'春暖花开', lo:14, hi:24 }, { icon:'🌤️', desc:'晴间多云', lo:15, hi:23 }, { icon:'🌦️', desc:'春雨绵绵', lo:12, hi:20 }],
      summer: [{ icon:'☀️',  desc:'晴朗',     lo:27, hi:35 }, { icon:'🌞', desc:'炎热',     lo:28, hi:37 }, { icon:'⛈️', desc:'雷阵雨',   lo:25, hi:32 }],
      autumn: [{ icon:'🍂', desc:'秋高气爽', lo:15, hi:24 }, { icon:'🌤️', desc:'晴转多云', lo:14, hi:22 }, { icon:'☁️', desc:'多云',     lo:12, hi:20 }],
      winter: [{ icon:'❄️', desc:'小雪',     lo:-3, hi:5  }, { icon:'☁️', desc:'阴天',     lo:0,  hi:8  }, { icon:'☀️', desc:'晴天',     lo:-1, hi:7  }]
    };
    let season, seasonKey;
    if (spring.includes(month)) { season = weathers.spring; seasonKey = 'spring'; }
    else if (summer.includes(month)) { season = weathers.summer; seasonKey = 'summer'; }
    else if (autumn.includes(month)) { season = weathers.autumn; seasonKey = 'autumn'; }
    else { season = weathers.winter; seasonKey = 'winter'; }

    const pick = season[dayOf % season.length];
    const temp = pick.lo + Math.floor((pick.hi - pick.lo) * (hour >= 12 && hour <= 15 ? 0.8 : 0.5));

    // 时间问候语
    let greeting;
    if (hour >= 5 && hour < 8) greeting = '早上好 ☀️';
    else if (hour >= 8 && hour < 11) greeting = '上午好 🌤️';
    else if (hour >= 11 && hour < 13) greeting = '中午好 ☀️';
    else if (hour >= 13 && hour < 17) greeting = '下午好 ☕';
    else if (hour >= 17 && hour < 22) greeting = '晚上好 🌙';
    else greeting = '夜深了 ✨';

    return { icon: pick.icon, desc: pick.desc, temp, greeting, seasonKey };
  },

  // 生成统一顶部栏（紧凑横向卡片，淡粉色主题）
  renderTopBar(pageTitle, pageSub) {
    const w = U.getWeather();
    const china = U.chinaTodayStr();
    const dateFull = U.fmtDateFull(china);
    const weekday = U.weekdayStr(china);
    const isOverview = !pageTitle;
    const dayKey = china;
    const themeIdx = U.themeIndexForDate(dayKey);
    const theme = U.themePalette[themeIdx] || U.themePalette[0];

    // 概览页
    if (isOverview) {
      return `<div class="topbar topbar-overview" style="--accent:${theme.greetingColor};--accent-light:${theme.border}">
        <div class="topbar-inner">
          <div class="topbar-left">
            <div class="topbar-icon">${DOLL_SVGS.avatar}</div>
            <div class="topbar-info">
              <div class="topbar-title">ZHIR 工作台</div>
              <div class="topbar-meta">
                <span>${dateFull}</span>
                <span class="topbar-dot"></span>
                <span>${weekday}</span>
              </div>
            </div>
          </div>
          <div class="topbar-right">
            <div class="topbar-weather-mini">
              <span class="topbar-weather-ico">${w.icon}</span>
              <div class="topbar-weather-text">
                <span class="topbar-weather-tmp">${w.temp}°C</span>
                <span class="topbar-weather-desc">${w.desc}</span>
              </div>
            </div>
            <div class="topbar-greeting" style="color:${theme.greetingColor}">${w.greeting}</div>
          </div>
        </div>
      </div>`;
    }

    // 子页面（按栏目配对应玩偶动作）
    const pageIcon = (function(){
      const nav = NAV.find(x => x.id === S.currentPage);
      return (nav && DOLL_SVGS[nav.icon]) ? DOLL_SVGS[nav.icon] : DOLL_SVGS.avatar;
    })();
    return `<div class="topbar topbar-page" style="--accent:${theme.greetingColor};--accent-light:${theme.border}">
      <div class="topbar-inner">
        <div class="topbar-left">
          <div class="topbar-icon">${pageIcon}</div>
          <div class="topbar-info">
            <div class="topbar-title">${U.esc(pageTitle)}</div>
            <div class="topbar-meta">${dateFull} · ${weekday}</div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-weather-mini">
            <span class="topbar-weather-ico">${w.icon}</span>
            <span class="topbar-weather-tmp">${w.temp}°</span>
          </div>
          <div class="topbar-greeting" style="color:${theme.greetingColor}">${w.greeting}</div>
        </div>
      </div>
    </div>`;
  },

  _pad(s) {
    const d = U.parseDate(s);
    return d.getFullYear() + '.' + (d.getMonth()+1) + '.' + d.getDate();
  },

  // 每日顶部配色方案（每天一种，循环使用）— 高级淡紫/灰/黑 主题
  themePalette: [
    { id:'lavender', name:'薰衣草', bg:'linear-gradient(135deg,#F5F2FA 0%,#ECE6F5 30%,#F0EBF7 60%,#FBFAFF 100%)', border:'#D8D2EC', shadow:'rgba(168,156,217,0.20)', shadow2:'rgba(168,156,217,0.10)',
      greetingBg:'rgba(255,255,255,0.85)', greetingColor:'#5A4A8A',
      brandGrad:'linear-gradient(135deg,#8B7AC8 0%,#A89CD9 30%,#C2B5E5 70%,#DDD2F0 100%)', brandShadow:'0 2px 6px rgba(139,122,200,0.30)' },
    { id:'gray',     name:'晨雾灰', bg:'linear-gradient(135deg,#F4F2F6 0%,#E5E2EA 30%,#EDEAEF 60%,#FAFAFC 100%)', border:'#D0CCD8', shadow:'rgba(74,67,88,0.18)', shadow2:'rgba(74,67,88,0.08)',
      greetingBg:'rgba(255,255,255,0.85)', greetingColor:'#4A4358',
      brandGrad:'linear-gradient(135deg,#4A4358 0%,#6B6377 30%,#8A8294 70%,#A8A0B8 100%)', brandShadow:'0 2px 6px rgba(74,67,88,0.28)' },
    { id:'charcoal', name:'炭灰黑', bg:'linear-gradient(135deg,#F2F0F3 0%,#DCD8DE 30%,#E6E3E8 60%,#F8F7F9 100%)', border:'#C8C2CC', shadow:'rgba(42,37,47,0.20)', shadow2:'rgba(42,37,47,0.10)',
      greetingBg:'rgba(255,255,255,0.85)', greetingColor:'#2A252F',
      brandGrad:'linear-gradient(135deg,#2A252F 0%,#4A4358 30%,#6B6377 70%,#8A8294 100%)', brandShadow:'0 2px 6px rgba(42,37,47,0.30)' },
    { id:'dusty',    name:'暮紫',   bg:'linear-gradient(135deg,#F8F4FA 0%,#EBE0F0 30%,#F0E7F2 60%,#FBF8FC 100%)', border:'#D8CCE0', shadow:'rgba(155,108,180,0.18)', shadow2:'rgba(155,108,180,0.08)',
      greetingBg:'rgba(255,255,255,0.85)', greetingColor:'#6B4A8A',
      brandGrad:'linear-gradient(135deg,#9B6CB4 0%,#B589C8 30%,#CFA5DC 70%,#E2C2EB 100%)', brandShadow:'0 2px 6px rgba(155,108,180,0.28)' },
    { id:'steel',    name:'钢青灰', bg:'linear-gradient(135deg,#F0F4F6 0%,#DEE5EA 30%,#E5EBEF 60%,#F8FAFB 100%)', border:'#C5CCD4', shadow:'rgba(80,100,120,0.18)', shadow2:'rgba(80,100,120,0.08)',
      greetingBg:'rgba(255,255,255,0.85)', greetingColor:'#3A4858',
      brandGrad:'linear-gradient(135deg,#506478 0%,#7088A0 30%,#94A8BC 70%,#B8C8D6 100%)', brandShadow:'0 2px 6px rgba(80,100,120,0.28)' },
    { id:'plum',     name:'梅紫',   bg:'linear-gradient(135deg,#F8F2F7 0%,#EBDCE8 30%,#F0E2EC 60%,#FBF6F9 100%)', border:'#D8C2D0', shadow:'rgba(168,90,140,0.20)', shadow2:'rgba(168,90,140,0.10)',
      greetingBg:'rgba(255,255,255,0.85)', greetingColor:'#7A3A60',
      brandGrad:'linear-gradient(135deg,#9C4A78 0%,#B86B96 30%,#CC8AB0 70%,#DDA8C5 100%)', brandShadow:'0 2px 6px rgba(156,74,120,0.30)' },
    { id:'ink',      name:'墨黑',   bg:'linear-gradient(135deg,#F0F0F2 0%,#D6D5D8 30%,#E0DFE2 60%,#F6F5F7 100%)', border:'#BFBFC4', shadow:'rgba(30,28,35,0.22)', shadow2:'rgba(30,28,35,0.10)',
      greetingBg:'rgba(255,255,255,0.85)', greetingColor:'#1E1C23',
      brandGrad:'linear-gradient(135deg,#1E1C23 0%,#3A3540 30%,#5A4A6A 70%,#7A6F95 100%)', brandShadow:'0 2px 6px rgba(30,28,35,0.32)' },
    { id:'mauve',    name:'藕灰',   bg:'linear-gradient(135deg,#F5F2F4 0%,#E5DCE2 30%,#EBE0E5 60%,#F9F6F8 100%)', border:'#D2C0CC', shadow:'rgba(120,90,110,0.18)', shadow2:'rgba(120,90,110,0.08)',
      greetingBg:'rgba(255,255,255,0.85)', greetingColor:'#5A3A50',
      brandGrad:'linear-gradient(135deg,#8A5A78 0%,#A87A98 30%,#C09AB2 70%,#D8B8CC 100%)', brandShadow:'0 2px 6px rgba(138,90,120,0.28)' }
  ],

  // 基于日期字符串产生稳定的主题索引（每天一种，循环）
  themeIndexForDate(dateStr) {
    const days = ['2026-01-01','2026-01-02','2026-01-03']; // 参考点
    const base = new Date('2026-01-01').getTime();
    const t = U.parseDate(dateStr).getTime();
    const diff = Math.floor((t - base) / 86400000);
    const palette = U.themePalette;
    return ((diff % palette.length) + palette.length) % palette.length;
  },

  // 统计某个学习栏目的年月累计数据
  // stateKey: 'koreanLearned' | 'englishLearned' | 'readingLearned' | 'slangLearned' | 'financeLearned' | 'eqLearned' | 'officeLearned'
  computeLearnStats(stateKey) {
    const data = (S.knowledge && S.knowledge[stateKey]) || {};
    const today = this.todayStr();
    const [y, m] = today.split('-');
    const monthPrefix = `${y}-${m}`;
    let monthDays = 0, monthItems = 0, yearItems = 0, totalItems = 0;
    Object.entries(data).forEach(([date, ids]) => {
      const count = Array.isArray(ids) ? ids.length : 0;
      totalItems += count;
      if (date.startsWith(monthPrefix)) {
        monthDays++;
        monthItems += count;
      }
      if (date.startsWith(y + '-')) yearItems += count;
    });
    return { monthDays, monthItems, yearItems, totalItems };
  },

  // 汇总所有学习栏目的统计
  totalLearnStats() {
    const keys = ['koreanLearned','englishLearned','readingLearned','slangLearned','financeLearned','eqLearned','officeLearned'];
    const labels = { koreanLearned:'韩语', englishLearned:'英语', readingLearned:'好书', slangLearned:'热梗', financeLearned:'理财', eqLearned:'情商', officeLearned:'办公' };
    const rows = [];
    let monthItems = 0, yearItems = 0, totalItems = 0;
    const today = this.todayStr();
    const monthPrefix = today.substring(0, 7);
    const activeDaysSet = new Set();
    keys.forEach(k => {
      const s = this.computeLearnStats(k);
      monthItems += s.monthItems;
      yearItems += s.yearItems;
      totalItems += s.totalItems;
      // 本月活跃天数：任意栏目有学习记录的天数
      const data = (S.knowledge && S.knowledge[k]) || {};
      Object.entries(data).forEach(([date, ids]) => {
        if (date.startsWith(monthPrefix) && Array.isArray(ids) && ids.length) activeDaysSet.add(date);
      });
      rows.push({ key:k, label:labels[k], ...s });
    });
    return { monthDays: activeDaysSet.size, monthItems, yearItems, totalItems, rows };
  }
};

/* ===== 默认每日任务 ===== */
function ensureDefaultTasks() {
  const today = U.todayStr();
  if (!S.dailyPlan[today]) {
    S.dailyPlan[today] = [
      { id: U.gid(), text: '发布吴总朋友圈内容至两群', done: false },
      { id: U.gid(), text: '打卡相关活动', done: false }
    ];
    saveState();
  }
}

/* ===== 导航 ===== */
// 7 个导航栏：每个对应玩偶的不同行为动作
const NAV = [
  { id: 'overview',  icon: 'avatar',  label: '概览' },
  { id: 'daily-plan',icon: 'plan',    label: '每日计划' },
  { id: 'knowledge', icon: 'study',   label: '知识库' },
  { id: 'reading',   icon: 'reading', label: '读书' },
  { id: 'eq',        icon: 'eq',      label: '情商成长' },
  { id: 'office',    icon: 'office',  label: '办公技巧' },
  { id: 'brain',     icon: 'brain',   label: '脑瓜副本' }
];

function renderSidebar() {
  const sb = document.getElementById('sidebar');
  // 顶部品牌区：玩偶主形象
  let html = `<div class="nav-brand" title="ZHIR 玩偶">${DOLL_SVGS.avatar}</div>`;
  NAV.forEach(n => {
    const doll = (typeof DOLL_SVGS !== 'undefined' && DOLL_SVGS[n.icon]) ? DOLL_SVGS[n.icon] : `<span>${n.icon}</span>`;
    html += `<div class="nav-item ${S.currentPage===n.id?'active':''}" data-page="${n.id}">
      <span class="ico">${doll}</span>
      <span class="lbl">${n.label}</span>
    </div>`;
  });
  html += '<div class="nav-spacer"></div>';
  html += `<div class="nav-item settings" data-page="overview" title="概览"><span class="ico">⚙️</span><span class="lbl">设置</span></div>`;
  sb.innerHTML = html;
  sb.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      S.currentPage = el.dataset.page;
      saveState();
      renderSidebar();
      renderPage();
    });
  });
}

/* ===== 页面路由 ===== */
function renderPage() {
  const c = document.getElementById('content');
  if (!c) return;
  try {
    switch(S.currentPage) {
      case 'overview':   c.innerHTML = PgOverview();   initOverview(); break;
      case 'daily-plan': c.innerHTML = PgDailyPlan();  initDailyPlan(); break;
      case 'knowledge':  c.innerHTML = PgKnowledge();  initKnowledge(); break;
      case 'reading':    c.innerHTML = PgReading();    initReading(); break;
      case 'eq':         c.innerHTML = PgEQ();         initEQ(); break;
      case 'office':     c.innerHTML = PgOffice();     initOffice(); break;
      case 'brain':      c.innerHTML = PgBrain();      initBrain(); break;
      default:           S.currentPage = 'overview'; renderPage();
    }
  } catch(e) {
    c.innerHTML = `<div class="page" style="padding:40px;text-align:center">
      <div style="font-size:48px">⚠️</div>
      <div style="margin:16px 0;color:var(--text-2)">页面加载出错，请刷新重试</div>
      <div style="font-size:11px;color:var(--text-3);word-break:break-all">${e.message}</div>
    </div>`;
    console.error('renderPage error:', e);
  }
}

/* ============================================================
   概览页
   ============================================================ */
function PgOverview() {
  const today = U.todayStr();
  const tasks = S.dailyPlan[today] || [];
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round(done/total*100) : 0;

  // 知识库（每日韩英各 5 句，共 10 个学习任务）
  const krToday = S.knowledge.koreanLearned ? (S.knowledge.koreanLearned[today] || []) : [];
  const enToday = S.knowledge.englishLearned[today] || [];
  const learnDone = krToday.length + enToday.length;
  const learnTotal = 10;
  const learnPct = Math.round(learnDone/learnTotal*100);

  // 倒计时（中国时间：今/倒数/正数）
  const upcoming = (S.brain.countdowns || [])
    .map(c => { const diff = U.chinaDiffDays(c.date); return {...c, diff}; })
    .sort((a,b) => {
      const at = a.diff === 0 ? -99999 : (a.diff > 0 ? a.diff : 99999 - Math.abs(a.diff));
      const bt = b.diff === 0 ? -99999 : (b.diff > 0 ? b.diff : 99999 - Math.abs(b.diff));
      return at - bt;
    })
    .slice(0, 3);

  // 今日支出
  const finances = S.brain.finances[today] || [];
  const todayExpense = finances.filter(f => f.type==='expense').reduce((s,f) => s+f.amount, 0);

  // 今日卡路里
  const meals = S.brain.meals[today] || [];
  const todayCal = meals.reduce((s,m) => s+m.calories, 0);

  let html = `<div class="page">
    ${U.renderTopBar()}

    <div class="stat-grid">
      <div class="stat-card" data-nav="daily-plan">
        <div class="stat-ico">✅</div>
        <div class="stat-val ${pct===100?'success':'primary'}">${done}/${total}</div>
        <div class="stat-lbl">今日任务完成</div>
      </div>
      <div class="stat-card" data-nav="knowledge">
        <div class="stat-ico">📚</div>
        <div class="stat-val primary">${learnDone}/${learnTotal}</div>
        <div class="stat-lbl">学习进度（韩+英）</div>
      </div>
      <div class="stat-card" data-nav="brain">
        <div class="stat-ico">🔥</div>
        <div class="stat-val warning">${todayCal}</div>
        <div class="stat-lbl">今日摄入(kcal)</div>
      </div>
      <div class="stat-card" data-nav="brain">
        <div class="stat-ico">💰</div>
        <div class="stat-val danger">¥${todayExpense}</div>
        <div class="stat-lbl">今日支出</div>
      </div>
    </div>
  `;

  // 纪念日（今/倒数/正数）
  if (upcoming.length) {
    html += `<div class="card">
      <div class="card-title">📅 纪念日</div>`;
    upcoming.forEach(c => {
      const absDays = Math.abs(c.diff);
      let numColor, labelText, badgeText;
      if (c.diff === 0) {
        numColor = 'var(--primary-dark)'; labelText = '今天'; badgeText = '🎉';
      } else if (c.diff > 0) {
        numColor = 'var(--mint)'; labelText = '天后'; badgeText = '⏳';
      } else {
        numColor = 'var(--primary)'; labelText = '天前'; badgeText = '💖';
      }
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
        <div><span style="font-size:14px;font-weight:600">${U.esc(c.name)}</span>
        <span class="countdown-type" style="background:var(--primary-light);color:var(--primary-dark)">${U.esc(c.type||'纪念')}</span></div>
        <div style="text-align:right">
          <span style="font-size:18px;font-weight:800;color:${numColor}">${badgeText}${absDays}</span>
          <span style="font-size:11px;color:var(--text-2)">${labelText}</span>
        </div>
      </div>`;
    });
    html += '</div>';
  }

  // 学习数据统计
  const stats = U.totalLearnStats();
  html += `<div class="card">
    <div class="card-title">📊 学习数据统计</div>
    <div class="stats-summary">
      <div class="stats-item">
        <div class="stats-num">${stats.monthDays}</div>
        <div class="stats-label">本月活跃天数</div>
      </div>
      <div class="stats-item">
        <div class="stats-num">${stats.monthItems}</div>
        <div class="stats-label">本月已阅</div>
      </div>
      <div class="stats-item">
        <div class="stats-num">${stats.yearItems}</div>
        <div class="stats-label">本年累计</div>
      </div>
      <div class="stats-item">
        <div class="stats-num">${stats.totalItems}</div>
        <div class="stats-label">历史累计</div>
      </div>
    </div>
    <div class="stats-detail">
      ${stats.rows.map(r => `<div class="stats-row">
        <span class="stats-row-name">${U.esc(r.label)}</span>
        <span class="stats-row-val">本月 ${r.monthItems} 条 · 本年 ${r.yearItems} 条 · 累计 ${r.totalItems} 条</span>
      </div>`).join('')}
    </div>
  </div>`;

  // 今日任务预览
  html += `<div class="card">
    <div class="card-title">📝 今日待办</div>`;
  if (!tasks.length) {
    html += '<div class="empty-state"><div class="ico">🌙</div><div class="txt">今天还没有任务</div></div>';
  } else {
    tasks.forEach(t => {
      html += `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="width:20px;height:20px;border-radius:6px;border:2px solid ${t.done?'var(--success)':'var(--border)'};background:${t.done?'var(--success)':'transparent'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px">${t.done?'✓':''}</div>
        <span style="font-size:14px;${t.done?'text-decoration:line-through;color:var(--text-3)':''}">${U.esc(t.text)}</span>
      </div>`;
    });
    html += `<div style="margin-top:10px"><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div style="text-align:center;margin-top:6px;font-size:12px;color:var(--text-2)">完成度 ${pct}%</div></div>`;
  }
  html += '</div>';

  html += '</div>';
  return html;
}

function initOverview() {
  document.querySelectorAll('.stat-card').forEach(el => {
    el.addEventListener('click', () => {
      S.currentPage = el.dataset.nav;
      saveState();
      renderSidebar();
      renderPage();
    });
  });
}

/* ============================================================
   每日计划页
   ============================================================ */
let planDate = null;

function PgDailyPlan() {
  if (!planDate) planDate = U.todayStr();
  const tasks = S.dailyPlan[planDate] || [];
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round(done/total*100) : 0;
  const isToday = planDate === U.todayStr();

  let html = `<div class="page">
    ${U.renderTopBar('每日计划', '打卡今日待办，记录每日完成')}

    <div class="date-bar">
      <div class="arrow" data-act="prev">‹</div>
      <div class="date-display">${isToday?'今天 · ':''}${U.fmtDate(planDate)}</div>
      ${isToday ? '' : '<div class="today-btn" data-act="today">回到今天</div>'}
      <div class="arrow" data-act="next">›</div>
    </div>

    <div class="progress-wrap">
      <div class="progress-info">
        <span>完成进度</span>
        <span><span class="count">${done}</span>/${total} · ${pct}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
  `;

  if (!tasks.length) {
    html += '<div class="empty-state"><div class="ico">📝</div><div class="txt">这一天还没有任务<br>在下方添加第一个吧</div></div>';
  } else {
    html += '<div class="task-list">';
    tasks.forEach(t => {
      html += `<div class="task-item ${t.done?'done':''}" data-id="${t.id}">
        <div class="task-check ${t.done?'checked':''}" data-act="toggle">${t.done?'✓':''}</div>
        <span class="task-text">${U.esc(t.text)}</span>
        <div class="task-del" data-act="del">✕</div>
      </div>`;
    });
    html += '</div>';
  }

  html += `<div class="add-bar">
    <input type="text" id="taskInput" placeholder="输入新任务..." maxlength="50">
    <button class="btn btn-primary btn-sm" id="addTaskBtn">添加</button>
  </div>`;

  html += '</div>';
  return html;
}

function initDailyPlan() {
  // 日期切换
  document.querySelectorAll('.date-bar [data-act]').forEach(el => {
    el.addEventListener('click', () => {
      const act = el.dataset.act;
      if (act === 'prev') planDate = U.addDays(planDate, -1);
      else if (act === 'next') planDate = U.addDays(planDate, 1);
      else if (act === 'today') planDate = U.todayStr();
      renderPage();
    });
  });

  // 任务勾选
  document.querySelectorAll('.task-item').forEach(item => {
    const id = item.dataset.id;
    item.querySelector('[data-act="toggle"]').addEventListener('click', (e) => {
      e.stopPropagation();
      const tasks = S.dailyPlan[planDate] || [];
      const t = tasks.find(x => x.id === id);
      if (t) {
        t.done = !t.done;
        saveState();
        renderPage();
        if (t.done) U.toast('✅ 已完成！');
      }
    });
    const delBtn = item.querySelector('[data-act="del"]');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        S.dailyPlan[planDate] = (S.dailyPlan[planDate] || []).filter(x => x.id !== id);
        saveState();
        renderPage();
        U.toast('已删除');
      });
    }
  });

  // 添加任务
  const input = document.getElementById('taskInput');
  const addBtn = document.getElementById('addTaskBtn');
  function doAdd() {
    const v = input.value.trim();
    if (!v) return;
    if (!S.dailyPlan[planDate]) S.dailyPlan[planDate] = [];
    S.dailyPlan[planDate].push({ id: U.gid(), text: v, done: false });
    saveState();
    renderPage();
  }
  if (addBtn) addBtn.addEventListener('click', doAdd);
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });
}

/* ============================================================
   知识库页 — 每日韩语 + 英语学习
   ============================================================ */
let knowledgeTab = 'korean';

function PgKnowledge() {
  let html = `<div class="page">
    ${U.renderTopBar('知识库', '每日 9:00 更新 · 韩语 + 英语 双语学习')}

    <div class="tabs">
      <div class="tab ${knowledgeTab==='korean'?'active':''}" data-tab="korean">🇰🇷 韩语学习</div>
      <div class="tab ${knowledgeTab==='english'?'active':''}" data-tab="english">🇺🇸 英语学习</div>
    </div>
  `;

  if (knowledgeTab === 'korean') {
    html += renderKorean();
  } else {
    html += renderEnglish();
  }

  html += '</div>';
  return html;
}

/* ===== 韩语：每日轮换 5 句 + 10 个单词 ===== */
function renderKorean() {
  const today = U.todayStr();
  const learned = S.knowledge.koreanLearned[today] || [];
  let allSentences = [];
  let allWords = [];
  let notes = {};
  try {
    allSentences = KNOWLEDGE_DATA.korean || [];
    allWords = KNOWLEDGE_DATA.koreanWords || [];
    notes = KNOWLEDGE_DATA.koreanNotes || {};
  } catch(e) { allSentences = []; allWords = []; notes = {}; }

  if (!allSentences.length) {
    return '<div class="empty-state"><div class="ico">🇰🇷</div><div class="txt">暂无韩语数据</div></div>';
  }

  // 每天取 5 句（连续不循环）
  const todayItems = dailyPick(allSentences, today, 5);

  const done = todayItems.filter(s => learned.includes(s.id)).length;
  const total = todayItems.length;
  const pct = Math.round(done/total*100);

  let html = `<div class="progress-wrap">
    <div class="progress-info">
      <span>今日韩语学习</span>
      <span><span class="count">${done}</span>/${total} · ${pct}%</span>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
  </div>
  <div class="lang-tip">💡 点击 🔊 听发音，点击「语法讲解」展开详细拆解。每日 5 句 + 10 个高频单词</div>`;

  todayItems.forEach((s, i) => {
    const isLearned = learned.includes(s.id);
    const note = s.grammar || notes[s.id] || '';
    html += `<div class="lang-card ${isLearned?'learned':''}" data-id="${s.id}">
      <div class="lang-check ${isLearned?'checked':''}" data-act="toggle">${isLearned?'✓':''}</div>
      <div class="lang-content">
        <div class="lang-text-row">
          <span class="lang-num">${i+1}</span>
          <span class="lang-text">${U.esc(s.ko)}</span>
          <button class="lang-speak" data-act="speak" data-lang="ko" data-text="${U.esc(s.ko)}" title="点击发音">🔊</button>
        </div>
        <div class="lang-romanization">[${U.esc(s.pron)}]</div>
        <div class="lang-zh">${U.esc(s.zh)}</div>
        ${note ? `<div class="lang-grammar-toggle" data-act="grammar">📖 语法讲解 ▾</div>
        <div class="lang-grammar" style="display:none">${U.esc(note)}</div>` : ''}
      </div>
    </div>`;
  });

  // 高频单词区
  html += `<div class="word-section-title">🔤 今日高频单词 / 短语（点击卡片听发音）</div>`;
  html += `<div class="word-grid">`;
  allWords.forEach((w, i) => {
    html += `<div class="word-card" data-act="speak" data-lang="ko" data-text="${U.esc(w.ko)}">
      <div class="word-num">${i+1}</div>
      <div class="word-ko">${U.esc(w.ko)}<span class="word-speak-ico">🔊</span></div>
      ${w.pron ? `<div class="word-pron">${U.esc(w.pron)}</div>` : ''}
      <div class="word-zh">${U.esc(w.zh)}</div>
    </div>`;
  });
  html += `</div>`;

  return html;
}

/* ===== 英语：每日轮换 5 句 + 10 个单词 ===== */
function renderEnglish() {
  const today = U.todayStr();
  const learned = S.knowledge.englishLearned[today] || [];
  let sentences = [];
  let allWords = [];
  let notes = {};
  try {
    sentences = KNOWLEDGE_DATA.english || [];
    allWords = KNOWLEDGE_DATA.englishWords || [];
    notes = KNOWLEDGE_DATA.englishNotes || {};
  } catch(e) { sentences = []; allWords = []; notes = {}; }

  if (!sentences.length) {
    return '<div class="empty-state"><div class="ico">🇺🇸</div><div class="txt">暂无英语数据</div></div>';
  }

  // 每天取 5 句
  const todayItems = dailyPick(sentences, today, 5);

  const done = todayItems.filter(s => learned.includes(s.id)).length;
  const total = todayItems.length;
  const pct = Math.round(done/total*100);

  let html = `<div class="progress-wrap">
    <div class="progress-info">
      <span>今日英语学习</span>
      <span><span class="count">${done}</span>/${total} · ${pct}%</span>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
  </div>
  <div class="lang-tip">💡 点击 🔊 听标准发音，点击「语法讲解」展开详细拆解。每日 5 句 + 10 个高频表达</div>`;

  todayItems.forEach((s, i) => {
    const isLearned = learned.includes(s.id);
    const note = s.grammar || notes[s.id] || '';
    html += `<div class="lang-card ${isLearned?'learned':''}" data-id="${s.id}">
      <div class="lang-check ${isLearned?'checked':''}" data-act="toggle">${isLearned?'✓':''}</div>
      <div class="lang-content">
        <div class="lang-text-row">
          <span class="lang-num">${i+1}</span>
          <span class="lang-text">${U.esc(s.en)}</span>
          <button class="lang-speak" data-act="speak" data-lang="en" data-text="${U.esc(s.en)}" title="点击发音">🔊</button>
        </div>
        <div class="lang-zh">${U.esc(s.zh)}</div>
        ${note ? `<div class="lang-grammar-toggle" data-act="grammar">📖 语法讲解 ▾</div>
        <div class="lang-grammar" style="display:none">${U.esc(note)}</div>` : ''}
      </div>
    </div>`;
  });

  // 高频单词区
  html += `<div class="word-section-title">🔤 今日高频表达（点击卡片听发音）</div>`;
  html += `<div class="word-grid">`;
  allWords.forEach((w, i) => {
    html += `<div class="word-card" data-act="speak" data-lang="en" data-text="${U.esc(w.en)}">
      <div class="word-num">${i+1}</div>
      <div class="word-en">${U.esc(w.en)}<span class="word-speak-ico">🔊</span></div>
      ${w.pron ? `<div class="word-pron">${U.esc(w.pron)}</div>` : ''}
      <div class="word-zh">${U.esc(w.zh)}</div>
    </div>`;
  });
  html += `</div>`;

  return html;
}

function initKnowledge() {
  document.querySelectorAll('.tab[data-tab]').forEach(el => {
    el.addEventListener('click', () => {
      knowledgeTab = el.dataset.tab;
      renderPage();
    });
  });

  // 通用语言卡片：勾选/语法展开（韩语 + 英语共用）
  document.querySelectorAll('.lang-card').forEach(el => {
    const id = el.dataset.id;
    el.querySelector('[data-act="toggle"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const today = U.todayStr();
      const stateKey = knowledgeTab === 'korean' ? 'koreanLearned' : 'englishLearned';
      if (!S.knowledge[stateKey]) S.knowledge[stateKey] = {};
      if (!S.knowledge[stateKey][today]) S.knowledge[stateKey][today] = [];
      const arr = S.knowledge[stateKey][today];
      const idx = arr.indexOf(id);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(id);
      saveState();
      renderPage();
      const dailyCount = 5;
      if (arr.includes(id) && arr.length === dailyCount) {
        U.toast('🎉 今日' + (knowledgeTab === 'korean' ? '韩语' : '英语') + '全部完成！');
      }
    });
  });

  // 语法讲解展开/收起
  document.querySelectorAll('.lang-grammar-toggle').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = el.closest('.lang-card');
      const body = card.querySelector('.lang-grammar');
      if (!body) return;
      const open = body.style.display !== 'none';
      body.style.display = open ? 'none' : 'block';
      el.textContent = open ? '📖 语法讲解 ▾' : '📖 收起讲解 ▴';
    });
  });

  // 发音按钮（Web Speech API）
  document.querySelectorAll('.lang-speak').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btn.dataset.text;
      const lang = btn.dataset.lang || 'en';
      speakText(text, lang, btn);
    });
  });

  // 单词卡片点击发音
  document.querySelectorAll('.word-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const text = card.dataset.text;
      const lang = card.dataset.lang || 'en';
      speakText(text, lang, card);
    });
  });
}

// 用浏览器 Web Speech API 朗读文本
function speakText(text, lang, btn) {
  if (!('speechSynthesis' in window)) {
    U.toast('当前浏览器不支持语音合成');
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'ko' ? 'ko-KR' : 'en-US';
    utter.rate = lang === 'ko' ? 0.85 : 0.92;
    utter.pitch = 1.0;
    // 优先选择对应语言的女声
    const voices = window.speechSynthesis.getVoices();
    const targetPrefix = lang === 'ko' ? 'ko' : 'en';
    const voice = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix) && /female|natural|samantha|yuna|kyuri/i.test(v.name))
              || voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
    if (voice) utter.voice = voice;
    utter.onstart = () => { btn.classList.add('speaking'); };
    utter.onend = () => { btn.classList.remove('speaking'); };
    utter.onerror = () => { btn.classList.remove('speaking'); };
    window.speechSynthesis.speak(utter);
  } catch(e) {
    U.toast('发音失败：' + e.message);
  }
}

/* ============================================================
   每日轮换工具：根据日期从数组中选取今日内容
   ============================================================ */
function dailyPick(arr, dateStr, count) {
  if (!arr || !arr.length) return [];
  const base = new Date('2026-01-01').getTime();
  const t = U.parseDate(dateStr).getTime();
  const dayIndex = Math.floor((t - base) / 86400000);
  const n = Math.min(count, arr.length);
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(arr[(dayIndex + i) % arr.length]);
  }
  return result;
}

// 每日金句库（读书页顶部）— 50+ 句中外经典名言，每天 1 句
const DAILY_QUOTES = [
  // 中国古典
  { zh:'千里之行，始于足下。', author:'老子《道德经》', source:'中国' },
  { zh:'学而不思则罔，思而不学则殆。', author:'孔子《论语》', source:'中国' },
  { zh:'己所不欲，勿施于人。', author:'孔子《论语》', source:'中国' },
  { zh:'路漫漫其修远兮，吾将上下而求索。', author:'屈原《离骚》', source:'中国' },
  { zh:'天生我材必有用，千金散尽还复来。', author:'李白《将进酒》', source:'中国' },
  { zh:'会当凌绝顶，一览众山小。', author:'杜甫《望岳》', source:'中国' },
  { zh:'人生如逆旅，我亦是行人。', author:'苏轼《临江仙》', source:'中国' },
  { zh:'腹有诗书气自华，最是书香能致远。', author:'苏轼《和董传留别》', source:'中国' },
  { zh:'不畏浮云遮望眼，自缘身在最高层。', author:'王安石《登飞来峰》', source:'中国' },
  { zh:'纸上得来终觉浅，绝知此事要躬行。', author:'陆游《冬夜读书示子聿》', source:'中国' },
  { zh:'少壮不努力，老大徒伤悲。', author:'《长歌行》', source:'中国' },
  { zh:'盛年不重来，一日难再晨。及时当勉励，岁月不待人。', author:'陶渊明《杂诗》', source:'中国' },
  { zh:'沉舟侧畔千帆过，病树前头万木春。', author:'刘禹锡《酬乐天扬州初逢席上见赠》', source:'中国' },
  { zh:'博观而约取，厚积而薄发。', author:'苏轼《稼说送张琥》', source:'中国' },
  { zh:'此心安处是吾乡。', author:'苏轼《定风波》', source:'中国' },
  { zh:'十年生死两茫茫，不思量，自难忘。', author:'苏轼《江城子》', source:'中国' },
  { zh:'人生天地之间，若白驹之过隙，忽然而已。', author:'庄子《知北游》', source:'中国' },
  { zh:'哀莫大于心死，而人死亦次之。', author:'庄子《田子方》', source:'中国' },

  // 西方经典
  { zh:'认识你自己。', author:'苏格拉底', source:'古希腊' },
  { zh:'我只知道一件事，那就是我什么都不知道。', author:'苏格拉底', source:'古希腊' },
  { zh:'未经审视的人生，是不值得过的。', author:'苏格拉底', source:'古希腊' },
  { zh:'人不能两次踏进同一条河流。', author:'赫拉克利特', source:'古希腊' },
  { zh:'性格决定命运。', author:'赫拉克利特', source:'古希腊' },
  { zh:'凡有所学，皆成性格。', author:'培根', source:'英国' },
  { zh:'读书不是为了雄辩和驳斥，而是为了思考和权衡。', author:'培根《论读书》', source:'英国' },
  { zh:'真正可怕的，并非世界怎样，而是我们自己怎样。', author:'卡夫卡', source:'奥地利' },
  { zh:'一个人知道自己为什么而活，就可以忍受任何一种生活。', author:'尼采', source:'德国' },
  { zh:'当你凝视深渊时，深渊也在凝视着你。', author:'尼采《善恶的彼岸》', source:'德国' },
  { zh:'每一个不曾起舞的日子，都是对生命的辜负。', author:'尼采', source:'德国' },
  { zh:'凡是过往，皆为序章。', author:'莎士比亚《暴风雨》', source:'英国' },
  { zh:'黑夜无论怎样悠长，白昼总会到来。', author:'莎士比亚《麦克白》', source:'英国' },
  { zh:'人的一生是短的，但如果卑劣地过这一生，那就太长了。', author:'塞涅卡', source:'古罗马' },
  { zh:'我们最难以承受的，是我们本可以做得更好。', author:'歌德《浮士德》', source:'德国' },
  { zh:'理论是灰色的，生命之树常青。', author:'歌德《浮士德》', source:'德国' },
  { zh:'生活在别处。', author:'兰波', source:'法国' },
  { zh:'我思故我在。', author:'笛卡尔', source:'法国' },
  { zh:'人是生而自由的，却无往不在枷锁之中。', author:'卢梭《社会契约论》', source:'法国' },
  { zh:'最伟大的英雄是那些战胜自己的人。', author:'尼采', source:'德国' },
  { zh:'重要的不是治愈，而是带着病痛活下去。', author:'加缪《西西弗神话》', source:'法国' },
  { zh:'在盛夏的烈阳下，冬天的寒意总会更难忘。', author:'海明威', source:'美国' },
  { zh:'一个人可以被毁灭，但不能被打败。', author:'海明威《老人与海》', source:'美国' },
  { zh:'幸福不是得到我们想要的东西，而是享受我们拥有的东西。', author:'卡耐基', source:'美国' },
  { zh:'我们读世界这部大书，只读到必要的几页，就离开了。', author:'叔本华', source:'德国' },
  { zh:'平庸的人抱怨自己怀才不遇，优秀的人证明自己值得拥有。', author:'稻盛和夫', source:'日本' },
  { zh:'一颗星星可以照亮整片夜空。', author:'圣埃克苏佩里《小王子》', source:'法国' },
  { zh:'真正重要的东西，用眼睛是看不见的。', author:'圣埃克苏佩里《小王子》', source:'法国' },
  { zh:'你在你的玫瑰花身上耗费的时间，使得你的玫瑰花变得如此重要。', author:'圣埃克苏佩里《小王子》', source:'法国' },
  { zh:'世上只有一种英雄主义，就是在认清生活真相之后依然热爱生活。', author:'罗曼·罗兰', source:'法国' },
  { zh:'人生没有返回键，所以不能像删除文件一样重新来过。', author:'海明威', source:'美国' },
  { zh:'世界上最大的监狱是人的思维。', author:'尼采', source:'德国' },
  { zh:'人不是活一辈子，而是活几个瞬间。', author:'帕斯捷尔纳克', source:'俄罗斯' },
  { zh:'我们一生中会遇到很多人，有的擦肩而过，有的相伴一程。', author:'三毛', source:'中国台湾' },
  { zh:'心若没有栖息的地方，到哪里都是流浪。', author:'三毛', source:'中国台湾' },
  { zh:'岁月不饶人，我亦未曾饶过岁月。', author:'木心《云雀叫了一整天》', source:'中国' },
  { zh:'所谓万丈深渊，下去，也是前程万里。', author:'木心', source:'中国' },
  { zh:'最清晰的脚印，踩在最泥泞的路上。', author:'《人民日报》金句', source:'中国' },
  { zh:'你要努力成为大海，而不是等待别人来填满你的杯子。', author:'鲁迅', source:'中国' },
  { zh:'生命像一粒粒种子，从不悲观，从不抱怨。', author:'余华《活着》', source:'中国' },
  { zh:'人是为活着本身而活着的，而不是为活着之外的任何事物所活着。', author:'余华《活着》', source:'中国' },
  { zh:'活下去，就有希望。', author:'余华《活着》', source:'中国' },
  { zh:'人生不能像做菜，把所有调料都准备好了才下锅。', author:'李安《饮食男女》', source:'中国' },
  { zh:'今天比昨天好，就是希望。', author:'路遥《平凡的世界》', source:'中国' },
  { zh:'生活不能等别人来安排，要自己去争取和奋斗。', author:'路遥《平凡的世界》', source:'中国' },
  { zh:'从前的日色变得慢，车马邮件都慢，一生只够爱一个人。', author:'木心《从前慢》', source:'中国' }
];

/* ============================================================
   读书页（每日金句 + 好书/热梗/理财 三个子栏目）
   ============================================================ */
let readingTab = 'finance'; // 'books' | 'slang' | 'finance'

function PgReading() {
  const today = U.todayStr();
  const learned = S.knowledge.readingLearned[today] || [];
  const slangLearned = S.knowledge.slangLearned[today] || [];
  const financeLearned = S.knowledge.financeLearned[today] || [];
  let allBooks = [];
  let allSlang = [];
  let allFinance = [];
  try { allBooks = (KNOWLEDGE_DATA.reading && KNOWLEDGE_DATA.reading.books) || []; } catch(e) {}
  try { allSlang = (KNOWLEDGE_DATA.reading && KNOWLEDGE_DATA.reading.slang) || []; } catch(e) {}
  try { allFinance = (KNOWLEDGE_DATA.reading && KNOWLEDGE_DATA.reading.financeLearn) || []; } catch(e) {}

  // 每日金句轮换（始终显示在顶部）
  const q = dailyPick(DAILY_QUOTES, today, 1)[0] || DAILY_QUOTES[0];

  let html = `<div class="page">
    ${U.renderTopBar('读书', '每日金句 · 好书推荐 · 网络热梗 · 理财学习')}

    <div class="quote-card">
      <div class="quote-quote">${U.esc(q.zh)}</div>
      <div class="quote-author">— ${U.esc(q.author)}</div>
    </div>

    <div class="tabs" style="margin-bottom:14px">
      <div class="tab ${readingTab==='books'?'active':''}" data-rtab="books">📚 好书</div>
      <div class="tab ${readingTab==='slang'?'active':''}" data-rtab="slang">🔥 热梗</div>
      <div class="tab ${readingTab==='finance'?'active':''}" data-rtab="finance">💰 理财学习</div>
    </div>
  `;

  // ===== 好书栏目 =====
  if (readingTab === 'books') {
    const books = dailyPick(allBooks, today, 2);
    const done = books.filter(b => learned.includes(b.id)).length;
    const total = books.length;
    const pct = total ? Math.round(done/total*100) : 0;

    html += `<div class="section-title">📚 今日好书 · 每日轮换</div>`;
    if (!books.length) {
      html += '<div class="empty-state"><div class="ico">📕</div><div class="txt">今日暂无书单</div></div>';
    } else {
      html += `<div class="book-grid">`;
      books.forEach(b => {
        const isRead = learned.includes(b.id);
        html += `<div class="book-card ${isRead?'read':''}" data-id="${b.id}">
          <div class="book-cover" style="background:linear-gradient(135deg,var(--cover-1),var(--cover-2))">
            <span class="book-emoji">${U.esc(b.emoji || '📕')}</span>
          </div>
          <div class="book-body">
            <div class="book-title">${U.esc(b.title)}</div>
            <div class="book-author">${U.esc(b.author)}</div>
            <div class="book-desc">${U.esc(b.desc)}</div>
            <div class="book-quote">${U.esc(b.quote || '')}</div>
            <div class="book-footer">
              <div class="read-toggle ${isRead?'checked':''}" data-act="read">
                <span class="ico">${isRead?'✓':'○'}</span>
                <span class="lbl">已阅</span>
              </div>
            </div>
          </div>
        </div>`;
      });
      html += '</div>';

      html += `<div class="progress-wrap" style="margin-top:14px">
        <div class="progress-info">
          <span>今日阅读进度</span>
          <span><span class="count">${done}</span>/${total} · ${pct}%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>`;

      if (allBooks.length > books.length) {
        html += `<div style="text-align:center;margin-top:10px;font-size:12px;color:var(--text-3)">共 ${allBooks.length} 本好书 · 每日轮换 2 本 · ${(allBooks.length - done)} 本待解锁</div>`;
      }
    }
  }

  // ===== 热梗栏目 =====
  else if (readingTab === 'slang') {
    const slang = dailyPick(allSlang, today, 6);
    if (slang.length) {
      const slangDone = slang.filter(s => slangLearned.includes(s.id)).length;
      const slangTotal = slang.length;
      const slangPct = Math.round(slangDone/slangTotal*100);

      html += `<div class="section-title">🔥 今日网络热梗 · 来源依据</div>
      <div class="progress-wrap">
        <div class="progress-info">
          <span>今日热梗已阅</span>
          <span><span class="count">${slangDone}</span>/${slangTotal} · ${slangPct}%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${slangPct}%"></div></div>
      </div>
      <div class="slang-list">`;

      slang.forEach((s, i) => {
        const isRead = slangLearned.includes(s.id);
        html += `<div class="slang-card ${isRead?'read':''}" data-id="${s.id}">
          <div class="slang-head">
            <span class="slang-num">${i+1}</span>
            <span class="slang-phrase">${U.esc(s.phrase)}</span>
            <div class="read-toggle slang-toggle ${isRead?'checked':''}" data-act="read">
              <span class="ico">${isRead?'✓':'○'}</span>
              <span class="lbl">已阅</span>
            </div>
          </div>
          <div class="slang-meaning"><strong>含义：</strong>${U.esc(s.meaning)}</div>
          <div class="slang-source"><strong>来源：</strong>${U.esc(s.source)}</div>
        </div>`;
      });
      html += `</div>`;

      if (allSlang.length > slang.length) {
        html += `<div style="text-align:center;margin-top:10px;font-size:12px;color:var(--text-3)">共 ${allSlang.length} 条热梗 · 每日轮换 6 条 · ${allSlang.length - slangDone} 条待解锁</div>`;
      }
    } else {
      html += '<div class="empty-state"><div class="ico">🔥</div><div class="txt">暂无热梗数据</div></div>';
    }
  }

  // ===== 理财学习栏目 =====
  else if (readingTab === 'finance') {
    html += renderFinanceLearn(today, allFinance, financeLearned);
  }

  html += '</div>';
  return html;
}

/* ===== 理财学习渲染 ===== */
function renderFinanceLearn(today, allFinance, financeLearned) {
  const items = dailyPick(allFinance, today, 3);
  const done = items.filter(it => financeLearned.includes(it.id)).length;
  const total = items.length;
  const pct = total ? Math.round(done/total*100) : 0;

  let html = `<div class="section-title">💰 每日理财知识 · 深入阅读</div>
  <div class="finance-intro">理财先理脑，每天学一点，复利思维改变人生。点击「深入阅读」可跳转原文。</div>
  <div class="progress-wrap">
    <div class="progress-info">
      <span>今日理财已阅</span>
      <span><span class="count">${done}</span>/${total} · ${pct}%</span>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
  </div>`;

  if (!items.length) {
    html += '<div class="empty-state"><div class="ico">💰</div><div class="txt">暂无理财知识</div></div>';
    return html;
  }

  html += `<div class="finance-list">`;
  items.forEach((it, i) => {
    const isRead = financeLearned.includes(it.id);
    html += `<div class="finance-card ${isRead?'read':''}" data-id="${it.id}">
      <div class="finance-head">
        <span class="finance-emoji">${U.esc(it.emoji || '💰')}</span>
        <span class="finance-title">${U.esc(it.title)}</span>
        <div class="read-toggle ${isRead?'checked':''}" data-act="read">
          <span class="ico">${isRead?'✓':'○'}</span>
          <span class="lbl">已阅</span>
        </div>
      </div>
      <div class="finance-desc">${U.esc(it.desc)}</div>
      <div class="finance-points">💡 ${U.esc(it.points)}</div>
      <div class="finance-footer">
        <a class="finance-link" href="${U.esc(it.link)}" target="_blank" rel="noopener noreferrer" data-act="link">
          <span class="link-ico">🔗</span> 深入阅读
        </a>
        <span class="finance-source">来源：${U.esc(it.source)}</span>
      </div>
    </div>`;
  });
  html += `</div>`;

  if (allFinance.length > items.length) {
    html += `<div style="text-align:center;margin-top:10px;font-size:12px;color:var(--text-3)">共 ${allFinance.length} 条理财知识 · 每日轮换 3 条 · ${allFinance.length - done} 条待解锁</div>`;
  }

  return html;
}

function initReading() {
  // 子栏目切换
  document.querySelectorAll('.tab[data-rtab]').forEach(el => {
    el.addEventListener('click', () => {
      readingTab = el.dataset.rtab;
      renderPage();
    });
  });

  bindReadToggle('.book-card', 'readingLearned');
  bindReadToggle('.slang-card', 'slangLearned');
  bindReadToggle('.finance-card', 'financeLearned');

  // 外链点击统计（不拦截跳转，仅记录点击）
  document.querySelectorAll('.finance-link').forEach(el => {
    el.addEventListener('click', () => {
      U.toast('正在打开原文…');
    });
  });
}

/* ============================================================
   情商成长页（每日轮换 6 条）
   ============================================================ */
function PgEQ() {
  const today = U.todayStr();
  const learned = S.knowledge.eqLearned[today] || [];
  let allItems = [];
  try { allItems = KNOWLEDGE_DATA.eqGrowth || []; } catch(e) {}

  // 每日轮换：每天展示 6 条
  const items = dailyPick(allItems, today, 6);

  const done = items.filter(it => learned.includes(it.id)).length;
  const total = items.length;
  const pct = total ? Math.round(done/total*100) : 0;

  let html = `<div class="page">
    ${U.renderTopBar('情商成长', '为人处世之道 · 每日精进')}

    <div class="progress-wrap">
      <div class="progress-info">
        <span>今日学习进度</span>
        <span><span class="count">${done}</span>/${total} · ${pct}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
  `;

  if (!items.length) {
    html += '<div class="empty-state"><div class="ico">💗</div><div class="txt">暂无内容</div></div>';
  } else {
    items.forEach(it => {
      const isRead = learned.includes(it.id);
      html += `<div class="eq-card ${isRead?'read':''}" data-id="${it.id}">
        <div class="eq-head">
          <div class="eq-emoji">${it.emoji || '💗'}</div>
          <div class="eq-title">${U.esc(it.title)}</div>
          <div class="read-toggle ${isRead?'checked':''}" data-act="read">
            <span class="ico">${isRead?'✓':'○'}</span>
          </div>
        </div>
        <div class="eq-content">${U.esc(it.content)}</div>
        ${it.practice ? `<div class="eq-practice"><span class="tag">📌 练习</span> ${U.esc(it.practice)}</div>` : ''}
      </div>`;
    });

    if (allItems.length > items.length) {
      html += `<div style="text-align:center;margin-top:10px;font-size:12px;color:var(--text-3)">共 ${allItems.length} 条情商课 · 每日轮换 2 条 · ${allItems.length - done} 条待解锁</div>`;
    }
  }

  html += '</div>';
  return html;
}

function initEQ() {
  bindReadToggle('.eq-card', 'eqLearned');
}

/* ============================================================
   办公技巧页（每日轮换 7 条）
   ============================================================ */
function PgOffice() {
  const today = U.todayStr();
  const learned = S.knowledge.officeLearned[today] || [];
  let allItems = [];
  try { allItems = KNOWLEDGE_DATA.officeTips || []; } catch(e) {}

  // 每日轮换：每天展示 7 条
  const items = dailyPick(allItems, today, 7);

  const done = items.filter(it => learned.includes(it.id)).length;
  const total = items.length;
  const pct = total ? Math.round(done/total*100) : 0;

  let html = `<div class="page">
    ${U.renderTopBar('办公技巧', '快捷键 · 邮件 · 表格 · PPT — 日常办公加油站')}

    <div class="progress-wrap">
      <div class="progress-info">
        <span>今日学习进度</span>
        <span><span class="count">${done}</span>/${total} · ${pct}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
  `;

  if (!items.length) {
    html += '<div class="empty-state"><div class="ico">💼</div><div class="txt">暂无内容</div></div>';
  } else {
    // 按 category 分组
    const groups = {};
    items.forEach(it => {
      const cat = it.category || '通用';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(it);
    });

    Object.keys(groups).forEach(cat => {
      html += `<div class="section-title">${U.esc(cat)}</div>`;
      html += `<div class="office-grid">`;
      groups[cat].forEach(it => {
        const isRead = learned.includes(it.id);
        html += `<div class="office-card ${isRead?'read':''}" data-id="${it.id}">
          <div class="office-head">
            <div class="office-emoji">${it.emoji || '💼'}</div>
            <div class="read-toggle ${isRead?'checked':''}" data-act="read">
              <span class="ico">${isRead?'✓':'○'}</span>
              <span class="lbl">${isRead?'已阅':'已阅'}</span>
            </div>
          </div>
          <div class="office-title">${U.esc(it.title)}</div>
          <div class="office-content">${U.esc(it.content)}</div>
        </div>`;
      });
      html += '</div>';
    });

    if (allItems.length > items.length) {
      html += `<div style="text-align:center;margin-top:10px;font-size:12px;color:var(--text-3)">共 ${allItems.length} 条技巧 · 每日轮换 3 条 · ${allItems.length - done} 条待解锁</div>`;
    }
  }

  html += '</div>';
  return html;
}

function initOffice() {
  bindReadToggle('.office-card', 'officeLearned');
}

/* ===== 统一的「已阅」勾选绑定器 =====
   用法：
     bindReadToggle('.book-card', 'readingLearned')
   要求：卡片必须有 data-id，里面要有 [data-act="read"] 的按钮 */
function bindReadToggle(cardSel, stateKey) {
  document.querySelectorAll(cardSel).forEach(card => {
    const id = card.dataset.id;
    const btn = card.querySelector('[data-act="read"]');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const today = U.todayStr();
      if (!S.knowledge[stateKey]) S.knowledge[stateKey] = {};
      if (!S.knowledge[stateKey][today]) S.knowledge[stateKey][today] = [];
      const arr = S.knowledge[stateKey][today];
      const idx = arr.indexOf(id);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(id);
      saveState();
      renderPage();
      if (arr.includes(id)) U.toast('✅ 已阅');
    });
  });
}

/* ============================================================
   脑瓜副本页
   ============================================================ */
const SUB_TABS = [
  { id: 'countdown', label: '亲友记' },
  { id: 'period',    label: '生理记' },
  { id: 'diet',      label: '饭食记' },
  { id: 'finance',   label: '金库小记' }
];

function PgBrain() {
  const sub = S.brain.subTab || 'countdown';
  let html = `<div class="page">
    ${U.renderTopBar('脑瓜副本', '生活记录 · 全方位管理')}
    <div class="sub-tabs">`;
  SUB_TABS.forEach(t => {
    html += `<div class="sub-tab ${sub===t.id?'active':''}" data-sub="${t.id}">${t.label}</div>`;
  });
  html += '</div>';

  switch(sub) {
    case 'countdown': html += renderCountdowns(); break;
    case 'period':    html += renderPeriod();     break;
    case 'diet':      html += renderDiet();       break;
    case 'finance':   html += renderFinance();   break;
  }

  html += '</div>';
  return html;
}

function initBrain() {
  document.querySelectorAll('.sub-tab').forEach(el => {
    el.addEventListener('click', () => {
      S.brain.subTab = el.dataset.sub;
      saveState();
      renderPage();
    });
  });

  const sub = S.brain.subTab || 'countdown';
  if (sub === 'countdown') initCountdowns();
  else if (sub === 'period') initPeriod();
  else if (sub === 'diet') initDiet();
  else if (sub === 'finance') initFinance();
}

/* ---------- 亲友记 ---------- */
function renderCountdowns() {
  // 按与中国时间今天的天数差排序（未来在前，已过的在后）
  const items = (S.brain.countdowns || []).map(c => {
    const diff = U.chinaDiffDays(c.date);
    return { ...c, diff };
  }).sort((a,b) => {
    // 今天排最前，未来按天数升序，过去按天数降序（越久远的越靠后）
    const at = a.diff === 0 ? -99999 : (a.diff > 0 ? a.diff : 99999 - Math.abs(a.diff));
    const bt = b.diff === 0 ? -99999 : (b.diff > 0 ? b.diff : 99999 - Math.abs(b.diff));
    return at - bt;
  });

  let html = '';

  if (!items.length) {
    html += '<div class="empty-state"><div class="ico">🎉</div><div class="txt">还没有纪念日<br>点击下方添加第一个</div></div>';
  } else {
    items.forEach(c => {
      const absDays = Math.abs(c.diff);
      let cls, numColor, badgeText, label, breakdown = null;

      if (c.diff === 0) {
        cls = 'today';
        numColor = 'var(--primary-dark)';
        badgeText = '🎉 就是今天';
        label = '今天';
      } else if (c.diff > 0) {
        cls = 'countdown';
        numColor = 'var(--mint)';
        badgeText = '⏳ 倒数中';
        label = '还有';
      } else {
        cls = 'countup';
        numColor = 'var(--primary)';
        badgeText = '💖 正数中';
        label = '已经';
        if (absDays >= 30) breakdown = breakdownLong(absDays);
      }

      html += `<div class="countdown-card ${cls}">
        <div class="countdown-days">
          <div class="num" style="color:${numColor}">${absDays}</div>
          <div class="unit">天</div>
          ${breakdown ? `<div class="breakdown">${breakdown}</div>` : ''}
        </div>
        <div class="countdown-info">
          <div class="countdown-name">${U.esc(c.name)}
            <span class="countdown-type" style="background:var(--primary-light);color:var(--primary-dark)">${U.esc(c.type||'纪念')}</span>
          </div>
          <div class="countdown-date">${U.fmtDateFull(c.date)} · ${U.weekdayStr(c.date)}</div>
          <div class="countdown-badge">${badgeText}</div>
        </div>
        <div class="countdown-del" data-id="${c.id}">✕</div>
      </div>`;
    });
  }

  html += `<button class="btn btn-primary btn-block" id="addCountdownBtn" style="margin-top:14px">＋ 添加纪念日</button>`;
  return html;
}

// 将天数转换为 X年X月X天（按30天/月，365天/年近似）
function breakdownLong(totalDays) {
  const years = Math.floor(totalDays / 365);
  const remAfterYear = totalDays - years * 365;
  const months = Math.floor(remAfterYear / 30);
  const days = remAfterYear - months * 30;
  const parts = [];
  if (years > 0) parts.push(years + '年');
  if (months > 0) parts.push(months + '月');
  if (days > 0 || parts.length === 0) parts.push(days + '天');
  return parts.join('');
}

function initCountdowns() {
  document.getElementById('addCountdownBtn')?.addEventListener('click', () => {
    showCountdownModal();
  });

  document.querySelectorAll('.countdown-del').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.dataset.id;
      S.brain.countdowns = S.brain.countdowns.filter(c => c.id !== id);
      saveState();
      renderPage();
      U.toast('已删除');
    });
  });
}

function showCountdownModal() {
  const html = `<div class="form-group">
    <label>名称</label>
    <input type="text" id="cdName" placeholder="如：妈妈生日" maxlength="20">
  </div>
  <div class="form-group">
    <label>日期</label>
    <input type="date" id="cdDate">
  </div>
  <div class="form-group">
    <label>类型</label>
    <select id="cdType">
      <option value="生日">生日</option>
      <option value="纪念日">纪念日</option>
      <option value="倒计时">倒计时</option>
      <option value="节日">节日</option>
    </select>
  </div>
  <div class="modal-actions">
    <button class="btn btn-outline" id="modalCancel">取消</button>
    <button class="btn btn-primary" id="modalConfirm">添加</button>
  </div>`;

  showModal('添加纪念日', html, () => {
    const name = document.getElementById('cdName').value.trim();
    const date = document.getElementById('cdDate').value;
    const type = document.getElementById('cdType').value;
    if (!name || !date) { U.toast('请填写名称和日期'); return false; }
    S.brain.countdowns = S.brain.countdowns || [];
    S.brain.countdowns.push({ id: U.gid(), name, date, type });
    saveState();
    return true;
  });
}

/* ---------- 生理记 ---------- */
let calCursor = null;

function renderPeriod() {
  if (!calCursor) calCursor = new Date();
  const year = calCursor.getFullYear();
  const month = calCursor.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  const weekNames = ['日','一','二','三','四','五','六'];

  let html = `<div class="calendar">
    <div class="cal-header">
      <div class="nav-btn" data-cal="prev">‹</div>
      <div class="month">${year}年 ${monthNames[month]}</div>
      <div class="nav-btn" data-cal="next">›</div>
    </div>
    <div class="cal-weekdays">${weekNames.map(w => `<span>${w}</span>`).join('')}</div>
    <div class="cal-grid">`;

  for (let i = 0; i < startWeekday; i++) html += '<div class="cal-cell empty"></div>';

  const today = U.todayStr();
  const periodSet = new Set(S.brain.periodDays || []);

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = year + '-' + String(month+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    const classes = ['cal-cell'];
    if (ds === today) classes.push('today');
    if (periodSet.has(ds)) classes.push('period');
    html += `<div class="${classes.join(' ')}" data-date="${ds}">${d}</div>`;
  }

  html += '</div>';

  // Legend
  html += `<div class="cal-legend">
    <span><span class="dot" style="background:var(--danger)"></span>生理期</span>
    <span><span class="dot" style="border:1.5px solid var(--primary);background:transparent"></span>今天</span>
  </div>`;

  html += '</div>';

  // History
  const periods = computePeriods(S.brain.periodDays || []);
  if (periods.length) {
    html += '<div class="card"><div class="card-title">📋 历史记录</div>';
    [...periods].reverse().forEach(p => {
      const duration = Math.round((U.parseDate(p.endDate || p.startDate) - U.parseDate(p.startDate)) / 86400000) + 1;
      html += `<div class="period-history-item">
        <span>${U.fmtDateFull(p.startDate)} ~ ${p.endDate ? U.fmtDateFull(p.endDate) : '进行中'}</span>
        <span style="color:var(--text-2)">${duration}天</span>
      </div>`;
    });
    html += '</div>';
  }

  // Quick clear
  if (periodSet.size) {
    html += `<button class="btn btn-outline btn-block" id="clearPeriodBtn" style="margin-top:10px">清除所有记录</button>`;
  }

  return html;
}

function computePeriods(days) {
  if (!days.length) return [];
  const sorted = [...days].sort();
  const periods = [];
  let start = sorted[0], prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (U.addDays(prev, 1) === sorted[i]) {
      prev = sorted[i];
    } else {
      periods.push({ startDate: start, endDate: prev });
      start = sorted[i];
      prev = sorted[i];
    }
  }
  periods.push({ startDate: start, endDate: prev });
  return periods;
}

function initPeriod() {
  document.querySelectorAll('[data-cal]').forEach(el => {
    el.addEventListener('click', () => {
      const dir = el.dataset.cal;
      const m = calCursor.getMonth();
      const y = calCursor.getFullYear();
      calCursor = new Date(y, m + (dir === 'prev' ? -1 : 1), 1);
      renderPage();
    });
  });

  document.querySelectorAll('.cal-cell[data-date]').forEach(el => {
    el.addEventListener('click', () => {
      const ds = el.dataset.date;
      const arr = S.brain.periodDays || [];
      const idx = arr.indexOf(ds);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(ds);
      S.brain.periodDays = arr;
      saveState();
      renderPage();
    });
  });

  document.getElementById('clearPeriodBtn')?.addEventListener('click', () => {
    S.brain.periodDays = [];
    saveState();
    renderPage();
    U.toast('已清除');
  });
}

/* ---------- 饭食记（手动模式：食品名称 + 数量 + 卡路里） ---------- */
let dietDate = null;

function renderDiet() {
  if (!dietDate) dietDate = U.todayStr();
  const meals = (S.brain.meals[dietDate] || []);
  const totalCal = meals.reduce((s,m) => s + m.calories, 0);
  const isToday = dietDate === U.todayStr();

  let html = `<div class="date-bar">
    <div class="arrow" data-diet="prev">‹</div>
    <div class="date-display">${isToday?'今天 · ':''}${U.fmtDate(dietDate)}</div>
    ${isToday ? '' : '<div class="today-btn" data-diet="today">今天</div>'}
    <div class="arrow" data-diet="next">›</div>
  </div>`;

  html += `<div class="calorie-total">
    <div class="label">今日总摄入</div>
    <div class="value">${totalCal} <span style="font-size:13px;color:var(--text-2)">kcal</span></div>
  </div>`;

  if (!meals.length) {
    html += '<div class="empty-state"><div class="ico">🍽️</div><div class="txt">还没有记录饮食<br>点击下方添加</div></div>';
  } else {
    meals.forEach(m => {
      html += `<div class="meal-card">
        <div class="meal-info">
          <div class="meal-name">${U.esc(m.name)}</div>
          <div class="meal-detail">${U.esc(m.quantity)} · 共 ${m.calories} kcal</div>
        </div>
        <div class="meal-cal">${m.calories}</div>
        <div class="task-del" data-meal-del="${m.id}">✕</div>
      </div>`;
    });
  }

  html += `<button class="btn btn-primary btn-block" id="addMealBtn" style="margin-top:14px">＋ 添加饮食</button>`;
  return html;
}

function initDiet() {
  document.querySelectorAll('[data-diet]').forEach(el => {
    el.addEventListener('click', () => {
      const act = el.dataset.diet;
      if (act === 'prev') dietDate = U.addDays(dietDate, -1);
      else if (act === 'next') dietDate = U.addDays(dietDate, 1);
      else if (act === 'today') dietDate = U.todayStr();
      renderPage();
    });
  });

  document.querySelectorAll('[data-meal-del]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.dataset.mealDel;
      S.brain.meals[dietDate] = (S.brain.meals[dietDate] || []).filter(m => m.id !== id);
      saveState();
      renderPage();
      U.toast('已删除');
    });
  });

  document.getElementById('addMealBtn')?.addEventListener('click', showMealModal);
}

// 手动模式：用户输入食品名称 + 数量 + 卡路里（不再自动提取）
function showMealModal() {
  const html = `<div class="form-group">
    <label>食品名称</label>
    <input type="text" id="foodName" placeholder="如：牛肉饭 / 全麦面包 / 拿铁" maxlength="30">
  </div>
  <div class="form-row">
    <div class="form-group" style="flex:1;min-width:0">
      <label>数量</label>
      <input type="text" id="foodQty" placeholder="如：1 碗 / 200g / 1 杯" maxlength="20">
    </div>
    <div class="form-group" style="flex:1;min-width:0">
      <label>卡路里 (kcal)</label>
      <input type="number" id="foodCal" placeholder="数字" min="0" step="1">
    </div>
  </div>
  <div class="modal-actions">
    <button class="btn btn-outline" id="modalCancel">取消</button>
    <button class="btn btn-primary" id="modalConfirm">添加</button>
  </div>`;

  showModal('添加饮食', html, () => {
    const name = document.getElementById('foodName').value.trim();
    const qty = document.getElementById('foodQty').value.trim();
    const cal = parseFloat(document.getElementById('foodCal').value);
    if (!name) { U.toast('请输入食品名称'); return false; }
    if (!cal || cal < 0) { U.toast('请输入有效卡路里'); return false; }
    S.brain.meals[dietDate] = S.brain.meals[dietDate] || [];
    S.brain.meals[dietDate].push({
      id: U.gid(),
      name: name,
      quantity: qty || '1 份',
      calories: Math.round(cal)
    });
    saveState();
    return true;
  });
}

/* ---------- 金库小记 ---------- */
let finDate = null;
let finView = 'daily'; // daily / monthly / yearly

const FIN_CATS_EXPENSE = ['餐饮','交通','购物','娱乐','居住','医疗','教育','社交','其他'];
const FIN_CATS_INCOME = ['工资','奖金','投资','兼职','红包','其他'];
const FIN_ICONS = {
  '餐饮':'🍔','交通':'🚗','购物':'🛍️','娱乐':'🎮','居住':'🏠','医疗':'💊','教育':'📚','社交':'🍻','其他':'📝',
  '工资':'💼','奖金':'🎁','投资':'📈','兼职':'🔧','红包':'🧧','其他':'💰'
};

function renderFinance() {
  if (!finDate) finDate = U.todayStr();
  const isToday = finDate === U.todayStr();

  let html = `<div class="date-bar" id="finDateBar" style="${finView!=='daily'?'display:none':''}">
    <div class="arrow" data-fin="prev">‹</div>
    <div class="date-display">${isToday?'今天 · ':''}${U.fmtDate(finDate)}</div>
    ${isToday ? '' : '<div class="today-btn" data-fin="today">今天</div>'}
    <div class="arrow" data-fin="next">›</div>
  </div>`;

  // View tabs
  html += `<div class="tabs" style="margin-bottom:14px">
    <div class="tab ${finView==='daily'?'active':''}" data-fview="daily">日</div>
    <div class="tab ${finView==='monthly'?'active':''}" data-fview="monthly">月</div>
    <div class="tab ${finView==='yearly'?'active':''}" data-fview="yearly">年</div>
  </div>`;

  // 获取范围内的记录
  const { entries, income, expense } = getFinancesForView(finDate, finView);

  html += `<div class="fin-summary">
    <div class="fin-sum-card income"><div class="lbl">收入</div><div class="val">¥${income}</div></div>
    <div class="fin-sum-card expense"><div class="lbl">支出</div><div class="val">¥${expense}</div></div>
    <div class="fin-sum-card balance"><div class="lbl">结余</div><div class="val">¥${income-expense}</div></div>
  </div>`;

  if (!entries.length) {
    html += '<div class="empty-state"><div class="ico">💰</div><div class="txt">还没有记录<br>点击下方添加收支</div></div>';
  } else {
    entries.forEach(f => {
      html += `<div class="fin-entry">
        <div class="fin-icon ${f.type}">${FIN_ICONS[f.category] || '💰'}</div>
        <div class="fin-info">
          <div class="fin-cat">${U.esc(f.category)}</div>
          <div class="fin-note">${U.esc(f.note || '')} · ${U.fmtDate(f.date)}</div>
        </div>
        <div class="fin-amount ${f.type}">${f.type==='income'?'+':'-'}¥${f.amount}</div>
        <div class="task-del" data-fin-del="${f.id}">✕</div>
      </div>`;
    });
  }

  html += `<button class="btn btn-primary btn-block" id="addFinBtn" style="margin-top:14px">＋ 添加收支</button>`;
  return html;
}

function getFinancesForView(dateStr, view) {
  const allEntries = [];
  const allFinances = S.brain.finances || {};
  Object.keys(allFinances).forEach(k => {
    (allFinances[k] || []).forEach(f => allEntries.push(f));
  });

  let prefix;
  if (view === 'daily') prefix = dateStr;
  else if (view === 'monthly') prefix = dateStr.substring(0, 7);
  else prefix = dateStr.substring(0, 4);

  const entries = allEntries.filter(f => f.date.startsWith(prefix)).sort((a,b) => b.date.localeCompare(a.date));
  const income = entries.filter(f => f.type==='income').reduce((s,f) => s+f.amount, 0);
  const expense = entries.filter(f => f.type==='expense').reduce((s,f) => s+f.amount, 0);

  return { entries, income, expense };
}

function initFinance() {
  document.querySelectorAll('[data-fin]').forEach(el => {
    el.addEventListener('click', () => {
      const act = el.dataset.fin;
      if (act === 'prev') finDate = U.addDays(finDate, -1);
      else if (act === 'next') finDate = U.addDays(finDate, 1);
      else if (act === 'today') finDate = U.todayStr();
      renderPage();
    });
  });

  document.querySelectorAll('[data-fview]').forEach(el => {
    el.addEventListener('click', () => {
      finView = el.dataset.fview;
      renderPage();
    });
  });

  document.querySelectorAll('[data-fin-del]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.dataset.finDel;
      Object.keys(S.brain.finances).forEach(k => {
        S.brain.finances[k] = (S.brain.finances[k] || []).filter(f => f.id !== id);
      });
      saveState();
      renderPage();
      U.toast('已删除');
    });
  });

  document.getElementById('addFinBtn')?.addEventListener('click', showFinanceModal);
}

function showFinanceModal() {
  const cats = FIN_CATS_EXPENSE.map(c => `<option value="${c}">${c}</option>`).join('');
  const incomeCats = FIN_CATS_INCOME.map(c => `<option value="${c}">${c}</option>`).join('');

  const html = `<div class="tabs" style="margin-bottom:14px" id="finTypeTabs">
    <div class="tab active" data-type="expense">支出</div>
    <div class="tab" data-type="income">收入</div>
  </div>
  <div class="form-group">
    <label>金额</label>
    <input type="number" id="finAmount" placeholder="¥" min="0" step="0.01">
  </div>
  <div class="form-group">
    <label>分类</label>
    <select id="finCat">${cats}</select>
    <select id="finCatIncome" style="display:none">${incomeCats}</select>
  </div>
  <div class="form-group">
    <label>备注</label>
    <input type="text" id="finNote" placeholder="如：午餐、打车..." maxlength="30">
  </div>
  <div class="modal-actions">
    <button class="btn btn-outline" id="modalCancel">取消</button>
    <button class="btn btn-primary" id="modalConfirm">添加</button>
  </div>`;

  let finType = 'expense';

  showModal('添加收支', html, () => {
    const amount = parseFloat(document.getElementById('finAmount').value);
    const cat = document.getElementById(finType==='expense' ? 'finCat' : 'finCatIncome').value;
    const note = document.getElementById('finNote').value.trim();
    if (!amount || amount <= 0) { U.toast('请输入金额'); return false; }
    const date = finDate || U.todayStr();
    S.brain.finances[date] = S.brain.finances[date] || [];
    S.brain.finances[date].push({ id: U.gid(), type: finType, amount, category: cat, note, date });
    saveState();
    return true;
  });

  document.querySelectorAll('#finTypeTabs .tab').forEach(el => {
    el.addEventListener('click', () => {
      finType = el.dataset.type;
      document.querySelectorAll('#finTypeTabs .tab').forEach(t => t.classList.toggle('active', t.dataset.type === finType));
      document.getElementById('finCat').style.display = finType === 'expense' ? 'block' : 'none';
      document.getElementById('finCatIncome').style.display = finType === 'income' ? 'block' : 'none';
    });
  });
}

/* ============================================================
   Modal 系统
   ============================================================ */
function showModal(title, contentHTML, onConfirm) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modalOverlay';
  overlay.innerHTML = `<div class="modal-sheet">
    <div class="modal-handle"></div>
    <div class="modal-title">${U.esc(title)}</div>
    ${contentHTML}
  </div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  const cancel = document.getElementById('modalCancel');
  if (cancel) cancel.addEventListener('click', closeModal);

  const confirm = document.getElementById('modalConfirm');
  if (confirm && onConfirm) {
    confirm.addEventListener('click', () => {
      const result = onConfirm();
      if (result !== false) closeModal();
    });
  }
}

function closeModal() {
  document.getElementById('modalOverlay')?.remove();
}

/* ============================================================
   初始化
   ============================================================ */
function init() {
  loadState();
  renderSidebar();
  renderPage();
  // 每次加载时确保今天有默认任务
  ensureDefaultTasks();

  // 兜底：页面关闭/刷新前强制持久化当前状态
  window.addEventListener('beforeunload', () => {
    saveState();
  });

  // 可见性变化时保存（从后台切回前台等场景）
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveState();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
