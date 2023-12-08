const ClientEvent = require('./ClientEvent.js');
const Config = require('../configs/config.json');
const Styles = require('../configs/styles.json');

const NAME = 'EVENT_NAME';
const ONCE = false;

/**
 * @class EVENT_NAME
 * @description EVENT_DESCRIPTION
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
  return new EVENT_NAME(client, NAME, ONCE);
};
