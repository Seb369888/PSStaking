const hre = require('hardhat');
const Web3 = require('web3');
const { utils } = require("ethers");

export async function main() {
    const storageContractAddress = process.env.ROCKET_STORAGE;
    if(!storageContractAddress) {
        console.log("Invalid storage address.")
        return
    }
    const contract = artifacts.require('PoolseaStorage');

    const network = hre.network;
    let $web3 = new Web3(network.provider);

    // Accounts
    let accounts = await $web3.eth.getAccounts(function(error, result) {
        if(error != null) {
            console.log(error);
            console.log("Error retrieving accounts.'");
        }
        return result;
    });
    const deployedStorageContract = await contract.at(storageContractAddress);
    const encodedSetting = utils.keccak256(utils.solidityPack(['string', 'string'], ['dao.protocol.setting.', 'node']));
    const encoded = utils.keccak256(utils.solidityPack(['bytes32', 'string'], [encodedSetting, 'node.deposit.enabled']));
    const encodedReg = utils.keccak256(utils.solidityPack(['bytes32', 'string'], [encodedSetting, 'node.registration.enabled']));
    await deployedStorageContract.setBool(encoded, true);
    await deployedStorageContract.setBool(encodedReg, true);
}

main().catch(e => {
    console.error(e);
    process.exit(0);
});
