import token from './MyToken.json';
import list from './List.json';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import styles from './module.css';

export default function Home() {
  let listContractAddress = '0x8E027335989b2D6A7489A4AB8DCA5f54dce2c8cC';
  const tokenContractAddress = '0x5F1AFA1c14DD39cE7081D38B17E6A2f978aD9463';
  const listContractABI = list.abi;
  const tokenContractABI = token.abi;
  const bytecode = list.bytecode;

  const [currentAccount, setCurrentAccount] = useState('');
  const [id, setId] = useState('')

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const getProvider = async () => {
    const { ethereum } = window;
    if(!ethereum) {
      console.log("please install MetaMask");
    }
    return new ethers.providers.Web3Provider(window.ethereum);
  }

  const mint = async () => {
    try {
      const provider = await getProvider();
      const contract = new ethers.Contract(tokenContractAddress, tokenContractABI, provider);
      await contract.connect(provider.getSigner()).safeMint().then(async (tx) => {
        const receipt = await tx.wait();
        console.log(Number(receipt.events[0].args.tokenId));
      });
    } catch (error) {
      console.log(error);
    }
  }

  const deploy = async () => {
    try {
      const provider = await getProvider();
      const factory = new ethers.ContractFactory(listContractABI, bytecode, provider.getSigner());
      const contract = await factory.deploy();
      await contract.deployed();
      listContractAddress = contract.address;
      console.log(contract.address);
    } catch (error) {
      console.log(error);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('123');
  }

  // check if approved first
  const add = async () => {
    try {
      const price = ethers.utils.parseEther('0.00002');
      const provider = await getProvider();
      const tokenContract = new ethers.Contract(tokenContractAddress, tokenContractABI, provider);
      const listContract = new ethers.Contract(listContractAddress, listContractABI, provider);
      const approve = await tokenContract.connect(provider.getSigner()).approve(listContract.address, 8);
      await approve.wait();
      console.log('approved');
      const add = await listContract.connect(provider.getSigner()).addItem(tokenContractAddress, 8, price);
      await add.wait().then((res) => {
        console.log(ethers.utils.formatEther(res.events[0].args._price));
        console.log(res.events[0]);
        // console.log(res.events[0].args._id)
      });
      console.log('added');
    } catch (error) {
      console.log(error);
    }
  }

  const get = async () => {
    try {
      const provider = await getProvider();
      console.log(await provider.getSigner().getAddress());
      const contract = new ethers.Contract(listContractAddress, listContractABI, provider);
      const price = await contract.tokens(`${tokenContractAddress}2`.toLowerCase());
      console.log(ethers.utils.formatEther(price));
    } catch (error) {
      console.log(error);
    }
  }

  const buy = async () => {
    try {
      const amount = {value: ethers.utils.parseEther('0.01')};
      const provider = await getProvider();
      console.log(provider.getSigner());
      const contract = new ethers.Contract(listContractAddress, listContractABI, provider);
      await contract.connect(provider.getSigner()).buy(tokenContractAddress, 1, amount);
    } catch (error) {
      console.log(error);
    }
  }

  const change = async () => {
    try {
      const provider = await getProvider();
      const price = ethers.utils.parseEther('0.0001');
      const contract = new ethers.Contract(listContractAddress, listContractABI, provider);

      await contract.tokens(`${tokenContractAddress}8`.toLowerCase()).then((pr) => {
        console.log(ethers.utils.formatEther(pr));
      });
      const change = await contract.connect(provider.getSigner()).changePrice(`${tokenContractAddress}8`.toLowerCase(), price);
      await change.wait();
      await contract.tokens(`${tokenContractAddress}8`.toLowerCase()).then((pr) => {
        console.log(ethers.utils.formatEther(pr));
      });
    } catch (error) {
      console.log(error);
    }
  }
 
  useEffect(() => {
    connectWallet()
      .catch(console.error);
  }, [])

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to p2p trading!
        </h1>

        {currentAccount ? (
          <div>
            <form>
              <div>
                <button type="button" onClick={mint}>
                  mint
                </button>
              </div>
              <br />

              <div>
                <button type="button" onClick={deploy}>
                  deploy contract
                </button>
              </div>
              <br />

              {/* <div>
                <form onsubmit={handleSubmit}>
                  <input type='text' onChange={(e) => setId(e.target.value)} value={id}/>
                  <input type='submit' value='add'/>
                </form>
              </div>
              <br /> */}

              <div>
                <button type="button" onClick={add}>
                  add item
                </button>
              </div>
              <br />
              

              <div>
                <button type="button" onClick={get}>
                  get item
                </button>
              </div>
              <br />

              <div>
                <button type="button" onClick={buy}>
                  buy
                </button>
              </div>
              <br />

              <div>
                <button type="button" onClick={change}>
                  change price
                </button>
              </div>
            </form>
          </div>
        ) : (
            <button onClick={connectWallet}> Connect your wallet </button>
          )}
      </main>
    </div>
  )
}
