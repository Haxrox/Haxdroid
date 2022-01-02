const Command = require('./Command.js');
const {MessageEmbed} = require('discord.js');
const {blockQuote} = require('@discordjs/builders');

class Info extends Command {
    async Execute(interaction) {
        const embed = new MessageEmbed()
            // .setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})
            .setColor('#cacaca')
            .setTimestamp()
            .setFooter(`Requested by: ${interaction.user.username}`, interaction.user.avatarURL());
            // .setFooter({name: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
        if (interaction.options.getSubcommand() === 'user') {
            var user = interaction.options.getUser('target') || interaction.user;
            
            const color = user.haxAccentColor != null ? user.haxAccentColor : 'cacaca';
            embed.setColor(color)
            .setTitle(`${user.username} Info`)
            .setDescription(`**Profile:** ${user}`)
            .setThumbnail(user.avatarURL())
            .addField("Created", user.createdAt.toDateString(), true)
            .addField("Tag", user.tag, true);
		} else if (interaction.options.getSubcommand() === 'server') {
            var owner = await interaction.guild.fetchOwner({cache: true, force: true}) || "Undefined";
            const description = interaction.guild.description;
            if (description != null) {
                description = blockQuote(description);
                embed.setDescription(description)
            }
            embed.setTitle(`${interaction.guild.name} Info`)
            .setThumbnail(interaction.guild.iconURL())
            .addField("Created", interaction.guild.createdAt.toDateString(), true)
            .addField("Members", `${interaction.guild.memberCount} members`, true)
            .addField("Owner", owner.toString(), true)
            .setImage(interaction.guild.bannerURL)
		}
        await interaction.reply({embeds: [embed]});
    }
}

const InfoCommand = new Info("Info", "Gets information")
InfoCommand.GetData()
.addSubcommand(subcommand =>
    subcommand
        .setName('user')
        .setDescription('Info about a user')
        .addUserOption(option => option.setName('target').setDescription('The user')))
.addSubcommand(subcommand =>
    subcommand
        .setName('server')
        .setDescription('Info about the server'));

module.exports = InfoCommand;
