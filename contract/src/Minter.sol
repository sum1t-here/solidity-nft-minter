// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Proof of Attendance NFT
 * @author Sumit Mazumdar
 * @dev An ERC721 token for proof of attendance with individual metadata and batch minting
 * The contract owner can mint multiple NFTs in a batch, each with their own token URI.
 * User can claim these NFTs using claim codes
 */
contract Minter is ERC721, Ownable {

    // Errors
    error Minter__ArrayLengthMismatch();
    error Minter__EmptyArray();
    error Minter__CodeAlreadyUsed();
    error Minter__InvalidCode();
    error Minter__AlreadyClaimed();
    error Minter__AlreadyClaimedOnce();

    // mapping to track if a claim code has been used per event
    mapping(uint256 => mapping(string => bool)) public claimedCodes;

    // mapping from tokenId to token URI
    mapping(uint256 => string) private _tokenURIs;

    // mapping from claim code to token Id
    mapping(uint256 => mapping(string => uint256)) public codeToTokenId;

    // mapping from eventId to tokenId
    mapping(uint256 => uint256) public tokenToEvent;

    // mapping to check which wallet has claimed for each event
    mapping(uint256 => mapping(address => bool)) hasClaimed;

    // track event Ids
    uint256 public currentEventId;

    // counter for tokenId
    uint256 public nextTokenId;

    event BatchMinter(uint256 indexed evenId, uint256[] tokenIds, string[] codes);
    event NFTClaimed(uint256 indexed eventId, uint256 indexed tokenId, address indexed claimant, string code);

    /**
     * @dev constructor sets the name and symbol of the token
     * @param name The name of the token
     * @param symbol The name of the symbol
     */
    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {}

    /**
     * @dev Only the owner can call this function and batch mint nfts
     * @param eventId The Id of the event for which the nft is to be minted
     * @param codes The claim code associated with the NFT
     * @param tokenURIs The URI associated with the NFT
     */
    function batchMintWithCode(uint256 eventId, string[] memory codes, string[] memory tokenURIs) external onlyOwner {
        currentEventId = eventId;

        if (codes.length != tokenURIs.length) {
            revert Minter__ArrayLengthMismatch();
        }

        if (codes.length == 0) {
            revert Minter__EmptyArray();
        }

        uint256[] memory tokenIds = new uint256[](codes.length);

        for (uint256 i = 0; i < codes.length; i++) {
            if (claimedCodes[eventId][codes[i]]) revert Minter__CodeAlreadyUsed();

            uint256 tokenId = nextTokenId;
            _mint(address(this), tokenId);

            // set the tokenURI
            _tokenURIs[tokenId] = tokenURIs[i];

            // record the code as used and map it to the token Id for this event
            claimedCodes[eventId][codes[i]] = true;
            codeToTokenId[eventId][codes[i]] = tokenId;

            tokenToEvent[tokenId] = eventId;

            tokenIds[i] = tokenId;
            nextTokenId++;
        }

        emit BatchMinter(eventId, tokenIds, codes);
    }

    /**
     * @dev Users can claim only one nft per event
     * @param eventId The ID of the event for which the NFT is being claimed
     * @param code The claim code associated with the NFT
     * @param recipient The address to receive the NFT
     */
    function claim(uint256 eventId, string memory code, address recipient) external {
        if (!claimedCodes[eventId][code]) revert Minter__InvalidCode();
        if (hasClaimed[eventId][recipient]) revert Minter__AlreadyClaimedOnce();

        uint256 tokenId = codeToTokenId[eventId][code];

        // check if still held by contract (not already claimed)
        if (ownerOf(tokenId) != address(this)) {
            revert Minter__AlreadyClaimed();
        }

        // mark the wallet as claimed
        hasClaimed[eventId][recipient] = true;

        _transfer(address(this), recipient, tokenId);

        emit NFTClaimed(eventId, tokenId, recipient, code);
    }

    /**
     * @dev Returns the URI associated with a given tokenId.
     * @param tokenId The ID of the token whose URI is being queried.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    /**
     * @dev Sets a new URI for the specified tokenId.
     * @param tokenId The ID of the token to update.
     * @param newTokenURI The new URI to assign to the token.
     */
    function setTokenURI(uint256 tokenId, string memory newTokenURI) external onlyOwner {
        _requireOwned(tokenId);
        _tokenURIs[tokenId] = newTokenURI;
    }

    /**
     * @dev Returns the current event ID.
     */
    function nextEventId() external view returns (uint256) {
        return currentEventId;
    }
}
