import { NextRequest, NextResponse } from "next/server";

// Prefer env; fall back to known public endpoints if not provided
const SOMNIA_RPC_URL = process.env.SOMNIA_RPC_URL || process.env.NEXT_PUBLIC_NEW_CHAIN_RPC_URL || "http://34.32.136.59:9002";
const STAKING_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_STAKING_ADDRESS as string) || "0xbe367d410d96e1caef68c0632251072cdf1b8250";
const EPOCH_BLOCK_INTERVAL = 3000;

interface PrivilegedTransactionReceipt {
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  blockNumber: string;
  from: string;
  to: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  contractAddress: string | null;
  type: string;
  status: string;
  logsBloom: string;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
    blockNumber: string;
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    logIndex: string;
  }>;
  effectiveGasPrice: string;
}

interface EpochData {
  blockNumber: number;
  epochMovedData?: { epoch: bigint; timestamp: bigint };
  finaliseEpochData?: { totalRewards: bigint; timestamp: bigint };
}

const EPOCH_MOVED_SIGNATURE =
  "0x6debf9c0b8bd7ecda40db89a2641f61251d80a576b5c5e5f06de7f1c2a65850a";
const FINALISE_EPOCH_SIGNATURE =
  "0x2afb4df8a72287c619edfbbe7cb22d0fe5fa86bcaa5e9d249c264c4d9b97cd49";

async function makeRpcCall(method: string, params: any[]): Promise<any> {
  const response = await fetch(SOMNIA_RPC_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
    // Avoid caches
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`RPC call failed: ${response.statusText}`);
  const data = await response.json();
  if (data.error) throw new Error(`RPC error: ${data.error.message}`);
  return data.result;
}

async function getTotalStakedAmount(): Promise<bigint> {
  try {
    const result = await makeRpcCall("eth_call", [
      { to: STAKING_CONTRACT_ADDRESS, data: "0x817b1cd2" },
      "latest",
    ]);
    return BigInt(result);
  } catch {
    return 0n;
  }
}

function findEpochBlocks(currentBlock: number, count: number): number[] {
  const epochBlocks: number[] = [];
  let blockNumber = currentBlock;
  while (blockNumber % EPOCH_BLOCK_INTERVAL !== 2999 && blockNumber > 0) {
    blockNumber--;
  }
  while (epochBlocks.length < count && blockNumber > 0) {
    epochBlocks.push(blockNumber);
    blockNumber -= EPOCH_BLOCK_INTERVAL;
  }
  return epochBlocks;
}

function parseEventLogs(logs: any[]) {
  let epochMovedData: any;
  let finaliseEpochData: any;
  for (const log of logs) {
    if (log.topics[0] === EPOCH_MOVED_SIGNATURE) {
      const data = log.data.slice(2);
      const epoch = BigInt("0x" + data.slice(0, 64));
      const timestamp = BigInt("0x" + data.slice(64, 128));
      epochMovedData = { epoch, timestamp };
    } else if (log.topics[0] === FINALISE_EPOCH_SIGNATURE) {
      const data = log.data.slice(2);
      const totalRewards = BigInt("0x" + data.slice(0, 64));
      const timestamp = BigInt("0x" + data.slice(64, 128));
      finaliseEpochData = { totalRewards, timestamp };
    }
  }
  return { epochMovedData, finaliseEpochData };
}

function calculateAverages(epochDataArray: EpochData[]) {
  const valids = epochDataArray.filter((d) => d.epochMovedData && d.finaliseEpochData);
  if (valids.length === 0) {
    return { averageRewards: 0, averageEpochDuration: 0, totalEpochs: 0, validEpochs: 0 };
  }
  let totalRewards = 0n;
  let totalDuration = 0n;
  for (let i = 0; i < valids.length; i++) {
    const cur = valids[i];
    totalRewards += cur.finaliseEpochData!.totalRewards;
    if (i < valids.length - 1) {
      const prev = valids[i + 1];
      totalDuration += cur.epochMovedData!.timestamp - prev.epochMovedData!.timestamp;
    }
  }
  const averageRewards = valids.length > 0 ? Number(totalRewards / BigInt(valids.length)) / 1e18 : 0;
  const averageEpochDuration = valids.length > 1 ? Number(totalDuration / BigInt(valids.length - 1)) : 0;
  return { averageRewards, averageEpochDuration, totalEpochs: epochDataArray.length, validEpochs: valids.length };
}

export async function GET(_req: NextRequest) {
  try {
    const directBlock = await fetch(SOMNIA_RPC_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: Date.now() }),
      cache: "no-store",
    });
    const directBlockResult = await directBlock.json();
    const currentBlock = parseInt(directBlockResult.result, 16);

    const totalStakedWei = await getTotalStakedAmount();
    const totalStakedETH = Number(totalStakedWei) / 1e18;
    const epochBlocks = findEpochBlocks(currentBlock, 100);
    if (epochBlocks.length === 0) {
      return NextResponse.json({ error: "No epoch blocks found", currentBlock }, { status: 404 });
    }

    const epochDataArray: EpochData[] = await Promise.all(
      epochBlocks.map(async (blockNumber) => {
        try {
          const blockNumberHex = "0x" + blockNumber.toString(16);
          let receipts: PrivilegedTransactionReceipt[] = [];
          try {
            receipts = await makeRpcCall("somnia_getPrivilegedTransactionReceiptsForBlockByNumber", [blockNumberHex]);
          } catch (error) {
            const block = await makeRpcCall("eth_getBlockByNumber", [blockNumberHex, false]);
            if (!block?.hash) throw error;
            receipts = await makeRpcCall("somnia_getPrivilegedTransactionReceiptsForBlockByHash", [block.hash]);
          }
          let epochMovedData: any;
          let finaliseEpochData: any;
          for (const r of receipts) {
            const parsed = parseEventLogs(r.logs);
            if (parsed.epochMovedData) epochMovedData = parsed.epochMovedData;
            if (parsed.finaliseEpochData) finaliseEpochData = parsed.finaliseEpochData;
          }
          return { blockNumber, epochMovedData, finaliseEpochData };
        } catch {
          return { blockNumber } as EpochData;
        }
      })
    );

    const averages = calculateAverages(epochDataArray);
    const secondsPerYear = 365.25 * 24 * 60 * 60;
    const epochsPerYear = averages.averageEpochDuration > 0 ? secondsPerYear / averages.averageEpochDuration : 0;
    const annualizedRewards = averages.averageRewards * epochsPerYear;
    const apr = totalStakedETH > 0 ? (annualizedRewards / totalStakedETH) * 100 : 0;
    const epochsPerYearRounded = Math.floor(epochsPerYear);
    const rewardRatePerEpoch = totalStakedETH > 0 ? averages.averageRewards / totalStakedETH : 0;
    const apy = epochsPerYearRounded > 0 && rewardRatePerEpoch > 0 ? (Math.pow(1 + rewardRatePerEpoch, epochsPerYearRounded) - 1) * 100 : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          currentBlock,
          totalStaked: { wei: totalStakedWei.toString(), eth: totalStakedETH },
          epochBlocks: epochBlocks.slice(0, 10),
          averages: { ...averages, annualizedRewards, epochsPerYear },
          yields: { apr, apy, rewardRatePerEpoch },
          calculatedAt: new Date().toISOString(),
          serverTime: Date.now(),
        },
      },
      { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to calculate APR", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
    );
  }
}





