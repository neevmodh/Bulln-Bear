// leaderboard.js
// Enhanced Leaderboard with Advanced Ranking Algorithms
class LeaderboardManager {
    constructor() {
        this.players = [];
        this.filteredPlayers = [];
        this.currentPage = 1;
        this.itemsPerPage = 15;
        this.currentSort = 'TOTAL_VALUE';
        this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
        this.distributionChart = null;
        this.init();
    }
    
    init() {
        this.generateRealisticPlayers();
        this.updateLeaderboard();
        this.updateUserRanking();
        this.updateStatistics();
        this.initDistributionChart();
        
        // Simulate real-time updates
        setInterval(() => {
            this.simulateMarketMovements();
            this.updateLeaderboard();
            this.updateLastUpdateTime();
        }, 10000);

        // Modal handlers
        document.querySelector('#playerModal .close-modal').addEventListener('click', () => {
            this.hidePlayerModal();
        });
    }
    
    generateRealisticPlayers() {
        // Clear existing players except user
        this.players = [];
        
        // Add user with current portfolio value
        const userPortfolioValue = portfolio.cash + this.calculateStockValue();
        this.players.push({
            id: this.userId,
            name: 'You',
            portfolioValue: userPortfolioValue,
            dailyChange: (Math.random() - 0.5) * 8,
            totalGain: userPortfolioValue - 10000,
            trades: transactionHistory.transactions.length,
            riskLevel: this.calculateRiskLevel(),
            joinDate: new Date(),
            avatar: '👤',
            weeklyPerformance: (Math.random() - 0.3) * 15,
            winRate: 65 + Math.random() * 30,
            favoriteStocks: this.getUserFavoriteStocks()
        });
        
        // Generate realistic AI players
        const aiNames = [
            'Warren Buffett', 'Cathie Wood', 'Ray Dalio', 'Michael Burry', 
            'Paul Tudor Jones', 'Stanley Druckenmiller', 'David Tepper',
            'Bill Ackman', 'Carl Icahn', 'George Soros', 'John Bogle',
            'Peter Lynch', 'Benjamin Graham', 'Philip Fisher', 'John Templeton',
            'Jesse Livermore', 'John Neff', 'Thomas Rowe Price', 'Julian Robertson',
            'Ken Griffin', 'Steven Cohen', 'David Einhorn', 'Chamath Palihapitiya',
            'Chase Coleman', 'Jim Simons'
        ];
        
        const avatars = ['👑', '💎', '🚀', '📊', '💰', '🎯', '⚡', '🌟', '🔥', '💼', '🦄', '🐋'];
        const strategies = ['Value Investing', 'Growth Investing', 'Day Trading', 'Swing Trading', 'Arbitrage', 'Quantitative'];
        
        aiNames.forEach((name, index) => {
            const baseValue = 50000 + Math.random() * 2000000;
            const dailyChange = (Math.random() - 0.5) * 10;
            const totalGain = baseValue * (Math.random() * 2 - 0.2); // -20% to 180% gain
            
            this.players.push({
                id: `ai_${index}`,
                name: name,
                portfolioValue: baseValue,
                dailyChange: dailyChange,
                totalGain: totalGain,
                trades: 50 + Math.floor(Math.random() * 500),
                riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
                joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                avatar: avatars[Math.floor(Math.random() * avatars.length)],
                strategy: strategies[Math.floor(Math.random() * strategies.length)],
                weeklyPerformance: (Math.random() - 0.4) * 20,
                winRate: 40 + Math.random() * 55,
                favoriteStocks: this.generateFavoriteStocks()
            });
        });
        
        this.filteredPlayers = [...this.players];
    }
    
    calculateStockValue() {
        let total = 0;
        for (const [symbol, holding] of portfolio.stocks) {
            total += parseFloat(getStockPrice(symbol)) * holding.qty;
        }
        return total;
    }
    
    calculateRiskLevel() {
        const stockValue = this.calculateStockValue();
        const totalValue = portfolio.cash + stockValue;
        const stockPercentage = (stockValue / totalValue) * 100;
        
        if (stockPercentage < 30) return 'Low';
        if (stockPercentage < 70) return 'Medium';
        return 'High';
    }
    
    getUserFavoriteStocks() {
        const stocks = Array.from(portfolio.stocks.entries());
        if (stocks.length === 0) return ['CASH'];
        
        return stocks
            .sort((a, b) => b[1].qty - a[1].qty)
            .slice(0, 3)
            .map(([symbol]) => symbol);
    }
    
    generateFavoriteStocks() {
        const allStocks = Object.keys(STOCK_DATA);
        const count = 2 + Math.floor(Math.random() * 3);
        const favorites = [];
        
        for (let i = 0; i < count; i++) {
            const randomStock = allStocks[Math.floor(Math.random() * allStocks.length)];
            if (!favorites.includes(randomStock)) {
                favorites.push(randomStock);
            }
        }
        
        return favorites.length > 0 ? favorites : ['CASH'];
    }
    
    updateLeaderboard() {
        const sortType = document.getElementById('leaderboardType').value;
        const riskFilter = document.getElementById('riskFilter').value;
        this.currentSort = sortType;
        
        // Apply risk filter
        this.filteredPlayers = this.players.filter(player => 
            riskFilter === 'ALL' || player.riskLevel.toUpperCase() === riskFilter
        );
        
        // HEAP SORT for efficient ranking - O(n log n) complexity
        this.heapSort(this.filteredPlayers, sortType);
        this.renderLeaderboard();
        this.updateUserRanking();
        this.updateStatistics();
        this.updateDistributionChart();
    }
    
    // HEAP SORT implementation for efficient ranking
    heapSort(arr, sortType) {
        const n = arr.length;
        
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            this.heapify(arr, n, i, sortType);
        }
        
        // Extract elements from heap
        for (let i = n - 1; i > 0; i--) {
            [arr[0], arr[i]] = [arr[i], arr[0]];
            this.heapify(arr, i, 0, sortType);
        }
    }
    
    heapify(arr, n, i, sortType) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < n && this.comparePlayers(arr[left], arr[largest], sortType) > 0) {
            largest = left;
        }
        
        if (right < n && this.comparePlayers(arr[right], arr[largest], sortType) > 0) {
            largest = right;
        }
        
        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            this.heapify(arr, n, largest, sortType);
        }
    }
    
    comparePlayers(a, b, sortType) {
        switch (sortType) {
            case 'TOTAL_VALUE':
                return b.portfolioValue - a.portfolioValue;
            case 'DAILY_GAIN':
                return b.dailyChange - a.dailyChange;
            case 'TOTAL_GAIN':
                return b.totalGain - a.totalGain;
            case 'TRADING_VOLUME':
                return b.trades - a.trades;
            case 'RISK_ADJUSTED':
                const sharpeA = a.dailyChange / (this.getRiskScore(a.riskLevel) || 1);
                const sharpeB = b.dailyChange / (this.getRiskScore(b.riskLevel) || 1);
                return sharpeB - sharpeA;
            default:
                return b.portfolioValue - a.portfolioValue;
        }
    }
    
    getRiskScore(riskLevel) {
        switch (riskLevel) {
            case 'Low': return 1;
            case 'Medium': return 2;
            case 'High': return 3;
            default: return 1;
        }
    }
    
    renderLeaderboard() {
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = '';
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pagePlayers = this.filteredPlayers.slice(startIndex, endIndex);
        
        if (pagePlayers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 3rem;">
                        <div class="empty-state">
                            <div class="empty-icon">🔍</div>
                            <h3>No players found</h3>
                            <p>Try adjusting your filters</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        pagePlayers.forEach((player, index) => {
            const globalIndex = startIndex + index;
            const isUser = player.id === this.userId;
            
            const row = document.createElement('tr');
            row.className = isUser ? 'user-row' : '';
            row.innerHTML = `
                <td>
                    <div class="rank-cell">
                        <span class="rank-number ${globalIndex < 3 ? 'top-rank' : ''}">
                            ${globalIndex + 1}
                        </span>
                        ${globalIndex < 3 ? this.getRankBadge(globalIndex + 1) : ''}
                    </div>
                </td>
                <td>
                    <div class="player-cell">
                        <div class="player-avatar">${player.avatar}</div>
                        <div class="player-info">
                            <div class="player-name">
                                ${player.name}
                                ${isUser ? '<span class="you-badge">YOU</span>' : ''}
                            </div>
                            <div class="player-meta">
                                Joined ${this.formatJoinDate(player.joinDate)}
                                ${player.strategy ? ` • ${player.strategy}` : ''}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="portfolio-value">
                    $${player.portfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </td>
                <td class="${player.dailyChange >= 0 ? 'positive' : 'negative'}">
                    <div class="change-cell">
                        ${player.dailyChange >= 0 ? '↗' : '↘'}
                        ${player.dailyChange >= 0 ? '+' : ''}${player.dailyChange.toFixed(2)}%
                    </div>
                </td>
                <td class="${player.totalGain >= 0 ? 'positive' : 'negative'}">
                    ${player.totalGain >= 0 ? '+' : ''}$${player.totalGain.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </td>
                <td>
                    <div class="trades-cell">
                        ${player.trades}
                        <div class="trades-bar" style="width: ${Math.min(100, player.trades / 10)}%"></div>
                    </div>
                </td>
                <td>
                    <span class="risk-badge risk-${player.riskLevel.toLowerCase()}">
                        ${player.riskLevel}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="leaderboardManager.viewPlayerProfile('${player.id}')">
                            👁️ View
                        </button>
                        ${!isUser ? `
                        <button class="btn btn-sm btn-secondary" onclick="leaderboardManager.followPlayer('${player.id}')">
                            ➕ Follow
                        </button>
                        ` : ''}
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        this.renderPagination();
    }
    
    formatJoinDate(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) return `${diffDays} days ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }
    
    getRankBadge(rank) {
        switch (rank) {
            case 1: return '<span class="rank-badge gold">🥇</span>';
            case 2: return '<span class="rank-badge silver">🥈</span>';
            case 3: return '<span class="rank-badge bronze">🥉</span>';
            default: return '';
        }
    }
    
    renderPagination() {
        const totalPages = Math.ceil(this.filteredPlayers.length / this.itemsPerPage);
        const controls = document.getElementById('leaderboardPagination');
        
        if (totalPages <= 1) {
            controls.innerHTML = '';
            return;
        }
        
        let html = `
            <button class="btn btn-sm ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="leaderboardManager.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''}>
                ← Previous
            </button>
            <div class="page-numbers">
        `;
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            html += `<button class="btn btn-sm" onclick="leaderboardManager.goToPage(1)">1</button>`;
            if (startPage > 2) html += `<span class="page-ellipsis">...</span>`;
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="btn btn-sm ${i === this.currentPage ? 'active' : ''}" 
                        onclick="leaderboardManager.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<span class="page-ellipsis">...</span>`;
            html += `<button class="btn btn-sm" onclick="leaderboardManager.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        html += `
            </div>
            <button class="btn btn-sm ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="leaderboardManager.nextPage()" ${this.currentPage === totalPages ? 'disabled' : ''}>
                Next →
            </button>
        `;
        
        controls.innerHTML = html;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.renderLeaderboard();
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderLeaderboard();
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.filteredPlayers.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderLeaderboard();
        }
    }
    
    updateUserRanking() {
        const userIndex = this.filteredPlayers.findIndex(p => p.id === this.userId);
        const user = this.filteredPlayers[userIndex];
        
        if (user) {
            document.getElementById('userRank').textContent = `#${userIndex + 1}`;
            document.getElementById('userRankBadge').textContent = `#${userIndex + 1}`;
            document.getElementById('userValue').textContent = 
                `$${user.portfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            
            const dailyChangeElement = document.getElementById('dailyChange');
            dailyChangeElement.textContent = 
                `${user.dailyChange >= 0 ? '+' : ''}${user.dailyChange.toFixed(2)}%`;
            dailyChangeElement.className = `ranking-value ${user.dailyChange >= 0 ? 'positive' : 'negative'}`;
            
            const performanceElement = document.getElementById('performance');
            performanceElement.textContent = user.totalGain >= 0 ? 'Profitable' : 'Unprofitable';
            performanceElement.className = `ranking-value ${user.totalGain >= 0 ? 'positive' : 'negative'}`;
            
            // Update user row styling
            document.querySelectorAll('.user-row').forEach(row => {
                row.style.background = 'linear-gradient(135deg, #e0f2fe, #bae6fd)';
            });
        }
    }
    
    updateStatistics() {
        const totalPlayers = this.filteredPlayers.length;
        const averagePortfolio = this.filteredPlayers.reduce((sum, p) => sum + p.portfolioValue, 0) / totalPlayers;
        
        // Calculate top 10% value
        const sortedByValue = [...this.filteredPlayers].sort((a, b) => b.portfolioValue - a.portfolioValue);
        const top10Count = Math.ceil(totalPlayers * 0.1);
        const top10Value = top10Count > 0 ? 
            sortedByValue.slice(0, top10Count).reduce((sum, p) => sum + p.portfolioValue, 0) / top10Count : 0;
        
        // Calculate user percentile
        const userIndex = sortedByValue.findIndex(p => p.id === this.userId);
        const userPercentile = userIndex >= 0 ? ((totalPlayers - userIndex) / totalPlayers * 100).toFixed(1) : '0';
        
        document.getElementById('totalPlayers').textContent = totalPlayers.toLocaleString();
        document.getElementById('averagePortfolio').textContent = 
            `$${averagePortfolio.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
        document.getElementById('top10Value').textContent = 
            `$${top10Value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
        document.getElementById('userPercentile').textContent = `${userPercentile}%`;
    }
    
    initDistributionChart() {
        const ctx = document.getElementById('distributionChart').getContext('2d');
        this.distributionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['< $10K', '$10K-$50K', '$50K-$100K', '$100K-$500K', '$500K-$1M', '> $1M'],
                datasets: [{
                    label: 'Number of Players',
                    data: [12, 45, 23, 15, 8, 3],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(129, 140, 248, 0.8)',
                        'rgba(165, 180, 252, 0.8)',
                        'rgba(199, 210, 254, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    updateDistributionChart() {
        if (!this.distributionChart) return;
        
        const ranges = [
            { min: 0, max: 10000 },
            { min: 10000, max: 50000 },
            { min: 50000, max: 100000 },
            { min: 100000, max: 500000 },
            { min: 500000, max: 1000000 },
            { min: 1000000, max: Infinity }
        ];
        
        const data = ranges.map(range => {
            return this.filteredPlayers.filter(p => 
                p.portfolioValue >= range.min && p.portfolioValue < range.max
            ).length;
        });
        
        this.distributionChart.data.datasets[0].data = data;
        this.distributionChart.update();
    }
    
    searchPlayers() {
        const searchTerm = document.getElementById('searchPlayer').value.toLowerCase();
        
        if (!searchTerm) {
            this.filteredPlayers = [...this.players];
        } else {
            // LINEAR SEARCH through players - O(n) complexity
            this.filteredPlayers = this.players.filter(player =>
                player.name.toLowerCase().includes(searchTerm) ||
                player.strategy?.toLowerCase().includes(searchTerm)
            );
        }
        
        this.currentPage = 1;
        this.updateLeaderboard();
    }
    
    viewPlayerProfile(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            const details = document.getElementById('playerDetails');
            const isUser = player.id === this.userId;
            
            details.innerHTML = `
                <div class="player-profile">
                    <div class="profile-header">
                        <div class="profile-avatar">${player.avatar}</div>
                        <div class="profile-info">
                            <h2>${player.name}</h2>
                            <p class="profile-meta">
                                ${isUser ? 'Your Profile' : 'Professional Trader'} • 
                                Joined ${player.joinDate.toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    
                    <div class="profile-stats">
                        <div class="profile-stat">
                            <span class="stat-label">Portfolio Value</span>
                            <span class="stat-value">$${player.portfolioValue.toLocaleString()}</span>
                        </div>
                        <div class="profile-stat">
                            <span class="stat-label">Total Gain</span>
                            <span class="stat-value ${player.totalGain >= 0 ? 'positive' : 'negative'}">
                                ${player.totalGain >= 0 ? '+' : ''}$${player.totalGain.toLocaleString()}
                            </span>
                        </div>
                        <div class="profile-stat">
                            <span class="stat-label">Win Rate</span>
                            <span class="stat-value">${player.winRate?.toFixed(1) || '60.0'}%</span>
                        </div>
                        <div class="profile-stat">
                            <span class="stat-label">Risk Level</span>
                            <span class="stat-value">
                                <span class="risk-badge risk-${player.riskLevel.toLowerCase()}">
                                    ${player.riskLevel}
                                </span>
                            </span>
                        </div>
                    </div>
                    
                    ${player.strategy ? `
                    <div class="profile-section">
                        <h3>Trading Strategy</h3>
                        <p>${player.strategy}</p>
                    </div>
                    ` : ''}
                    
                    <div class="profile-section">
                        <h3>Favorite Stocks</h3>
                        <div class="favorite-stocks">
                            ${player.favoriteStocks.map(stock => `
                                <span class="stock-tag">${stock}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${!isUser ? `
                    <div class="profile-actions">
                        <button class="btn btn-primary" onclick="leaderboardManager.followPlayer('${player.id}')">
                            ➕ Follow This Trader
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
            
            this.showPlayerModal();
        }
    }
    
    followPlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            this.showNotification(`Now following ${player.name}`, 'success');
            this.hidePlayerModal();
        }
    }
    
    showPlayerModal() {
        document.getElementById('playerModal').style.display = 'flex';
    }
    
    hidePlayerModal() {
        document.getElementById('playerModal').style.display = 'none';
    }
    
    simulateMarketMovements() {
        // Update user's actual portfolio value
        const user = this.players.find(p => p.id === this.userId);
        if (user) {
            user.portfolioValue = portfolio.cash + this.calculateStockValue();
            user.totalGain = user.portfolioValue - 10000;
            user.dailyChange = (Math.random() - 0.5) * 8;
            user.trades = transactionHistory.transactions.length;
            user.riskLevel = this.calculateRiskLevel();
            user.favoriteStocks = this.getUserFavoriteStocks();
        }
        
        // AI players get random but realistic movements
        this.players.forEach(player => {
            if (player.id !== this.userId) {
                const movement = (Math.random() - 0.45) * 0.02;
                player.portfolioValue *= (1 + movement);
                player.dailyChange = movement * 100;
                player.totalGain = player.portfolioValue - 50000;
                
                // Occasionally update trade count and performance
                if (Math.random() < 0.1) {
                    player.trades += Math.floor(Math.random() * 3);
                }
                if (Math.random() < 0.2) {
                    player.weeklyPerformance = (Math.random() - 0.4) * 20;
                }
            }
        });
    }
    
    updateLastUpdateTime() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = 
            `Last updated: ${now.toLocaleTimeString()}`;
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : '⚠️'}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize leaderboard manager
let leaderboardManager;
document.addEventListener('DOMContentLoaded', () => {
    leaderboardManager = new LeaderboardManager();
});