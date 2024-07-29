"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CONTRACT_ABI } from "@/abi";

declare const ethers: any;
declare global {
    interface Window {
        ethereum?: any;
    }
}

const DEFAULT_SYMBOL = "RENT";
const AdSpaceRentalDApp = () => {
    const [provider, setProvider] = useState<any>(null);
    const [signer, setSigner] = useState<any>(null);
    const [contract, setContract] = useState<any>(null);
    const [account, setAccount] = useState("");
    const [balance, setBalance] = useState("");
    const [tokenInfo, setTokenInfo] = useState({
        name: "Rent Me",
        symbol: DEFAULT_SYMBOL,
        totalSupply: "0"
    });
    const [adSpaceInfo, setAdSpaceInfo] = useState({
        isRented: false,
        daysToWait: 0,
        fee: "0"
    });
    const [rentSymbol, setRentSymbol] = useState("");
    const [rentDuration, setRentDuration] = useState("");
    const [rentMessage, setRentMessage] = useState("");
    const [quoteAmount, setQuoteAmount] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [networkError, setNetworkError] = useState("");
    const [payWithTokens, setPayWithTokens] = useState(false);

    const CONTRACT_ADDRESS = "0x5B9a01C6FCd8a516B1791E3d0508385565C2b6f7";
    const NETWORK_ID = 11155111; // Sepolia network ID

    useEffect(() => {
        const loadEthers = async () => {
            try {
                const script = document.createElement("script");
                script.src =
                    "https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js";
                script.async = true;
                script.onload = init;
                document.body.appendChild(script);
            } catch (error) {
                console.error("Error loading ethers:", error);
                setNetworkError(
                    "Failed to load essential libraries. Please check your internet connection."
                );
                setIsLoading(false);
            }
        };

        loadEthers();
    }, []);

    const loadTokenInfo = async (contract: any) => {
        try {
            let name = await contract.name();
            let symbol = await contract.symbol();
            const totalSupply = await contract.totalSupply();
            if (name === "" || symbol === "") {
                name = "This Coin For Rent";
                symbol = DEFAULT_SYMBOL;
            }

            setTokenInfo({
                name,
                symbol,
                totalSupply: ethers.utils.formatEther(totalSupply)
            });
        } catch (error) {
            console.error("Error loading token info:", error);
            setNetworkError(
                "Error loading token information. Please check the contract address."
            );
        }
    };

    const loadAdSpaceInfo = async (contract: any) => {
        try {
            const isRented = await contract.isRentedNow();
            const nextAvailableDay = await contract.nextAvailableDay();
            const today = await contract.getDayFromTimestamp(
                Math.floor(new Date().getTime() / 1000)
            );
            const daysToWait =
                (nextAvailableDay.toNumber() - today) / (60 * 60 * 24);

            const fee = await contract.fee();
            setAdSpaceInfo({
                isRented,
                daysToWait,
                fee: ethers.utils.formatEther(fee)
            });
        } catch (error) {
            console.error("Error loading ad space info:", error);
            setNetworkError(
                "Error loading ad space information. Please check the contract address."
            );
        }
    };

    const init = async () => {
        try {
            if (typeof window.ethereum !== "undefined") {
                const metaMaskProvider = new ethers.providers.Web3Provider(
                    window.ethereum
                );
                setProvider(metaMaskProvider);
                const network = await metaMaskProvider.getNetwork();
                if (network.chainId !== NETWORK_ID) {
                    setNetworkError(
                        "Please connect to the Sepolia testnet in MetaMask."
                    );
                    setIsLoading(false);
                    return;
                }
                const metaMaskContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    CONTRACT_ABI,
                    metaMaskProvider
                );
                setContract(metaMaskContract);
                await Promise.all([
                    loadTokenInfo(metaMaskContract),
                    loadAdSpaceInfo(metaMaskContract)
                ]);
            } else {
                setNetworkError(
                    "MetaMask is not installed. Please install it to use this dApp."
                );
            }
        } catch (error) {
            console.error("Initialization error:", error);
            setNetworkError(
                "Failed to initialize. Please make sure MetaMask is installed and connected to Sepolia."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const connectMetaMask = async () => {
        debugger;
        if (typeof window.ethereum !== "undefined") {
            try {
                await window.ethereum.request({
                    method: "eth_requestAccounts"
                });
                const metaMaskProvider = new ethers.providers.Web3Provider(
                    window.ethereum
                );

                const network = await metaMaskProvider.getNetwork();
                if (network.chainId !== NETWORK_ID) {
                    setNetworkError(
                        "Please connect to the Sepolia testnet in MetaMask."
                    );
                    return;
                }

                const metaMaskSigner = metaMaskProvider.getSigner();
                const address = await metaMaskSigner.getAddress();

                setProvider(metaMaskProvider);
                setSigner(metaMaskSigner);
                setAccount(address);
                setNetworkError("");

                const metaMaskContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    CONTRACT_ABI,
                    metaMaskSigner
                );
                setContract(metaMaskContract);

                const balance = await metaMaskContract.balanceOf(address);
                setBalance(ethers.utils.formatEther(balance));
            } catch (error) {
                console.error("Failed to connect to MetaMask:", error);
                setNetworkError(
                    "Failed to connect to MetaMask. Please make sure it's installed and unlocked."
                );
            }
        } else {
            setNetworkError(
                "MetaMask is not installed. Please install it to use this dApp."
            );
        }
    };

    const handleQuote = async () => {
        if (contract && rentDuration) {
            try {
                const quote = payWithTokens
                    ? await contract.tokenQuote(rentDuration)
                    : await contract.quote(rentDuration);
                setQuoteAmount(ethers.utils.formatEther(quote));
            } catch (error) {
                console.error("Error getting quote:", error);
                setNetworkError(
                    "Failed to get quote. Please check your connection and try again."
                );
            }
        }
    };

    const handleRentAdSpace = async () => {
        if (contract && signer && rentDuration && rentSymbol && rentMessage) {
            try {
                let tx;
                if (payWithTokens) {
                    tx = await contract.rentAdSpaceNowWithTokens(
                        rentDuration,
                        rentSymbol,
                        rentMessage
                    );
                } else {
                    const quote = await contract.quote(rentDuration);
                    tx = await contract.rentAdSpaceNow(
                        rentDuration,
                        rentSymbol,
                        rentMessage,
                        { value: quote }
                    );
                }
                await tx.wait();
                await loadAdSpaceInfo(contract);
            } catch (error) {
                console.error("Error renting ad space:", error);
                setNetworkError(
                    "Failed to rent ad space. Please check your connection and try again."
                );
            }
        } else {
            setNetworkError(
                "Please connect to MetaMask and fill in all fields."
            );
        }
    };

    if (isLoading) {
        return (
            <div className="container-main flex items-center justify-center">
                <div className="container-main flex items-center justify-center">
                    <p className="loading-indicator">
                        Loading<span className="loading-ellipsis"></span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-main">
            <h1 className="heading-primary">{tokenInfo.symbol}</h1>
            <h2 className="heading-secondary">{tokenInfo.name}</h2>
            {/* <OldSchoolTicker
                items={[CONTRACT_ADDRESS, tokenInfo.symbol, tokenInfo.name]}
            /> */}
            <p className="text-center mb-4">
                Change the token name and symbol in the contract to sell your
                message.
            </p>

            {networkError && (
                <div className="error-message">{networkError}</div>
            )}

            <div>
                <Card className="card-primary">
                    <CardContent className="card-content text-center">
                        {adSpaceInfo.isRented ? (
                            <h2 className="heading-accent">Ad Space RENTED</h2>
                        ) : (
                            <h2 className="heading-accent text-flash flash-amber">
                                Ad Space AVAILABLE
                            </h2>
                        )}
                        <p className="mb-2">
                            <span className="font-semibold">
                                Next slot available:
                            </span>{" "}
                            {nextAvailable(adSpaceInfo.daysToWait)}
                        </p>
                        <p>
                            <span className="font-semibold">Base Fee:</span>{" "}
                            {adSpaceInfo.fee} ETH
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="card-quaternary mt-8">
                <CardContent className="card-content text-center">
                    <h2 className="heading-accent">Rent Next Slot</h2>
                    <Input
                        className="input-primary"
                        placeholder="Duration (in days)"
                        value={rentDuration}
                        onChange={e => setRentDuration(e.target.value)}
                    />
                    <Input
                        className="input-primary"
                        placeholder="Token Symbol"
                        value={rentSymbol}
                        onChange={e => setRentSymbol(e.target.value)}
                    />
                    <Input
                        className="input-primary"
                        placeholder="Ad Message"
                        value={rentMessage}
                        onChange={e => setRentMessage(e.target.value)}
                    />
                    <Checkbox
                        id="payWithTokens"
                        checked={payWithTokens}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setPayWithTokens(e.target.checked)
                        }
                        disabled={adSpaceInfo.isRented}
                        label={`Pay with ${tokenInfo.symbol} (Only available if currently unrented)`}
                    />
                    <div className="flex space-x-4 mt-4">
                        <Button
                            onClick={handleQuote}
                            className="btn-primary flex-1"
                        >
                            Get Quote
                        </Button>
                        <Button
                            onClick={handleRentAdSpace}
                            disabled={!signer || !rentDuration || !rentMessage}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Rent Ad Space
                        </Button>
                    </div>
                    {quoteAmount && (
                        <p className="heading-accent mt-4">
                            Quote: {quoteAmount}{" "}
                            {payWithTokens ? tokenInfo.symbol : "ETH"}
                        </p>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8 text-center">
                {account ? (
                    <>
                        <p className="mb-2">
                            <span className="font-semibold">
                                Connected to wallet{" "}
                            </span>
                            <span>{account}</span>
                        </p>
                        <p className="mb-2">
                            <span className="font-semibold">Balance:</span>{" "}
                            {balance} {tokenInfo.symbol}
                        </p>
                    </>
                ) : (
                    <Button className="btn-primary" onClick={connectMetaMask}>
                        Connect MetaMask
                    </Button>
                )}
                <p>
                    Contract:{" "}
                    <a href="https://sepolia.etherscan.io/address/0x574637eA3d48Ae16255620164f06f0d435982c8e">
                        {CONTRACT_ADDRESS}
                    </a>
                </p>
            </div>
        </div>
    );
};

function nextAvailable(day: number) {
    if (day === 0) {
        return "Today";
    }
    if (day === 1) {
        return "Tomorrow";
    }
    return `In ${day} days`;
}

export default AdSpaceRentalDApp;
