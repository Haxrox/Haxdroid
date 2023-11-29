const {EmbedBuilder} = require('discord.js');

const CommandsService = require('../services/CommandsService.js');
const ALERT_INTERVAL_IN_MS = 1000;
const MAX_DURATION_IN_S = 300;
const MAX_ALERT_COUNT = 25;

/**
 * @class AlertType
 * @description Type of alert
 */
class AlertType {
  static DURATION = 'second(s)';
  static COUNT = 'time(s)';
}

/**
 * @class AlertStatus
 * @description Status of alert
 */
class AlertStatus {
  static ACTIVE = 'active';
  static INACTIVE = 'inactive';
  static CANCELLED = 'cancelled';
  static ERROR = 'error';
}

/**
 * @class AlertError
 * @description Error for AlertBuilder
 */
class AlertError extends Error {

}

/**
 * @class AlertData
 * @description Data for AlertBuilder
 */
class AlertData {
  alerter;
  target;
  message;
  duration;
  type;
}

/**
 * @class AlertBuilder
 * @description Repeatedly sends messages to a user.
 * Must call execute() to execute the alert.
 * @note the latter of setDuration and setCount will be used
 * Can be overriden via setTally()
 */
class AlertBuilder {
  #data;
  #alertEmbed;
  #alertId;
  #timeoutId;
  #status;

  /**
   * Create AlertBuilder
   * @param {AlertData} alertData data for alert
   */
  constructor(alertData) {
    this.data = alertData || new AlertData();
    this.status = AlertStatus.INACTIVE;
  }

  /**
   * Returns alert as a string
   * @return {String} string representation
   *  of the alert
   */
  toString() {
    const str = '';

    switch (this.#data.type) {
      case AlertType.DURATION:
        str.concat(this.#data.tally);
        break;
      case AlertType.COUNT:
        str.concat(this.#data.tally / ALERT_INTERVAL_IN_MS);
        break;
    }

    return str.concat(' ')
        .concat(this.#data.type);
  }

  /**
   * Returns the alert type
   * @return {AlertType} alert type
   */
  get type() {
    return this.#data.type;
  }

  /**
   * Sets the alerter
   * @param {User} alerter user alerting
   * @return {AlertBuilder} this
   */
  setAlerter(alerter) {
    this.#data.alerter = alerter;
    return this;
  }

  /**
   * Sets the target
   * @param {User} target user to alert
   * @return {AlertBuilder} this
   */
  setTarget(target) {
    this.#data.target = target;
    return this;
  }

  /**
   * Sets the message
   * @param {String} message message to send
   * @return {AlertBuilder} this
   */
  setMessage(message) {
    this.#data.message = message;
    return this;
  }

  /**
   * Sets the duration in seconds
   * @note the latter of setDuration and setCount will be used.
   *  Can be overriden via setTally()
   * @param {Integer} duration alert duration in seconds
   *  (max MAX_DURATION_IN_S seconds). Value will be capped at
   *  MAX_DURATION_IN_S and AlertError will be thrown
   * @return {AlertBuilder} this
   * @throws {AlertError} if duration > MAX_DURATION_IN_S
   */
  setDuration(duration) {
    if (duration) {
      this.#data.tally = duration;
      this.#data.type = AlertType.DURATION;

      if (duration > MAX_DURATION_IN_S) {
        throw new AlertError(`Duration cannot exceed ${MAX_DURATION_IN_S}`);
      }
    }
    return this;
  }

  /**
   * Sets the count
   * @note the latter of setDuration and setCount will be used
   *  Can be overriden via setTally()
   * @param {Integer} count alert count in messages
   *  (max MAX_ALERT_COUNT messages). Value will be capped at MAX_ALERT_COUTN
   *  and AlertError will be thrown
   * @return {AlertBuilder} this
   * @throws {AlertError} if count > MAX_ALERT_COUNT
   */
  setCount(count) {
    if (count) {
      this.#data.tally = Math.min(count, MAX_ALERT_COUNT)*ALERT_INTERVAL_IN_MS;
      this.#data.type = AlertType.COUNT;

      if (count > MAX_ALERT_COUNT) {
        throw new AlertError(`Count cannot exceed ${MAX_ALERT_COUNT}`);
      }
    }
    return this;
  }

  /**
   * Sets the tally
   * @note Will override the last setCount() or setDuration()
   * @param {AlertType} type type of tally
   * @param {Integer} tally tally
   * @return {AlertBuilder} this
   * @throws {AlertError} if type is invalid
   */
  setTally(type, tally) {
    switch (type) {
      case AlertType.DURATION:
        this.setDuration(tally);
        break;
      case AlertType.COUNT:
        this.setCount(tally);
        break;
      default:
        throw new AlertError(`Invalid type: ${type}`);
    }

    return this;
  }

  /**
   * Sends the alert
   * @return {Promise<Message>} promise to send the alert
   */
  sendAlert() {
    this.#alertEmbed = this.#alertEmbed || CommandsService.createBaseEmbed(
        new EmbedBuilder()
            .setTitle(message)
            .setFooter({
              text: `Alerted by: ${this.#data.alerter.username}`,
              iconURL: this.#data.alerter.avatarURL(),
            }),
    );

    return this.#data.target.send({
      embeds: [
        this.#alertEmbed.setTimestamp(),
      ],
    });
  }

  /**
   * Cancels the alert
   */
  cancelsAlert() {
    clearInterval(this.#alertId);
    clearInterval(this.#timeoutId);

    this.status = AlertStatus.CANCELLED;
  }
  /**
   * Cleans up the alert
   * @param {String} message message to cleanup
   */
  cleanupAlert(message) {
    const embed = new EmbedBuilder();

    switch (this.#status) {
      case AlertStatus.ACTIVE:
        embed
            .setTitle('Alert Complete')
            .setColor(Styles.Colours.Green);
        break;
      case AlertStatus.ERROR:
        embed
            .setTitle('Alert Failed')
            .setColor(Styles.Colours.Red);
        break;
    }

    if (message) {
      embed.setDescription(message);
    }

    this.#data.alerter.send({embeds: [
      embed.setTimestamp(),
    ]});

    this.status = AlertStatus.INACTIVE;
  }

  /**
   * Executes the alerting
   */
  execute() {
    this.#alertId = setInterval(() => {
      this.sendAlert().catch((error) => {
        this.#status = AlertStatus.ERROR;
        this.cleanupAlert('Cannot send messages to '
            .concat(target)
            .concat('\n')
            .concat(blockQuote(error)),
        );
      });
    }, ALERT_INTERVAL_IN_MS);

    this.#timeoutId = setTimeout(this.cleanupAlert);

    this.#status = AlertStatus.ACTIVE;
  }
}


module.exports = {
  AlertStatus,
  AlertType,
  AlertData,
  AlertBuilder,

  ALERT_INTERVAL_IN_MS,
  MAX_DURATION_IN_S,
  MAX_ALERT_COUNT,
};
