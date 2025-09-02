// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {Test} from "forge-std/Test.sol";
import {MintNft} from "src/MintNft.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC2771Forwarder} from "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

contract MintNftTest is Test {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    MintNft public nft;
    ERC2771Forwarder public forwarder;
    address public owner = address(1);
    address public user1;
    address public user2;
    uint256 user1PrivateKey = 0x2;
    uint256 user2PrivateKey = 0x3;
    
    function setUp() public {
        user1 = vm.addr(user1PrivateKey);
        user2 = vm.addr(user2PrivateKey);
        
        // Deploy the forwarder contract
        forwarder = new ERC2771Forwarder("ERC2771Forwarder");
        
        vm.prank(owner);
        nft = new MintNft(address(forwarder));
        vm.deal(owner, 10 ether);
        vm.deal(user1, 1 ether);
    }
    
    function testOwner() public view {
        assertEq(nft.owner(), owner);
    }
    
    function testCreateTokenType() public {
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event", "test", "ipfs://QmTest", 100);
        assertEq(tokenId, 1);
    }
    
    function testGetTokenType() public {
        vm.startPrank(owner);
        uint256 fixedTimestamp = 160000;
        vm.warp(fixedTimestamp);
        uint256 tokenId = nft.createTokenType("Test Event", "test", "ipfs://QmTest", 100);
        bytes32 eventNonceTest = keccak256(abi.encodePacked(tokenId, fixedTimestamp, owner));
        vm.stopPrank();
        
        (string memory name, string memory symbol, string memory eventURI, uint256 maxSupply, uint256 totalMinted, bytes32 eventNonce) =
            nft.getTokenType(tokenId);
        assertEq(name, "Test Event");
        assertEq(symbol, "test");
        assertEq(eventURI, "ipfs://QmTest");
        assertEq(maxSupply, 100);
        assertEq(totalMinted, 0);
        assertEq(eventNonce, eventNonceTest);
    }
    
    function testClaimForPublic() public {
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event", "test", "ipfs://QmTest", 100);
        vm.prank(owner);
        nft.mint(tokenId, 10);
        (,,,,,bytes32 eventNonce) = nft.getTokenType(tokenId);
        
        // Set a fixed timestamp to ensure predictable nonce generation
        uint256 fixedTimestamp = 160000;
        vm.warp(fixedTimestamp);
        
        // Generate the same claimNonce the contract will generate
        bytes32 claimNonce = keccak256(abi.encodePacked(tokenId, user1, fixedTimestamp));
    
        // Create the message hash with the claimNonce
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, user1, eventNonce, claimNonce));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(user1PrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
    
        vm.prank(user1);
        nft.claim(tokenId, signature);
        assertEq(nft.balanceOf(user1, tokenId), 1);
        assertTrue(nft.hasUserClaimed(tokenId, user1));
        assertTrue(nft.usedNonces(claimNonce));
        (,,,, uint256 totalMinted,) = nft.getTokenType(tokenId);
        assertEq(totalMinted, 11);
    }
    
    function testCheckClaimIsGasless() public {
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event", "test", "ipfs://QmTest", 100);
        vm.prank(owner);
        nft.mint(tokenId, 10);
        (,,,,,bytes32 eventNonce) = nft.getTokenType(tokenId);
        
        // Set a fixed timestamp to ensure predictable nonce generation
        uint256 fixedTimestamp = 160000;
        vm.warp(fixedTimestamp);
        
        // Generate the same claimNonce the contract will generate
        bytes32 claimNonce = keccak256(abi.encodePacked(tokenId, user1, fixedTimestamp));
        
        // Create the message hash with the claimNonce
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, user1, eventNonce, claimNonce));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(user1PrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        // Create the function call data (only tokenId and signature)
        bytes memory data = abi.encodeWithSelector(
            nft.claim.selector,
            tokenId,
            signature
        );
        
        // Create the forward request
        ERC2771Forwarder.ForwardRequestData memory request = ERC2771Forwarder.ForwardRequestData({
            from: user1,
            to: address(nft),
            value: 0,
            gas: 500000,
            deadline: uint48(block.timestamp + 3600),
            data: data,
            signature: "" // We will set it after signing
        });
        
        // Get the current nonce for the user
        uint256 nonce = forwarder.nonces(user1);
        
        // Build the EIP-712 hash
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("ForwardRequest(address from,address to,uint256 value,uint256 gas,uint256 nonce,uint48 deadline,bytes data)"),
                request.from,
                request.to,
                request.value,
                request.gas,
                nonce,
                request.deadline,
                keccak256(request.data)
            )
        );
        
        // Get the domain separator (manually compute if not exposed)
        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("ERC2771Forwarder")),
                keccak256(bytes("1")),
                block.chainid,
                address(forwarder)
            )
        );
        
        // Build the digest
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        
        // Sign the digest
        (uint8 vReq, bytes32 rReq, bytes32 sReq) = vm.sign(user1PrivateKey, digest);
        bytes memory requestSignature = abi.encodePacked(rReq, sReq, vReq);
        
        // Set the signature in the request
        request.signature = requestSignature;
        
        // Verify the request is valid
        assertTrue(forwarder.verify(request));
        
        // Execute the meta-transaction via the forwarder
        forwarder.execute(request);
        
        // Verify the claim was successful
        assertTrue(nft.hasUserClaimed(tokenId, user1));
    }
    
    function testUserCannotDoubleClaim() public {
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event", "test", "ipfs://QmTest", 100);
        vm.prank(owner);
        nft.mint(tokenId, 10);
        
        // First claim
        uint256 fixedTimestamp = 160000;
        vm.warp(fixedTimestamp);
        
        bytes32 claimNonce = keccak256(abi.encodePacked(tokenId, user1, fixedTimestamp));
        (,,,,,bytes32 eventNonce) = nft.getTokenType(tokenId);
        
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, user1, eventNonce, claimNonce));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(user1PrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(user1);
        nft.claim(tokenId, signature);
        
        // Try to claim again with same parameters
        vm.expectRevert("Already claimed this token type");
        vm.prank(user1);
        nft.claim(tokenId, signature);
    }
    
    function testGetRemainingSupply() public {
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event", "test", "ipfs://QmTest", 100);
        vm.prank(owner);
        nft.mint(tokenId, 10);
        
        // Claim one NFT
        uint256 fixedTimestamp = 160000;
        vm.warp(fixedTimestamp);
        
        bytes32 claimNonce = keccak256(abi.encodePacked(tokenId, user1, fixedTimestamp));
        (,,,,,bytes32 eventNonce) = nft.getTokenType(tokenId);
        
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, user1, eventNonce, claimNonce));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(user1PrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(user1);
        nft.claim(tokenId, signature);
        
        (,,, uint256 maxSupply, uint256 totalMinted,) = nft.getTokenType(tokenId);
        assertEq(maxSupply - totalMinted, nft.remainingSupply(tokenId));
    }
    
    function test_RevertWhenWrongSignature() public {
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event", "test", "ipfs://QmTest", 100);
        vm.prank(owner);
        nft.mint(tokenId, 10);
        
        uint256 fixedTimestamp = 160000;
        vm.warp(fixedTimestamp);
        
        bytes32 claimNonce = keccak256(abi.encodePacked(tokenId, user1, fixedTimestamp));
        (,,,,,bytes32 eventNonce) = nft.getTokenType(tokenId);
        
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, user1, eventNonce, claimNonce));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        
        // Sign with user2's private key instead of user1
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(user2PrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.expectRevert("Invalid signature");
        vm.prank(user1);
        nft.claim(tokenId, signature);
    }
    
    function testSetURI() public {
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event", "test", "ipfs://QmTest", 100);
        string memory returnedUri = nft.uri(tokenId);
        assertEq(returnedUri, "ipfs://QmTest");
    }
    
    function testGetTotalEvents() public {
        vm.prank(owner);
        nft.createTokenType("Test Event 1", "test", "ipfs://QmTest", 100);
        vm.prank(owner);
        nft.createTokenType("Test Event 2", "test", "ipfs://QmTest", 100);
        assertEq(nft.getTotalEvents(), 2);
    }
    
    function testUserHasClaimed() public {
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event 1", "test", "ipfs://QmTest", 100);
        
        uint256 fixedTimestamp = 160000;
        vm.warp(fixedTimestamp);
        
        bytes32 claimNonce = keccak256(abi.encodePacked(tokenId, user1, fixedTimestamp));
        (,,,,,bytes32 eventNonce) = nft.getTokenType(tokenId);
        
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, user1, eventNonce, claimNonce));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(user1PrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(user1);
        nft.claim(tokenId, signature);
        
        assertTrue(nft.hasUserClaimed(tokenId, user1));
    }
    
    function testGetTokenStats() public {
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event 1", "test", "ipfs://QmTest", 100);
        vm.prank(owner);
        nft.mint(tokenId, 50);
        
        uint256 fixedTimestamp = 160000;
        vm.warp(fixedTimestamp);
        
        bytes32 claimNonce = keccak256(abi.encodePacked(tokenId, user1, fixedTimestamp));
        (,,,,,bytes32 eventNonce) = nft.getTokenType(tokenId);
        
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, user1, eventNonce, claimNonce));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(user1PrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(user1);
        nft.claim(tokenId, signature);
        
        (uint256 maxSupply, uint256 totalMinted, uint256 remaining) = nft.getEventStats(tokenId);
        assertEq(maxSupply, 100);
        assertEq(totalMinted, 51);
        assertEq(remaining, maxSupply - totalMinted);
    }
    
    function test__RevertWhenClaimAmountExceeds() public {
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event 1", "test", "ipfs://QmTest", 100);
        vm.prank(owner);
        nft.mint(tokenId, 100);
        
        uint256 fixedTimestamp = 160000;
        vm.warp(fixedTimestamp);
        
        bytes32 claimNonce = keccak256(abi.encodePacked(tokenId, user1, fixedTimestamp));
        (,,,,,bytes32 eventNonce) = nft.getTokenType(tokenId);
        
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, user1, eventNonce, claimNonce));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(user1PrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.expectRevert("All NFTs of this type claimed");
        vm.prank(user1);
        nft.claim(tokenId, signature);
    }
}