/* ============================================================
   ZHIR 玩偶 Rebellious — 多个行为动作的 SVG 集合
   配色：淡紫 / 灰 / 黑
   viewBox: 0 0 64 64
   ============================================================ */

/* ===== 玩偶基色（可被 CSS 变量覆盖） ===== */
const DOLL = {
  skin:    '#F0E2D4',   // 肤色（米黄）
  hair:    '#2A2630',   // 头发（接近黑）
  glass:   '#3A3540',   // 眼镜框（深灰）
  blush:   '#D49AAB',   // 腮红（淡粉紫）
  body:    '#7A6F95',   // 身体（淡紫灰）
  body2:   '#5B5273',   // 身体阴影
  collar:  '#3A3540',   // 项圈（深灰）
  spike:   '#C7B8E8',   // 铆钉（淡紫）
  line:    '#3A3540',   // 描线
  accent:  '#C7B8E8'    // 装饰淡紫
};

/* ============================================================
   1. avatar — 主形象（挥手）
   用途：顶部 logo、概览页、设置默认
   ============================================================ */
const DollAvatar = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="doll-svg">
  <!-- 身体 -->
  <path d="M18 56 Q18 42 32 40 Q46 42 46 56 Z" fill="${DOLL.body}"/>
  <ellipse cx="32" cy="56" rx="18" ry="4" fill="${DOLL.body2}"/>
  <!-- 项圈（铆钉）-->
  <rect x="22" y="39" width="20" height="3.5" rx="1" fill="${DOLL.collar}"/>
  <circle cx="26" cy="40.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="32" cy="40.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="38" cy="40.7" r="1" fill="${DOLL.spike}"/>
  <!-- 左手挥手 -->
  <path d="M46 44 Q52 38 54 32 Q55 30 53 28 Q51 27 50 30 L48 36" stroke="${DOLL.body}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="52" cy="29" r="3" fill="${DOLL.skin}"/>
  <!-- 头 -->
  <circle cx="32" cy="26" r="15" fill="${DOLL.skin}"/>
  <!-- 头发（齐刘海） -->
  <path d="M17 24 Q19 12 32 11 Q45 12 47 24 Q47 20 44 18 L42 20 L38 17 L34 20 L30 17 L26 20 L22 17 L20 20 Q17 22 17 24 Z" fill="${DOLL.hair}"/>
  <!-- 头发侧 -->
  <path d="M17 24 Q14 30 16 38 Q17 35 18 32" fill="${DOLL.hair}"/>
  <path d="M47 24 Q50 30 48 38 Q47 35 46 32" fill="${DOLL.hair}"/>
  <!-- 圆框眼镜 -->
  <circle cx="26" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <circle cx="38" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <line x1="30.5" y1="27" x2="33.5" y2="27" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <!-- 眼镜内「NO!」字样 -->
  <text x="38" y="29" font-size="3" font-weight="800" fill="${DOLL.glass}" font-family="Arial">NO!</text>
  <!-- 腮红 -->
  <ellipse cx="22" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.6"/>
  <ellipse cx="42" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.6"/>
  <!-- 嘴 -->
  <path d="M30 33 Q32 35 34 33" stroke="${DOLL.line}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <!-- 右手 -->
  <circle cx="18" cy="46" r="3" fill="${DOLL.skin}"/>
</svg>`;

/* ============================================================
   2. doll-reading — 读书（捧书）
   用途：读书栏目
   ============================================================ */
const DollReading = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="doll-svg">
  <!-- 身体 -->
  <path d="M16 60 Q16 44 32 42 Q48 44 48 60 Z" fill="${DOLL.body}"/>
  <!-- 项圈 -->
  <rect x="22" y="41" width="20" height="3.5" rx="1" fill="${DOLL.collar}"/>
  <circle cx="26" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="32" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="38" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <!-- 头 -->
  <circle cx="32" cy="26" r="15" fill="${DOLL.skin}"/>
  <path d="M17 24 Q19 12 32 11 Q45 12 47 24 Q47 20 44 18 L42 20 L38 17 L34 20 L30 17 L26 20 L22 17 L20 20 Q17 22 17 24 Z" fill="${DOLL.hair}"/>
  <path d="M17 24 Q14 30 16 38 Q17 35 18 32" fill="${DOLL.hair}"/>
  <path d="M47 24 Q50 30 48 38 Q47 35 46 32" fill="${DOLL.hair}"/>
  <!-- 眼镜 -->
  <circle cx="26" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <circle cx="38" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <line x1="30.5" y1="27" x2="33.5" y2="27" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <!-- 闭眼认真 -->
  <path d="M22.5 27 Q26 29 29.5 27" stroke="${DOLL.line}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <path d="M34.5 27 Q38 29 41.5 27" stroke="${DOLL.line}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <!-- 腮红 -->
  <ellipse cx="22" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.6"/>
  <ellipse cx="42" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.6"/>
  <!-- 微笑 -->
  <path d="M30 33 Q32 35 34 33" stroke="${DOLL.line}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <!-- 双手捧书 -->
  <path d="M20 46 L44 46 L42 54 L22 54 Z" fill="${DOLL.accent}" stroke="${DOLL.line}" stroke-width="1"/>
  <line x1="32" y1="46" x2="32" y2="54" stroke="${DOLL.line}" stroke-width="0.8"/>
  <circle cx="20" cy="48" r="2.5" fill="${DOLL.skin}"/>
  <circle cx="44" cy="48" r="2.5" fill="${DOLL.skin}"/>
</svg>`;

/* ============================================================
   3. doll-plan — 计划（打钩便签）
   用途：每日计划
   ============================================================ */
const DollPlan = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="doll-svg">
  <path d="M16 60 Q16 44 32 42 Q48 44 48 60 Z" fill="${DOLL.body}"/>
  <rect x="22" y="41" width="20" height="3.5" rx="1" fill="${DOLL.collar}"/>
  <circle cx="26" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="32" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="38" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="32" cy="26" r="15" fill="${DOLL.skin}"/>
  <path d="M17 24 Q19 12 32 11 Q45 12 47 24 Q47 20 44 18 L42 20 L38 17 L34 20 L30 17 L26 20 L22 17 L20 20 Q17 22 17 24 Z" fill="${DOLL.hair}"/>
  <path d="M17 24 Q14 30 16 38 Q17 35 18 32" fill="${DOLL.hair}"/>
  <path d="M47 24 Q50 30 48 38 Q47 35 46 32" fill="${DOLL.hair}"/>
  <circle cx="26" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <circle cx="38" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <line x1="30.5" y1="27" x2="33.5" y2="27" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <!-- 眼睛看下方 -->
  <circle cx="26" cy="28" r="1.3" fill="${DOLL.line}"/>
  <circle cx="38" cy="28" r="1.3" fill="${DOLL.line}"/>
  <ellipse cx="22" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.6"/>
  <ellipse cx="42" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.6"/>
  <path d="M30 33 Q32 34.5 34 33" stroke="${DOLL.line}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <!-- 便签纸（打钩） -->
  <rect x="18" y="44" width="22" height="14" rx="2" fill="${DOLL.accent}" stroke="${DOLL.line}" stroke-width="1"/>
  <line x1="22" y1="48" x2="36" y2="48" stroke="${DOLL.line}" stroke-width="0.8"/>
  <!-- 钩 -->
  <path d="M21 51 L24 54 L30 47" stroke="${DOLL.line}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="22" y1="56" x2="36" y2="56" stroke="${DOLL.line}" stroke-width="0.6" opacity="0.5"/>
  <!-- 右手握笔 -->
  <circle cx="42" cy="48" r="2.5" fill="${DOLL.skin}"/>
  <line x1="42" y1="50" x2="40" y2="56" stroke="${DOLL.line}" stroke-width="1.2" stroke-linecap="round"/>
</svg>`;

/* ============================================================
   4. doll-study — 学习（带耳机/问号）
   用途：知识库
   ============================================================ */
const DollStudy = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="doll-svg">
  <path d="M16 60 Q16 44 32 42 Q48 44 48 60 Z" fill="${DOLL.body}"/>
  <rect x="22" y="41" width="20" height="3.5" rx="1" fill="${DOLL.collar}"/>
  <circle cx="26" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="32" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="38" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="32" cy="26" r="15" fill="${DOLL.skin}"/>
  <path d="M17 24 Q19 12 32 11 Q45 12 47 24 Q47 20 44 18 L42 20 L38 17 L34 20 L30 17 L26 20 L22 17 L20 20 Q17 22 17 24 Z" fill="${DOLL.hair}"/>
  <path d="M17 24 Q14 30 16 38 Q17 35 18 32" fill="${DOLL.hair}"/>
  <path d="M47 24 Q50 30 48 38 Q47 35 46 32" fill="${DOLL.hair}"/>
  <circle cx="26" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <circle cx="38" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <line x1="30.5" y1="27" x2="33.5" y2="27" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <!-- 眼镜里翻书 -->
  <text x="26" y="29" font-size="3.5" font-weight="800" fill="${DOLL.glass}" text-anchor="middle" font-family="Arial">EN</text>
  <text x="38" y="29" font-size="3.5" font-weight="800" fill="${DOLL.glass}" text-anchor="middle" font-family="Arial">한</text>
  <ellipse cx="22" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.6"/>
  <ellipse cx="42" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.6"/>
  <path d="M30 33 Q32 35 34 33" stroke="${DOLL.line}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <!-- 灯泡问号气泡 -->
  <circle cx="50" cy="14" r="6" fill="${DOLL.accent}" stroke="${DOLL.line}" stroke-width="1"/>
  <text x="50" y="17" font-size="8" font-weight="800" fill="${DOLL.line}" text-anchor="middle" font-family="Arial">?</text>
  <circle cx="46" cy="22" r="1.2" fill="${DOLL.accent}"/>
  <circle cx="44" cy="25" r="0.8" fill="${DOLL.accent}"/>
</svg>`;

/* ============================================================
   5. doll-eq — 情商（比心）
   用途：情商成长
   ============================================================ */
const DollEQ = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="doll-svg">
  <path d="M16 60 Q16 44 32 42 Q48 44 48 60 Z" fill="${DOLL.body}"/>
  <rect x="22" y="41" width="20" height="3.5" rx="1" fill="${DOLL.collar}"/>
  <circle cx="26" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="32" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="38" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="32" cy="26" r="15" fill="${DOLL.skin}"/>
  <path d="M17 24 Q19 12 32 11 Q45 12 47 24 Q47 20 44 18 L42 20 L38 17 L34 20 L30 17 L26 20 L22 17 L20 20 Q17 22 17 24 Z" fill="${DOLL.hair}"/>
  <path d="M17 24 Q14 30 16 38 Q17 35 18 32" fill="${DOLL.hair}"/>
  <path d="M47 24 Q50 30 48 38 Q47 35 46 32" fill="${DOLL.hair}"/>
  <circle cx="26" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <circle cx="38" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <line x1="30.5" y1="27" x2="33.5" y2="27" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <!-- 眯眼笑 -->
  <path d="M22.5 27 Q26 30 29.5 27" stroke="${DOLL.line}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M34.5 27 Q38 30 41.5 27" stroke="${DOLL.line}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="22" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.8"/>
  <ellipse cx="42" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.8"/>
  <path d="M30 33 Q32 35.5 34 33" stroke="${DOLL.line}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <!-- 双手比心 -->
  <path d="M22 48 Q20 44 24 42 Q28 41 30 44 L32 47 L34 44 Q36 41 40 42 Q44 44 42 48 L34 56 Z" fill="${DOLL.accent}" stroke="${DOLL.line}" stroke-width="1.2" stroke-linejoin="round"/>
  <!-- 周围小爱心 -->
  <path d="M14 24 Q12 22 14 20 Q16 22 14 24 Z" fill="${DOLL.accent}"/>
  <path d="M50 20 Q48 18 50 16 Q52 18 50 20 Z" fill="${DOLL.accent}"/>
</svg>`;

/* ============================================================
   6. doll-office — 办公（敲键盘）
   用途：办公技巧
   ============================================================ */
const DollOffice = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="doll-svg">
  <path d="M16 60 Q16 44 32 42 Q48 44 48 60 Z" fill="${DOLL.body}"/>
  <rect x="22" y="41" width="20" height="3.5" rx="1" fill="${DOLL.collar}"/>
  <circle cx="26" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="32" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="38" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="32" cy="26" r="15" fill="${DOLL.skin}"/>
  <path d="M17 24 Q19 12 32 11 Q45 12 47 24 Q47 20 44 18 L42 20 L38 17 L34 20 L30 17 L26 20 L22 17 L20 20 Q17 22 17 24 Z" fill="${DOLL.hair}"/>
  <path d="M17 24 Q14 30 16 38 Q17 35 18 32" fill="${DOLL.hair}"/>
  <path d="M47 24 Q50 30 48 38 Q47 35 46 32" fill="${DOLL.hair}"/>
  <circle cx="26" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <circle cx="38" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <line x1="30.5" y1="27" x2="33.5" y2="27" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <circle cx="26" cy="28" r="1.3" fill="${DOLL.line}"/>
  <circle cx="38" cy="28" r="1.3" fill="${DOLL.line}"/>
  <ellipse cx="22" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.6"/>
  <ellipse cx="42" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.6"/>
  <path d="M30 33 Q32 34.5 34 33" stroke="${DOLL.line}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <!-- 键盘（桌前） -->
  <rect x="14" y="50" width="36" height="10" rx="2" fill="${DOLL.collar}"/>
  <rect x="16" y="52" width="32" height="3" fill="${DOLL.body2}"/>
  <!-- 键盘按键 -->
  <rect x="17" y="56" width="30" height="3" rx="0.5" fill="${DOLL.accent}"/>
  <line x1="20" y1="57.5" x2="44" y2="57.5" stroke="${DOLL.collar}" stroke-width="0.3"/>
  <!-- 双手敲键盘 -->
  <ellipse cx="20" cy="50" rx="3" ry="2" fill="${DOLL.skin}"/>
  <ellipse cx="44" cy="50" rx="3" ry="2" fill="${DOLL.skin}"/>
</svg>`;

/* ============================================================
   7. doll-brain — 脑瓜副本（日记/手账）
   用途：脑瓜副本（亲友记/生理记/饭食记/金库）
   ============================================================ */
const DollBrain = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="doll-svg">
  <path d="M16 60 Q16 44 32 42 Q48 44 48 60 Z" fill="${DOLL.body}"/>
  <rect x="22" y="41" width="20" height="3.5" rx="1" fill="${DOLL.collar}"/>
  <circle cx="26" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="32" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="38" cy="42.7" r="1" fill="${DOLL.spike}"/>
  <circle cx="32" cy="26" r="15" fill="${DOLL.skin}"/>
  <path d="M17 24 Q19 12 32 11 Q45 12 47 24 Q47 20 44 18 L42 20 L38 17 L34 20 L30 17 L26 20 L22 17 L20 20 Q17 22 17 24 Z" fill="${DOLL.hair}"/>
  <path d="M17 24 Q14 30 16 38 Q17 35 18 32" fill="${DOLL.hair}"/>
  <path d="M47 24 Q50 30 48 38 Q47 35 46 32" fill="${DOLL.hair}"/>
  <circle cx="26" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <circle cx="38" cy="27" r="4.5" fill="none" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <line x1="30.5" y1="27" x2="33.5" y2="27" stroke="${DOLL.glass}" stroke-width="1.6"/>
  <circle cx="26" cy="28" r="1.3" fill="${DOLL.line}"/>
  <circle cx="38" cy="28" r="1.3" fill="${DOLL.line}"/>
  <ellipse cx="22" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.6"/>
  <ellipse cx="42" cy="31" rx="2.5" ry="1.5" fill="${DOLL.blush}" opacity="0.6"/>
  <path d="M30 33 Q32 34.5 34 33" stroke="${DOLL.line}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <!-- 手账本 -->
  <rect x="20" y="44" width="24" height="16" rx="2" fill="${DOLL.accent}" stroke="${DOLL.line}" stroke-width="1"/>
  <rect x="20" y="44" width="4" height="16" fill="${DOLL.collar}"/>
  <line x1="26" y1="48" x2="42" y2="48" stroke="${DOLL.line}" stroke-width="0.6"/>
  <line x1="26" y1="51" x2="42" y2="51" stroke="${DOLL.line}" stroke-width="0.6"/>
  <line x1="26" y1="54" x2="38" y2="54" stroke="${DOLL.line}" stroke-width="0.6"/>
  <line x1="26" y1="57" x2="40" y2="57" stroke="${DOLL.line}" stroke-width="0.6"/>
  <!-- 笔 -->
  <line x1="46" y1="50" x2="50" y2="46" stroke="${DOLL.line}" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="46" cy="50" r="1" fill="${DOLL.skin}"/>
</svg>`;

/* ============================================================
   导出：每个动作的 SVG
   ============================================================ */
const DOLL_SVGS = {
  avatar:  DollAvatar,
  reading: DollReading,
  plan:    DollPlan,
  study:   DollStudy,
  eq:      DollEQ,
  office:  DollOffice,
  brain:   DollBrain
};
