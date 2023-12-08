const {EmbedBuilder} = require('discord.js');

const Subcommand = require('../../core/Subcommand.js');
const Styles = require('../../configs/styles.json');

const NAME = 'COMMAND_NAME';
const DESCRIPTION = 'COMMAND_DESCRIPTION';

/**
 * @class COMMAND_NAME
 * @description COMMAND_DESCRIPTION
 */
class COMMAND_NAME extends Subcommand {
  /**
   * Create COMMAND_NAME Subcommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);

    this.getData()
  }

  /**
   * Executes Slash Command interaction
   * @param {BaseInteraction} interaction interaction created
   */
  async execute(interaction) {
    super.execute(interaction);

    
  }
}

module.exports = new COMMAND_NAME(NAME, DESCRIPTION);
