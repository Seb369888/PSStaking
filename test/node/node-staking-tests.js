import {
    PoolseaDAONodeTrustedSettingsMinipool, PoolseaDAOProtocolSettingsMinipool,
    PoolseaNodeStaking,
} from '../_utils/artifacts';
import { printTitle } from '../_utils/formatting';
import { shouldRevert } from '../_utils/testing';
import {
    registerNode,
    nodeStakeRPL,
    nodeDeposit,
    setNodeTrusted,
    nodeStakeRPLFor,
    setStakeRPLForAllowed,
} from '../_helpers/node';
import { mintRPL, approveRPL } from '../_helpers/tokens';
import { stakeRpl } from './scenario-stake-rpl';
import { withdrawRpl } from './scenario-withdraw-rpl';
import { createMinipool, stakeMinipool } from '../_helpers/minipool'
import { beginUserDistribute, withdrawValidatorBalance } from '../minipool/scenario-withdraw-validator-balance';
import { userDeposit } from '../_helpers/deposit'
import { increaseTime } from '../_utils/evm'
import { setDAONodeTrustedBootstrapSetting } from '../dao/scenario-dao-node-trusted-bootstrap';
import { upgradeOneDotTwo } from '../_utils/upgrade';
import { setDAOProtocolBootstrapSetting, setRewardsClaimIntervalTime } from '../dao/scenario-dao-protocol-bootstrap';

export default function() {
    contract('PoolseaNodeStaking', async (accounts) => {


        // Accounts
        const [
            owner,
            node,
            trustedNode,
            random,
        ] = accounts;

        let scrubPeriod = (60 * 60 * 24); // 24 hours
        const userDistributeStartTime = 60 * 60 * 24 * 90; // 90 days

        // Setup
        let poolseaNodeStaking;
        before(async () => {
            await upgradeOneDotTwo(owner);

            // Load contracts
            poolseaNodeStaking = await PoolseaNodeStaking.deployed();

            // Set settings
            await setDAONodeTrustedBootstrapSetting(PoolseaDAONodeTrustedSettingsMinipool, 'minipool.scrub.period', scrubPeriod, {from: owner});
            await setDAOProtocolBootstrapSetting(PoolseaDAOProtocolSettingsMinipool, 'minipool.user.distribute.window.start', userDistributeStartTime, {from: owner});

            // Register node
            await registerNode({from: node});

            // Register trusted node
            await registerNode({from: trustedNode});
            await setNodeTrusted(trustedNode, 'saas_1', 'node1@home.com', owner);

            // Mint RPL to accounts
            const rplAmount = '640000000'.ether;
            await mintRPL(owner, node, rplAmount);
            await mintRPL(owner, random, rplAmount);

        });


        it(printTitle('node operator', 'can stake POOL'), async () => {
            // Set parameters
            const rplAmount = '320000000'.ether;

            // Approve transfer & stake RPL once
            await approveRPL(poolseaNodeStaking.address, rplAmount, {from: node});
            await stakeRpl(rplAmount, {
                from: node,
            });

            // Make node deposit / create minipool
            await nodeDeposit({from: node, value: '16000000'.ether});

            // Approve transfer & stake RPL twice
            await approveRPL(poolseaNodeStaking.address, rplAmount, {from: node});
            await stakeRpl(rplAmount, {
                from: node,
            });
        });


        it(printTitle('random address', 'cannot stake POOL'), async () => {
            // Set parameters
            const rplAmount = '10000'.ether;

            // Approve transfer & attempt to stake RPL
            await approveRPL(poolseaNodeStaking.address, rplAmount, {from: node});
            await shouldRevert(stakeRpl(rplAmount, {
                from: random,
            }), 'Random address staked RPL');
        });


        it(printTitle('node operator', 'can withdraw staked POOL'), async () => {
            // Set parameters
            const rplAmount = '10000'.ether;

            // Remove withdrawal cooldown period
            await setRewardsClaimIntervalTime(0, {from: owner});

            // Stake RPL
            await nodeStakeRPL(rplAmount, {from: node});

            // Withdraw staked RPL
            await withdrawRpl(rplAmount, {
                from: node,
            });
        });


        it(printTitle('node operator', 'cannot withdraw staked POOL during the cooldown period'), async () => {
            // Set parameters
            const rplAmount = '10000'.ether;

            // Stake RPL
            await nodeStakeRPL(rplAmount, {from: node});

            // Withdraw staked RPL
            await shouldRevert(withdrawRpl(rplAmount, {
                from: node,
            }), 'Withdrew staked RPL during the cooldown period');
        });


        it(printTitle('node operator', 'cannot withdraw more POOL than they have staked'), async () => {
            // Set parameters
            const stakeAmount = '10000'.ether;
            const withdrawAmount = '20000'.ether;

            // Remove withdrawal cooldown period
            await setRewardsClaimIntervalTime(0, {from: owner});

            // Stake RPL
            await nodeStakeRPL(stakeAmount, {from: node});

            // Withdraw staked RPL
            await shouldRevert(withdrawRpl(withdrawAmount, {
                from: node,
            }), 'Withdrew more POOL than was staked');
        });


        it(printTitle('node operator', 'cannot withdraw POOL leaving the node undercollateralised'), async () => {
            // Set parameters
            const rplAmount = '320000000'.ether;

            // Remove withdrawal cooldown period
            await setRewardsClaimIntervalTime(0, {from: owner});

            // Stake RPL
            await nodeStakeRPL(rplAmount, {from: node});

            // Make node deposit / create minipool
            await nodeDeposit({from: node, value: '16000000'.ether});

            // Withdraw staked RPL
            await shouldRevert(withdrawRpl(rplAmount, {
                from: node,
            }), 'Withdrew POOL leaving the node undercollateralised');
        });


        it(printTitle('node operator', 'can withdraw POOL after finalising their minipool'), async () => {
            // Set parameters
            const rplAmount = '320000000'.ether;

            // Remove withdrawal cooldown period
            await setRewardsClaimIntervalTime(0, {from: owner});

            // Stake RPL
            await nodeStakeRPL(rplAmount, {from: node});

            // Create a staking minipool
            await userDeposit({from: random, value: '16000000'.ether});
            const minipool = await createMinipool({from: node, value: '16000000'.ether});
            await increaseTime(web3, scrubPeriod + 1);
            await stakeMinipool(minipool, {from: node});

            // Cannot withdraw RPL yet
            await shouldRevert(withdrawRpl(rplAmount, {
                from: node,
            }), 'Withdrew POOL leaving the node undercollateralised');

            // Still cannot withdraw RPL yet
            await shouldRevert(withdrawRpl(rplAmount, {
                from: node,
            }), 'Withdrew POOL leaving the node undercollateralised');

            // Withdraw and finalise
            await withdrawValidatorBalance(minipool, '32000000'.ether, node, true);

            // Should be able to withdraw now
            await withdrawRpl(rplAmount, {
                from: node,
            })
        });


        it(printTitle('node operator', 'cannot withdraw POOL if random distributes balance on their minipool until they finalise'), async () => {
            // Set parameters
            const rplAmount = '320000000'.ether;

            // Remove withdrawal cooldown period
            await setRewardsClaimIntervalTime(0, {from: owner});

            // Stake RPL
            await nodeStakeRPL(rplAmount, {from: node});

            // Create a staking minipool
            await userDeposit({from: random, value: '16000000'.ether});
            const minipool = await createMinipool({from: node, value: '16000000'.ether});
            await increaseTime(web3, scrubPeriod + 1);
            await stakeMinipool(minipool, {from: node});

            // Send ETH to the minipool to simulate receving from SWC
            await web3.eth.sendTransaction({
                from: trustedNode,
                to: minipool.address,
                value: '32000000'.ether
            });

            // Begin user distribution process
            await beginUserDistribute(minipool, {from: random});
            // Wait
            await increaseTime(web3, userDistributeStartTime + 1)
            // Withdraw without finalising
            await withdrawValidatorBalance(minipool, '0'.ether, random);

            // Cannot withdraw RPL yet
            await shouldRevert(withdrawRpl(rplAmount, {
                from: node,
            }), 'Withdrew POOL leaving the node undercollateralised');

            // Finalise the pool
            await minipool.finalise({from: node});

            // Should be able to withdraw now
            await withdrawRpl(rplAmount, {
                from: node,
            })
        });


        it(printTitle('random address', 'cannot withdraw staked POOL'), async () => {
            // Set parameters
            const rplAmount = '10000'.ether;

            // Remove withdrawal cooldown period
            await setRewardsClaimIntervalTime(0, {from: owner});

            // Stake RPL
            await nodeStakeRPL(rplAmount, {from: node});

            // Withdraw staked RPL
            await shouldRevert(withdrawRpl(rplAmount, {
                from: random,
            }), 'Random address withdrew staked POOL');
        });


        it(printTitle('random address', 'cannot stake on behalf of a node without allowance'), async () => {
            // Set parameters
            const rplAmount = '10000'.ether;

            // Stake RPL
            await shouldRevert(nodeStakeRPLFor(node, rplAmount, {from: random}), 'Was able to stake', 'Not allowed to stake for');
        });


        it(printTitle('random address', 'can stake on behalf of a node with allowance'), async () => {
            // Set parameters
            const rplAmount = '10000'.ether;

            // Allow
            await setStakeRPLForAllowed(random, true, {from: node});

            // Stake RPL
            await nodeStakeRPLFor(node, rplAmount, {from: random});
        });
    });
}
