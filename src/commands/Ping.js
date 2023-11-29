const {EmbedBuilder} = require('discord.js');

const SlashCommand = require('../core/SlashCommand.js');

const NAME = 'Ping';
const DESCRIPTION = 'Returns average ping of Haxdroid';

/**
 * Ping - Returns average ping of Haxdroid
 */
class Ping extends SlashCommand {
  /**
   * Create Ping SlashCommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);
  }

  /**
   * Executes command
   * @param {BaseInteraction} interaction interaction associated with command
   */
  async execute(interaction) {
    super.execute(interaction);

    await interaction.reply({embeds: [
      this.createEmbed(interaction, new EmbedBuilder()
          .setTitle(`${interaction.client.user.username}'s Ping`)
          .setDescription(`${bold(interaction.client.ws.ping)}ms`),
      ),
    ]});
  }
}

module.exports = new Ping(NAME, DESCRIPTION);
