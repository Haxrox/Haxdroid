const {EmbedBuilder} = require('discord.js');

const ClientEvent = require('../core/ClientEvent.js');
const Config = require('../configs/config.json');
const Styles = require('../configs/styles.json');

/**
 * Emitted whenever a message is updated - e.g. embed or content change.
 */
class MessageUpdate extends ClientEvent {
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
 * @param {Message} oldMessage mesasge before the update
 * @param {Message} newMessage message after the update
 */
  execute(oldMessage, newMessage) {
    super.execute(oldMessage, newMessage);

    if (this.logChannel && !newMessage.author.bot &&
      oldMessage.content != newMessage.content) {
      const headerEmbed = new EmbedBuilder()
          .setAuthor({
            name: newMessage.author.username,
            iconURL: newMessage.author.avatarURL(),
          })
          .setTitle('Message Updated')
          .setURL(newMessage.url)
          .setColor(Styles.Colours.Yellow)
          .addFields(
              {
                name: 'Created At',
                value: newMessage.createdAt.toLocaleString(),
                inline: true,
              },
              {
                name: 'Edited At',
                value: newMessage?.editedAt?.toLocaleString() || 'None',
                inline: true,
              },
          )
          .setFooter({text: newMessage.id});

      const oldEmbed = new EmbedBuilder()
          .setTitle('Old Message')
          .setDescription(oldMessage.content)
          .setColor(Styles.Colours.Red);

      const newEmbed = new EmbedBuilder()
          .setTitle('New Message')
          .setDescription(newMessage.content)
          .setColor(Styles.Colours.Green)
          .setTimestamp();

      this.logChannel.send({embeds: [headerEmbed, oldEmbed, newEmbed]});
    }
  }
}

module.exports = (client) => {
  return new MessageUpdate(client, 'MessageUpdate', false);
};
