/*** Dependencies ********************/
import { RocketStorage } from '../_utils/artifacts';

const hre = require('hardhat');
const pako = require('pako');
const fs = require('fs');
const Web3 = require('web3');


/*** Utility Methods *****************/


// Compress / decompress ABIs
function compressABI(abi) {
    return Buffer.from(pako.deflate(JSON.stringify(abi))).toString('base64');
}
function decompressABI(abi) {
    return JSON.parse(pako.inflate(Buffer.from(abi, 'base64'), {to: 'string'}));
}

// Load ABI files and parse
function loadABI(abiFilePath) {
    return JSON.parse(fs.readFileSync(abiFilePath));
}


/*** Contracts ***********************/


// Storage
const rocketStorage =                       artifacts.require('PoolseaStorage.sol');

// Network contracts
const contracts = {
    // Vault
    rocketVault:                              artifacts.require('PoolseaVault.sol'),
    // Tokens
    rocketTokenRPLFixedSupply:                artifacts.require('PoolseaTokenDummyRPL.sol'),
    rocketTokenRETH:                          artifacts.require('PoolseaTokenRETH.sol'),
    rocketTokenRPL:                           artifacts.require('PoolseaTokenRPL.sol'),
    // Auction
    rocketAuctionManager:                     artifacts.require('PoolseaAuctionManager.sol'),
    // Deposit
    rocketDepositPool:                        artifacts.require('PoolseaDepositPoolOld.sol'),
    // Minipool
    rocketMinipoolDelegate:                   artifacts.require('PoolseaMinipoolDelegateOld.sol'),
    rocketMinipoolManager:                    artifacts.require('RocketMinipoolManagerOld.sol'),
    rocketMinipoolQueue:                      artifacts.require('PoolseaMinipoolQueueOld.sol'),
    rocketMinipoolStatus:                     artifacts.require('PoolseaMinipoolStatus.sol'),
    rocketMinipoolPenalty:                    artifacts.require('PoolseaMinipoolPenalty.sol'),
    // Network
    rocketNetworkBalances:                    artifacts.require('PoolseaNetworkBalancesOld.sol'),
    rocketNetworkFees:                        artifacts.require('PoolseaNetworkFeesOld.sol'),
    rocketNetworkPrices:                      artifacts.require('PoolseaNetworkPricesOld.sol'),
    rocketNetworkPenalties:                   artifacts.require('PoolseaNetworkPenalties.sol'),
    // Rewards
    rocketRewardsPool:                        artifacts.require('PoolseaRewardsPoolOld.sol'),
    rocketClaimDAO:                           artifacts.require('PoolseaClaimDAO.sol'),
    // Node
    rocketNodeDeposit:                        artifacts.require('PoolseaNodeDepositOld.sol'),
    rocketNodeManager:                        artifacts.require('PoolseaNodeManagerOld.sol'),
    rocketNodeStaking:                        artifacts.require('PoolseaNodeStakingOld.sol'),
    // DAOs
    rocketDAOProposal:                        artifacts.require('PoolseaDAOProposal.sol'),
    rocketDAONodeTrusted:                     artifacts.require('PoolseaDAONodeTrusted.sol'),
    rocketDAONodeTrustedProposals:            artifacts.require('PoolseaDAONodeTrustedProposals.sol'),
    rocketDAONodeTrustedActions:              artifacts.require('PoolseaDAONodeTrustedActions.sol'),
    rocketDAONodeTrustedUpgrade:              artifacts.require('PoolseaDAONodeTrustedUpgrade.sol'),
    rocketDAONodeTrustedSettingsMembers:      artifacts.require('PoolseaDAONodeTrustedSettingsMembers.sol'),
    rocketDAONodeTrustedSettingsProposals:    artifacts.require('PoolseaDAONodeTrustedSettingsProposals.sol'),
    rocketDAONodeTrustedSettingsMinipool:     artifacts.require('PoolseaDAONodeTrustedSettingsMinipoolOld.sol'),
    rocketDAOProtocol:                        artifacts.require('PoolseaDAOProtocol.sol'),
    rocketDAOProtocolProposals:               artifacts.require('PoolseaDAOProtocolProposals.sol'),
    rocketDAOProtocolActions:                 artifacts.require('PoolseaDAOProtocolActions.sol'),
    rocketDAOProtocolSettingsInflation:       artifacts.require('PoolseaDAOProtocolSettingsInflation.sol'),
    rocketDAOProtocolSettingsRewards:         artifacts.require('PoolseaDAOProtocolSettingsRewards.sol'),
    rocketDAOProtocolSettingsAuction:         artifacts.require('PoolseaDAOProtocolSettingsAuction.sol'),
    rocketDAOProtocolSettingsNode:            artifacts.require('PoolseaDAOProtocolSettingsNodeOld.sol'),
    rocketDAOProtocolSettingsNetwork:         artifacts.require('PoolseaDAOProtocolSettingsNetwork.sol'),
    rocketDAOProtocolSettingsDeposit:         artifacts.require('PoolseaDAOProtocolSettingsDepositOld.sol'),
    rocketDAOProtocolSettingsMinipool:        artifacts.require('PoolseaDAOProtocolSettingsMinipoolOld.sol'),
    // v1.1
    rocketMerkleDistributorMainnet:           artifacts.require('PoolseaMerkleDistributorMainnet.sol'),
    rocketDAONodeTrustedSettingsRewards:      artifacts.require('PoolseaDAONodeTrustedSettingsRewards.sol'),
    rocketSmoothingPool:                      artifacts.require('PoolseaSmoothingPool.sol'),
    rocketNodeDistributorFactory:             artifacts.require('PoolseaNodeDistributorFactory.sol'),
    rocketNodeDistributorDelegate:            artifacts.require('PoolseaNodeDistributorDelegateOld.sol'),
    rocketMinipoolFactory:                    artifacts.require('PoolseaMinipoolFactoryOld.sol'),
    // v1.2
    rocketNodeDepositNew:                     artifacts.require('PoolseaNodeDeposit.sol'),
    rocketMinipoolDelegateNew:                artifacts.require('PoolseaMinipoolDelegate.sol'),
    rocketDAOProtocolSettingsMinipoolNew:     artifacts.require('PoolseaDAOProtocolSettingsMinipool.sol'),
    rocketMinipoolQueueNew:                   artifacts.require('PoolseaMinipoolQueue.sol'),
    rocketDepositPoolNew:                     artifacts.require('PoolseaDepositPool.sol'),
    rocketDAOProtocolSettingsDepositNew:      artifacts.require('PoolseaDAOProtocolSettingsDeposit.sol'),
    rocketMinipoolManagerNew:                 artifacts.require('PoolseaMinipoolManager.sol'),
    rocketNodeStakingNew:                     artifacts.require('PoolseaNodeStaking.sol'),
    rocketNodeDistributorDelegateNew:         artifacts.require('PoolseaNodeDistributorDelegate.sol'),
    rocketMinipoolFactoryNew:                 artifacts.require('PoolseaMinipoolFactory.sol'),
    rocketNetworkFeesNew:                     artifacts.require('PoolseaNetworkFees.sol'),
    rocketNetworkPricesNew:                   artifacts.require('PoolseaNetworkPrices.sol'),
    rocketMinipoolBase:                       artifacts.require('PoolseaMinipoolBase.sol'),
    rocketDAONodeTrustedSettingsMinipoolNew:  artifacts.require('PoolseaDAONodeTrustedSettingsMinipool.sol'),
    rocketNodeManagerNew:                     artifacts.require('PoolseaNodeManager.sol'),
    rocketDAOProtocolSettingsNodeNew:         artifacts.require('PoolseaDAOProtocolSettingsNode.sol'),
    rocketRewardsPoolNew:                     artifacts.require('PoolseaRewardsPool.sol'),
    rocketMinipoolBondReducer:                artifacts.require('PoolseaMinipoolBondReducer.sol'),
    rocketNetworkBalancesNew:                 artifacts.require('PoolseaNetworkBalances.sol'),
    rocketUpgradeOneDotTwo:                   artifacts.require('PoolseaUpgradeOneDotTwo.sol'),
    // Utils
    addressQueueStorage:                      artifacts.require('AddressQueueStorage.sol'),
    addressSetStorage:                        artifacts.require('AddressSetStorage.sol'),
};

// Development helper contracts
const revertOnTransfer = artifacts.require('RevertOnTransfer.sol');
const rocketNodeDepositLEB4 = artifacts.require('PoolseaNodeDepositLEB4.sol');

// Instance contract ABIs
const abis = {
    // Minipool
    rocketMinipool:                           [artifacts.require('PoolseaMinipoolDelegateOld.sol'), artifacts.require('PoolseaMinipoolOld.sol')],
};

// Construct ABI for rocketMinipool
const rocketMinipoolAbi = []
    .concat(artifacts.require('PoolseaMinipoolDelegate.sol').abi)
    .concat(artifacts.require('PoolseaMinipoolBase.sol').abi)
    .filter(i => i.type !== 'fallback' && i.type !== 'receive');

rocketMinipoolAbi.push({ stateMutability: 'payable', type: 'fallback'});
rocketMinipoolAbi.push({ stateMutability: 'payable', type: 'receive'});

/*** Deployment **********************/


// Deploy Rocket Pool
export async function deployRocketPool() {
    // Set our web3 provider
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

    console.log(`Using network: ${network.name}`);
    console.log(`Deploying from: ${accounts[0]}`)
    console.log('\n');

    const casperDepositABI = loadABI('./contracts/contract/casper/compiled/Deposit.abi');

    // Live deployment
    if ( network.name === 'live' ) {
        // Casper live contract address
        let casperDepositAddress = '0x00000000219ab540356cBB839Cbe05303d7705Fa';
        contracts.casperDeposit = {
            address: casperDepositAddress,
            abi: casperDepositABI,
            precompiled: true
        };
        // Add our live RPL token address in place
        contracts.rocketTokenRPLFixedSupply.address = '0xb4efd85c19999d84251304bda99e90b92300bd93';
    }

    // Goerli test network
    else if (network.name === 'goerli') {
        // Casper deposit contract details
        const casperDepositAddress = '0xff50ed3d0ec03ac01d4c79aad74928bff48a7b2b';       // Prater
        contracts.casperDeposit = {
            address: casperDepositAddress,
            abi: casperDepositABI,
            precompiled: true
        };
    }

    // Test network deployment
    else {
        // Precompiled - Casper Deposit Contract
        const casperDeposit = new $web3.eth.Contract(casperDepositABI, null, {
            from: accounts[0],
            gasPrice: '20000000000' // 20 gwei
        });

        // Create the contract now
        const casperDepositContract = await casperDeposit.deploy(
            // Casper deployment
            {
                data: fs.readFileSync('./contracts/contract/casper/compiled/Deposit.bin').toString()
            }).send({
            from: accounts[0],
            gas: 8000000,
            gasPrice: '20000000000'
        });

        // Set the Casper deposit address
        let casperDepositAddress = casperDepositContract._address;

        // Store it in storage
        contracts.casperDeposit = {
            address: casperDepositAddress,
            abi: casperDepositABI,
            precompiled: true
        };
    }

    // Deploy rocketStorage first - has to be done in this order so that the following contracts already know the storage address
    const rs = await rocketStorage.new();
    rocketStorage.setAsDeployed(rs);
    const rsTx = await $web3.eth.getTransactionReceipt(rs.transactionHash);
    const deployBlock = rsTx.blockNumber;
    // Update the storage with the new addresses
    let rocketStorageInstance = await rocketStorage.deployed();

    // Deploy other contracts - have to be inside an async loop
    const deployContracts = async function() {
        for (let contract in contracts) {
            // Only deploy if it hasn't been deployed already like a precompiled
            let instance
            if(!contracts[contract].hasOwnProperty('precompiled')) {
                switch (contract) {

                    // New RPL contract - pass storage address & existing RPL contract address
                    case 'rocketTokenRPL':
                        instance = await contracts[contract].new(rocketStorageInstance.address, (await contracts.rocketTokenRPLFixedSupply.deployed()).address);
                        contracts[contract].setAsDeployed(instance);
                        break;

                    // Contracts with no constructor args
                    case 'rocketMinipoolDelegate':
                    case 'rocketNodeDistributorDelegate':
                    case 'rocketNodeDistributorDelegateNew':
                    case 'rocketMinipoolBase':
                        instance = await contracts[contract].new();
                        contracts[contract].setAsDeployed(instance);
                        break;

                    // Upgrade rewards
                    case 'rocketUpgradeOneDotTwo':
                        const upgrader = await contracts[contract].new(rocketStorageInstance.address);
                        contracts[contract].setAsDeployed(upgrader);
                        const args = [
                            [
                                // compressABI(contracts.rocketContract.abi),
                                (await contracts.rocketNodeDepositNew.deployed()).address,
                                (await contracts.rocketMinipoolDelegateNew.deployed()).address,
                                (await contracts.rocketDAOProtocolSettingsMinipoolNew.deployed()).address,
                                (await contracts.rocketMinipoolQueueNew.deployed()).address,
                                (await contracts.rocketDepositPoolNew.deployed()).address,
                                (await contracts.rocketDAOProtocolSettingsDepositNew.deployed()).address,
                                (await contracts.rocketMinipoolManagerNew.deployed()).address,
                                (await contracts.rocketNodeStakingNew.deployed()).address,
                                (await contracts.rocketNodeDistributorDelegateNew.deployed()).address,
                                (await contracts.rocketMinipoolFactoryNew.deployed()).address,
                                (await contracts.rocketNetworkFeesNew.deployed()).address,
                                (await contracts.rocketNetworkPricesNew.deployed()).address,
                                (await contracts.rocketDAONodeTrustedSettingsMinipoolNew.deployed()).address,
                                (await contracts.rocketNodeManagerNew.deployed()).address,
                                (await contracts.rocketDAOProtocolSettingsNodeNew.deployed()).address,
                                (await contracts.rocketNetworkBalancesNew.deployed()).address,
                                (await contracts.rocketRewardsPoolNew.deployed()).address,
                                (await contracts.rocketMinipoolBase.deployed()).address,
                                (await contracts.rocketMinipoolBondReducer.deployed()).address,
                            ],
                            [
                                // compressABI(contracts.rocketContract.abi),
                                compressABI(contracts.rocketNodeDepositNew.abi),
                                compressABI(contracts.rocketMinipoolDelegateNew.abi),
                                compressABI(contracts.rocketDAOProtocolSettingsMinipoolNew.abi),
                                compressABI(contracts.rocketMinipoolQueueNew.abi),
                                compressABI(contracts.rocketDepositPoolNew.abi),
                                compressABI(contracts.rocketDAOProtocolSettingsDepositNew.abi),
                                compressABI(contracts.rocketMinipoolManagerNew.abi),
                                compressABI(contracts.rocketNodeStakingNew.abi),
                                compressABI(contracts.rocketNodeDistributorDelegateNew.abi),
                                compressABI(contracts.rocketMinipoolFactoryNew.abi),
                                compressABI(contracts.rocketNetworkFeesNew.abi),
                                compressABI(contracts.rocketNetworkPricesNew.abi),
                                compressABI(contracts.rocketDAONodeTrustedSettingsMinipoolNew.abi),
                                compressABI(contracts.rocketNodeManagerNew.abi),
                                compressABI(contracts.rocketDAOProtocolSettingsNodeNew.abi),
                                compressABI(contracts.rocketNetworkBalancesNew.abi),
                                compressABI(contracts.rocketRewardsPoolNew.abi),
                                compressABI(contracts.rocketMinipoolBase.abi),
                                compressABI(contracts.rocketMinipoolBondReducer.abi),
                                compressABI(rocketMinipoolAbi),
                            ],
                        ]
                        await upgrader.set(...args)
                        break;

                    // All other contracts - pass storage address
                    default:
                        instance = await contracts[contract].new(rocketStorageInstance.address);
                        contracts[contract].setAsDeployed(instance);
                        // Slight hack to allow gas optimisation using immutable addresses for non-upgradable contracts
                        if (contract === 'rocketVault' || contract === 'rocketTokenRETH') {
                            await rocketStorageInstance.setAddress(
                                $web3.utils.soliditySha3('contract.address', contract),
                                (await contracts[contract].deployed()).address
                            );
                        }
                        break;

                }
            }
        }
    };
    // Run it
    await deployContracts();

    // Register all other contracts with storage and store their abi
    const addContracts = async function() {
        // Log RocketStorage
        console.log('\x1b[31m%s\x1b[0m:', '   Set Storage Address');
        console.log('     ' + (await rocketStorage.deployed()).address);
        // Add Rocket Storage to deployed contracts
        contracts.rocketStorage = artifacts.require('PoolseaStorage.sol');
        // Now process the rest
        for (let contract in contracts) {
            if(contracts.hasOwnProperty(contract)) {
                switch (contract) {
                    // Ignore contracts that will be upgraded later
                    case 'rocketNodeDepositNew':
                    case 'rocketMinipoolDelegateNew':
                    case 'rocketDAOProtocolSettingsMinipoolNew':
                    case 'rocketMinipoolQueueNew':
                    case 'rocketDepositPoolNew':
                    case 'rocketDAOProtocolSettingsDepositNew':
                    case 'rocketMinipoolManagerNew':
                    case 'rocketNodeStakingNew':
                    case 'rocketNodeDistributorDelegateNew':
                    case 'rocketMinipoolFactoryNew':
                    case 'rocketNetworkFeesNew':
                    case 'rocketNetworkPricesNew':
                    case 'rocketDAONodeTrustedSettingsMinipoolNew':
                    case 'rocketNodeManagerNew':
                    case 'rocketDAOProtocolSettingsNodeNew':
                    case 'rocketNetworkBalancesNew':
                    case 'rocketRewardsPoolNew':
                    case 'rocketMinipoolBase':
                    case 'rocketMinipoolBondReducer':
                        break;

                    default:
                        const address = contract === 'casperDeposit' ? contracts[contract].address : (await contracts[contract].deployed()).address;

                        // Log it
                        console.log('\x1b[31m%s\x1b[0m:', '   Set Storage ' + contract + ' Address');
                        console.log('     ' + address);
                        // Register the contract address as part of the network
                        await rocketStorageInstance.setBool(
                            $web3.utils.soliditySha3('contract.exists', address),
                            true
                        );
                        // Register the contract's name by address
                        await rocketStorageInstance.setString(
                            $web3.utils.soliditySha3('contract.name', address),
                            contract
                        );
                        // Register the contract's address by name (rocketVault and rocketTokenRETH addresses already stored)
                        if (!(contract === 'rocketVault' || contract === 'rocketTokenRETH')) {
                            await rocketStorageInstance.setAddress(
                                $web3.utils.soliditySha3('contract.address', contract),
                                address
                            );
                        }
                        // Compress and store the ABI by name
                        await rocketStorageInstance.setString(
                            $web3.utils.soliditySha3('contract.abi', contract),
                            compressABI(contracts[contract].abi)
                        );
                        break;
                }
            }
        }
    };

    // Register ABI-only contracts
    const addABIs = async function() {
        for (let contract in abis) {
            if(abis.hasOwnProperty(contract)) {
                console.log('\x1b[31m%s\x1b[0m:', '   Set Storage ABI');
                console.log('     '+contract);
                if(Array.isArray(abis[contract])) {
                    // Merge ABIs from multiple artifacts
                    let combinedAbi = [];
                    for (const artifact of abis[contract]) {
                        combinedAbi = combinedAbi.concat(artifact.abi);
                    }
                    // Compress and store the ABI
                    await rocketStorageInstance.setString(
                        $web3.utils.soliditySha3('contract.abi', contract),
                        compressABI(combinedAbi)
                    );
                } else {
                    // Compress and store the ABI
                    await rocketStorageInstance.setString(
                        $web3.utils.soliditySha3('contract.abi', contract),
                        compressABI(abis[contract].abi)
                    );
                }
            }
        }
    };

    // Run it
    console.log('\x1b[34m%s\x1b[0m', '  Deploy Contracts');
    console.log('\x1b[34m%s\x1b[0m', '  ******************************************');
    await addContracts();
    console.log('\n');
    console.log('\x1b[34m%s\x1b[0m', '  Set ABI Only Storage');
    console.log('\x1b[34m%s\x1b[0m', '  ******************************************');
    await addABIs();

    // Store deployed block
    console.log('\n');
    console.log('Setting deploy.block to ' + deployBlock);
    await rocketStorageInstance.setUint(
        $web3.utils.soliditySha3('deploy.block'),
        deployBlock
    );

    // Disable direct access to storage now
    await rocketStorageInstance.setDeployedStatus();
    if(await rocketStorageInstance.getDeployedStatus() !== true) throw 'Storage Access Not Locked Down!!';

    // Log it
    console.log('\n');
    console.log('\x1b[32m%s\x1b[0m', '  Storage Direct Access For Owner Removed... Lets begin! :)');
    console.log('\n');

    // Deploy development help contracts
    if (network.name !== 'live' && network.name !== 'goerli') {
        let instance = await revertOnTransfer.new();
        revertOnTransfer.setAsDeployed(instance);

        instance = await rocketNodeDepositLEB4.new(rocketStorageInstance.address);
        rocketNodeDepositLEB4.setAsDeployed(instance);
    }

    // Perform upgrade if we are not running in test environment
    if (network.name !== 'hardhat') {
        console.log('Executing upgrade to v1.2')
        const RocketUpgradeOneDotTwo = artifacts.require('RocketUpgradeOneDotTwo')
        const rocketUpgradeOneDotTwo = await RocketUpgradeOneDotTwo.deployed();
        await rocketUpgradeOneDotTwo.execute({ from: accounts[0] });
    }
};
