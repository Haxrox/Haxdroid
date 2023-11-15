const Styles = require('../styles.json');
const Command = require('./Command.js');
const {EmbedBuilder} = require('discord.js');
const {blockQuote} = require('@discordjs/builders');

/**
 * Gets info about Guilds or GuildMembers
 */
class Info extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    const embed = new EmbedBuilder()
    //  .setAuthor({
    //   name: interaction.client.user.username,
    //   iconURL: interaction.client.user.avatarURL()
    // })
        .setTimestamp()
        .setFooter({
          text: `Requested by: ${interaction.user.username}`,
          iconURL: interaction.user.avatarURL(),
        });

    if (interaction.options.getSubcommand() === 'user') {
      const user = interaction.options.getUser('target') || interaction.user;

      embed.setColor(user.hexAccentColor || Styles.Colours.Theme)
          .setTitle(`${user.username} Info`)
          .setURL(user === interaction.user && 'https://haxtech.web.app/projects/Haxdroid')
          .setDescription(`**Profile:** ${user}`)
          .setThumbnail(user.avatarURL())
          .addFields(
              {
                name: 'Created',
                value: user.createdAt.toDateString(),
                inline: true,
              },
              {
                name: 'Tag',
                value: user.tag,
                inline: true,
              },
          );
    } else if (interaction.options.getSubcommand() === 'server') {
      const owner = await interaction.guild.fetchOwner({
        cache: true, force: true,
      }) || 'Undefined';
      const description = interaction.guild.description;
      if (description != null) {
        description = blockQuote(description);
        embed.setDescription(description);
      }

      embed.setTitle(`${interaction.guild.name} Info`)
          .setColor(Styles.Colours.Theme)
          .setThumbnail(interaction.guild.iconURL())
          .addFields(
              {
                name: 'Created',
                value: interaction.guild.createdAt.toDateString(),
                inline: true,
              },
              {
                name: 'Members',
                value: `${interaction.guild.memberCount} members`,
                inline: true,
              },
              {
                name: 'Owner',
                value: owner.toString(),
                inline: true},
          )
          .setImage(interaction.guild.bannerURL());
    }
    await interaction.reply({embeds: [embed]});
  }
}

const InfoCommand = new Info('Info', 'Gets information');
InfoCommand.getData()
    .addSubcommand((subcommand) =>
      subcommand.setName('user').setDescription('Info about a user')
          .addUserOption((option) =>
            option.setName('target').setDescription('The user'),
          ))
    .addSubcommand((subcommand) =>
      subcommand.setName('server').setDescription('Info about the server'));

module.exports = InfoCommand;
