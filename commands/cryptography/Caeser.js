const Cipher = require('./Cipher.js');
const {ALL} = require('../../Constants.js');
const Random = require('../../utils/Random.js');

/**
 * Caseser Cipher
 */
class Caeser extends Cipher {
  Name = 'Caeser';
  DecryptKey = true;

  /**
   * Encryptes a message
   * @param {String} message message to encrypt
   * @param {Number} key key used to encrypt message
   * @return {[Number, String]} array with key in index 0
   * and encrypted message in index 1
   */
  encrypt(message, key) {
    key = key || Random.generateSecure(1, message.length);

    let translated = '';

    for (let index = 0; index < message.length; index++) {
      let letter = message.charAt(index);
      const position = ALL.indexOf(letter);

      if (position > -1) {
        letter = ALL.charAt((position + key) % ALL.length);
      }

      translated = translated.concat(letter);
    }

    return [key, translated];
  }

  /**
   *
   * @param {String} message
   * @param {String} key
   * @return {[Number, String]} array with key in index 0
   * and decrypted message in index 1
   */
  decrypt(message, key) {
    let translated = '';

    for (let index = 0; index < message.length; index++) {
      let letter = message.charAt(index);
      const position = ALL.indexOf(letter);

      if (position > -1) {
        letter = ALL.charAt((position - key + ALL.length) % ALL.length);
      }

      translated = translated.concat(letter);
    }

    return [key, translated];
  }
}

module.exports = new Caeser();
