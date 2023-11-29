const {EmbedBuilder, bold} = require('discord.js');

const SlashCommand = require('../core/SlashCommand.js');
const CommandsService = require('../services/CommandsService.js');

const NAME = 'Commands';
const DESCRIPTION = 'Gets a list of commands';

/**
 * Commands - gets a list of commands
 */
class Commands extends SlashCommand {
  /**
   * Create Commands command
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

    if (!this.embedBuilder) {
      const commandsService = CommandsService.create();
      const description = commandsService.commands
          .map(
              (command) => bold(`${command.commandName} - `)
                  .concat(command.description),
          )
          .reduce(
              (prevDescription, description) =>
                prevDescription.concat('\n')
                    .concat(description),
          );

      this.embedBuilder = new EmbedBuilder()
          .setTitle(`List of commands [${commandsService.commands.size}]`)
          .setDescription(description);
    }

    interaction.reply({embeds: [
      this.createEmbed(interaction, this.embedBuilder),
    ]});
  }
}

module.exports = new Commands(NAME, DESCRIPTION);
