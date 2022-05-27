module.exports = class ClientEvent {
    constructor(client, eventName, once) {
        this.client = client;
        this.eventName = eventName;
        this.once = once;
    }
    Execute(...args) {
        console.debug(`${this.eventName} emitted | Args: ${args}`);
    }
}