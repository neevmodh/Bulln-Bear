// insights.js
// Advanced Portfolio Analytics and Insights with Statistical Analysis
class InsightsManager {
    constructor() {
        this.portfolioChart = null;
        this.allocationChart = null;
        this.benchmarkChart = null;
        this.riskChart = null;
        this.init();
    }
    
    init() {
        this.initializeCharts();
        this.updateCharts();
        this.updateAnalytics();
        this.updateTradingInsights();
        this.updateRecommendations();
        this.updateCorrelationMatrix();
        
        // Update analytics periodically
        setInterval(() => {
            this.updateAnalytics();
            this.updateTradingInsights();
            this.updateCorrelationMatrix();
        }, 30000);
    }
    
    initializeCharts() {
        // Portfolio Value Chart using CIRCULAR BUFFER data
        const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');
        this.portfolioChart = new Chart(portfolioCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Portfolio Value',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Portfolio Value ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
        
        // Allocation Chart
        const allocationCtx = document.getElementById('allocationChart').getContext('2d');
        this.allocationChart = new Chart(allocationCtx, {
            type: 'doughnut',
            data: {
                labels: ['Cash', 'Stocks'],
                datasets: [{
                    data: [100, 0],
                    backgroundColor: ['#10b981', '#3b82f6'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        
        // Benchmark Chart
        const benchmarkCtx = document.getElementById('benchmarkChart').getContext('2d');
        this.benchmarkChart = new Chart(benchmarkCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Your Portfolio',
                        data: [],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'S&P 500',
                        data: [],
                        borderColor: '#ef4444',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
        
        // Risk Chart
        const riskCtx = document.getElementById('riskChart').getContext('2d');
        this.riskChart = new Chart(riskCtx, {
            type: 'radar',
            data: {
                labels: ['Market Risk', 'Specific Risk', 'Liquidity Risk', 'Currency Risk', 'Interest Rate Risk', 'Inflation Risk'],
                datasets: [{
                    label: 'Risk Exposure',
                    data: [65, 35, 20, 5, 45, 30],
                    backgroundColor: 'rgba(37, 99, 235, 0.2)',
                    borderColor: '#2563eb',
                    borderWidth: 2,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    updateCharts() {
        this.updatePortfolioChart();
        this.updateAllocationChart();
        this.updateBenchmarkChart();
        this.updateRiskChart();
    }
    
    updatePortfolioChart() {
        const history = balanceHistory.getData();
        const timeFrame = document.getElementById('chartTimeFrame').value;
        
        let filteredData = history;
        if (timeFrame !== 'ALL') {
            const now = new Date();
            let cutoffDate;
            
            switch (timeFrame) {
                case '1W':
                    cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '1M':
                    cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '3M':
                    cutoffDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
                    break;
                case '1Y':
                    cutoffDate = new Date(now - 365 * 24 * 60 * 60 * 1000);
                    break;
            }
            
            // Filter data based on timeframe
            filteredData = history.filter(item => {
                const itemDate = new Date(item.time);
                return itemDate >= cutoffDate;
            });
        }
        
        this.portfolioChart.data.labels = filteredData.map(item => 
            new Date(item.time).toLocaleDateString()
        );
        this.portfolioChart.data.datasets[0].data = filteredData.map(item => item.value);
        this.portfolioChart.update();
    }
    
    updateAllocationChart() {
        const cash = portfolio.cash;
        const stockValue = this.calculateStockValue();
        const totalValue = cash + stockValue;
        
        const cashPercentage = totalValue > 0 ? (cash / totalValue * 100) : 100;
        const stockPercentage = totalValue > 0 ? (stockValue / totalValue * 100) : 0;
        
        this.allocationChart.data.datasets[0].data = [cashPercentage, stockPercentage];
        this.allocationChart.update();
        
        // Update percentage displays
        document.getElementById('cashPercentage').textContent = `${cashPercentage.toFixed(1)}%`;
        document.getElementById('stockPercentage').textContent = `${stockPercentage.toFixed(1)}%`;
    }
    
    calculateStockValue() {
        let total = 0;
        for (const [symbol, holding] of portfolio.stocks) {
            total += parseFloat(getStockPrice(symbol)) * holding.qty;
        }
        return total;
    }
    
    updateBenchmarkChart() {
        // Simulate benchmark data (S&P 500) vs portfolio performance
        const history = balanceHistory.getData();
        if (history.length === 0) return;
        
        const baseValue = history[0].value;
        const portfolioReturns = history.map((item, index) => {
            return ((item.value - baseValue) / baseValue * 100);
        });
        
        // Simulate S&P 500 returns with realistic correlation
        const benchmarkReturns = portfolioReturns.map((return_, index) => {
            // S&P 500 generally correlates with portfolio but with some variation
            const correlation = 0.7 + Math.random() * 0.3;
            const marketNoise = (Math.random() - 0.5) * 8;
            return return_ * correlation + marketNoise;
        });
        
        this.benchmarkChart.data.labels = history.map(item => 
            new Date(item.time).toLocaleDateString()
        );
        this.benchmarkChart.data.datasets[0].data = portfolioReturns;
        this.benchmarkChart.data.datasets[1].data = benchmarkReturns;
        this.benchmarkChart.update();
    }
    
    updateRiskChart() {
        // Calculate realistic risk metrics based on portfolio composition
        const stockValue = this.calculateStockValue();
        const totalValue = portfolio.cash + stockValue;
        const stockPercentage = totalValue > 0 ? (stockValue / totalValue) : 0;
        
        const riskData = [
            Math.min(100, 40 + stockPercentage * 60), // Market risk
            Math.min(100, 20 + this.calculateConcentrationRisk() * 80), // Specific risk
            Math.min(100, 10 + (1 - stockPercentage) * 40), // Liquidity risk
            5, // Currency risk (assuming USD only)
            Math.min(100, 30 + stockPercentage * 30), // Interest rate risk
            Math.min(100, 25 + stockPercentage * 45) // Inflation risk
        ];
        
        this.riskChart.data.datasets[0].data = riskData;
        this.riskChart.update();
    }
    
    calculateConcentrationRisk() {
        if (portfolio.stocks.size === 0) return 0;
        
        const stockValues = [];
        let totalStockValue = 0;
        
        for (const [symbol, holding] of portfolio.stocks) {
            const value = parseFloat(getStockPrice(symbol)) * holding.qty;
            stockValues.push(value);
            totalStockValue += value;
        }
        
        if (totalStockValue === 0) return 0;
        
        // Calculate Herfindahl index for concentration
        let concentration = 0;
        for (const value of stockValues) {
            const share = value / totalStockValue;
            concentration += share * share;
        }
        
        return concentration;
    }
    
    updateAnalytics() {
        const totalValue = portfolio.cash + this.calculateStockValue();
        const initialInvestment = 10000;
        const totalReturn = ((totalValue - initialInvestment) / initialInvestment * 100);
        
        // Calculate volatility (standard deviation of returns) using CIRCULAR BUFFER data
        const history = balanceHistory.getData();
        const returns = [];
        for (let i = 1; i < history.length; i++) {
            const return_ = (history[i].value - history[i-1].value) / history[i-1].value;
            returns.push(return_);
        }
        
        const volatility = this.calculateVolatility(returns);
        const sharpeRatio = totalReturn / (volatility * 100 || 1);
        
        // Update metrics with animations
        this.animateValueChange('totalReturn', totalReturn, '%', 2);
        document.getElementById('totalReturn').className = totalReturn >= 0 ? 'positive' : 'negative';
        
        const volatilityText = volatility < 0.02 ? 'Low' : volatility < 0.05 ? 'Medium' : 'High';
        document.getElementById('volatility').textContent = volatilityText;
        document.getElementById('volatility').className = 
            volatility < 0.02 ? 'positive' : volatility < 0.05 ? 'neutral' : 'negative';
        
        document.getElementById('sharpeRatio').textContent = sharpeRatio.toFixed(2);
        document.getElementById('beta').textContent = '1.00'; // Simplified beta calculation
        
        // Update VaR with statistical analysis
        const varValue = totalValue * volatility * 1.645; // 95% confidence, 1.645 sigma
        this.animateValueChange('varValue', -Math.abs(varValue), '$', 0);
        
        // Update efficiency score
        const efficiency = Math.max(0, Math.min(100, 70 + totalReturn * 2 - Math.abs(volatility * 1000)));
        document.getElementById('efficiencyScore').textContent = `${efficiency.toFixed(0)}%`;
        document.getElementById('efficiencyFill').style.width = `${efficiency}%`;
    }
    
    calculateVolatility(returns) {
        if (returns.length === 0) return 0;
        
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        return Math.sqrt(variance);
    }
    
    animateValueChange(elementId, value, suffix, decimals) {
        const element = document.getElementById(elementId);
        const currentValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
        const targetValue = value;
        
        let start = null;
        const duration = 1000;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            
            const current = currentValue + (targetValue - currentValue) * progress;
            element.textContent = `${current >= 0 ? '+' : ''}${current.toFixed(decimals)}${suffix}`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    updateTradingInsights() {
        this.updateBestPerformers();
        this.updateTradingPatterns();
    }
    
    updateBestPerformers() {
        const tbody = document.getElementById('bestPerformers');
        tbody.innerHTML = '';
        
        if (portfolio.stocks.size === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 2rem;">
                        <div class="empty-state">
                            <div class="empty-icon">📊</div>
                            <p>No stock holdings</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        const performers = [];
        
        for (const [symbol, holding] of portfolio.stocks) {
            const currentPrice = parseFloat(getStockPrice(symbol));
            const costBasis = holding.avg;
            const return_ = ((currentPrice - costBasis) / costBasis * 100);
            const contribution = (currentPrice * holding.qty) / (portfolio.cash + this.calculateStockValue()) * 100;
            
            performers.push({
                symbol,
                return: return_,
                contribution: contribution,
                currentValue: currentPrice * holding.qty
            });
        }
        
        // Sort by return (descending) using efficient sorting
        performers.sort((a, b) => b.return - a.return);
        
        performers.forEach(performer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="stock-performance">
                        <strong>${performer.symbol}</strong>
                        <small>$${performer.currentValue.toFixed(2)}</small>
                    </div>
                </td>
                <td class="${performer.return >= 0 ? 'positive' : 'negative'}">
                    ${performer.return >= 0 ? '+' : ''}${performer.return.toFixed(2)}%
                </td>
                <td>${performer.contribution.toFixed(1)}%</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    updateTradingPatterns() {
        const transactions = transactionHistory.transactions;
        
        if (transactions.length === 0) {
            document.getElementById('mostActiveDay').textContent = '-';
            document.getElementById('avgTradeSize').textContent = '-';
            document.getElementById('winRate').textContent = '-';
            document.getElementById('profitFactor').textContent = '-';
            return;
        }
        
        // Calculate most active day with frequency analysis
        const dayCount = {};
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        transactions.forEach(tx => {
            const day = new Date(tx.time).getDay();
            dayCount[day] = (dayCount[day] || 0) + 1;
        });
        
        const mostActiveDayIndex = Object.keys(dayCount).reduce((a, b) => 
            dayCount[a] > dayCount[b] ? a : b
        );
        const mostActiveDay = dayNames[mostActiveDayIndex];
        
        // Calculate average trade size
        const totalTradeValue = transactions.reduce((sum, tx) => 
            sum + (tx.price || 0) * (tx.qty || 0), 0
        );
        const avgTradeSize = totalTradeValue / transactions.length;
        
        // Calculate win rate (simplified)
        const sellTransactions = transactions.filter(tx => tx.type === 'SELL');
        const profitableTrades = sellTransactions.filter(tx => {
            const holding = portfolio.stocks.get(tx.symbol);
            return holding && tx.price > holding.avg;
        }).length;
        
        const winRate = sellTransactions.length > 0 ? 
            (profitableTrades / sellTransactions.length) * 100 : 0;
        
        // Calculate profit factor (simplified)
        const grossProfit = transactions.filter(tx => tx.type === 'SELL')
            .reduce((sum, tx) => sum + (tx.price * tx.qty), 0);
        const grossLoss = transactions.filter(tx => tx.type === 'BUY')
            .reduce((sum, tx) => sum + (tx.price * tx.qty), 0);
        const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : 1;
        
        document.getElementById('mostActiveDay').textContent = mostActiveDay;
        document.getElementById('avgTradeSize').textContent = `$${avgTradeSize.toFixed(2)}`;
        document.getElementById('winRate').textContent = `${winRate.toFixed(1)}%`;
        document.getElementById('profitFactor').textContent = profitFactor.toFixed(2);
    }
    
    updateCorrelationMatrix() {
        const matrixContainer = document.getElementById('correlationMatrix');
        
        if (portfolio.stocks.size === 0) {
            matrixContainer.innerHTML = `
                <div class="matrix-placeholder">
                    <div class="placeholder-icon">📊</div>
                    <p>No stocks to analyze</p>
                    <small>Add stocks to see correlation analysis</small>
                </div>
            `;
            return;
        }
        
        const symbols = Array.from(portfolio.stocks.keys());
        let html = '<div class="correlation-grid">';
        
        // Header row
        html += '<div class="correlation-header"></div>';
        symbols.forEach(symbol => {
            html += `<div class="correlation-header">${symbol}</div>`;
        });
        
        // Correlation rows - O(n²) complexity for matrix calculation
        symbols.forEach((symbol1, i) => {
            html += `<div class="correlation-header">${symbol1}</div>`;
            symbols.forEach((symbol2, j) => {
                if (i === j) {
                    html += '<div class="correlation-cell perfect">1.00</div>';
                } else {
                    const correlation = this.calculateCorrelation(symbol1, symbol2);
                    const intensity = Math.abs(correlation);
                    const className = intensity > 0.7 ? 'high' : intensity > 0.3 ? 'medium' : 'low';
                    html += `<div class="correlation-cell ${className}">${correlation.toFixed(2)}</div>`;
                }
            });
        });
        
        html += '</div>';
        matrixContainer.innerHTML = html;
    }
    
    calculateCorrelation(symbol1, symbol2) {
        // Simplified correlation calculation
        // In real implementation, this would use historical price data
        const baseCorrelation = 0.3 + Math.random() * 0.4; // Random base correlation
        const sameSectorBonus = this.areSameSector(symbol1, symbol2) ? 0.3 : 0;
        return Math.min(0.95, baseCorrelation + sameSectorBonus);
    }
    
    areSameSector(symbol1, symbol2) {
        // Simplified sector mapping
        const techStocks = ['AAPL', 'GOOGL', 'MSFT', 'META', 'NVDA'];
        const consumerStocks = ['AMZN', 'NFLX'];
        const autoStocks = ['TSLA'];
        
        const sector1 = techStocks.includes(symbol1) ? 'tech' : 
                       consumerStocks.includes(symbol1) ? 'consumer' :
                       autoStocks.includes(symbol1) ? 'auto' : 'other';
                       
        const sector2 = techStocks.includes(symbol2) ? 'tech' : 
                       consumerStocks.includes(symbol2) ? 'consumer' :
                       autoStocks.includes(symbol2) ? 'auto' : 'other';
        
        return sector1 === sector2;
    }
    
    updateRecommendations() {
        const recommendations = document.getElementById('recommendations');
        
        let html = '';
        const stockValue = this.calculateStockValue();
        const totalValue = portfolio.cash + stockValue;
        const stockPercentage = totalValue > 0 ? (stockValue / totalValue) * 100 : 0;
        
        // Check diversification
        if (stockPercentage < 20) {
            html += `
                <div class="recommendation-item">
                    <div class="recommendation-header">
                        <span class="recommendation-icon">💡</span>
                        <strong>Increase Stock Allocation</strong>
                    </div>
                    <p>Your portfolio has ${stockPercentage.toFixed(1)}% in stocks. Consider increasing equity exposure for better long-term returns.</p>
                </div>
            `;
        } else if (stockPercentage > 80) {
            html += `
                <div class="recommendation-item">
                    <div class="recommendation-header">
                        <span class="recommendation-icon">⚠️</span>
                        <strong>High Equity Concentration</strong>
                    </div>
                    <p>Your portfolio has ${stockPercentage.toFixed(1)}% in stocks. Consider increasing cash for risk management.</p>
                </div>
            `;
        }
        
        // Check concentration risk
        if (portfolio.stocks.size > 0) {
            const concentration = this.calculateConcentrationRisk();
            if (concentration > 0.5) {
                html += `
                    <div class="recommendation-item">
                        <div class="recommendation-header">
                            <span class="recommendation-icon">🎯</span>
                            <strong>Diversification Opportunity</strong>
                        </div>
                        <p>Your portfolio shows high concentration risk. Consider diversifying across more stocks and sectors.</p>
                    </div>
                `;
            }
        }
        
        // Check trading activity
        const recentTrades = transactionHistory.transactions.filter(tx => 
            new Date(tx.time) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        
        if (recentTrades > 10) {
            html += `
                <div class="recommendation-item">
                    <div class="recommendation-header">
                        <span class="recommendation-icon">⚡</span>
                        <strong>High Trading Frequency</strong>
                    </div>
                    <p>You've made ${recentTrades} trades this week. Consider a more long-term approach to reduce transaction costs.</p>
                </div>
            `;
        }
        
        // Check risk level
        const volatility = this.calculateVolatilityFromHistory();
        if (volatility > 0.05) {
            html += `
                <div class="recommendation-item">
                    <div class="recommendation-header">
                        <span class="recommendation-icon">🌊</span>
                        <strong>High Portfolio Volatility</strong>
                    </div>
                    <p>Your portfolio shows above-average volatility. Consider adding more stable, dividend-paying stocks.</p>
                </div>
            `;
        }
        
        recommendations.innerHTML = html || `
            <div class="recommendation-item">
                <div class="recommendation-header">
                    <span class="recommendation-icon">✅</span>
                    <strong>Portfolio Looks Good</strong>
                </div>
                <p>Your portfolio is well-balanced. Continue with your current strategy and monitor performance regularly.</p>
            </div>
        `;
    }
    
    calculateVolatilityFromHistory() {
        const history = balanceHistory.getData();
        const returns = [];
        
        for (let i = 1; i < history.length; i++) {
            const return_ = (history[i].value - history[i-1].value) / history[i-1].value;
            returns.push(return_);
        }
        
        return this.calculateVolatility(returns);
    }
}

// Initialize insights manager
let insightsManager;
document.addEventListener('DOMContentLoaded', () => {
    insightsManager = new InsightsManager();
});