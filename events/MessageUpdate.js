const { EmbedBuilder } = require('discord.js');

const ClientEvent = require("./ClientEvent.js");
const Config = require("../config.json");
const Styles = require("../styles.json");

class MessageUpdate extends ClientEvent {
    constructor(client, eventName, once) {
        super(client, eventName, once);

        (async () => {
            this.guild = await this.client.guilds.fetch(Config.GUILD_ID);
            this.logChannel = await this.guild.channels.fetch(Config.LOGS_CHANNEL_ID);
        })();
    }

    Execute(oldMessage, newMessage) {
        super.Execute(oldMessage, newMessage);

        if (this.logChannel && !newMessage.author.bot && oldMessage.content != newMessage.content) {
            const headerEmbed = new EmbedBuilder()
                .setAuthor({ name: newMessage.author.username, iconURL: newMessage.author.avatarURL() })
                .setTitle("Message Updated")
                .setURL(newMessage.url)
                .setColor(Styles.Colours.Yellow)
                .addFields(
                    { name: "Created At", value: newMessage.createdAt.toLocaleString(), inline: true },
                    { name: "Edited At", value: newMessage?.editedAt?.toLocaleString() || "None", inline: true }
                )
                .setFooter({ text: newMessage.id })

            const oldEmbed = new EmbedBuilder()
                .setTitle("Old Message")
                .setDescription(oldMessage.content)
                .setColor(Styles.Colours.Red)

            const newEmbed = new EmbedBuilder()
                .setTitle("New Message")
                .setDescription(newMessage.content)
                .setColor(Styles.Colours.Green)
                .setTimestamp()

            this.logChannel.send({ embeds: [headerEmbed, oldEmbed, newEmbed] });
        }
    }
}

module.exports = (client) => {
    return new MessageUpdate(client, "MessageUpdate", false);
}