"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

export default function Navbar() {
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo / Title */}
        <h1 className="text-2xl font-bold text-indigo-600 tracking-wide">
          MintHub
        </h1>

        {/* Wallet Connect */}
        <div className="flex items-center space-x-4">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div className="flex items-center">
                  {!connected ? (
                    <button
                      onClick={openConnectModal}
                      className="px-5 py-2 rounded-2xl bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition"
                    >
                      Connect Wallet
                    </button>
                  ) : chain.unsupported ? (
                    <button
                      onClick={openChainModal}
                      className="px-4 py-2 rounded-xl bg-red-500 text-white font-medium shadow hover:bg-red-600 transition"
                    >
                      Wrong Network
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={openChainModal}
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        {chain.hasIcon && (
                          <span
                            className="w-4 h-4"
                            style={{ backgroundImage: `url(${chain.iconUrl})`, backgroundSize: "cover" }}
                          />
                        )}
                        <span className="text-sm font-medium">{chain.name}</span>
                      </button>

                      <button
                        onClick={openAccountModal}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition"
                      >
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ""}
                      </button>
                    </div>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}
