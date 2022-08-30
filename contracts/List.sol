// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract List is Ownable {
    mapping(string => uint256) public tokens;

    event ItemSold(address _address, uint256 _id, uint256 _price, address _buyer);
    event ItemAdded(address _address, uint256 _id, uint256 _price);
    event ItemDeleted(string _key);
    event PriceChanged(string _key, uint256 _price);
    event Received(address _address, uint256 _amount);

    function getKey(address _address, uint256 _id) internal pure returns (string memory) {
        return string.concat(
            Strings.toHexString(uint256(uint160(_address)), 20), 
            Strings.toString(_id)
        );
    }

    function buy(address _address, uint256 _id) external payable {
        string memory _key = getKey(_address, _id);
        require(tokens[_key] != 0, 'token not found');
        require(tokens[_key] <= msg.value, 'pay more eth');
        IERC721 token = IERC721(_address);
        address _from = token.ownerOf(_id);
        require(msg.sender != owner() && msg.sender != _from);
        token.safeTransferFrom(owner(), msg.sender, _id);
        delete tokens[_key];
        emit ItemSold(_address, _id, msg.value, _from);
    }

    function addItem(address _address, uint256 _id, uint256 _price) external onlyOwner {
        require(_price > 0);
        require(IERC721(_address).getApproved(_id) == address(this));
        tokens[getKey(_address, _id)] = _price;
        emit ItemAdded(_address, _id, _price);
    }

    function deleteItem(string memory _key) external onlyOwner {
        delete tokens[_key];
        emit ItemDeleted(_key);
    }

    function changePrice(string memory _key, uint256 _price) external onlyOwner {
        require(tokens[_key] != 0, 'token not found');
        tokens[_key] = _price;
        emit PriceChanged(_key, _price);
    }

    function withdraw() public payable onlyOwner {
        require(payable(owner()).send(address(this).balance));
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}