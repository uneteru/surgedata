import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import contractAbi from '../ContractAbi.json';

interface TokenData {
    name: string;
    price: string;
    marketCap: string;
    circulatingSupply: string;
    liquidity: string;
}

const TokenInfo: React.FC = () => {
    const [tokenData, setTokenData] = useState<TokenData>({
        name: '',
        price: '',
        marketCap: '',
        circulatingSupply: '',
        liquidity: ''
    });
    const [error, setError] = useState<string>('');

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

    useEffect(() => {
        const fetchTokenData = async () => {
            try {
                const web3 = new Web3('https://bsc-dataseed4.ninicoin.io');
                const tokenAddress = '0x43C3EBaFdF32909aC60E80ee34aE46637E743d65';
                const contract = new web3.eth.Contract(contractAbi as any, tokenAddress);
                
                // Get total transactions
                const totalTx = await contract.methods.totalTx().call();
                console.log('Total transactions:', totalTx);

                // Loop through transactions and get candlestick data
                for(let i = 0; i < totalTx && i < 10; i++) {
                    const timestamp = await contract.methods.txTimeStamp(i).call();
                    console.log('Transaction timestamp', i, ':', timestamp);
                    
                    const candleData = await contract.methods.candleStickData(timestamp).call();
                    console.log('CandleStick Data for timestamp', timestamp, ':', candleData);
                }

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
                    marketCap: formatPrice(marketCap),
                    circulatingSupply,
                    liquidity
                });
            } catch (err) {
                setError('Error fetching token data: ' + (err as Error).message);
            }
        };

        fetchTokenData();
    }, []);

    return (
        <div className="token-analytics">
            <h2>Token Analytics</h2>
            
            <div className="info-row">
                <div className="info-label">Name</div>
                <div className="info-value">{tokenData.name || 'Loading...'}</div>
            </div>

            <div className="info-row">
                <div className="info-label">Price</div>
                <div className="info-value bnb">
                    {tokenData.price ? formatNumber(tokenData.price) : 'Loading...'}
                </div>
            </div>

            <div className="info-row">
                <div className="info-label">Market Cap</div>
                <div className="info-value">
                    ${tokenData.marketCap ? formatNumber(tokenData.marketCap) : 'Loading...'}
                </div>
            </div>

            <div className="info-row">
                <div className="info-label">Circulating Supply</div>
                <div className="info-value">
                    {tokenData.circulatingSupply ? formatNumber(tokenData.circulatingSupply) : 'Loading...'}
                </div>
            </div>

            <div className="info-row">
                <div className="info-label">Liquidity</div>
                <div className="info-value">
                    ${tokenData.liquidity ? formatNumber(tokenData.liquidity) : 'Loading...'}
                </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default TokenInfo;
