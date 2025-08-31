import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  base,
  mainnet,
  sepolia,
  anvil
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
  chains: [
    mainnet,
    sepolia,
    base,
    anvil,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});
