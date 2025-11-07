import { useState, useEffect, useCallback } from "react";

interface ApiResponse {
  success: boolean;
  data: {
    currentBlock: number;
    totalStaked: {
      wei: string;
      eth: number;
    };
    epochBlocks: number[];
    averages: {
      averageRewards: number;
      averageEpochDuration: number;
      totalEpochs: number;
      validEpochs: number;
      annualizedRewards: number;
      epochsPerYear: number;
    };
    yields: {
      apr: number;
      apy: number;
      rewardRatePerEpoch: number;
    };
    calculatedAt: string;
    serverTime: number;
  };
}

interface YieldData {
  apr: number;
  apy: number;
  rewardRatePerEpoch: number;
}

interface CachedData {
  data: YieldData;
  burnRate: number;
  realYield: number;
  timestamp: number;
}

// Total supply is 1 billion tokens
const TOTAL_SUPPLY = 1_000_000_000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_KEY = "apr-calculation-cache";

export const useAprData = () => {
  const [yieldData, setYieldData] = useState<YieldData | null>(null);
  const [burnRate, setBurnRate] = useState<number>(0);
  const [realYield, setRealYield] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedData = useCallback((): CachedData | null => {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return null;
    }

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsedCache: CachedData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid (within 5 minutes)
      if (now - parsedCache.timestamp < CACHE_DURATION) {
        return parsedCache;
      }

      // Cache expired, remove it
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error("Error reading cache:", error);
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(CACHE_KEY);
      }
      return null;
    }
  }, []);

  const setCachedData = useCallback(
    (data: YieldData, burnRate: number, realYield: number) => {
      // Check if we're in a browser environment
      if (
        typeof window === "undefined" ||
        typeof localStorage === "undefined"
      ) {
        return;
      }

      try {
        const cacheData: CachedData = {
          data,
          burnRate,
          realYield,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.error("Error setting cache:", error);
      }
    },
    []
  );

  const fetchYieldData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first unless force refresh is requested
        if (!forceRefresh) {
          const cached = getCachedData();
          if (cached) {
            setYieldData(cached.data);
            setBurnRate(cached.burnRate);
            setRealYield(cached.realYield);
            setLoading(false);
            return;
          }
        }

        // Try GCP Cloud Function first, fallback to local API
        let response;
        try {
          response = await fetch(
            "https://us-central1-quest-platform-442112.cloudfunctions.net/aprCalculation",
            {
              method: "GET",
              cache: "no-cache",
            }
          );
        } catch (gcpError) {
          console.warn(
            "GCP function failed, falling back to local API:",
            gcpError
          );
          // Fallback to local API route
          const timestamp = Date.now();
          response = await fetch(`/api/apr-calculation?t=${timestamp}`, {
            method: "GET",
            cache: "no-cache",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          });
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiData: ApiResponse = await response.json();

        if (apiData.success && apiData.data.yields && apiData.data.averages) {
          const newYieldData = apiData.data.yields;

          // Calculate burn rate: (Annualized Rewards Burnt / Total Supply) * 100
          const burnYield =
            (apiData.data.averages.annualizedRewards / TOTAL_SUPPLY) * 100;

          // Calculate real yield: Burn Rate + APY
          const realYieldValue = burnYield + newYieldData.apy;

          // Update state
          setYieldData(newYieldData);
          setBurnRate(burnYield);
          setRealYield(realYieldValue);

          // Cache the data
          setCachedData(newYieldData, burnYield, realYieldValue);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching yield data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch yield data"
        );
      } finally {
        setLoading(false);
      }
    },
    [getCachedData, setCachedData]
  );

  const refreshData = useCallback(() => {
    fetchYieldData(true);
  }, [fetchYieldData]);

  useEffect(() => {
    // Initial load - check cache first
    fetchYieldData(false);

    // Set up interval to refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchYieldData(false); // This will use cache if available, otherwise fetch fresh
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchYieldData]);

  return {
    yieldData,
    burnRate,
    realYield,
    loading,
    error,
    refreshData,
    isCached: typeof window !== "undefined" && getCachedData() !== null,
  };
};
