const { MessageEmbed } = require('discord.js');
const { bold } = require('@discordjs/builders');
const ClientEvent = require("./ClientEvent.js");
const Config = require("../config.json");
const Styles = require("../styles.json");

class GuildMemberRemove extends ClientEvent {
    constructor(client, eventName, once) {
        super(client, eventName, once);

        (async () => {
            this.guild = await this.client.guilds.fetch(Config.GUILD_ID);
            this.logChannel = await this.guild.channels.fetch(Config.LOGS_CHANNEL_ID);
        })();
    }

    Execute(member) {
        super.Execute(member);

        const embed = new MessageEmbed()
            .setTitle("Member Left")
            .setDescription(`${bold("User:")} ${member}`)
            .setColor(Styles.Colours.Red)
            .addField("Created On", member.user.createdAt.toDateString(), true)
            .addField("Tag", member.user.tag, true)
            .addField("ID", member.user.id, true)
            .setThumbnail(member.user.avatarURL())
            .setTimestamp();

        if (this.logChannel) {
            this.logChannel.send({ embeds: [embed] });
        }
    }
}

module.exports = (client) => {
    return new GuildMemberRemove(client, "guildMemberRemove", false);
}