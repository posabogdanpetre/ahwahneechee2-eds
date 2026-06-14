// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: "Men's Micro D Fleece Jacket",
    description: "Made with 100% recycled polyester, feels unbelievably soft, provides continual warmth, and dries quickly.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwe09856fd/images/hi-res/26171_ELGR.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    price: "£63",
    category: "Men's Fleece"
  },
  {
    name: "Women's Retro Pile Fleece Jacket",
    description: "Heritage-inspired with 100% recycled polyester double-sided shearling fleece for ultimate softness and warmth.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw7c2512d9/images/hi-res/22795_NAT.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    price: "£140",
    category: "Women's Fleece"
  },
  {
    name: "Men's Classic Retro-X Fleece Jacket",
    description: "Iconic windproof quarter-inch pile fleece made with 100% REPREVE recycled polyester sourced from coastal communities.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw443a7d6d/images/hi-res/23057_DNBA.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    price: "£220",
    category: "Men's Fleece"
  },
  {
    name: "Airfarer Cap",
    description: "Five-panel organic cotton hat with brim built from fully traceable NetPlus 100% recycled fishing nets.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwf95efc62/images/hi-res/37996_STSA.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    price: "£40",
    category: "Hats & Accessories"
  },
  {
    name: "Friction Belt",
    description: "Low-profile 100% recycled nylon web belt with anticorrosive aluminum buckle that doubles as an emergency lash strap.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw15ced377/images/hi-res/59179_BLK.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    price: "£28",
    category: "Accessories"
  }
];

const PALETTE = ['#1a1a1a', '#2b6cb0'];
const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

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
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.products — bare array outputSchema; key derived from actionName "search_products"
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'carousel';

  items.slice(0, 5).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';

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
      img.onerror = () => {
        if (img.parentNode) {
          img.parentNode.replaceChild(colorDiv(), img);
        }
      };
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'image-cta';
    ctaBtn.textContent = 'More Details';
    ctaBtn.setAttribute('aria-label', `More details for ${item.name || 'product'}`);
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);

    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'card-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    const name = document.createElement('div');
    name.className = 'product-name';
    name.textContent = item.name || '';
    name.style.color = theme?.fg ?? '#fff';
    info.appendChild(name);

    const desc = document.createElement('div');
    desc.className = 'product-description';
    desc.textContent = item.description || '';
    desc.style.color = theme?.fg ?? '#fff';
    info.appendChild(desc);

    const bottomRow = document.createElement('div');
    bottomRow.className = 'bottom-row';

    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = item.price || '';
    price.style.color = theme?.fg ?? '#fff';
    bottomRow.appendChild(price);

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'category-badge';
      badge.textContent = item.category;
      badge.style.cssText = `background:#1a1a1a;color:#fff`;
      bottomRow.appendChild(badge);
    }

    info.appendChild(bottomRow);
    card.appendChild(info);
    carousel.appendChild(card);
  });

  wrapper.appendChild(carousel);

  const fade = document.createElement('div');
  fade.className = 'fade-gradient';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const leftArrow = document.createElement('button');
  leftArrow.className = 'nav-arrow left-arrow';
  leftArrow.textContent = '◀';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.style.display = 'none';

  const rightArrow = document.createElement('button');
  rightArrow.className = 'nav-arrow right-arrow';
  rightArrow.textContent = '▶';
  rightArrow.setAttribute('aria-label', 'Scroll right');

  const updateArrows = () => {
    const atStart = carousel.scrollLeft <= 0;
    const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1;
    leftArrow.style.display = atStart ? 'none' : 'block';
    rightArrow.style.display = atEnd ? 'none' : 'block';
  };

  leftArrow.addEventListener('click', () => {
    carousel.scrollBy({ left: -236, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    carousel.scrollBy({ left: 236, behavior: 'smooth' });
  });

  carousel.addEventListener('scroll', updateArrows);

  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  block.appendChild(wrapper);

  updateArrows();

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        bridge.reportSize(block.offsetWidth, block.offsetHeight);
      }, 150);
    });
    ro.observe(block);
  }
}
