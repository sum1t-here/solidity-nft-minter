export const contractAddress = '0xD39959f9f9b9e81D0AD3DC4dde0b94Eda7B57ED5';
export const contractABI = [
    {
        type: 'constructor',
        inputs: [
            {
                name: 'name',
                type: 'string',
                internalType: 'string',
            },
            {
                name: 'symbol',
                type: 'string',
                internalType: 'string',
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'approve',
        inputs: [
            {
                name: 'to',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [
            {
                name: 'owner',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'batchMintWithCode',
        inputs: [
            {
                name: 'eventId',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'codes',
                type: 'string[]',
                internalType: 'string[]',
            },
            {
                name: 'tokenURIs',
                type: 'string[]',
                internalType: 'string[]',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'claim',
        inputs: [
            {
                name: 'eventId',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'code',
                type: 'string',
                internalType: 'string',
            },
            {
                name: 'recipient',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'claimedCodes',
        inputs: [
            {
                name: '',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: '',
                type: 'string',
                internalType: 'string',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bool',
                internalType: 'bool',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'codeToTokenId',
        inputs: [
            {
                name: '',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: '',
                type: 'string',
                internalType: 'string',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'currentEventId',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getApproved',
        inputs: [
            {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'isApprovedForAll',
        inputs: [
            {
                name: 'owner',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'operator',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bool',
                internalType: 'bool',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'name',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'string',
                internalType: 'string',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'nextEventId',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'nextTokenId',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'owner',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'ownerOf',
        inputs: [
            {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'renounceOwnership',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'safeTransferFrom',
        inputs: [
            {
                name: 'from',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'to',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'safeTransferFrom',
        inputs: [
            {
                name: 'from',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'to',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'data',
                type: 'bytes',
                internalType: 'bytes',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'setApprovalForAll',
        inputs: [
            {
                name: 'operator',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'approved',
                type: 'bool',
                internalType: 'bool',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'setTokenURI',
        inputs: [
            {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'newTokenURI',
                type: 'string',
                internalType: 'string',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'supportsInterface',
        inputs: [
            {
                name: 'interfaceId',
                type: 'bytes4',
                internalType: 'bytes4',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bool',
                internalType: 'bool',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'symbol',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'string',
                internalType: 'string',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'tokenToEvent',
        inputs: [
            {
                name: '',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'tokenURI',
        inputs: [
            {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'string',
                internalType: 'string',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'transferFrom',
        inputs: [
            {
                name: 'from',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'to',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'transferOwnership',
        inputs: [
            {
                name: 'newOwner',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        name: 'Approval',
        inputs: [
            {
                name: 'owner',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'approved',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'tokenId',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'ApprovalForAll',
        inputs: [
            {
                name: 'owner',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'operator',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'approved',
                type: 'bool',
                indexed: false,
                internalType: 'bool',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'BatchMinter',
        inputs: [
            {
                name: 'evenId',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256',
            },
            {
                name: 'tokenIds',
                type: 'uint256[]',
                indexed: false,
                internalType: 'uint256[]',
            },
            {
                name: 'codes',
                type: 'string[]',
                indexed: false,
                internalType: 'string[]',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'NFTClaimed',
        inputs: [
            {
                name: 'eventId',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256',
            },
            {
                name: 'tokenId',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256',
            },
            {
                name: 'claimant',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'code',
                type: 'string',
                indexed: false,
                internalType: 'string',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'OwnershipTransferred',
        inputs: [
            {
                name: 'previousOwner',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'newOwner',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'Transfer',
        inputs: [
            {
                name: 'from',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'to',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'tokenId',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256',
            },
        ],
        anonymous: false,
    },
    {
        type: 'error',
        name: 'ERC721IncorrectOwner',
        inputs: [
            {
                name: 'sender',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'owner',
                type: 'address',
                internalType: 'address',
            },
        ],
    },
    {
        type: 'error',
        name: 'ERC721InsufficientApproval',
        inputs: [
            {
                name: 'operator',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
    },
    {
        type: 'error',
        name: 'ERC721InvalidApprover',
        inputs: [
            {
                name: 'approver',
                type: 'address',
                internalType: 'address',
            },
        ],
    },
    {
        type: 'error',
        name: 'ERC721InvalidOperator',
        inputs: [
            {
                name: 'operator',
                type: 'address',
                internalType: 'address',
            },
        ],
    },
    {
        type: 'error',
        name: 'ERC721InvalidOwner',
        inputs: [
            {
                name: 'owner',
                type: 'address',
                internalType: 'address',
            },
        ],
    },
    {
        type: 'error',
        name: 'ERC721InvalidReceiver',
        inputs: [
            {
                name: 'receiver',
                type: 'address',
                internalType: 'address',
            },
        ],
    },
    {
        type: 'error',
        name: 'ERC721InvalidSender',
        inputs: [
            {
                name: 'sender',
                type: 'address',
                internalType: 'address',
            },
        ],
    },
    {
        type: 'error',
        name: 'ERC721NonexistentToken',
        inputs: [
            {
                name: 'tokenId',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
    },
    {
        type: 'error',
        name: 'Minter__AlreadyClaimed',
        inputs: [],
    },
    {
        type: 'error',
        name: 'Minter__AlreadyClaimedOnce',
        inputs: [],
    },
    {
        type: 'error',
        name: 'Minter__ArrayLengthMismatch',
        inputs: [],
    },
    {
        type: 'error',
        name: 'Minter__CodeAlreadyUsed',
        inputs: [],
    },
    {
        type: 'error',
        name: 'Minter__EmptyArray',
        inputs: [],
    },
    {
        type: 'error',
        name: 'Minter__InvalidCode',
        inputs: [],
    },
    {
        type: 'error',
        name: 'OwnableInvalidOwner',
        inputs: [
            {
                name: 'owner',
                type: 'address',
                internalType: 'address',
            },
        ],
    },
    {
        type: 'error',
        name: 'OwnableUnauthorizedAccount',
        inputs: [
            {
                name: 'account',
                type: 'address',
                internalType: 'address',
            },
        ],
    },
];
