const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = 'https://bronze-calm-goat-716.mypinata.cloud/ipfs/';

if (!PINATA_JWT) {
    throw new Error('PINATA_JWT is not defined in environment variables');
}

export const uploadToPinata = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${PINATA_JWT}`,
                },
                body: formData,
            },
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to upload file to Pinata');
        }
        return `ipfs://${data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw error;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uploadJSONToPinata = async (json: any): Promise<string> => {
    try {
        const response = await fetch(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${PINATA_JWT}`,
                },
                body: JSON.stringify(json),
            },
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to upload JSON to Pinata');
        }
        return `ipfs://${data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading JSON to Pinata:', error);
        throw error;
    }
};

export const getIPFSUrl = (ipfsUri: string): string => {
    if (!ipfsUri) return '';

    // Convert ipfs:// to Pinata gateway URL
    if (ipfsUri.startsWith('ipfs://')) {
        const hash = ipfsUri.replace('ipfs://', '');
        return `${PINATA_GATEWAY}${hash}`;
    }

    // If it's already a URL, return as is
    return ipfsUri;
};
