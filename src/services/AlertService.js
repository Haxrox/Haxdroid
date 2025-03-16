const {EmbedBuilder, blockQuote} = require('discord.js');

const Styles = require('../configs/styles.json');
const {S_TO_MS} = require('../Constants.js');
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
  content;
  message;
  messageEmbed;
  duration;
  type;

  /**
   * Returns alert as a string
   * @return {String} string representation
   *  of the alert
   */
  toString() {
    let str = '';

    switch (this.type) {
      case AlertType.DURATION:
        str = str.concat(this.duration / S_TO_MS);
        break;
      case AlertType.COUNT:
        str = str.concat(this.duration / ALERT_INTERVAL_IN_MS);
        break;
    }

    return str.concat(' ')
        .concat(this.type);
  }

  /**
     * Returns the alert type
     * @return {AlertType} alert type
     */
  get type() {
    return this.type;
  }
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

  /**
   * Create AlertBuilder
   * @param {AlertData} alertData data for alert
   */
  constructor(alertData) {
    this.#data = alertData || new AlertData();
  }

  /**
   * Creates an Alert from this data
   * @return {Alert} alert
   **/
  build() {
    return new Alert(this.#data);
  }

  /**
   * Returns the alert as a string
   * @return {String} string representation
   */
  getDurationString() {
    return this.#data.toString();
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
   * Sets the content
   * @param {String} content content to send
   * @return {AlertBuilder} this
   */
  setContent(content) {
    this.#data.content = content;
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
   * Sets the message embed
   * @param {EmbedBuilder} embed to send
   * @return {AlertBuilder} this
   */
  setMessageEmbed(embed) {
    this.#data.message = embed;
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
      this.#data.duration = duration * S_TO_MS;
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
      // eslint-disable-next-line max-len
      this.#data.duration = Math.min(count, MAX_ALERT_COUNT)*ALERT_INTERVAL_IN_MS;
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
}

/**
 * @class Alert
 * @description Repeatedly sends messages to a user.
 */
class Alert {
  #alertData;
  #alertEmbed;
  #alertId;
  #timeoutId;
  #status;

  /**
   * Creates Alert
   * @param {AlertData} alertData alertData
   */
  constructor(alertData) {
    this.#alertData = alertData;
    this.#status = AlertStatus.INACTIVE;
  }

  /**
   * Sends the alert
   * @return {Promise<Message>} promise to send the alert
   */
  sendAlert() {
    this.#alertEmbed = this.#alertEmbed || CommandsService.createBaseEmbed(
        this.#alertData.messageEmbed || new EmbedBuilder()
            .setAuthor({
              name: this.#alertData.alerter.username,
              iconURL: this.#alertData.alerter.avatarURL(),
            })
            .setTitle(this.#alertData.message),
    );

    return this.#alertData.target.send({
      content: this.#alertData.content,
      embeds: [
        this.#alertEmbed.setTimestamp(),
      ],
    }).catch((error) => {
      this.#status = AlertStatus.ERROR;
      this.cleanupAlert('Cannot send messages to '
          .concat(this.#alertData.target)
          .concat('\n')
          .concat(blockQuote(error)),
      );
    });
  }

  /**
   * Cancels the alert
   */
  cancelsAlert() {
    this.#status = AlertStatus.CANCELLED;
    this.cleanupAlert();
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
      case AlertStatus.CANCELLED:
        embed
            .setTitle('Alert Cancelled');
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

    this.#alertData.alerter.send({embeds: [
      embed.setTimestamp(),
    ]});

    clearInterval(this.#alertId);
    clearInterval(this.#timeoutId);
    this.#status = AlertStatus.INACTIVE;
  }

  /**
   * Executes the alerting
   * @return {Integer} id of the alert
   */
  execute() {
    this.sendAlert();
    this.#alertId = setInterval(this.sendAlert.bind(this),
        ALERT_INTERVAL_IN_MS,
    );

    this.#timeoutId = setTimeout(this.cleanupAlert.bind(this),
        this.#alertData.duration,
    );

    this.#status = AlertStatus.ACTIVE;

    return this.#alertId;
  }
}

/**
 * @class AlertService
 * @description Handles all alerts
 */
class AlertService {
  static #cache = new Map();

  /**
   * Creates an alert
   * @param {AlertBuilder} alertBuilder builder for alert
   * @return {Integer} id for alert
   */
  static execute(alertBuilder) {
    const alert = alertBuilder.build();
    const alertId = alert.execute();
    this.#cache.set(alertId, alert);
    return alertId;
  }

  /**
   * Lists all alerts
   * @param {Function<Alert>} filter filter for alerts
   * @return {Array<Alert>} list of alerts
   */
  static list(filter = () => true) {
    return this.#cache.values()
        .filter(filter);
  }
}

module.exports = {
  AlertStatus,
  AlertType,
  AlertData,
  AlertBuilder,
  AlertService,

  ALERT_INTERVAL_IN_MS,
  MAX_DURATION_IN_S,
  MAX_ALERT_COUNT,
};
