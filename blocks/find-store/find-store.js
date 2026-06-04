// Sample data for standalone/preview mode - store locations
const SAMPLE_DATA = [
  {
    name: "Patagonia Manchester",
    address: "King Street, Manchester M2 7AZ",
    phone: "+44 (0)161 834 4005",
    directions_url: "https://maps.google.com/?q=Patagonia+Manchester"
  },
  {
    name: "Patagonia Bristol",
    address: "81 Park Street, Bristol BS1 5PF",
    phone: "+44 (0)1202017184",
    directions_url: "https://maps.google.com/?q=Patagonia+Bristol"
  }
];

const PALETTE = ['#1a1a1a','#2d6ae0'];

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
    renderEmptyState(block, bridge);
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

function renderEmptyState(block, bridge) {
  const card = document.createElement('div');
  card.className = 'find-store-empty';
  card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

  const icon = document.createElement('div');
  icon.className = 'pin-icon';
  icon.innerHTML = '📍';
  icon.style.cssText = `opacity:0.7;color:${theme?.fg ?? '#fff'}`;
  card.appendChild(icon);

  const heading = document.createElement('h3');
  heading.textContent = 'Find a store near you';
  card.appendChild(heading);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter ZIP code...';
  input.className = 'zip-input';
  card.appendChild(input);

  const button = document.createElement('button');
  button.className = 'search-btn';
  button.textContent = 'Find Nearby';
  if (bridge) {
    button.addEventListener('click', () => {
      const zip = input.value.trim();
      if (zip) {
        bridge.sendMessage(`Find stores near ${zip}`);
      }
    });
  }
  card.appendChild(button);

  block.appendChild(card);
}

function renderStores(block, stores, bridge) {
  const container = document.createElement('div');
  container.className = 'stores-container';

  const displayStores = stores.slice(0, 2);
  
  displayStores.forEach((store, idx) => {
    const card = document.createElement('div');
    card.className = 'store-card';
    card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

    const pinCircle = document.createElement('div');
    pinCircle.className = 'pin-circle';
    pinCircle.innerHTML = '📍';
    card.appendChild(pinCircle);

    const name = document.createElement('h3');
    name.className = 'store-name';
    name.textContent = store.name;
    card.appendChild(name);

    const address = document.createElement('p');
    address.className = 'store-address';
    address.textContent = store.address;
    card.appendChild(address);

    if (store.phone) {
      const phone = document.createElement('a');
      phone.className = 'store-phone';
      phone.href = `tel:${store.phone.replace(/\s/g, '')}`;
      phone.textContent = store.phone;
      card.appendChild(phone);
    }

    if (store.directions_url && bridge) {
      const directions = document.createElement('button');
      directions.className = 'directions-btn';
      directions.textContent = 'Get Directions';
      directions.addEventListener('click', () => {
        bridge.openLink(store.directions_url);
      });
      card.appendChild(directions);
    }

    container.appendChild(card);
  });

  block.appendChild(container);
}