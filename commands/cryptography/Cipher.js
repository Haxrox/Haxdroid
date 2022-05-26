const {ALL} = require("../../Constants.js");
const Random = require("../../services/Random.js");

class Cipher {
    Name = "Cipher";
    EncryptKey = false;
    DecryptKey = false;

    Verify(key, key2) {
        return true;
    }

    Encrypt(message, key, key2) {

    }

    Decrypt(message, key, key2) {

    }
}

module.exports = Cipher;