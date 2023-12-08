const {SlashCommandBuilder} = require('discord.js');

const Command = require('./Command');
const CommandsService = require('../services/CommandsService');

/**
 * Core SlashCommand class
 */
class SlashCommand extends Command {
  #slashData = null;
  #subcommands;

  /**
   * Create a new SlashCommand
   * @param {String} name name of the Slash Command
   * @param {String} description description of the Slash Command
   */
  constructor(name, description) {
    super(name, description);
    this.#subcommands = CommandsService.create(this.commandName);
  }

  /**
   * Gets the SlashCommandBuilder used to create this command
   * @return {SlashCommandBuiler} SlashCommandBuilder for this command
   */
  getData() {
    if (!this.#slashData) {
      this.#slashData = new SlashCommandBuilder()
          .setName(this.commandName.toLowerCase())
          .setDescription(this.description);

      this.#subcommands?.commands?.forEach((subcommand) => {
        this.#slashData.addSubcommand(subcommand.getData());
      });
    }

    return this.#slashData;
  }

  /**
   * Executes Slash Command interaction
   * @param {BaseInteraction} interaction interaction created
   * @return {Boolean} whether the command was handled
   */
  execute(interaction) {
    super.execute(interaction);

    if (this.#subcommands?.commands?.size > 0) {
      const subcommandKey = interaction.options.getSubcommand();

      if (subcommandKey) {
        const subcommand = this.#subcommands?.get(subcommandKey);
        return subcommand.execute(interaction);
      }
    }
  }

  /**
   * Executes the given button interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  executeButton(interaction) {
    console.debug(`${this.commandName} button executed`);
  }

  /**
   * Executes the given context menu interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  executeContextMenu(interaction) {
    console.debug(`${this.commandName} context menu executed`);
  }

  /**
   * Executes the given select menu interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  executeSelectMenu(interaction) {
    console.debug(`${this.commandName} select menu executed`);
  }

  /**
   * Executes the given user context menu interaction
   * @param {CommandInteraction} interaction interaction executed
   */
  executeUserContextMenu(interaction) {
    console.debug(`${this.commandName} user context menu executed`);
  }
}

module.exports = SlashCommand;
