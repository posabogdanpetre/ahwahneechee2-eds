// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: "Men's Nano Puff Insulated Jacket",
    original_price: 220,
    sale_price: 170,
    discount_percentage: "23%",
    category: "Jackets",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw8079c0d9/images/hi-res/84213_BLSG.jpg?sw=768&sh=768&sfrm=png&q=95&bgcolor=f3f4ef"
  },
  {
    name: "Men's Triolet Alpine Jacket",
    original_price: 480,
    sale_price: 380,
    discount_percentage: "21%",
    category: "Jackets",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw3898a537/images/hi-res/84213_SMDB.jpg?sw=768&sh=768&sfrm=png&q=95&bgcolor=f3f4ef"
  },
  {
    name: "Women's Better Sweater 1/4-Zip Fleece",
    original_price: 140,
    sale_price: 110,
    discount_percentage: "21%",
    category: "Fleece",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw86f4117a/images/hi-res/84213_OLGG.jpg?sw=768&sh=768&sfrm=png&q=95&bgcolor=f3f4ef"
  },
  {
    name: "Men's Houdini Windbreaker Jacket",
    original_price: 155,
    sale_price: 120,
    discount_percentage: "23%",
    category: "Jackets",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwc92431d5/images/hi-res/84213_FGE.jpg?sw=768&sh=768&sfrm=png&q=95&bgcolor=f3f4ef"
  },
  {
    name: "Men's Jackson Glacier Down Jacket",
    original_price: 450,
    sale_price: 350,
    discount_percentage: "22%",
    category: "Jackets",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwd54245bb/images/hi-res/84213_BLK.jpg?sw=768&sh=768&sfrm=png&q=95&bgcolor=f3f4ef"
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

const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

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
      // structuredContent.deals — bare array outputSchema; key derived from actionName "get_current_deals"
      items = structuredContent?.deals || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  const theme = getThemedCardBg(PALETTE);
  renderDeals(block, items, theme, bridge);

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

function renderDeals(block, items, theme, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'deals-carousel-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'deals-carousel';
  carousel.setAttribute('role', 'list');

  items.slice(0, 5).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'deal-card';
    card.setAttribute('role', 'listitem');

    const imageContainer = document.createElement('div');
    imageContainer.className = 'deal-card-image';

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
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    if (item.discount_percentage) {
      const badge = document.createElement('div');
      badge.className = 'discount-badge';
      badge.textContent = item.discount_percentage;
      imageContainer.appendChild(badge);
    }

    const cta = document.createElement('button');
    cta.className = 'deal-cta';
    cta.textContent = 'View Deal';
    cta.setAttribute('aria-label', `View deal for ${item.name}`);
    if (bridge) {
      cta.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    imageContainer.appendChild(cta);

    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'deal-card-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    const name = document.createElement('div');
    name.className = 'deal-name';
    name.textContent = item.name;
    info.appendChild(name);

    const priceRow = document.createElement('div');
    priceRow.className = 'deal-price-row';

    if (item.original_price) {
      const originalPrice = document.createElement('span');
      originalPrice.className = 'original-price';
      originalPrice.textContent = `£${item.original_price}`;
      priceRow.appendChild(originalPrice);
    }

    if (item.sale_price) {
      const salePrice = document.createElement('span');
      salePrice.className = 'sale-price';
      salePrice.textContent = `£${item.sale_price}`;
      priceRow.appendChild(salePrice);
    }

    info.appendChild(priceRow);
    card.appendChild(info);
    carousel.appendChild(card);
  });

  wrapper.appendChild(carousel);

  const leftArrow = document.createElement('button');
  leftArrow.className = 'carousel-arrow left';
  leftArrow.innerHTML = '◀';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.style.display = 'none';
  leftArrow.addEventListener('click', () => {
    carousel.scrollBy({ left: -220, behavior: 'smooth' });
  });
  wrapper.appendChild(leftArrow);

  const rightArrow = document.createElement('button');
  rightArrow.className = 'carousel-arrow right';
  rightArrow.innerHTML = '▶';
  rightArrow.setAttribute('aria-label', 'Scroll right');
  rightArrow.addEventListener('click', () => {
    carousel.scrollBy({ left: 220, behavior: 'smooth' });
  });
  wrapper.appendChild(rightArrow);

  const fade = document.createElement('div');
  fade.className = 'carousel-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const updateArrows = () => {
    leftArrow.style.display = carousel.scrollLeft <= 0 ? 'none' : 'flex';
    rightArrow.style.display = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 1 ? 'none' : 'flex';
  };

  carousel.addEventListener('scroll', updateArrows);
  updateArrows();

  block.appendChild(wrapper);
}