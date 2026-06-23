// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Prima echipă care îl vrea pe Zeljko Kopic, după plecarea de la Dinamo', description: "Transfer news on Zeljko Kopic's next club after leaving Dinamo.", image_url: 'https://www.sport.ro/img/2025/05/26/180419/zeljko-kopic.jpg?fm=jpg&q=80&fit=crop&crop=360%2C360%2C34%2C0&w=400', category: 'Fotbal Extern' },
  { name: 'Claudiu Niculescu la 50 de ani! Fanii lui Dinamo nu l-au uitat', description: 'Feature on Dinamo legend Claudiu Niculescu turning 50.', image_url: 'https://www.sport.ro/img/2026/06/23/120024/niculescu-danciulescu-dinamo-imago4409479.jpg?fm=jpg&q=80&fit=crop&crop=1540%2C866%2C0%2C68&w=1280', category: 'Liga 1' },
  { name: 'FC Botoșani poate rămâne cu ochii în soare! Enriko Papa e dorit de două echipe', description: 'Two top-flight clubs reportedly want Enriko Papa.', image_url: 'https://www.sport.ro/img/2022/03/12/144001/aniversarea-unuia-dintre-cei-mai-loiali-stranieri-din-liga-1-enriko-papa-implineste-29-de-ani.jpg?fm=jpg&q=80&fit=crop&crop=1000%2C750%2C0%2C0&w=400', category: 'Fotbal Intern' },
  { name: 'Mijlocașul defensiv a revenit în Superliga: a semnat cu Farul Constanța', description: 'Defensive midfielder returns to Superliga after two years in France.', image_url: 'https://www.sport.ro/img/2026/06/23/105912/fcsb-fc-arges-superliga-superbet-2102022-tony-njike.jpg?fm=jpg&q=80&fit=crop&crop=3939%2C2216%2C0%2C92&w=1280', category: 'Liga 1' },
  { name: 'Un milion de euro pentru Florinel Coman!', description: 'Transfer report on a one-million-euro offer for Florinel Coman.', image_url: 'https://www.sport.ro/img/2026/04/04/194249/coman-gharafa-insta.JPG?fm=jpg&q=80&fit=crop&crop=820%2C462%2C0%2C0&w=1280', category: 'Stranieri' },
  { name: 'Susținătoarele echipei Capul Verde, virale pe internet la Cupa Mondială 2026', description: 'Cape Verde fans go viral during the 2026 World Cup.', image_url: 'https://www.sport.ro/img/2026/06/23/085439/cabo-verde.jpg?fm=jpg&q=80&fit=crop&crop=2915%2C1824%2C342%2C0', category: 'CM 2026' },
];

// Brand palette from BuildWidgetRequest.
const PALETTE = ['#109e49', '#008000'];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

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
      // structuredContent.articles — bare array outputSchema; key derived from actionName "list_news_articles"
      items = structuredContent?.articles || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderArticles(block, items, bridge);

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

function renderArticles(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-news-articles-wrapper';

  const track = document.createElement('div');
  track.className = 'list-news-articles-track';

  items.slice(0, 6).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'list-news-articles-card';

    const media = document.createElement('div');
    media.className = 'list-news-articles-media';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.loading = 'lazy';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      media.appendChild(img);
    } else {
      media.appendChild(colorDiv());
    }

    const cta = document.createElement('button');
    cta.className = 'list-news-articles-cta';
    cta.type = 'button';
    cta.textContent = 'Read Article';
    if (bridge) {
      cta.addEventListener('click', () => {
        if (item.url) bridge.openLink(item.url);
        else bridge.sendMessage(`Tell me more about: ${item.name}`);
      });
    }
    media.appendChild(cta);

    card.appendChild(media);

    const info = document.createElement('div');
    info.className = 'list-news-articles-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'list-news-articles-title';
    title.textContent = item.name || '';
    info.appendChild(title);

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'list-news-articles-badge';
      badge.textContent = item.category;
      info.appendChild(badge);
    }

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'list-news-articles-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `list-news-articles-arrow list-news-articles-arrow-${dir}`;
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.textContent = dir === 'left' ? '◀' : '▶';
    const scrollBy = () => {
      const card = track.querySelector('.list-news-articles-card');
      const amount = card ? card.offsetWidth + 16 : 236;
      track.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };
    b.addEventListener('click', scrollBy);
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollBy(); }
    });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    leftArrow.style.display = track.scrollLeft <= 2 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= maxScroll - 2 ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll - 2 ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
