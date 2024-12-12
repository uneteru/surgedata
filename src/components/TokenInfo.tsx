import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import contractAbi from '../ContractAbi.json';
import PriceChart from './PriceChart.tsx';

const RPC_URL = 'https://bsc-dataseed4.ninicoin.io';
const pancakeSwapContract = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const USDTokenAddress = "0x55d398326f99059fF775485246999027B3197955";
const SRGTokenAddress = "0x9f19c8e321bd14345b797d43e01f0eed030f5bff";

const pancakeSwapAbi = [
    {
        inputs: [
            { name: "amountIn", type: "uint256" },
            { name: "path", type: "address[]" }
        ],
        name: "getAmountsOut",
        outputs: [{ name: "amounts", type: "uint256[]" }],
        stateMutability: "view",
        type: "function"
    }
];

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
    const [bnbPrice, setBnbPrice] = useState<string>('0');
    const [srgPrice, setSrgPrice] = useState<string>('0');
    const [isBnbLoading, setIsBnbLoading] = useState<boolean>(true);
    const [isSrgLoading, setIsSrgLoading] = useState<boolean>(true);
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
        const web3 = new Web3(RPC_URL);
        return web3.utils.fromWei(priceInWei, 'ether');
    };

    const formatCandlePrice = (price: string): string => {
        const num = parseFloat(price) / (10 ** 45);
        return num.toString();
    };

    const formatTimestamp = (timestamp: string): string => {
        return new Date(Number(timestamp) * 1000).toLocaleString('en-US');
    };

    const setDecimals = (number: number, decimals: number) => {
        const numberStr = number.toString();
        const numberAbs = numberStr.split('.')[0];
        let numberDecimals = numberStr.split('.')[1] || '';
        while (numberDecimals.length < decimals) {
            numberDecimals += '0';
        }
        const finalNumber = numberAbs + numberDecimals;
        return finalNumber;
    };

    const calcSell = async (tokensToSell: number, tokenAddress: string) => {
        const web3 = new Web3(RPC_URL);
        const tokenRouter = new web3.eth.Contract(contractAbi as any, tokenAddress);
        const tokenDecimals = await tokenRouter.methods.decimals().call();
        tokensToSell = setDecimals(tokensToSell, tokenDecimals);

        try {
            const router = new web3.eth.Contract(pancakeSwapAbi, pancakeSwapContract);
            const amountOut = await router.methods
                .getAmountsOut(tokensToSell.toString(), [tokenAddress, BNBTokenAddress])
                .call();
            return web3.utils.fromWei(amountOut[1], 'ether');
        } catch (error) {
            console.error("Error in calcSell:", error);
            return 0;
        }
    };

    const calcBNBPrice = async () => {
        const bnbToSell = Web3.utils.toWei("1", "ether");
        
        try {
            const web3 = new Web3(RPC_URL);
            const router = new web3.eth.Contract(pancakeSwapAbi, pancakeSwapContract);
            const amountOut = await router.methods
                .getAmountsOut(bnbToSell, [BNBTokenAddress, USDTokenAddress])
                .call();
            return Web3.utils.fromWei(amountOut[1], 'ether');
        } catch (error) {
            console.error("Error in calcBNBPrice:", error);
            return '0';
        }
    };

    const calcSRGPrice = async (bnbPrice: string) => {
        const tokensToSell = 1;
        try {
            const priceInBnb = await calcSell(tokensToSell, SRGTokenAddress);
            const priceInUSD = (Number(priceInBnb) * Number(bnbPrice)).toFixed(8);
            return priceInUSD;
        } catch (error) {
            console.error("Error calculating SRG price:", error);
            return '0';
        }
    };

    const fetchPrices = async () => {
        try {
            setIsBnbLoading(true);
            setIsSrgLoading(true);
            
            const bnbPriceValue = await calcBNBPrice();
            setBnbPrice(bnbPriceValue);
            
            const srgPriceValue = await calcSRGPrice(bnbPriceValue);
            setSrgPrice(srgPriceValue);
        } catch (error) {
            console.error("Error fetching prices:", error);
            setBnbPrice('0');
            setSrgPrice('0');
        } finally {
            setIsBnbLoading(false);
            setIsSrgLoading(false);
        }
    };

    const fetchTokenData = async () => {
        setIsLoading(true);
        setError('');

        try {
            const web3 = new Web3(RPC_URL);
            const contract = new web3.eth.Contract(contractAbi as any, contractAddress);
            
            // Get total transactions
            const totalTx = await contract.methods.totalTx().call();

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

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

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
                        <span className="value">{tokenData.price} SRG</span>
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
                    <div className="chart-container">
                        <PriceChart priceHistory={priceHistory} />
                    </div>
                </div>
            )}
            
            <div className="bnb-price-container">
                {isBnbLoading ? (
                    <>
                        <div className="bnb-price-loading"></div>
                        <span>Loading BNB Price...</span>
                    </>
                ) : (
                    <>
                        <span>BNB/USD:</span>
                        <span className="bnb-price-value">${Number(bnbPrice).toFixed(2)}</span>
                    </>
                )}
            </div>
            <div className="bnb-price-container" style={{ left: '200px' }}>
                {isSrgLoading ? (
                    <>
                        <div className="bnb-price-loading"></div>
                        <span>Loading SRG Price...</span>
                    </>
                ) : (
                    <>
                        <span>SRG/USD:</span>
                        <span className="bnb-price-value">${Number(srgPrice).toFixed(8)}</span>
                    </>
                )}
            </div>
            <div className="attribution">
                generated by uneteru
            </div>
        </div>
    );
};

export default TokenInfo;
