// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract List is Ownable {
    mapping(string => uint16) public tokens;
    address private tradeAddress;

    event ItemSold(address _address, uint256 _id, uint256 _price);
    event ItemAdded(string _key, uint16 _price);
    event ItemDeleted(string _key);
    event PriceChanged(string _key, uint16 _price);

    function getKey(address _address, uint256 _id) internal pure returns (string memory) {
        string memory str = string.concat(
            Strings.toHexString(uint256(uint160(_address)), 20), 
            Strings.toString(_id)
        );
        return str;
    }

    function buy(address _address, uint256 _id) external payable {
        uint _price = tokens[getKey(_address, _id)];
        require(_price != 0, 'token not found');
        require(_price <= msg.value, 'pay more eth');
        require(msg.sender != owner());
        IERC721 _token = IERC721(_address);
        _token.safeTransferFrom(owner(), msg.sender, _id);
        emit ItemSold(_address, _id, msg.value);
    }

    function setTrade(address _trade) external onlyOwner {
        tradeAddress = _trade;
    }

    function addItem(string memory _key, uint16 _price) external onlyOwner {
        require(_price > 0);
        tokens[_key] = _price;
        emit ItemAdded(_key, _price);
    }

    function deleteItem(string memory _key) external onlyOwner {
        delete tokens[_key];
        emit ItemDeleted(_key);
    }

    function changePrice(string memory _key, uint16 _price) external onlyOwner {
        require(tokens[_key] != 0, 'token not found');
        tokens[_key] = _price;
        emit PriceChanged(_key, _price);
    }

    function withdraw() public payable onlyOwner {
        require(payable(owner()).send(address(this).balance));
    }
}