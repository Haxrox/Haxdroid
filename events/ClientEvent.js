const {Events} = require('discord.js');

module.exports = class ClientEvent {
    constructor(client, eventName, once) {
        this.client = client;
        this.eventName = Events[eventName];
        this.once = once;
    }
    Execute(...args) {
        console.log(`${this.eventName} emitted | Args: ${args}`);
    }
}