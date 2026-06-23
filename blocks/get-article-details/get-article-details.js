// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: 'Prima echipă care îl vrea pe Zeljko Kopic, după plecarea de la Dinamo',
  description: "Transfer news on Zeljko Kopic's next club after leaving Dinamo.",
  image_url: 'https://www.sport.ro/img/2025/05/26/180419/zeljko-kopic.jpg?fm=jpg&q=80&fit=crop&crop=360%2C360%2C34%2C0&w=400',
  category: 'Fotbal Extern',
  url: '',
};

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
  const relLum = (r, g, b) => 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItem(block, item, bridge);

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

function renderItem(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'article-card';

  // Image (left)
  const imageContainer = document.createElement('div');
  imageContainer.className = 'article-image';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }

  // CTA on image (bottom-center)
  const cta = document.createElement('button');
  cta.className = 'article-cta';
  cta.textContent = 'Read Full Story';
  if (bridge) {
    cta.addEventListener('click', () => {
      if (item.url) bridge.openLink(item.url);
      else bridge.sendMessage(`Tell me more about: ${item.name}`);
    });
  }
  imageContainer.appendChild(cta);
  card.appendChild(imageContainer);

  // Content (right)
  const content = document.createElement('div');
  content.className = 'article-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  if (item.category) {
    const badge = document.createElement('span');
    badge.className = 'article-badge';
    badge.textContent = item.category;
    content.appendChild(badge);
  }

  const title = document.createElement('h3');
  title.className = 'article-title';
  title.textContent = item.name || '';
  content.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'article-desc';
  desc.textContent = item.description || '';
  content.appendChild(desc);

  card.appendChild(content);
  block.appendChild(card);
}
