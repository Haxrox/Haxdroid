const {EmbedBuilder, blockQuote} = require('discord.js');

const Subcommand = require('../../core/Subcommand.js');

const NAME = 'Server';
const DESCRIPTION = 'Info about the server';

/**
 * Server - Info about the server
 */
class Server extends Subcommand {
  /**
   * Create Server Subcommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);
  }

  /**
   * Executes Slash Command interaction
   * @param {BaseInteraction} interaction interaction created
   */
  async execute(interaction) {
    super.execute(interaction);

    const owner = await interaction.guild.fetchOwner({
      cache: true, force: true,
    }) || 'Undefined';
    const description = interaction.guild.description;

    if (description) {
      description = blockQuote(description);
    }

    interaction.reply({embeds: [
      this.createEmbed(interaction, new EmbedBuilder()
          .setTitle(`${interaction.guild.name} Info`)
          .setDescription(description)
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
          .setImage(interaction.guild.bannerURL()),
      ),
    ]});
  }
}

module.exports = new Server(NAME, DESCRIPTION);
