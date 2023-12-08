const {EmbedBuilder, User} = require('discord.js');

const SlashCommand = require('../core/SlashCommand.js');
const Styles = require('../configs/styles.json');

const NAME = 'Waitlist';
const DESCRIPTION = 'Alerts you when a class waitlist opens up.';

/**
 * @class Waitlist
 * @description Alerts you when a class waitlist opens up.
 */
class Waitlist extends SlashCommand {
  /**
   * Create Waitlist SlashCommand
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
    await interaction.deferReply();

    super.execute(interaction);
  }
}

module.exports = new Waitlist(NAME, DESCRIPTION);
