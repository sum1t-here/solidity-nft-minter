'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ConnectWalletPage() {
    const { isConnected, address } = useAccount();

    // If wallet is connected and has address, redirect to dashboard
    useEffect(() => {
        if (isConnected && address) {
            // You can redirect to dashboard or check if they're the owner first
            // For now, we'll redirect to dashboard
            window.location.href = '/dashboard';
        }
    }, [isConnected, address]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Logo/Branding */}
                <div className="text-center">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                            <svg
                                className="h-8 w-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
                        NFT MINTER
                    </h2>
                    <p className="mt-2 text-lg text-gray-600">
                        Create and distribute Proof of Attendance NFTs
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    <div className="text-center">
                        <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                            <svg
                                className="h-12 w-12 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V7a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                                />
                            </svg>
                        </div>
                    </div>


                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            By connecting your wallet, you agree to our{' '}
                            <Link
                                href="/terms"
                                className="text-indigo-600 hover:text-indigo-500"
                            >
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link
                                href="/privacy"
                                className="text-indigo-600 hover:text-indigo-500"
                            >
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Features/Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'Gasless',
                            desc: 'Enjoy seamless transactions without worrying about gas fees.',
                            icon: (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2-3-.895-3-2z"
                                />
                            ),
                        },
                        {
                            title: 'Secure',
                            desc: 'Your assets and data are protected with top-grade security.',
                            icon: (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V7a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                                />
                            ),
                        },
                        {
                            title: 'Fast',
                            desc: 'Experience lightning-speed transactions anytime, anywhere.',
                            icon: (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            ),
                        },
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-200 flex items-center justify-center shadow-sm">
                                <svg
                                    className="h-6 w-6 text-indigo-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    {feature.icon}
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">
                                {feature.title}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        New to crypto?{' '}
                        <Link
                            href="#"
                            className="text-indigo-600 hover:text-indigo-500"
                        >
                            Learn more about wallets
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
