const Crypto = require('crypto');

/**
 * Random library
 */
class Random {
  /**
   * Generates an insecure random number
   * @param {Integer} min lowerbound number (inclusive)
   * @param {Integer} max upperbound (exclusive)
   * @return {Integer} randomly generated number
   */
  generateInt(min, max) {
    min = min || 0;
    max = max || 100;

    min = Math.min(min, max);
    max = Math.max(min, max);

    return Math.round((Math.random() * (max - min)) + min);
  }

  /**
   * Generates random number using Crypto library
   * @param {Integer} min lowerbound (inclusive)
   * @param {Integer} max upperbound (exlusive)
   * @return {Integer} randomly generated number
   */
  generateSecure(min, max) {
    return Crypto.randomInt(min = min, max = max);
  }
}

module.exports = new Random();
