// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Nano Puff Jacket',
    original_price: '$249',
    sale_price: '$174',
    discount_percentage: '30% OFF',
    category: 'Jackets & Vests'
  },
  {
    name: 'Better Sweater Fleece',
    original_price: '$139',
    sale_price: '$97',
    discount_percentage: '30% OFF',
    category: 'Fleece'
  },
  {
    name: 'Capilene Thermal Weight',
    original_price: '$79',
    sale_price: '$55',
    discount_percentage: '30% OFF',
    category: 'Baselayers'
  },
  {
    name: 'Quandary Pants',
    original_price: '$89',
    sale_price: '$62',
    discount_percentage: '30% OFF',
    category: 'Shorts & Pants'
  },
  {
    name: 'Black Hole Pack 32L',
    original_price: '$149',
    sale_price: '$104',
    discount_percentage: '30% OFF',
    category: 'Bags & Packs'
  }
];

const PALETTE = [];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s=c/255; return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4); };
  const relLum = (r,g,b) => 0.2126*lum(r)+0.7152*lum(g)+0.0722*lum(b);
  if (relLum(r,g,b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo=0, hi=1;
  for (let i=0; i<20; i++) {
    const m=(lo+hi)/2;
    if (relLum(Math.round(r*m),Math.round(g*m),Math.round(b*m)) > 0.12) hi=m; else lo=m;
  }
  const dr=Math.round(r*lo), dg=Math.round(g*lo), db=Math.round(b*lo);
  return { bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`, fg:'#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let deals;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      deals = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      // structuredContent.deals — bare array outputSchema; key derived from actionName "get_current_deals"
      const structuredContent = _result?.structuredContent || _result;
      deals = structuredContent?.deals || [];
    }
  } else {
    deals = SAMPLE_DATA;
  }

  block.textContent = '';
  renderDeals(block, deals, bridge);

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

function renderDeals(block, deals, bridge) {
  const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

  const wrapper = document.createElement('div');
  wrapper.className = 'deals-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'deals-carousel';

  deals.forEach((deal, i) => {
    const card = document.createElement('div');
    card.className = 'deal-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'deal-image';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };

    if (deal.image_url) {
      const img = document.createElement('img');
      img.src = deal.image_url;
      img.alt = deal.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    if (deal.discount_percentage) {
      const badge = document.createElement('div');
      badge.className = 'discount-badge';
      badge.textContent = deal.discount_percentage;
      imageContainer.appendChild(badge);
    }

    const cta = document.createElement('button');
    cta.className = 'view-deal-btn';
    cta.textContent = 'View Deal';
    if (bridge) {
      cta.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${deal.name}`);
      });
    }
    imageContainer.appendChild(cta);

    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'deal-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    const name = document.createElement('div');
    name.className = 'deal-name';
    name.textContent = deal.name;
    info.appendChild(name);

    const priceRow = document.createElement('div');
    priceRow.className = 'price-row';

    if (deal.original_price) {
      const originalPrice = document.createElement('span');
      originalPrice.className = 'original-price';
      originalPrice.textContent = deal.original_price;
      priceRow.appendChild(originalPrice);
    }

    if (deal.sale_price) {
      const salePrice = document.createElement('span');
      salePrice.className = 'sale-price';
      salePrice.textContent = deal.sale_price;
      priceRow.appendChild(salePrice);
    }

    info.appendChild(priceRow);
    card.appendChild(info);
    carousel.appendChild(card);
  });

  wrapper.appendChild(carousel);

  const leftBtn = document.createElement('button');
  leftBtn.className = 'nav-btn nav-left';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';
  leftBtn.style.display = 'none';

  const rightBtn = document.createElement('button');
  rightBtn.className = 'nav-btn nav-right';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);

  const fade = document.createElement('div');
  fade.className = 'fade-overlay';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const updateNavButtons = () => {
    const atStart = carousel.scrollLeft <= 1;
    const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 1;
    leftBtn.style.display = atStart ? 'none' : 'flex';
    rightBtn.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };

  carousel.addEventListener('scroll', updateNavButtons);

  leftBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -220, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: 220, behavior: 'smooth' });
  });

  updateNavButtons();

  block.appendChild(wrapper);
}
