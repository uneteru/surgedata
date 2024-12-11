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
                    marketCap: formatNumber(web3.utils.fromWei(marketCap, 'ether')),
                    circulatingSupply: formatNumber(web3.utils.fromWei(circulatingSupply, 'ether')),
                    liquidity: formatNumber(web3.utils.fromWei(liquidity, 'ether'))
                });
            } catch (err) {
                setError('Error fetching token data: ' + (err as Error).message);
            }
        };

        fetchTokenData();
    }, []);

    if (error) {
        return (
            <div className="text-cyber-pink font-mono p-4 border border-cyber-pink rounded">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cyber-darker font-mono">
            <div className="cyber-box p-8 w-full max-w-2xl backdrop-blur-sm">
                <h2 className="text-3xl font-bold mb-8 text-center text-cyber-pink border-b border-cyber-blue pb-4">
                    Token Analytics
                </h2>
                <div className="grid gap-6">
                    <div className="cyber-box p-4 hover:shadow-neon-pink transition-shadow duration-300">
                        <div className="text-sm text-cyber-blue opacity-80">Name</div>
                        <div className="cyber-value text-xl">{tokenData.name || 'Loading...'}</div>
                    </div>
                    
                    <div className="cyber-box p-4 hover:shadow-neon-pink transition-shadow duration-300">
                        <div className="text-sm text-cyber-blue opacity-80">Price</div>
                        <div className="cyber-value text-xl">{tokenData.price || 'Loading...'} BNB</div>
                    </div>
                    
                    <div className="cyber-box p-4 hover:shadow-neon-pink transition-shadow duration-300">
                        <div className="text-sm text-cyber-blue opacity-80">Market Cap</div>
                        <div className="cyber-value text-xl">${tokenData.marketCap || 'Loading...'}</div>
                    </div>
                    
                    <div className="cyber-box p-4 hover:shadow-neon-pink transition-shadow duration-300">
                        <div className="text-sm text-cyber-blue opacity-80">Circulating Supply</div>
                        <div className="cyber-value text-xl">{tokenData.circulatingSupply || 'Loading...'}</div>
                    </div>
                    
                    <div className="cyber-box p-4 hover:shadow-neon-pink transition-shadow duration-300">
                        <div className="text-sm text-cyber-blue opacity-80">Liquidity</div>
                        <div className="cyber-value text-xl">${tokenData.liquidity || 'Loading...'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TokenInfo;
