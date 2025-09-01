// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MintNft} from "src/MintNft.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract MintNftTest is Test {
    MintNft public nft;
    address public owner = address(1);
    address public user1;
    address public user2;

    uint256 user1PrivateKey = 0x2;
    uint256 user2PrivateKey = 0x3;

    function setUp() public {
        user1 = vm.addr(user1PrivateKey);
        user2 = vm.addr(user2PrivateKey);

        vm.prank(owner);
        nft = new MintNft();

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
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event", "test", "ipfs://QmTest", 100);

        (string memory name, string memory symbol, string memory eventURI, uint256 maxSupply, uint256 totalMinted) =
            nft.getTokenType(tokenId);

        assertEq(name, "Test Event");
        assertEq(symbol, "test");
        assertEq(eventURI, "ipfs://QmTest");
        assertEq(maxSupply, 100);
        assertEq(totalMinted, 0);
    }

    function testClaimForPublic() public {
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event", "test", "ipfs://QmTest", 100);

        vm.prank(owner);
        nft.mint(tokenId, 10);

        //
        bytes32 nonce = keccak256(abi.encodePacked("unique_nonce"));
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, user1, nonce));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(user1PrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(owner);
        nft.claimFor(tokenId, user1, signature, nonce);

        assertEq(nft.balanceOf(user1, tokenId), 1);
        assertTrue(nft.hasClaimed(tokenId, user1));
        assertTrue(nft.usedNonces(nonce));

        (,,,, uint256 totalMinted) = nft.getTokenType(tokenId);
        assertEq(totalMinted, 11);
    }

    function testCheckClaimIsGasless() public {
        vm.prank(owner);
        uint256 tokenId = nft.createTokenType("Test Event", "test", "ipfs://QmTest", 100);

        vm.prank(owner);
        nft.mint(tokenId, 10);

        uint256 gasPrice = 20 gwei;
        vm.txGasPrice(gasPrice);
        

        uint256 ownerBalanceBefore = owner.balance;
        uint256 userBalanceBefore = user1.balance;

        bytes32 nonce = keccak256(abi.encodePacked("unique_nonce"));
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, user1, nonce));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(user1PrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);

         uint256 gasBefore = gasleft();

        vm.prank(owner);
        nft.claimFor(tokenId, user1, signature, nonce);

        uint256 gasUsed = gasBefore - gasleft();
        uint256 gasCost = gasUsed * gasPrice;
        
        // Manually deduct gas cost from owner's balance
        vm.deal(owner, owner.balance - gasCost);
        

        assertEq(nft.balanceOf(user1, tokenId), 1);
        assertTrue(nft.hasClaimed(tokenId, user1));
        assertTrue(nft.usedNonces(nonce));

        (,,,, uint256 totalMinted) = nft.getTokenType(tokenId);
        assertEq(totalMinted, 11);

        uint256 ownerBalanceAfter = owner.balance;
        uint256 userBalanceAfter = user1.balance;

        assertEq(userBalanceBefore, userBalanceAfter);
        assertEq(ownerBalanceBefore - ownerBalanceAfter, gasCost);

        emit log_named_uint("Gas used", gasUsed);
        emit log_named_uint("Gas price", gasPrice);
        emit log_named_uint("Gas cost", gasCost);
    }
}
