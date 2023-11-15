const Cipher = require("./Cipher.js");
const {ALL} = require("../../Constants.js");
const Random = require("../../services/Random.js");

class Caeser extends Cipher {
    Name = "Caeser";
    DecryptKey = true;

    Encrypt(message, key) {
        key = key || Random.generateSecure(1, message.length);

        let translated = "";

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
    
    Decrypt(message, key) {
        let translated = "";

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