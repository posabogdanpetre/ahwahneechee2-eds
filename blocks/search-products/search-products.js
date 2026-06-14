const SAMPLE_DATA = [
  {
    "name": "Men's Textured Fleece Jacket",
    "description": "Soft, quick-drying jacket in 100% recycled fabric with pebbled texture, built for warmth and everyday wear.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw52d6c1f7/images/hi-res/23310_WSTO.jpg?sw=512&sh=512&sfrm=png&q=95&bgcolor=f3f4ef",
    "price": "£150",
    "category": "Men's Fleece"
  },
  {
    "name": "Women's Down Sweater Insulated Jacket",
    "description": "Lightweight, windproof jacket with recycled nylon shell and 800-fill-power recycled down for versatile warmth.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw4729f37a/images/hi-res/84684_BNLB.jpg?sw=512&sh=512&sfrm=png&q=95&bgcolor=f3f4ef",
    "price": "£230",
    "category": "Women's Insulated Jackets"
  },
  {
    "name": "Black Hole Micro MLC Carry-On Backpack 22L",
    "description": "Soft-sided convertible backpack designed for strictest travel requirements, can be carried three ways.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw0eb0f7af/images/hi-res/49260_BCW.jpg?sw=512&sh=512&sfrm=png&q=95&bgcolor=f3f4ef",
    "price": "£140",
    "category": "Backpacks & Travel"
  },
  {
    "name": "Men's Downdrift Insulated Jacket",
    "description": "Retro-inspired down jacket with 600-fill-power recycled down providing warmth for mountains and beyond.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwaed79869/images/hi-res/20600_OLGG.jpg?sw=512&sh=512&sfrm=png&q=95&bgcolor=f3f4ef",
    "price": "£224",
    "category": "Men's Down Jackets"
  },
  {
    "name": "Women's Untracked Ski/Snowboard Jacket",
    "description": "Waterproof storm protection for big-mountain descents with supple 3-layer GORE-TEX ePE Performance fabric.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwf20a5a24/images/hi-res/29879_TNGO.jpg?sw=512&sh=512&sfrm=png&q=95&bgcolor=f3f4ef",
    "price": "£441",
    "category": "Women's Ski & Snowboard"
  },
  {
    "name": "Men's Better Sweater 1/4-Zip Fleece Pullover",
    "description": "Warm, 100% recycled polyester quarter-zip combining sweater-knit aesthetic with easy-care fleece performance.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw1e3ab535/images/hi-res/25523_CLOR.jpg?sw=512&sh=512&sfrm=png&q=95&bgcolor=f3f4ef",
    "price": "£120",
    "category": "Men's Fleece"
  }
];

const PALETTE = [];
const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

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

function getCardTheme(palette, index) {
  const paletteTheme = getThemedCardBg(palette);
  if (paletteTheme) return paletteTheme;
  const color = CARD_COLORS[index % CARD_COLORS.length];
  return { bg: color, fg: '#ffffff' };
}

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
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const container = document.createElement('div');
  container.className = 'carousel-container';

  const limitedItems = items.slice(0, 6);

  limitedItems.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const cardTheme = getCardTheme(PALETTE, index);

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';

    const createFallbackDiv = () => {
      const div = document.createElement('div');
      div.className = 'image-fallback';
      div.style.backgroundColor = CARD_COLORS[index % CARD_COLORS.length];
      return div;
    };

    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || 'Product image';
      img.loading = 'lazy';
      img.onerror = () => {
        img.parentNode.replaceChild(createFallbackDiv(), img);
      };
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(createFallbackDiv());
    }

    const ctaButton = document.createElement('button');
    ctaButton.className = 'cta-button';
    ctaButton.textContent = 'View Details';
    ctaButton.setAttribute('aria-label', `View details for ${item.name || 'product'}`);
    if (bridge) {
      ctaButton.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaButton);

    card.appendChild(imageContainer);

    const content = document.createElement('div');
    content.className = 'card-content';
    content.style.background = cardTheme.bg;
    content.style.color = cardTheme.fg;

    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = item.name || 'Product';
    content.appendChild(name);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'product-description';
      desc.textContent = item.description;
      content.appendChild(desc);
    }

    const footer = document.createElement('div');
    footer.className = 'product-footer';

    if (item.price) {
      const price = document.createElement('div');
      price.className = 'product-price';
      price.textContent = item.price;
      footer.appendChild(price);
    }

    if (item.category) {
      const category = document.createElement('span');
      category.className = 'product-category';
      category.textContent = item.category;
      footer.appendChild(category);
    }

    content.appendChild(footer);
    card.appendChild(content);
    container.appendChild(card);
  });

  wrapper.appendChild(container);

  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-nav prev hidden';
  prevBtn.innerHTML = '◀';
  prevBtn.setAttribute('aria-label', 'Scroll left');
  prevBtn.addEventListener('click', () => {
    container.scrollBy({ left: -236, behavior: 'smooth' });
  });
  prevBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      container.scrollBy({ left: -236, behavior: 'smooth' });
    }
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-nav next';
  nextBtn.innerHTML = '▶';
  nextBtn.setAttribute('aria-label', 'Scroll right');
  nextBtn.addEventListener('click', () => {
    container.scrollBy({ left: 236, behavior: 'smooth' });
  });
  nextBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      container.scrollBy({ left: 236, behavior: 'smooth' });
    }
  });

  wrapper.appendChild(prevBtn);
  wrapper.appendChild(nextBtn);

  const fadeGradient = document.createElement('div');
  fadeGradient.className = 'fade-gradient';
  const firstCardTheme = getCardTheme(PALETTE, 0);
  fadeGradient.style.background = `linear-gradient(to right, transparent, ${firstCardTheme.bg}cc)`;
  wrapper.appendChild(fadeGradient);

  const updateNavButtons = () => {
    const atStart = container.scrollLeft <= 1;
    const atEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 1;
    prevBtn.classList.toggle('hidden', atStart);
    nextBtn.classList.toggle('hidden', atEnd);
  };

  container.addEventListener('scroll', updateNavButtons);
  updateNavButtons();

  block.appendChild(wrapper);
}