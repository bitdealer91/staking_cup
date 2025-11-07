// node scripts/test-contract-read.mjs
// Minimal on-chain read diagnostics for NodeCommitteeV2 and SomniaStaking

import { createPublicClient, http } from 'viem'
import { readContract } from 'viem/actions'

// Import ABIs from repo
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const nodeCommitteeAbi = require('../components/abi/NodeCommitteeV2.json')
const stakingAbi = require('../components/abi/SomniaStaking.json')

const env = (k, d) => process.env[k] || d

const RPC = env('RPC_URL', env('NEXT_PUBLIC_NEW_CHAIN_RPC_URL', 'https://dream-rpc.somnia.network'))
const NODE_COMMITTEE = env('NODE_COMMITTEE', env('NEXT_PUBLIC_NODE_COMMITTEE_ADDRESS', ''))
const STAKING = env('STAKING_ADDRESS', env('NEXT_PUBLIC_STAKING_ADDRESS', ''))
const USER = env('USER_ADDRESS', '')
const VALIDATOR = env('VALIDATOR_ADDRESS', '')

const client = createPublicClient({ transport: http(RPC) })

function logHeader(title) {
  console.log('\n=== ' + title + ' ===')
}

async function readCommittee() {
  logHeader('Committee (getCurrentEpochCommittee)')
  if (!NODE_COMMITTEE) {
    console.log('Skip: NODE_COMMITTEE not provided')
    return
  }
  try {
    const res = await readContract(
      client,
      {
        address: NODE_COMMITTEE,
        abi: nodeCommitteeAbi.abi,
        functionName: 'getCurrentEpochCommittee',
      }
    )
    // Committee returns array of structs; map key fields if present
    const normalized = Array.isArray(res)
      ? res.map((x) => {
          const obj = {}
          if (x?.nodeAddress) obj.nodeAddress = x.nodeAddress
          if (x?.stakedAmount) obj.stakedAmount = x.stakedAmount?.toString?.() || String(x.stakedAmount)
          return Object.keys(obj).length ? obj : x
        })
      : res
    console.dir(normalized, { depth: 4 })
  } catch (e) {
    console.error('Committee call failed:', e?.message || e)
  }
}

async function readValidatorTotals() {
  logHeader('Validator totals (getValidatorTotalStakeAmount)')
  if (!STAKING || !VALIDATOR) {
    console.log('Skip: STAKING or VALIDATOR not provided')
    return
  }
  try {
    const total = await readContract(
      client,
      {
        address: STAKING,
        abi: stakingAbi.abi,
        functionName: 'getValidatorTotalStakeAmount',
        args: [VALIDATOR],
      }
    )
    console.log('totalStakeWei:', total?.toString?.() || String(total))
  } catch (e) {
    console.error('Validator total failed:', e?.message || e)
  }
}

async function readMyDelegation() {
  logHeader('My delegation (getDelegationByValidator / getDelegatedStakerRewards)')
  if (!STAKING || !VALIDATOR || !USER) {
    console.log('Skip: STAKING, VALIDATOR or USER not provided')
    return
  }
  try {
    const amount = await readContract(
      client,
      {
        address: STAKING,
        abi: stakingAbi.abi,
        functionName: 'getDelegationByValidator',
        args: [USER, VALIDATOR],
      }
    )
    const rewards = await readContract(
      client,
      {
        address: STAKING,
        abi: stakingAbi.abi,
        functionName: 'getDelegatedStakerRewards',
        args: [VALIDATOR, USER],
      }
    )
    console.log('delegatedWei:', amount?.toString?.() || String(amount))
    console.log('pendingRewardsWei:', rewards?.toString?.() || String(rewards))
  } catch (e) {
    console.error('Delegation reads failed:', e?.message || e)
  }
}

async function main() {
  console.log('RPC_URL =', RPC)
  console.log('NODE_COMMITTEE =', NODE_COMMITTEE)
  console.log('STAKING_ADDRESS =', STAKING)
  console.log('VALIDATOR_ADDRESS =', VALIDATOR)
  console.log('USER_ADDRESS =', USER)

  await readCommittee()
  await readValidatorTotals()
  await readMyDelegation()
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})


