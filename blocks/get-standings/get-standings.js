// synthetic fixture — no sample data available from Action Planner
const SAMPLE_DATA = [
  { position: 1, team: 'Manchester City', played: 38, won: 28, drawn: 5, lost: 5, goals_for: 94, goals_against: 33, goal_difference: 61, points: 89 },
  { position: 2, team: 'Arsenal', played: 38, won: 26, drawn: 6, lost: 6, goals_for: 88, goals_against: 43, goal_difference: 45, points: 84 },
  { position: 3, team: 'Liverpool', played: 38, won: 24, drawn: 10, lost: 4, goals_for: 86, goals_against: 41, goal_difference: 45, points: 82 }
];

const PALETTE = ['#109e49'];

export default async function decorate(block, bridge) {
  let standings;
  let competition = 'League Standings';

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      standings = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.standings — bare array outputSchema; key derived from actionName "get_standings"
      standings = structuredContent?.standings || [];
      // Extract competition from tool input if available
      if (_result?.toolInput?.competition) {
        competition = _result.toolInput.competition;
      }
    }
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  } else {
    standings = SAMPLE_DATA;
  }

  block.textContent = '';
  renderStandings(block, standings, competition);
}

function renderStandings(block, standings, competition) {
  const container = document.createElement('div');
  container.className = 'standings-container';

  // Header
  const header = document.createElement('div');
  header.className = 'standings-header';
  const title = document.createElement('h2');
  title.textContent = competition;
  header.appendChild(title);
  container.appendChild(header);

  // Table wrapper for horizontal scroll
  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'table-wrapper';

  const table = document.createElement('table');
  table.className = 'standings-table';

  // Table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const columns = ['Pos', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'];
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement('tbody');
  standings.forEach((row, index) => {
    const tr = document.createElement('tr');

    // Add position indicator class
    if (row.position <= 3) {
      tr.className = 'top-position';
    } else if (row.position >= standings.length - 2) {
      tr.className = 'relegation-zone';
    }

    const cells = [
      row.position,
      row.team,
      row.played,
      row.won,
      row.drawn,
      row.lost,
      row.goals_for,
      row.goals_against,
      row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference,
      row.points
    ];

    cells.forEach((value, i) => {
      const td = document.createElement('td');
      td.textContent = value;
      if (i === 0) {
        td.className = 'position-cell';
      } else if (i === 1) {
        td.className = 'team-cell';
      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);
  block.appendChild(container);
}
