const Command = require('./Command.js');
const {SlashCommandSubcommandBuilder} = require('discord.js');

/**
 * Core Subcommand class
 */
class Subcommand extends Command {
  #subcommandData;

  /**
   * Class for subcommands executed by the user
   * @param {String} name name of the subcommand
   * @param {String} description description of the subcommand
   */
  constructor(name, description) {
    super(name, description);
  }

  /**
   * Gets the SlashCommandSubcommandBuilder used to create this command
   * @return {SlashCommandSubcommandBuilder} subcommand data
   */
  getData() {
    if (!this.#subcommandData) {
      this.#subcommandData = new SlashCommandSubcommandBuilder()
          .setName(this.commandName.toLowerCase())
          .setDescription(this.description);
    }

    return this.#subcommandData;
  }

  /**
   * Executes Slash Command interaction
   * @param {BaseInteraction} interaction interaction created
   */
  async execute(interaction) {

  }
}

module.exports = Subcommand;
