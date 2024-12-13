import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import contractAbi from '../ContractAbi.json';
import PriceChart from './PriceChart.tsx';
import VolumeChart from './VolumeChart.tsx';

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

interface VolumeHistoryData {
    date: string;
    volume: number;
}

interface CacheData {
    timestamp: number;
    priceHistory: PriceHistoryData[];
    volumeHistory: VolumeHistoryData[];
    tokenData: TokenData;
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
    const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
    const [volumeHistory, setVolumeHistory] = useState<VolumeHistoryData[]>([]);
    const [error, setError] = useState<string>('');
    const [contractAddress, setContractAddress] = useState<string>('0x43C3EBaFdF32909aC60E80ee34aE46637E743d65');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataFetched, setDataFetched] = useState<boolean>(false);
    const [progress, setProgress] = useState<string>('');

    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    const clearCache = () => {
        localStorage.removeItem(`token_data_${contractAddress}`);
        setDataFetched(false);
        // Refetch data after clearing cache
        fetchTokenData();
    };

    const formatNumber = (value: string): string => {
        const num = parseFloat(value);
        if (num >= 1e9) {
            return (num / 1e9).toFixed(0);
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(0);
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(0);
        }
        return num.toFixed(0);
    };

    const formatMcap = (value: string): string => {
        const num = parseFloat(value);
        if (num >= 1e9) {
            return (num / 1e9).toFixed(0);
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(0);
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(0);
        }
        return num.toFixed(0);
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

    const getCachedData = (address: string): CacheData | null => {
        const cached = localStorage.getItem(`token_data_${address}`);
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is expired (24 hours)
        if (now - data.timestamp > CACHE_DURATION) {
            localStorage.removeItem(`token_data_${address}`);
            return null;
        }
        
        return data;
    };

    const setCachedData = (address: string, priceHistory: PriceHistoryData[], volumeHistory: VolumeHistoryData[], tokenData: TokenData) => {
        const cacheData: CacheData = {
            timestamp: Date.now(),
            priceHistory,
            volumeHistory,
            tokenData
        };
        localStorage.setItem(`token_data_${address}`, JSON.stringify(cacheData));
    };

    const fetchTokenData = async () => {
        setIsLoading(true);
        setError('');
        setProgress('');

        try {
            // Check cache first
            const cachedData = getCachedData(contractAddress);
            if (cachedData) {
                setPriceHistory(cachedData.priceHistory);
                setVolumeHistory(cachedData.volumeHistory);

                setTokenData(cachedData.tokenData);
                setDataFetched(true);
                setIsLoading(false);
                console.log(cachedData.priceHistory)// Create hourly price array
                if (cachedData.priceHistory.length > 0) {
                    const startTime = new Date(cachedData.priceHistory[0].date);
                    const endTime = new Date(cachedData.priceHistory[cachedData.priceHistory.length - 1].date);
                    const hourlyPrices = [];
                    
                    for (let currentTime = startTime; currentTime <= endTime; currentTime.setHours(currentTime.getHours() + 1)) {
                        // Find the last price before or at this time
                        const lastPrice = cachedData.priceHistory.findLast(
                            entry => new Date(entry.date) <= currentTime
                        );
                        
                        if (lastPrice) {
                            hourlyPrices.push({
                                date: currentTime.toISOString(),
                                price: lastPrice.price
                            });
                        }
                    }
                    console.log('Hourly prices:', hourlyPrices);
                }
                console.log(cachedData.volumeHistory)   
                return;
            }

            const web3 = new Web3(RPC_URL);
            const contract = new web3.eth.Contract(contractAbi as any, contractAddress);
            
            // Get Last Price
            const totalTx = await contract.methods.totalTx().call();
            const lastTime = await contract.methods.txTimeStamp(totalTx).call();
            const lastCandle = await contract.methods.candleStickData(lastTime).call();
            const circulatingSupply = await contract.methods.getCirculatingSupply().call();

            // Loop through transactions and get candlestick data
            const newPriceHistory = [];
            const newVolumeHistory = [];
            for(let i = 1; i <= totalTx; i++) {
                setProgress(`${i} / ${totalTx}`);
                const timestamp = await contract.methods.txTimeStamp(i).call();
                const candleData = await contract.methods.candleStickData(timestamp).call();
                let txVolume = await contract.methods.tVol(timestamp).call();
                // Format date with hours for price history
                const fullDate = new Date(Number(timestamp) * 1000);
                const priceDate = fullDate.toLocaleString('en-US');
                // Keep daily format for volume
                const volumeDate = fullDate.toLocaleDateString('en-US');
                const closePrice = Number(candleData.close) / (10 ** 45);
                // Adjust volume scaling to make it more visible
                txVolume = Number(txVolume) / (10 ** 18);

                // Handle volume history (keep daily)
                const existingVolumeEntry = newVolumeHistory.find(entry => entry.date === volumeDate);
                if (existingVolumeEntry) {
                    existingVolumeEntry.volume += txVolume;
                } else {
                    newVolumeHistory.push({
                        date: volumeDate,
                        volume: txVolume,
                    });
                }

                // Add hourly price entry (no aggregation needed)
                newPriceHistory.push({
                    date: priceDate,
                    price: closePrice,
                });
            }

            // Sort price history by date
            newPriceHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            setPriceHistory(newPriceHistory);
            setVolumeHistory(newVolumeHistory);

            console.log(newPriceHistory);
            console.log(newVolumeHistory);

            const tokenPrice = Number(lastCandle.close) / (10 ** 45);
            const tokenMarketCap = tokenPrice * Number(circulatingSupply);

            const [name, symbol, price, marketCap, circulSup, liquidity] = await Promise.all([
                contract.methods.name().call(),
                contract.methods.symbol().call(),
                tokenPrice,
                tokenMarketCap,
                contract.methods.getCirculatingSupply().call(),
                contract.methods.getLiquidity().call()
            ]);

            const newTokenData = {
                name,
                symbol: symbol,
                price: price.toFixed(6),
                circulatingSupply: formatNumber(circulatingSupply),
                marketCap: formatNumber(marketCap),
                liquidity: formatNumber(liquidity)
            };

            console.log(newTokenData.marketCap)
            setTokenData(newTokenData);
            setDataFetched(true);

            // Cache the fetched data
            setCachedData(contractAddress, newPriceHistory, newVolumeHistory, newTokenData);
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
                    {isLoading ? `Loading... ${progress}` : 'Fetch Data'}
                </button>
                <button
                    onClick={clearCache}
                    disabled={isLoading || !contractAddress || !dataFetched}
                    className="matrix-button"
                    style={{ marginLeft: '10px' }}
                >
                    Clear Cache
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
                    <h2 className="glow">{tokenData.name} - {tokenData.symbol}</h2>
                    <div className="data-row">
                        <span className="label">Price:</span>
                        <span className="value">{tokenData.price} SRG</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Market Cap:</span>
                        <span className="value">{tokenData.marketCap} SRG</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Circulating Supply:</span>
                        <span className="value">{tokenData.circulatingSupply}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Liquidity:</span>
                        <span className="value">{tokenData.liquidity}</span>
                    </div>
                    <div className="chart-container" style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        width: '100%',
                        marginTop: '20px'
                    }}>
                        <div style={{ height: '400px', width: '100%' }}>
                            <PriceChart priceHistory={priceHistory} />
                        </div>
                        <div style={{ height: '300px', width: '100%' }}>
                            <VolumeChart volumeHistory={volumeHistory} />
                        </div>
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
