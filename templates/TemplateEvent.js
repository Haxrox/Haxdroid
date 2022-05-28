const ClientEvent = require("./ClientEvent.js");
const Config = require("../config.json");
const Styles = require("../styles.json");

class EVENT_NAME extends ClientEvent {
    Execute() {
        super.Execute();
    }
}

module.exports = (client) => {
    return new EVENT_NAME(client, "EVENT_NAME", false);
}