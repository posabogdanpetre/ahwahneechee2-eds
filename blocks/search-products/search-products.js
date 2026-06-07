const SAMPLE_DATA = [
  { name: 'Nano Puff Jacket', price: '£199', category: 'Jackets & Vests', color_options: 4 },
  { name: 'Better Sweater Fleece', price: '£119', category: 'Fleece', color_options: 6 },
  { name: 'Capilene Cool Daily Shirt', price: '£45', category: 'T-Shirts', color_options: 3 },
  { name: 'Baggies Shorts 5"', price: '£55', category: 'Shorts', color_options: 8 },
  { name: 'Torrentshell 3L Jacket', price: '£169', category: 'Jackets & Vests', color_options: 5 }
];

const PALETTE = [];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#','');
  if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if(hex.length!==6)return null;
  let [r,g,b]=[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16)];
  if(isNaN(r)||isNaN(g)||isNaN(b))return null;
  const lum=(c)=>{const s=c/255;return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4);};
  const relLum=(r,g,b)=>0.2126*lum(r)+0.7152*lum(g)+0.0722*lum(b);
  if(relLum(r,g,b)<=0.12)return{bg:`#${hex}`,fg:'#ffffff'};
  let lo=0,hi=1;
  for(let i=0;i<20;i++){const m=(lo+hi)/2;if(relLum(Math.round(r*m),Math.round(g*m),Math.round(b*m))>0.12)hi=m;else lo=m;}
  const dr=Math.round(r*lo),dg=Math.round(g*lo),db=Math.round(b*lo);
  return{bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,fg:'#ffffff'};
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
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderCarousel(block, items, bridge);

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

function renderCarousel(block, items, bridge) {
  const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];
  
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const scrollContainer = document.createElement('div');
  scrollContainer.className = 'carousel-scroll';

  items.slice(0, 5).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image';
    
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

    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'cta-btn';
    ctaBtn.textContent = 'View Details';
    ctaBtn.setAttribute('aria-label', `View details for ${item.name || 'product'}`);
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);

    card.appendChild(imageContainer);

    const content = document.createElement('div');
    content.className = 'card-content';
    content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    const name = document.createElement('div');
    name.className = 'product-name';
    name.textContent = item.name || '';
    content.appendChild(name);

    const priceRow = document.createElement('div');
    priceRow.className = 'price-row';

    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = item.price || '';
    priceRow.appendChild(price);

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'category-badge';
      badge.textContent = item.category;
      priceRow.appendChild(badge);
    }

    content.appendChild(priceRow);

    if (item.color_options) {
      const colors = document.createElement('div');
      colors.className = 'color-options';
      colors.textContent = `${item.color_options} colors`;
      content.appendChild(colors);
    }

    card.appendChild(content);
    scrollContainer.appendChild(card);
  });

  const leftArrow = document.createElement('button');
  leftArrow.className = 'nav-arrow nav-left';
  leftArrow.textContent = '◀';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.style.display = 'none';

  const rightArrow = document.createElement('button');
  rightArrow.className = 'nav-arrow nav-right';
  rightArrow.textContent = '▶';
  rightArrow.setAttribute('aria-label', 'Scroll right');

  const updateArrows = () => {
    leftArrow.style.display = scrollContainer.scrollLeft <= 0 ? 'none' : 'flex';
    rightArrow.style.display = scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 1 ? 'none' : 'flex';
  };

  leftArrow.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: -236, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: 236, behavior: 'smooth' });
  });

  [leftArrow, rightArrow].forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  scrollContainer.addEventListener('scroll', updateArrows);
  updateArrows();

  const fade = document.createElement('div');
  fade.className = 'scroll-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;

  wrapper.appendChild(leftArrow);
  wrapper.appendChild(scrollContainer);
  wrapper.appendChild(rightArrow);
  wrapper.appendChild(fade);

  block.appendChild(wrapper);
}