const ClientEvent = require("./ClientEvent.js");

class Ready extends ClientEvent {
    Execute(client) {
        super.Execute(client);
        client.user.setPresence({activities: [{name: "Hello World!", type: "PLAYING"}], status: "online"});
    }
}

module.exports = new Ready("ready", true);