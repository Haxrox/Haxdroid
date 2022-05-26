const Styles = require("../styles.json");
const Command = require('./Command.js');
const { MessageEmbed } = require('discord.js');
const { blockQuote } = require('@discordjs/builders');

class Info extends Command {
    async Execute(interaction) {
        const embed = new MessageEmbed()
            // .setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})
            .setTimestamp()
            .setFooter({ text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });

        if (interaction.options.getSubcommand() === 'user') {
            const user = interaction.options.getUser('target') || interaction.user;

            embed.setColor(user.hexAccentColor || Styles.Colours.Theme)
                .setTitle(`${user.username} Info`)
                .setURL(user === interaction.user && "https://haxtech.web.app/projects/Haxdroid")
                .setDescription(`**Profile:** ${user}`)
                .setThumbnail(user.avatarURL())
                .addField("Created", user.createdAt.toDateString(), true)
                .addField("Tag", user.tag, true);
        } else if (interaction.options.getSubcommand() === 'server') {
            const owner = await interaction.guild.fetchOwner({ cache: true, force: true }) || "Undefined";
            const description = interaction.guild.description;
            if (description != null) {
                description = blockQuote(description);
                embed.setDescription(description)
            }

            embed.setTitle(`${interaction.guild.name} Info`)
                .setColor(Styles.Colours.Theme)
                .setThumbnail(interaction.guild.iconURL())
                .addField("Created", interaction.guild.createdAt.toDateString(), true)
                .addField("Members", `${interaction.guild.memberCount} members`, true)
                .addField("Owner", owner.toString(), true)
                .setImage(interaction.guild.bannerURL)
        }
        await interaction.reply({ embeds: [embed] });
    }
}

const InfoCommand = new Info("Info", "Gets information");
InfoCommand.GetData()
    .addSubcommand(subcommand =>
        subcommand.setName('user').setDescription('Info about a user')
            .addUserOption(option => option.setName('target').setDescription('The user')))
    .addSubcommand(subcommand =>
        subcommand.setName('server').setDescription('Info about the server'));

module.exports = InfoCommand;
