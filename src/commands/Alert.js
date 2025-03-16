const {EmbedBuilder, blockQuote} = require('discord.js');

const SlashCommand = require('../core/SlashCommand.js');

const NAME = 'Alert';
const DESCRIPTION = 'Repeatedly sends messages to a user';

/**
 * @class Alert
 * @description Repeatedly sends messages to a user
 */
class Alert extends SlashCommand {
  /**
   * Create Alert SlashCommand
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
    return super.execute(interaction);
  }
}

module.exports = new Alert(NAME, DESCRIPTION);
