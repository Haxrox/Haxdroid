const {EmbedBuilder} = require('discord.js');

const ClientEvent = require('../core/ClientEvent.js');
const Config = require('../configs/config.json');
const Styles = require('../configs/styles.json');

/**
 * Emitted whenever a message is deleted
 */
class MessageDelete extends ClientEvent {
  /**
   * Constructor for event
   * @param {Client} client client that emits the event
   * @param {string} eventName name of the event
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
   * @param {Message} message deleted message
   */
  execute(message) {
    super.execute(message);

    if (this.logChannel && !message.author.bot) {
      const embed = new EmbedBuilder()
          .setAuthor({
            name: message.author.username,
            iconURL: message.author.avatarURL(),
          })
          .setTitle('Message Deleted')
          .setDescription(message.content || 'None')
          .setColor(Styles.Colours.Red)
          .addFields(
              {
                name: 'Created At',
                value: message.createdAt.toLocaleString(),
                inline: true,
              },
              {name: 'Edited',
                value: message?.editedAt?.toLocaleString() || 'None',
                inline: true,
              },
          )
          .setFooter({text: message.id})
          .setTimestamp();

      this.logChannel.send({embeds: [embed]});
    }
  }
}

module.exports = (client) => {
  return new MessageDelete(client, 'MessageDelete', false);
};
