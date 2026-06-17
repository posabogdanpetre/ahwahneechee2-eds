// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
// synthetic fixture — no sample data available from Action Planner
const SAMPLE_DATA = [
  {
    position: 1,
    team: "Manchester City",
    matches_played: 32,
    wins: 25,
    draws: 4,
    losses: 3,
    goals_for_against: "78-23",
    points: 79,
    form: "WWWDW"
  },
  {
    position: 2,
    team: "Arsenal",
    matches_played: 32,
    wins: 24,
    draws: 5,
    losses: 3,
    goals_for_against: "72-28",
    points: 77,
    form: "WDWWW"
  },
  {
    position: 3,
    team: "Liverpool",
    matches_played: 32,
    wins: 23,
    draws: 6,
    losses: 3,
    goals_for_against: "69-30",
    points: 75,
    form: "DWWWL"
  }
];

// Brand palette from BuildWidgetRequest
const PALETTE = ['#109e49', '#3860be', '#577286', '#424242'];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    // BRIDGE MODE: widget is inside a host (ChatGPT/Claude/preview)
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      // Preview mode (LLM Apps UI) — use sample data
      items = SAMPLE_DATA;
    } else {
      // Production — data comes from the MCP tool result.
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.standings — bare array outputSchema; key derived from actionName "get_league_standings"
      items = structuredContent?.standings || [];
    }
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  } else {
    // STANDALONE: widget is in EDS preview (localhost:3000 or aem.page)
    items = SAMPLE_DATA;
  }

  // Render — same code path for both modes
  renderStandings(block, items, bridge);
}

function renderStandings(block, items, bridge) {
  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'standings-wrapper';

  const table = document.createElement('table');
  table.className = 'standings-table';

  // Header row
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const headers = [
    { text: '#', key: 'position' },
    { text: 'Team', key: 'team' },
    { text: 'MJ', key: 'matches_played' },
    { text: 'V', key: 'wins' },
    { text: 'E', key: 'draws' },
    { text: 'Î', key: 'losses' },
    { text: 'G', key: 'goals_for_against' },
    { text: 'P', key: 'points' },
    { text: 'Last 5', key: 'form' }
  ];

  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header.text;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body rows
  const tbody = document.createElement('tbody');

  items.forEach((item, index) => {
    const row = document.createElement('tr');
    
    // Position column
    const posCell = document.createElement('td');
    posCell.className = 'position-cell';
    posCell.textContent = item.position || '';
    if (item.position <= 3) {
      posCell.classList.add('top-three');
    }
    row.appendChild(posCell);

    // Team name
    const teamCell = document.createElement('td');
    teamCell.className = 'team-cell';
    teamCell.textContent = item.team || '';
    row.appendChild(teamCell);

    // Stats columns
    const statsKeys = ['matches_played', 'wins', 'draws', 'losses'];
    statsKeys.forEach(key => {
      const cell = document.createElement('td');
      cell.className = 'stat-cell';
      cell.textContent = item[key] ?? '';
      row.appendChild(cell);
    });

    // Goals
    const goalsCell = document.createElement('td');
    goalsCell.className = 'stat-cell';
    goalsCell.textContent = item.goals_for_against || '';
    row.appendChild(goalsCell);

    // Points
    const pointsCell = document.createElement('td');
    pointsCell.className = 'points-cell';
    pointsCell.textContent = item.points ?? '';
    row.appendChild(pointsCell);

    // Form - render as colored dots
    const formCell = document.createElement('td');
    formCell.className = 'form-cell';
    
    if (item.form) {
      const formContainer = document.createElement('div');
      formContainer.className = 'form-dots';
      
      const formString = String(item.form).toUpperCase();
      for (let i = 0; i < formString.length && i < 5; i++) {
        const dot = document.createElement('span');
        dot.className = 'form-dot';
        const result = formString[i];
        if (result === 'W') {
          dot.classList.add('form-win');
        } else if (result === 'D') {
          dot.classList.add('form-draw');
        } else if (result === 'L') {
          dot.classList.add('form-loss');
        }
        formContainer.appendChild(dot);
      }
      
      formCell.appendChild(formContainer);
    }
    
    row.appendChild(formCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
  block.appendChild(wrapper);
}