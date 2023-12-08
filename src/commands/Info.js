const {EmbedBuilder} = require('discord.js');

const SlashCommand = require('../core/SlashCommand.js');

const NAME = 'Info';
const DESCRIPTION = 'Gets information';

/**
 * Info command
 */
class Info extends SlashCommand {
  /**
   * Constructor for command
   * @param {String} name name of command
   * @param {String} description description of command
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

module.exports = new Info(NAME, DESCRIPTION);
