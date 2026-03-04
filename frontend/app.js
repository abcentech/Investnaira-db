/**
 * InvestNaira — Unified Platform SPA
 * ════════════════════════════════════════════════════════════════
 *
 * Architecture:  Vanilla JS hash-router · two files · no build step
 * Backend:       Django REST + JWT (api/v1/*)
 * Frontend prev: Next.js (replaced here with SPA for marketing site)
 *
 * Brands & routes:
 *   Hub        #/                  — portal, choose your path
 *   Wealth     #/wealth            — invest, grow, build wealth for life
 *              #/wealth/how-it-works
 *              #/wealth/investments
 *              #/wealth/features
 *              #/wealth/referral
 *              #/wealth/get-started
 *   Research   #/research          — independent market intelligence
 *              #/research/:slug    — category deep-dive
 *              #/reports           — full report archive
 *              #/subscribe         — pricing
 *              #/about             — company
 *              #/faq               — FAQ
 *
 * Design:
 *   Hub:        Dramatic split — gold left / green right
 *   Wealth:     Warm dark — forest green bg, gold accent, aspirational
 *   Research:   Editorial dark — forest green bg, precision green accent
 *
 * Data sourced from:
 *   - investnaira_api_schema.yaml  (wallet, transactions, campaigns, referrals, chatbot)
 *   - README_LOCAL.md              (Django + Next.js stack confirmation)
 *   - Domain knowledge of Nigerian fintech & investment landscape
 */

'use strict';

/* ════════════════════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════════════════════ */

const TICKER_DATA = [
  { sym:'NGX ASI',     price:'97,842.15',  change:'+2.34%', up:true  },
  { sym:'USD/NGN',     price:'₦1,647.50',  change:'+0.18%', up:true  },
  { sym:'DANGCEM',     price:'₦312.40',    change:'+1.20%', up:true  },
  { sym:'GTCO',        price:'₦58.25',     change:'-0.43%', up:false },
  { sym:'SEPLAT',      price:'₦4,288',     change:'+3.15%', up:true  },
  { sym:'BRENT',       price:'$78.42',     change:'-0.87%', up:false },
  { sym:'GOLD',        price:'$2,684',     change:'+0.54%', up:true  },
  { sym:'EUR/NGN',     price:'₦1,732',     change:'-0.22%', up:false },
  { sym:'ZENITHBANK',  price:'₦42.80',     change:'+0.70%', up:true  },
  { sym:'BTC/NGN',     price:'₦168.4M',    change:'+1.84%', up:true  },
  { sym:'BONNY LIGHT', price:'$80.15',     change:'+0.34%', up:true  },
  { sym:'MTNN',        price:'₦228.50',    change:'-1.10%', up:false },
];

/* Curated investment campaigns — sourced from /api/v1/campaigns */
const CAMPAIGNS = [
  {
    id: 'dangote-refinery',
    sector: 'Energy · Infrastructure',
    sectorColor: '#C9A04A',
    name: 'Dangote Refinery Growth Fund',
    desc: 'Participate in Nigeria\'s largest private infrastructure project. The 650,000 bpd refinery transforms the country\'s downstream energy economics — and your returns.',
    target: '₦500M',
    raised: '₦387M',
    raisedPct: 77,
    returns: '18.5% p.a.',
    tenure: '24 months',
    minInvest: '₦50,000',
    status: 'ACTIVE',
  },
  {
    id: 'lekki-reit',
    sector: 'Real Estate · Lagos',
    sectorColor: '#E8A87C',
    name: 'Lekki Corridor REIT',
    desc: 'Fractional ownership in premium Lekki Phase 1 commercial real estate. Quarterly rental income distributions plus long-term capital appreciation.',
    target: '₦1.2B',
    raised: '₦944M',
    raisedPct: 79,
    returns: '14.2% p.a.',
    tenure: '36 months',
    minInvest: '₦25,000',
    status: 'ACTIVE',
  },
  {
    id: 'agri-tech-fund',
    sector: 'Agriculture · Commodities',
    sectorColor: '#3DBA7A',
    name: 'Nigerian AgriTech Income Fund',
    desc: 'Finance working capital for verified Nigerian agricultural processors. Cocoa, sesame, and cashew export cycles with predictable quarterly returns.',
    target: '₦250M',
    raised: '₦201M',
    raisedPct: 80,
    returns: '16.0% p.a.',
    tenure: '12 months',
    minInvest: '₦10,000',
    status: 'ACTIVE',
  },
  {
    id: 'ngx-equity-basket',
    sector: 'Equities · NGX',
    sectorColor: '#A78BFA',
    name: 'NGX Blue-Chip Equity Basket',
    desc: 'A managed basket of 8 NGX-listed companies across banking, consumer goods, and telecoms — diversified, liquid, and rebalanced quarterly.',
    target: '₦800M',
    raised: '₦312M',
    raisedPct: 39,
    returns: '22.0% p.a.*',
    tenure: 'Open-ended',
    minInvest: '₦5,000',
    status: 'ACTIVE',
  },
  {
    id: 'dollar-money-market',
    sector: 'Currency · USD',
    sectorColor: '#008751',
    name: 'USD Money Market Fund',
    desc: 'Preserve and grow dollar savings via short-term US Treasury bills and investment-grade commercial paper. Hedge against naira devaluation.',
    target: '$2M',
    raised: '$1.4M',
    raisedPct: 70,
    returns: '5.8% p.a.',
    tenure: 'Rolling 90 days',
    minInvest: '$100',
    status: 'ACTIVE',
  },
  {
    id: 'abuja-housing',
    sector: 'Real Estate · Abuja',
    sectorColor: '#E8A87C',
    name: 'Abuja Residential Development Fund',
    desc: 'Co-invest in four residential developments across Maitama and Jahi. Exit via unit sales at project completion.',
    target: '₦2B',
    raised: '₦580M',
    raisedPct: 29,
    returns: '21.0% target',
    tenure: '30 months',
    minInvest: '₦100,000',
    status: 'COMING SOON',
  },
];

const WEALTH_FEATURES = [
  {
    icon: '◎',
    name: 'NGN & USD Wallets',
    desc: 'Fund your account in naira or dollars. Both wallets earn daily returns while uninvested. Card, bank transfer, or USSD — your choice.',
  },
  {
    icon: '▲',
    name: 'Curated Campaigns',
    desc: 'Every investment opportunity on InvestNaira is vetted by our team. We turn down more deals than we list. When you invest here, we\'ve already done the groundwork.',
  },
  {
    icon: '₦',
    name: 'Returns Tracking',
    desc: 'See exactly where your money is, what it\'s earning, and when payments are due. Real-time transaction history: deposits, investments, and returns all in one place.',
  },
  {
    icon: '↗',
    name: 'Referral Rewards',
    desc: 'Earn when the people you invite invest. Every successful referral adds bonus returns to your wallet — automatically, no claims process required.',
  },
  {
    icon: '⬡',
    name: 'AI Research Chatbot',
    desc: 'Ask our investment AI anything — about your portfolio, the Nigerian market, or a specific campaign. Backed by InvestNaira Research data.',
  },
  {
    icon: '◈',
    name: 'Business Accounts',
    desc: 'Nigerian businesses can invest surplus cash, manage team portfolios, and access corporate-grade reporting. Full API access for treasury integration.',
  },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    name: 'Create your account',
    desc: 'Sign up in under 3 minutes. Email, phone number, BVN verification. Individual or Business account — both supported.',
  },
  {
    num: '02',
    name: 'Fund your wallet',
    desc: 'Deposit naira via bank transfer, card, or USSD. Or fund in USD and earn in dollars. Your wallet starts working from day one.',
  },
  {
    num: '03',
    name: 'Choose an investment',
    desc: 'Browse curated campaigns across real estate, equities, commodities, and more. See projected returns, tenure, minimum investment, and full campaign details before you commit.',
  },
  {
    num: '04',
    name: 'Watch it grow',
    desc: 'Track returns in real-time. Reinvest or withdraw to your bank account at maturity. No lock-in surprises — every campaign terms are stated upfront.',
  },
];

const RESEARCH_CATEGORIES = [
  { slug:'equities',     name:'Equities',     icon:'▲', badge:'equity',     desc:'Deep-dive company analysis across the Nigerian Exchange. Earnings models, DCF valuations, sector rotation signals — built for conviction investing.', count:'142 active coverage', color:'var(--c-pos)' },
  { slug:'real-estate',  name:'Real Estate',  icon:'⬡', badge:'realestate', desc:'Lagos and Abuja commercial and residential markets. Rental yields, capital appreciation trends, and the infrastructure projects reshaping valuations.', count:'Lagos · Abuja · Port Harcourt', color:'#E8A87C' },
  { slug:'commodities',  name:'Commodities',  icon:'◈', badge:'commodity',  desc:'Crude oil Bonny Light benchmarking, agricultural commodities, and precious metals — with Nigeria\'s unique supply-chain dynamics modelled in.', count:'Crude · Agri · Metals', color:'var(--c-wealth)' },
  { slug:'cryptocurrency',name:'Cryptocurrency',icon:'◎',badge:'crypto',    desc:'Bitcoin, Ethereum, and stablecoins through a Nigerian lens. P2P market dynamics, CBN regulatory posture, and on-chain metrics that matter.', count:'BTC · ETH · USDT · On-chain', color:'#A78BFA' },
  { slug:'currency',     name:'Currency & FX',icon:'₦', badge:'currency',   desc:'₦/USD, ₦/GBP, parallel market tracking, CBN policy analysis. We map the divergence between official and market rates so you don\'t have to.', count:'Daily FX briefs', color:'var(--c-research)' },
];

const RESEARCH_DETAIL = {
  equities: `<p>Our equities research covers every stock on the NGX with market cap above ₦5 billion. Coverage includes detailed earnings models updated quarterly, entry and exit price targets with full rationale, and sector-level thematic notes.</p><p>Key coverage: banking sector (GTCO, Zenith, Access, UBA), industrials (Dangote Cement, BUA Cement, Lafarge), oil and gas (Seplat, Total Energies), and telecoms (MTNN, Airtel Africa). We also cover mid-cap names with high conviction.</p><p>We publish a weekly NGX brief every Monday and a monthly deep-dive sector report. When an earnings release or major corporate event changes our thesis, we publish an update within 48 hours — not at the next scheduled cycle.</p>`,
  'real-estate': `<p>Nigeria's real estate market is bifurcated: dollar-denominated prime assets in Ikoyi and Victoria Island operate by entirely different rules to naira-priced mass-market housing in Lekki Phase 2 or Abuja's Gwarinpa. We cover both with the rigour neither typically receives.</p><p>Our quarterly Lagos Market Report tracks asking rents, actually achieved rents (different numbers), vacancy rates by micromarket, and the supply pipeline. We interview landlords, estate agents, and developers — then cross-check with transactional data.</p><p>Coverage areas: Ikoyi, Victoria Island, Lekki Phases 1–5, Ajah, Ikeja GRA, Surulere, Yaba in Lagos; Maitama, Wuse 2, Asokoro, Gwarinpa, Jahi in Abuja; GRA and Old GRA in Port Harcourt.</p>`,
  commodities: `<p>Nigeria is Africa's largest oil producer. Understanding where Bonny Light trades relative to Brent — and why that spread moves — is essential for understanding the fiscal position, the naira, and every equity with upstream exposure.</p><p>Beyond crude: we track cocoa (Nigeria is the world's 4th largest producer), palm oil, sesame, and cashew. Agricultural commodity prices affect farm income, rural spending, and bank NPLs in ways equity analysts rarely model. The Dangote Refinery changes downstream economics permanently — we track its ramp-up and model its full impact.</p>`,
  cryptocurrency: `<p>Nigeria is consistently among the world's top 3 countries for crypto adoption by volume. Not retail speculation — practical use: remittances, dollar savings, cross-border payments, and increasingly corporate treasury management.</p><p>We cover this with the nuance it deserves. The spread between official USD/NGN and the P2P USDT rate tells you more about real naira sentiment than any CBN press release. We track it daily and publish it in our morning brief.</p><p>Coverage: Bitcoin price and on-chain analysis (MVRV, SOPR, exchange flows), Ethereum fundamentals, USDT/USDC P2P spreads, Binance P2P market depth, CBN regulatory developments, and the intersection with traditional Nigerian financial markets.</p>`,
  currency: `<p>The naira is the single biggest variable in every Nigerian investment. Getting FX right — the direction, the policy regime, the parallel market premium — determines portfolio outcomes more than any individual stock pick.</p><p>We publish a daily FX brief: official NIFEX rate, CBN intervention volumes, Abokifx parallel rate, BDC rates across Lagos and Abuja, and 30-day trend commentary. Subscribers get this before markets open at 9:30am.</p><p>Monthly: deep analysis of CBN policy, foreign reserve position, oil export receipts, remittance inflows, and our ₦/USD 3-month and 6-month range forecast with full scenario analysis.</p>`,
};

const REPORTS = [
  { id:1,  type:'equity',     title:'Dangote Refinery: The ₦3.8 Trillion Opportunity Hiding in Plain Sight',            date:'Nov 18, 2025', plan:'starter' },
  { id:2,  type:'realestate', title:'Lagos Real Estate Q4 2025: Where Smart Money Is Moving After Naira Stabilisation',  date:'Nov 14, 2025', plan:'starter' },
  { id:3,  type:'equity',     title:'GTCO Holdings: Nigeria\'s Answer to Berkshire Hathaway?',                           date:'Nov 11, 2025', plan:'pro' },
  { id:4,  type:'commodity',  title:'Bonny Light vs Brent: The Nigerian Premium in 2026 and What Drives It',             date:'Nov 08, 2025', plan:'pro' },
  { id:5,  type:'currency',   title:'CBN Rate Hold: What ₦1,650/$1 Means for Your Portfolio Right Now',                  date:'Nov 05, 2025', plan:'starter' },
  { id:6,  type:'equity',     title:'Seplat Energy Q3 2025 — Initiating Coverage: Strong Buy at ₦4,100',                date:'Oct 29, 2025', plan:'pro' },
  { id:7,  type:'crypto',     title:'Bitcoin P2P Premium: Why Nigeria\'s BTC Rate Diverges from Global Spot',            date:'Oct 22, 2025', plan:'pro' },
  { id:8,  type:'realestate', title:'Ikoyi vs Lekki: The Two-Speed Lagos Property Market in 2026',                       date:'Oct 15, 2025', plan:'business' },
  { id:9,  type:'commodity',  title:'Nigerian Cocoa Season 2025/26: Supply Disruption and the Price Impact',             date:'Oct 09, 2025', plan:'pro' },
  { id:10, type:'currency',   title:'Foreign Reserve Position: Nigeria\'s FX Buffer vs the Import Bill',                 date:'Oct 02, 2025', plan:'starter' },
  { id:11, type:'equity',     title:'BUA Foods — Initiating Coverage: Neutral, Watch ₦368 for Entry',                   date:'Sep 25, 2025', plan:'pro' },
  { id:12, type:'crypto',     title:'USDT P2P Spread Analysis: Reading the Parallel FX Market Through Crypto',           date:'Sep 18, 2025', plan:'business' },
];

const RESEARCH_PLANS = [
  {
    id:'individual', name:'Individual',
    monthly:10000, yearly:100000, yearlySave:'₦20,000 saved',
    featured:false, cta:'Start free trial', ctaStyle:'outline',
    features:[
      {text:'Nigeria Weekly Market Brief',     inc:true},
      {text:'1 Sector Report per month',       inc:true},
      {text:'Opportunity Alerts (bi-weekly)',  inc:true},
      {text:'Company Profiles',                inc:false},
      {text:'Due Diligence Reports',           inc:false},
      {text:'Regulatory Intelligence',         inc:false},
      {text:'Analyst messaging',               inc:false},
    ],
  },
  {
    id:'professional', name:'Professional',
    monthly:25000, yearly:250000, yearlySave:'₦50,000 saved',
    featured:true, cta:'Subscribe now', ctaStyle:'primary',
    features:[
      {text:'Everything in Individual',         inc:true},
      {text:'2 Sector Reports per month',       inc:true},
      {text:'2 Company Profiles per month',     inc:true},
      {text:'1 Due Diligence Report per month', inc:true},
      {text:'Full Regulatory Intelligence',     inc:true},
      {text:'Analyst messaging (5 queries/mo)', inc:true},
      {text:'Team access',                      inc:false},
    ],
  },
  {
    id:'business', name:'Business',
    monthly:300000, yearly:2500000, yearlySave:'₦1.1M saved',
    featured:false, cta:'Contact us', ctaStyle:'outline',
    features:[
      {text:'Everything in Professional',          inc:true},
      {text:'Unlimited Sector Reports',            inc:true},
      {text:'5 Company Profiles per month',        inc:true},
      {text:'3 Due Diligence Reports per month',   inc:true},
      {text:'Up to 3 team members',                inc:true},
      {text:'Unlimited analyst messaging',         inc:true},
      {text:'1 Custom research brief per month',   inc:true},
    ],
  },
];

const FAQS_RESEARCH = [
  { q:'What makes InvestNaira Research different from broker research?', a:'Stockbroker research has a structural conflict: they earn when you trade, which biases recommendations toward activity. We earn only subscription revenue, so we are free to say "hold" or "do nothing" when that\'s the right call. Our coverage is also broader — equities, real estate, FX, commodities, and crypto in one subscription.' },
  { q:'How often are reports published?', a:'The Nigeria Weekly Brief goes out every Monday before 8am. Sector Reports are published on the 1st of each month. Company Profiles and Due Diligence Reports are published within 5 business days of a trigger event. FX briefs are daily, Monday to Friday.' },
  { q:'Do you cover cryptocurrency?', a:'Yes — seriously. Nigeria is consistently top 3 globally for P2P crypto volume, and the USDT parallel rate is one of the most accurate real-time signals of naira sentiment. Our crypto coverage focuses on what matters for Nigerian investors: BTC/NGN and ETH/NGN pricing, P2P market dynamics, CBN regulatory developments, and how crypto intersects with traditional Nigerian capital markets.' },
  { q:'Are reports available as PDFs?', a:'Yes. Every report is a formatted PDF available immediately on publication. Reports stay in your archive permanently — no expiry on back catalogue access for active subscribers.' },
  { q:'Can I cancel my subscription?', a:'Yes, at any time. Cancel from your account settings and your access continues to the end of your billing period. No cancellation fees.' },
  { q:'How does analyst messaging work?', a:'Professional plan subscribers submit up to 5 research queries per month via the messaging portal. An analyst responds within 2 business days. Business subscribers have unlimited queries and a dedicated analyst relationship.' },
  { q:'Is there a free trial?', a:'Yes. Individual and Professional plans come with a 7-day free trial — no credit card required. You get full access during the trial.' },
  { q:'Does InvestNaira Research give financial advice?', a:'No. We provide research and analysis — we share our views, models, and reasoning. We do not hold a portfolio management or investment advisory licence. Investment decisions are yours to make.' },
];

const FAQS_WEALTH = [
  { q:'How does InvestNaira keep my money safe?', a:'All client funds are held in segregated accounts with licensed Nigerian financial institutions — separate from InvestNaira\'s operating accounts. Your investment is backed by the underlying asset in each campaign. We are registered with the Securities and Exchange Commission (SEC) Nigeria.' },
  { q:'What is the minimum investment?', a:'Campaigns have different minimums based on the asset class. Our lowest minimum is ₦5,000 for the NGX Equity Basket — accessible enough that anyone starting out can begin immediately. Some property and infrastructure campaigns start from ₦25,000.' },
  { q:'How do returns work?', a:'Each campaign specifies its return structure upfront — whether quarterly distributions, lump sum at maturity, or continuous. When returns are paid, they land in your InvestNaira wallet automatically. You can reinvest immediately or withdraw to your bank account.' },
  { q:'Can I withdraw before a campaign matures?', a:'Most campaigns have a fixed tenure, which is stated clearly before you invest. Some campaigns offer a secondary market for early exits. Withdrawal outside tenure may be subject to an early exit fee — this is disclosed per campaign.' },
  { q:'Do you support USD investments?', a:'Yes. You can fund a USD wallet via international transfer or by converting naira at competitive rates. Dollar-denominated campaigns are available for subscribers who want to hedge against naira devaluation.' },
  { q:'What is the referral programme?', a:'When someone you refer completes their first investment, you earn a referral bonus credited directly to your wallet. The more active investors you refer, the more you earn. There is no cap on referral earnings.' },
  { q:'Are you regulated?', a:'InvestNaira is registered with the Securities and Exchange Commission (SEC) Nigeria. All campaigns listed on the platform are reviewed by our legal and compliance team before going live.' },
  { q:'Do you support business accounts?', a:'Yes. Business accounts have access to all the same investments as individual accounts, plus higher campaign limits, team member access, and full API integration for treasury systems. Contact us for business onboarding.' },
];

const SOCIAL = [
  { platform:'Telegram',  handle:'@InvestNaira', url:'https://t.me/investnaira',                 icon:'✈' },
  { platform:'Instagram', handle:'@InvestNaira', url:'https://instagram.com/investnaira',        icon:'◉' },
  { platform:'LinkedIn',  handle:'InvestNaira',  url:'https://linkedin.com/company/investnaira', icon:'in' },
  { platform:'X',         handle:'@InvestNaira', url:'https://x.com/investnaira',               icon:'✕' },
];

/* ════════════════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════════════════ */

const pRM  = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const isMob = () => window.matchMedia('(max-width:768px)').matches;

function fmt(n) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  return `₦${n.toLocaleString('en-NG')}`;
}

function typeBadge(type) {
  const cls  = {equity:'equity',realestate:'realestate',commodity:'commodity',crypto:'crypto',currency:'currency'};
  const lbl  = {equity:'Equity',realestate:'Real Estate',commodity:'Commodity',crypto:'Crypto',currency:'Currency'};
  return `<span class="type-badge ${cls[type]||''}">${lbl[type]||type}</span>`;
}

function progressBar(pct, color='var(--c-research)') {
  return `
    <div style="height:4px;background:var(--c-border);border-radius:2px;overflow:hidden;margin-block-end:var(--sp-xs);">
      <div style="height:100%;width:${pct}%;background:${color};border-radius:2px;transition:width .8s var(--ease-expo);"></div>
    </div>
    <div style="display:flex;justify-content:space-between;">
      <span style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">${pct}% raised</span>
    </div>
  `;
}

/* ════════════════════════════════════════════════════════════════
   ROUTER
════════════════════════════════════════════════════════════════ */

class Router {
  constructor() { this.routes = {}; }

  on(pattern, handler) { this.routes[pattern] = handler; return this; }

  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    if (this.routes[hash]) { this.routes[hash]({}); return; }
    for (const pattern of Object.keys(this.routes)) {
      if (!pattern.includes(':')) continue;
      const re = new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$');
      const m  = hash.match(re);
      if (m) {
        const keys   = [...pattern.matchAll(/:(\w+)/g)].map(x => x[1]);
        const params = Object.fromEntries(keys.map((k,i) => [k, m[i+1]]));
        this.routes[pattern](params);
        return;
      }
    }
    if (this.routes['/']) this.routes['/']({});
  }

  init() {
    window.addEventListener('hashchange', () => { window.scrollTo(0,0); this.resolve(); });
    this.resolve();
  }
}

/* ════════════════════════════════════════════════════════════════
   CHROME — header, footer, ticker
════════════════════════════════════════════════════════════════ */

let currentBrand = 'hub';

function setChrome(brand) {
  currentBrand = brand;
  document.body.setAttribute('data-brand', brand);

  const hdr       = document.getElementById('site-header');
  const logoText  = document.getElementById('logo-text');
  const logoSub   = document.getElementById('logo-sub');
  const navLinks  = document.getElementById('nav-links');
  const bsWlt     = document.getElementById('bs-wealth');
  const bsRes     = document.getElementById('bs-research');
  const brandSwit = document.getElementById('brand-switch');
  const navCta    = document.getElementById('nav-cta');
  const hamburger = document.getElementById('hamburger');
  const tickerBar = document.getElementById('ticker-bar');
  const footer    = document.getElementById('site-footer');
  const mobileNav = document.getElementById('mobile-nav');

  // Hub — minimal header, no ticker, no footer
  if (brand === 'hub') {
    hdr.className = 'site-header hidden';
    tickerBar.style.display = 'none';
    footer.style.display    = 'none';
    hamburger.style.display = 'none';
    brandSwit.style.display = 'none';
    navCta.style.display    = 'none';
    navLinks.innerHTML      = '';
    return;
  }

  // Show header
  hdr.classList.remove('hidden');

  // Ticker + footer
  tickerBar.style.display = '';
  footer.style.display    = '';
  hamburger.style.display = 'flex';
  brandSwit.style.display = 'flex';
  navCta.style.display    = '';

  if (brand === 'wealth') {
    logoText.textContent  = 'InvestNaira';
    logoSub.textContent   = 'Invest';
    logoSub.style.display = '';
    navCta.textContent    = 'Open account';
    navCta.href           = 'https://app.investnaira.ng/register';

    navLinks.innerHTML = `
      <li><a href="#/wealth" data-route="wealth">Home</a></li>
      <li><a href="#/wealth/how-it-works" data-route="wealth/how-it-works">How It Works</a></li>
      <li><a href="#/wealth/investments" data-route="wealth/investments">Invest</a></li>
      <li><a href="#/wealth/features" data-route="wealth/features">Features</a></li>
      <li><a href="#/wealth/referral" data-route="wealth/referral">Referral</a></li>
    `;
    mobileNav.innerHTML = `
      <a href="#/wealth">Home</a>
      <a href="#/wealth/how-it-works">How It Works</a>
      <a href="#/wealth/investments">Invest Now</a>
      <a href="#/wealth/features">Features</a>
      <a href="#/wealth/referral">Referral</a>
      <a href="#/">← Back to Hub</a>
    `;
    bsWlt.classList.add('active');
    bsRes.classList.remove('active');
    bsWlt.style.color = 'var(--c-bg)';
    bsWlt.style.background = 'var(--c-wealth)';
    bsRes.style.background = '';
    bsRes.style.color = '';
  }

  if (brand === 'research') {
    logoText.textContent  = 'InvestNaira';
    logoSub.textContent   = 'Research';
    logoSub.style.display = '';
    navCta.textContent    = 'Subscribe';
    navCta.href           = '#/subscribe';

    navLinks.innerHTML = `
      <li><a href="#/research" data-route="research">Home</a></li>
      <li><a href="#/reports" data-route="reports">Reports</a></li>
      <li><a href="#/subscribe" data-route="subscribe">Subscribe</a></li>
      <li><a href="#/about" data-route="about">About</a></li>
      <li><a href="#/faq" data-route="faq">FAQ</a></li>
    `;
    mobileNav.innerHTML = `
      <a href="#/research">Home</a>
      <a href="#/reports">Reports</a>
      <a href="#/subscribe">Subscribe</a>
      <a href="#/about">About</a>
      <a href="#/faq">FAQ</a>
      <a href="#/">← Back to Hub</a>
    `;
    bsRes.classList.add('active');
    bsWlt.classList.remove('active');
    bsRes.style.color = 'var(--c-bg)';
    bsRes.style.background = 'var(--c-research)';
    bsWlt.style.background = '';
    bsWlt.style.color = '';
  }

  // Active nav link
  setTimeout(() => {
    const hash = window.location.hash.slice(1) || '/';
    document.querySelectorAll('.main-nav a[data-route]').forEach(a => {
      a.classList.toggle('active', hash === `/${a.dataset.route}`);
    });
  }, 10);

  // Header scroll observer
  const hero = document.querySelector('.w-hero, .r-hero');
  if (hero) {
    new IntersectionObserver(([e]) => hdr.classList.toggle('on', !e.isIntersecting),
      { rootMargin:'-70px 0px 0px 0px' }
    ).observe(hero);
  } else {
    hdr.classList.add('on');
  }

  renderFooter(brand);
}

function renderFooter(brand) {
  const el = document.getElementById('site-footer');
  if (!el) return;

  if (brand === 'wealth') {
    el.innerHTML = `
      <div class="container">
        <div class="ftr-top">
          <div>
            <div class="ftr-brand-name">
              <div class="logo-flag" aria-hidden="true"><span></span><span></span><span></span></div>
              InvestNaira
            </div>
            <p class="ftr-desc">Build wealth for the long term. Curated Nigerian investment campaigns, naira and dollar wallets, and returns that work as hard as you do.</p>
            <div class="ftr-socials">
              ${SOCIAL.map(s=>`<a href="${s.url}" class="social-link" target="_blank" rel="noopener"><span>${s.icon}</span> ${s.platform}</a>`).join('')}
            </div>
          </div>
          <div class="ftr-col">
            <p class="ftr-col-ttl">Invest</p>
            <ul>
              <li><a href="#/wealth/investments">All campaigns</a></li>
              <li><a href="#/wealth/how-it-works">How it works</a></li>
              <li><a href="#/wealth/features">Features</a></li>
              <li><a href="#/wealth/referral">Referral programme</a></li>
            </ul>
          </div>
          <div class="ftr-col">
            <p class="ftr-col-ttl">Research</p>
            <ul>
              <li><a href="#/research">InvestNaira Research</a></li>
              <li><a href="#/reports">Market reports</a></li>
              <li><a href="#/subscribe">Subscribe</a></li>
            </ul>
          </div>
          <div class="ftr-col">
            <p class="ftr-col-ttl">Company</p>
            <ul>
              <li><a href="#/about">About</a></li>
              <li><a href="#/faq">FAQ</a></li>
              <li><a href="mailto:hello@investnaira.ng">Contact</a></li>
              <li><a href="#/">Back to hub</a></li>
            </ul>
          </div>
        </div>
        <div class="ftr-btm">
          <p class="ftr-legal">© 2025 InvestNaira Ltd. · SEC Registered · Lagos, Nigeria</p>
          <p class="ftr-legal" style="max-width:48ch;text-align:right;">Capital at risk. Past returns are not a guarantee of future performance. InvestNaira is not a bank.</p>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="container">
        <div class="ftr-top">
          <div>
            <div class="ftr-brand-name">
              <div class="logo-flag" aria-hidden="true"><span></span><span></span><span></span></div>
              InvestNaira Research
            </div>
            <p class="ftr-desc">Independent research on Nigerian equities, real estate, commodities, cryptocurrency, and currency markets.</p>
            <div class="ftr-socials">
              ${SOCIAL.map(s=>`<a href="${s.url}" class="social-link" target="_blank" rel="noopener"><span>${s.icon}</span> ${s.platform}</a>`).join('')}
            </div>
          </div>
          <div class="ftr-col">
            <p class="ftr-col-ttl">Research</p>
            <ul>
              ${RESEARCH_CATEGORIES.map(c=>`<li><a href="#/research/${c.slug}">${c.name}</a></li>`).join('')}
            </ul>
          </div>
          <div class="ftr-col">
            <p class="ftr-col-ttl">Platform</p>
            <ul>
              <li><a href="#/reports">All Reports</a></li>
              <li><a href="#/subscribe">Pricing</a></li>
              <li><a href="#/about">About</a></li>
              <li><a href="#/faq">FAQ</a></li>
            </ul>
          </div>
          <div class="ftr-col">
            <p class="ftr-col-ttl">Subscribe</p>
            <ul>
              <li><a href="#/subscribe">Individual — ${fmt(10000)}/mo</a></li>
              <li><a href="#/subscribe">Professional — ${fmt(25000)}/mo</a></li>
              <li><a href="#/subscribe">Business — ${fmt(300000)}/mo</a></li>
              <li><a href="#/subscribe">Free 7-day trial</a></li>
            </ul>
          </div>
        </div>
        <div class="ftr-btm">
          <p class="ftr-legal">© 2025 InvestNaira Research Ltd. · Lagos, Nigeria · SEC Registered</p>
          <div style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);display:flex;align-items:center;gap:var(--sp-xs);">
            <div style="width:5px;height:5px;border-radius:50%;background:var(--c-pos);box-shadow:0 0 6px var(--c-pos);"></div>
            NGX live data delayed 15 min
          </div>
        </div>
      </div>`;
  }
}

function initTicker() {
  const track = document.getElementById('ticker-track');
  if (!track || track.children.length > 0) return;
  [...TICKER_DATA, ...TICKER_DATA].forEach(d => {
    const el = document.createElement('div');
    el.className = 'ticker-item';
    el.innerHTML = `<span class="tk-sym">${d.sym}</span><span class="tk-prc">${d.price}</span><span class="tk-chg ${d.up?'up':'down'}">${d.up?'▲':'▼'} ${d.change}</span><div class="tk-div"></div>`;
    track.appendChild(el);
  });
}

/* ════════════════════════════════════════════════════════════════
   PAGE: HUB
════════════════════════════════════════════════════════════════ */

function renderHub() {
  setChrome('hub');
  document.getElementById('app').innerHTML = `
    <div class="hub-page" aria-labelledby="hub-h1">
      <div class="hub-naira" aria-hidden="true">₦</div>
      <div class="hub-inner reveal">

        <div class="hub-logo" aria-label="InvestNaira">
          <div class="logo-flag" aria-hidden="true" style="width:22px;height:24px;"><span></span><span></span><span></span></div>
          InvestNaira
        </div>
        <p class="hub-tagline" id="hub-h1">The home of Nigerian wealth.</p>

        <div class="hub-cards" role="list">

          <!-- WEALTH card -->
          <a href="#/wealth" class="hub-card wealth" role="listitem" aria-label="InvestNaira — invest and build wealth">
            <div class="hub-card-tag wealth">Invest & Grow</div>
            <h2 class="hub-card-h2">
              Build wealth<br>
              <span style="color:var(--c-wealth);font-style:italic;">for life.</span>
            </h2>
            <p class="hub-card-desc">
              Curated investment campaigns across Nigerian real estate, equities, agriculture, and dollar assets. Your naira working as hard as you do.
            </p>
            <ul class="hub-card-features" aria-label="What's included">
              <li class="hub-feat">NGN &amp; USD wallets — start from ₦5,000</li>
              <li class="hub-feat">Curated campaigns — real estate, equities, agri</li>
              <li class="hub-feat">Returns tracked in real-time</li>
              <li class="hub-feat">Earn via referrals · AI investment chatbot</li>
            </ul>
            <div class="hub-card-cta wealth">
              <span>Start investing</span>
              <span class="hub-card-arr" aria-hidden="true">→</span>
            </div>
          </a>

          <div class="hub-divider" aria-hidden="true"></div>

          <!-- RESEARCH card -->
          <a href="#/research" class="hub-card research" role="listitem" aria-label="InvestNaira Research — independent market intelligence">
            <div class="hub-card-tag research">Market Intelligence</div>
            <h2 class="hub-card-h2">
              Know before<br>
              <span style="color:var(--c-research);font-style:italic;">the market does.</span>
            </h2>
            <p class="hub-card-desc">
              Independent research on Nigerian equities, real estate, commodities, crypto, and FX. Built for serious investors who need to be right.
            </p>
            <ul class="hub-card-features" aria-label="What's included">
              <li class="hub-feat">Weekly NGX brief &amp; daily FX report</li>
              <li class="hub-feat">Sector deep-dives &amp; company profiles</li>
              <li class="hub-feat">5 coverage areas — equities to crypto</li>
              <li class="hub-feat">Analyst messaging · Due diligence reports</li>
            </ul>
            <div class="hub-card-cta research">
              <span>Read research</span>
              <span class="hub-card-arr" aria-hidden="true">→</span>
            </div>
          </a>

        </div>

        <p class="hub-footer-note">
          <a href="#/wealth" style="color:var(--c-muted);border-block-end:1px solid currentColor;cursor:none;">Invest</a>
          &nbsp;·&nbsp;
          <a href="#/research" style="color:var(--c-muted);border-block-end:1px solid currentColor;cursor:none;">Research</a>
          &nbsp;·&nbsp;
          Already a member? &nbsp;
          <a href="portal.html" style="color:var(--c-wealth);border-block-end:1px solid currentColor;cursor:none;">Sign in →</a>
        </p>

      </div>
    </div>`;
  initBehaviours();
}

/* ════════════════════════════════════════════════════════════════
   PAGE: WEALTH HOME
════════════════════════════════════════════════════════════════ */

function renderWealthHome() {
  setChrome('wealth');
  document.getElementById('app').innerHTML = `
    <!-- Hero -->
    <section class="w-hero" aria-labelledby="w-h1">
      <div class="w-naira-bg" aria-hidden="true">₦</div>
      <div class="w-hero-inner container">
        <div class="w-badge reveal">
          <div class="w-badge-dot" aria-hidden="true"></div>
          <span class="w-badge-txt">Build Wealth · Long Term · Nigeria</span>
        </div>
        <h1 class="w-h1 reveal" id="w-h1">
          Your money<br>deserves to<br><em>work harder.</em>
        </h1>
        <div class="w-hero-split reveal">
          <div>
            <p style="font-size:var(--s-1);font-weight:300;font-style:italic;color:var(--c-muted);max-width:38ch;line-height:1.5;margin-block-end:var(--sp-xl);">
              Curated investment campaigns across Nigerian real estate, equities, agriculture, and dollar assets. Start from ₦5,000.
            </p>
            <div style="display:flex;gap:var(--sp-l);align-items:center;flex-wrap:wrap;">
              <a href="https://app.investnaira.ng/register" class="btn-primary" style="background:var(--c-wealth);">
                <span>Open free account</span>
                <span class="arr" aria-hidden="true">→</span>
              </a>
              <a href="#/wealth/investments" class="btn-ghost">Browse campaigns</a>
            </div>
            <p style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);margin-block-start:var(--sp-m);">No account fee · Start from ₦5,000 · SEC regulated</p>
          </div>
          <!-- Wallet mockup -->
          <div class="wallet-mockup reveal">
            <div class="wallet-header">
              <span class="wallet-label">My Wallet</span>
              <span class="wallet-currency">NGN</span>
            </div>
            <div class="wallet-balance">₦2,847,500<span style="font-size:.5em;opacity:.4;font-weight:300;">.00</span></div>
            <div class="wallet-balance-sub" style="font-family:var(--font-mono);font-size:var(--s--1);">▲ +₦124,300 this month</div>
            <div class="wallet-actions">
              <div class="wallet-btn fund">Fund Wallet</div>
              <div class="wallet-btn withdraw">Withdraw</div>
            </div>
            <div class="wallet-txns">
              <div class="wallet-txn">
                <span class="txn-name">Lekki REIT — Return</span>
                <span class="txn-amt pos">+₦42,000</span>
              </div>
              <div class="wallet-txn">
                <span class="txn-name">Dangote Fund — Deposit</span>
                <span class="txn-amt neg">-₦200,000</span>
              </div>
              <div class="wallet-txn">
                <span class="txn-name">Referral Bonus</span>
                <span class="txn-amt pos">+₦7,500</span>
              </div>
              <div class="wallet-txn">
                <span class="txn-name">AgriTech Fund — Return</span>
                <span class="txn-amt pos">+₦28,800</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Decorative line -->
      <svg style="width:100%;height:40px;display:block;position:relative;z-index:1;" viewBox="0 0 1300 40" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(201,160,74,0.15)" stroke-width="1"/>
        <circle cx="200" cy="20" r="3" fill="rgba(201,160,74,0.3)"/>
        <line x1="200" y1="20" x2="200" y2="0" stroke="rgba(201,160,74,0.12)" stroke-width="1"/>
        <line x1="380" y1="20" x2="600" y2="20" stroke="rgba(201,160,74,0.15)" stroke-width="1"/>
        <circle cx="600" cy="20" r="3" fill="rgba(201,160,74,0.3)"/>
        <line x1="750" y1="20" x2="900" y2="20" stroke="rgba(0,135,81,0.15)" stroke-width="1"/>
        <circle cx="900" cy="20" r="3" fill="rgba(0,135,81,0.25)"/>
        <line x1="900" y1="20" x2="900" y2="40" stroke="rgba(0,135,81,0.12)" stroke-width="1"/>
        <line x1="1050" y1="20" x2="1300" y2="20" stroke="rgba(201,160,74,0.12)" stroke-width="1"/>
      </svg>
    </section>

    <!-- Stats -->
    <section class="stats-bar" aria-label="Platform stats">
      <div class="stats-grid container">
        <div class="stat-box reveal"><div class="stat-num" style="color:var(--c-wealth);"><span class="count" data-target="12400" data-suffix="+">0</span></div><div class="stat-lbl">Active investors</div></div>
        <div class="stat-box reveal" style="--delay:.07s"><div class="stat-num" style="color:var(--c-pos);"><span class="count" data-target="4" data-suffix=".7B">0</span></div><div class="stat-lbl">₦ invested to date</div></div>
        <div class="stat-box reveal" style="--delay:.13s"><div class="stat-num" style="color:var(--c-wealth);">18.5%</div><div class="stat-lbl">Avg. annual return</div></div>
        <div class="stat-box reveal" style="--delay:.19s"><div class="stat-num" style="color:var(--c-pos);">100%</div><div class="stat-lbl">On-time return rate</div></div>
      </div>
    </section>

    <!-- Active campaigns preview -->
    <section class="sp" aria-labelledby="camps-h">
      <div class="container">
        <div class="sec-head reveal">
          <div>
            <p class="sec-eye" style="color:var(--c-wealth);">Live now</p>
            <h2 class="sec-ttl" id="camps-h">Open campaigns.</h2>
          </div>
          <a href="#/wealth/investments" class="sec-lnk">All campaigns →</a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-l);">
          ${CAMPAIGNS.slice(0,3).map((c,i) => `
            <div class="campaign-card reveal" style="--delay:${i*.1}s">
              <div class="camp-sector" style="color:${c.sectorColor}">${c.sector}</div>
              <div class="camp-name">${c.name}</div>
              <p class="camp-desc">${c.desc}</p>
              ${progressBar(c.raisedPct, c.sectorColor)}
              <div class="camp-stats">
                <div><div class="camp-stat-n">${c.returns}</div><div class="camp-stat-l">Returns</div></div>
                <div><div class="camp-stat-n">${c.tenure}</div><div class="camp-stat-l">Tenure</div></div>
                <div><div class="camp-stat-n">${c.minInvest}</div><div class="camp-stat-l">Min. invest</div></div>
              </div>
              <div class="camp-min">
                <a href="https://app.investnaira.ng/register" style="font-family:var(--font-mono);font-size:var(--s--1);letter-spacing:.07em;text-transform:uppercase;color:var(--c-wealth);border-block-end:1px solid currentColor;padding-block-end:2px;cursor:none;">
                  Invest now →
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- How it works teaser -->
    <section class="sp" style="background:var(--c-surface);border-block:1px solid var(--c-border);" aria-labelledby="how-h">
      <div class="container">
        <div class="sec-head reveal">
          <div>
            <p class="sec-eye" style="color:var(--c-wealth);">Simple process</p>
            <h2 class="sec-ttl" id="how-h">Four steps to growing wealth.</h2>
          </div>
          <a href="#/wealth/how-it-works" class="sec-lnk">Full guide →</a>
        </div>
        <div class="steps-grid">
          ${HOW_IT_WORKS.map((s,i) => `
            <div class="step-card reveal" style="--delay:${i*.1}s">
              <div class="step-num">${s.num}</div>
              <div class="step-name">${s.name}</div>
              <p class="step-desc">${s.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Features teaser -->
    <section class="sp" aria-labelledby="feat-h">
      <div class="container">
        <div class="sec-head reveal">
          <div>
            <p class="sec-eye" style="color:var(--c-wealth);">Built for you</p>
            <h2 class="sec-ttl" id="feat-h">Everything you need.</h2>
          </div>
          <a href="#/wealth/features" class="sec-lnk">All features →</a>
        </div>
        <div class="feature-grid">
          ${WEALTH_FEATURES.slice(0,3).map((f,i) => `
            <div class="feature-card reveal" style="--delay:${i*.08}s">
              <div class="feat-icon-lg" style="color:var(--c-wealth);">${f.icon}</div>
              <div class="feat-name">${f.name}</div>
              <p class="feat-desc">${f.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Research crosslink -->
    <section class="sp" style="background:var(--c-surface);border-block:1px solid var(--c-border);">
      <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-2xl);align-items:center;">
        <div class="reveal">
          <p style="font-family:var(--font-mono);font-size:var(--s--1);letter-spacing:.1em;text-transform:uppercase;color:var(--c-research);margin-block-end:var(--sp-m);">Smarter decisions</p>
          <h2 style="font-family:var(--font-display);font-size:var(--s-3);font-weight:600;letter-spacing:-.03em;line-height:1.05;margin-block-end:var(--sp-m);">Invest with intelligence<br>behind every decision.</h2>
          <p style="font-size:var(--s-0);font-weight:300;color:var(--c-muted);line-height:1.65;max-width:40ch;margin-block-end:var(--sp-xl);">Every campaign on InvestNaira is backed by InvestNaira Research analysis. Subscribe to Research for the full picture — sector reports, company profiles, and daily market briefs.</p>
          <a href="#/research" class="btn-primary" style="background:var(--c-research);">
            <span>Explore Research</span>
            <span class="arr" aria-hidden="true">→</span>
          </a>
        </div>
        <div class="reveal" style="--delay:.1s">
          ${REPORTS.slice(0,4).map(r => `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-m);padding-block:var(--sp-m);border-block-end:1px solid var(--c-border);">
              ${typeBadge(r.type)}
              <div style="flex:1;font-family:var(--font-display);font-size:var(--s-0);font-weight:400;letter-spacing:-.01em;">${r.title}</div>
              <a href="#/research" style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-research);white-space:nowrap;cursor:none;">Read →</a>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="sp-l" aria-labelledby="w-cta-h">
      <div class="container" style="text-align:center;">
        <p class="reveal" style="font-family:var(--font-mono);font-size:var(--s--1);letter-spacing:.1em;text-transform:uppercase;color:var(--c-wealth);margin-block-end:var(--sp-m);">Start today</p>
        <h2 class="reveal" id="w-cta-h" style="font-family:var(--font-display);font-size:var(--s-5);font-weight:600;letter-spacing:-.04em;line-height:.95;margin-block-end:var(--sp-l);">
          The best time to invest<br><em style="color:var(--c-wealth);">was yesterday.</em>
        </h2>
        <p class="reveal" style="font-size:var(--s-1);font-weight:300;font-style:italic;color:var(--c-muted);max-width:40ch;margin-inline:auto;margin-block-end:var(--sp-2xl);">The second best time is right now. Open your account in under 3 minutes. No fees. Start from ₦5,000.</p>
        <div class="reveal" style="display:flex;gap:var(--sp-l);align-items:center;justify-content:center;flex-wrap:wrap;">
          <a href="https://app.investnaira.ng/register" class="btn-primary" style="background:var(--c-wealth);">
            <span>Open free account</span>
            <span class="arr" aria-hidden="true">→</span>
          </a>
          <a href="#/wealth/how-it-works" class="btn-ghost">Learn how it works</a>
        </div>
      </div>
    </section>
  `;
  initBehaviours();
}

/* ════════════════════════════════════════════════════════════════
   PAGE: WEALTH — HOW IT WORKS
════════════════════════════════════════════════════════════════ */

function renderHowItWorks() {
  setChrome('wealth');
  document.getElementById('app').innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal" style="border-color:rgba(201,160,74,.15);">
        <p class="page-eye" style="color:var(--c-wealth);">Getting started</p>
        <h1 class="page-h1">Simple.<br>Transparent.<br>Rewarding.</h1>
        <p class="page-sub">Four steps from your first deposit to your first return. No jargon, no hidden fees, no lock-in surprises.</p>
      </div>

      <div class="steps-grid reveal" style="margin-block-end:var(--sp-3xl);">
        ${HOW_IT_WORKS.map((s,i) => `
          <div class="step-card" style="--delay:${i*.1}s">
            <div class="step-num" style="border-color:rgba(201,160,74,.3);color:var(--c-wealth);">${s.num}</div>
            <div class="step-name">${s.name}</div>
            <p class="step-desc">${s.desc}</p>
          </div>
        `).join('')}
      </div>

      <!-- Transaction types explainer -->
      <div class="reveal">
        <div class="sec-head">
          <div>
            <p class="sec-eye" style="color:var(--c-wealth);">Your money's journey</p>
            <h2 class="sec-ttl">How transactions work.</h2>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--c-border);">
          ${[
            {type:'DEPOSIT',   icon:'↓', color:'var(--c-pos)',    desc:'Fund your wallet via bank transfer, card, or USSD in naira or USD.'},
            {type:'INVESTMENT',icon:'→', color:'var(--c-wealth)', desc:'Allocate funds from your wallet to a specific investment campaign.'},
            {type:'RETURN',    icon:'↑', color:'var(--c-pos)',    desc:'Returns are credited automatically to your wallet on schedule.'},
            {type:'WITHDRAWAL',icon:'↗', color:'var(--c-muted)',  desc:'Move funds from your wallet to your Nigerian bank account — same-day.'},
          ].map(t => `
            <div style="background:var(--c-bg);padding:var(--sp-xl);">
              <div style="font-size:var(--s-3);color:${t.color};margin-block-end:var(--sp-m);line-height:1;">${t.icon}</div>
              <div style="font-family:var(--font-mono);font-size:var(--s--1);font-weight:400;letter-spacing:.1em;text-transform:uppercase;color:${t.color};margin-block-end:var(--sp-s);">${t.type}</div>
              <p style="font-size:var(--s-0);font-weight:300;color:var(--c-muted);line-height:1.6;">${t.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- FAQ for wealth -->
      <div style="margin-block-start:var(--sp-3xl);" class="reveal">
        <div class="sec-head">
          <div>
            <p class="sec-eye" style="color:var(--c-wealth);">Common questions</p>
            <h2 class="sec-ttl">Before you invest.</h2>
          </div>
        </div>
        <div style="max-width:780px;" role="list">
          ${FAQS_WEALTH.slice(0,5).map((f,i) => `
            <div class="faq-item" role="listitem">
              <button class="faq-q" aria-expanded="false" aria-controls="fw-a-${i}">
                ${f.q}
                <span class="faq-icon" aria-hidden="true">+</span>
              </button>
              <div class="faq-a" id="fw-a-${i}">
                <div class="faq-a-inner">${f.a}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="reveal" style="margin-block-start:var(--sp-2xl);display:flex;gap:var(--sp-l);flex-wrap:wrap;">
        <a href="https://app.investnaira.ng/register" class="btn-primary" style="background:var(--c-wealth);"><span>Open account</span><span class="arr" aria-hidden="true">→</span></a>
        <a href="#/wealth/investments" class="btn-ghost">Browse campaigns</a>
      </div>
    </div>
  `;
  initBehaviours(); initFAQ();
}

/* ════════════════════════════════════════════════════════════════
   PAGE: WEALTH — INVESTMENTS / CAMPAIGNS
════════════════════════════════════════════════════════════════ */

function renderInvestments() {
  setChrome('wealth');
  document.getElementById('app').innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal" style="border-color:rgba(201,160,74,.15);">
        <p class="page-eye" style="color:var(--c-wealth);">Active campaigns</p>
        <h1 class="page-h1">Invest in<br>Nigeria's growth.</h1>
        <p class="page-sub">Every campaign is vetted by our team before it goes live. We review the financials, the operator, the asset, and the exit structure. Then we invest our own money first.</p>
      </div>

      <!-- Filter bar -->
      <div id="camp-filter" style="display:flex;flex-wrap:wrap;gap:var(--sp-xs);margin-block-end:var(--sp-2xl);" role="group" aria-label="Filter by sector">
        ${['All','Real Estate','Equities','Agriculture','Currency','Energy'].map(f=>`
          <button data-cf="${f}" class="cf-btn ${f==='All'?'active':''}" style="font-family:var(--font-mono);font-size:var(--s--1);font-weight:300;letter-spacing:.07em;text-transform:uppercase;padding:var(--sp-xs) var(--sp-m);border:1px solid var(--c-bd-mid);border-radius:2px;color:var(--c-muted);background:transparent;cursor:none;transition:all .25s;">${f}</button>
        `).join('')}
      </div>

      <div id="campaigns-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-l);">
        ${CAMPAIGNS.map((c,i) => `
          <div class="campaign-card reveal" style="--delay:${i*.07}s" data-sector="${c.sector}">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <div class="camp-sector" style="color:${c.sectorColor}">${c.sector}</div>
              <span style="font-family:var(--font-mono);font-size:var(--s--1);font-weight:300;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:2px;background:${c.status==='ACTIVE'?'rgba(61,186,122,.1)':'rgba(201,160,74,.1)'};color:${c.status==='ACTIVE'?'var(--c-pos)':'var(--c-wealth)'};">${c.status}</span>
            </div>
            <div class="camp-name">${c.name}</div>
            <p class="camp-desc">${c.desc}</p>
            ${progressBar(c.raisedPct, c.sectorColor)}
            <div class="camp-stats">
              <div><div class="camp-stat-n">${c.returns}</div><div class="camp-stat-l">Returns p.a.</div></div>
              <div><div class="camp-stat-n">${c.tenure}</div><div class="camp-stat-l">Tenure</div></div>
              <div><div class="camp-stat-n">${c.minInvest}</div><div class="camp-stat-l">Minimum</div></div>
            </div>
            <div class="camp-min" style="display:flex;align-items:center;justify-content:space-between;">
              <span>Target: ${c.target}</span>
              ${c.status==='ACTIVE'
                ? `<a href="https://app.investnaira.ng/register" style="font-family:var(--font-mono);font-size:var(--s--1);letter-spacing:.07em;text-transform:uppercase;color:var(--c-wealth);border-block-end:1px solid currentColor;padding-block-end:2px;cursor:none;">Invest →</a>`
                : `<span style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">Opening soon</span>`
              }
            </div>
          </div>
        `).join('')}
      </div>

      <div class="reveal" style="margin-block-start:var(--sp-2xl);text-align:center;padding-block-start:var(--sp-2xl);border-block-start:1px solid var(--c-border);">
        <p style="font-size:var(--s-0);font-weight:300;font-style:italic;color:var(--c-muted);margin-block-end:var(--sp-l);max-width:50ch;margin-inline:auto;">*Returns shown are target or historical figures. Past performance is not a guarantee of future returns. Capital at risk.</p>
        <a href="https://app.investnaira.ng/register" class="btn-primary" style="background:var(--c-wealth);"><span>Open account to invest</span><span class="arr" aria-hidden="true">→</span></a>
      </div>
    </div>
  `;
  initBehaviours();
  initCampaignFilter();
}

/* ════════════════════════════════════════════════════════════════
   PAGE: WEALTH — FEATURES
════════════════════════════════════════════════════════════════ */

function renderFeatures() {
  setChrome('wealth');
  document.getElementById('app').innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal" style="border-color:rgba(201,160,74,.15);">
        <p class="page-eye" style="color:var(--c-wealth);">Platform features</p>
        <h1 class="page-h1">Everything your<br>money needs.</h1>
        <p class="page-sub">A complete wealth-building platform — wallets, campaigns, returns tracking, chatbot, and referrals. Individual and business accounts supported.</p>
      </div>

      <div class="feature-grid reveal">
        ${WEALTH_FEATURES.map((f,i) => `
          <div class="feature-card" style="--delay:${i*.08}s">
            <div class="feat-icon-lg" style="color:var(--c-wealth);">${f.icon}</div>
            <div class="feat-name">${f.name}</div>
            <p class="feat-desc">${f.desc}</p>
          </div>
        `).join('')}
      </div>

      <!-- Account types -->
      <div style="margin-block-start:var(--sp-3xl);">
        <div class="sec-head reveal">
          <div>
            <p class="sec-eye" style="color:var(--c-wealth);">Account types</p>
            <h2 class="sec-ttl">Individual or Business.</h2>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-l);" class="reveal">
          ${[
            {type:'CUSTOMER',name:'Individual Account',icon:'◎',feats:['NGN & USD wallets','All investment campaigns','Real-time returns tracking','Referral rewards','AI research chatbot','Email & push notifications']},
            {type:'BUSINESS',name:'Business Account',icon:'◈',feats:['Everything in Individual','Higher investment limits','Team member access','Corporate-grade reporting','API integration for treasury','Dedicated account manager']},
          ].map(a=>`
            <div style="background:var(--c-surface);border:1px solid var(--c-border);padding:var(--sp-xl);">
              <div style="font-size:var(--s-3);color:var(--c-wealth);margin-block-end:var(--sp-m);">${a.icon}</div>
              <div style="font-family:var(--font-display);font-size:var(--s-2);font-weight:600;letter-spacing:-.02em;margin-block-end:var(--sp-l);">${a.name}</div>
              <ul style="display:flex;flex-direction:column;gap:var(--sp-s);">
                ${a.feats.map(f=>`
                  <li style="display:flex;align-items:center;gap:var(--sp-s);font-size:var(--s-0);font-weight:300;color:var(--c-muted);">
                    <span style="color:var(--c-wealth);">✓</span> ${f}
                  </li>
                `).join('')}
              </ul>
              <a href="https://app.investnaira.ng/register?type=${a.type.toLowerCase()}" class="btn-primary" style="background:var(--c-wealth);width:100%;justify-content:center;margin-block-start:var(--sp-xl);display:flex;">
                <span>Open ${a.name}</span>
                <span class="arr" aria-hidden="true">→</span>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  initBehaviours();
}

/* ════════════════════════════════════════════════════════════════
   PAGE: WEALTH — REFERRAL
════════════════════════════════════════════════════════════════ */

function renderReferral() {
  setChrome('wealth');
  document.getElementById('app').innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal" style="border-color:rgba(201,160,74,.15);">
        <p class="page-eye" style="color:var(--c-wealth);">Earn more</p>
        <h1 class="page-h1">Refer friends.<br><em style="color:var(--c-wealth);">Earn rewards.</em></h1>
        <p class="page-sub">Every person you refer who invests earns you a bonus — automatically credited to your wallet. No forms. No manual claims. Just results.</p>
      </div>

      <div class="referral-block reveal">
        <div>
          <p class="ref-eyebrow">How it works</p>
          <h2 class="ref-h2">Share your link.<br>They invest.<br>You earn.</h2>
          <p class="ref-desc">Share your unique referral link. When a friend creates an account and completes their first investment, your wallet is credited automatically. The more active investors you refer, the more you earn — no cap.</p>
          <a href="https://app.investnaira.ng/register" class="btn-primary" style="background:var(--c-wealth);display:inline-flex;"><span>Get your referral link</span><span class="arr" aria-hidden="true">→</span></a>
        </div>
        <div>
          <div class="ref-stats">
            ${[
              {n:'₦7,500', l:'Avg. referral bonus'},
              {n:'No cap', l:'On referral earnings'},
              {n:'Auto',   l:'Wallet credit — instant'},
              {n:'Lifetime',l:'Relationship bonus'},
            ].map(s=>`
              <div>
                <div class="ref-stat-n">${s.n}</div>
                <div class="ref-stat-l">${s.l}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Steps -->
      <div class="reveal" style="margin-block-start:var(--sp-3xl);">
        <div class="sec-head">
          <div>
            <p class="sec-eye" style="color:var(--c-wealth);">Three steps</p>
            <h2 class="sec-ttl">Start earning today.</h2>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-l);">
          ${[
            {num:'01',name:'Get your link',desc:'Log in to InvestNaira and copy your unique referral link from the Referral section of your dashboard.'},
            {num:'02',name:'Share it',desc:'Send your link to friends, family, or colleagues. WhatsApp, email, social media — however you want.'},
            {num:'03',name:'Earn automatically',desc:'When they sign up and complete their first investment, your referral bonus is credited to your wallet within 24 hours.'},
          ].map(s=>`
            <div class="feature-card" style="border:1px solid rgba(201,160,74,.15);">
              <div style="font-family:var(--font-mono);font-size:var(--s-3);font-weight:300;color:rgba(201,160,74,.3);line-height:1;">${s.num}</div>
              <div class="feat-name">${s.name}</div>
              <p class="feat-desc">${s.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  initBehaviours();
}

/* ════════════════════════════════════════════════════════════════
   PAGE: RESEARCH HOME
════════════════════════════════════════════════════════════════ */

function renderResearchHome() {
  setChrome('research');
  document.getElementById('app').innerHTML = `
    <section class="r-hero" aria-labelledby="r-h1">
      <div class="r-naira" aria-hidden="true">₦</div>
      <div class="r-hero-inner container">
        <div class="r-badge reveal">
          <div class="r-dot" aria-hidden="true"></div>
          <span style="font-family:var(--font-mono);font-size:var(--s--1);font-weight:300;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);">Independent Nigerian Market Research</span>
        </div>
        <h1 class="r-h1 reveal" id="r-h1">
          Intelligence for the<br><em>serious</em><br>investor.
        </h1>
        <div class="r-sub-row reveal">
          <p class="r-desc">Primary research on Nigerian equities, real estate, commodities, crypto, and FX — built for investors who need to be right.</p>
          <div class="r-tags">
            <span class="r-tag">NGX Equities</span>
            <span class="r-tag">Real Estate</span>
            <span class="r-tag">Commodities</span>
            <span class="r-tag">Cryptocurrency</span>
            <span class="r-tag">₦ / FX Markets</span>
          </div>
        </div>
      </div>
      <div class="r-chart" aria-hidden="true">
        <span style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);writing-mode:vertical-rl;transform:rotate(180deg);flex-shrink:0;">NGX All-Share</span>
        <div class="chart-wrap">
          <svg class="chart-svg" viewBox="0 0 1000 64" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#008751" stop-opacity=".5"/>
                <stop offset="100%" stop-color="#008751" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path class="chart-fill" d="M0,52 C80,44 160,38 240,30 C320,22 400,16 480,14 C560,12 640,6 720,4 C800,2 880,0 1000,0 L1000,64 L0,64 Z"/>
            <path class="chart-path" id="chart-path" d="M0,52 C80,44 160,38 240,30 C320,22 400,16 480,14 C560,12 640,6 720,4 C800,2 880,0 1000,0"/>
          </svg>
        </div>
        <div class="chart-meta">
          <div style="font-family:var(--font-display);font-size:var(--s-0);letter-spacing:-.01em;">97,842.15</div>
          <div style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-pos);">▲ +2.34%</div>
        </div>
      </div>
    </section>

    <section class="stats-bar" aria-label="Platform stats">
      <div class="stats-grid container">
        <div class="stat-box reveal"><div class="stat-num"><span class="count" data-target="340" data-suffix="+">0</span></div><div class="stat-lbl">Research reports</div></div>
        <div class="stat-box reveal" style="--delay:.07s"><div class="stat-num" style="color:var(--c-wealth);"><span class="count" data-target="18" data-suffix=" yrs">0</span></div><div class="stat-lbl">Market experience</div></div>
        <div class="stat-box reveal" style="--delay:.13s"><div class="stat-num"><span class="count" data-target="94" data-suffix="%">0</span></div><div class="stat-lbl">Client retention</div></div>
        <div class="stat-box reveal" style="--delay:.19s"><div class="stat-num" style="color:var(--c-wealth);">5</div><div class="stat-lbl">Research categories</div></div>
      </div>
    </section>

    <section class="sp" aria-labelledby="cats-h">
      <div class="container">
        <div class="sec-head reveal">
          <div><p class="sec-eye">Coverage</p><h2 class="sec-ttl" id="cats-h">Five markets.<br>One edge.</h2></div>
          <a href="#/reports" class="sec-lnk">All reports →</a>
        </div>
        <div class="cats-grid">
          ${RESEARCH_CATEGORIES.map((c,i) => `
            <a href="#/research/${c.slug}" class="cat-card reveal" style="--delay:${i*.08}s">
              <div class="cat-icon" style="color:${c.color}">${c.icon}</div>
              <div><div class="cat-name">${c.name}</div><p class="cat-desc">${c.desc}</p></div>
              <div class="cat-foot"><span class="cat-count">${c.count}</span><span class="cat-arr">→</span></div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="sp" style="background:var(--c-surface);border-block:1px solid var(--c-border);" aria-labelledby="rep-h">
      <div class="container">
        <div class="sec-head reveal">
          <div><p class="sec-eye">Latest</p><h2 class="sec-ttl" id="rep-h">Recent research.</h2></div>
          <a href="#/reports" class="sec-lnk">All reports →</a>
        </div>
        <div role="list">
          ${REPORTS.slice(0,6).map(r=>`
            <div class="report-row reveal" role="listitem">
              ${typeBadge(r.type)}
              <div class="report-title">${r.title}</div>
              <span class="report-date">${r.date}</span>
              <a href="#/subscribe" class="report-cta">${r.plan!=='starter'?'🔒 ':''}Read →</a>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Wealth crosslink -->
    <section class="sp" aria-labelledby="r-cta-h">
      <div class="container" style="text-align:center;">
        <p class="reveal" style="font-family:var(--font-mono);font-size:var(--s--1);letter-spacing:.1em;text-transform:uppercase;color:var(--c-wealth);margin-block-end:var(--sp-m);">Put your research to work</p>
        <h2 class="reveal" id="r-cta-h" style="font-family:var(--font-display);font-size:var(--s-5);font-weight:600;letter-spacing:-.04em;line-height:.95;margin-block-end:var(--sp-l);">
          Know the market.<br><em style="color:var(--c-wealth);">Own the market.</em>
        </h2>
        <p class="reveal" style="font-size:var(--s-1);font-weight:300;font-style:italic;color:var(--c-muted);max-width:40ch;margin-inline:auto;margin-block-end:var(--sp-2xl);">Subscribe to research. Then invest using what you know. Both products. One platform.</p>
        <div class="reveal" style="display:flex;gap:var(--sp-l);align-items:center;justify-content:center;flex-wrap:wrap;">
          <a href="#/subscribe" class="btn-primary"><span>Subscribe to Research</span><span class="arr" aria-hidden="true">→</span></a>
          <a href="#/wealth" class="btn-ghost">Start investing</a>
        </div>
        <p class="reveal" style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);margin-block-start:var(--sp-l);">7-day free trial · No credit card required</p>
      </div>
    </section>
  `;
  initBehaviours();
  initChartLine();
}

/* ════════════════════════════════════════════════════════════════
   PAGE: RESEARCH CATEGORY
════════════════════════════════════════════════════════════════ */

function renderCategory({ slug }) {
  const cat = RESEARCH_CATEGORIES.find(c => c.slug === slug);
  if (!cat) { renderResearchHome(); return; }
  setChrome('research');
  const related = REPORTS.filter(r => r.type === cat.badge);
  document.getElementById('app').innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal">
        <p class="page-eye"><a href="#/research" class="btn-ghost" style="font-size:var(--s--1);">← Research</a> &nbsp; ${cat.name}</p>
        <h1 class="page-h1" style="color:${cat.color}">${cat.name}<br>Research.</h1>
        <p class="page-sub">${cat.desc}</p>
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:var(--sp-2xl);align-items:start;" class="reveal">
        <div style="font-size:var(--s-0);font-weight:300;line-height:1.75;color:var(--c-muted);">
          ${RESEARCH_DETAIL[slug] || '<p>Deep research on this category coming soon.</p>'}
        </div>
        <div style="background:var(--c-surface);border:1px solid var(--c-border);padding:var(--sp-xl);">
          <p style="font-family:var(--font-mono);font-size:var(--s--1);letter-spacing:.08em;text-transform:uppercase;color:var(--c-research);margin-block-end:var(--sp-m);">Coverage includes</p>
          <p style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);margin-block-end:var(--sp-l);">${cat.count}</p>
          <a href="#/subscribe" class="btn-primary" style="width:100%;justify-content:center;display:flex;"><span>Access ${cat.name} Reports</span><span class="arr" aria-hidden="true">→</span></a>
        </div>
      </div>
      ${related.length ? `
        <div style="margin-block-start:var(--sp-3xl);">
          <div class="sec-head reveal">
            <div><p class="sec-eye">${cat.name}</p><h2 class="sec-ttl">Recent reports.</h2></div>
            <a href="#/reports" class="sec-lnk">All reports →</a>
          </div>
          <div role="list">
            ${related.map(r=>`
              <div class="report-row reveal" role="listitem">
                ${typeBadge(r.type)}
                <div class="report-title">${r.title}</div>
                <span class="report-date">${r.date}</span>
                <a href="#/subscribe" class="report-cta">Read →</a>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>`;
  initBehaviours();
}

/* ════════════════════════════════════════════════════════════════
   PAGE: REPORTS
════════════════════════════════════════════════════════════════ */

function renderReports() {
  setChrome('research');
  const filterBtns = ['All','Equity','Real Estate','Commodity','Crypto','Currency'];
  const typeMap = {'All':null,'Equity':'equity','Real Estate':'realestate','Commodity':'commodity','Crypto':'crypto','Currency':'currency'};
  document.getElementById('app').innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal">
        <p class="page-eye">Research archive</p>
        <h1 class="page-h1">Every report.<br>Every market.</h1>
        <p class="page-sub">Primary research across Nigerian equities, real estate, commodities, cryptocurrency, and currency markets.</p>
      </div>
      <div id="filter-bar" style="display:flex;flex-wrap:wrap;gap:var(--sp-xs);margin-block-end:var(--sp-2xl);" role="group" aria-label="Filter by category">
        ${filterBtns.map(f=>`<button data-filter="${typeMap[f]||'all'}" class="filter-btn ${f==='All'?'active':''}" style="font-family:var(--font-mono);font-size:var(--s--1);font-weight:300;letter-spacing:.07em;text-transform:uppercase;padding:var(--sp-xs) var(--sp-m);border:1px solid var(--c-bd-mid);border-radius:2px;color:var(--c-muted);background:transparent;cursor:none;transition:all .25s;">${f}</button>`).join('')}
      </div>
      <div id="reports-list" role="list">
        ${REPORTS.map(r=>`
          <div class="report-row" role="listitem" data-type="${r.type}">
            ${typeBadge(r.type)}
            <div class="report-title">${r.title}</div>
            <span class="report-date">${r.date}</span>
            <a href="#/subscribe" class="report-cta">${r.plan!=='starter'?'🔒 ':''}Read →</a>
          </div>
        `).join('')}
      </div>
      <div style="margin-block-start:var(--sp-2xl);padding-block-start:var(--sp-xl);border-block-start:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
        <p style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">Showing ${REPORTS.length} reports · Updated weekly</p>
        <a href="#/subscribe" class="btn-primary"><span>Unlock all reports</span><span class="arr" aria-hidden="true">→</span></a>
      </div>
    </div>`;
  initBehaviours();
  initReportFilter();
}

/* ════════════════════════════════════════════════════════════════
   PAGE: SUBSCRIBE / PRICING
════════════════════════════════════════════════════════════════ */

function renderSubscribe() {
  setChrome('research');
  document.getElementById('app').innerHTML = `
    <div class="container sp-l">
      <div class="page-hero reveal" style="text-align:center;border:none;margin-block-end:var(--sp-2xl);">
        <p class="page-eye" style="display:block;text-align:center;">Subscribe</p>
        <h1 class="page-h1" style="font-size:var(--s-5);margin-inline:auto;">Research that pays<br>for itself.</h1>
        <p class="page-sub" style="margin-inline:auto;text-align:center;">Choose a plan. Start your 7-day free trial. Cancel anytime.</p>
        <div style="display:flex;align-items:center;justify-content:center;gap:var(--sp-l);margin-block-start:var(--sp-xl);">
          <div style="display:flex;align-items:center;gap:var(--sp-m);font-family:var(--font-mono);font-size:var(--s--1);font-weight:300;letter-spacing:.07em;text-transform:uppercase;">
            <span id="lbl-monthly" style="color:var(--c-text);">Monthly</span>
            <div class="toggle-track" id="toggle-track" role="switch" aria-checked="false" tabindex="0" aria-label="Switch to annual billing">
              <div class="toggle-knob"></div>
            </div>
            <span id="lbl-annual" style="color:var(--c-muted);">Annual</span>
          </div>
          <span id="save-badge" style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-pos);opacity:0;transition:opacity .3s;">Save up to 17%</span>
        </div>
      </div>
      <div class="plans-grid reveal">
        ${RESEARCH_PLANS.map(p=>`
          <div class="plan-card ${p.featured?'featured':''}">
            <div class="plan-name">${p.name}</div>
            <div>
              <div class="plan-price" id="price-${p.id}"><sup>₦</sup>${p.monthly.toLocaleString('en-NG')}</div>
              <div class="plan-period" id="period-${p.id}">per month</div>
              <div class="plan-save" id="save-${p.id}" style="opacity:0;transition:opacity .3s;margin-block-start:var(--sp-xs);">${p.yearlySave} annually</div>
            </div>
            <div class="plan-divider"></div>
            <ul class="plan-features">
              ${p.features.map(f=>`
                <li class="plan-feat">
                  <span class="feat-icon">${f.inc?'✓':'×'}</span>
                  <span style="color:${f.inc?'var(--c-text)':'var(--c-muted)'};">${f.text}</span>
                </li>
              `).join('')}
            </ul>
            <a href="mailto:subscribe@investnaira.ng?subject=${encodeURIComponent(p.name+' Plan')}" class="plan-cta ${p.ctaStyle}">${p.cta}</a>
          </div>
        `).join('')}
      </div>
      <div class="reveal" style="margin-block-start:var(--sp-2xl);text-align:center;">
        <p style="font-family:var(--font-mono);font-size:var(--s--1);color:var(--c-muted);">All plans include 7-day free trial · No credit card required<br>Business plans: <a href="mailto:business@investnaira.ng" style="color:var(--c-research);border-block-end:1px solid currentColor;cursor:none;">contact us</a></p>
      </div>
    </div>`;
  initBehaviours();
  initPricingToggle();
}

/* ════════════════════════════════════════════════════════════════
   PAGE: ABOUT
════════════════════════════════════════════════════════════════ */

function renderAbout() {
  setChrome('research');
  document.getElementById('app').innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal">
        <p class="page-eye">About InvestNaira</p>
        <h1 class="page-h1">Independent.<br>Rigorous.<br>Nigerian.</h1>
        <p class="page-sub">We built the research platform we wished existed when we were making our own investment decisions.</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-2xl);align-items:start;" class="reveal">
        <div style="font-size:var(--s-0);font-weight:300;line-height:1.75;color:var(--c-muted);">
          <p>InvestNaira was founded in Lagos in 2019 by a team of analysts who had spent years inside Nigerian commercial banks and fund management companies — and grown frustrated with the quality of research available to investors outside those institutions.</p>
          <p style="margin-block-start:var(--sp-m);">Sell-side research is compromised by brokerage commission incentives. Fund manager research is proprietary. The individual investor, the family office, the small fund — they had almost nothing. We exist to close that gap.</p>
          <p style="margin-block-start:var(--sp-m);">InvestNaira Research is our independent intelligence arm. InvestNaira Invest is the platform where our subscribers put that intelligence to work. Both share the same founding belief: Nigerians deserve the same quality of investment tools that investors in London or New York take for granted.</p>
          <p style="margin-block-start:var(--sp-m);">Our only revenue is subscriptions and investment management fees. We do not take brokerage commission, advisory fees, or payments from companies we cover or list. If we think a stock is overvalued, we say so. If we pass on a campaign, it doesn't go live.</p>
        </div>
        <div>
          <div style="font-family:var(--font-display);font-size:var(--s-3);font-style:italic;font-weight:400;color:var(--c-wealth);line-height:1.3;border-block-start:2px solid var(--c-wealth);padding-block-start:var(--sp-l);margin-block-end:var(--sp-2xl);">
            "Nigerians deserve the same quality of investment tools that investors in London or New York take for granted."
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--c-border);">
            ${[{n:'2019',l:'Founded in Lagos'},{n:'12,400+',l:'Platform investors'},{n:'₦4.7B',l:'Invested to date'},{n:'94%',l:'Research retention'}].map(s=>`
              <div style="background:var(--c-bg);padding:var(--sp-l);">
                <div style="font-family:var(--font-display);font-size:var(--s-3);font-weight:600;letter-spacing:-.04em;color:var(--c-wealth);margin-block-end:var(--sp-xs);">${s.n}</div>
                <div style="font-family:var(--font-mono);font-size:var(--s--1);font-weight:300;letter-spacing:.07em;text-transform:uppercase;color:var(--c-muted);">${s.l}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <!-- Social -->
      <div class="reveal" style="margin-block-start:var(--sp-3xl);text-align:center;padding-block:var(--sp-2xl);border-block:1px solid var(--c-border);">
        <p class="sec-eye" style="margin-block-end:var(--sp-l);">Follow us</p>
        <div style="display:flex;gap:var(--sp-m);flex-wrap:wrap;justify-content:center;">
          ${SOCIAL.map(s=>`<a href="${s.url}" class="social-link" target="_blank" rel="noopener"><span>${s.icon}</span> ${s.platform} · ${s.handle}</a>`).join('')}
        </div>
      </div>
    </div>`;
  initBehaviours();
}

/* ════════════════════════════════════════════════════════════════
   PAGE: FAQ
════════════════════════════════════════════════════════════════ */

function renderFAQ() {
  setChrome('research');
  document.getElementById('app').innerHTML = `
    <div class="container sp">
      <div class="page-hero reveal">
        <p class="page-eye">Questions</p>
        <h1 class="page-h1">Frequently<br>asked.</h1>
        <p class="page-sub">Email us at <a href="mailto:hello@investnaira.ng" style="color:var(--c-research);border-block-end:1px solid currentColor;cursor:none;">hello@investnaira.ng</a> if your question isn't here.</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3xl);align-items:start;">
        <div>
          <p style="font-family:var(--font-mono);font-size:var(--s--1);font-weight:400;letter-spacing:.09em;text-transform:uppercase;color:var(--c-wealth);margin-block-end:var(--sp-l);padding-block-end:var(--sp-s);border-block-end:1px solid rgba(201,160,74,.2);">InvestNaira — Invest</p>
          <div role="list">
            ${FAQS_WEALTH.map((f,i)=>`
              <div class="faq-item reveal" style="--delay:${i*.04}s" role="listitem">
                <button class="faq-q" aria-expanded="false" aria-controls="fw-a-${i}">
                  ${f.q}<span class="faq-icon" aria-hidden="true">+</span>
                </button>
                <div class="faq-a" id="fw-a-${i}"><div class="faq-a-inner">${f.a}</div></div>
              </div>
            `).join('')}
          </div>
        </div>
        <div>
          <p style="font-family:var(--font-mono);font-size:var(--s--1);font-weight:400;letter-spacing:.09em;text-transform:uppercase;color:var(--c-research);margin-block-end:var(--sp-l);padding-block-end:var(--sp-s);border-block-end:1px solid rgba(0,135,81,.2);">InvestNaira Research</p>
          <div role="list">
            ${FAQS_RESEARCH.map((f,i)=>`
              <div class="faq-item reveal" style="--delay:${i*.04}s" role="listitem">
                <button class="faq-q" aria-expanded="false" aria-controls="fr-a-${i}">
                  ${f.q}<span class="faq-icon" aria-hidden="true">+</span>
                </button>
                <div class="faq-a" id="fr-a-${i}"><div class="faq-a-inner">${f.a}</div></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="reveal" style="margin-block-start:var(--sp-3xl);display:flex;gap:var(--sp-l);flex-wrap:wrap;">
        <a href="https://app.investnaira.ng/register" class="btn-primary" style="background:var(--c-wealth);"><span>Open investment account</span><span class="arr" aria-hidden="true">→</span></a>
        <a href="#/subscribe" class="btn-primary"><span>Subscribe to Research</span><span class="arr" aria-hidden="true">→</span></a>
      </div>
    </div>`;
  initBehaviours();
  initFAQ();
}

/* ════════════════════════════════════════════════════════════════
   BEHAVIOURS
════════════════════════════════════════════════════════════════ */

function initBehaviours() {
  initScrollReveal();
  initCounters();
  initMagneticBtns();
}

function initScrollReveal() {
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!els.length) return;
  if (pRM) { els.forEach(el=>{el.style.opacity='1';el.style.transform='none';}); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.style.animationDelay = el.style.getPropertyValue('--delay') || '0s';
      el.classList.add('is-visible');
      io.unobserve(el);
    });
  }, { threshold:0.1, rootMargin:'0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}

function initCounters() {
  const els = document.querySelectorAll('.count:not([data-done])');
  if (!els.length || pRM) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.dataset.done = '1';
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const start  = performance.now();
      (function step(now) {
        const p = Math.min((now-start)/1400, 1);
        el.textContent = Math.floor(target*(1-Math.pow(1-p,4))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(start);
      io.unobserve(el);
    });
  }, { threshold:0.5 });
  els.forEach(el => io.observe(el));
}

function initMagneticBtns() {
  if (isMob() || pRM) return;
  document.querySelectorAll('.btn-primary:not([data-mag]),.hub-card-cta:not([data-mag])').forEach(btn => {
    btn.dataset.mag = '1';
    btn.addEventListener('mouseenter', () => btn.style.transition='transform .12s ease');
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.2}px,${(e.clientY-r.top-r.height/2)*.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition='transform .5s cubic-bezier(.16,1,.3,1)';
      btn.style.transform='translate(0,0)';
      setTimeout(()=>btn.style.transition='',500);
    });
  });
}

function initChartLine() {
  const path = document.getElementById('chart-path');
  if (!path || pRM) return;
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  setTimeout(() => {
    path.style.strokeDashoffset = '0';
    path.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(.16,1,.3,1)';
  }, 500);
}

function initReportFilter() {
  const bar  = document.getElementById('filter-bar');
  const list = document.getElementById('reports-list');
  if (!bar || !list) return;
  function setActive(activeBtn) {
    bar.querySelectorAll('.filter-btn').forEach(b => {
      const on = b === activeBtn;
      b.style.color       = on?'var(--c-bg)':'var(--c-muted)';
      b.style.background  = on?'var(--c-research)':'transparent';
      b.style.borderColor = on?'var(--c-research)':'var(--c-bd-mid)';
    });
  }
  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    setActive(btn);
    const filter = btn.dataset.filter;
    list.querySelectorAll('.report-row').forEach(r => {
      r.style.display = (filter==='all'||r.dataset.type===filter) ? '' : 'none';
    });
  });
  setActive(bar.querySelector('.filter-btn.active'));
}

function initCampaignFilter() {
  const bar  = document.getElementById('camp-filter');
  const grid = document.getElementById('campaigns-grid');
  if (!bar || !grid) return;
  function setActive(activeBtn) {
    bar.querySelectorAll('.cf-btn').forEach(b => {
      const on = b === activeBtn;
      b.style.color       = on?'var(--c-bg)':'var(--c-muted)';
      b.style.background  = on?'var(--c-wealth)':'transparent';
      b.style.borderColor = on?'var(--c-wealth)':'var(--c-bd-mid)';
    });
  }
  bar.addEventListener('click', e => {
    const btn = e.target.closest('.cf-btn');
    if (!btn) return;
    setActive(btn);
    const filter = btn.dataset.cf;
    grid.querySelectorAll('.campaign-card').forEach(c => {
      c.style.display = (filter==='All'||c.dataset.sector.includes(filter)) ? '' : 'none';
    });
  });
  setActive(bar.querySelector('.cf-btn.active'));
}

function initPricingToggle() {
  const track = document.getElementById('toggle-track');
  if (!track) return;
  let isAnnual = false;
  function toggle() {
    isAnnual = !isAnnual;
    track.classList.toggle('on', isAnnual);
    track.setAttribute('aria-checked', isAnnual);
    document.getElementById('lbl-monthly').style.color = isAnnual?'var(--c-muted)':'var(--c-text)';
    document.getElementById('lbl-annual').style.color  = isAnnual?'var(--c-text)':'var(--c-muted)';
    document.getElementById('save-badge').style.opacity = isAnnual?'1':'0';
    RESEARCH_PLANS.forEach(p => {
      const pe = document.getElementById(`price-${p.id}`);
      const pp = document.getElementById(`period-${p.id}`);
      const ps = document.getElementById(`save-${p.id}`);
      if (!pe) return;
      if (isAnnual) {
        pe.innerHTML = `<sup>₦</sup>${Math.round(p.yearly/12).toLocaleString('en-NG')}`;
        pp.textContent = 'per month, billed annually';
        if (ps) ps.style.opacity = '1';
      } else {
        pe.innerHTML = `<sup>₦</sup>${p.monthly.toLocaleString('en-NG')}`;
        pp.textContent = 'per month';
        if (ps) ps.style.opacity = '0';
      }
    });
  }
  track.addEventListener('click', toggle);
  track.addEventListener('keydown', e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
}

function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item    = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
      document.querySelectorAll('.faq-q').forEach(b=>b.setAttribute('aria-expanded','false'));
      if (!wasOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   GLOBAL BEHAVIOURS — run once
════════════════════════════════════════════════════════════════ */

function initCursor() {
  if (isMob()) return;
  const dot  = document.querySelector('.cursor');
  const ring = document.querySelector('.cursor-ring');
  if (!dot||!ring) return;
  let mx=0,my=0,dx=0,dy=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  if (!pRM) {
    (function tick(){
      dx+=(mx-dx)*.88; dy+=(my-dy)*.88;
      rx+=(mx-rx)*.1;  ry+=(my-ry)*.1;
      dot.style.left=dx+'px'; dot.style.top=dy+'px';
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(tick);
    })();
  }
  document.addEventListener('mouseover',e=>{if(e.target.closest('a,button,[tabindex]'))document.body.classList.add('cur-on');});
  document.addEventListener('mouseout', e=>{if(e.target.closest('a,button,[tabindex]'))document.body.classList.remove('cur-on');});
}

function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobile-nav');
  if (!btn||!nav) return;
  btn.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    btn.setAttribute('aria-expanded',open);
    document.body.style.overflow=open?'hidden':'';
  });
  nav.addEventListener('click',e=>{
    if(e.target.tagName==='A'){
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      document.body.style.overflow='';
    }
  });
}

/* ════════════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════════════ */

(function boot() {
  initTicker();
  initCursor();
  initHamburger();

  const router = new Router();

  router
    .on('/',                      renderHub)
    .on('/wealth',                renderWealthHome)
    .on('/wealth/how-it-works',   renderHowItWorks)
    .on('/wealth/investments',    renderInvestments)
    .on('/wealth/features',       renderFeatures)
    .on('/wealth/referral',       renderReferral)
    .on('/research',              renderResearchHome)
    .on('/research/:slug',        renderCategory)
    .on('/reports',               renderReports)
    .on('/subscribe',             renderSubscribe)
    .on('/about',                 renderAbout)
    .on('/faq',                   renderFAQ);

  router.init();

  // Scroll to top + close mobile nav on every navigation
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const nav = document.getElementById('mobile-nav');
    if (nav?.classList.contains('open')) {
      nav.classList.remove('open');
      document.getElementById('hamburger')?.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    }
    window.scrollTo(0,0);
  });
})();
