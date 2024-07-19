// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    /*
    variables 
    */

    // address public owner; ---> we have this in ownable contract
    // uint256 _initialSupply; ---> we have this in deployment environment
    address internal s_minter;

    constructor(uint _initialSupply, address[] memory accounts) ERC20("hearVerse", "HVE") {
        uint decimals = 18;
        // uint totalSupply = totalSupply();
        // address owner = _msgSender();
        _mint(_msgSender(), _initialSupply * (10 ** uint256(decimals)));

        uint256 amountPerAccount = totalSupply() / uint256(accounts.length + 1);

        // address[5] memory accounts = [
        //     0xdD870fA1b7C4700F2BD7f44238821C26f7392148,
        //     0x583031D1113aD414F02576BD6afaBfb302140225,
        //     0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB,
        //     0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C,
        //     0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c
        // ];
        for (uint i = 0; i < accounts.length; i++) {
            address account = accounts[i]; // get the address of the i'th account
            transfer(account, amountPerAccount); // set the balance of the account
        }
    }

    // add mint function just for genesis wallet
    // modifier to check the only owner or minter can mint
    modifier onlyOwnerOrMinter() {
        require(
            _msgSender() == owner() || _msgSender() == s_minter,
            "only owner or minter can call this function"
        );
        _;
    }

    // mint and burn functions
    // set the minter
    function setMinter(address _minter) public onlyOwner {
        s_minter = _minter;
    }

    // function removeMinter() external onlyOwner {
    //     delete s_minter;
    // }

    // mint function only owner or minter
    function mint(uint256 amount) public onlyOwnerOrMinter {
        _mint(_msgSender(), amount);
    }

    // burn function only owner of minter
    function burn(uint256 amount) public onlyOwnerOrMinter {
        _burn(_msgSender(), amount);
    }

    /* getter function */
    function getMinter() public view returns (address) {
        return s_minter;
    }
}
