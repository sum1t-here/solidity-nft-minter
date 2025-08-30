// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {Minter} from "../src/Minter.sol";

contract Deploy is Script {
    function run() external returns (Minter) {
        vm.startBroadcast();

        Minter nft = new Minter("Proof of Attendance", "POAP");

        vm.stopBroadcast();

        return nft;
    }
}
