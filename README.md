# Surge Token Interface

A modern, Matrix-themed interface for tracking and analyzing Surge tokens on the Binance Smart Chain (BSC). This application provides real-time price tracking, token metrics, and interactive visualizations for SRG20 tokens.

## Features

- **Real-time Price Tracking**
  - Live BNB/USD price updates
  - SRG token price in USD
  - Automatic price refreshing every 30 seconds

- **Token Analytics**
  - Market Cap
  - Circulating Supply
  - Liquidity Information
  - Transaction History

- **Interactive Price Chart**
  - Historical price visualization
  - Transaction-based price data
  - Matrix-themed styling

- **Matrix-Inspired Design**
  - Animated digital rain background
  - Green-on-black color scheme
  - Sleek, modern UI elements
  - Responsive layout

## Technology Stack

- React with TypeScript
- Web3.js for blockchain interaction
- Chart.js for data visualization
- PancakeSwap integration for price feeds

## Smart Contract Integration

The interface connects to:
- PancakeSwap Router: `0x10ED43C718714eb63d5aA57B78B54704E256024E`
- BNB Token: `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c`
- USDT Token: `0x55d398326f99059fF775485246999027B3197955`
- SRG Token: `0x9f19c8e321bd14345b797d43e01f0eed030f5bff`

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/my-surge.git
```

2. Install dependencies:
```bash
cd my-surge
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. The interface automatically fetches and displays current BNB and SRG prices
2. Enter a token contract address to view detailed token information
3. View historical price data in the interactive chart
4. All prices auto-refresh every 30 seconds

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Matrix digital rain animation inspired by the Matrix film series
- Price feed data provided by PancakeSwap
- Built with love by the Surge community

## Contact

For questions and support, please open an issue in the GitHub repository.
