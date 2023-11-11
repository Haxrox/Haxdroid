const { EmbedBuilder } = require('discord.js');
const { bold } = require('@discordjs/builders');
const ClientEvent = require("../events/ClientEvent.js");
const Time = require("../utils/Time.js");
const Config = require("../configs/config.json");
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

        if (this.logChannel) {
            if (oldState.channelId != newState.channelId) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: newState.member.user.username, iconURL: newState.member.user.avatarURL() })
                    .setTimestamp();

                if (oldState.channel && newState.channel) {
                    const duration = Time.SecondsToDuration(Math.round((Date.now() - Users[newState.member.id]) / 1000));
                    embed.setTitle(`${Styles.Emojis.Voice_Moved}  Moved Voice Channel`)
                        .setDescription(`${bold("Channel:")} ${oldState.channel} -> ${newState.channel}`)
                        .addFields(
                            { name: "Duration", value: duration }
                        )
                        .setColor(Styles.Colours.Yellow)
                } else if (!newState.channel) {
                    const duration = Time.SecondsToDuration(Math.round((Date.now() - Users[newState.member.id]) / 1000));
                    delete Users[newState.member.id];
                    embed.setTitle(`${Styles.Emojis.Voice_Left}  Left Voice Channel`, true)
                        .setDescription(`${bold("Channel:")} ${oldState.channel.toString() || "None"}`)
                        .addFields(
                            { name: "Duration", value: duration }
                        )
                        .setColor(Styles.Colours.Red)
                } else if (newState.channel) {
                    Users[newState.member.id] = Date.now();
                    embed.setTitle(`${Styles.Emojis.Voice_Join}  Joined Voice Channel`)
                        .setDescription(`${bold("Channel:")} ${newState.channel.toString() || "None"}`)
                        .setColor(Styles.Colours.Green)
                }

                this.logChannel.send({ embeds: [embed] });
            }
        }
    }
}

module.exports = (client) => {
    return new VoiceStateUpdate(client, "VoiceStateUpdate", false);
}