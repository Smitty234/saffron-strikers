async function openPlayerStats(playerId) {
    const modal = document.getElementById('player-modal');
    const content = document.getElementById('player-modal-content');
    const nameEl = document.getElementById('player-modal-name');
    const roleEl = document.getElementById('player-modal-role');

    if (!modal || !content) return;

    // Reset header text and open modal
    nameEl.textContent = 'Loading...';
    roleEl.textContent = '';
    modal.style.setProperty('display', 'flex', 'important');
    content.innerHTML = '<div style="text-align:center; padding: 20px; color: #fff;">Fetching profile & statistics...</div>';

    try {
        // Fetch both profile info and statistics simultaneously
        const [profileRes, statsRes] = await Promise.all([
            fetch(`https://saffron-strikers-backend.vercel.app/api/playerinfo?player_id=${playerId}`),
            fetch(`https://saffron-strikers-backend.vercel.app/api/statistics?player_id=${playerId}`)
        ]);

        const profileData = await profileRes.json();
        const statsData = await statsRes.json();  

        let profileHTML = '';

        // Extract profile metadata
        if (profileData && profileData.status && profileData.data) {
            const p = profileData.data;

            // Set modal header
            nameEl.textContent = p.name || 'Player Profile';

            // Extract requested profile properties
            const battingHand = p.batting_hand || '-';
            const bowlingStyle = p.bowling_style || '-';
            const batterCategory = p.batter_category || '-';

            profileHTML = `
                <div class="profile-info-card" style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-around; text-align: center; color: #fff; font-size: 0.9rem;">
                    <div>
                        <span style="display: block; font-size: 0.75rem; color: #aaa;">Batting Hand</span>
                        <strong>${battingHand}</strong>
                    </div>
                    <div>
                        <span style="display: block; font-size: 0.75rem; color: #aaa;">Bowling Style</span>
                        <strong>${bowlingStyle}</strong>
                    </div>
                    <div>
                        <span style="display: block; font-size: 0.75rem; color: #aaa;">Category</span>
                        <strong>${batterCategory}</strong>
                    </div>
                </div>
            `;
        } else {
            nameEl.textContent = 'Player Profile';
        }

        if (!statsData.status || !statsData.data || !statsData.data.statistics) {
            content.innerHTML = profileHTML + '<div style="text-align:center; padding: 20px; color: #fff;">No statistics found for this player.</div>';
            return;
        }

        const stats = statsData.data.statistics;
        const batting = stats.batting || [];
        const bowling = stats.bowling || [];
        const captain = stats.captain || [];
        const fielding = stats.fielding || [];

        // Safe helper function to extract array stats by title
        const getStat = (arr, key) => {
            const item = arr.find(s => s.title && s.title.toLowerCase() === key.toLowerCase());
            return item ? item.value : '-';
        };

        // Build main body content including Profile Details Card
        content.innerHTML = `
            ${profileHTML}

            <!-- Batting Stats -->
            <div class="sc-section-title">Batting Performance</div>
            <div class="sc-table-wrapper">
                <table class="sc-table">
                    <thead>
                        <tr>
                            <th>Mat</th>
                            <th>Inns</th>
                            <th>Runs</th>
                            <th>Highest Runs</th>
                            <th>Avg</th>
                            <th>SR</th>
                            <th>30s</th>
                            <th>50s</th>
                            <th>100s</th>
                            <th>4s</th>
                            <th>6s</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${getStat(batting, 'Matches')}</td>
                            <td>${getStat(batting, 'Innings')}</td>
                            <td><strong>${getStat(batting, 'Runs')}</strong></td>
                            <td>${getStat(batting, 'Highest Runs')}</td>
                            <td>${getStat(batting, 'Avg')}</td>
                            <td>${getStat(batting, 'SR')}</td>
                            <td>${getStat(batting, '30s')}</td>
                            <td>${getStat(batting, '50s')}</td>
                            <td>${getStat(batting, '100s')}</td>
                            <td>${getStat(batting, '4s')}</td>
                            <td>${getStat(batting, '6s')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Bowling Stats -->
            <div class="sc-section-title">Bowling Performance</div>
            <div class="sc-table-wrapper">
                <table class="sc-table">
                    <thead>
                        <tr>
                            <th>Overs</th>
                            <th>Wkts</th>
                            <th>Runs</th>
                            <th>Best Bowling</th>
                            <th>Econ</th>
                            <th>Avg</th>
                            <th>3w</th>
                            <th>5w</th>
                            <th>Wides</th>
                            <th>Dot Balls</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${getStat(bowling, 'Overs')}</td>
                            <td><strong>${getStat(bowling, 'Wickets')}</strong></td>
                            <td>${getStat(bowling, 'Runs')}</td>
                            <td>${getStat(bowling, 'Best Bowling')}</td>
                            <td>${getStat(bowling, 'Economy')}</td>
                            <td>${getStat(bowling, 'Avg')}</td>
                            <td>${getStat(bowling, '3 Wickets')}</td>
                            <td>${getStat(bowling, '5 Wickets')}</td>
                            <td>${getStat(bowling, 'Wides')}</td>
                            <td>${getStat(bowling, 'Dot Balls')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Captaincy Stats -->
            ${captain.length > 0 ? `
            <div class="sc-section-title">Captaincy Record</div>
            <div class="sc-table-wrapper">
                <table class="sc-table">
                    <thead>
                        <tr>
                            <th>Matches</th>
                            <th>Toss Won</th>
                            <th>Win %</th>
                            <th>Loss %</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${getStat(captain, 'Matches')}</td>
                            <td>${getStat(captain, 'Toss Won')}</td>
                            <td>${getStat(captain, 'Win Per')}</td>
                            <td>${getStat(captain, 'Loss Per')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            ` : ''}

            <!-- Fielding Stats -->
            <div class="sc-section-title">Fielding Performance</div>
            <div class="sc-table-wrapper">
                <table class="sc-table">
                    <thead>
                        <tr>
                            <th>Catches</th>
                            <th>Run Outs</th>
                            <th>Stumpings</th>
                            <th>Caught behind</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${getStat(fielding, 'Catches')}</td>
                            <td>${getStat(fielding, 'Run outs')}</td>
                            <td>${getStat(fielding, 'Stumpings')}</td>
                            <td>${getStat(fielding, 'Caught behind')}</td>      
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching player details:', error);
        nameEl.textContent = 'Error';
        content.innerHTML = '<div style="text-align:center; padding: 20px; color: #ff4d4d;">Failed to fetch statistics. Please try again.</div>';
    }
}

// Attach directly to window scope
window.closePlayerModal = function() {
    const modal = document.getElementById('player-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.addEventListener('click', function(event) {
    const modal = document.getElementById('player-modal');
    // If user clicks directly on the semi-transparent modal overlay (outside content box)
    if (event.target === modal) {
        window.closePlayerModal();
    }
});