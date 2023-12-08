const {EmbedBuilder} = require('discord.js');

const SlashCommand = require('../core/SlashCommand.js');
const Styles = require('../../configs/styles.json');

const NAME = 'COMMAND_NAME';
const DESCRIPTION = 'COMMAND_DESCRIPTION';

/**
 * @class COMMAND_NAME
 * @description COMMAND_DESCRIPTION
 */
class COMMAND_NAME extends SlashCommand {
  /**
   * Create COMMAND_NAME SlashCommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);

    this.getData()
  }

  /**
   * Executes command
   * @param {BaseInteraction} interaction interaction associated with command
   */
  async execute(interaction) {
    super.execute(interaction);

    
  }
}

module.exports = new COMMAND_NAME(NAME, DESCRIPTION);
