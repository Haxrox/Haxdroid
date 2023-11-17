const ClientEvent = require('./ClientEvent.js');
const Config = require('../configs/config.json');
const Styles = require('../styles.json');

/**
 * Event Description
 */
class EVENT_NAME extends ClientEvent {
  /**
   * Listener for the event
   */
  execute() {
    super.execute();
  }
}

module.exports = (client) => {
  return new EVENT_NAME(client, 'EVENT_NAME', false);
};
