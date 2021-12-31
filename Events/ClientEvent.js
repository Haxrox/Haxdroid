module.exports = class ClientEvent {
    constructor(eventName, once) {
        this.eventName = eventName;
        this.once = once;
    }
    Execute(client, args) {
        console.log(`${this.eventName} emitted`);
        this.client = client;
    }
}