const {EmbedBuilder, blockQuote} = require('discord.js');

const {AlertService, AlertBuilder} = require('../services/AlertService.js');
const {S_TO_MS} = require('../Constants.js');

const CHECKER_INTERVAL_IN_S = 300;

class CheckerStatus {
  static ALIVE = "alive";
  static ALERT = "alert";
  static CANCELLED = "canceled";
  static INACTIVE = "inactive";
  static ERROR = "error";
}

class CheckerState {
  static ALIVE = "alive";
  static ALERT = "alert";
  static CANCEL = "cancel";
  static ERROR = "error";
}

class CheckerData {
  owner;
  period;
  toggle;
  checkerFunc;
  lastCheck;
  checkMessage;
}

/**
 * @class WaitlistBuilder
 * @description Class to build waitlist data
 */
class CheckerBuilder {
  #data;

  constructor(checkerData) {
    this.#data = checkerData || new CheckerData();
  }

  /**
   *
   * @param {CallableFunction} checkerFunc
   * @returns {CheckerBuilder} this
   */
  setChecker(checkerFunc) {
    this.#data.checkerFunc = checkerFunc;
    return this;
  }

  /**
   * Sets period for the checker
   * @param {Number} period
   * @returns {CheckerBuilder} this
   */

  setPeriod(period) {
    this.#data.period = period;
    return this;
  }

  /**
   *
   * @param {Boolean} toggle
   * @returns {CheckerBuilder} this
   */
  setToggle(toggle) {
    this.#data.toggle = toggle;
    return this;
  }

  setCheckMessage(checkMessage) {
    this.#data.checkMessage = checkMessage;
    return this;
  }

  /**
   * Builds checker data
   * @returns {CheckerData}
   */
  build() {
    return this.#data;
  }
}


class Checker {
  #checkId;
  #status;
  #data;

  constructor(checkerBuilder) {
    this.#data = checkerBuilder.build();
    this.#status = CheckerStatus.INACTIVE;
  }

  async check() {
    let checkState, message = await this.#data.checkerFunc();

    switch (checkState) {
      case CheckerState.ALIVE:
        console.log("Alive");
        break;
      case CheckerState.ALERT:
        this.#status = CheckerStatus.ALERT;
        this.cleanup(message);
        break;
      case CheckerState.CANCEL:
        this.#status = CheckerStatus.CANCELLED;
        this.cleanup(message);
        break;
      case CheckerState.ERROR:
        this.#status = CheckerStatus.ERROR;
        this.cleanup(message);
        break;
    }
  }

  execute() {
    this.#checkId = setInterval(this.check.bind(this), this.#data.period * S_TO_MS);
    this.#status = CheckerStatus.ALIVE;

    this.check();

    return this.#checkId;
  }

  cancel() {
    this.#status = CheckerStatus.CANCELLED;
  }

  cleanup(message) {
    clearInterval(this.#checkId);
    const embed = new EmbedBuilder();

    switch (this.#status) {
      case CheckerStatus.ALERT:
        const alertBuilder = AlertBuilder()
          .setAlerter(this.#data.owner)
          .setTarget(this.#data.owner)
          .setContent(message)

        AlertService.execute(alertBuilder);
        break;
      case CheckerStatus.CANCELLED:
        embed
          .setTitle("Checker Cancelled")
          .setColor(Styles.Color.Red)
        break;
      case CheckerStatus.ERROR:
        embed
          .setTitle("Checker Failed")
          .setColor(Styles.Color.Red)
        break
    }

    if (message) {
      embed.setDescription(message);
    }

    this.#data.owner.send({
      embeds: [
        embed.setTimestamp()
      ]
    });

    this.#status = CheckerStatus.INACTIVE;
  }
}

/**
 * @class CheckerService
 * @description Class to periodically check things
 */
class CheckerService {
  static #cache = new Map();

  static execute(checkerBuilder) {
    const checker = new Checker(checkerBuilder);
    const id = checker.execute();
    this.#cache.set(id, checker);
    return id;
  }

  /**
   * Lists all checks
   * @param {Function<Checker>} filter filter for checker
   * @return {Array<Checker>} list of checkers
   */
  static list(filter = () => true) {
    return this.#cache.values()
        .filter(filter);
  }
}

module.exports = {
  CheckerBuilder,
  CheckerService,

  CHECKER_INTERVAL_IN_S
};