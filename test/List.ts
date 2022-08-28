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
        const key = `${r.token.address}${r.id2}`.toLowerCase();
        const List = await ethers.getContractFactory('List', r.signer1);
        const list = await List.deploy();
        await list.deployed();
        await list.connect(r.signer1).addItem(key, price).then(async (tx) => {
            const receipt = await tx.wait();
            const args = receipt.events![0].args!;
            expect(args._key).to.equal(key);
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
        await list.connect(r.signer1).addItem(key, price);
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
        await list.connect(r.signer2).addItem(key, price1);
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
        const key = `${r.token.address}${r.id2}`.toLowerCase();
        const tip = {value: ethers.utils.parseEther("1")};
        const List = await ethers.getContractFactory('List', r.signer2);
        const list = await List.deploy();
        await list.deployed();

        await r.token.connect(r.signer2).approve(list.address, r.id2);
        await list.connect(r.signer2).addItem(key, price);
        await list.connect(r.signer1).buy(r.token.address, r.id2, tip);
        await r.token.ownerOf(r.id2).then(async (owner) => {
            expect(owner).to.equal(await r.signer1.getAddress());
        })
    })
})
