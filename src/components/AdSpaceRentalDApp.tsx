"use client"; 

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

declare const ethers: any;
declare global {
    interface Window {
      ethereum?: any;
    }
  }

const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"duration","type":"uint256"},{"indexed":false,"internalType":"string","name":"message","type":"string"}],"name":"AdSpacePurchased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentDay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_timestamp","type":"uint256"}],"name":"getDayFromTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"_day","type":"uint256"}],"name":"getStartTimestampForDay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"day","type":"uint256"}],"name":"isRented","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isRentedNow","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextAvailableDay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"duration","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"start","type":"uint256"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"string","name":"message","type":"string"}],"name":"rentAdSpace","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"string","name":"message","type":"string"}],"name":"rentAdSpaceNow","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
const DEFAULT_SYMBOL = 'RENT';
const AdSpaceRentalDApp = () => {
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [tokenInfo, setTokenInfo] = useState({ name: 'Rent Me', symbol: DEFAULT_SYMBOL, totalSupply: '' });
  const [adSpaceInfo, setAdSpaceInfo] = useState({ isRented: false, nextAvailableDay: 0, fee: '0' });
  const [rentSymbol, setRentSymbol] = useState('');
  const [rentDuration, setRentDuration] = useState('');
  const [rentMessage, setRentMessage] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState('');

  const CONTRACT_ADDRESS = '0x574637eA3d48Ae16255620164f06f0d435982c8e';
  const NETWORK_ID = 11155111; // Sepolia network ID

  useEffect(() => {
    const loadEthers = async () => {
        debugger;
        console.log('loadEthers');
      try {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js';
        script.async = true;
        script.onload = init;
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading ethers:', error);
        setNetworkError('Failed to load essential libraries. Please check your internet connection.');
        setIsLoading(false);
      }
    };

    loadEthers();
  }, []);

  const loadTokenInfo = async (contract: any) => {
    try {
      const name = await contract.name();
      const symbol = await contract.symbol();
      const totalSupply = await contract.totalSupply();
      setTokenInfo({ name, symbol, totalSupply: ethers.utils.formatEther(totalSupply) });
    } catch (error) {
      console.error('Error loading token info:', error);
      setNetworkError('Error loading token information. Please check the contract address.');
    }
  };

  const loadAdSpaceInfo = async (contract: any) => {
    try {
      const isRented = await contract.isRentedNow();
      const nextAvailableDay = await contract.nextAvailableDay();
      const fee = await contract.fee();
      setAdSpaceInfo({ isRented, nextAvailableDay: nextAvailableDay.toNumber(), fee: ethers.utils.formatEther(fee) });
    } catch (error) {
      console.error('Error loading ad space info:', error);
      setNetworkError('Error loading ad space information. Please check the contract address.');
    }
  };

  const init = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const metaMaskProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(metaMaskProvider);
        const network = await metaMaskProvider.getNetwork();
        if (network.chainId !== NETWORK_ID) {
          setNetworkError('Please connect to the Sepolia testnet in MetaMask.');
          setIsLoading(false);
          return;
        }
        const metaMaskContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, metaMaskProvider);
        setContract(metaMaskContract);
        await Promise.all([
            loadTokenInfo(metaMaskContract),
            loadAdSpaceInfo(metaMaskContract)
        ])
      } else {
        setNetworkError('MetaMask is not installed. Please install it to use this dApp.');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      setNetworkError('Failed to initialize. Please make sure MetaMask is installed and connected to Sepolia.');
    } finally {
      setIsLoading(false);
    }
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const metaMaskProvider = new ethers.providers.Web3Provider(window.ethereum);
        
        const network = await metaMaskProvider.getNetwork();
        if (network.chainId !== NETWORK_ID) {
          setNetworkError('Please connect to the Sepolia testnet in MetaMask.');
          return;
        }

        const metaMaskSigner = metaMaskProvider.getSigner();
        const address = await metaMaskSigner.getAddress();
        
        setProvider(metaMaskProvider);
        setSigner(metaMaskSigner);
        setAccount(address);
        setNetworkError('');
        
        const metaMaskContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, metaMaskSigner);
        setContract(metaMaskContract);
        
        const balance = await metaMaskContract.balanceOf(address);
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error('Failed to connect to MetaMask:', error);
        setNetworkError('Failed to connect to MetaMask. Please make sure it\'s installed and unlocked.');
      }
    } else {
      setNetworkError('MetaMask is not installed. Please install it to use this dApp.');
    }
  };

  const handleQuote = async () => {
    if (contract && rentDuration) {
      try {
        const quote = await contract.quote(rentDuration);
        setQuoteAmount(ethers.utils.formatEther(quote));
      } catch (error) {
        console.error('Error getting quote:', error);
        setNetworkError('Failed to get quote. Please check your connection and try again.');
      }
    }
  };

  const handleRentAdSpace = async () => {
    if (contract && signer && rentDuration && rentSymbol && rentMessage) {
      try {
        const quote = await contract.quote(rentDuration);
        const tx = await contract.rentAdSpaceNow(rentDuration, rentSymbol, rentMessage, { value: quote });
        await tx.wait();
        await loadAdSpaceInfo(contract);
      } catch (error) {
        console.error('Error renting ad space:', error);
        setNetworkError('Failed to rent ad space. Please check your connection and try again.');
      }
    } else {
      setNetworkError('Please connect to MetaMask and fill in all fields.');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-cyan-300">
      <p className="text-2xl">Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-cyan-300 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        Rent-a-coin
      </h1>
      
      {networkError && (
        <div className="mb-4 p-4 bg-red-800 text-white rounded-lg">
          {networkError}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-cyan-500 border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50">
          <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold">Token Information</CardHeader>
          <CardContent className="p-4">
            <p className="mb-2"><span className="font-semibold">Name:</span> {tokenInfo.name}</p>
            <p className="mb-2"><span className="font-semibold">Symbol:</span> {tokenInfo.symbol}</p>
            <p className="mb-2"><span className="font-semibold">Total Supply:</span> {tokenInfo.totalSupply} {tokenInfo.symbol}</p>
            <p className="mb-2"><span className="font-semibold">Contract:</span> 
              <span className="text-xs break-all">{CONTRACT_ADDRESS}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-purple-500 border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">Ad Space Information</CardHeader>
          <CardContent className="p-4">
            <p className="mb-2"><span className="font-semibold">Currently Rented:</span> 
              <span className={adSpaceInfo.isRented ? "text-green-400" : "text-red-400"}>
                {adSpaceInfo.isRented ? "Yes" : "No"}
              </span>
            </p>
            <p className="mb-2"><span className="font-semibold">Next Available Day:</span> {adSpaceInfo.nextAvailableDay}</p>
            <p className="mb-2"><span className="font-semibold">Base Fee:</span> {adSpaceInfo.fee} ETH</p>
          </CardContent>
        </Card>
      </div>
    {!account && (


      <Card className="mt-8 bg-gray-800 border-green-500 border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50">
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold">Wallet Connection</CardHeader>
        <CardContent className="p-4">
          {account ? (
            <div>
              <p className="mb-2"><span className="font-semibold">Connected:</span> 
                <span className="text-xs break-all">{account}</span>
              </p>
              <p className="mb-2"><span className="font-semibold">Balance:</span> {balance} {tokenInfo.symbol}</p>
            </div>
          ) : (
            <Button onClick={connectMetaMask} 
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105">
              Connect MetaMask
            </Button>
          )}
        </CardContent>
      </Card>
          )}

      <Card className="mt-8 bg-gray-800 border-yellow-500 border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/50">
        <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold">Rent Ad Space</CardHeader>
        <CardContent className="p-4">
          <Input 
            className="mb-4 bg-gray-700 text-white border-gray-600 focus:border-yellow-500 rounded-full"
            placeholder="Duration (in days)" 
            value={rentDuration}
            onChange={(e) => setRentDuration(e.target.value)}
          />
          <Input
            className="mb-4 bg-gray-700 text-white border-gray-600 focus:border-yellow-500 rounded-full"
            placeholder="Token Symbol" 
            value={rentSymbol}
            onChange={(e) => setRentSymbol(e.target.value)}
            />
          <Input 
            className="mb-4 bg-gray-700 text-white border-gray-600 focus:border-yellow-500 rounded-full"
            placeholder="Ad Message" 
            value={rentMessage}
            onChange={(e) => setRentMessage(e.target.value)}
          />
          <div className="flex space-x-4">
            <Button onClick={handleQuote} 
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105">
              Get Quote
            </Button>
            <Button onClick={handleRentAdSpace} disabled={!signer || !rentDuration || !rentMessage}
              className="flex-1 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              Rent Ad Space
            </Button>
          </div>
          {quoteAmount && (
            <p className="mt-4 text-center text-xl font-bold text-yellow-400">
              Quote: {quoteAmount} ETH
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdSpaceRentalDApp;