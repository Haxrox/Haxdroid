const {EmbedBuilder} = require('discord.js');
const ClientEvent = require('../core/ClientEvent.js');
const Config = require('../configs/config.json');
const Styles = require('../configs/styles.json');

/**
 * Emitted when client encounters an error
 */
class Error extends ClientEvent {
  /**
   * Constructor for event
   * @param {Client} client client that emits the event
   * @param {String} eventName name of the event
   * @param {boolean} once whether to emit the event only once
   */
  constructor(client, eventName, once) {
    super(client, eventName, once);

    (async () => {
      this.guild = await this.client.guilds.fetch(Config.GUILD_ID);
      this.logChannel = await this.guild.channels.fetch(Config.LOGS_CHANNEL_ID);
    })();
  }

  /**
   * Listener for the event
   * @param {Error} error error encountered
   */
  execute(error) {
    super.execute(error);

    if (this.logChannel) {
      const embed = new EmbedBuilder()
          .setTitle('Bot Error')
          .setDescription(`${Styles.Emojis.Error}  ${error.message}`)
          .setColor(Styles.Colours.Error)
          .setTimestamp();

      this.logChannel.send({embeds: [embed]});
    }
  }
}

module.exports = (client) => {
  return new Error(client, 'Error', false);
};
