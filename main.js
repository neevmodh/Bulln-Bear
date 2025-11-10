// main.js
// === ADVANCED GLOBAL DATA STRUCTURES IMPLEMENTATION ===

/**
 * PORTFOLIO CLASS - Uses MAP data structure
 * MAP provides O(1) average case for insertion, deletion, and access
 * Perfect for storing stock holdings by symbol
 */
class Portfolio {
    constructor() {
        this.cash = 10000; // Initial cash
        this.stocks = new Map(); // MAP: O(1) access by symbol
    }
}

/**
 * TRANSACTION HISTORY CLASS - Uses ARRAY with MERGE SORT
 * ARRAY provides sequential storage with efficient sorting algorithms
 */
class TransactionHistory {
    constructor() {
        this.transactions = []; // ARRAY: Sequential storage with sorting
    }
    
    addTransaction(tx) {
        this.transactions.push(tx);
        this.mergeSortByDate(); // MERGE SORT: O(n log n) sorting
    }
    
    // MERGE SORT implementation for efficient date-based sorting
    mergeSortByDate() {
        this.transactions = this._mergeSort(this.transactions);
    }
    
    _mergeSort(arr) {
        if (arr.length <= 1) return arr;
        
        const mid = Math.floor(arr.length / 2);
        const left = this._mergeSort(arr.slice(0, mid));
        const right = this._mergeSort(arr.slice(mid));
        
        return this._merge(left, right);
    }
    
    _merge(left, right) {
        const result = [];
        let i = 0, j = 0;
        
        while (i < left.length && j < right.length) {
            if (new Date(left[i].time) > new Date(right[j].time)) {
                result.push(left[i++]);
            } else {
                result.push(right[j++]);
            }
        }
        
        return result.concat(left.slice(i)).concat(right.slice(j));
    }
    
    // LINEAR SEARCH: O(n) filtering by symbol
    searchBySymbol(symbol) {
        return this.transactions.filter(tx => 
            tx.symbol.includes(symbol.toUpperCase())
        );
    }
}

/**
 * UNDO STACK CLASS - Uses STACK data structure (LIFO)
 * STACK provides O(1) for push and pop operations
 */
class UndoStack {
    constructor() {
        this.stack = []; // STACK: LIFO for undo operations
        this.maxSize = 50;
    }
    
    push(action) {
        this.stack.push(action);
        if (this.stack.length > this.maxSize) {
            this.stack.shift(); // Prevent memory overflow
        }
    }
    
    pop() {
        return this.stack.pop();
    }
    
    isEmpty() {
        return this.stack.length === 0;
    }
    
    size() {
        return this.stack.length;
    }
}

/**
 * ORDER QUEUE CLASS - Uses QUEUE data structure (FIFO)
 * QUEUE provides O(1) for enqueue and dequeue operations
 */
class OrderQueue {
    constructor() {
        this.queue = []; // QUEUE: FIFO for order processing
    }
    
    enqueue(order) {
        this.queue.push(order);
    }
    
    dequeue() {
        return this.queue.shift();
    }
    
    isEmpty() {
        return this.queue.length === 0;
    }
    
    size() {
        return this.queue.length;
    }
}

/**
 * BALANCE HISTORY CLASS - Uses CIRCULAR BUFFER
 * CIRCULAR BUFFER provides fixed-size storage with O(1) operations
 */
class BalanceHistory {
    constructor() {
        this.history = []; // CIRCULAR BUFFER: Fixed size for performance
        this.maxSize = 100;
        this.pointer = 0;
    }
    
    addBalance(balance) {
        if (this.history.length < this.maxSize) {
            this.history.push({
                time: new Date().toLocaleTimeString(),
                value: balance
            });
        } else {
            // Circular buffer behavior - overwrite oldest entry
            this.history[this.pointer] = {
                time: new Date().toLocaleTimeString(),
                value: balance
            };
            this.pointer = (this.pointer + 1) % this.maxSize;
        }
    }
    
    getData() {
        return this.history;
    }
}

/**
 * LEADERBOARD CLASS - Uses HEAP SORT for ranking
 * HEAP SORT provides O(n log n) sorting for efficient ranking
 */
class Leaderboard {
    constructor() {
        this.players = []; // PRIORITY QUEUE simulation using sorted array
    }
    
    addPlayer(name, value) {
        this.players.push({ name, value });
        this.heapSort(); // HEAP SORT: O(n log n) for ranking
    }
    
    // HEAP SORT implementation for efficient ranking
    heapSort() {
        const n = this.players.length;
        
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            this.heapify(n, i);
        }
        
        // Extract elements from heap
        for (let i = n - 1; i > 0; i--) {
            [this.players[0], this.players[i]] = [this.players[i], this.players[0]];
            this.heapify(i, 0);
        }
    }
    
    heapify(n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < n && this.players[left].value > this.players[largest].value) {
            largest = left;
        }
        
        if (right < n && this.players[right].value > this.players[largest].value) {
            largest = right;
        }
        
        if (largest !== i) {
            [this.players[i], this.players[largest]] = [this.players[largest], this.players[i]];
            this.heapify(n, largest);
        }
    }
    
    getRankings() {
        return this.players.map((player, index) => ({
            rank: index + 1,
            ...player
        }));
    }
}

// Initialize global instances
let portfolio = new Portfolio();
let transactionHistory = new TransactionHistory();
let undoStack = new UndoStack();
let orderQueue = new OrderQueue();
let balanceHistory = new BalanceHistory();
let leaderboard = new Leaderboard();

// Realistic stock data with volatility simulation
const STOCK_DATA = {
    'AAPL': { price: 182.63, volatility: 0.02, name: 'Apple Inc.' },
    'GOOGL': { price: 138.21, volatility: 0.018, name: 'Alphabet Inc.' },
    'MSFT': { price: 407.54, volatility: 0.015, name: 'Microsoft Corp.' },
    'TSLA': { price: 234.79, volatility: 0.035, name: 'Tesla Inc.' },
    'AMZN': { price: 174.54, volatility: 0.022, name: 'Amazon.com Inc.' },
    'META': { price: 484.03, volatility: 0.025, name: 'Meta Platforms' },
    'NVDA': { price: 117.16, volatility: 0.045, name: 'NVIDIA Corp.' },
    'NFLX': { price: 612.04, volatility: 0.028, name: 'Netflix Inc.' }
};

// Data persistence functions
function loadData() {
    const saved = localStorage.getItem("stockSimData");
    if (saved) {
        const data = JSON.parse(saved);
        portfolio.cash = data.portfolio.cash;
        portfolio.stocks = new Map(Object.entries(data.portfolio.stocks));
        transactionHistory.transactions = data.transactions || [];
        balanceHistory.history = data.balanceHistory || [];
        
        // Initialize leaderboard with realistic data
        leaderboard.addPlayer("You", portfolio.cash + calculateStockValue());
        leaderboard.addPlayer("Warren Buffett", 1548230);
        leaderboard.addPlayer("Cathie Wood", 892150);
        leaderboard.addPlayer("Ray Dalio", 1234567);
        leaderboard.addPlayer("Michael Burry", 756890);
    } else {
        // Initial setup
        leaderboard.addPlayer("You", 10000);
        leaderboard.addPlayer("Warren Buffett", 1548230);
        leaderboard.addPlayer("Cathie Wood", 892150);
        leaderboard.addPlayer("Ray Dalio", 1234567);
        leaderboard.addPlayer("Michael Burry", 756890);
        saveData();
    }
}

function saveData() {
    const data = {
        portfolio: {
            cash: portfolio.cash,
            stocks: Object.fromEntries(portfolio.stocks)
        },
        transactions: transactionHistory.transactions,
        balanceHistory: balanceHistory.history
    };
    localStorage.setItem("stockSimData", JSON.stringify(data));
}

// Stock price calculation with realistic volatility
function calculateStockValue() {
    let total = 0;
    for (const [symbol, holding] of portfolio.stocks) {
        total += getStockPrice(symbol) * holding.qty;
    }
    return total;
}

function getStockPrice(symbol) {
    const stock = STOCK_DATA[symbol];
    if (!stock) return (Math.random() * 500 + 50).toFixed(2);
    
    // Realistic price movement with volatility simulation
    const change = (Math.random() - 0.5) * 2 * stock.volatility;
    stock.price *= (1 + change);
    stock.price = Math.max(stock.price, 1); // Prevent negative prices
    return stock.price.toFixed(2);
}

function recordBalance() {
    const totalValue = portfolio.cash + calculateStockValue();
    balanceHistory.addBalance(totalValue);
    saveData();
}

// Initialize application on load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    recordBalance();
});