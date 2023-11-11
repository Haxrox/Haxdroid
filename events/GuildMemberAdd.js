const { EmbedBuilder } = require('discord.js');
const { bold } = require('@discordjs/builders');
const ClientEvent = require("./ClientEvent.js");
const Config = require("../configs/config.json");
const Styles = require("../styles.json");

class GuildMemberAdd extends ClientEvent {
    constructor(client, eventName, once) {
        super(client, eventName, once);

        (async () => {
            this.guild = await this.client.guilds.fetch(Config.GUILD_ID);
            this.logChannel = await this.guild.channels.fetch(Config.LOGS_CHANNEL_ID);
        })();
    }

    Execute(member) {
        super.Execute(member);

        if (this.logChannel) {
            const embed = new EmbedBuilder()
                .setTitle("Member Joined")
                .setDescription(`${bold("User:")} ${member}`)
                .setColor(Styles.Colours.Green)
                .addFields(
                    { name: "Created On", value: member.user.createdAt.toDateString(), inline: true },
                    { name: "Tag", value: member.user.tag, inline: true },
                    { name: "ID", value: member.user.id, inline: true }
                )
                .setThumbnail(member.user.avatarURL())
                .setTimestamp();

            this.logChannel.send({ embeds: [embed] });
        }
    }
}

module.exports = (client) => {
    return new GuildMemberAdd(client, "GuildMemberAdd", false);
}