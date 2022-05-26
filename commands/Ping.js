const Styles = require("../styles.json");
const Command = require('./Command.js');
const { MessageEmbed } = require('discord.js');

class Ping extends Command {
    async Execute(interaction) {
        const embed = new MessageEmbed()
            // .setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})
            .setTitle(`${interaction.client.user.username}'s Ping`)
            .setDescription(`${interaction.client.ws.ping}ms`)
            .setColor(Styles.Colours.Theme)
            .setTimestamp()
            .setFooter({ text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
        await interaction.reply({ embeds: [embed] });
    }
}

module.exports = new Ping("Ping", "Returns average ping of Haxdroid");