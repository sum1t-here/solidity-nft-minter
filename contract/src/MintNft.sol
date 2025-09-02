// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title MintNft
 * @author Sumit Mazumdar
 * @notice Contract to allow minting different ERC1155 collections for Proof of Attendance
 */
contract MintNft is ERC1155, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct TokenType {
        string name;
        string symbol;
        string eventURI;
        uint256 maxSupply;
        uint256 totalMinted; // Fixed typo: was totalMintes
    }

    mapping(uint256 => TokenType) public tokenTypes;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    mapping(bytes32 => bool) public usedNonces;
    uint256 public tokenTypeCounter;

    event TokenTypeCreated(uint256 indexed tokenId, string name, string symbol, string eventURI, uint256 maxSupply);

    event NFTClaimed(uint256 indexed tokenId, address indexed claimer);

    constructor() ERC1155("") Ownable(msg.sender) {}

    function createTokenType(string memory name, string memory symbol, string memory eventURI, uint256 maxSupply)
        external
        onlyOwner
        returns (uint256)
    {
        tokenTypeCounter++;
        uint256 newTokenId = tokenTypeCounter;

        tokenTypes[newTokenId] = TokenType({
            name: name,
            symbol: symbol,
            eventURI: eventURI,
            maxSupply: maxSupply,
            totalMinted: 0 // Fixed to match struct field
        });

        emit TokenTypeCreated(newTokenId, name, symbol, eventURI, maxSupply);
        return newTokenId;
    }

    function mint(uint256 tokenId, uint256 amount) external onlyOwner {
        require(tokenTypes[tokenId].maxSupply > 0, "Token type does not exist");
        require(tokenTypes[tokenId].totalMinted + amount <= tokenTypes[tokenId].maxSupply, "Exceeds max supply");

        _mint(msg.sender, tokenId, amount, "");
        tokenTypes[tokenId].totalMinted += amount;
    }

    function claimFor(uint256 tokenId, address claimer, bytes memory signature, bytes32 nonce) external onlyOwner {
        require(tokenTypes[tokenId].maxSupply > 0, "Token type does not exist");
        require(!hasClaimed[tokenId][claimer], "Already claimed this token type");
        require(!usedNonces[nonce], "Nonce already used");
        require(tokenTypes[tokenId].totalMinted < tokenTypes[tokenId].maxSupply, "All NFTs of this type claimed");

        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, claimer, nonce));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);

        require(signer == claimer, "Invalid signature");

        hasClaimed[tokenId][claimer] = true;
        usedNonces[nonce] = true;
        _mint(claimer, tokenId, 1, "");
        tokenTypes[tokenId].totalMinted++;

        emit NFTClaimed(tokenId, claimer);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenTypes[tokenId].maxSupply > 0, "Token type does not exist");
        return tokenTypes[tokenId].eventURI;
    }

    function remainingSupply(uint256 tokenId) public view returns (uint256) {
        return tokenTypes[tokenId].maxSupply - tokenTypes[tokenId].totalMinted;
    }

    function getTokenType(uint256 tokenId)
        public
        view
        returns (
            string memory name,
            string memory symbol,
            string memory eventURI,
            uint256 maxSupply,
            uint256 totalMinted
        )
    {
        TokenType storage token = tokenTypes[tokenId];
        return (token.name, token.symbol, token.eventURI, token.maxSupply, token.totalMinted);
    }

    function getTotalEvents() public view returns (uint256) {
        return tokenTypeCounter;
    }

    function getAllTokenTypes() public view returns (TokenType[] memory) {
        TokenType[] memory tokens = new TokenType[](tokenTypeCounter);
        for (uint256 i = 1; i <= tokenTypeCounter; i++) {
            tokens[i - 1] = tokenTypes[i];
        }
        return tokens;
    }

    function getEventStats(uint256 tokenId)
        public
        view
        returns (uint256 maxSupply, uint256 totalMinted, uint256 remaining)
    {
        TokenType storage token = tokenTypes[tokenId];
        return (token.maxSupply, token.totalMinted, token.maxSupply - token.totalMinted);
    }

    function hasUserClaimed(uint256 tokenId, address user) public view returns (bool) {
        return hasClaimed[tokenId][user];
    }
}
