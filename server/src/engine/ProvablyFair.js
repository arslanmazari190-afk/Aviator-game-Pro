const crypto = require('crypto');

class ProvablyFair {
  /**
   * Generates a cryptographically secure 64-character hexadecimal server seed
   */
  static generateServerSeed() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hashes the server seed using SHA-256 (publicly visible before the round starts)
   */
  static hashServerSeed(serverSeed) {
    return crypto.createHash('sha256').update(serverSeed).digest('hex');
  }

  /**
   * Generates a random client seed or round salt
   */
  static generateClientSeed() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Computes the deterministic crash multiplier from Server Seed, Client Seed, and Nonce
   * Formula:
   * 1. hash = HMAC-SHA256(serverSeed, clientSeed + ":" + nonce)
   * 2. Take first 52 bits (13 hex chars)
   * 3. Apply house edge curve
   * 
   * @param {string} serverSeed 
   * @param {string} clientSeed 
   * @param {number} nonce 
   * @param {number} houseEdgePercent (e.g. 3.0 for 3% house edge / 97% RTP)
   * @param {number} maxMultiplier (e.g. 10000.0)
   * @returns {{ multiplier: number, hash: string, hexSub: string }}
   */
  static calculateCrashMultiplier(
    serverSeed,
    clientSeed,
    nonce,
    houseEdgePercent = 3.0,
    maxMultiplier = 10000.0
  ) {
    const message = `${clientSeed}:${nonce}`;
    const hash = crypto
      .createHmac('sha256', serverSeed)
      .update(message)
      .digest('hex');

    // 13 hex characters = 52 bits
    const hexSub = hash.substring(0, 13);
    const h = parseInt(hexSub, 16);
    const e = Math.pow(2, 52); // 4,503,599,627,370,496

    // Instant house crash probability based on house edge
    const houseCrashInterval = Math.max(10, Math.round(100 / (houseEdgePercent || 3.0)));
    if (h % houseCrashInterval === 0) {
      return {
        multiplier: 1.00,
        hash,
        hexSub,
        isInstantCrash: true
      };
    }

    // Standard Provably Fair crash distribution: (100 * e - h * houseEdge) / (e - h)
    const edgeRatio = (houseEdgePercent || 3.0);
    const rawVal = Math.floor((100 * e - h * edgeRatio) / (e - h)) / 100;
    
    // Normalize and bounds check
    let multiplier = Math.max(1.00, Number(rawVal.toFixed(2)));
    if (multiplier > maxMultiplier) {
      multiplier = maxMultiplier;
    }

    return {
      multiplier,
      hash,
      hexSub,
      isInstantCrash: multiplier <= 1.00
    };
  }

  /**
   * Public verification helper for independent audits
   */
  static verifyRound(serverSeed, clientSeed, nonce, houseEdgePercent = 3.0) {
    const serverSeedHash = this.hashServerSeed(serverSeed);
    const calculation = this.calculateCrashMultiplier(serverSeed, clientSeed, nonce, houseEdgePercent);
    return {
      serverSeed,
      serverSeedHash,
      clientSeed,
      nonce,
      houseEdgePercent,
      ...calculation
    };
  }
}

module.exports = ProvablyFair;
