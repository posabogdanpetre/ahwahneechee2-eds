const SAMPLE_DATA = [
  {
    name: 'Patagonia Boulder',
    address: '2650 Canyon Blvd, Boulder, CO 80302',
    phone: '(303) 442-5828',
    hours: 'Mon-Sat 10AM-8PM, Sun 11AM-6PM',
    type: 'Retail Store'
  },
  {
    name: 'Mountain Outfitters',
    address: '1501 Pearl St, Boulder, CO 80302',
    phone: '(303) 449-5396',
    hours: 'Mon-Sun 9AM-7PM',
    type: 'Authorized Dealer'
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
  let stores;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      stores = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      stores = structuredContent?.stores || [];
    }
  } else {
    stores = SAMPLE_DATA;
  }

  block.textContent = '';
  
  if (!stores || stores.length === 0) {
    renderEmptyState(block, bridge);
  } else {
    renderStores(block, stores.slice(0, 2), bridge);
  }

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

function renderEmptyState(block, bridge) {
  const card = document.createElement('div');
  card.className = 'search-card';
  card.style.cssText = `background: ${theme?.bg ?? '#1a3a5c'}; color: ${theme?.fg ?? '#fff'};`;

  const pinIcon = document.createElement('div');
  pinIcon.className = 'pin-icon';
  pinIcon.textContent = '📍';
  pinIcon.style.color = theme?.fg ?? '#fff';
  card.appendChild(pinIcon);

  const heading = document.createElement('h2');
  heading.textContent = 'Find a store near you';
  heading.style.color = theme?.fg ?? '#fff';
  card.appendChild(heading);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter ZIP code...';
  input.setAttribute('aria-label', 'ZIP code');
  card.appendChild(input);

  const button = document.createElement('button');
  button.textContent = 'Search';
  button.setAttribute('aria-label', 'Search for stores');
  
  if (bridge) {
    button.addEventListener('click', () => {
      const location = input.value.trim();
      if (location) {
        bridge.sendMessage(`Find Patagonia stores near ${location}`);
      }
    });
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const location = input.value.trim();
        if (location) {
          bridge.sendMessage(`Find Patagonia stores near ${location}`);
        }
      }
    });
  }
  
  card.appendChild(button);
  block.appendChild(card);
}

function renderStores(block, stores, bridge) {
  const container = document.createElement('div');
  container.className = 'stores-container';

  stores.forEach((store) => {
    const card = document.createElement('div');
    card.className = 'store-card';
    card.style.cssText = `background: ${theme?.bg ?? '#1a3a5c'}; color: ${theme?.fg ?? '#fff'};`;

    const pinCircle = document.createElement('div');
    pinCircle.className = 'pin-circle';
    pinCircle.textContent = '📍';
    card.appendChild(pinCircle);

    const name = document.createElement('div');
    name.className = 'store-name';
    name.textContent = store.name || '';
    name.style.color = theme?.fg ?? '#fff';
    card.appendChild(name);

    if (store.address) {
      const address = document.createElement('div');
      address.className = 'store-address';
      address.textContent = store.address;
      address.style.color = theme?.fg ?? '#fff';
      card.appendChild(address);
    }

    if (store.phone) {
      const phone = document.createElement('a');
      phone.className = 'store-phone';
      phone.href = `tel:${store.phone}`;
      phone.textContent = store.phone;
      card.appendChild(phone);
    }

    if (store.hours) {
      const hours = document.createElement('div');
      hours.className = 'store-hours';
      hours.textContent = store.hours;
      hours.style.color = theme?.fg ?? '#fff';
      card.appendChild(hours);
    }

    if (store.type) {
      const type = document.createElement('div');
      type.className = 'store-type';
      type.textContent = store.type;
      type.style.color = theme?.fg ?? '#fff';
      card.appendChild(type);
    }

    container.appendChild(card);
  });

  block.appendChild(container);
}