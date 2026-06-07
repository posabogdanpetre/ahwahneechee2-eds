const SAMPLE_DATA = [
  {
    "name": "Patagonia Manchester",
    "address": "51 King Street, Manchester M2 7AZ",
    "phone": "+44 (0)161 834 4005"
  },
  {
    "name": "Patagonia Bristol",
    "address": "81 Park Street, Bristol BS1 5PF",
    "phone": "+44 (0)1202017184"
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
  renderStores(block, stores, bridge);

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

function renderStores(block, stores, bridge) {
  const container = document.createElement('div');
  container.className = 'store-locator-container';

  if (!stores || stores.length === 0) {
    const searchCard = document.createElement('div');
    searchCard.className = 'search-card';

    const icon = document.createElement('div');
    icon.className = 'pin-icon';
    icon.innerHTML = '📍';
    searchCard.appendChild(icon);

    const heading = document.createElement('h2');
    heading.textContent = 'Find a store near you';
    searchCard.appendChild(heading);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter ZIP code...';
    input.className = 'search-input';
    searchCard.appendChild(input);

    const button = document.createElement('button');
    button.className = 'search-btn';
    button.textContent = 'Find Stores';
    if (bridge) {
      button.addEventListener('click', () => {
        const query = input.value.trim();
        if (query) {
          bridge.sendMessage(`Find stores near ${query}`);
        }
      });
    }
    searchCard.appendChild(button);

    container.appendChild(searchCard);
  } else {
    const resultsRow = document.createElement('div');
    resultsRow.className = 'stores-row';

    stores.slice(0, 2).forEach(store => {
      const card = document.createElement('div');
      card.className = 'store-card';

      const name = document.createElement('div');
      name.className = 'store-name';
      name.textContent = `📍 ${store.name}`;
      card.appendChild(name);

      const address = document.createElement('div');
      address.className = 'store-address';
      address.textContent = store.address;
      card.appendChild(address);

      if (store.phone) {
        const phone = document.createElement('div');
        phone.className = 'store-phone';
        phone.textContent = store.phone;
        card.appendChild(phone);
      }

      if (store.directions_url) {
        const btn = document.createElement('button');
        btn.className = 'directions-btn';
        btn.textContent = 'Get Directions';
        if (bridge) {
          btn.addEventListener('click', () => {
            bridge.openLink(store.directions_url);
          });
        } else {
          btn.addEventListener('click', () => {
            window.open(store.directions_url, '_blank');
          });
        }
        card.appendChild(btn);
      }

      resultsRow.appendChild(card);
    });

    container.appendChild(resultsRow);
  }

  block.appendChild(container);
}