// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Prima echipă care îl vrea pe Zeljko Kopic, după plecarea de la Dinamo',
    description: "Transfer news on Zeljko Kopic's next club after leaving Dinamo.",
    image_url: 'https://www.sport.ro/img/2025/05/26/180419/zeljko-kopic.jpg?fm=jpg&q=80&fit=crop&crop=360%2C360%2C34%2C0&w=400',
    category: 'Fotbal Extern',
  },
  {
    name: 'Claudiu Niculescu la 50 de ani! Fanii lui Dinamo nu l-au uitat',
    description: 'Feature on Dinamo legend Claudiu Niculescu turning 50.',
    image_url: 'https://www.sport.ro/img/2026/06/23/120024/niculescu-danciulescu-dinamo-imago4409479.jpg?fm=jpg&q=80&fit=crop&crop=1540%2C866%2C0%2C68&w=1280',
    category: 'Liga 1',
  },
  {
    name: 'FC Botoșani poate rămâne cu ochii în soare! Enriko Papa e dorit de două echipe',
    description: 'Two top-flight clubs reportedly want Enriko Papa.',
    image_url: 'https://www.sport.ro/img/2022/03/12/144001/aniversarea-unuia-dintre-cei-mai-loiali-stranieri-din-liga-1-enriko-papa-implineste-29-de-ani.jpg?fm=jpg&q=80&fit=crop&crop=1000%2C750%2C0%2C0&w=400',
    category: 'Fotbal Intern',
  },
  {
    name: 'Mijlocașul defensiv a revenit în Superliga: a semnat cu Farul Constanța',
    description: 'Defensive midfielder returns to Superliga after two years in France.',
    image_url: 'https://www.sport.ro/img/2026/06/23/105912/fcsb-fc-arges-superliga-superbet-2102022-tony-njike.jpg?fm=jpg&q=80&fit=crop&crop=3939%2C2216%2C0%2C92&w=1280',
    category: 'Liga 1',
  },
  {
    name: 'Un milion de euro pentru Florinel Coman!',
    description: 'Transfer report on a one-million-euro offer for Florinel Coman.',
    image_url: 'https://www.sport.ro/img/2026/04/04/194249/coman-gharafa-insta.JPG?fm=jpg&q=80&fit=crop&crop=820%2C462%2C0%2C0&w=1280',
    category: 'Stranieri',
  },
  {
    name: 'Susținătoarele echipei Capul Verde, virale pe internet la Cupa Mondială 2026',
    description: 'Cape Verde fans go viral during the 2026 World Cup.',
    image_url: 'https://www.sport.ro/img/2026/06/23/085439/cabo-verde.jpg?fm=jpg&q=80&fit=crop&crop=2915%2C1824%2C342%2C0',
    category: 'CM 2026',
  },
];

// Brand palette from BuildWidgetRequest.
const PALETTE = ['#109e49', '#008000'];

const CARD_COLORS = ['#109e49', '#008000', '#0fb5ae', '#2dca72', '#1a7a3a', '#0a5c2a'];

const HERO_HEADING = 'Get Live Scores';
const HERO_DESCRIPTION = "Catch today's live football scores, fixtures, and league standings. Tap below to view every match happening now.";
const CTA_LABEL = 'View Live Scores';

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.scores — bare array outputSchema; key derived from actionName "get_live_scores"
      items = structuredContent?.scores || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderCard(block, items, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderCard(block, items, bridge) {
  const heroImg = (items && items[0] && items[0].image_url) || '';

  const card = document.createElement('div');
  card.className = 'live-scores-card';

  // Hero banner
  const hero = document.createElement('div');
  hero.className = 'live-scores-hero';

  const colorDiv = () => {
    const d = document.createElement('div');
    d.className = 'live-scores-hero-fallback';
    d.style.backgroundColor = CARD_COLORS[0];
    return d;
  };

  if (heroImg) {
    const img = document.createElement('img');
    img.src = heroImg;
    img.alt = HERO_HEADING;
    img.className = 'live-scores-hero-img';
    img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
    hero.appendChild(img);
  } else {
    hero.appendChild(colorDiv());
  }

  const heroBtn = document.createElement('button');
  heroBtn.className = 'live-scores-hero-btn';
  heroBtn.textContent = 'Get Now';
  heroBtn.setAttribute('aria-label', CTA_LABEL);
  if (bridge) {
    heroBtn.addEventListener('click', () => bridge.sendMessage('Show me all of today\'s live football scores and fixtures'));
  }
  hero.appendChild(heroBtn);

  card.appendChild(hero);

  // Content block
  const content = document.createElement('div');
  content.className = 'live-scores-content';

  const heading = document.createElement('h3');
  heading.className = 'live-scores-heading';
  heading.textContent = HERO_HEADING;
  content.appendChild(heading);

  const desc = document.createElement('p');
  desc.className = 'live-scores-desc';
  desc.textContent = HERO_DESCRIPTION;
  content.appendChild(desc);

  const cta = document.createElement('button');
  cta.className = 'live-scores-cta';
  cta.textContent = CTA_LABEL;
  if (bridge) {
    cta.addEventListener('click', () => bridge.sendMessage('Show me all of today\'s live football scores and fixtures'));
  }
  content.appendChild(cta);

  card.appendChild(content);

  block.appendChild(card);
}
