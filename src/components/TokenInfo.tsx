import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import contractAbi from '../ContractAbi.json';

const TokenInfo: React.FC = () => {
    const [tokenName, setTokenName] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchTokenName = async () => {
            try {
                const web3 = new Web3('https://bsc-dataseed4.ninicoin.io');
                const tokenAddress = '0x43C3EBaFdF32909aC60E80ee34aE46637E743d65';
                const contract = new web3.eth.Contract(contractAbi as any, tokenAddress);
                
                const name = await contract.methods.name().call();
                setTokenName(name);
            } catch (err) {
                setError('Error fetching token name: ' + (err as Error).message);
            }
        };

        fetchTokenName();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Token Information</h2>
            <p>Name: {tokenName || 'Loading...'}</p>
        </div>
    );
};

export default TokenInfo;
