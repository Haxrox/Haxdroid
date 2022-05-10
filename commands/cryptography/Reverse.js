const Cipher = require("./Cipher.js");

class Reverse extends Cipher {
    Name = "Reverse";

    Encrypt(message, key) {
        return [key, [...message].reverse().join("")];
    }
    
    Decrypt(message, key) {
        return [key, [...message].reverse().join("")];
    }
}

module.exports = new Reverse();