class Random {
    Generate(min, max) {
        min = min || 0;
        max = max || 100;

        min = Math.min(min, max);
        max = Math.max(min, max);

        return (Math.random() * (max - min)) + min;
    }
}

module.exports = new Random()