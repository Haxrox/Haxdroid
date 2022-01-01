const Command = require('./Command.js');
const {MessageEmbed} = require('discord.js');

class Ping extends Command {
    async Execute(interaction) {
        const embed = new MessageEmbed()
            .setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})
            .setTitle(`${interaction.client.user.username} Ping`)
            .setDescription(`${interaction.client.ws.ping}ms`)
            .setColor('#cacaca')
            .setTimestamp()
            .setFooter(`Requested by: ${interaction.user.username}`, interaction.user.avatarURL());
            // .setFooter({name: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
        await interaction.reply({embeds: [embed]});
    }
}

module.exports = new Ping("ping", "Returns average ping of Haxdroid");