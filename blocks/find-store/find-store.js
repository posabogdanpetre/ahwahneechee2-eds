// Sample data for standalone/preview mode — matches outputSchema shape
const SAMPLE_DATA = [
  {
    name: 'Patagonia Portland',
    address: '907 NW Irving St, Portland, OR 97209',
    phone: '(503) 525-6552',
    hours: 'Mon-Sat 10am-7pm, Sun 11am-6pm',
    type: 'Retail Store'
  },
  {
    name: 'Patagonia Seattle',
    address: '2100 1st Ave, Seattle, WA 98121',
    phone: '(206) 622-9700',
    hours: 'Mon-Sat 10am-8pm, Sun 11am-6pm',
    type: 'Retail Store'
  }
];

// Brand palette from BuildWidgetRequest
const PALETTE = ['#1a1a1a', '#2d5f8a'];

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
  let stores;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      stores = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.stores — bare array outputSchema; key derived from actionName "find_store"
      stores = structuredContent?.stores || [];
    }
  } else {
    stores = SAMPLE_DATA;
  }

  block.textContent = '';
  renderStoreLocator(block, stores, bridge);

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

function renderStoreLocator(block, stores, bridge) {
  const container = document.createElement('div');
  container.className = 'store-locator-container';

  if (!stores || stores.length === 0) {
    // Empty state — search card
    const searchCard = document.createElement('div');
    searchCard.className = 'search-card';
    searchCard.style.cssText = `background: ${theme?.bg ?? '#1a3a5c'}; color: ${theme?.fg ?? '#fff'};`;

    const pinIcon = document.createElement('div');
    pinIcon.className = 'pin-icon';
    pinIcon.innerHTML = '📍';
    searchCard.appendChild(pinIcon);

    const heading = document.createElement('h2');
    heading.textContent = 'Find a store near you';
    searchCard.appendChild(heading);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter ZIP code...';
    input.className = 'location-input';
    searchCard.appendChild(input);

    const searchBtn = document.createElement('button');
    searchBtn.className = 'search-btn';
    searchBtn.textContent = 'Search';
    searchBtn.style.cssText = `background: ${PALETTE[0] || '#1a1a1a'}; color: #fff;`;
    if (bridge) {
      searchBtn.addEventListener('click', () => {
        const location = input.value.trim();
        if (location) {
          bridge.sendMessage(`Find stores near ${location}`);
        }
      });
    }
    searchCard.appendChild(searchBtn);

    container.appendChild(searchCard);
  } else {
    // Results — flex row of store cards
    const resultsRow = document.createElement('div');
    resultsRow.className = 'stores-row';

    stores.slice(0, 2).forEach(store => {
      const card = document.createElement('div');
      card.className = 'store-card';
      card.style.cssText = `background: ${theme?.bg ?? '#1a3a5c'}; color: ${theme?.fg ?? '#fff'};`;

      const pinCircle = document.createElement('div');
      pinCircle.className = 'pin-circle';
      pinCircle.innerHTML = '📍';
      card.appendChild(pinCircle);

      const storeName = document.createElement('h3');
      storeName.textContent = store.name;
      card.appendChild(storeName);

      const address = document.createElement('p');
      address.className = 'store-address';
      address.textContent = store.address;
      card.appendChild(address);

      const phone = document.createElement('p');
      phone.className = 'store-phone';
      phone.textContent = store.phone;
      phone.style.cssText = `color: ${theme?.fg ?? '#fff'};`;
      card.appendChild(phone);

      const hours = document.createElement('p');
      hours.className = 'store-hours';
      hours.textContent = store.hours;
      card.appendChild(hours);

      resultsRow.appendChild(card);
    });

    container.appendChild(resultsRow);
  }

  block.appendChild(container);
}
