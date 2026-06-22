const SAMPLE_DATA = [
  {
    "title": "Manchester United defeats Chelsea 3-1 in Premier League showdown",
    "summary": "In a thrilling Premier League match at Old Trafford, Manchester United secured a decisive 3-1 victory over Chelsea with goals from Rashford, Fernandes, and Garnacho.",
    "category": "Premier League",
    "published_at": "2026-06-22T14:30:00Z",
    "thumbnail_url": "https://example.com/images/mu-vs-chelsea.jpg",
    "article_url": "https://example.com/news/mu-chelsea-premier-league"
  },
  {
    "title": "Simona Halep reaches Wimbledon quarterfinals",
    "summary": "Romanian tennis star Simona Halep advanced to the Wimbledon quarterfinals after a straight-sets victory over her opponent in a dominant performance on Centre Court.",
    "category": "Tenis",
    "published_at": "2026-06-21T18:45:00Z",
    "thumbnail_url": "https://example.com/images/halep-wimbledon.jpg",
    "article_url": "https://example.com/news/halep-wimbledon-quarters"
  },
  {
    "title": "Max Verstappen wins Monaco Grand Prix",
    "summary": "Red Bull's Max Verstappen claimed victory at the Monaco Grand Prix, extending his championship lead with a masterful drive through the streets of Monte Carlo.",
    "category": "Formula 1",
    "published_at": "2026-06-20T16:00:00Z",
    "thumbnail_url": "https://example.com/images/verstappen-monaco.jpg",
    "article_url": "https://example.com/news/verstappen-monaco-gp"
  }
];

const PALETTE = ['#109e49'];
const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

const CATEGORIES = [
  'All',
  'Premier League',
  'Liga 1',
  'Fotbal Extern',
  'Champions League',
  'Europa League',
  'Tenis',
  'Formula 1',
  'Baschet',
  'Handbal'
];

export default async function decorate(block, bridge) {
  let articles;
  
  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    
    if (isPreview) {
      articles = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      articles = structuredContent?.news || [];
    }
    
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  } else {
    articles = SAMPLE_DATA;
  }
  
  block.textContent = '';
  renderNews(block, articles, bridge);
}

function renderNews(block, articles, bridge) {
  let activeCategory = 'All';
  let displayedCount = 3;
  
  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar';
  
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    if (cat === activeCategory) btn.classList.add('active');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      activeCategory = cat;
      displayedCount = 3;
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateArticles();
    });
    filterBar.appendChild(btn);
  });
  
  block.appendChild(filterBar);
  
  const container = document.createElement('div');
  container.className = 'articles-container';
  block.appendChild(container);
  
  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.className = 'load-more-btn';
  loadMoreBtn.textContent = 'Load More';
  loadMoreBtn.style.display = 'none';
  loadMoreBtn.addEventListener('click', () => {
    displayedCount += 3;
    updateArticles();
  });
  block.appendChild(loadMoreBtn);
  
  function updateArticles() {
    const filtered = activeCategory === 'All' 
      ? articles 
      : articles.filter(a => a.category === activeCategory);
    
    container.textContent = '';
    
    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const p = document.createElement('p');
      p.textContent = 'No articles found for this category.';
      empty.appendChild(p);
      container.appendChild(empty);
      loadMoreBtn.style.display = 'none';
      if (bridge) bridge.reportSize(block.offsetWidth, block.offsetHeight);
      return;
    }
    
    const toShow = filtered.slice(0, displayedCount);
    
    toShow.forEach((article, idx) => {
      const card = document.createElement('div');
      card.className = 'article-card';
      
      const thumbnail = document.createElement('div');
      thumbnail.className = 'article-thumbnail';
      
      const fallbackColor = CARD_COLORS[idx % CARD_COLORS.length];
      const colorDiv = () => {
        const d = document.createElement('div');
        d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
        return d;
      };
      
      if (article.thumbnail_url && !article.thumbnail_url.includes('example.com')) {
        const img = document.createElement('img');
        img.src = article.thumbnail_url;
        img.alt = article.title || 'Article thumbnail';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        img.onerror = () => {
          if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img);
        };
        thumbnail.appendChild(img);
      } else {
        thumbnail.appendChild(colorDiv());
      }
      
      card.appendChild(thumbnail);
      
      const content = document.createElement('div');
      content.className = 'article-content';
      
      const header = document.createElement('div');
      header.className = 'article-header';
      
      const title = document.createElement('h3');
      title.className = 'article-title';
      title.textContent = article.title || 'Untitled';
      header.appendChild(title);
      
      if (article.category) {
        const badge = document.createElement('span');
        badge.className = 'category-badge';
        badge.textContent = article.category;
        header.appendChild(badge);
      }
      
      content.appendChild(header);
      
      if (article.summary) {
        const summary = document.createElement('p');
        summary.className = 'article-summary';
        summary.textContent = article.summary;
        content.appendChild(summary);
      }
      
      const footer = document.createElement('div');
      footer.className = 'article-footer';
      
      if (article.published_at) {
        const date = document.createElement('span');
        date.className = 'article-date';
        try {
          const d = new Date(article.published_at);
          date.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
          date.textContent = article.published_at;
        }
        footer.appendChild(date);
      }
      
      const readMore = document.createElement('a');
      readMore.className = 'read-more';
      readMore.textContent = 'Read More';
      readMore.href = article.article_url || '#';
      
      if (bridge) {
        readMore.addEventListener('click', (e) => {
          e.preventDefault();
          bridge.sendMessage(`Tell me more about: ${article.title}`);
        });
      } else {
        readMore.target = '_blank';
      }
      
      footer.appendChild(readMore);
      content.appendChild(footer);
      
      card.appendChild(content);
      container.appendChild(card);
    });
    
    loadMoreBtn.style.display = filtered.length > displayedCount ? 'block' : 'none';
    
    if (bridge) {
      setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 100);
    }
  }
  
  updateArticles();
}