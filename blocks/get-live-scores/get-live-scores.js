// synthetic fixture — no sample data available from Action Planner
const SAMPLE_DATA = [
  {
    competition: "Premier League",
    home_team: "Manchester United",
    away_team: "Liverpool",
    score: "2 - 1",
    match_time: "45'",
    status: "live"
  },
  {
    competition: "Premier League",
    home_team: "Arsenal",
    away_team: "Chelsea",
    score: "1 - 1",
    match_time: "72'",
    status: "live"
  },
  {
    competition: "La Liga",
    home_team: "Real Madrid",
    away_team: "Barcelona",
    score: "3 - 2",
    match_time: "FT",
    status: "finished"
  }
];

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
  const grouped = {};
  matches.forEach(match => {
    const comp = match.competition || 'Other';
    if (!grouped[comp]) grouped[comp] = [];
    grouped[comp].push(match);
  });

  Object.keys(grouped).forEach(competition => {
    const group = document.createElement('div');
    group.className = 'competition-group';

    const heading = document.createElement('h3');
    heading.className = 'competition-heading';
    heading.textContent = competition;
    group.appendChild(heading);

    grouped[competition].forEach(match => {
      const card = document.createElement('div');
      card.className = 'match-card';

      const homeTeam = document.createElement('div');
      homeTeam.className = 'team-home';
      homeTeam.textContent = match.home_team || '';
      card.appendChild(homeTeam);

      const center = document.createElement('div');
      center.className = 'match-center';

      const scoreRow = document.createElement('div');
      scoreRow.className = 'score-row';

      const dot = document.createElement('div');
      dot.className = `status-dot ${match.status || 'scheduled'}`;
      scoreRow.appendChild(dot);

      const score = document.createElement('div');
      score.className = `score ${match.status || 'scheduled'}`;
      score.textContent = match.score || '-';
      scoreRow.appendChild(score);

      center.appendChild(scoreRow);

      const time = document.createElement('div');
      time.className = 'match-time';
      time.textContent = match.match_time || '';
      center.appendChild(time);

      card.appendChild(center);

      const awayTeam = document.createElement('div');
      awayTeam.className = 'team-away';
      awayTeam.textContent = match.away_team || '';
      card.appendChild(awayTeam);

      const detailsBtn = document.createElement('button');
      detailsBtn.className = 'view-details';
      detailsBtn.textContent = '→';
      detailsBtn.setAttribute('aria-label', 'View match details');
      if (bridge) {
        detailsBtn.addEventListener('click', () => {
          bridge.sendMessage(`Tell me more about ${match.home_team} vs ${match.away_team}`);
        });
      }
      card.appendChild(detailsBtn);

      group.appendChild(card);
    });

    block.appendChild(group);
  });
}