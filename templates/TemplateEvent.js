const ClientEvent = require("./ClientEvent.js");

class EVENT_NAME extends ClientEvent {
    Execute(client) {
        super(client);
    }
}

module.exports = new EVENT_NAME("EVENT_NAME", false);