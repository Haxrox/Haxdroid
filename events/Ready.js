const FileSystem = require('fs');
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

        FileSystem.readdirSync('./events').filter(file => (file.endsWith('.js') && file !== "ClientEvent.js" && file !== "Ready.js" && file !== "MessageCreate.js")).forEach(file => {
            const event = require(`./${file}`)(this.client);
            if (event.once) {
                this.client.once(event.eventName, (...args) => event.Execute(...args));
            } else {
                this.client.on(event.eventName, (...args) => event.Execute(...args));
            }
        });
    }
}

module.exports = (client) => {
    return new Ready(client, "ready", true);
}