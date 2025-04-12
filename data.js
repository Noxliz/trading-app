const tradingData = {
    stocks: [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 185.25, change: 1.25 },
        { symbol: 'MSFT', name: 'Microsoft', price: 420.72, change: -2.18 },
        { symbol: 'GOOGL', name: 'Alphabet', price: 150.45, change: 0.75 },
        { symbol: 'AMZN', name: 'Amazon', price: 175.89, change: -1.32 }
    ],
    crypto: [
        { symbol: 'BTC', name: 'Bitcoin', price: 42500, change: 2.5 },
        { symbol: 'ETH', name: 'Ethereum', price: 2250, change: -1.2 },
        { symbol: 'SOL', name: 'Solana', price: 102.5, change: 5.3 },
        { symbol: 'ADA', name: 'Cardano', price: 0.52, change: -0.8 }
    ]
};

// Portfolio starts empty
let portfolio = [];

// Generate random price fluctuations
function updatePrices() {
    tradingData.stocks.forEach(stock => {
        const fluctuation = (Math.random() * 2 - 1) * 0.5;
        stock.price = parseFloat((stock.price * (1 + fluctuation / 100)).toFixed(2));
        stock.change = parseFloat(fluctuation.toFixed(2));
    });

    tradingData.crypto.forEach(crypto => {
        const fluctuation = (Math.random() * 3 - 1.5) * 0.5;
        crypto.price = parseFloat((crypto.price * (1 + fluctuation / 100)).toFixed(2));
        crypto.change = parseFloat(fluctuation.toFixed(2));
    });

    setTimeout(updatePrices, 5000); // Update every 5 seconds
}

// Start price updates
updatePrices();
