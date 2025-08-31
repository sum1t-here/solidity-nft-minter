import React, { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { contractAddress, contractABI } from '@/utils/contract';
import { uploadJSONToPinata, uploadToPinata } from '@/utils/pinata';

interface MintFormProps {
    onMintSuccess: () => void;
}

function generateCode(length = 5) {
    const charSet =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
        result += charSet[values[i] % charSet.length];
    }
    return result;
}

export default function MintForm({ onMintSuccess }: MintFormProps) {
    const { data: hash, writeContract } = useWriteContract();
    const [eventId, setEventId] = useState('1');
    const [image, setImage] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isMinting, setIsMinting] = useState(false);
    const [tokenURI, setTokenURI] = useState('');
    const [codes, setCodes] = useState<string[]>([]);
    const [numNFTs, setNumNFTs] = useState(1);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleGenerateCodes = () => {
        const newCodes = [];
        for (let i = 0; i < numNFTs; i++) {
            newCodes.push(generateCode(5));
        }
        setCodes(newCodes);
    };

    const handleSetMetadata = async () => {
        if (!image || !name || !description) {
            alert('Please provide image, name, and description');
            return;
        }
        setIsMinting(true);
        try {
            // Show upload progress
            setUploadProgress(10);
            // Upload image to Pinata
            const imageURI = await uploadToPinata(image);
            setUploadProgress(50);
            // Create metadata
            const metadata = {
                name,
                description,
                image: imageURI,
                attributes: [
                    {
                        trait_type: 'Event ID',
                        value: eventId,
                    },
                ],
            };
            // Upload metadata to Pinata
            const metadataURI = await uploadJSONToPinata(metadata);
            setUploadProgress(90);
            setTokenURI(metadataURI);
            setUploadProgress(100);
            alert('Metadata uploaded successfully!');
        } catch (error) {
            console.error('Error setting metadata:', error);
            alert('Failed to upload metadata. Please try again.');
        } finally {
            setIsMinting(false);
            setUploadProgress(0);
        }
    };

    const handleMint = async () => {
        if (!tokenURI || codes.length === 0) {
            alert('Please complete all steps before minting.');
            return;
        }
        setIsMinting(true);
        try {
            // Create array of token URIs (all the same)
            const tokenURIs = Array(codes.length).fill(tokenURI);
            
            const tx = await writeContract({
                address: contractAddress,
                abi: contractABI,
                functionName: 'batchMintWithCode',
                args: [BigInt(eventId), codes, tokenURIs],
            });
            
            alert(`Transaction sent!\n\nHash: ${tx}`);
            alert(
                `✅ NFT minted successfully!\n\n` +
                    `Transaction Hash: ${hash}\n`,
            );
            alert(`${codes.length} NFTs minted successfully!`);
            onMintSuccess();
            // Reset form
            setImage(null);
            setName('');
            setDescription('');
            setTokenURI('');
            setCodes([]);
            setNumNFTs(1);
        } catch (error) {
            console.error('Minting failed:', error);
            alert('Minting failed. Please try again.');
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Mint Multiple NFTs
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event ID
                    </label>
                    <input
                        type="text"
                        value={eventId}
                        onChange={(e) => setEventId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter event ID"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of NFTs to Mint
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={numNFTs}
                        onChange={(e) => setNumNFTs(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Image (Same for all NFTs)
                    </label>
                    <input
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {image && (
                        <p className="mt-2 text-sm text-gray-600">
                            Selected: {image.name} (
                            {(image.size / 1024).toFixed(2)} KB)
                        </p>
                    )}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name (Same for all NFTs)
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter NFT name"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Same for all NFTs)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter NFT description"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Claim Codes
                    </label>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={handleGenerateCodes}
                            disabled={numNFTs < 1}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                        >
                            Generate {numNFTs} Code{numNFTs !== 1 ? 's' : ''}
                        </button>
                    </div>
                    {codes.length > 0 && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-md">
                            <p className="text-sm text-blue-800">
                                Generated {codes.length} claim code{codes.length !== 1 ? 's' : ''}:
                            </p>
                            <div className="mt-1 grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                {codes.map((code, index) => (
                                    <div key={index} className="text-xs bg-white p-2 rounded border border-blue-200 break-all">
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <button
                    onClick={handleSetMetadata}
                    disabled={!image || !name || !description || isMinting}
                    className="w-full px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isMinting ? 'Uploading to IPFS...' : 'Upload to IPFS'}
                </button>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                )}
                
                {tokenURI && (
                    <div className="p-3 bg-green-50 rounded-md">
                        <p className="text-sm text-green-800">
                            ✓ Metadata uploaded to IPFS successfully!
                        </p>
                        <p className="text-xs text-green-600 mt-1 break-all">
                            {tokenURI}
                        </p>
                    </div>
                )}
                
                <button
                    onClick={handleMint}
                    disabled={isMinting || !tokenURI || codes.length === 0}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isMinting ? 'Minting...' : `Mint ${codes.length} NFT${codes.length !== 1 ? 's' : ''}`}
                </button>
            </div>
        </div>
    );
}