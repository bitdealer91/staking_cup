// node scripts/test-subgraph-rank.mjs
// Quick rank check against the new flat-schema subgraph

import { GraphQLClient, gql } from 'graphql-request'

const SUBGRAPH = process.env.SUBGRAPH_URL || 'https://api.subgraph.somnia.network/api/public/5960cba9-bbe6-46a5-88d8-df408b2cfc58/subgraphs/somnia-staking/v2025-10-16-1/gn'
const VALIDATOR = (process.env.VALIDATOR_ADDRESS || '').toLowerCase()
const STAKER = (process.env.STAKER_ADDRESS || '').toLowerCase()

if (!VALIDATOR || !STAKER) {
  console.error('Usage: VALIDATOR_ADDRESS=0x... STAKER_ADDRESS=0x... node scripts/test-subgraph-rank.mjs')
  process.exit(1)
}

const TOP_QUERY = gql`
  query TopDelegationsByValidatorFlat($validatorId: Bytes!, $first: Int!, $skip: Int!, $minAmount: BigInt!) {
    delegations(
      first: $first
      skip: $skip
      where: { validatorAddress: $validatorId, staker_: { totalDelegated_gt: $minAmount } }
      orderBy: staker__totalDelegated
      orderDirection: desc
    ) {
      validatorAddress
      staker { id totalDelegated }
    }
  }
`

async function main() {
  const client = new GraphQLClient(SUBGRAPH)

  const first = 1000
  let skip = 0
  let rank = null
  let threshold = null

  for (let page = 0; page < 50; page++) {
    const data = await client.request(TOP_QUERY, { validatorId: VALIDATOR, first, skip, minAmount: '0' })
    const list = data?.delegations || []
    if (page === 0) {
      threshold = list.length >= 10 ? list[9]?.staker?.totalDelegated || null : null
    }
    if (list.length === 0) break
    const idx = list.findIndex((d) => String(d?.staker?.id || '').toLowerCase() === STAKER)
    if (idx >= 0) {
      rank = skip + idx + 1
      break
    }
    skip += first
  }

  console.log('Subgraph:', SUBGRAPH)
  console.log('Validator:', VALIDATOR)
  console.log('Staker:', STAKER)
  console.log('Rank:', rank)
  console.log('Top10 threshold (wei):', threshold)
}

main().catch((e) => { console.error(e); process.exit(1) })


