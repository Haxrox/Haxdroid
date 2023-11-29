const {EmbedBuilder} = require('discord.js');
const {bold} = require('@discordjs/builders');
const ClientEvent = require('../core/ClientEvent.js');
const Time = require('../utils/Time.js');
const Config = require('../configs/config.json');
const Styles = require('../configs/styles.json');

const Users = {};
/**
 * Emitted whenever a member changes voice state
 * e.g. joins/leaves a channel, mutes/unmutes.
 */
class VoiceStateUpdate extends ClientEvent {
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
   * @param {VoiceState} oldState voice state before the update
   * @param {VoiceState} newState voice state after the update
   */
  execute(oldState, newState) {
    super.execute(oldState, newState);

    if (this.logChannel) {
      if (oldState.channelId != newState.channelId) {
        const embed = new EmbedBuilder()
            .setAuthor({
              name: newState.member.user.username,
              iconURL: newState.member.user.avatarURL(),
            })
            .setTimestamp();

        const delta = Date.now() - Users[newState.member.id];
        const duration = Time.secondsToDuration(Math.round(delta/1000));
        const descriptionTag = bold('Channel:');

        if (oldState.channel && newState.channel) {
          const oldChannel = oldState.channel;
          const newChannel = newState.channel;

          embed.setTitle(`${Styles.Emojis.Voice_Moved}  Moved Voice Channel`)
              .setDescription(`${descriptionTag} ${oldChannel} → ${newChannel}`)
              .addFields(
                  {name: 'Duration', value: duration},
              )
              .setColor(Styles.Colours.Yellow);
        } else if (!newState.channel) {
          delete Users[newState.member.id];

          const channel = oldState.channel.toString() || 'None';
          embed.setTitle(`${Styles.Emojis.Voice_Left}  Left Voice Channel`)
              .setDescription(`${descriptionTag} ${channel}`)
              .addFields(
                  {name: 'Duration', value: duration},
              )
              .setColor(Styles.Colours.Red);
        } else if (newState.channel) {
          Users[newState.member.id] = Date.now();

          const channel = newState.channel.toString() || 'None';
          embed.setTitle(`${Styles.Emojis.Voice_Join}  Joined Voice Channel`)
              .setDescription(`${descriptionTag} ${channel}`)
              .setColor(Styles.Colours.Green);
        }

        this.logChannel.send({embeds: [embed]});
      }
    }
  }
}

module.exports = (client) => {
  return new VoiceStateUpdate(client, 'VoiceStateUpdate', false);
};
