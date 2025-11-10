// dashboard.js
// Dashboard-specific functionality with advanced data structures
class Dashboard {
    constructor() {
        this.init();
    }
    
    init() {
        this.updatePortfolioSummary();
        this.updateHoldingsTable();
        this.updateRecentTransactions();
        
        // Auto-refresh every 5 seconds for real-time updates
        setInterval(() => {
            this.updatePortfolioSummary();
            this.updateHoldingsTable();
        }, 5000);
    }
    
    updatePortfolioSummary() {
        const cash = portfolio.cash;
        const stockValue = this.calculateStockValue();
        const totalValue = cash + stockValue;
        
        document.getElementById('cashBalance').textContent = `$${cash.toFixed(2)}`;
        document.getElementById('stockValue').textContent = `$${stockValue.toFixed(2)}`;
        document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
    }
    
    calculateStockValue() {
        let total = 0;
        // MAP iteration: O(n) where n = number of different stocks
        // Efficient key-value access for portfolio holdings
        for (const [symbol, holding] of portfolio.stocks) {
            const currentPrice = parseFloat(getStockPrice(symbol));
            total += currentPrice * holding.qty;
        }
        return total;
    }
    
    updateHoldingsTable() {
        const tbody = document.getElementById('holdingsBody');
        tbody.innerHTML = '';
        
        if (portfolio.stocks.size === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No holdings found. Start trading!</td></tr>';
            return;
        }
        
        // MAP iteration for displaying holdings - O(n) complexity
        for (const [symbol, holding] of portfolio.stocks) {
            const currentPrice = parseFloat(getStockPrice(symbol));
            const marketValue = currentPrice * holding.qty;
            const costBasis = holding.avg * holding.qty;
            const pl = marketValue - costBasis;
            const plPercent = costBasis > 0 ? ((pl / costBasis) * 100).toFixed(2) : '0.00';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${symbol}</strong></td>
                <td>${holding.qty}</td>
                <td>$${holding.avg.toFixed(2)}</td>
                <td>$${currentPrice.toFixed(2)}</td>
                <td>$${marketValue.toFixed(2)}</td>
                <td class="${pl >= 0 ? 'positive' : 'negative'}">
                    ${pl >= 0 ? '+' : ''}$${pl.toFixed(2)} (${plPercent}%)
                </td>
            `;
            tbody.appendChild(row);
        }
    }
    
    updateRecentTransactions() {
        const tbody = document.getElementById('transactionsBody');
        tbody.innerHTML = '';
        
        // ARRAY slicing for recent transactions - O(k) where k=5
        const recentTxs = transactionHistory.transactions.slice(-5).reverse();
        
        if (recentTxs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No transactions yet</td></tr>';
            return;
        }
        
        recentTxs.forEach(tx => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="transaction-badge ${tx.type.toLowerCase()}">${tx.type}</span></td>
                <td>${tx.symbol}</td>
                <td>${tx.qty}</td>
                <td>${tx.price ? `$${tx.price.toFixed(2)}` : '-'}</td>
                <td>${tx.time}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});