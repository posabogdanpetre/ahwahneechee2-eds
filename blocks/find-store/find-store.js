const SAMPLE_DATA = [
  {
    name: 'Patagonia Manchester',
    address: 'King Street, Manchester M2 7AZ',
    phone: '0161 834 4005',
    directions_url: 'https://maps.google.com/?q=Patagonia+Manchester'
  },
  {
    name: 'Patagonia Bristol',
    address: '81 Park Street, Bristol BS1 5PF',
    phone: '+44 (0)1202017184',
    directions_url: 'https://maps.google.com/?q=Patagonia+Bristol'
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
      // structuredContent.stores — bare array outputSchema; key derived from actionName "find_store"
      stores = structuredContent?.stores || [];
    }
  } else {
    stores = SAMPLE_DATA;
  }

  block.textContent = '';

  if (!stores || stores.length === 0) {
    renderSearchCard(block, bridge);
  } else {
    renderStores(block, stores, bridge);
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

function renderSearchCard(block, bridge) {
  const cardBg = theme?.bg ?? '#1a3a5c';
  const cardFg = theme?.fg ?? '#fff';

  const card = document.createElement('div');
  card.className = 'store-search-card';
  card.style.cssText = `background:${cardBg};color:${cardFg}`;

  const pinIcon = document.createElement('div');
  pinIcon.className = 'pin-icon';
  pinIcon.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
  card.appendChild(pinIcon);

  const heading = document.createElement('h2');
  heading.className = 'search-heading';
  heading.textContent = 'Find a store near you';
  card.appendChild(heading);

  const input = document.createElement('input');
  input.className = 'search-input';
  input.type = 'text';
  input.placeholder = 'Enter ZIP code...';
  card.appendChild(input);

  const btn = document.createElement('button');
  btn.className = 'search-btn';
  btn.textContent = 'Find Nearby';
  if (bridge) {
    btn.addEventListener('click', () => {
      const location = input.value.trim();
      if (location) {
        bridge.sendMessage(`Find stores near ${location}`);
      }
    });
  }
  card.appendChild(btn);

  block.appendChild(card);
}

function renderStores(block, stores, bridge) {
  const cardBg = theme?.bg ?? '#1a3a5c';
  const cardFg = theme?.fg ?? '#fff';

  const container = document.createElement('div');
  container.className = 'stores-container';

  const displayStores = stores.slice(0, 2);

  displayStores.forEach(store => {
    const card = document.createElement('div');
    card.className = 'store-card';
    card.style.cssText = `background:${cardBg};color:${cardFg}`;

    const pin = document.createElement('div');
    pin.className = 'store-pin';
    pin.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
    card.appendChild(pin);

    const name = document.createElement('h3');
    name.className = 'store-name';
    name.textContent = store.name || '';
    card.appendChild(name);

    const address = document.createElement('p');
    address.className = 'store-address';
    address.textContent = store.address || '';
    card.appendChild(address);

    if (store.phone) {
      const phone = document.createElement('a');
      phone.className = 'store-phone';
      phone.href = `tel:${store.phone}`;
      phone.textContent = store.phone;
      card.appendChild(phone);
    }

    const btn = document.createElement('button');
    btn.className = 'directions-btn';
    btn.textContent = 'Get Directions';
    if (bridge && store.directions_url) {
      btn.addEventListener('click', () => {
        bridge.openLink(store.directions_url);
      });
    } else if (store.directions_url) {
      btn.addEventListener('click', () => {
        window.open(store.directions_url, '_blank');
      });
    }
    card.appendChild(btn);

    container.appendChild(card);
  });

  block.appendChild(container);
}