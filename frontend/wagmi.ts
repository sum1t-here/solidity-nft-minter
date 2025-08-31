// wagmi.ts
import { createConfig, http } from 'wagmi';
import { base, mainnet, sepolia } from 'wagmi/chains';
import { rainbowWallet } from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';

// Define the Anvil chain
const anvil = {
    id: 31337,
    name: 'Anvil',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['http://127.0.0.1:8545'] },
    },
} as const;

export const config = createConfig({
    connectors: connectorsForWallets(
        [
            {
                groupName: 'Recommended',
                wallets: [rainbowWallet],
            },
        ],
        {
            projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
            appName: 'test',
        },
    ),
    chains: [mainnet, sepolia, base, anvil],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(process.env.SEPOLIA_RPC_URL),
        [base.id]: http('https://mainnet.base.org'),
        [anvil.id]: http('http://127.0.0.1:8545'),
    },
    ssr: true,
});
