// history.js
// Enhanced History Management with Advanced Data Structures
class HistoryManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredTransactions = [];
        this.currentSort = 'DATE_DESC';
        this.init();
    }
    
    init() {
        this.applyFilters();
        this.updateStatistics();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Real-time search with debouncing
        let searchTimeout;
        document.getElementById('searchSymbol').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.applyFilters();
            }, 300);
        });
        
        document.getElementById('transactionType').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('dateRange').addEventListener('change', () => {
            this.applyFilters();
        });

        // Modal handlers
        document.querySelector('#transactionModal .close-modal').addEventListener('click', () => {
            this.hideTransactionModal();
        });
    }
    
    applyFilters() {
        const symbolFilter = document.getElementById('searchSymbol').value.toUpperCase();
        const typeFilter = document.getElementById('transactionType').value;
        const dateFilter = document.getElementById('dateRange').value;
        
        // ARRAY FILTERING: O(n) complexity - linear search through transactions
        this.filteredTransactions = transactionHistory.transactions.filter(tx => {
            let matches = true;
            
            // Symbol filter - case insensitive search
            if (symbolFilter && !tx.symbol.toUpperCase().includes(symbolFilter)) {
                matches = false;
            }
            
            // Type filter
            if (typeFilter !== 'ALL' && tx.type !== typeFilter) {
                matches = false;
            }
            
            // Date filter with time range calculations
            if (dateFilter !== 'ALL') {
                const txDate = new Date(tx.time);
                const now = new Date();
                
                switch (dateFilter) {
                    case 'TODAY':
                        matches = matches && txDate.toDateString() === now.toDateString();
                        break;
                    case 'WEEK':
                        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                        matches = matches && txDate >= weekAgo;
                        break;
                    case 'MONTH':
                        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
                        matches = matches && txDate >= monthAgo;
                        break;
                }
            }
            
            return matches;
        });
        
        this.sortTransactions();
        this.updateStatistics();
        this.renderTransactions();
        this.renderPagination();
        this.updateResultsCount();
    }
    
    updateResultsCount() {
        const total = transactionHistory.transactions.length;
        const filtered = this.filteredTransactions.length;
        
        document.getElementById('resultsCount').textContent = filtered;
        document.getElementById('totalResults').textContent = total;
    }
    
    clearFilters() {
        document.getElementById('searchSymbol').value = '';
        document.getElementById('transactionType').value = 'ALL';
        document.getElementById('dateRange').value = 'ALL';
        this.applyFilters();
        this.showNotification('Filters cleared', 'success');
    }
    
    sortTransactions() {
        const sortBy = document.getElementById('sortBy').value;
        this.currentSort = sortBy;
        
        // MERGE SORT implementation for efficient O(n log n) sorting
        this.filteredTransactions = this.mergeSort(this.filteredTransactions, sortBy);
        this.renderTransactions();
    }
    
    // MERGE SORT: Divide and conquer algorithm with O(n log n) complexity
    mergeSort(arr, sortBy) {
        if (arr.length <= 1) return arr;
        
        const mid = Math.floor(arr.length / 2);
        const left = this.mergeSort(arr.slice(0, mid), sortBy);
        const right = this.mergeSort(arr.slice(mid), sortBy);
        
        return this.merge(left, right, sortBy);
    }
    
    merge(left, right, sortBy) {
        const result = [];
        let i = 0, j = 0;
        
        while (i < left.length && j < right.length) {
            if (this.compareTransactions(left[i], right[j], sortBy) <= 0) {
                result.push(left[i++]);
            } else {
                result.push(right[j++]);
            }
        }
        
        return result.concat(left.slice(i)).concat(right.slice(j));
    }
    
    compareTransactions(a, b, sortBy) {
        switch (sortBy) {
            case 'DATE_DESC':
                return new Date(b.time) - new Date(a.time);
            case 'DATE_ASC':
                return new Date(a.time) - new Date(b.time);
            case 'SYMBOL':
                return a.symbol.localeCompare(b.symbol);
            case 'TYPE':
                return a.type.localeCompare(b.type);
            case 'AMOUNT_DESC':
                const amountA = (a.price || 0) * (a.qty || 0);
                const amountB = (b.price || 0) * (b.qty || 0);
                return amountB - amountA;
            default:
                return 0;
        }
    }
    
    renderTransactions() {
        const tbody = document.getElementById('transactionsBody');
        tbody.innerHTML = '';
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageTransactions = this.filteredTransactions.slice(startIndex, endIndex);
        
        if (pageTransactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 3rem;">
                        <div class="empty-state">
                            <div class="empty-icon">📭</div>
                            <h3>No transactions found</h3>
                            <p>No transactions match your current filters</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        pageTransactions.forEach(tx => {
            const totalAmount = tx.price ? (tx.price * tx.qty).toFixed(2) : '-';
            const row = document.createElement('tr');
            row.className = 'transaction-row';
            
            row.innerHTML = `
                <td>
                    <div class="transaction-time">
                        <div class="date">${new Date(tx.time).toLocaleDateString()}</div>
                        <div class="time">${new Date(tx.time).toLocaleTimeString()}</div>
                    </div>
                </td>
                <td>
                    <span class="transaction-badge ${tx.type.toLowerCase()}">
                        ${tx.type}
                    </span>
                </td>
                <td>
                    <div class="symbol-cell">
                        <strong>${tx.symbol}</strong>
                        <span class="company-name">${this.getCompanyName(tx.symbol)}</span>
                    </div>
                </td>
                <td>${tx.qty.toLocaleString()}</td>
                <td>${tx.price ? `$${tx.price.toFixed(2)}` : '-'}</td>
                <td class="${tx.type === 'BUY' ? 'negative' : 'positive'}">
                    ${tx.type === 'BUY' ? '-' : '+'}$${totalAmount}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="historyManager.viewTransactionDetails('${tx.time}')">
                            👁️ Details
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    getCompanyName(symbol) {
        const companies = {
            'AAPL': 'Apple Inc.',
            'GOOGL': 'Alphabet Inc.',
            'MSFT': 'Microsoft Corp.',
            'TSLA': 'Tesla Inc.',
            'AMZN': 'Amazon.com Inc.',
            'META': 'Meta Platforms',
            'NVDA': 'NVIDIA Corp.',
            'NFLX': 'Netflix Inc.'
        };
        return companies[symbol] || 'Unknown Company';
    }
    
    renderPagination() {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        const controls = document.getElementById('paginationControls');
        
        if (totalPages <= 1) {
            controls.innerHTML = '';
            return;
        }
        
        let html = `
            <button class="btn btn-sm ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="historyManager.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''}>
                ← Previous
            </button>
            <div class="page-numbers">
        `;
        
        // Show page numbers with ellipsis for large ranges
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            html += `<button class="btn btn-sm" onclick="historyManager.goToPage(1)">1</button>`;
            if (startPage > 2) html += `<span class="page-ellipsis">...</span>`;
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="btn btn-sm ${i === this.currentPage ? 'active' : ''}" 
                        onclick="historyManager.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<span class="page-ellipsis">...</span>`;
            html += `<button class="btn btn-sm" onclick="historyManager.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        html += `
            </div>
            <button class="btn btn-sm ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="historyManager.nextPage()" ${this.currentPage === totalPages ? 'disabled' : ''}>
                Next →
            </button>
        `;
        
        controls.innerHTML = html;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.renderTransactions();
        this.renderPagination();
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTransactions();
            this.renderPagination();
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTransactions();
            this.renderPagination();
        }
    }
    
    updateStatistics() {
        const transactions = this.filteredTransactions.length > 0 ? 
            this.filteredTransactions : transactionHistory.transactions;
        
        // Calculate statistics with ARRAY methods
        const totalTransactions = transactions.length;
        const buyCount = transactions.filter(tx => tx.type === 'BUY').length;
        const sellCount = transactions.filter(tx => tx.type === 'SELL').length;
        
        // Find most traded symbol using frequency counting
        const symbolCount = {};
        transactions.forEach(tx => {
            if (tx.symbol) {
                symbolCount[tx.symbol] = (symbolCount[tx.symbol] || 0) + 1;
            }
        });
        
        const mostTraded = Object.keys(symbolCount).length > 0 ? 
            Object.keys(symbolCount).reduce((a, b) => 
                symbolCount[a] > symbolCount[b] ? a : b
            ) : 'N/A';
        
        // Calculate total volume with ARRAY reduce
        const totalVolume = transactions.reduce((sum, tx) => 
            sum + (tx.qty || 0), 0
        );
        
        // Update DOM
        document.getElementById('totalTransactions').textContent = totalTransactions.toLocaleString();
        document.getElementById('buySellRatio').textContent = `${buyCount}:${sellCount}`;
        document.getElementById('mostTraded').textContent = mostTraded !== 'N/A' ? mostTraded : '-';
        document.getElementById('totalVolume').textContent = totalVolume.toLocaleString();
    }
    
    viewTransactionDetails(timestamp) {
        const transaction = transactionHistory.transactions.find(tx => tx.time === timestamp);
        if (transaction) {
            const details = document.getElementById('transactionDetails');
            const totalAmount = transaction.price ? (transaction.price * transaction.qty).toFixed(2) : 'N/A';
            
            details.innerHTML = `
                <div class="transaction-detail">
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">
                            <span class="transaction-badge ${transaction.type.toLowerCase()}">
                                ${transaction.type}
                            </span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Symbol:</span>
                        <span class="detail-value">
                            <strong>${transaction.symbol}</strong> - ${this.getCompanyName(transaction.symbol)}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Quantity:</span>
                        <span class="detail-value">${transaction.qty.toLocaleString()} shares</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Price:</span>
                        <span class="detail-value">$${transaction.price ? transaction.price.toFixed(2) : 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Amount:</span>
                        <span class="detail-value ${transaction.type === 'BUY' ? 'negative' : 'positive'}">
                            ${transaction.type === 'BUY' ? '-' : '+'}$${totalAmount}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span class="detail-value">${transaction.time}</span>
                    </div>
                </div>
            `;
            
            this.showTransactionModal();
        }
    }
    
    showTransactionModal() {
        document.getElementById('transactionModal').style.display = 'flex';
    }
    
    hideTransactionModal() {
        document.getElementById('transactionModal').style.display = 'none';
    }
    
    exportToCSV() {
        const transactions = this.filteredTransactions.length > 0 ? 
            this.filteredTransactions : transactionHistory.transactions;
        
        if (transactions.length === 0) {
            this.showNotification('No transactions to export', 'warning');
            return;
        }
        
        const headers = ['Date', 'Time', 'Type', 'Symbol', 'Quantity', 'Price', 'Total Amount'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(tx => {
                const date = new Date(tx.time);
                return [
                    `"${date.toLocaleDateString()}"`,
                    `"${date.toLocaleTimeString()}"`,
                    tx.type,
                    tx.symbol,
                    tx.qty,
                    tx.price || '',
                    tx.price ? (tx.price * tx.qty).toFixed(2) : ''
                ].join(',');
            })
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stocksim-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('CSV exported successfully', 'success');
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span>
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

// Initialize history manager
let historyManager;
document.addEventListener('DOMContentLoaded', () => {
    historyManager = new HistoryManager();
});