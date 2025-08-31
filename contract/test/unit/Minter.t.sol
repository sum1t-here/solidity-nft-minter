// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {Minter} from "src/Minter.sol";

contract MinterTest is Test {
    Minter public nft;
    address public owner = address(1);
    address public user = address(2);

    function setUp() public {
        vm.prank(owner);
        nft = new Minter("Proof of Attendance", "POAP");
    }

    function testInitialDeploy() public view {
        assertEq(nft.name(), "Proof of Attendance");
        assertEq(nft.symbol(), "POAP");
        assertEq(nft.owner(), owner);
        assertEq(nft.nextTokenId(), 0);
        assertEq(nft.nextEventId(), 0);
    }

    function testBatchMint() public {
        string[] memory codes = new string[](2);
        codes[0] = "code1";
        codes[1] = "code2";

        string[] memory tokenURIs = new string[](2);
        tokenURIs[0] = "ipfs://QmToken1";
        tokenURIs[1] = "ipfs://QmToken2";

        uint256 eventId = 1;

        // mint as owner
        vm.prank(owner);
        nft.batchMintWithCode(eventId, codes, tokenURIs);

        assertEq(nft.nextTokenId(), 2);
        assertEq(nft.nextEventId(), 1);

        console.log(nft.ownerOf(0), nft.ownerOf(1), address(nft));
        assertEq(nft.ownerOf(0), address(nft));
        assertEq(nft.ownerOf(1), address(nft));

        assertEq(nft.tokenURI(0), "ipfs://QmToken1");
        assertEq(nft.tokenURI(1), "ipfs://QmToken2");

        assertTrue(nft.claimedCodes(eventId, "code1"));
        assertTrue(nft.claimedCodes(eventId, "code2"));

        assertEq(nft.codeToTokenId(eventId, "code1"), 0);
        assertEq(nft.codeToTokenId(eventId, "code2"), 1);

        assertEq(nft.tokenToEvent(0), eventId);
        assertEq(nft.tokenToEvent(1), eventId);
    }

    modifier mintNft(uint256 eventId) {
        string[] memory codes = new string[](1);
        codes[0] = "code-0";

        string[] memory tokenURIs = new string[](1);
        tokenURIs[0] = "ipfs://QmTest";

        vm.prank(owner);
        nft.batchMintWithCode(eventId, codes, tokenURIs);
        _;
    }

    function testClaim() public mintNft(1) {
        uint256 eventId = 1;
        vm.prank(user);
        nft.claim(eventId, "code-0", user);

        assertEq(nft.ownerOf(0), user);
    }

    function testCannotClaimAlreadyClaimed() public mintNft(1) {
        uint256 eventId = 1;

        vm.prank(user);
        nft.claim(eventId, "code-0", user);

        vm.prank(user);
        vm.expectRevert(Minter.Minter__AlreadyClaimedOnce.selector);
        nft.claim(eventId, "code-0", user);
    }

    function testCannotClaimInvalidCode() public mintNft(1) {
        uint256 eventId = 1;

        vm.prank(user);
        vm.expectRevert(Minter.Minter__InvalidCode.selector);
        nft.claim(eventId, "code-1", user);
    }

    function testSetTokenURI() public mintNft(1) {
        vm.prank(owner);
        nft.setTokenURI(0, "ipfs://QmNew");

        assertEq(nft.tokenURI(0), "ipfs://QmNew");
    }

    function testUserCannotClaimMoreThanOneInAnyEvent() public {
        string[] memory codes = new string[](2);
        codes[0] = "code-0";
        codes[1] = "code-1";

        string[] memory tokenURIs = new string[](2);
        tokenURIs[0] = "ipfs://QmTest1";
        tokenURIs[1] = "ipfs://QmTest2";

        uint256 eventId = 1;

        vm.prank(owner);
        nft.batchMintWithCode(eventId, codes, tokenURIs);

        vm.prank(user);
        nft.claim(eventId, "code-0", user);

        assertEq(nft.ownerOf(0), user);

        vm.prank(user);
        vm.expectRevert(Minter.Minter__AlreadyClaimedOnce.selector);
        nft.claim(eventId, "code-1", user);
    }

    function testUserCanClaimFromMultipleEvents() public {
        string[] memory codes1 = new string[](1);
        codes1[0] = "code-0";
        string[] memory tokenURIs1 = new string[](1);
        tokenURIs1[0] = "ipfs://QmTest";
        uint256 eventId1 = 1;
        vm.prank(owner);
        nft.batchMintWithCode(eventId1, codes1, tokenURIs1);
        vm.prank(user);
        nft.claim(eventId1, codes1[0], user);
        assertEq(nft.ownerOf(0), user);
        assertEq(nft.nextEventId(), 1);

        string[] memory codes2 = new string[](1);
        codes2[0] = "code-0";
        string[] memory tokenURIs2 = new string[](1);
        tokenURIs2[0] = "ipfs://QmTest";
        uint256 eventId2 = 2;
        vm.prank(owner);
        nft.batchMintWithCode(eventId2, codes2, tokenURIs2);
        vm.prank(user);
        nft.claim(eventId2, codes2[0], user);
        assertEq(nft.ownerOf(1), user);
        assertEq(nft.nextEventId(), 2);
    }
}
