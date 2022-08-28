# Simple p2p trading

## Usage
List.sol is contract that allows the user to list their tokens(nfts) by deploying a self-owned contract.

### Functions
-add an item to the tokens list for sale with user defined price
```sh
List.addItem(address, uint, uint)
```

-delete an item from the tokens list
```sh
List.deleteItem(string)
```

-change the price of an item from the tokens list
```sh
List.changePrice(string, uint)
```