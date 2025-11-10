// trade.js
// Advanced Trading System with Queue and Stack Operations
class TradingSystem {
    constructor() {
        this.currentSymbol = '';
        this.priceChart = null;
        this.pendingConfirmation = null;
        this.init();
        this.updateMarketData();
        setInterval(() => this.updateMarketData(), 2000); // Update every 2 seconds
        setInterval(() => this.simulatePriceChanges(), 3000); // Simulate price changes
    }
    
    init() {
        this.updateAccountInfo();
        this.updateOrderQueue();
        
        // Event listeners for real-time calculations
        document.getElementById('symbol').addEventListener('change', (e) => {
            this.currentSymbol = e.target.value;
            this.updateCurrentPrice();
            this.calculateEstimatedValue();
            this.updateAvailableShares();
            this.updatePriceChart();
        });
        
        document.getElementById('quantity').addEventListener('input', () => {
            this.calculateEstimatedValue();
        });

        // Chart timeframe controls
        document.querySelectorAll('[data-timeframe]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-timeframe]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updatePriceChart();
            });
        });

        // Modal handlers
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.hideConfirmationModal();
        });

        document.getElementById('cancelTrade').addEventListener('click', () => {
            this.hideConfirmationModal();
        });

        document.getElementById('confirmTrade').addEventListener('click', () => {
            if (this.pendingConfirmation) {
                this.executeConfirmedTrade();
            }
        });
    }
    
    updateAccountInfo() {
        const stockValue = this.calculateTotalStockValue();
        const totalValue = portfolio.cash + stockValue;
        
        document.getElementById('availableCash').textContent = `$${portfolio.cash.toFixed(2)}`;
        document.getElementById('buyingPower').textContent = `$${portfolio.cash.toFixed(2)}`;
        document.getElementById('portfolioValue').textContent = `$${totalValue.toFixed(2)}`;
        
        // Calculate daily P/L (simplified)
        const dailyPL = (Math.random() - 0.5) * 500;
        const dailyPLElement = document.getElementById('dailyPL');
        dailyPLElement.textContent = `${dailyPL >= 0 ? '+' : ''}$${dailyPL.toFixed(2)}`;
        dailyPLElement.className = dailyPL >= 0 ? 'positive' : 'negative';
    }
    
    calculateTotalStockValue() {
        let total = 0;
        for (const [symbol, holding] of portfolio.stocks) {
            total += parseFloat(getStockPrice(symbol)) * holding.qty;
        }
        return total;
    }
    
    updateCurrentPrice() {
        const symbol = this.currentSymbol;
        if (symbol) {
            const price = getStockPrice(symbol);
            const priceElement = document.getElementById('currentPrice');
            priceElement.textContent = `$${price}`;
            priceElement.className = 'positive';
            
            // Add animation for price changes
            priceElement.classList.add('value-change');
            setTimeout(() => priceElement.classList.remove('value-change'), 500);
        } else {
            document.getElementById('currentPrice').textContent = 'Select a stock';
            document.getElementById('currentPrice').className = 'neutral';
        }
    }
    
    calculateEstimatedValue() {
        const symbol = this.currentSymbol;
        const quantity = parseInt(document.getElementById('quantity').value) || 0;
        
        if (symbol && quantity > 0) {
            const price = parseFloat(getStockPrice(symbol));
            const total = price * quantity;
            const valueElement = document.getElementById('estimatedValue');
            valueElement.textContent = `$${total.toFixed(2)}`;
            valueElement.className = 'positive';
        } else {
            document.getElementById('estimatedValue').textContent = '-';
            document.getElementById('estimatedValue').className = 'neutral';
        }
    }
    
    updateAvailableShares() {
        const symbol = this.currentSymbol;
        const availableElement = document.getElementById('availableShares');
        
        if (symbol) {
            const holding = portfolio.stocks.get(symbol);
            const available = holding ? holding.qty : 0;
            availableElement.textContent = available;
            availableElement.className = available > 0 ? 'positive' : 'neutral';
        } else {
            availableElement.textContent = '-';
            availableElement.className = 'neutral';
        }
    }
    
    updateMarketData() {
        const tbody = document.getElementById('marketData');
        tbody.innerHTML = '';
        
        for (const [symbol, data] of Object.entries(STOCK_DATA)) {
            const price = getStockPrice(symbol);
            const change = (Math.random() - 0.5) * 3;
            const volume = Math.floor(Math.random() * 10000000);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="stock-symbol">
                        <strong>${symbol}</strong>
                        <span class="stock-name">${data.name}</span>
                    </div>
                </td>
                <td>$${price}</td>
                <td class="${change >= 0 ? 'positive' : 'negative'}">
                    ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                </td>
                <td>${volume.toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        }
    }
    
    simulatePriceChanges() {
        // Simulate realistic price movements
        for (const [symbol, data] of Object.entries(STOCK_DATA)) {
            const change = (Math.random() - 0.5) * 2 * data.volatility;
            data.price *= (1 + change);
            data.price = Math.max(data.price, 1);
        }
        
        // Update UI if current symbol is selected
        if (this.currentSymbol) {
            this.updateCurrentPrice();
            this.calculateEstimatedValue();
            this.updateMarketData();
            this.updatePriceChart();
        }
    }
    
    adjustQuantity(delta) {
        const input = document.getElementById('quantity');
        let quantity = parseInt(input.value) || 0;
        quantity = Math.max(1, quantity + delta);
        input.value = quantity;
        this.calculateEstimatedValue();
    }
    
    setQuantity(quantity) {
        document.getElementById('quantity').value = quantity;
        this.calculateEstimatedValue();
    }
    
    setMaxQuantity() {
        const symbol = this.currentSymbol;
        if (!symbol) return;
        
        const price = parseFloat(getStockPrice(symbol));
        const maxQuantity = Math.floor(portfolio.cash / price);
        this.setQuantity(Math.max(1, maxQuantity));
    }
    
    buyStock() {
        const symbol = this.currentSymbol;
        const quantity = parseInt(document.getElementById('quantity').value);
        
        if (!symbol) {
            this.showNotification('Please select a stock symbol', 'error');
            return;
        }
        
        if (!quantity || quantity <= 0) {
            this.showNotification('Please enter a valid quantity', 'error');
            return;
        }
        
        const price = parseFloat(getStockPrice(symbol));
        const cost = quantity * price;
        
        if (portfolio.cash < cost) {
            this.showNotification(`Insufficient funds. Needed: $${cost.toFixed(2)}, Available: $${portfolio.cash.toFixed(2)}`, 'error');
            return;
        }
        
        this.showConfirmationModal('BUY', symbol, quantity, price, cost);
    }
    
    sellStock() {
        const symbol = this.currentSymbol;
        const quantity = parseInt(document.getElementById('quantity').value);
        
        if (!symbol) {
            this.showNotification('Please select a stock symbol', 'error');
            return;
        }
        
        if (!quantity || quantity <= 0) {
            this.showNotification('Please enter a valid quantity', 'error');
            return;
        }
        
        const currentHolding = portfolio.stocks.get(symbol);
        if (!currentHolding || currentHolding.qty < quantity) {
            this.showNotification(`Insufficient shares. You own ${currentHolding ? currentHolding.qty : 0} shares of ${symbol}`, 'error');
            return;
        }
        
        const price = parseFloat(getStockPrice(symbol));
        const value = quantity * price;
        
        this.showConfirmationModal('SELL', symbol, quantity, price, value);
    }
    
    showConfirmationModal(type, symbol, quantity, price, amount) {
        this.pendingConfirmation = { type, symbol, quantity, price, amount };
        
        const action = type === 'BUY' ? 'Buy' : 'Sell';
        const text = `${action} ${quantity} shares of ${symbol} at $${price.toFixed(2)} for $${amount.toFixed(2)}?`;
        
        document.getElementById('confirmationText').textContent = text;
        document.getElementById('confirmationModal').style.display = 'flex';
    }
    
    hideConfirmationModal() {
        document.getElementById('confirmationModal').style.display = 'none';
        this.pendingConfirmation = null;
    }
    
    executeConfirmedTrade() {
        const { type, symbol, quantity, price } = this.pendingConfirmation;
        
        // QUEUE: Enqueue order for processing
        const order = {
            type,
            symbol,
            quantity,
            price,
            timestamp: new Date().toISOString(),
            status: 'PENDING'
        };
        orderQueue.enqueue(order);
        
        // STACK: Push to undo stack
        undoStack.push({
            type,
            symbol,
            quantity,
            price,
            timestamp: new Date().toISOString()
        });
        
        // Process the order immediately (simulated)
        this.processOrder(order);
        
        // Update UI
        this.updateOrderQueue();
        this.updateAccountInfo();
        
        this.showNotification(`Successfully ${type.toLowerCase()}ed ${quantity} shares of ${symbol} at $${price.toFixed(2)}`, 'success');
        this.hideConfirmationModal();
        
        // Reset form
        document.getElementById('quantity').value = '10';
        this.calculateEstimatedValue();
        this.updateAvailableShares();
    }
    
    processOrder(order) {
        // Simulate order processing with delay
        setTimeout(() => {
            order.status = 'EXECUTED';
            
            if (order.type === 'BUY') {
                // Update portfolio using MAP operations
                const currentHolding = portfolio.stocks.get(order.symbol) || { qty: 0, avg: 0 };
                const totalCost = order.quantity * order.price;
                const totalShares = currentHolding.qty + order.quantity;
                const newAvg = ((currentHolding.qty * currentHolding.avg) + totalCost) / totalShares;
                
                portfolio.stocks.set(order.symbol, {
                    qty: totalShares,
                    avg: newAvg
                });
                portfolio.cash -= totalCost;
            } else { // SELL
                const currentHolding = portfolio.stocks.get(order.symbol);
                currentHolding.qty -= order.quantity;
                portfolio.cash += order.quantity * order.price;
                
                if (currentHolding.qty === 0) {
                    portfolio.stocks.delete(order.symbol);
                }
            }
            
            // Record transaction using ARRAY operations
            transactionHistory.addTransaction({
                type: order.type,
                symbol: order.symbol,
                qty: order.quantity,
                price: order.price,
                time: new Date().toLocaleString()
            });
            
            // Update balance history using CIRCULAR BUFFER
            recordBalance();
            saveData();
            
            // Update order queue display
            this.updateOrderQueue();
        }, 1000);
    }
    
    undoTrade() {
        // STACK: Pop last action from undo stack
        if (undoStack.isEmpty()) {
            this.showNotification('No trades to undo', 'warning');
            return;
        }
        
        const lastAction = undoStack.pop();
        
        if (lastAction.type === 'BUY') {
            // Reverse buy action (sell without profit)
            const currentHolding = portfolio.stocks.get(lastAction.symbol);
            if (currentHolding && currentHolding.qty >= lastAction.quantity) {
                currentHolding.qty -= lastAction.quantity;
                portfolio.cash += lastAction.quantity * lastAction.price;
                
                if (currentHolding.qty === 0) {
                    portfolio.stocks.delete(lastAction.symbol);
                }
            }
        } else { // SELL
            // Reverse sell action (buy at same price)
            const currentHolding = portfolio.stocks.get(lastAction.symbol) || { qty: 0, avg: 0 };
            const totalCost = lastAction.quantity * lastAction.price;
            const totalShares = currentHolding.qty + lastAction.quantity;
            const newAvg = ((currentHolding.qty * currentHolding.avg) + totalCost) / totalShares;
            
            portfolio.stocks.set(lastAction.symbol, {
                qty: totalShares,
                avg: newAvg
            });
            portfolio.cash -= totalCost;
        }
        
        // Record undo transaction
        transactionHistory.addTransaction({
            type: 'UNDO',
            symbol: lastAction.symbol,
            qty: lastAction.quantity,
            price: lastAction.price,
            time: new Date().toLocaleString()
        });
        
        recordBalance();
        saveData();
        this.updateAccountInfo();
        this.updateOrderQueue();
        this.updateAvailableShares();
        
        this.showNotification(`Undid ${lastAction.type} of ${lastAction.quantity} ${lastAction.symbol} shares`, 'success');
    }
    
    updateOrderQueue() {
        const queueContainer = document.getElementById('orderQueue');
        
        if (orderQueue.isEmpty()) {
            queueContainer.innerHTML = `
                <div class="queue-placeholder">
                    <div class="placeholder-icon">⏳</div>
                    <p>No pending orders</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        // QUEUE: Display orders in FIFO order
        orderQueue.queue.forEach((order, index) => {
            const isProcessing = order.status === 'PENDING';
            html += `
                <div class="order-item ${isProcessing ? 'processing' : 'executed'}">
                    <div class="order-header">
                        <span class="order-type ${order.type.toLowerCase()}">${order.type}</span>
                        <span class="order-symbol">${order.quantity} ${order.symbol}</span>
                        <span class="order-status ${isProcessing ? 'warning' : 'positive'}">
                            ${order.status}
                        </span>
                    </div>
                    <div class="order-details">
                        <span>@ $${order.price.toFixed(2)}</span>
                        <span>Total: $${(order.quantity * order.price).toFixed(2)}</span>
                    </div>
                    ${isProcessing ? '<div class="processing-bar"></div>' : ''}
                </div>
            `;
        });
        
        queueContainer.innerHTML = html;
    }
    
    updatePriceChart() {
        const symbol = this.currentSymbol;
        if (!symbol) return;
        
        const ctx = document.getElementById('priceChart').getContext('2d');
        const timeframe = document.querySelector('[data-timeframe].active').dataset.timeframe;
        
        // Generate sample price data based on timeframe
        let labels = [];
        let data = [];
        const basePrice = parseFloat(getStockPrice(symbol));
        
        switch (timeframe) {
            case '1D':
                labels = ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
                data = this.generatePriceData(basePrice, 14, 0.02);
                break;
            case '1W':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                data = this.generatePriceData(basePrice, 5, 0.05);
                break;
            case '1M':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                data = this.generatePriceData(basePrice, 4, 0.1);
                break;
        }
        
        if (this.priceChart) {
            this.priceChart.destroy();
        }
        
        this.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${symbol} Price`,
                    data: data,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
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
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }
    
    generatePriceData(basePrice, count, volatility) {
        const data = [basePrice];
        let currentPrice = basePrice;
        
        for (let i = 1; i < count; i++) {
            const change = (Math.random() - 0.5) * 2 * volatility;
            currentPrice *= (1 + change);
            data.push(currentPrice);
        }
        
        return data;
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize trading system
let trading;
document.addEventListener('DOMContentLoaded', () => {
    trading = new TradingSystem();
});