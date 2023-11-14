const {Events} = require('discord.js');

module.exports = class ClientEvent {
  /**
   * Base event handler for Discord clients
   * @param {Client} client client that emits the event
   * @param {string} eventName name of the event
   * @param {boolean} once whether to emit the event only once
   */
  constructor(client, eventName, once) {
    this.client = client;
    this.eventName = Events[eventName];
    this.once = once;
  }

  /**
   * Listener for the event
   * @param  {...any} args arguments to pass to the event listener
   */
  execute(...args) {
    console.log(`${this.eventName} emitted | Args: ${args}`);
  }
};
