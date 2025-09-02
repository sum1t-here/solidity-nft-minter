// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title MintNft
 * @author Sumit Mazumdar
 * @notice Contract to allow minting different ERC1155 collections for Proof of Attendance
 */
contract MintNft is ERC1155, Ownable, ERC2771Context {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct TokenType {
        string name;
        string symbol;
        string eventURI;
        uint256 maxSupply;
        uint256 totalMinted;
        bytes32 eventNonce;
    }

    mapping(uint256 => TokenType) public tokenTypes;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    mapping(bytes32 => bool) public usedNonces;
    uint256 public tokenTypeCounter;

    event TokenTypeCreated(uint256 indexed tokenId, string name, string symbol, string eventURI, uint256 maxSupply);
    event NFTClaimed(uint256 indexed tokenId, address indexed claimer);

    constructor(address trustedForwarder) ERC1155("") Ownable(msg.sender) ERC2771Context(trustedForwarder) {}

    function createTokenType(string memory name, string memory symbol, string memory eventURI, uint256 maxSupply)
        external
        onlyOwner
        returns (uint256)
    {
        tokenTypeCounter++;
        uint256 newTokenId = tokenTypeCounter;

        bytes32 eventNonce = keccak256(abi.encodePacked(newTokenId, block.timestamp ,msg.sender));

        tokenTypes[newTokenId] = TokenType({
            name: name,
            symbol: symbol,
            eventURI: eventURI,
            maxSupply: maxSupply,
            totalMinted: 0, // Fixed to match struct field
            eventNonce: eventNonce
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

    function claim(uint256 tokenId, bytes memory signature) external {
        address claimer = _msgSender();

        require(tokenTypes[tokenId].maxSupply > 0, "Token type does not exist");

        require(!hasClaimed[tokenId][claimer], "Already claimed this token type");
        bytes32 eventNonce = tokenTypes[tokenId].eventNonce;
        require(eventNonce != 0, "Invalid event nonce");

        bytes32 claimNonce = keccak256(abi.encodePacked(tokenId, claimer, block.timestamp));
        require(!usedNonces[claimNonce], "Nonce already used");
        require(tokenTypes[tokenId].totalMinted < tokenTypes[tokenId].maxSupply, "All NFTs of this type claimed");

        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, claimer, eventNonce ,claimNonce));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);

        require(signer == claimer, "Invalid signature");

        hasClaimed[tokenId][claimer] = true;
        usedNonces[claimNonce] = true;
        _mint(claimer, tokenId, 1, "");
        tokenTypes[tokenId].totalMinted++;

        emit NFTClaimed(tokenId, claimer);
    }

     // Override context functions for meta-transactions
    function _msgSender() internal view override(ERC2771Context, Context) returns (address sender) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(ERC2771Context, Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view override(ERC2771Context, Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
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
            uint256 totalMinted,
            bytes32 eventNonce
        )
    {
        TokenType storage token = tokenTypes[tokenId];
        return (token.name, token.symbol, token.eventURI, token.maxSupply, token.totalMinted, token.eventNonce);
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
