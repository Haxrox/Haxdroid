const { MessageEmbed } = require('discord.js');
const ClientEvent = require("../events/ClientEvent.js");
const Time = require("../utils/Time.js");
const Config = require("../config.json");
const Styles = require("../styles.json");

const Users = {};

class VoiceStateUpdate extends ClientEvent {
    constructor(client, eventName, once) {
        super(client, eventName, once);

        (async () => {
            this.guild = await this.client.guilds.fetch(Config.GUILD_ID);
            this.logChannel = await this.guild.channels.fetch(Config.LOGS_CHANNEL_ID);
        })();
    }

    Execute(oldState, newState) {
        super.Execute(oldState, newState);

        if (oldState.channelId != newState.channelId) {
            const embed = new MessageEmbed()
                .setThumbnail(newState.member.user.avatarURL())
                .setTimestamp();

            if (oldState.channel && newState.channel) {
                const duration = Time.SecondsToDuration(Math.round((Date.now() - Users[newState.memberId]) / 1000));
                embed.setTitle(`${Styles.Emojis.Voice_Moved}  User Moved Voice Channel`)
                    .setDescription(`${newState.member} moved from ${oldState.channel} -> ${newState.channel}`)
                    .addField("Duration", duration)
                    .setColor(Styles.Colours.Yellow)
            } else if (!newState.channel) {
                const duration = Time.SecondsToDuration(Math.round((Date.now() - Users[newState.memberId])/1000));
                delete Users[newState.memberId];
                embed.setTitle(`${Styles.Emojis.Voice_Left}  User Left Voice Channel`)
                    .setDescription(`${newState.member} left ${oldState.channel}`)
                    .addField("Duration", duration)
                    .setColor(Styles.Colours.Red)
            } else if (newState.channel) {
                Users[newState.memberId] = Date.now();
                embed.setTitle(`${Styles.Emojis.Voice_Join}  User Joined Voice Channel`)
                    .setDescription(`${newState.member} joined ${newState.channel}`)
                    .setColor(Styles.Colours.Green)
            }

            if (this.logChannel) {
                this.logChannel.send({ embeds: [embed] });
            }
        }
    }
}

module.exports = (client) => {
    return new VoiceStateUpdate(client, "voiceStateUpdate", false);
}