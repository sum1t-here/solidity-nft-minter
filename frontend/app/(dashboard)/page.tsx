'use client';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { isAddressEqual, createPublicClient, http } from 'viem';
import { useRouter } from 'next/navigation';
import MintForm from '@/app/_components/MintForm';
import NFTGallery from '@/app/_components/NFTGallery';
import ConnectWalletPage from '@/app/_components/ConnectWalletPage';
import { contractAddress, contractABI } from '@/utils/contract';
import { sepolia } from 'viem/chains';

interface NFT {
    tokenId: number;
    tokenURI: string;
    image?: string;
    name?: string;
    description?: string;
    eventId: number;
}

export default function Dashboard() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(true);
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [stats, setStats] = useState({
        totalMinted: 0,
        totalClaimed: 0,
        unclaimed: 0,
        claimRate: 0,
    });
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [currentBatch, setCurrentBatch] = useState(0);
    const [totalBatches, setTotalBatches] = useState(0);
    const batchSize = 9; // Process 9 NFTs at a time

    // Check if connected wallet is the contract owner
    const { data: owner } = useReadContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'owner',
    });

    // Effect to check ownership and set loading to false
    useEffect(() => {
        if (isConnected && owner) {
            if (
                typeof owner === 'string' &&
                typeof address === 'string' &&
                owner.startsWith('0x') &&
                address.startsWith('0x')
            ) {
                const isOwner = isAddressEqual(
                    owner as `0x${string}`,
                    address as `0x${string}`,
                );
                setIsOwner(isOwner);
                setLoading(false);
            } else {
                setIsOwner(false);
                setLoading(false);
            }
        }
    }, [owner, address, isConnected]);

    // Fetch NFTs in batches
    useEffect(() => {
        const fetchData = async () => {
            if (!isConnected || !isOwner) return;
            
            try {
                // Get Viem publicClient from Wagmi config
                const viemPublicClient = createPublicClient({
                    chain: sepolia,
                    transport: http(process.env.SEPOLIA_RPC_URL),
                });
                
                // Get basic stats
                const [nextTokenId] = await Promise.all([
                    viemPublicClient.readContract({
                        address: contractAddress,
                        abi: contractABI,
                        functionName: 'nextTokenId',
                    }),
                ]);
                
                const totalTokens = Number(nextTokenId);
                const batches = Math.ceil(totalTokens / batchSize);
                setTotalBatches(batches);
                
                // Initialize stats
                setStats({
                    totalMinted: totalTokens,
                    totalClaimed: 0,
                    unclaimed: 0,
                    claimRate: 0,
                });
                
                // Process tokens in batches
                let processedTokens = 0;
                let unclaimedCount = 0;
                let allNFTs: NFT[] = [];
                
                for (let batch = 0; batch < batches; batch++) {
                    const start = batch * batchSize;
                    const end = Math.min(start + batchSize, totalTokens);
                    
                    const batchPromises = [];
                    for (let i = start; i < end; i++) {
                        batchPromises.push(processToken(viemPublicClient, i));
                    }
                    
                    const batchResults = await Promise.all(batchPromises);
                    
                    // Filter out null results (claimed tokens)
                    const validNFTs = batchResults.filter(nft => nft !== null) as NFT[];
                    allNFTs = [...allNFTs, ...validNFTs];
                    unclaimedCount += validNFTs.length;
                    
                    // Update UI with current batch
                    setNfts(allNFTs);
                    processedTokens += (end - start);
                    setLoadingProgress(Math.round((processedTokens / totalTokens) * 100));
                    setCurrentBatch(batch + 1);
                    
                    // Update stats after each batch
                    const claimedCount = processedTokens - unclaimedCount;
                    const claimRate = processedTokens > 0 ? (claimedCount / processedTokens) * 100 : 0;
                    
                    setStats({
                        totalMinted: totalTokens,
                        totalClaimed: claimedCount,
                        unclaimed: unclaimedCount,
                        claimRate,
                    });
                }
                
                setLoadingProgress(100);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        
        // Process a single token
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processToken = async (client: any, tokenId: number) => {
            try {
                const tokenOwner = await client.readContract({
                    address: contractAddress,
                    abi: contractABI,
                    functionName: 'ownerOf',
                    args: [tokenId],
                });
                
                // Only include tokens owned by the contract (unclaimed)
                if (tokenOwner === contractAddress) {
                    const [tokenURI, eventId] = await Promise.all([
                        client.readContract({
                            address: contractAddress,
                            abi: contractABI,
                            functionName: 'tokenURI',
                            args: [tokenId],
                        }),
                        client.readContract({
                            address: contractAddress,
                            abi: contractABI,
                            functionName: 'tokenToEvent',
                            args: [tokenId],
                        }),
                    ]);
                    
                    // Fetch metadata
                    try {
                        const response = await fetch(
                            tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/'),
                        );
                        const metadata = await response.json();
                        
                        return {
                            tokenId,
                            tokenURI: tokenURI as string,
                            eventId: Number(eventId),
                            image: metadata.image,
                            name: metadata.name,
                            description: metadata.description,
                        };
                    } catch (error) {
                        console.error(`Error fetching metadata for token ${tokenId}:`, error);
                        return {
                            tokenId,
                            tokenURI: tokenURI as string,
                            eventId: Number(eventId),
                        };
                    }
                }
                return null;
            } catch (error) {
                console.error(`Error processing token ${tokenId}:`, error);
                return null;
            }
        };
        
        fetchData();
    }, [isConnected, isOwner]);

    // Show connect wallet page if not connected
    if (!isConnected) {
        return <ConnectWalletPage />;
    }

    // Redirect to claim page if connected but not owner
    if (!loading && !isOwner) {
        router.push('/claim');
        return null;
    }

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Main dashboard
    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    NFT Dashboard
                </h1>
                <p className="mt-2 text-gray-600">
                    Mint NFTs and manage unclaimed tokens
                </p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Total Minted
                    </h3>
                    <p className="text-3xl font-bold text-indigo-600">
                        {stats.totalMinted}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Total Claimed
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                        {stats.totalClaimed}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Unclaimed
                    </h3>
                    <p className="text-3xl font-bold text-yellow-600">
                        {stats.unclaimed}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Claim Rate
                    </h3>
                    <p className="text-3xl font-bold text-purple-600">
                        {stats.claimRate.toFixed(1)}%
                    </p>
                </div>
            </div>
            
            {/* Loading Progress */}
            {loadingProgress > 0 && loadingProgress < 100 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                            Loading NFTs
                        </h3>
                        <span className="text-sm text-gray-500">
                            {loadingProgress}% ({currentBatch}/{totalBatches} batches)
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        Found {nfts.length} unclaimed NFTs so far...
                    </p>
                </div>
            )}
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mint Form */}
                <div className="lg:col-span-1">
                    <MintForm
                        onMintSuccess={() => {
                            // Refresh data after minting
                            window.location.reload();
                        }}
                    />
                </div>
                
                {/* NFT Gallery */}
                <div className="lg:col-span-2">
                    <NFTGallery nfts={nfts} />
                </div>
            </div>
        </div>
    );
}