'use client';
import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { getIPFSUrl } from '@/utils/pinata';
import Image from 'next/image';

interface NFT {
    tokenId: number;
    tokenURI: string;
    image?: string;
    name?: string;
    description?: string;
    eventId: number;
}

interface NFTGalleryProps {
    nfts: NFT[];
}

export default function NFTGallery({ nfts }: NFTGalleryProps) {
    const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
    const [showQR, setShowQR] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const nftsPerPage = 9; // Show 9 NFTs per page (3x3 grid)

    // Calculate pagination values
    const indexOfLastNFT = currentPage * nftsPerPage;
    const indexOfFirstNFT = indexOfLastNFT - nftsPerPage;
    const currentNFTs = nfts.slice(indexOfFirstNFT, indexOfLastNFT);
    const totalPages = Math.ceil(nfts.length / nftsPerPage);

    const handleGenerateQR = (nft: NFT) => {
        setSelectedNFT(nft);
        setShowQR(true);
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        // Scroll to top of gallery when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Previous
                </button>
                
                <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                            // Show current page, first page, last page, and pages adjacent to current
                            return (
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 1
                            );
                        })
                        .map((page, index, array) => {
                            // Add ellipsis if there's a gap
                            if (index > 0 && page - array[index - 1] > 1) {
                                return (
                                    <span key={`ellipsis-${page}`} className="px-2 py-1">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-8 h-8 rounded-full ${
                                        currentPage === page
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                </div>
                
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Next
                </button>
            </div>
        );
    };

    if (nfts.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No NFTs Found
                </h3>
                <p className="text-gray-600">
                    Mint some NFTs to see them here.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Unclaimed NFTs
                </h2>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                        Showing {indexOfFirstNFT + 1}-{Math.min(indexOfLastNFT, nfts.length)} of {nfts.length} NFTs
                    </span>
                    <span className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                    </span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentNFTs.map((nft) => (
                    <div
                        key={nft.tokenId}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                        {nft.image && (
                            <Image
                                width={400}
                                height={300}
                                src={getIPFSUrl(nft.image)}
                                alt={String(nft.name)}
                                className="w-full h-48 object-cover"
                            />
                        )}
                        <div className="p-4">
                            <h3 className="font-medium text-gray-900 truncate">
                                {nft.name || `NFT #${nft.tokenId}`}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Event: {nft.eventId}
                            </p>
                            <p className="text-sm text-gray-600">
                                Token: {nft.tokenId}
                            </p>
                            <button
                                onClick={() => handleGenerateQR(nft)}
                                className="mt-3 w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Generate QR Code
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {renderPagination()}
            
            {/* QR Code Modal */}
            {showQR && selectedNFT && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                QR Code for Claiming
                            </h3>
                            <button
                                onClick={() => setShowQR(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="text-center mb-4">
                            {selectedNFT.image && (
                                <Image
                                    width={128}
                                    height={128}
                                    src={getIPFSUrl(selectedNFT.image)}
                                    alt={String(selectedNFT.name)}
                                    className="w-32 h-32 object-cover mx-auto rounded-lg mb-4"
                                />
                            )}
                            <h4 className="font-medium text-gray-900">
                                {selectedNFT.name ||
                                    `NFT #${selectedNFT.tokenId}`}
                            </h4>
                            <QRCodeCanvas
                                value={`${window.location.origin}/claim?eventId=${selectedNFT.eventId}&tokenId=${selectedNFT.tokenId}`}
                                size={200}
                                className="mx-auto mt-4"
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">
                                Scan this QR code to claim the NFT
                            </p>
                            <p className="text-xs text-gray-500">
                                Event ID: {selectedNFT.eventId}
                            </p>
                            <p className="text-xs text-gray-500">
                                Token ID: {selectedNFT.tokenId}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}