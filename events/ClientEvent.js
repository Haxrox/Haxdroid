module.exports = class ClientEvent {
    constructor(eventName, once) {
        this.eventName = eventName;
        this.once = once;
    }
    Execute(client, args) {
        console.debug(`${this.eventName} emitted`);
        this.Client = client;
    }
}