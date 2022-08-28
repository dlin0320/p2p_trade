// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyToken is ERC721 {
    using Counters for Counters.Counter;
    address public owner;
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("MyToken", "MTK") { owner = msg.sender; }

    function safeMint() public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(msg.sender, tokenId);
    }
}