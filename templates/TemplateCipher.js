const Cipher = require("./Cipher.js");
const { ALL } = require("../../Constants.js");
const Random = require("../../services/Random.js");

class CIPHER_NAME extends Cipher {
    Name = "CIPHER_NAME";

    Verify(key, key2) {
        return true;
    }

    Encrypt(message, key, key2) {
        return [key, translated];
    }

    Decrypt(message, key, key2) {
        return [key, translated];
    }
}

module.exports = new CIPHER_NAME();