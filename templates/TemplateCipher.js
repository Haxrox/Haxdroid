const Cipher = require("./Cipher.js");
const {ALL} = require("../../Constants.js");
const Random = require("../../services/Random.js");

class CIPHER_NAME extends Cipher {
    Name = "CIPHER_NAME";

    Encrypt(message, key) {
        return [key, translated];
    }
    
    Decrypt(message, key) {
        return [key, translated];
    }
}

module.exports = new CIPHER_NAME();