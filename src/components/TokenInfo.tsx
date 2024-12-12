import React, { useState } from 'react';
import Web3 from 'web3';
import contractAbi from '../ContractAbi.json';

interface TokenData {
    name: string;
    price: string;
    marketCap: string;
    circulatingSupply: string;
    liquidity: string;
}

interface PriceHistoryData {
    date: string;
    price: number;
}

const TokenInfo: React.FC = () => {
    const [tokenData, setTokenData] = useState<TokenData>({
        name: '',
        price: '',
        marketCap: '',
        circulatingSupply: '',
        liquidity: ''
    });
    const [priceHistory, setPriceHistory] = useState<Array<PriceHistoryData>>([]);
    const [error, setError] = useState<string>('');
    const [contractAddress, setContractAddress] = useState<string>('0x43C3EBaFdF32909aC60E80ee34aE46637E743d65');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataFetched, setDataFetched] = useState<boolean>(false);

    const formatNumber = (value: string): string => {
        const num = parseFloat(value);
        if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    };

    const formatPrice = (priceInWei: string): string => {
        const web3 = new Web3('https://bsc-dataseed4.ninicoin.io');
        return web3.utils.fromWei(priceInWei, 'ether');
    };

    const formatCandlePrice = (price: string): string => {
        const num = parseFloat(price) / (10 ** 45);
        return num.toString();
    };

    const formatTimestamp = (timestamp: string): string => {
        return new Date(Number(timestamp) * 1000).toLocaleString('en-US');
    };

    const fetchTokenData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const web3 = new Web3('https://bsc-dataseed4.ninicoin.io');
            const contract = new web3.eth.Contract(contractAbi as any, contractAddress);
            
            // Get total transactions
            const totalTx = await contract.methods.totalTx().call();
            console.log('Total transactions:', totalTx);

            // Loop through transactions and get candlestick data
            const newPriceHistory = [];
            for(let i = 0; i < totalTx && i < 10; i++) {
                const timestamp = await contract.methods.txTimeStamp(i).call();
                const candleData = await contract.methods.candleStickData(timestamp).call();
                
                newPriceHistory.push({
                    date: formatTimestamp(candleData.time),
                    price: parseFloat(formatCandlePrice(candleData.close))
                });
            }
            
            setPriceHistory(newPriceHistory);
            console.log('Price History:', newPriceHistory);

            const [name, price, marketCap, circulatingSupply, liquidity] = await Promise.all([
                contract.methods.name().call(),
                contract.methods.getSRGPrice().call(),
                contract.methods.getMarketCap().call(),
                contract.methods.getCirculatingSupply().call(),
                contract.methods.getLiquidity().call()
            ]);

            setTokenData({
                name,
                price: formatPrice(price),
                marketCap: formatNumber(marketCap),
                circulatingSupply: formatNumber(circulatingSupply),
                liquidity: formatNumber(liquidity)
            });
            setDataFetched(true);
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching token data');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="token-info matrix-theme">
            <div className="input-section">
                <input
                    type="text"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="Enter contract address"
                    className="matrix-input"
                />
                <button
                    onClick={fetchTokenData}
                    disabled={isLoading || !contractAddress}
                    className="matrix-button"
                >
                    {isLoading ? 'Loading...' : 'Fetch Data'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Fetching token data...</p>
                </div>
            )}

            {!isLoading && dataFetched && (
                <div className="token-details matrix-data">
                    <h2 className="glow">{tokenData.name}</h2>
                    <div className="data-row">
                        <span className="label">Price:</span>
                        <span className="value">{tokenData.price} BNB</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Market Cap:</span>
                        <span className="value">${tokenData.marketCap}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Circulating Supply:</span>
                        <span className="value">{tokenData.circulatingSupply}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Liquidity:</span>
                        <span className="value">${tokenData.liquidity}</span>
                    </div>
                </div>
            )}
            
            <div className="attribution">
                generated by uneteru
            </div>
        </div>
    );
};

export default TokenInfo;
