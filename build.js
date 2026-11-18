// Praise More static site builder — no dependencies. Run: node build.js
// Edit content in content/site.json, then rebuild (Cloudflare Pages runs this automatically).
const fs = require('fs');
const path = require('path');

const D = JSON.parse(fs.readFileSync(path.join(__dirname, 'content/site.json'), 'utf8'));
const OUT = path.join(__dirname, 'dist');
const S = D.site;
const IMG = 'https://www.praise.com.hk/assets/images/uploads/';
const WA = `https://api.whatsapp.com/send?phone=${S.whatsapp}&text=${encodeURIComponent(S.whatsappText)}`;
const VER = Date.now().toString(36);
const SITE = (S.url || 'https://www.praisemore.com.hk').replace(/\/$/, '');
const TODAY = new Date().toISOString().slice(0, 10);
const P = D.pages || {};
const QUOTE = '/schools/#quote';
const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const ORG = {
  '@type': 'EducationalOrganization', '@id': `${SITE}/#org`, name: 'Praise More',
  alternateName: ['Praise', 'Praise Education Centre', 'Praise More 家庭及校園專業支援配對平台'],
  url: `${SITE}/`, logo: `${SITE}/assets/logo-512.png`, image: `${SITE}/assets/logo-512.png`,
  description: S.description, email: S.email, telephone: `+852-${S.phone.replace(/\s/g, '-')}`,
  areaServed: { '@type': 'AdministrativeArea', name: 'Hong Kong' },
  knowsLanguage: ['zh-HK', 'en'],
  contactPoint: [{ '@type': 'ContactPoint', telephone: `+852-${S.phone.replace(/\s/g, '-')}`, email: S.email, contactType: 'customer service', areaServed: 'HK', availableLanguage: ['Cantonese', 'English', 'Mandarin'] }],
  sameAs: [S.facebook, S.instagram],
  ...(S.author ? { founder: { '@type': 'Person', name: `${S.author.name} (${S.author.nameEn})`, jobTitle: S.author.role } } : {})
};
const crumbLD = list => ({ '@type': 'BreadcrumbList', itemListElement: list.map(([name, u], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + u })) });
const faqLD = faq => ({ '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const faqBlock = (faq, title = '常見問題') => faq && faq.length ? `<div class="block faq"><h2 data-reveal>${esc(title)}</h2>${faq.map(f => `<details class="faq__q" data-reveal><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>` : '';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cats = Object.fromEntries(D.categories.map(c => [c.id, c]));
const byCat = id => D.services.filter(s => s.category === id);
const svcUrl = s => `/services/${s.slug}/`;

const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  screen: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c2.9.3 5.5 2.6 5.5 5.8"/>',
  heart: '<path d="M12 20s-7-4.4-9.2-9C1.3 7.8 3.5 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.5 0 5.7 3.3 4.2 6.5C19 15.6 12 20 12 20z"/>',
  star: '<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.2-1.6-1.2-2.8 0-1 .8-1.5 1.8-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  school: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v6"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><path d="M10 10h4v4h-4z"/>',
  network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M12 7.5v4M10.3 13 6.6 16M13.7 13l3.7 3"/><circle cx="12" cy="12.5" r="1.2"/>',
  leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19c3-4 6-6.5 10-8.5"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  fb: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/>',
  ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>'
};
const icon = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.spark}</svg>`;
const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1l-.9 1.2c-.2.2-.3.2-.6.1a8.2 8.2 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.6.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15l-1.4 5 5.2-1.4A10 10 0 1 0 12 2zm0 18.3a8.3 8.3 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.3 8.3 0 1 1 12 20.3z"/></svg>';
const MARK = '<img src="/assets/logo-192.png" alt="" width="40" height="40">';

/* ---------- shell ---------- */
function head({ title, full, desc, url, graph = [], type = 'website' }) {
  const t = full || (title ? `${title}｜Praise More` : S.title);
  const abs = SITE + url;
  const g = { '@context': 'https://schema.org', '@graph': [ORG, ...graph] };
  return `<!doctype html><html lang="zh-Hant-HK"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(t)}</title>
<meta name="description" content="${esc(desc || S.description)}">
<meta name="theme-color" content="#07120a">
<meta property="og:title" content="${esc(t)}"><meta property="og:description" content="${esc(desc || S.description)}">
<meta property="og:type" content="${type}"><meta property="og:site_name" content="Praise More"><meta property="og:locale" content="zh_HK">
<meta property="og:url" content="${abs}"><meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${abs}">
<link rel="icon" href="/assets/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta property="og:image" content="${SITE}/assets/logo-512.png">
${ld(g)}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css?v=${VER}">
<script async src="https://www.googletagmanager.com/gtag/js?id=${S.gtag}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${S.gtag}');</script>
</head><body>`;
}

function megaCols() {
  return D.categories.map(c => `<div><h4>${esc(c.name)}</h4>${byCat(c.id).map(s => `<a href="${svcUrl(s)}">${esc(s.name)}</a>`).join('')}</div>`).join('');
}

function header(active, light = false) {
  const cur = k => active === k ? ' aria-current="page"' : '';
  return `<a class="sr" href="#main">跳至主要內容</a>
<header class="nav${light ? ' light' : ''}"><div class="wrap nav__in">
  <a class="brand" href="/" aria-label="Praise More 主頁"><span class="brand__mark">${MARK}</span><span>Praise <b>More</b></span></a>
  <nav class="menu" aria-label="主選單">
    <a href="/"${cur('home')}>主頁</a>
    <a href="/about/"${cur('about')}>關於我們</a>
    <div class="has-mega"><button aria-expanded="false" aria-haspopup="true">服務介紹</button><div class="mega">${megaCols()}</div></div>
    <a href="/schools/"${cur('schools')}>學校專區</a>
    <a href="/articles/"${cur('articles')}>文章</a>
    <a href="/contact/"${cur('contact')}>聯絡我們</a>
  </nav>
  <a class="btn btn--lime btn--sm" href="${WA}" target="_blank" rel="noopener">${WA_ICON}立即查詢</a>
  <button class="burger" aria-label="開啟選單" aria-expanded="false"><span></span><span></span></button>
</div></header>
<div class="drawer" aria-label="流動選單">
  <a href="/">主頁</a><a href="/about/">關於我們</a>
  <details><summary>服務介紹 +</summary>${D.categories.map(c => `<h5>${esc(c.name)}</h5>${byCat(c.id).map(s => `<a href="${svcUrl(s)}">${esc(s.name)}</a>`).join('')}`).join('')}</details>
  <a href="/schools/">學校專區</a><a href="/articles/">文章</a><a href="/history/">品牌歷程</a><a href="/contact/">聯絡我們</a>
  <a class="btn btn--lime" href="${WA}" target="_blank" rel="noopener">${WA_ICON}WhatsApp ${esc(S.phone)}</a>
</div>
<div class="glow" aria-hidden="true"></div>`;
}

function footer() {
  return `<footer class="foot"><div class="wrap">
  <div class="foot__grid">
    <div><a class="brand" href="/"><span class="brand__mark">${MARK}</span><span>Praise <b>More</b></span></a>
      <p style="margin-top:18px;max-width:320px">${esc(S.title.split('｜')[1])}。Praise 深耕香港幼兒教育 18 年，服務超過三萬個家庭。</p>
      <div class="socials"><a href="${S.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon('fb')}</a><a href="${S.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon('ig')}</a><a href="${WA}" target="_blank" rel="noopener" aria-label="WhatsApp">${WA_ICON}</a><a href="mailto:${S.email}" aria-label="電郵">${icon('mail')}</a></div></div>
    <div><h5>家長服務</h5>${byCat('family').map(s => `<a href="${svcUrl(s)}">${esc(s.name)}</a>`).join('')}</div>
    <div><h5>學校服務</h5>${byCat('school').map(s => `<a href="${svcUrl(s)}">${esc(s.name)}</a>`).join('')}<h5 style="margin-top:28px">健康環境服務</h5>${byCat('environment').map(s => `<a href="${svcUrl(s)}">${esc(s.name)}</a>`).join('')}</div>
    <div><h5>聯絡我們</h5><a href="${WA}" target="_blank" rel="noopener">總部電話 / WhatsApp<br><strong style="color:#fff">${esc(S.phone)}</strong></a><a href="mailto:${S.email}">${esc(S.email)}</a><a href="/schools/">學校專區／報價</a><a href="/articles/">文章</a><a href="/about/">關於我們</a><a href="/history/">品牌歷程</a></div>
  </div>
  <div class="foot__big" aria-hidden="true">Praise More</div>
  <div class="foot__bar"><span>COPYRIGHT © ${new Date().getFullYear()} Praise More. All Rights Reserved.</span><span>查詢 WhatsApp ${esc(S.phone)}</span></div>
</div></footer>
<a class="fab" href="${WA}" target="_blank" rel="noopener" aria-label="WhatsApp 查詢">${WA_ICON}</a>
<script type="module" src="/assets/main.js?v=${VER}"></script>
</body></html>`;
}

function hero({ variant = 'page', eyebrow, title, lead, crumbs, cta = true, home = false }) {
  const lines = Array.isArray(title) ? title : [title];
  return `<section class="hero${home ? '' : ' hero--page'}">
  <canvas id="gl" data-variant="${variant}" aria-hidden="true"></canvas><div class="hero__fallback"></div><div class="hero__grain"></div><div class="hero__shade"></div>
  <div class="wrap hero__content">
    ${crumbs ? `<div class="crumbs">${crumbs}</div>` : ''}
    <span class="eyebrow">${esc(eyebrow)}</span>
    <h1>${lines.map((l, i) => `<span class="ln"><span${i === lines.length - 1 && home ? ' class="accent"' : ''}>${esc(l)}</span></span>`).join('')}</h1>
    <div class="hero__row">
      ${lead ? `<p class="hero__lead">${esc(lead)}</p>` : '<span></span>'}
      ${cta ? `<div class="hero__cta"><a class="btn btn--lime" href="${WA}" target="_blank" rel="noopener">${WA_ICON}WhatsApp 查詢</a>${home ? `<a class="btn btn--ghost" href="/schools/">學校專區 ${icon('arrow')}</a>` : `<a class="btn btn--ghost" href="/services/">瀏覽服務 ${icon('arrow')}</a>`}</div>` : ''}
    </div>
  </div>
  ${home ? '<div class="scroll-cue">SCROLL</div>' : ''}
</section>`;
}

const ctaBlock = (title = ['一個 WhatsApp', '<span>搞掂</span>']) => `<section class="cta"><div class="cta__glow"></div><div class="wrap">
  <h2 data-reveal>${title[0]}<br>${title[1]}</h2>
  <p data-reveal data-reveal-delay="1">快速取得專業建議，為孩子配對最合適的支援服務。</p>
  <a class="btn btn--lime" data-reveal data-reveal-delay="2" href="${WA}" target="_blank" rel="noopener">${WA_ICON}WhatsApp 查詢</a>
  <a class="cta__phone num" href="${WA}" target="_blank" rel="noopener">${esc(S.phone)}</a>
</div></section>`;

const wrapWords = text => text.split(/(?<=[，。、：；])/).map(seg => [...seg].map(ch => `<span class="w">${esc(ch)}</span>`).join('')).join('');

/* ---------- pages ---------- */
function pageHome() {
  const H = D.home;
  const allNames = D.services.map(s => s.name);
  const marquee = `<div class="marquee" aria-hidden="true"><div class="marquee__track">${[0, 1].map(() => `<span>${allNames.map(n => `<span>${esc(n)}</span>`).join('')}</span>`).join('')}</div></div>`;
  const stats = H.stats.map((s, i) => `<div class="stat" data-reveal data-reveal-delay="${i}"><div class="stat__v"><span class="num" data-count="${s.value}">${Number(s.value).toLocaleString('en-US')}</span><small>${esc(s.suffix)}</small></div><div class="stat__l">${esc(s.label)}</div></div>`).join('');
  const bento = D.categories.map(c => `<article class="cat cat--${c.id}" data-tilt data-reveal>
    <div class="cat__orb"></div><span class="cat__tag">${esc(c.tagline)}</span><h3>${esc(c.name)}</h3>
    <ul>${byCat(c.id).map(s => `<li><a href="${svcUrl(s)}">${esc(s.name)}</a></li>`).join('')}</ul>
    <a class="cat__go" href="/services/#${c.id}" aria-label="查看${esc(c.name)}">${icon('arrow')}</a></article>`).join('');
  const pillars = H.pillars.map((p, i) => `<div class="pillar" data-reveal data-reveal-delay="${i}"><span class="pillar__n">0${i + 1}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join('');
  const steps = D.about.process.map((s, i) => `<div class="step" style="--i:${i + 1}"><span class="step__n">0${i + 1}</span><h3>${esc(s)}</h3><div class="step__bar"></div></div>`).join('');
  const news = H.news.items.map(n => `<div class="news__row"><b>${esc(n.label)}</b><span>${esc(n.text)}</span></div>`).join('');
  const ms = D.history.milestones.map((m, i) => `<div class="ms" data-reveal data-reveal-delay="${i}"><span class="ms__tag">${esc(m.tag)}</span><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p></div>`).join('');
  return head({ full: S.seoTitle, url: '/', graph: [{ '@type': 'WebSite', '@id': `${SITE}/#web`, url: `${SITE}/`, name: 'Praise More', inLanguage: 'zh-HK', publisher: { '@id': `${SITE}/#org` } }] }) + header('home') + `<main id="main">
  ${hero({ variant: 'home', eyebrow: H.eyebrow, title: H.heroLines, lead: H.intro, home: true })}
  ${marquee}
  <section class="sec"><div class="wrap">
    <span class="kicker">ABOUT · 關於我們</span>
    <p class="statement">${wrapWords(H.missionTitle)}</p>
    <div class="stats">${stats}</div>
  </div></section>
  <section class="sec sec--tint" id="services"><div class="wrap">
    <div class="sec-head"><div><span class="kicker">SERVICES · 服務介紹</span><h2 data-reveal>由家庭到校園<br>一站同行</h2></div><p data-reveal data-reveal-delay="1">${esc(H.news.items.map(n => n.label).join('、'))}——三大範疇、${D.services.length} 項服務，按孩子的需要精準配對。</p></div>
    <div class="bento">${bento}</div>
  </div></section>
  <section class="sec sec--dark"><div class="wrap">
    <div class="sec-head"><div><span class="kicker">WHY PRAISE MORE</span><h2 data-reveal>為甚麼選擇<br>Praise More</h2></div><p data-reveal data-reveal-delay="1">${esc(H.intro)}</p></div>
    <div class="pillars">${pillars}</div>
  </div></section>
  <section class="process sec--tint"><div class="process__pin">
    <div class="process__head"><div><span class="kicker">HOW IT WORKS · 專業配對流程</span><h2 class="h2">五步，配對最合適的導師</h2></div><span class="process__prog num">01 / 05</span></div>
    <div class="process__track">${steps}</div>
  </div></section>
  <section class="sec"><div class="wrap news">
    <div><span class="kicker">NEWS · 最新消息</span><h2 class="h2" data-reveal>${esc(H.news.title)}</h2><p style="margin-top:20px"><span class="badge">現已推出</span></p></div>
    <div class="news__card" data-reveal data-reveal-delay="1">${news}<div class="news__foot"><span>${esc(H.news.cta)}</span><a class="btn btn--lime btn--sm" href="${WA}" target="_blank" rel="noopener">${WA_ICON}WhatsApp</a></div></div>
  </div></section>
  <section class="sec sec--dark"><div class="wrap">
    <div class="sec-head"><div><span class="kicker">OUR STORY · 品牌歷程</span><h2 data-reveal>十八年<br>陪伴成長</h2></div><p data-reveal data-reveal-delay="1">${esc(D.history.lead)}</p></div>
    <div class="timeline">${ms}</div>
    <p style="margin-top:56px"><a class="btn btn--ghost" href="/history/">了解品牌歷程 ${icon('arrow')}</a></p>
  </div></section>
  ${ctaBlock()}
</main>` + footer();
}

function pageServices() {
  const groups = D.categories.map(c => `<div class="svc-group" id="${c.id}">
    <div class="svc-group__head" data-reveal><h2>${esc(c.name)}</h2><span>${esc(c.tagline)}</span></div>
    <div class="svc-list">${byCat(c.id).map(s => `<a class="svc-row" href="${svcUrl(s)}" data-reveal><span class="svc-row__i">${icon(s.icon)}</span><h3>${esc(s.name)}</h3><p>${esc(s.subtitle)}</p><span class="svc-row__go">${icon('arrow')}</span></a>`).join('')}</div>
  </div>`).join('');
  return head({ full: P.services?.seoTitle, desc: P.services?.seoDesc, url: '/services/', graph: [crumbLD([['主頁', '/'], ['服務介紹', '/services/']])] }) + header('services') + `<main id="main">
  ${hero({ eyebrow: 'SERVICES · 服務介紹', title: ['服務介紹'], lead: '家長服務、學校服務、健康環境服務——由家庭到校園，一站同行。', crumbs: '<a href="/">主頁</a> / 服務介紹' })}
  <section class="sec"><div class="wrap">${groups}</div></section>
  ${ctaBlock()}
</main>` + footer();
}

function items(list) {
  const plain = list.every(([t]) => !t);
  return `<div class="features">${list.map(([t, d], i) => `<div class="feature${t ? '' : ' feature--plain'}" data-reveal data-reveal-delay="${i % 4}"><span class="feature__n">${String(i + 1).padStart(2, '0')}</span>${t ? `<h3>${esc(t)}</h3>` : ''}${d ? `<p>${esc(d)}</p>` : ''}</div>`).join('')}</div>`;
}
function table(t) {
  return `<div class="tbl-wrap" data-reveal><table class="tbl"><thead><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function pageService(s) {
  const c = cats[s.category];
  const sib = byCat(s.category);
  const blocks = s.sections.map(sec => `<div class="block">
    <h2 data-reveal>${esc(sec.h)}</h2>${sec.p ? `<p data-reveal>${esc(sec.p)}</p>` : ''}
    ${sec.items ? items(sec.items) : ''}
    ${sec.table ? table(sec.table) : ''}
    ${sec.certs ? `<div class="certs">${sec.certs.map(c => `<figure class="cert" data-reveal>${c.img ? `<div class="cert__logo"><img src="${c.img}" alt="${esc(c.alt || c.title)}" loading="lazy"></div>` : ''}<figcaption><strong>${esc(c.title)}</strong>${c.text ? `<span>${esc(c.text)}</span>` : ''}${c.url ? `<a href="${c.url}" target="_blank" rel="noopener">${esc(c.link || '查看來源')}</a>` : ''}</figcaption></figure>`).join('')}</div>` : ''}
    ${sec.note ? `<div class="note" data-reveal>${sec.note}</div>` : ''}
    ${sec.groups ? sec.groups.map(g => `<span class="group-title">${esc(g.title)}</span>${items(g.items)}`).join('') : ''}
    ${sec.after ? `<p class="after" data-reveal>${esc(sec.after)}</p>` : ''}
  </div>`).join('');
  const notices = [];
  if (s.notice) notices.push(s.notice);
  if (s.disclaimer) notices.push('此服務屬教育訓練，並非醫療診斷或治療。');
  const others = D.services.filter(x => x.slug !== s.slug && x.category === s.category).slice(0, 3);
  const rel = (others.length ? others : D.services.filter(x => x.slug !== s.slug).slice(0, 3));
  const isSchool = s.category === 'school' || s.slug === 'campus-cleaning';
  const graph = [
    { '@type': 'Service', '@id': `${SITE}${svcUrl(s)}#service`, name: s.name, serviceType: s.name, description: s.summary || s.intro, provider: { '@id': `${SITE}/#org` }, areaServed: { '@type': 'AdministrativeArea', name: 'Hong Kong' }, audience: { '@type': 'Audience', audienceType: isSchool ? '學校' : '家長' }, url: SITE + svcUrl(s) },
    crumbLD([['主頁', '/'], ['服務介紹', '/services/'], [s.name, svcUrl(s)]])
  ];
  if (s.faq?.length) graph.push(faqLD(s.faq));
  const cta = isSchool
    ? `<a class="btn btn--lime" href="${QUOTE}">${icon('mail')}索取報價</a>`
    : `<a class="btn btn--lime" href="${WA}" target="_blank" rel="noopener">${WA_ICON}立即查詢</a>`;
  return head({ title: s.name, full: s.seoTitle, desc: s.seoDesc || `${s.name}：${s.subtitle}。${s.intro}`.slice(0, 160), url: svcUrl(s), graph }) + header('services') + `<main id="main">
  ${hero({ variant: s.category, eyebrow: `${c.name} · ${c.tagline}`, title: [s.name], lead: s.subtitle, crumbs: `<a href="/">主頁</a> / <a href="/services/">服務介紹</a> / ${esc(s.name)}`, cta: false })}
  <section class="sec"><div class="wrap detail">
    <aside class="aside"><h4>${esc(c.name)}</h4><nav>${sib.map(x => `<a href="${svcUrl(x)}"${x.slug === s.slug ? ' aria-current="page"' : ''}>${esc(x.name)}</a>`).join('')}</nav>
      ${isSchool ? `<a class="btn btn--lime" href="${QUOTE}">${icon('mail')}索取報價</a>` : `<a class="btn btn--lime" href="${WA}" target="_blank" rel="noopener">${WA_ICON}WhatsApp 查詢</a>`}</aside>
    <article>
      ${s.image ? `<figure class="feature-img" data-reveal><img src="${IMG}${s.image}" alt="${esc(s.name)}" loading="lazy"></figure>` : ''}
      <p class="lead" data-reveal>${esc(s.summary || s.intro)}</p>
      ${s.summary ? `<p class="intro2" data-reveal>${esc(s.intro)}</p>` : ''}
      ${blocks}
      ${faqBlock(s.faq)}
      ${notices.map(n => `<div class="notice" data-reveal>${icon('info')}<div><h3>重要聲明</h3><p>${esc(n)}</p></div></div>`).join('')}
      <div class="enquiry" data-reveal><div><h3>${isSchool ? '索取' : '查詢'}「${esc(s.name)}」${isSchool ? '報價' : ''}</h3><p>${isSchool ? `電郵 ${esc(S.email)}｜` : ''}WhatsApp ${esc(S.phone)}｜${esc(S.replyPromise || '')}</p></div>${cta}</div>
    </article>
  </div></section>
  <section class="sec sec--tint" style="padding-top:90px;padding-bottom:110px"><div class="wrap">
    <span class="kicker">MORE SERVICES · 其他服務</span>
    <div class="related">${rel.map(x => `<a class="rel" href="${svcUrl(x)}" data-reveal><small>${esc(cats[x.category].name)}</small><h3>${esc(x.name)}</h3><span>${esc(x.subtitle)}</span></a>`).join('')}</div>
  </div></section>
</main>` + footer();
}

function pageAbout() {
  const A = D.about;
  return head({ full: P.about?.seoTitle, desc: P.about?.seoDesc, url: '/about/', graph: [crumbLD([['主頁', '/'], ['關於我們', '/about/']])] }) + header('about') + `<main id="main">
  ${hero({ variant: 'about', eyebrow: 'ABOUT · 關於我們', title: ['關於我們'], lead: A.intro, crumbs: '<a href="/">主頁</a> / 關於我們' })}
  <section class="sec"><div class="wrap split">
    <div><span class="kicker">OUR MISSION · 我們的使命</span><p class="statement" style="font-size:clamp(26px,3vw,44px)">${wrapWords(A.mission)}</p></div>
    <div class="orb3d" data-reveal aria-hidden="true"></div>
  </div></section>
  <section class="sec sec--dark"><div class="wrap">
    <div class="sec-head"><div><span class="kicker">HOW IT WORKS</span><h2 data-reveal>專業配對流程</h2></div><p data-reveal data-reveal-delay="1">${esc(A.intro)}</p></div>
    <ol class="flow">${A.process.map((p, i) => `<li data-reveal data-reveal-delay="${i % 4}"><span>${esc(p)}</span></li>`).join('')}</ol>
  </div></section>
  <section class="sec sec--tint"><div class="wrap">
    <div class="sec-head"><div><span class="kicker">WHY PRAISE MORE</span><h2 data-reveal>我們的承諾</h2></div><p>${esc(D.home.intro)}</p></div>
    ${items(D.home.pillars.map(p => [p.title, p.text]))}
  </div></section>
  ${ctaBlock()}
</main>` + footer();
}

function pageHistory() {
  const Hs = D.history;
  const ms = Hs.milestones.map((m, i) => `<div class="ms" data-reveal data-reveal-delay="${i}"><span class="ms__tag">${esc(m.tag)}</span><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p></div>`).join('');
  const press = Hs.media.map((id, i) => `<a href="${IMG}media_interview/${id}.jpg" target="_blank" rel="noopener" aria-label="傳媒訪問 ${i + 1}"><img src="${IMG}media_interview/${id}.jpg" alt="傳媒訪問剪報 ${i + 1}" loading="lazy"></a>`).join('');
  return head({ full: P.history?.seoTitle, desc: P.history?.seoDesc, url: '/history/', graph: [crumbLD([['主頁', '/'], ['品牌歷程', '/history/']])] }) + header('history') + `<main id="main">
  ${hero({ variant: 'page', eyebrow: 'OUR STORY · 品牌歷程', title: P.history?.h1 || ['十八年', '陪伴成長'], lead: Hs.lead, crumbs: '<a href="/">主頁</a> / 品牌歷程', cta: false })}
  <section class="sec sec--dark"><div class="wrap">
    <span class="kicker">MILESTONES</span>
    <div class="timeline">${ms}</div>
  </div></section>
  <section class="sec"><div class="wrap">
    <div class="sec-head"><div><span class="kicker">PRESS · 傳媒訪問</span><h2 data-reveal>傳媒訪問</h2></div><p data-reveal>左右滑動瀏覽，點擊可放大查看。</p></div>
    <div class="press">${press}</div>
  </div></section>
  <section class="sec sec--tint"><div class="wrap">
    <div class="sec-head"><div><span class="kicker">GALLERY · 活動相簿</span><h2 data-reveal>活動相簿</h2></div><p data-reveal>${esc(Hs.albumNote)}</p></div>
    <div class="albums">${Hs.albums.map(a => `<a class="album" href="${S.facebook}" target="_blank" rel="noopener" data-reveal>${esc(a)}</a>`).join('')}</div>
  </div></section>
  ${ctaBlock()}
</main>` + footer();
}

function pageContact() {
  return head({ full: P.contact?.seoTitle, desc: P.contact?.seoDesc, url: '/contact/', graph: [crumbLD([['主頁', '/'], ['聯絡我們', '/contact/']])] }) + header('contact') + `<main id="main">
  ${hero({ variant: 'page', eyebrow: 'CONTACT · 聯絡我們', title: ['聯絡我們'], lead: '一個 WhatsApp 搞掂，快速取得專業建議。', crumbs: '<a href="/">主頁</a> / 聯絡我們', cta: false })}
  <section class="sec"><div class="wrap">
    <div class="contact-grid">
      <a class="ccard ccard--wa" href="${WA}" target="_blank" rel="noopener" data-tilt data-reveal>${WA_ICON.replace('<svg', '<svg style="width:34px;height:34px"')}<small>總部 WhatsApp</small><strong>${esc(S.phone)}</strong></a>
      <a class="ccard" href="tel:+852${S.phone.replace(/\s/g, '')}" data-tilt data-reveal data-reveal-delay="1">${icon('phone')}<small>總部電話</small><strong>${esc(S.phone)}</strong></a>
      <a class="ccard" href="mailto:${S.email}" data-tilt data-reveal data-reveal-delay="2">${icon('mail')}<small>電郵</small><strong style="font-size:clamp(20px,2vw,26px)">${esc(S.email)}</strong></a>
    </div>
    <div class="related" style="margin-top:20px">
      <a class="rel" href="${S.facebook}" target="_blank" rel="noopener" data-reveal><small>Facebook</small><h3>Praise Education Centre</h3><span>更多資訊，可到 Facebook 專頁瀏覽</span></a>
      <a class="rel" href="/schools/#quote" data-reveal><small>學校</small><h3>學校報價表格</h3><span>${esc(S.replyPromise || '')}</span></a>
      <a class="rel" href="${S.instagram}" target="_blank" rel="noopener" data-reveal data-reveal-delay="1"><small>Instagram</small><h3>@praise.playgroup.preschool</h3><span>追蹤我們的最新動態</span></a>
      <a class="rel" href="/services/" data-reveal data-reveal-delay="2"><small>服務介紹</small><h3>瀏覽全部 ${D.services.length} 項服務</h3><span>家長服務、學校服務、健康環境服務</span></a>
    </div>
  </div></section>
  ${ctaBlock()}
</main>` + footer();
}

function page404() {
  return head({ title: '找不到頁面', url: '/404' }) + header('') + `<main id="main" class="lost"><div><h1>404</h1><p style="opacity:.7;margin:10px 0 30px">找不到此頁面</p><a class="btn btn--lime" href="/">返回主頁</a></div></main>` + footer();
}

function pageSchools() {
  const Sc = D.schools;
  const schoolSvcs = D.services.filter(x => x.category === 'school' || ['campus-cleaning', 'goldshield-coating'].includes(x.slug));
  const graph = [crumbLD([['主頁', '/'], ['學校專區', '/schools/']]), faqLD(Sc.faq)];
  const opts = schoolSvcs.map(x => `<label class="chk"><input type="checkbox" name="services" value="${esc(x.name)}"><span>${esc(x.name)}</span></label>`).join('');
  return head({ full: Sc.seoTitle, desc: Sc.seoDesc, url: '/schools/', graph }) + header('schools') + `<main id="main">
  ${hero({ variant: 'school', eyebrow: 'FOR SCHOOLS · 學校專區', title: ['學校服務專區'], lead: Sc.lead, crumbs: '<a href="/">主頁</a> / 學校專區', cta: false })}
  <section class="sec"><div class="wrap">
    <div class="sec-head"><div><span class="kicker">SERVICES · 學校服務</span><h2 data-reveal>為學校而設的服務</h2></div><p data-reveal>按學校類別、學生程度及時間表度身安排，並提供服務報告，方便學校申報津貼。</p></div>
    <div class="related">${schoolSvcs.map(x => `<a class="rel" href="${svcUrl(x)}" data-reveal><small>${esc(cats[x.category].name)}</small><h3>${esc(x.name)}</h3><span>${esc(x.subtitle)}</span></a>`).join('')}</div>
  </div></section>
  <section class="sec sec--tint"><div class="wrap">
    <div class="sec-head"><div><span class="kicker">FUNDING · 津貼運用</span><h2 data-reveal>可配合的教育局津貼</h2></div><p data-reveal>${esc(Sc.funding.note)}</p></div>
    <div class="tbl--wrap-all">${table({ head: Sc.funding.head, rows: Sc.funding.rows })}</div>
    <p class="src" data-reveal>資料來源：${Sc.funding.sources.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`).join('、')}</p>
  </div></section>
  <section class="sec sec--dark"><div class="wrap">
    <div class="sec-head"><div><span class="kicker">ASSURANCE · 合規保障</span><h2 data-reveal>學校的保障</h2></div><p data-reveal>${esc(S.tutorCheck || '')}。</p></div>
    <div class="pillars">${Sc.assurance.map(([t, x], i) => `<div class="pillar" data-reveal data-reveal-delay="${i}"><span class="pillar__n">0${i + 1}</span><h3>${esc(t)}</h3><p>${esc(x)}</p></div>`).join('')}</div>
  </div></section>
  <section class="sec" id="quote"><div class="wrap quote">
    <div><span class="kicker">QUOTATION · 索取報價</span><h2 class="h2" data-reveal>學校報價表格</h2><p style="margin-top:18px;color:var(--muted)" data-reveal>填寫以下資料，我們會在${esc(S.replyPromise || '一個工作天內回覆')}。亦可直接電郵 <a href="mailto:${S.email}">${esc(S.email)}</a> 或 WhatsApp ${esc(S.phone)}。</p></div>
    <form class="qform" id="quote-form" action="/api/quote" method="post" novalidate>
      <div class="qgrid">
        <label>學校名稱 *<input name="school" required maxlength="120" autocomplete="organization"></label>
        <label>學校類別 *<select name="schoolType" required><option value="">請選擇</option><option>幼稚園</option><option>小學</option><option>中學</option><option>特殊學校</option><option>其他</option></select></label>
        <label>聯絡人姓名及職位 *<input name="name" required maxlength="80" autocomplete="name"></label>
        <label>聯絡電話 *<input name="phone" required maxlength="30" inputmode="tel" autocomplete="tel"></label>
        <label class="full">電郵 *<input name="email" type="email" required maxlength="120" autocomplete="email"></label>
      </div>
      <fieldset><legend>查詢服務（可選多項）</legend><div class="chks">${opts}</div></fieldset>
      <div class="qgrid">
        <label>預計學生人數<input name="students" maxlength="40"></label>
        <label>上課日子／時段<input name="schedule" maxlength="80"></label>
        <label class="full">其他要求<textarea name="message" rows="4" maxlength="2000"></textarea></label>
      </div>
      <label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
      <input type="hidden" name="t" value="">
      <button class="btn btn--lime" type="submit">${icon('mail')}提交報價查詢</button>
      <p class="qmsg" role="status" aria-live="polite"></p>
    </form>
  </div></section>
  <section class="sec sec--tint"><div class="wrap" style="max-width:900px">${faqBlock(Sc.faq)}</div></section>
  ${ctaBlock()}
</main>
<script>
(() => {
  const f = document.getElementById('quote-form'); if (!f) return;
  f.t.value = Date.now();
  const msg = f.querySelector('.qmsg'), btn = f.querySelector('button');
  f.addEventListener('submit', async e => {
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    btn.disabled = true; msg.textContent = '提交中…'; msg.className = 'qmsg';
    const data = Object.fromEntries(new FormData(f)); data.services = [...f.querySelectorAll('[name=services]:checked')].map(x => x.value);
    try {
      const r = await fetch('/api/quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'error');
      f.reset(); msg.textContent = '已收到你的查詢，我們會在${esc(S.replyPromise || '一個工作天內回覆')}。'; msg.className = 'qmsg ok';
      if (window.gtag) gtag('event', 'generate_lead', { form: 'school_quote' });
    } catch (err) {
      msg.innerHTML = '提交未成功，請直接電郵 <a href="mailto:${S.email}">${S.email}</a> 或 WhatsApp ${S.phone}。'; msg.className = 'qmsg err';
    } finally { btn.disabled = false; }
  });
})();
</script>` + footer();
}

const A = D.articles || [];
const artUrl = a => `/articles/${a.slug}/`;
function renderBody(body) {
  const link = t => esc(t);
  return body.map(([k, v]) => k === 'p' ? `<p>${link(v)}</p>` : k === 'h2' ? `<h2>${esc(v)}</h2>` : k === 'ul' ? `<ul>${v.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : k === 'ol' ? `<ol>${v.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : '').join('');
}
function authorBox() {
  const au = S.author;
  return au ? `<div class="author" data-reveal><span class="author__i">${esc(au.name.slice(0, 1))}</span><div><strong>${esc(au.name)}（${esc(au.nameEn)}）</strong><p>${esc(au.bio)}</p></div></div>` : '';
}
function pageArticles() {
  const graph = [crumbLD([['主頁', '/'], ['文章', '/articles/']]), { '@type': 'CollectionPage', name: '文章｜Praise More', url: `${SITE}/articles/`, hasPart: A.map(a => ({ '@type': 'Article', headline: a.title, url: SITE + artUrl(a) })) }];
  return head({ full: '家長及學校實用文章｜影子老師、SEN、AI 教育｜Praise More', desc: '由 Praise More 團隊撰寫：影子老師、SEN 支援、專注力訓練、學校津貼及 AI 教育的實用指南。', url: '/articles/', graph }) + header('articles') + `<main id="main">
  ${hero({ eyebrow: 'ARTICLES · 文章', title: ['實用文章'], lead: '給家長及學校的實用指南：影子老師、SEN 支援、學校津貼及 AI 教育。', crumbs: '<a href="/">主頁</a> / 文章', cta: false })}
  <section class="sec"><div class="wrap"><div class="related">${A.map(a => `<a class="rel" href="${artUrl(a)}" data-reveal><small>${esc(a.date)}</small><h3>${esc(a.title)}</h3><span>${esc(a.desc)}</span></a>`).join('')}</div></div></section>
  ${ctaBlock()}
</main>` + footer();
}
function pageArticle(a) {
  const au = S.author || {};
  const graph = [
    { '@type': 'Article', '@id': `${SITE}${artUrl(a)}#article`, headline: a.title, description: a.desc, datePublished: a.date, dateModified: a.modified || a.date, inLanguage: 'zh-HK', mainEntityOfPage: SITE + artUrl(a), image: `${SITE}/assets/logo-512.png`,
      author: { '@type': 'Person', name: `${au.name} (${au.nameEn})`, jobTitle: au.role, worksFor: { '@id': `${SITE}/#org` } }, publisher: { '@id': `${SITE}/#org` } },
    crumbLD([['主頁', '/'], ['文章', '/articles/'], [a.title, artUrl(a)]])
  ];
  const rel = (a.related || []).map(sl => D.services.find(x => x.slug === sl)).filter(Boolean);
  return head({ full: `${a.title}｜Praise More`, desc: a.desc, url: artUrl(a), graph, type: 'article' }) + header('articles') + `<main id="main">
  ${hero({ eyebrow: `ARTICLE · ${a.date}`, title: [a.title], crumbs: '<a href="/">主頁</a> / <a href="/articles/">文章</a>', cta: false })}
  <section class="sec"><div class="wrap article">
    <p class="byline">${esc(au.name)}（${esc(au.nameEn)}）· ${esc(au.role)} · <time datetime="${a.date}">${esc(a.date)}</time></p>
    <div class="prose">${renderBody(a.body)}</div>
    ${a.sources ? `<p class="src">資料來源：${a.sources.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`).join('、')}</p>` : ''}
    ${authorBox()}
    ${rel.length ? `<div class="related" style="margin-top:40px">${rel.map(x => `<a class="rel" href="${svcUrl(x)}"><small>相關服務</small><h3>${esc(x.name)}</h3><span>${esc(x.subtitle)}</span></a>`).join('')}</div>` : ''}
  </div></section>
  ${ctaBlock()}
</main>` + footer();
}

/* ---------- write ---------- */
function write(rel, html) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
}
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(__dirname, 'static'), OUT, { recursive: true });
write('index.html', pageHome());
write('services/index.html', pageServices());
D.services.forEach(s => write(`services/${s.slug}/index.html`, pageService(s)));
write('about/index.html', pageAbout());
write('history/index.html', pageHistory());
write('contact/index.html', pageContact());
write('schools/index.html', pageSchools());
write('articles/index.html', pageArticles());
A.forEach(a => write(`articles/${a.slug}/index.html`, pageArticle(a)));
write('404.html', page404());

// Old praise.com.hk URLs → new pages (useful once the domain points here)
const oldName = { 'home-cleaning': '家居清潔及消毒', 'campus-cleaning': '校園清潔及消毒', 'sen-support': 'SEN專業支援', 'sen-classes': 'SEN興趣班', 'ai-school-courses': 'AI到校課程', 'smart-learning-plan': '智啟學教計劃' };
const enc = s => encodeURIComponent(s);
const redirects = [
  `/${enc('關於我們')} /about/ 301`, `/${enc('聯絡我們')} /contact/ 301`, `/${enc('課程介紹')} /services/ 301`,
  `/${enc('分校網絡')} /history/ 301`, `/${enc('傳媒訪問')} /history/ 301`, `/${enc('活動相簿')} /history/ 301`, `/${enc('活動相簿')}/* /history/ 301`,
  ...D.services.map(s => `/${enc('課程介紹')}/${enc(oldName[s.slug] || s.name)} ${svcUrl(s)} 301`)
];
write('_redirects', redirects.join('\n') + '\n');
const urls = ['/', '/about/', '/services/', '/schools/', '/articles/', '/history/', '/contact/', ...D.services.map(svcUrl), ...A.map(artUrl)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('')}</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Built ${urls.length + 1} pages → dist/`);
