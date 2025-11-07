import { GraphQLClient, gql } from 'graphql-request';

// Updated default endpoint to the newer, working subgraph
const DEFAULT_ENDPOINT = 'https://api.subgraph.somnia.network/api/public/5960cba9-bbe6-46a5-88d8-df408b2cfc58/subgraphs/somnia-staking/v2025-10-16-1/gn';

export const getSubgraphClient = () => {
  const endpoint = process.env.NEXT_PUBLIC_STAKING_SUBGRAPH_URL || DEFAULT_ENDPOINT;
  return new GraphQLClient(endpoint, { headers: { 'content-type': 'application/json' } });
};

// Newer schema: flattens amounts on staker.totalDelegated and uses validatorAddress
export const TOP_DELEGATORS_QUERY_FLAT = gql`
  query TopDelegationsByValidatorFlat(
    $validatorId: Bytes!, $first: Int! = 10, $skip: Int! = 0, $minAmount: BigInt = "0"
  ) {
    delegations(
      first: $first
      skip: $skip
      where: { validatorAddress: $validatorId, staker_: { totalDelegated_gt: $minAmount } }
      orderBy: staker__totalDelegated
      orderDirection: desc
    ) {
      id
      validatorAddress
      staker { id totalDelegated }
    }
  }
`;

export interface TopDelegator {
  stakerId: string;
  amountWei: string;
  updatedAt: number;
}

export async function fetchTopDelegators(validatorAddress: string, first = 10, minAmountWei = '0'): Promise<TopDelegator[]> {
  const client = getSubgraphClient();
  const variables = {
    validatorId: validatorAddress.toLowerCase(),
    first,
    skip: 0,
    minAmount: minAmountWei,
  } as any;
  const data = await client.request<any>(TOP_DELEGATORS_QUERY_FLAT, variables);
  const list = (data?.delegations || []) as Array<any>;
  return list.map((d) => ({
    stakerId: d?.staker?.id || '',
    amountWei: d?.staker?.totalDelegated || '0',
    updatedAt: 0,
  }));
}

// Paginate through delegations to compute a staker's rank by amount (desc)
export async function fetchDelegatorRank(
  validatorAddress: string,
  stakerId: string,
  minAmountWei: string = '0',
  pageSize: number = 1000,
  maxPages: number = 20
): Promise<{ rank: number | null; top10ThresholdWei: string | null }> {
  const client = getSubgraphClient();
  let skip = 0;
  let rank: number | null = null;
  let top10ThresholdWei: string | null = null;

  // Helper to fetch a page using the new schema
  async function fetchPage(first: number, skipVal: number) {
    const dataNew = await client.request<any>(TOP_DELEGATORS_QUERY_FLAT, {
      validatorId: validatorAddress.toLowerCase(),
      first,
      skip: skipVal,
      minAmount: minAmountWei,
    });
    const arrNew = (dataNew?.delegations || []) as Array<any>;
    return arrNew.map((d) => ({
      stakerId: d?.staker?.id || '',
      amountWei: d?.staker?.totalDelegated || '0',
    }));
  }

  for (let page = 0; page < maxPages; page++) {
    const list = await fetchPage(pageSize, skip);
    if (page === 0) {
      top10ThresholdWei = list.length >= 10 ? String(list[9]?.amountWei ?? '0') : null;
    }
    if (list.length === 0) break;

    const index = list.findIndex((d) => String(d?.stakerId || '').toLowerCase() === stakerId.toLowerCase());
    if (index >= 0) {
      rank = skip + index + 1;
      break;
    }
    skip += pageSize;
  }

  return { rank, top10ThresholdWei };
}


