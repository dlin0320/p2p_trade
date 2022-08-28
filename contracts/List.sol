// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract List is Ownable {
    mapping(string => uint16) public tokens;

    event ItemBought(address _address, uint256 _id, uint256 _price);
    event ItemAdded(address _address, uint256 _id, uint16 _price);
    event ItemDeleted(string _key);
    event PriceChanged(string _key, uint16 _price);

    function getKey(address _address, uint256 _id) internal pure returns (string memory) {
        return string.concat(
            Strings.toHexString(uint256(uint160(_address)), 20), 
            Strings.toString(_id)
        );
    }

    function buy(address _address, uint256 _id) public payable {
        uint _price = tokens[getKey(_address, _id)];
        require(_price > 0, 'token not found');
        require(_price <= msg.value, 'pay more eth');
        IERC721 token = IERC721(_address);
        token.transferFrom(owner(), msg.sender, _id);
        emit ItemBought(_address, _id, msg.value);
    }

    function addItem(address _address, uint256 _id, uint16 _price) external onlyOwner {
        require(_price > 0);
        IERC721 token = IERC721(_address);
        require(token.ownerOf(_id) == owner());
        tokens[getKey(_address, _id)] = _price;
        emit ItemAdded(_address, _id, _price);
    }

    function deleteItem(string memory _key) external onlyOwner {
        delete tokens[_key];
        emit ItemDeleted(_key);
    }

    function changePrice(string memory _key, uint16 _price) external onlyOwner {
        tokens[_key] = _price;
        emit PriceChanged(_key, _price);
    }

    function withdraw() public payable onlyOwner {
        require(payable(owner()).send(address(this).balance));
    }
}
