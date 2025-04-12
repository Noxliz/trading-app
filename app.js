// DOM Elements
const assetTypeSelect = document.getElementById('asset-type');
const priceChartCtx = document.getElementById('price-chart').getContext('2d');
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
const assetSelect = document.getElementById('asset-select');
const priceDisplay = document.getElementById('price');
const priceChangeDisplay = document.getElementById('price-change');
const tradeAmountInput = document.getElementById('trade-amount');
const buyButton = document.getElementById('buy-btn');
const sellButton = document.getElementById('sell-btn');
const portfolioItems = document.getElementById('portfolio-items');

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
    const assets = tradingData[assetTypeSelect.value];
    const selectedAsset = assets.find(a => a.symbol === assetSelect.value);
    
    if (selectedAsset) {
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
        alert('Please enter a valid amount');
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
            alert('Not enough assets to sell');
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

// Update portfolio display
function updatePortfolioDisplay() {
    portfolioItems.innerHTML = '';
    
    if (portfolio.length === 0) {
        portfolioItems.innerHTML = '<p>Your portfolio is empty</p>';
        return;
    }

    portfolio.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'portfolio-item';
        itemElement.innerHTML = `
            <h3>${item.name} (${item.symbol})</h3>
            <p>Amount: ${item.amount.toFixed(4)}</p>
            <p>Value: $${item.totalValue.toFixed(2)}</p>
        `;
        portfolioItems.appendChild(itemElement);
    });
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
