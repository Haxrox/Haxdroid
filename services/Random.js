const Crypto = require("crypto");

class Random {
    Generate(min, max) {
        min = min || 0;
        max = max || 100;

        min = Math.min(min, max);
        max = Math.max(min, max);

        return (Math.random() * (max - min)) + min;
    }
    GenerateSecure(min, max) {
        return Crypto.randomInt(min = min, max = max);
    }
}

module.exports = new Random()