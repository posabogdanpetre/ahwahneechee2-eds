// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
// synthetic fixture — no sample data available from Action Planner
const SAMPLE_DATA = [
  {
    competition: 'Premier League',
    home_team: 'Manchester United',
    away_team: 'Liverpool',
    score: '2 - 1',
    kickoff_time: '15:00',
    status: 'live'
  },
  {
    competition: 'Premier League',
    home_team: 'Chelsea',
    away_team: 'Arsenal',
    score: '1 - 1',
    kickoff_time: '17:30',
    status: 'finished'
  },
  {
    competition: 'World Cup',
    home_team: 'Brazil',
    away_team: 'Argentina',
    score: '-',
    kickoff_time: '20:00',
    status: 'scheduled'
  }
];

const PALETTE = ['#109e49'];

export default async function decorate(block, bridge) {
  let matches;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      matches = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.scores — bare array outputSchema; key derived from actionName "get_live_scores"
      matches = structuredContent?.scores || [];
    }
  } else {
    matches = SAMPLE_DATA;
  }

  block.textContent = '';
  renderMatches(block, matches, bridge);
  
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

function renderMatches(block, matches, bridge) {
  // Date selector
  const dateSelector = document.createElement('div');
  dateSelector.className = 'date-selector';
  
  const label = document.createElement('label');
  label.textContent = 'Date:';
  dateSelector.appendChild(label);
  
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = new Date().toISOString().split('T')[0];
  if (bridge) {
    dateInput.addEventListener('change', (e) => {
      bridge.sendMessage(`Show live scores for ${e.target.value}`);
    });
  }
  dateSelector.appendChild(dateInput);
  
  block.appendChild(dateSelector);

  if (!matches || matches.length === 0) {
    const noMatches = document.createElement('div');
    noMatches.className = 'no-matches';
    noMatches.textContent = 'No matches found for the selected date.';
    block.appendChild(noMatches);
    return;
  }

  // Group matches by competition
  const grouped = {};
  matches.forEach(match => {
    const comp = match.competition || 'Other';
    if (!grouped[comp]) grouped[comp] = [];
    grouped[comp].push(match);
  });

  // Render each competition group
  Object.keys(grouped).forEach(competition => {
    const group = document.createElement('div');
    group.className = 'competition-group';

    const heading = document.createElement('h2');
    heading.className = 'competition-heading';
    heading.textContent = competition;
    group.appendChild(heading);

    grouped[competition].forEach(match => {
      const card = document.createElement('div');
      card.className = `match-card ${match.status === 'live' ? 'live' : ''}`;

      // Match time and status
      const timeDiv = document.createElement('div');
      timeDiv.className = 'match-time';
      
      const time = document.createElement('span');
      time.textContent = match.kickoff_time || '';
      timeDiv.appendChild(time);

      const statusBadge = document.createElement('span');
      statusBadge.className = `status-badge ${match.status || 'scheduled'}`;
      statusBadge.textContent = match.status || 'scheduled';
      timeDiv.appendChild(statusBadge);
      
      card.appendChild(timeDiv);

      // Teams and score
      const teamsDiv = document.createElement('div');
      teamsDiv.className = 'match-teams';

      const homeTeam = document.createElement('div');
      homeTeam.className = 'team home';
      homeTeam.textContent = match.home_team || '';
      teamsDiv.appendChild(homeTeam);

      const scoreDiv = document.createElement('div');
      scoreDiv.className = 'score';
      scoreDiv.textContent = match.score || '-';
      teamsDiv.appendChild(scoreDiv);

      const awayTeam = document.createElement('div');
      awayTeam.className = 'team away';
      awayTeam.textContent = match.away_team || '';
      teamsDiv.appendChild(awayTeam);

      card.appendChild(teamsDiv);
      group.appendChild(card);
    });

    block.appendChild(group);
  });
}