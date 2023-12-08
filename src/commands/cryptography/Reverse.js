const Cipher = require('./Cipher.js');

/**
 * Reverses a string
 */
class Reverse extends Cipher {
  Name = 'Reverse';

  /**
   * Encrypts a message
   * @param {String} message message to encrypt
   * @param {String} key key used to encrypt message
   * @return {[Number, String]} array with key in index 0
   * and encrypted message in index 1
   */
  encrypt(message, key) {
    return [key, [...message].reverse().join('')];
  }

  /**
   * Decrypts a message
   * @param {String} message message to decrypt
   * @param {Number} key key used to decrypt message
   * @return {[Number, String]} array with key in index 0
   * and decrypted message in index 1
   */
  decrypt(message, key) {
    return [key, [...message].reverse().join('')];
  }
}

module.exports = new Reverse();
