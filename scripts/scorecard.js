async function openScorecardModal(matchId) {

    const modal = document.getElementById('scorecard-modal');
    const content = document.getElementById('scorecard-content');
    
    if (!modal || !content) {
        console.error("Missing modal elements (#scorecard-modal or #scorecard-content) in DOM.");
        return;
    }

    // Always open modal
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.setProperty('visibility', 'visible', 'important');
    modal.style.setProperty('opacity', '1', 'important');

    content.innerHTML = `
        <div style="color:#fff; text-align:center; padding:30px; font-family:'Rajdhani', sans-serif;">
            <p style="font-size: 16px;">Loading scorecard data...</p>
        </div>`;

    let match = null;

    try {
        const targetId = matchId || '26777319';
        const response = await fetch(`https://saffron-strikers-backend.vercel.app/api/scorecard?matchId=${targetId}`);

        if (response.ok) {
            const data = await response.json();
            match = Array.isArray(data) ? data[0] : (data.data || data.match || data);
        }
    } catch (error) {
        console.warn("API fetch failed, attempting local fallback:", error);
    }

    if (!match) {
        const matches = window.allMatchesData || window.matches || [];
        match = matches.find(m => String(m.match_id) === String(matchId));
    }

    const summaryA = match?.team_a?.summary || '';
    const summaryB = match?.team_b?.summary || '';
    const matchSummary = match?.summary || match?.result || match?.status || match?.match_status || '';
    const combinedSummaryText = `${summaryA} ${summaryB} ${matchSummary}`.toLowerCase();

    const isWalkover = combinedSummaryText.includes('walkover');

    const battingA = match?.team_a?.scorecard?.[0]?.batting || [];
    const battingB = match?.team_b?.scorecard?.[0]?.batting || [];
    const hasNoData = !match || (battingA.length === 0 && battingB.length === 0);

    // If walkover or no scorecard details exist, show fallback message inside modal
    if (hasNoData || isWalkover) {
        content.innerHTML = `
            <div style="color:#fff; text-align:center; padding:40px 20px; font-family:'Rajdhani', sans-serif;">
                <p style="font-size: 18px; font-weight: 600; margin: 0;">No match data found</p>
            </div>`;
        return;
    }

    const teamAName = match.team_a.name;
    const teamBName = match.team_b.name;

    const scorecardA = match.team_a?.scorecard?.[0] || {};
    const scorecardB = match.team_b?.scorecard?.[0] || {};

    const inningsA = match.team_a?.innings?.[0] || '';
    const inningsB = match.team_b?.innings?.[0] || '';

    const scoresList = [
        { teamName: teamAName, summary: summaryA, scorecard: scorecardA, innings: inningsA },
        { teamName: teamBName, summary: summaryB, scorecard: scorecardB, innings: inningsB }
    ];

    content.innerHTML = scoresList.map((score, idx) => {
        const batting = score.scorecard.batting || [];
        const bowling = score.scorecard.bowling || [];
        const extras = score.scorecard.extras || {};

        const overPlayed = score.innings.overs_played || {};
        const summaryText = score.summary;

        const extrasTotal = extras.total ?? 0;
        const extrasSummary = extras.summary ?? 0;

        return `
            <div class="sc-accordion ${idx === 0 ? 'active' : ''}">
                <button class="sc-header" onclick="this.closest('.sc-accordion').classList.toggle('active')">
                    <span class="sc-team-name">${score.teamName}</span>
                    <span class="sc-score-summary">
                        <strong>${summaryText || ''}</strong>
                        <span class="sc-arrow">▼</span>
                    </span>
                </button>
                <div class="sc-body">
                    <h4 class="sc-section-title">Batting</h4>
                    <div class="sc-table-wrapper">
                        <table class="sc-table sc-table-batting">
                            <thead>
                                <tr>
                                    <th>Batter</th>
                                    <th>R</th>
                                    <th>B</th>
                                    <th>4s</th>
                                    <th>6s</th>
                                    <th>SR</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${batting.length ? batting.map(b => `
                                    <tr>
                                        <td>
                                            <div class="sc-player">${b.name || 'Unknown'}</div>
                                            <div class="sc-out-desc">${b.how_to_out || 'not out'}</div>
                                        </td>
                                        <td><strong>${b.runs ?? 0}</strong></td>
                                        <td>${b.balls ?? 0}</td>
                                        <td>${b['4s'] ?? 0}</td>
                                        <td>${b['6s'] ?? 0}</td>
                                        <td>${b.SR || '0.00'}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="6" style="text-align:center;">No batting records available</td></tr>'}
                            </tbody>
                        </table>
                    </div>

                    <div class="sc-summary-row">
                        <span>Extras</span>
                        <strong>${extrasTotal} <small>${extrasSummary || 'none'}</small></strong>
                    </div>
                    <div class="sc-summary-row sc-total-row">
                        <span>Total</span>
                        <strong>${summaryText || '0/0'} <small>(${overPlayed || ''} Ov)</small></strong>
                    </div>

                    ${bowling.length ? `
                    <h4 class="sc-section-title">Bowling</h4>
                    <div class="sc-table-wrapper">
                        <table class="sc-table sc-table-bowling">
                            <thead>
                                <tr>
                                    <th>Bowler</th>
                                    <th>O</th>
                                    <th>M</th>
                                    <th>R</th>
                                    <th>W</th>
                                    <th>WD</th>
                                    <th>NB</th>
                                    <th>Econ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bowling.map(bw => `
                                    <tr>
                                        <td><div class="sc-player">${bw.name || 'Unknown'}</div></td>
                                        <td>${bw.overs ?? 0}</td>
                                        <td>${bw.maidens ?? 0}</td>
                                        <td>${bw.runs ?? 0}</td>
                                        <td><strong>${bw.wickets ?? 0}</strong></td>
                                        <td>${bw.wide ?? 0}</td>
                                        <td>${bw.noball ?? 0}</td>
                                        <td>${bw.economy_rate ?? '0.00'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function closeScorecardModal() {
    const modal = document.getElementById('scorecard-modal');
    if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        modal.style.setProperty('opacity', '0', 'important');
        modal.style.setProperty('visibility', 'hidden', 'important');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('scorecard-modal');
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeScorecardModal();
            }
        });
    }
});