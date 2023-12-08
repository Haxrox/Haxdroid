const FileSystem = require('fs');
const ClientEvent = require('../core/ClientEvent.js');
const {ActivityType} = require('discord.js');

/**
 * Emitted when the client becomes ready to start working
 */
class Ready extends ClientEvent {
  CurrentPresence = 0;

  /**
   * Listener for the event
   * @param {Client} client the client
   */
  execute(client) {
    super.execute();

    const setPresence = () => {
      // Only update if the bot isn't in a voice channel
      if (this.client.voice.adapters.size < 1) {
        if (this.CurrentPresence % 2 === 0) {
          this.client.user.setPresence(
              {
                activities: [
                  {name: 'Hello World!', type: ActivityType.Playing},
                ],
                status: 'online',
              },
          );
        } else if (this.CurrentPresence % 2 === 1) {
          this.client.user.setPresence({
            activities: [
              {
                name: `Time: ${new Date()
                    .toLocaleTimeString('en-US', {
                      timeZone: 'America/Los_Angeles',
                      hour12: true,
                    })
                } PST`,
                type: ActivityType.Playing,
              },
            ],
            status: 'online',
          });
        }
        this.CurrentPresence++;
      }
    };

    setInterval(setPresence, 10000);
    setPresence();

    FileSystem.readdirSync('./src/events')
        .filter((file) =>
          file.endsWith('.js') && file !== 'Ready.js',
        )
        .filter((file) =>
          file !== 'ClientEvent.js',
        )
        .forEach((file) => {
          const event = require(`./${file}`)(this.client);
          const eventType = event.once ? 'once' : 'on';

          this.client[eventType](event.eventName, (...args) =>
            event.execute(...args),
          );
        });
  }
}

module.exports = (client) => {
  return new Ready(client, 'ClientReady', true);
};
