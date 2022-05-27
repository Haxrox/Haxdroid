const ClientEvent = require("./ClientEvent.js");

class Ready extends ClientEvent {
    CurrentPresence = 0;

    Execute() {
        super.Execute();
        
        const setPresence = () => {
            // Only update if the bot isn't in a voice channel
            if (this.client.voice.adapters.size < 1) {
                if (this.CurrentPresence % 2 === 0) {
                    this.client.user.setPresence({ activities: [{ name: "Hello World!", type: "PLAYING" }], status: "online" });
                } else if (this.CurrentPresence % 2 === 1) {
                    this.client.user.setPresence({ activities: [{ name: `Time: ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour12: true })} PST`, type: "PLAYING" }], status: "online" });
                }
                this.CurrentPresence++;
            }
        }

        setInterval(setPresence, 10000);
        setPresence();
    }
}

module.exports = (client) => {
    return new Ready(client, "ready", true);
}