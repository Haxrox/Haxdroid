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
    const seconds = length % 60;
    const minutes = Math.floor(length / 60) % 60;
    const hours = Math.floor(length / 3600) % 24;
    const days = Math.floor(length / (3600 * 24));

    return parse(days, false) +
      parse(hours, days > 0) +
      parse(minutes, (hours > 0 || days > 0), true) +
      padVal(seconds);
  }
}

module.exports = new Time();
