const {EmbedBuilder, blockQuote} = require('discord.js');

const Command = require('./Command.js');
const Styles = require('../styles.json');

/**
 * Gets info about Guilds or GuildMembers
 */
class Info extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    const embedBuilder = new EmbedBuilder();
    if (interaction.options.getSubcommand() === 'user') {
      const user = interaction.options.getUser('target') || interaction.user;

      embedBuilder.setColor(user.hexAccentColor || Styles.Colours.Theme)
          .setTitle(`${user.username} Info`)
          .setURL(user === interaction.client.user ? 'https://haxtech.web.app/projects/Haxdroid' : null)
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
        embedBuilder.setDescription(description);
      }

      embedBuilder.setTitle(`${interaction.guild.name} Info`)
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

    await interaction.reply({embeds: [
      this.createEmbed(interaction, embedBuilder),
    ]});
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
