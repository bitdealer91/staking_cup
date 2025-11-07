import { ValidatorNameMapping } from "../hooks/useValidatorData";

/**
 * Map of validator addresses to human-readable names
 * All addresses should be lowercase for consistent lookup
 */
const rawValidatorNames: Record<string, string> = {
  "0x7719ba9947c486249049f914ce9b8d2d9ac276c2": "Chainbase",
  "0xe614f4872c9181ce35a8FcD6Cb743bab1c2A7f8e": "Somnia-0",
  "0x1ea1C5D797efCC4A1113564DA5aa5eFa6807a37d": "Somnia-1",
  "0x012f6F8deD4e1F977953cD8DBffF31ebB902549C": "Somnia-2",
  "0x48D3731aEE37B8Ca88D2165aA9593f3D030b7ed8": "Somnia-3",
  "0x152a28aED92e8f98FD154399d814A052Ca816ea1": "Everstake",
  "0xB53DcbBE523A184EEC865977966E164B65Bd1285": "Nansen",
  "0xfddebda85b9084d08456a2c1c947d6ad1558ab14": "Kiln",
  "0x7b83f237e73d1f399d6Ad39dbf3C750b67dc35f2": "ValidationCloud",
  "0x1084a463b519f6a75270b86d73381f8e2586a4bb":"StakeFi by BCW",
  "0xcf510e6d1138e5d2867eecb05479b430042e3b2a":"Somnia-Ecosystem-0",
  "0xda7615e8d08847d1627183c04d44f2d2517e2cd9":"Somnia-Ecosystem-1",
  "0xf71cc14574404100fec4c0ac5bb6bb606601c8bd":"Somnia-Ecosystem-2",
  "0x773dfb1512494ed8bc6cecc9fbd596cce9e29cf0": "Luganodes",
  "0x9988798e6Fd2f470ffd5657fa82025158CA7B8e7": "InfStones",
  "0x1bd5d4ebeea9ab77055bbf00ffb49d85d513778d": "Imperator.co",
  "0x4a641b72aeadd6405c21a4ce7ef7400e3ed3d84d": "Xangle",
  "0xc1f5e7bad1be522356ef4ecc763beaadd40c6da5": "Stakin",
  "0x74934e2d83418963cf67d87d5b27d669d9bfe028":"Tranchess",
  "0x55c488b54117087dac1ccd983f87fc796cdb7be8": "Moonlet",
  "0x5b3ee9d34368e29144b8b3970570c4e3ed80a27d": "RepublicCrypto",
  "0xfbf711ca1c12d4ef17ac080b4b3fd2579b73f3ad": "Hightower",
  "0xa7334fc85fc8af84f8a83454207062d42a133060": "Allnodes",
  "0xF59D5611c3e3BAEFb2ed3af3CA1301072692Eeac": "Nethermind",
  "0x93d6f7ff7c7fef2c0452d08eb46f0eed36b79765": "Swyke",
  "0x2e1386B19979734C6d07f94b07cb09376485ae11": "TTT VN",
  "0x8C8182aeDF589A333cb573DABdEbB2d6cF2E7699": "CroutonDigital",
  "0x6c33b6be131778308ba8c32a2880b4268b41ad19": "Meria",
  "0xB062F1e5DFa0cb14fAecab590a8e67f22f889b6b": "ValiDAO",
  "0xe39b037c64a1a4360de8226e51fb9783a15796c9": "BlockHunters",
  "0x27221728b6E98AF3462Bf344912883C7c7735D5A": "DTEAM",
  "0xa063e77C64667C9654ef8A3eE38c8cF0613e82b2": "Cosmostation",
  "0xf5dc6a2a885716d47b5351a3212902c5da5a0c67": "Hacken",
  "0x0d752c04c6dbd1863948655eaa88579931b6dd7b": "M2",
  "0x332884210d92a350730827ee05de82cdeb277c5c" :"Flipside Crypto",
  "0x9718fEd28a3D87C802e264b791184F649Ad33558" : "Artifact",
  "0xf2d163Cd781A3B0B5f0E161CdaB45e8eDbb06Cef": "BHarvest",
  "0x6c712ae5d2af489643fa16e57a201858ba45d76b": "StakeMe",
  "0x44aab2ee7f0333271e83718c1b543f3e8494f2f1": "Fan3",
  "0x3bb326d81c71480ac93a5dc01008f86dea2f6f64": "Dyment",
  "0x085BFAb54F38e6263A5883b2c36a3231E62a645b": "Jitter",
  "0xECD08BE36bd582D52fd62752638839e4f4cCCF4a" : "Byron",
  "0xf6133b58413133068514e7cd394198fa5a92eacf": "Imporium",
  "0x65a8550ef4afa3a746ef6bcfe99d45871a597944": "Kallikor",
  "0x4465da556e09bb3798b898dd5ea5c703ebd1735a": "Chamber",
  "0x055b8549291083f0a09a519454ce7587c611e865": "Improbable",
  "0xaae28d0630914872bfa2331fc8ec262ed1f976f4": "RT Node",
  "0xeadc833ecfabcb34efcbba985f701f7aee349c17": "PU Node"
};

// Convert all addresses to lowercase to ensure consistent lookups
export const VALIDATOR_NAMES: ValidatorNameMapping = Object.entries(
  rawValidatorNames
).reduce((acc, [address, name]) => {
  acc[address.toLowerCase()] = name;
  return acc;
}, {} as ValidatorNameMapping);

// Whitelist of validators to display in leaderboard/table for the competition
export const ALLOWED_VALIDATOR_NAMES: string[] = [
  "Imperator.co",
  "Nansen",
  "Everstake",
  "TTT VN",
  "Swyke",
  "BlockHunters",
  "InfStones",
  "CroutonDigital",
  "Hacken",
  "HighTower", // allow requested casing
  "Hightower", // mapping uses this casing
  "DTEAM",
];
