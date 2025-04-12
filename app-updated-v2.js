// DOM Elements
const assetTypeSelect = document.getElementById('asset-type');
const assetSelect = document.getElementById('asset-select');
const priceDisplay = document.getElementById('price');
const priceChangeDisplay = document.getElementById('price-change');
const tradeAmountInput = document.getElementById('trade-amount');
const buyButton = document.getElementById('buy-btn');
const sellButton = document.getElementById('sell-btn');
const portfolioItems = document.getElementById('portfolio-items');
const priceChartCtx = document.getElementById('price-chart').getContext('2d');

// Notification setup
const notification = document.createElement('div');
notification.className = 'notification';
document.body.appendChild(notification);

// Chart configuration
const priceChart = new Chart(priceChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Price History',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Transaction history
let transactionHistory = [];

// Show notification
function showNotification(message, isSuccess = true) {
    notification.textContent = message;
    notification.style.backgroundColor = isSuccess ? '#4CAF50' : '#F44336';
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Initialize the app
function init() {
    populateAssetSelect();
    assetTypeSelect.addEventListener('change', populateAssetSelect);
    assetSelect.addEventListener('change', updatePriceDisplay);
    buyButton.addEventListener('click', executeTrade.bind(null, 'buy'));
    sellButton.addEventListener('click', executeTrade.bind(null, 'sell'));
    
    // Update prices every second
    setInterval(updatePriceDisplay, 1000);
    updatePortfolioDisplay();
}

// Populate asset dropdown based on selected type
function populateAssetSelect() {
    assetSelect.innerHTML = '';
    const assets = tradingData[assetTypeSelect.value];
    
    assets.forEach(asset => {
        const option = document.createElement('option');
        option.value = asset.symbol;
        option.textContent = `${asset.symbol} - ${asset.name}`;
        assetSelect.appendChild(option);
    });
    
    updatePriceDisplay();
}

// Update price display for selected asset
function updatePriceDisplay() {
    // Update chart data
    if (priceChart.data.labels.length > 10) {
        priceChart.data.labels.shift();
        priceChart.data.datasets[0].data.shift();
    }
    
    const assets = tradingData[assetTypeSelect.value];
    const selectedAsset = assets.find(a => a.symbol === assetSelect.value);
    
    if (selectedAsset) {
        priceChart.data.labels.push(new Date().toLocaleTimeString());
        priceChart.data.datasets[0].data.push(selectedAsset.price);
        priceChart.update();
        
        priceDisplay.textContent = selectedAsset.price.toFixed(2);
        priceChangeDisplay.textContent = `${selectedAsset.change > 0 ? '+' : ''}${selectedAsset.change.toFixed(2)}%`;
        priceChangeDisplay.className = selectedAsset.change >= 0 ? 'positive' : 'negative';
    }
}

// Execute trade (buy or sell)
function executeTrade(action) {
    const transactionTime = new Date().toLocaleTimeString();
    const amount = parseFloat(tradeAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        showNotification('Veuillez entrer un montant valide', false);
        return;
    }

    const assets = tradingData[assetTypeSelect.value];
    const selectedAsset = assets.find(a => a.symbol === assetSelect.value);
    const totalValue = amount * selectedAsset.price;

    if (action === 'buy') {
        // Add to portfolio
        const existingItem = portfolio.find(item => item.symbol === selectedAsset.symbol);
        if (existingItem) {
            existingItem.amount += amount;
            existingItem.totalValue += totalValue;
        } else {
            portfolio.push({
                symbol: selectedAsset.symbol,
                name: selectedAsset.name,
                amount: amount,
                totalValue: totalValue
            });
        }
        showNotification(`Achat réussi: ${amount} ${selectedAsset.symbol} pour $${totalValue.toFixed(2)}`);
        transactionHistory.push({
            type: 'buy',
            symbol: selectedAsset.symbol,
            amount: amount,
            price: selectedAsset.price,
            total: totalValue,
            time: transactionTime
        });
    } else {
        // Sell from portfolio
        const existingItem = portfolio.find(item => item.symbol === selectedAsset.symbol);
        if (!existingItem || existingItem.amount < amount) {
            showNotification('Pas assez d\'actifs à vendre', false);
            return;
        }

        existingItem.amount -= amount;
        existingItem.totalValue -= totalValue;
        
        // Remove if amount reaches zero
        if (existingItem.amount <= 0) {
            portfolio = portfolio.filter(item => item.symbol !== selectedAsset.symbol);
        }
        
        showNotification(`Vente réussie: ${amount} ${selectedAsset.symbol} pour $${totalValue.toFixed(2)}`);
        transactionHistory.push({
            type: 'sell',
            symbol: selectedAsset.symbol,
            amount: amount,
            price: selectedAsset.price,
            total: totalValue,
            time: transactionTime
        });
    }

    updatePortfolioDisplay();
    tradeAmountInput.value = '';
}

// Performance chart setup
const performanceChartCtx = document.getElementById('performance-chart').getContext('2d');
const performanceChart = new Chart(performanceChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Valeur du portefeuille',
            data: [],
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Update portfolio value history
function updatePortfolioValue() {
    const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
    
    if (performanceChart.data.labels.length > 10) {
        performanceChart.data.labels.shift();
        performanceChart.data.datasets[0].data.shift();
    }
    
    performanceChart.data.labels.push(new Date().toLocaleTimeString());
    performanceChart.data.datasets[0].data.push(totalValue);
    performanceChart.update();
    
    // Update risk meter
    updateRiskMeter();
}

// Calculate and display risk level
function updateRiskMeter() {
    const riskMeter = document.getElementById('risk-meter');
    const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
    
    if (totalValue === 0) {
        riskMeter.style.width = '0%';
        return;
    }
    
    const riskLevel = Math.min(100, Math.max(0, portfolio.length * 10 + 
        (transactionHistory.length > 5 ? 20 : 0)));
    riskMeter.style.width = `${riskLevel}%`;
    riskMeter.textContent = `${riskLevel}%`;
}

// Update both portfolio display and analytics
function updatePortfolioDisplay() {
    portfolioItems.innerHTML = '';
    
    if (portfolio.length === 0) {
        portfolioItems.innerHTML = '<p>Votre portefeuille est vide</p>';
        updatePortfolioValue();
        return;
    }

    portfolio.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'portfolio-item';
        itemElement.innerHTML = `
            <h3>${item.name} (${item.symbol})</h3>
            <p>Quantité: ${item.amount.toFixed(4)}</p>
            <p>Valeur: $${item.totalValue.toFixed(2)}</p>
        `;
        portfolioItems.appendChild(itemElement);
    });
    
    updatePortfolioValue();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
