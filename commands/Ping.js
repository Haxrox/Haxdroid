const {EmbedBuilder, bold} = require('discord.js');

const Command = require('./Command.js');

/**
 * Gets Ping of Bot
 */
class Ping extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    await interaction.reply({embeds: [
      this.createEmbed(interaction, new EmbedBuilder()
          .setTitle(`${interaction.client.user.username}'s Ping`)
          .setDescription(`${bold(interaction.client.ws.ping)}ms`),
      ),
    ]});
  }
}

module.exports = new Ping('Ping', 'Returns average ping of Haxdroid');
