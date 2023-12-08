/**
 * Time Class
 */
class Time {
  /**
   * Converts seconds to a duration
   * @param {Number} length value in seconds
   * @return {Number} value as a duration
   */
  secondsToDuration(length) {
    const padVal = (val) => val < 10 ? `0${val}` : val.toString();

    const parse = (val, pad, forceAppend) =>
      pad ? padVal(val).concat(':') :
      ((val > 0 || forceAppend) ? val.toString().concat(':') : '');

    const seconds = Math.floor(length % 60);
    const minutes = Math.floor(length / 60) % 60;
    const hours = Math.floor(length / 3600) % 24;
    const days = Math.floor(length / (3600 * 24));

    return parse(days, false) +
      parse(hours, days > 0) +
      parse(minutes, (hours > 0 || days > 0), true) +
      padVal(seconds);
  }

  /**
   * Waits for a given amount of time
   * @param {Number} seconds time to wait in seconds
   * @return {Promise} promise to wait
   */
  wait = require('util').promisify(setTimeout);
}

module.exports = new Time();
