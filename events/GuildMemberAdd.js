const {EmbedBuilder} = require('discord.js');
const {bold} = require('@discordjs/builders');
const ClientEvent = require('./ClientEvent.js');
const Config = require('../configs/config.json');
const Styles = require('../styles.json');

/**
 * Emitted when user joins a guild
 */
class GuildMemberAdd extends ClientEvent {
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
   * @param {GuildMember} member member that joined the Guild
   */
  execute(member) {
    super.execute(member);

    if (this.logChannel) {
      const embed = new EmbedBuilder()
          .setTitle('Member Joined')
          .setDescription(`${bold('User:')} ${member}`)
          .setColor(Styles.Colours.Green)
          .addFields(
              {
                name: 'Created On',
                value: member.user.createdAt.toDateString(),
                inline: true,
              },
              {name: 'Tag', value: member.user.tag, inline: true},
              {name: 'ID', value: member.user.id, inline: true},
          )
          .setThumbnail(member.user.avatarURL())
          .setTimestamp();

      this.logChannel.send({embeds: [embed]});
    }
  }
}

module.exports = (client) => {
  return new GuildMemberAdd(client, 'GuildMemberAdd', false);
};
