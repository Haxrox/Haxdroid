const { MessageEmbed } = require('discord.js');

const ClientEvent = require("./ClientEvent.js");
const Config = require("../config.json");
const Styles = require("../styles.json");

class MessageDelete extends ClientEvent {
    constructor(client, eventName, once) {
        super(client, eventName, once);

        (async () => {
            this.guild = await this.client.guilds.fetch(Config.GUILD_ID);
            this.logChannel = await this.guild.channels.fetch(Config.LOGS_CHANNEL_ID);
        })();
    }

    Execute(message) {
        super.Execute(message);

        if (this.logChannel && !newMessage.author.bot) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
                .setTitle("Message Deleted")
                .setDescription(message.content || "None")
                .setColor(Styles.Colours.Red)
                .addField("Created At", message.createdAt.toLocaleString(), true)
                .addField("Edited", message?.editedAt?.toLocaleString() || "None", true)
                .setFooter({ text: message.id })
                .setTimestamp()
            
            this.logChannel.send({ embeds: [embed] });
        }
    }
}

module.exports = (client) => {
    return new MessageDelete(client, "messageDelete", false);
}