// Date & Time Formatter
function formatMatchDate(dateString) {
    if (!dateString) return { day: '--', month: '---', time: '--:--' };
    const date = new Date(dateString);
    return {
        day: date.getDate().toString().padStart(2, '0'),
        month: date.toLocaleString('en-US', { month: 'short' }),
        time: date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
}

// Render team row matching HTML structure
function renderTeamLine(teamName, innings) {
    const isSaffron = teamName === 'Saffron Strikers';
    const scoreMarkup = innings?.score 
        ? `<span class="score">${innings.score} ${innings.over ? `<small>${innings.over}</small>` : ''}</span>` 
        : '';

    return `
        <div class="team-line">
            <span class="ft ${isSaffron ? 'hm' : ''}">${teamName}</span>
            ${scoreMarkup}
        </div>
    `;
}

// Fetch and render matches for a specific year
async function loadSeasonMatches(year, btnElement = null) {
    const leagueTexts = {
        2026: {
            en: 'CMKS T20 League 2026',
            cs: 'CMKS T20 liga 2026'
        }
    };
    const labelEn = document.getElementById('labelEn-fixtures');
    const labelCs = document.getElementById('labelCs-fixtures');

    labelEn.textContent = leagueTexts[year].en;
    labelCs.textContent = leagueTexts[year].cs;

    // 2. Handle tab button active state
    if (btnElement) {
        const parentTabs = btnElement.parentElement;
        if (parentTabs) {
            parentTabs.querySelectorAll('.tb').forEach(b => b.classList.remove('on'));
        }
        btnElement.classList.add('on');
    }

    const container = document.getElementById('fixtures-container');
    
    container.innerHTML = `
        <div style="color:#fff; text-align:center; padding:30px; font-family:'Rajdhani', sans-serif;">
            <p style="font-size: 16px;">Loading scorecard data for ${year}...</p>
        </div>`;

    try {
        const response = await fetch(`https://saffron-strikers-backend.vercel.app/api/matches${year}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const matches = await response.json();
        let matchData = Array.isArray(matches) ? matches : (matches.data || matches.matches || []);
        
        const saffronMatches = matchData.filter(item => {
            const targetId = 12680291;        
            return item.team_a_id === targetId || item.team_b_id === targetId;
        });      

        if (!Array.isArray(saffronMatches) || saffronMatches.length === 0) {
            container.innerHTML = `<div class="match-result-text" style="text-align:center; padding:30px;">No fixtures available for ${year}.</div>`;
            return;
        }

        container.innerHTML = saffronMatches.map((match, index) => {
            const { day, month, time } = formatMatchDate(match.match_start_time);
            
            const teamA = match.team_a || 'TBD';
            const teamB = match.team_b || 'TBD';
            const summaryText = match.match_summary?.summary || '';

            const teamAInnings = match.team_a_innings?.[0]?.summary || {};
            const teamBInnings = match.team_b_innings?.[0]?.summary || {};

            const isHome = match.team_a === "Saffron Strikers";
            const roundName = (match.tournament_round_name || '').toLowerCase();
            const isPlayoffStage = roundName.includes('final') || roundName.includes('semi');
            const playoffBadge = isPlayoffStage 
                ? `<span class="fb playoff">${match.tournament_round_name}</span>` 
                : '';

            return `
                <div class="fc anim d${(index % 5) + 1}" onclick="openScorecardModal('${match.match_id}')" style="cursor: pointer;">
                    <div class="fd">
                        <div class="dy">${day}</div>
                        <div class="mo">${month}</div>
                    </div>
                    
                    <div class="fm">
                        ${renderTeamLine(teamA, teamAInnings)}            
                        <span class="fv">VS</span>            
                        ${renderTeamLine(teamB, teamBInnings)}
                        ${summaryText ? `<div class="match-result-text">${summaryText}</div>` : ''}
                    </div>

                    <div class="fmeta">
                        <div class="time">${time}</div>
                        <div>${match.ground_name || 'TBA'}</div>
                        ${playoffBadge}<span class="fb ${isHome ? 'home' : 'away'}">${isHome ? 'Home' : 'Away'}</span>
                    </div>
                </div>
            `.trim();
        }).join('');

        if (typeof obs !== 'undefined' && obs.observe) {
            document.querySelectorAll('#fixtures-container .anim').forEach(el => obs.observe(el));
        }

    } catch (error) {
        console.error(`Error loading ${year} fixtures:`, error);
        container.innerHTML = `<div class="match-result-text" style="text-align:center; padding:30px;">No fixtures available for ${year}.</div>`;
    }
}

// Initial load for 2026 matches on page ready
document.addEventListener('DOMContentLoaded', () => loadSeasonMatches(2026));