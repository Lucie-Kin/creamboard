/**
 * Pinata IPFS Service
 * Fetches and manages data from Pinata cloud storage
 */

import { TokenMetadata, tokenMetadataSchema } from "@shared/pinata-schema";

export class PinataService {
  private gatewayUrl: string;
  private cache: Map<string, TokenMetadata>;

  constructor(gatewayUrl: string = "https://gateway.pinata.cloud") {
    this.gatewayUrl = gatewayUrl;
    this.cache = new Map();
  }

  /**
   * Fetch token metadata from Pinata IPFS by CID or full URL
   */
  async fetchToken(cidOrUrl: string): Promise<TokenMetadata | null> {
    try {
      // Check cache first
      if (this.cache.has(cidOrUrl)) {
        return this.cache.get(cidOrUrl)!;
      }

      // Determine if it's a CID or full URL
      const url = cidOrUrl.startsWith("http")
        ? cidOrUrl
        : `${this.gatewayUrl}/ipfs/${cidOrUrl}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Failed to fetch from Pinata: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      
      // Validate the data matches our schema
      const validated = tokenMetadataSchema.parse(data);
      
      // Cache the result
      this.cache.set(cidOrUrl, validated);
      
      return validated;
    } catch (error) {
      console.error("Error fetching token from Pinata:", error);
      return null;
    }
  }

  /**
   * Fetch an entire chain of tokens by following the "prev" links
   * Returns tokens in chronological order (oldest first)
   */
  async fetchTokenChain(startCidOrUrl: string, maxDepth: number = 100): Promise<TokenMetadata[]> {
    const chain: TokenMetadata[] = [];
    let currentCid = startCidOrUrl;
    let depth = 0;

    while (currentCid && depth < maxDepth) {
      const token = await this.fetchToken(currentCid);
      
      if (!token) break;
      
      chain.unshift(token); // Add to beginning (chronological order)
      
      if (token.prev) {
        currentCid = token.prev;
        depth++;
      } else {
        break; // No more previous tokens
      }
    }

    return chain;
  }

  /**
   * Fetch multiple tokens in parallel
   */
  async fetchMultipleTokens(cids: string[]): Promise<TokenMetadata[]> {
    const promises = cids.map(cid => this.fetchToken(cid));
    const results = await Promise.all(promises);
    return results.filter((token): token is TokenMetadata => token !== null);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Singleton instance
let pinataServiceInstance: PinataService | null = null;

export function getPinataService(): PinataService {
  if (!pinataServiceInstance) {
    const gatewayUrl = process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud";
    pinataServiceInstance = new PinataService(gatewayUrl);
  }
  return pinataServiceInstance;
}
