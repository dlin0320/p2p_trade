import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('List', () => {
    async function init() {
        const [owner, signer1, signer2] = await ethers.getSigners();
        const MyToken = await ethers.getContractFactory('MyToken', owner);
        const token = await MyToken.deploy();
        await token.deployed();
        const id1 = await token.connect(signer1).safeMint().then(async (tx) => {
            const receipt = await tx.wait();
            const id = JSON.parse(receipt.events![0].args!.tokenId);
            expect(id).to.equal(0);
            return id
        });
        const id2 = await token.connect(signer2).safeMint().then(async (tx) => {
            const receipt = await tx.wait();
            const id = JSON.parse(receipt.events![0].args!.tokenId);
            expect(id).to.equal(1);
            return id
        });
        return { owner, signer1, signer2, id1, id2, token };
    }

    it('add item', async () => {
        const r = await init();
        const price = 1;
        const List = await ethers.getContractFactory('List', r.signer1);
        const list = await List.deploy();
        await list.deployed();

        await r.token.connect(r.signer1).approve(list.address, r.id1);
        await list.connect(r.signer1).addItem(r.token.address, r.id1, price).then(async (tx) => {
            const receipt = await tx.wait();
            const args = receipt.events![0].args!;
            expect(args._address).to.equal(r.token.address);
            expect(args._id).to.equal(r.id1);
            expect(args._price).to.equal(price);
        });
    })

    it('delete item', async () => {
        const r = await init();
        const price = 1;
        const key = `${r.token.address}${r.id2}`.toLowerCase();
        const List = await ethers.getContractFactory('List', r.signer1);
        const list = await List.deploy();
        await list.deployed();

        await r.token.connect(r.signer1).approve(list.address, r.id1);
        await list.connect(r.signer1).addItem(r.token.address, r.id1, price);
        await list.connect(r.signer2).tokens(key).then((price) => {
            expect(price).to.equal(price);
        });
        await list.connect(r.signer1).deleteItem(key);
        await list.connect(r.signer2).tokens(key).then((price) => {
            expect(price).to.equal(0);
        });
    })

    it('change price', async () => {
        const r = await init();
        const price1 = 1;
        const price2 = 2;
        const key = `${r.token.address}${r.id2}`.toLowerCase();
        const List = await ethers.getContractFactory('List', r.signer2);
        const list = await List.deploy();
        await list.deployed();

        await r.token.connect(r.signer2).approve(list.address, r.id2);
        await list.connect(r.signer2).addItem(r.token.address, r.id2, price1);
        await list.connect(r.signer1).tokens(key).then((price) => {
            expect(price).to.equal(price1);
        });
        await list.connect(r.signer2).changePrice(key, price2);
        await list.connect(r.signer1).tokens(key).then((price) => {
            expect(price).to.equal(price2);
        });
    })

    it('buy', async () => {
        const r = await init();
        const price = 1;
        const tip = {value: ethers.utils.parseEther("1")};
        const List = await ethers.getContractFactory('List', r.signer2);
        const list = await List.deploy();
        await list.deployed();

        await r.token.connect(r.signer2).approve(list.address, r.id2);
        await list.connect(r.signer2).addItem(r.token.address, r.id2, price);
        await list.connect(r.signer1).buy(r.token.address, r.id2, tip);
        await r.token.ownerOf(r.id2).then(async (owner) => {
            expect(owner).to.equal(await r.signer1.getAddress());
        })
    })

    it('withdraw', async () => {
        const r = await init();
        const List = await ethers.getContractFactory('List', r.signer2);
        const list = await List.deploy();
        await list.deployed();

        expect(await ethers.provider.getBalance(list.address)).to.equal(0);
        await r.signer1.sendTransaction({
            to: list.address,
            value: 100
        });
        expect(await ethers.provider.getBalance(list.address)).to.equal(100);
        await list.connect(r.signer2).withdraw();
        expect(await ethers.provider.getBalance(list.address)).to.equal(0);
    })
})
