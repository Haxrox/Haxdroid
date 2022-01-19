const ClientEvent = require("./ClientEvent.js");

class Ready extends ClientEvent {
    CurrentPresence = 0;
    Execute(client) {
        super.Execute(client);
        setInterval(() => {
            if (thisCurrentPrecense % 2 == 0) {
                client.user.setPresence({activities: [{name: "Hello World!", type: "PLAYING"}], status: "online"});
            } else if (this.CurrentPresence) {
                client.user.setPresence({activities: [{name: `${new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour12: true })} PST`, type: "PLAYING"}], status: "online"});
            }
            this.CurrentPrecense++;
        }, 10000);
    }
}

module.exports = new Ready("ready", true);