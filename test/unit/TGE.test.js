// Import Hardhat runtime environment
// and use the ethers plugin for convenience
const { assert, expect } = require("chai")
const { deployments, ethers, network } = require("hardhat")
const Bignum = require("bignumber.js")

// Define a test suite called "MyToken"
describe("HearVerse tokenization", function () {
    let MyToken
    let myToken
    let owner, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10
    let totalSupply

    const initialAmount = 110

    let array
    let decimal

    beforeEach(async function () {
        const accounts = await ethers.getSigners()
        owner = accounts[0]
        user1 = accounts[1]
        user2 = accounts[2]
        user3 = accounts[3]
        user4 = accounts[4]
        user5 = accounts[5]
        user6 = accounts[6]
        user7 = accounts[7]
        user8 = accounts[8]
        user9 = accounts[9]
        user10 = accounts[10]
        array = [
            user1.address,
            user2.address,
            user3.address,
            user4.address,
            user5.address,
            user6.address,
            user7.address,
            user8.address,
            user9.address,
            user10.address,
        ]
        MyToken = await ethers.getContractFactory("MyToken")
        myToken = await MyToken.deploy(initialAmount, array)
        await myToken.deployed()
        decimal = await myToken.decimals()
    })

    // Define a test called "Deployment"
    // that tests the contract deployment
    describe("Deployment", function () {
        // Before each test, deploy the contract
        // and get the owner address

        // Test that the contract was deployed correctly
        it("Should set the right owner", async function () {
            const ownerOfTheContract = await myToken.owner()
            expect(ownerOfTheContract).to.equal(owner.address)
        })

        it("Should set the right symbol and name", async function () {
            expect(await myToken.symbol()).to.equal("HVE")
            expect(await myToken.name()).to.equal("hearVerse")
        })

        it("Should set the right initial supply", async function () {
            totalSupply = Number(await myToken.totalSupply())
            expect(totalSupply).to.equal(initialAmount * 10 ** 18)
            // because after the deploy the owner transfer the supplys, must have the 1/11 of the supplys
            const ownerBalance = Number(await myToken.balanceOf(owner.address))
            console.log(`       the owner balance from the contract is : ${ownerBalance}`)
            const expectedOwnerBalance = totalSupply / (array.length + 1)
            console.log(`       the balance that we expected is : ${expectedOwnerBalance}`)
            expect(ownerBalance).to.equal(expectedOwnerBalance)
        })

        it("Should distribute tokens to accounts(manual address)", async function () {
            // manual expect
            const user1Balance = Number(await myToken.balanceOf(user1.address))
            expect(user1Balance).to.equal(10 * 10 ** decimal)

            // const decimal = await myToken.decimals()

            // initial expected
            const expectedBalance = (initialAmount * 10 ** decimal) / (array.length + 1)

            const balance = Number(await myToken.balanceOf(user2.address))
            expect(balance.toString()).to.equal(expectedBalance.toString())

            for (let i = 0; i < array.length; i++) {
                const balance = Number(await myToken.balanceOf(array[i]))
                expect(balance).to.equal(expectedBalance)
            }
        })
    })
    describe("for minting, burning and setMinter functions", function () {
        it("should increase the total supply when the owner call mint", async () => {
            totalSupply = Number(await myToken.totalSupply())
            const mintAmount = 10
            await myToken.mint(mintAmount)
            const afterTotalSupply = Number(await myToken.totalSupply())

            expect(afterTotalSupply).to.equal(totalSupply + mintAmount)
            expect(totalSupply).to.equal(afterTotalSupply - mintAmount)
        })
        it("should decrease the total supply when the owner call burn", async () => {
            totalSupply = Number(await myToken.totalSupply())
            const burnAmount = 20
            await myToken.burn(burnAmount)
            const afterTotalSupply = Number(await myToken.totalSupply())

            expect(afterTotalSupply).to.equal(totalSupply - burnAmount)
            expect(totalSupply).to.equal(afterTotalSupply + burnAmount)
        })
        it("should give an error when another person call mint and burn instead of owner", async () => {
            const mintAmount = 10
            const burnAmount = 20

            const notOwnerMintCall = myToken.connect(user1).mint(mintAmount)
            const notOwnerBurnCall = myToken.connect(user1).mint(burnAmount)

            const error = "only owner or minter can call this function"

            await expect(notOwnerMintCall).to.be.revertedWith(error)
            await expect(notOwnerBurnCall).to.be.revertedWith(error)
        })
        it("it should set the minter by owner", async () => {
            const minter = array[0] // ---> user1.address
            await myToken.setMinter(minter)

            expect(minter).to.equal(await myToken.getMinter())
        })
        it("it should set the miner by owner and change it again", async () => {
            const firstMinter = array[1]
            await myToken.setMinter(firstMinter)
            const getFirstMinter = await myToken.getMinter()
            expect(firstMinter).to.equal(getFirstMinter)

            const secondMinter = array[2]
            await myToken.setMinter(secondMinter)
            const getSecondMinter = await myToken.getMinter()
            expect(secondMinter).to.equal(getSecondMinter)
        })
        it("after setting minter, non-owner can't change it", async () => {
            const firstMinter = array[5]
            await myToken.setMinter(firstMinter)
            const setByNonOwner = myToken.connect(user6).setMinter(firstMinter)
            const error = "Ownable: caller is not the owner"

            expect(setByNonOwner).to.be.revertedWith(error)
        })
        it("it should return error when not Owner want to set minter", async () => {
            const minter = array[3] // user3.address
            const setMinterByNotOwner = myToken.connect(user4).setMinter(minter)

            const error = "Ownable: caller is not the owner"
            expect(setMinterByNotOwner).to.be.revertedWith(error)
        })
    })
})
