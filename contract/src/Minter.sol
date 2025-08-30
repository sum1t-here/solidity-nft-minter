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
    using Strings for uint256;

    error Minter__ArrayLengthMismatch();
    error Minter__EmptyArray();
    error Minter__CodeAlreadyUsed();
    error Minter__InvalidCode();
    error Minter__AlreadyClaimed();

    // mapping to track if a claim code has been used per event
    mapping(uint256 => mapping(string => bool)) public claimedCodes;

    // mapping from tokenId to token URI
    mapping(uint256 => string) private _tokenURIs;

    // mapping from claim code to token Id
    mapping(uint256 => mapping(string => uint256)) public codeToTokenId;

    // mapping from eventId to tokenId
    mapping(uint256 => uint256) public tokenToEvent;

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

    function claim(uint256 eventId, string memory code, address recipient) external {
        if (!claimedCodes[eventId][code]) revert Minter__InvalidCode();

        uint256 tokenId = codeToTokenId[eventId][code];

        // check if still held by contract (not already claimed)
        if (ownerOf(tokenId) != address(this)) {
            revert Minter__AlreadyClaimed();
        }

        _transfer(address(this), recipient, tokenId);

        emit NFTClaimed(eventId, tokenId, recipient, code);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function setTokenURI(uint256 tokenId, string memory newTokenURI) external onlyOwner {
        _requireOwned(tokenId);
        _tokenURIs[tokenId] = newTokenURI;
    }

    function nextEventId() external view returns (uint256) {
        return currentEventId;
    }
}
