// const {ALL} = require('../../Constants.js');
// const Random = require('../../services/Random.js');

/**
 * Base class class
 */
class Cipher {
  Name = 'Cipher';
  EncryptKey = false;
  DecryptKey = false;

  /**
   * Verify that the keys are valid
   * @param {Number} key key to encrypt/decrypt message in
   * @param {Number} key2 2nd key to use (if needed w/ cipher)
   * @return {Boolean} true if keys are valid, false otherwise
   */
  verify(key, key2) {
    return true;
  }

  /**
   * Encrypts message
   * @param {String} message message to encrypt
   * @param {Number} key key to encrypt message
   * @param {Number} key2 2nd key to encrypt message (if needed)
   */
  encrypt(message, key, key2) {

  }

  /**
   * Decrypts message
   * @param {String} message message to decrypt
   * @param {Number} key key to decrypt message
   * @param {Number} key2 2nd key to decrypt message (if needed)
   */
  decrypt(message, key, key2) {

  }
}

module.exports = Cipher;
