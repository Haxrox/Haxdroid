const ClientEvent = require('../core/ClientEvent.js');

/**
 * Emitted whenever a message is created
 */
class MessageCreate extends ClientEvent {
  /**
   * Listener for the event
   * @param {Message} message the created message
   */
  execute(message) {
    super.execute(message);
    console.log(message.content);
  }
}

module.exports = (client) => {
  return new MessageCreate(client, 'MessageCreate', false);
};
